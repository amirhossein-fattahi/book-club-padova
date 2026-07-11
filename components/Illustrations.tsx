/**
 * Hand-built SVG illustrations for the site.
 *
 * They use the brand's warm palette and are pure presentational components
 * (no client JS), so they can be dropped into any server component. Self-
 * contained inline SVG — no external image requests, no broken links.
 */

const C = {
  ink: '#2b2320',
  cream: '#fffdf9',
  parchment: '#f7f3ec',
  clay100: '#f2e8dd',
  clay200: '#e4d0bb',
  clay300: '#d3b191',
  clay400: '#c08f66',
  clay500: '#a9714a',
  clay600: '#8f5a39',
  forest: '#3f6b57',
  forestDark: '#284636',
  terracotta: '#c26b4a',
  gold: '#d99a2b',
  rose: '#b47b86',
  sage: '#8aa98f'
};

type Props = { className?: string };

/* ---------- Homepage hero: a cosy reading table ---------- */
export function HeroReadingScene({ className = '' }: Props) {
  return (
    <svg viewBox="0 0 460 440" className={className} role="img"
      aria-label="An open book and a steaming coffee on a café table">
      <circle cx="230" cy="215" r="205" fill={C.clay100} />
      <circle cx="360" cy="95" r="46" fill={C.clay200} />
      <circle cx="86" cy="120" r="20" fill={C.clay200} />

      {/* little plant, back-left */}
      <g>
        <path d="M120 250c-6-26 4-46 14-58" stroke={C.forest} strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M134 205c14-6 30-2 40 8-14 8-30 6-40-8z" fill={C.sage} />
        <path d="M132 224c-14-4-28 2-36 12 14 6 28 2 36-12z" fill={C.forest} />
        <path d="M110 250h44l-6 34a8 8 0 0 1-8 7h-16a8 8 0 0 1-8-7z" fill={C.terracotta} />
        <rect x="106" y="244" width="52" height="12" rx="6" fill={C.clay600} />
      </g>

      {/* stack of books (platform) */}
      <g>
        <rect x="96" y="330" width="268" height="30" rx="8" fill={C.forest} />
        <rect x="330" y="330" width="34" height="30" rx="8" fill={C.cream} opacity="0.85" />
        <rect x="112" y="304" width="236" height="28" rx="8" fill={C.terracotta} />
        <rect x="318" y="304" width="30" height="28" rx="8" fill={C.cream} opacity="0.85" />
        <rect x="104" y="278" width="252" height="28" rx="8" fill={C.gold} />
        <rect x="326" y="278" width="30" height="28" rx="8" fill={C.cream} opacity="0.85" />
      </g>

      {/* open book on top */}
      <g>
        <path d="M230 250l-96-22a10 10 0 0 0-12 10v6l108 26z" fill={C.clay500} />
        <path d="M230 250l96-22a10 10 0 0 1 12 10v6l-108 26z" fill={C.clay600} />
        <path d="M230 262l-102-24v-4a8 8 0 0 1 10-8l92 22z" fill={C.cream} />
        <path d="M230 262l102-24v-4a8 8 0 0 0-10-8l-92 22z" fill={C.cream} />
        <g stroke={C.clay300} strokeWidth="3" strokeLinecap="round">
          <path d="M150 240l60 14M150 250l58 13" />
          <path d="M310 240l-60 14M310 250l-58 13" />
        </g>
        <path d="M230 262V232" stroke={C.clay400} strokeWidth="3" />
      </g>

      {/* coffee cup, front-right */}
      <g>
        <path d="M300 300c6-3 14-2 18 4s2 14-5 17" fill="none" stroke={C.clay500} strokeWidth="8" strokeLinecap="round" />
        <path d="M244 288h64v22a26 26 0 0 1-26 26h-12a26 26 0 0 1-26-26z" fill={C.cream} />
        <rect x="238" y="282" width="76" height="12" rx="6" fill={C.clay200} />
        <ellipse cx="276" cy="292" rx="30" ry="6" fill={C.clay600} />
        {/* steam */}
        <g stroke={C.clay400} strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.8">
          <path d="M266 274c-6-8 4-14-2-22" />
          <path d="M286 274c-6-8 4-14-2-22" />
        </g>
      </g>

      {/* sparkles */}
      <g fill={C.gold}>
        <path d="M360 180l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" />
        <path d="M104 300l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" />
      </g>
    </svg>
  );
}

