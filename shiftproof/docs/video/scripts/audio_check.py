#!/usr/bin/env python3
"""Check the voiceover: exact wording, timing against the shots, and levels.

Usage (from the repo root):
  python3 -I shiftproof/docs/video/scripts/audio_check.py <audio.wav-or-mp4> [model] [--srt out.srt]

1. Levels (deterministic, ffmpeg ebur128): integrated loudness, true peak, LRA.
   Targets: -16 LUFS integrated (+/- 1.5), true peak at or below -1.0 dBTP.
2. Wording and timing (Gemini Argon by default, or gemini-4-hydrogen):
   the model transcribes the audio verbatim with start and end times per
   beat. The script then diffs the transcript against vo-script.txt and
   checks each beat starts within 0.5 s of its cue (Argon's timestamps drift by about that much) and ends before the next.
   The model only listens and reports. It doesn't write or suggest copy.
3. With --srt, writes burned-in captions: the words come from captions.txt
   (written by Claude); only the timings come from the audio.

Needs GEMINI_API_KEY (never printed) and ffmpeg.
"""
import base64, difflib, json, os, re, subprocess, sys, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
SCRIPT = os.path.join(HERE, "..", "vo-script.txt")
ARGS = [a for a in sys.argv[1:] if not a.startswith("--")]
SRT = next((sys.argv[i + 1] for i, a in enumerate(sys.argv) if a == "--srt" and i + 1 < len(sys.argv)), None)
if SRT in ARGS:
    ARGS.remove(SRT)
AUDIO = ARGS[0]
MODEL = ARGS[1] if len(ARGS) > 1 else "gemini-4-argon"
CAPTIONS = os.path.join(HERE, "..", "captions.txt")


def beats():
    out, cur = [], None
    for raw in open(SCRIPT, encoding="utf-8"):
        line = raw.strip()
        m = re.match(r"^\[(\w+)\s+@\s*(\d+):(\d+(?:\.\d+)?)\]$", line)
        if m:
            cur = {"beat": m.group(1), "cue": int(m.group(2)) * 60 + float(m.group(3)), "text": ""}
            out.append(cur)
        elif line and not line.startswith("#") and cur:
            cur["text"] = (cur["text"] + " " + line).strip()
    return out


def levels():
    r = subprocess.run(
        ["ffmpeg", "-hide_banner", "-nostats", "-i", AUDIO, "-af", "ebur128=peak=true", "-f", "null", "-"],
        capture_output=True, text=True,
    )
    tail = r.stderr[r.stderr.rfind("Summary:"):]
    get = lambda pat: float(re.search(pat, tail, re.S).group(1))
    i = get(r"I:\s+(-?[\d.]+) LUFS")
    lra = get(r"LRA:\s+(-?[\d.]+) LU")
    tp = get(r"Peak:\s+(-?[\d.]+) dBFS")
    ok = -17.5 <= i <= -14.5 and tp <= -1.0
    print(f"Levels: {i:.1f} LUFS integrated, true peak {tp:.1f} dBTP, LRA {lra:.1f} LU -> {'OK' if ok else 'ADJUST'}")
    if not ok:
        print("  Fix: ffmpeg -i in.wav -af loudnorm=I=-16:TP=-1.5:LRA=7 out.wav")


def transcribe(script_beats):
    key = os.environ.get("GEMINI_API_KEY") or sys.exit("GEMINI_API_KEY is not set.")
    wav = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", AUDIO, "-vn", "-ac", "1", "-ar", "16000", "-f", "wav", "-"],
                         capture_output=True, check=True).stdout
    names = ", ".join(b["beat"] for b in script_beats)
    prompt = (
        "Transcribe this voiceover verbatim, exactly as spoken, including any repeated or misread words. "
        f"It has {len(script_beats)} spoken segments separated by silence, named in order: {names}. "
        'Return only JSON: [{"beat": name, "start": seconds, "end": seconds, "text": verbatim}]. '
        "Times are from the start of the file, to 0.1 s. Do not correct, summarise or suggest wording."
    )
    body = {"contents": [{"parts": [{"inlineData": {"mimeType": "audio/wav", "data": base64.b64encode(wav).decode()}},
                                    {"text": prompt}]}],
            "generationConfig": {"responseMimeType": "application/json"}}
    req = urllib.request.Request(
        f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent",
        data=json.dumps(body).encode(), headers={"Content-Type": "application/json", "x-goog-api-key": key})
    with urllib.request.urlopen(req, timeout=300) as r:
        data = json.load(r)
    return json.loads(data["candidates"][0]["content"]["parts"][0]["text"])


# Spoken forms in vo-script.txt that a transcriber may write as digits or letters.
SAME = {"114": "one fourteen", "wi": "w i", "0.002": "two thousandths",
        "2 000ths": "two thousandths", "2,000ths": "two thousandths", "2/1000ths": "two thousandths"}


def norm(s):
    s = s.lower().replace("-", " ")
    for k, v in SAME.items():
        s = re.sub(rf"(?<![\w.]){re.escape(k)}(?![\w])", v, s)
    return re.sub(r"[^a-z0-9' ]+", " ", s).split()


def stamp(t):
    ms = int(round(t * 1000))
    return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"


def write_srt(got):
    caps, cur = {}, None
    for raw in open(CAPTIONS, encoding="utf-8"):
        line = raw.strip()
        m = re.match(r"^\[(\w+)\]$", line)
        if m:
            cur = caps.setdefault(m.group(1), [])
        elif line and not line.startswith("#") and cur is not None:
            cur.append(line)
    out, n = [], 0
    for beat, lines in caps.items():
        g = got.get(beat)
        if not g:
            continue
        total = sum(len(l) for l in lines)
        t = g["start"]
        for l in lines:
            end = t + (g["end"] - g["start"]) * len(l) / total
            n += 1
            out.append(f"{n}\n{stamp(t)} --> {stamp(end)}\n{l}\n")
            t = end
    open(SRT, "w", encoding="utf-8").write("\n".join(out))
    print(f"Wrote {SRT} ({n} captions)")


def main():
    levels()
    want = beats()
    got = {g["beat"]: g for g in transcribe(want)}
    problems = 0
    for n, b in enumerate(want):
        g = got.get(b["beat"])
        if not g:
            print(f"{b['beat']}: not found in the audio"); problems += 1; continue
        nxt = want[n + 1]["cue"] if n + 1 < len(want) else 60.0
        late = g["start"] - b["cue"]
        flags = []
        if abs(late) > 0.5: flags.append(f"starts {late:+.1f} s off cue")
        if g["end"] > nxt: flags.append(f"runs {g['end'] - nxt:.1f} s into the next shot")
        diff = [d for d in difflib.ndiff(norm(b["text"]), norm(g["text"])) if d[0] in "+-"]
        if diff: flags.append("wording differs: " + " ".join(diff))
        problems += bool(flags)
        print(f"{b['beat']}: {g['start']:5.1f}-{g['end']:5.1f} s (cue {b['cue']:.1f}) " + ("; ".join(flags) or "OK"))
    if SRT:
        write_srt(got)
    print(f"Model: {MODEL}. {'All beats OK.' if not problems else f'{problems} beat(s) need a fix.'}")
    sys.exit(1 if problems else 0)


if __name__ == "__main__":
    main()
