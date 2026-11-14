#!/usr/bin/env python3
"""Voiceover audio with Gemini TTS. Reads the script exactly as written.

Usage (from the repo root):
  python3 -I shiftproof/docs/video/scripts/tts.py [voice] [out.wav] [--only beat1,beat2]

- --only re-renders just those beats and reuses the other beat WAVs from the
  last run, then rejoins. TTS pacing varies take to take, so redo a slow beat
  rather than the whole script.

- Needs GEMINI_API_KEY in the environment. The key is never printed.
- Sends only the spoken lines from shiftproof/docs/video/vo-script.txt
  (lines starting with '#' are comments and are not sent). No style
  preamble, no rewording: Gemini is a voice here, not a writer.
- One request per beat, so a bad take can be redone on its own, and the
  timing check can line beats up with shots. Writes beat WAVs plus one
  joined WAV with the gaps from vo-script.txt.
- Model: gemini-3.8-flash-tts (override with GEMINI_TTS_MODEL).
- Offline fallback only: VO_SCRIPT=shiftproof/docs/video/vo-script-offline.txt
"""
import base64, json, os, re, sys, urllib.error, urllib.request, wave

HERE = os.path.dirname(os.path.abspath(__file__))
SCRIPT = os.environ.get("VO_SCRIPT") or os.path.join(HERE, "..", "vo-script.txt")
MODEL = os.environ.get("GEMINI_TTS_MODEL", "gemini-3.8-flash-tts")
ARGS = [a for a in sys.argv[1:] if not a.startswith("--")]
ONLY = next((sys.argv[i + 1].split(",") for i, a in enumerate(sys.argv) if a == "--only" and i + 1 < len(sys.argv)), None)
if ONLY:
    ARGS = [a for a in ARGS if a != ",".join(ONLY)]
VOICE = ARGS[0] if ARGS else "Charon"
OUT = ARGS[1] if len(ARGS) > 1 else os.path.expanduser("~/ShiftProof-video/audio/vo.wav")
RATE = 24000  # Gemini TTS returns 16-bit mono PCM at 24 kHz


def beats():
    """Yield (beat_id, start_seconds, text) from vo-script.txt."""
    cur, start, lines = None, 0.0, []
    for raw in open(SCRIPT, encoding="utf-8"):
        line = raw.rstrip("\n")
        m = re.match(r"^\[(\w+)\s+@\s*(\d+):(\d+(?:\.\d+)?)\]$", line.strip())
        if m:
            if cur and lines:
                yield cur, start, " ".join(lines)
            cur, start, lines = m.group(1), int(m.group(2)) * 60 + float(m.group(3)), []
        elif line.strip() and not line.lstrip().startswith("#"):
            lines.append(line.strip())
    if cur and lines:
        yield cur, start, " ".join(lines)


def speak(text):
    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        sys.exit("GEMINI_API_KEY is not set.")
    body = {
        "contents": [{"parts": [{"text": text}]}],
        "generationConfig": {
            "responseModalities": ["AUDIO"],
            "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": VOICE}}},
        },
    }
    req = urllib.request.Request(
        f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent",
        data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json", "x-goog-api-key": key},
    )
    import time
    for attempt in range(5):
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                data = json.load(r)
            break
        except urllib.error.HTTPError as e:
            if e.code not in (429, 500, 503) or attempt == 4:
                raise
            wait = int(e.headers.get("Retry-After") or 0) or 15 * (attempt + 1)
            print(f"  HTTP {e.code}, retrying in {wait} s")
            time.sleep(wait)
    part = data["candidates"][0]["content"]["parts"][0]
    blob = base64.b64decode(part["inlineData"]["data"])
    # Gemini TTS can return a whole WAV file: a 44-byte header, the audio, then a C2PA
    # provenance chunk (~7.6 KB). Played as PCM, the header clicks at the start of each
    # line and the C2PA bytes scratch at the end. Keep only the data chunk.
    if blob[:4] == b"RIFF":
        import io
        with wave.open(io.BytesIO(blob)) as w:
            if (w.getframerate(), w.getsampwidth(), w.getnchannels()) != (RATE, 2, 1):
                sys.exit(f"Unexpected TTS audio format: {w.getparams()}")
            return w.readframes(w.getnframes())
    return blob


def trim(pcm, floor=300):
    """Drop leading and trailing near-silence (16-bit samples below `floor`), keeping 80 ms."""
    import array
    a = array.array("h", pcm)
    loud = [i for i, v in enumerate(a) if abs(v) > floor]
    if not loud:
        return pcm
    pad = int(0.08 * RATE)
    return a[max(loud[0] - pad, 0):min(loud[-1] + pad, len(a))].tobytes()


def write_wav(path, pcm):
    with wave.open(path, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(RATE); w.writeframes(pcm)


def main():
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    joined = bytearray()
    for beat, start, text in beats():
        beat_file = OUT.replace(".wav", f"-{beat}.wav")
        if ONLY and beat not in ONLY and os.path.exists(beat_file):
            with wave.open(beat_file, "rb") as w:
                pcm = w.readframes(w.getnframes())
        else:
            pcm = trim(speak(text))
            write_wav(beat_file, pcm)
        pad = int(start * RATE) * 2 - len(joined)
        if pad < 0:
            print(f"{beat}: previous beat runs {-pad / 2 / RATE:.2f} s past its cue. Tighten a line or move a cue.")
            pad = int(0.15 * RATE) * 2  # keep a short breath and start late
        joined += b"\x00" * pad
        at = len(joined) / 2 / RATE
        joined += pcm
        print(f"{beat}: cue {start:5.2f} s, starts {at:5.2f} s, ends {len(joined) / 2 / RATE:5.2f} s")
    write_wav(OUT, bytes(joined))
    print(f"Wrote {OUT} ({len(joined) / 2 / RATE:.2f} s), voice {VOICE}, model {MODEL}")


if __name__ == "__main__":
    main()