/* ---------- "How it works" step badges ---------- */
function Badge({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 120 120" className="h-20 w-20" role="img">
      <circle cx="60" cy="60" r="56" fill={C.clay100} />
      {children}
    </svg>
  );
}

export function StepChooseBook() {
  return (
    <Badge>
      <path d="M60 44l-26-6a6 6 0 0 0-7 6v34l33 8z" fill={C.terracotta} />
      <path d="M60 44l26-6a6 6 0 0 1 7 6v34l-33 8z" fill={C.clay600} />
      <path d="M60 52l-27-6v30l27 7z" fill={C.cream} />
      <path d="M60 52l27-6v30l-27 7z" fill={C.cream} />
      <g stroke={C.clay300} strokeWidth="3" strokeLinecap="round">
        <path d="M42 56l14 3M42 64l13 3M78 56l-14 3M78 64l-13 3" />
      </g>
      <path d="M60 84V52" stroke={C.clay400} strokeWidth="3" />
      <path d="M84 30l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill={C.gold} />
    </Badge>
  );
}

export function StepJoinGroup() {
  return (
    <Badge>
      <circle cx="45" cy="50" r="11" fill={C.forest} />
      <path d="M27 82a18 18 0 0 1 36 0z" fill={C.forest} />
      <circle cx="75" cy="50" r="11" fill={C.terracotta} />
      <path d="M57 82a18 18 0 0 1 36 0z" fill={C.terracotta} />
      <circle cx="60" cy="44" r="12" fill={C.gold} />
      <path d="M40 84a20 20 0 0 1 40 0z" fill={C.gold} />
    </Badge>
  );
}

export function StepMeetCafe() {
  return (
    <Badge>
      <path d="M78 54c5-2 11-1 14 4s1 12-5 14" fill="none" stroke={C.clay500} strokeWidth="6" strokeLinecap="round" />
      <path d="M34 48h44v18a22 22 0 0 1-22 22 22 22 0 0 1-22-22z" fill={C.cream} />
      <rect x="30" y="43" width="52" height="10" rx="5" fill={C.clay200} />
      <ellipse cx="56" cy="52" rx="22" ry="5" fill={C.clay600} />
      <rect x="30" y="92" width="52" height="7" rx="3.5" fill={C.clay400} />
      <g stroke={C.clay400} strokeWidth="3.5" strokeLinecap="round" fill="none" opacity="0.8">
        <path d="M48 36c-4-6 3-10-1-16M64 36c-4-6 3-10-1-16" />
      </g>
    </Badge>
  );
}

