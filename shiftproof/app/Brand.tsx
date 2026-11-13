/**
 * ShiftProof brand: the milled pass.
 * One end-mill pass enters a plate from the edge, cuts an S and stops in a round slot end:
 * the veteran's path left in the part for the next shift to follow.
 * Colours come from tokens via brand.css; see design/brand/README.md.
 */

const PLATE = "M4 4H60V12H16A4 4 0 0 0 12 16V32A4 4 0 0 0 16 36H44V44H16A4 4 0 0 0 16 52H48A4 4 0 0 0 52 48V32A4 4 0 0 0 48 28H20V20H60V60H4Z";

type Tone = "on-granite" | "on-paper";

export function BrandMark({ size = 32, title, tone }: { size?: number; title?: string; tone?: Tone }) {
  const a11y = title ? { role: "img" as const, "aria-label": title } : { "aria-hidden": true as const };
  return (
    <svg
      className={tone ? `sp-brand-mark sp-brand-mark--${tone}` : "sp-brand-mark"}
      viewBox="0 0 64 64"
      width={size}
      height={size}
      focusable="false"
      {...a11y}
    >
      {title ? <title>{title}</title> : null}
      <path className="sp-brand-mark__plate" d={PLATE} />
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
