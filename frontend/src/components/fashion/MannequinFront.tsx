interface MannequinProps {
  className?: string;
}

export function MannequinFront({ className }: MannequinProps) {
  return (
    <svg
      viewBox="0 0 300 550"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <ellipse cx="150" cy="18" rx="22" ry="8" stroke="currentColor" strokeWidth="1.5" />
      <line x1="128" y1="18" x2="128" y2="55" stroke="currentColor" strokeWidth="1.5" />
      <line x1="172" y1="18" x2="172" y2="55" stroke="currentColor" strokeWidth="1.5" />
      <ellipse cx="150" cy="55" rx="22" ry="8" stroke="currentColor" strokeWidth="1.5" />
      <line x1="128" y1="55" x2="68" y2="95" stroke="currentColor" strokeWidth="1.5" />
      <line x1="172" y1="55" x2="232" y2="95" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M68 95 Q63 115 67 145 Q70 185 72 220 Q78 265 85 300 Q82 340 78 380 L78 460"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M232 95 Q237 115 233 145 Q230 185 228 220 Q222 265 215 300 Q218 340 222 380 L222 460"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <line x1="78" y1="460" x2="222" y2="460" stroke="currentColor" strokeWidth="1.5" />
      <line x1="150" y1="55" x2="150" y2="460" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <line x1="70" y1="185" x2="230" y2="185" stroke="currentColor" strokeWidth="0.8" strokeDasharray="4 4" opacity="0.4" />
      <line x1="85" y1="300" x2="215" y2="300" stroke="currentColor" strokeWidth="0.8" strokeDasharray="4 4" opacity="0.4" />
      <line x1="78" y1="380" x2="222" y2="380" stroke="currentColor" strokeWidth="0.8" strokeDasharray="4 4" opacity="0.4" />
      <line x1="67" y1="140" x2="233" y2="140" stroke="currentColor" strokeWidth="0.8" strokeDasharray="4 4" opacity="0.4" />
      <path
        d="M105 95 L105 140 Q102 175 100 220 Q96 265 94 300 L92 380"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeDasharray="4 4"
        opacity="0.4"
        fill="none"
      />
      <path
        d="M195 95 L195 140 Q198 175 200 220 Q204 265 206 300 L208 380"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeDasharray="4 4"
        opacity="0.4"
        fill="none"
      />
      <circle cx="112" cy="185" r="25" stroke="currentColor" strokeWidth="0.8" strokeDasharray="4 4" opacity="0.35" fill="none" />
      <circle cx="112" cy="185" r="14" stroke="currentColor" strokeWidth="0.8" strokeDasharray="4 4" opacity="0.35" fill="none" />
      <circle cx="188" cy="185" r="25" stroke="currentColor" strokeWidth="0.8" strokeDasharray="4 4" opacity="0.35" fill="none" />
      <circle cx="188" cy="185" r="14" stroke="currentColor" strokeWidth="0.8" strokeDasharray="4 4" opacity="0.35" fill="none" />
    </svg>
  );
}
