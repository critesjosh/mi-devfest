import { useId } from "react";
import "./robot-arm.css";

/* Six-axis arm for the hero. All coordinates are SVG user units in a 380x250 viewBox.
   Joint pivots (shoulder 118,150 / elbow 206,84 / wrist 290,100) are mirrored in robot-arm.css. */

const ring = (cx: number, cy: number, r: number, n: number, offset = 0) =>
  Array.from({ length: n }, (_, i) => {
    const a = offset + (i / n) * Math.PI * 2;
    return { x: +(cx + Math.cos(a) * r).toFixed(2), y: +(cy + Math.sin(a) * r).toFixed(2) };
  });

function Bolts({ pts, r = 1.3 }: { pts: { x: number; y: number }[]; r?: number }) {
  return (
    <>
      {pts.map((p, i) => (
        <circle key={i} className="ra-bolt" cx={p.x} cy={p.y} r={r} />
      ))}
    </>
  );
}

const column = (x: number, ys: number[]) => ys.map((y) => ({ x, y }));

export function RobotArm({ working = false, className }: { working?: boolean; className?: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const g = (name: string) => `ra-${name}-${uid}`;
  const url = (name: string) => `url(#${g(name)})`;

  return (
    <div className={["ra", working ? "ra--working" : "", className].filter(Boolean).join(" ")} aria-hidden="true">
      <svg viewBox="0 0 380 250" fill="none" focusable="false">
        <defs>
          {/* Across a link: lit top edge, soft body, shaded underside. */}
          <linearGradient id={g("link")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" className="ra-stop--lit" />
            <stop offset="0.28" className="ra-stop--body" />
            <stop offset="0.72" className="ra-stop--mid" />
            <stop offset="1" className="ra-stop--shade" />
          </linearGradient>
          <linearGradient id={g("base")} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" className="ra-stop--body" />
            <stop offset="0.6" className="ra-stop--mid" />
            <stop offset="1" className="ra-stop--shade" />
          </linearGradient>
          <radialGradient id={g("joint")} cx="0.36" cy="0.3" r="0.8">
            <stop offset="0" className="ra-stop--lit" />
            <stop offset="0.55" className="ra-stop--mid" />
            <stop offset="1" className="ra-stop--shade" />
          </radialGradient>
          <radialGradient id={g("hub")} cx="0.35" cy="0.3" r="0.9">
            <stop offset="0" className="ra-stop--hub-lit" />
            <stop offset="1" className="ra-stop--hub" />
          </radialGradient>
          <radialGradient id={g("floor")} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" className="ra-stop--floor" />
            <stop offset="1" className="ra-stop--clear" />
          </radialGradient>
        </defs>

        {/* Floor shadows */}
        <ellipse className="ra-floor" cx="150" cy="237" rx="118" ry="9" fill={url("floor")} />

        {/* Workpiece on a stand */}
        <g className="ra-part">
          <rect className="ra-dark" x="335" y="196" width="7" height="40" rx="2" />
          <rect className="ra-dark" x="312" y="191" width="54" height="6" rx="3" />
          <rect className="ra-part__block" x="325" y="177" width="28" height="14" rx="3" />
          <line className="ra-spec" x1="329" y1="180.5" x2="346" y2="180.5" />
        </g>

        {/* Base: plinth, turret, column */}
        <path className="ra-edge" fill={url("base")} d="M66 236 L78 212 Q80 208 86 208 L152 208 Q158 208 160 212 L172 236 Z" />
        <rect className="ra-dark" x="84" y="202" width="70" height="8" rx="4" />
        <path className="ra-edge" fill={url("base")} d="M92 202 L97 150 L141 150 L148 202 Z" />
        <line className="ra-seam" x1="95" y1="184" x2="146" y2="184" />
        <Bolts pts={[{ x: 78, y: 228 }, { x: 160, y: 228 }, { x: 104, y: 193 }, { x: 136, y: 193 }]} r={1.6} />

        {/* Shoulder (J2) */}
        <g className="ra-j ra-j--shoulder">
          <g transform="translate(118 150) rotate(-36.87)">
            <path className="ra-edge" fill={url("link")} d="M0 -27 L110 -20 A20 20 0 0 1 110 20 L0 27 A27 27 0 0 1 0 -27 Z" />
            <line className="ra-spec" x1="30" y1="-18.5" x2="98" y2="-14.5" />
            <line className="ra-seam" x1="42" y1="-23" x2="42" y2="23" />
            <line className="ra-seam" x1="82" y1="-21" x2="82" y2="21" />
            <Bolts pts={column(48, [-15, -7.5, 0, 7.5, 15])} />
            <Bolts pts={column(76, [-13, -6.5, 0, 6.5, 13])} />
          </g>

          {/* Elbow (J3) */}
          <g className="ra-j ra-j--elbow">
            <g transform="translate(206 84) rotate(10.8)">
              <path className="ra-edge" fill={url("link")} d="M0 -17 L84 -12 L84 12 L0 17 Z" />
              <line className="ra-spec" x1="22" y1="-11" x2="56" y2="-9" />
              <line className="ra-seam" x1="34" y1="-15" x2="34" y2="15" />
              <Bolts pts={column(40, [-9, -3, 3, 9])} r={1.1} />
              {/* dark cuff before the wrist */}
              <rect className="ra-dark" x="60" y="-14.5" width="18" height="29" rx="4" />
              <line className="ra-cuff-line" x1="66" y1="-11" x2="66" y2="11" />
              <line className="ra-cuff-line" x1="72" y1="-11" x2="72" y2="11" />
            </g>

            {/* Cable run from the elbow housing to the cuff */}
            <path className="ra-cable" d="M197 68 C196 30 258 28 271 82" />
            <path className="ra-cable ra-cable--thin" d="M203 66 C206 42 250 40 263 80" />
            <rect className="ra-dark" x="259" y="78" width="16" height="7" rx="2" transform="rotate(10.8 267 81)" />

            {/* Wrist (J5) + gripper */}
            <g className="ra-j ra-j--wrist">
              <g transform="translate(290 100) rotate(32)">
                <line className="ra-beam" x1="60" y1="0" x2="104" y2="0" />
                <rect className="ra-edge" fill={url("link")} x="2" y="-9" width="14" height="18" rx="3" />
                <rect className="ra-dark" x="12" y="-13" width="22" height="26" rx="5" />
                <rect className="ra-ember-fill" x="17" y="-4" width="6" height="8" rx="2" />
                <g className="ra-finger ra-finger--a">
                  <path className="ra-dark" d="M26 -12 L44 -19 L62 -9 L60 -4.5 L45 -11.5 L31 -4 Z" />
                  <circle className="ra-bolt" cx="30" cy="-8.5" r="1.6" />
                </g>
                <g className="ra-finger ra-finger--b">
                  <path className="ra-dark" d="M26 12 L44 19 L62 9 L60 4.5 L45 11.5 L31 4 Z" />
                  <circle className="ra-bolt" cx="30" cy="8.5" r="1.6" />
                </g>
              </g>
              <circle className="ra-edge" cx="290" cy="100" r="13" fill={url("joint")} />
              <circle className="ra-ember-ring ra-ember-ring--thin" cx="290" cy="100" r="8.5" />
              <circle cx="290" cy="100" r="5" fill={url("hub")} />

              {/* Wrist pin: the leader stays upright while the arm moves */}
              <g className="ra-j ra-j--shoulder ra-counter ra-at-wrist">
                <g className="ra-j ra-j--elbow ra-at-wrist">
                  <g className="ra-j ra-j--wrist ra-at-wrist">
                    <polyline className="ra-lead" points="290,100 290,44 344,44" />
                    <circle className="ra-pin ra-pin--end" cx="344" cy="44" r="2" />
                  </g>
                </g>
              </g>
              <circle className="ra-halo ra-halo--warm" cx="290" cy="100" r="7" />
              <circle className="ra-pin ra-pin--warm" cx="290" cy="100" r="3.2" />
            </g>

            <circle className="ra-edge" cx="206" cy="84" r="23" fill={url("joint")} />
            <circle className="ra-seam" cx="206" cy="84" r="17" />
            <Bolts pts={ring(206, 84, 20, 8, 0.4)} r={1.1} />
            <circle cx="206" cy="84" r="11" fill={url("hub")} />

            {/* Elbow pin */}
            <g className="ra-j ra-j--shoulder ra-counter ra-at-elbow">
              <g className="ra-j ra-j--elbow ra-at-elbow">
                <polyline className="ra-lead" points="206,84 206,26 150,26" />
                <circle className="ra-pin ra-pin--end" cx="150" cy="26" r="2" />
              </g>
            </g>
            <circle className="ra-halo" cx="206" cy="84" r="7" />
            <circle className="ra-pin" cx="206" cy="84" r="3.2" />
          </g>

          {/* Shoulder housing rides with the upper arm */}
          <circle className="ra-edge" cx="118" cy="150" r="32" fill={url("joint")} />
          <Bolts pts={ring(118, 150, 28.5, 12, 0.2)} />
          <circle className="ra-ember-ring" cx="118" cy="150" r="22.5" />
          <circle cx="118" cy="150" r="19" fill={url("hub")} />
          <path className="ra-hub-mark" d="M111 143 A10 10 0 0 1 125 143 M125 157 A10 10 0 0 1 111 157" />
          <circle className="ra-hub-dot" cx="118" cy="150" r="2.4" />
          <path className="ra-spec" d="M96 136 A26 26 0 0 1 113 124.5" />
        </g>
      </svg>
    </div>
  );
}

export default RobotArm;