/* ---------- Explore Groups: bookshelf banner ---------- */
export function GroupsBanner({ className = '' }: Props) {
  const spine = (x: number, w: number, h: number, fill: string, tilt = 0) => (
    <g transform={`rotate(${tilt} ${x + w / 2} 150)`}>
      <rect x={x} y={150 - h} width={w} height={h} rx="3" fill={fill} />
      <rect x={x} y={150 - h} width={w} height="6" fill={C.cream} opacity="0.25" />
      <rect x={x + 3} y={150 - h + 12} width={w - 6} height="3" rx="1.5" fill={C.cream} opacity="0.4" />
    </g>
  );
  return (
    <svg viewBox="0 0 600 170" className={className} role="img"
      aria-label="A shelf of colourful books with a coffee cup and a plant">
      {spine(40, 26, 108, C.clay600)}
      {spine(70, 22, 96, C.forest)}
      {spine(96, 28, 116, C.terracotta)}
      {spine(128, 20, 88, C.gold)}
      {spine(152, 26, 104, C.forestDark)}
      {spine(182, 24, 120, C.clay500)}
      {spine(212, 22, 92, C.rose)}
      {/* leaning pair */}
      {spine(246, 24, 100, C.sage, 8)}
      {spine(272, 22, 96, C.clay400, 8)}

      {/* coffee cup */}
      <g transform="translate(322 0)">
        <path d="M56 96c5-2 11-1 14 4s1 12-5 14" fill="none" stroke={C.clay500} strokeWidth="6" strokeLinecap="round" />
        <path d="M12 90h46v20a23 23 0 0 1-23 23 23 23 0 0 1-23-23z" fill={C.cream} />
        <rect x="8" y="85" width="54" height="10" rx="5" fill={C.clay200} />
        <ellipse cx="35" cy="94" rx="23" ry="5" fill={C.clay600} />
        <rect x="6" y="136" width="58" height="7" rx="3.5" fill={C.clay300} />
      </g>

      {/* stacked books + plant on the right */}
      <g transform="translate(430 0)">
        <rect x="10" y="120" width="130" height="22" rx="6" fill={C.forest} />
        <rect x="24" y="100" width="110" height="20" rx="6" fill={C.terracotta} />
        <rect x="16" y="80" width="120" height="20" rx="6" fill={C.gold} />
        <g transform="translate(84 0)">
          <path d="M20 80c-5-22 3-38 12-48" stroke={C.forest} strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M32 40c12-5 26-1 34 8-12 7-26 5-34-8z" fill={C.sage} />
          <path d="M30 56c-12-3-24 2-31 10 12 6 24 2 31-10z" fill={C.forest} />
          <path d="M8 78h40l-5 26a7 7 0 0 1-7 6H20a7 7 0 0 1-7-6z" fill={C.rose} />
        </g>
      </g>
    </svg>
  );
}

/* ---------- Facilitator hero: someone leading a circle ---------- */
export function FacilitatorScene({ className = '' }: Props) {
  return (
    <svg viewBox="0 0 440 380" className={className} role="img"
      aria-label="A facilitator holding an open book, guiding a discussion">
      <circle cx="220" cy="190" r="180" fill={C.clay100} />

      {/* speech bubble */}
      <g>
        <rect x="250" y="60" width="150" height="86" rx="18" fill={C.cream} />
        <path d="M286 146l-6 26 30-26z" fill={C.cream} />
        <g stroke={C.clay300} strokeWidth="6" strokeLinecap="round">
          <path d="M272 92h106M272 112h84" />
        </g>
        <path d="M356 40l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" fill={C.gold} />
      </g>

      {/* facilitator figure */}
      <g>
        {/* body */}
        <path d="M150 360c0-52 24-84 60-84s60 32 60 84z" fill={C.forest} />
        {/* head */}
        <circle cx="210" cy="150" r="34" fill={C.clay300} />
        <path d="M176 146c0-24 16-40 34-40s34 16 34 34c-10-6-14-14-22-14-12 0-16 12-30 14-8 1-16 2-16 6z" fill={C.clay600} />
        {/* arm holding book */}
        <path d="M180 250c-22 6-34 22-36 44" stroke={C.forest} strokeWidth="26" fill="none" strokeLinecap="round" />
      </g>

      {/* open book in hands */}
      <g transform="rotate(-8 150 310)">
        <path d="M150 300l-52-14a8 8 0 0 0-10 8v6l62 16z" fill={C.terracotta} />
        <path d="M150 300l52-14a8 8 0 0 1 10 8v6l-62 16z" fill={C.clay600} />
        <path d="M150 310l-56-15v-3a6 6 0 0 1 8-6l48 13z" fill={C.cream} />
        <path d="M150 310l56-15v-3a6 6 0 0 0-8-6l-48 13z" fill={C.cream} />
        <g stroke={C.clay300} strokeWidth="3" strokeLinecap="round">
          <path d="M108 300l30 8M200 300l-30 8" />
        </g>
      </g>

      {/* small audience dots */}
      <g>
        <circle cx="60" cy="330" r="16" fill={C.gold} />
        <circle cx="96" cy="352" r="14" fill={C.rose} />
        <circle cx="360" cy="336" r="16" fill={C.sage} />
        <circle cx="388" cy="356" r="13" fill={C.terracotta} />
      </g>
    </svg>
  );
}
