/**
 * ShiftProof brand: the signed-off inspection tag.
 * A shop tag (chamfered top, punched hole) carrying a first-article check.
 * Colours come from tokens via brand.css; see design/brand/README.md.
 */

const TAG = "M11 2H21L27 8V27A3 3 0 0 1 24 30H8A3 3 0 0 1 5 27V8ZM16 6.65a2.1 2.1 0 1 0 0 4.2a2.1 2.1 0 1 0 0-4.2Z";
const CHECK = "M10 20.5L14.25 24.75L22 15.5";

type Tone = "on-granite" | "on-paper";

export function BrandMark({ size = 32, title, tone }: { size?: number; title?: string; tone?: Tone }) {
  const a11y = title ? { role: "img" as const, "aria-label": title } : { "aria-hidden": true as const };
  return (
    <svg
      className={tone ? `sp-brand-mark sp-brand-mark--${tone}` : "sp-brand-mark"}
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="none"
      focusable="false"
      {...a11y}
    >
      {title ? <title>{title}</title> : null}
      <path className="sp-brand-mark__tag" fillRule="evenodd" clipRule="evenodd" d={TAG} />
      {/* The eyelet ring only earns its pixels at larger sizes. */}
      {size >= 28 ? <circle className="sp-brand-mark__eyelet" cx="16" cy="8.75" r="3.4" /> : null}
      <path className="sp-brand-mark__check" d={CHECK} />
    </svg>
  );
}

export function BrandLockup({ tone = "on-granite" }: { tone?: Tone }) {
  return (
    <span className={`sp-brand sp-brand--${tone}`}>
      <BrandMark size={32} tone={tone} />
      <span className="sp-brand__word">
        Shift<span className="sp-brand__proof">Proof</span>
      </span>
    </span>
  );
}
