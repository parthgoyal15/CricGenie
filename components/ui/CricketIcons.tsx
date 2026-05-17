interface IconProps {
  className?: string;
  size?: number;
}

/** Red leather cricket ball with seam arcs */
export function BallIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="10" fill="#B91C1C" />
      <circle cx="12" cy="12" r="10" fill="url(#ballShine)" opacity="0.25" />
      {/* seam arcs */}
      <path d="M9 2.8 C5.5 7 5.5 17 9 21.2" stroke="#FEE2E2" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.8"/>
      <path d="M15 2.8 C18.5 7 18.5 17 15 21.2" stroke="#FEE2E2" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.8"/>
      {/* stitching — left side */}
      <line x1="9" y1="8"  x2="12" y2="9"   stroke="#FEE2E2" strokeWidth="0.8" strokeLinecap="round" opacity="0.6"/>
      <line x1="9" y1="12" x2="12" y2="12.5" stroke="#FEE2E2" strokeWidth="0.8" strokeLinecap="round" opacity="0.6"/>
      <line x1="9" y1="16" x2="12" y2="15.5" stroke="#FEE2E2" strokeWidth="0.8" strokeLinecap="round" opacity="0.6"/>
      {/* stitching — right side */}
      <line x1="15" y1="8"  x2="12" y2="9"   stroke="#FEE2E2" strokeWidth="0.8" strokeLinecap="round" opacity="0.6"/>
      <line x1="15" y1="12" x2="12" y2="12.5" stroke="#FEE2E2" strokeWidth="0.8" strokeLinecap="round" opacity="0.6"/>
      <line x1="15" y1="16" x2="12" y2="15.5" stroke="#FEE2E2" strokeWidth="0.8" strokeLinecap="round" opacity="0.6"/>
      <defs>
        <radialGradient id="ballShine" cx="35%" cy="30%" r="50%">
          <stop offset="0%" stopColor="white"/>
          <stop offset="100%" stopColor="transparent"/>
        </radialGradient>
      </defs>
    </svg>
  );
}

/** Cricket bat — face view with handle */
export function BatIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* handle */}
      <rect x="10.5" y="1.5" width="3" height="7.5" rx="1.5" fill="#1C0A00"/>
      {/* grip band */}
      <rect x="10.5" y="4"   width="3" height="1.2" rx="0.6" fill="#292524" opacity="0.6"/>
      <rect x="10.5" y="6.2" width="3" height="1.2" rx="0.6" fill="#292524" opacity="0.6"/>
      {/* shoulder */}
      <path d="M8.5 9 Q8 9 8 9.5 L8 11 L16 11 L16 9.5 Q16 9 15.5 9 Z" fill="#92400E"/>
      {/* blade */}
      <path d="M8 11 L16 11 L15.5 21.5 Q12 23 8.5 21.5 Z" fill="#D97706"/>
      {/* ridge */}
      <line x1="12" y1="12" x2="12" y2="21" stroke="#B45309" strokeWidth="0.8" opacity="0.5"/>
    </svg>
  );
}

/** Three stumps with two bails */
export function StumpsIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* stumps */}
      <rect x="4.5"  y="8.5" width="2.8" height="13" rx="1.4" fill="#F59E0B"/>
      <rect x="10.6" y="8.5" width="2.8" height="13" rx="1.4" fill="#F59E0B"/>
      <rect x="16.7" y="8.5" width="2.8" height="13" rx="1.4" fill="#F59E0B"/>
      {/* bail 1 */}
      <rect x="3.8"  y="6.8" width="7"   height="2.2" rx="1.1" fill="#FDE68A"/>
      {/* bail 2 */}
      <rect x="13.2" y="6.8" width="7"   height="2.2" rx="1.1" fill="#FDE68A"/>
      {/* ground line */}
      <line x1="2" y1="21.5" x2="22" y2="21.5" stroke="#3F3F46" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  );
}

/** Stumps being hit — bails flying (WICKET!) */
export function WicketIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* stumps — slightly angled */}
      <rect x="4" y="9" width="2.5" height="12" rx="1.25" fill="#F97316" transform="rotate(-6 4 9)"/>
      <rect x="10.5" y="8" width="2.5" height="12" rx="1.25" fill="#F97316"/>
      <rect x="17" y="9" width="2.5" height="12" rx="1.25" fill="#F97316" transform="rotate(4 17 9)"/>
      {/* bail 1 — flying */}
      <rect x="3" y="5" width="5.5" height="1.8" rx="0.9" fill="#FCD34D" transform="rotate(-20 3 5)"/>
      {/* bail 2 — flying other way */}
      <rect x="15" y="4.5" width="5.5" height="1.8" rx="0.9" fill="#FCD34D" transform="rotate(15 15 4.5)"/>
      {/* impact lines */}
      <line x1="12" y1="8" x2="9"  y2="4"  stroke="#EF4444" strokeWidth="1.2" strokeLinecap="round" opacity="0.7"/>
      <line x1="12" y1="8" x2="15" y2="4"  stroke="#EF4444" strokeWidth="1.2" strokeLinecap="round" opacity="0.7"/>
      <line x1="12" y1="8" x2="12" y2="3.5"stroke="#EF4444" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
    </svg>
  );
}

/** Ball over boundary rope — SIX icon */
export function SixIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* arc trajectory */}
      <path d="M4 18 Q12 2 20 18" stroke="#4ADE80" strokeWidth="1.4" strokeLinecap="round" fill="none" strokeDasharray="2 1.5"/>
      {/* ball at peak */}
      <circle cx="12" cy="4" r="3.5" fill="#B91C1C"/>
      <path d="M10.5 2.5 C9.5 3.5 9.5 5.5 10.5 6.5" stroke="#FEE2E2" strokeWidth="0.8" strokeLinecap="round" fill="none" opacity="0.7"/>
      {/* boundary rope */}
      <line x1="2" y1="20" x2="22" y2="20" stroke="#3F3F46" strokeWidth="1.5" strokeLinecap="round"/>
      {/* speed lines */}
      <line x1="15" y1="6"  x2="18" y2="4.5" stroke="#4ADE80" strokeWidth="1" strokeLinecap="round" opacity="0.6"/>
      <line x1="15.5" y1="8" x2="19" y2="7"   stroke="#4ADE80" strokeWidth="1" strokeLinecap="round" opacity="0.4"/>
    </svg>
  );
}

/** Ball racing to boundary — FOUR icon */
export function FourIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* trail lines */}
      <line x1="3"   y1="12.5" x2="8"  y2="12.5" stroke="#38BDF8" strokeWidth="1"   strokeLinecap="round" opacity="0.3"/>
      <line x1="3.5" y1="15"   x2="9"  y2="13.5" stroke="#38BDF8" strokeWidth="0.8" strokeLinecap="round" opacity="0.2"/>
      <line x1="3.5" y1="10"   x2="9"  y2="11.5" stroke="#38BDF8" strokeWidth="0.8" strokeLinecap="round" opacity="0.2"/>
      {/* ball */}
      <circle cx="14" cy="12.5" r="5" fill="#B91C1C"/>
      <path d="M12 8 C10 9.5 10 15.5 12 17" stroke="#FEE2E2" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.7"/>
      <path d="M16 8 C18 9.5 18 15.5 16 17" stroke="#FEE2E2" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.7"/>
      {/* boundary rope */}
      <line x1="20.5" y1="8" x2="20.5" y2="18" stroke="#3F3F46" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

/** Dot ball — maiden delivery */
export function DotBallIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="6" fill="#3F3F46"/>
      <path d="M9.5 9 C8.5 10 8.5 14 9.5 15" stroke="#71717A" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.8"/>
      <path d="M14.5 9 C15.5 10 15.5 14 14.5 15" stroke="#71717A" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.8"/>
    </svg>
  );
}

/** Analysis — magnifying glass over pitch */
export function AnalysisIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* pitch rectangle */}
      <rect x="4" y="8" width="12" height="8" rx="1" fill="#3F3F46" stroke="#52525B" strokeWidth="0.8"/>
      <line x1="4" y1="10" x2="16" y2="10" stroke="#52525B" strokeWidth="0.5"/>
      <line x1="4" y1="14" x2="16" y2="14" stroke="#52525B" strokeWidth="0.5"/>
      {/* magnifier */}
      <circle cx="16" cy="8" r="5" stroke="#818CF8" strokeWidth="1.5" fill="none"/>
      <circle cx="16" cy="8" r="5" fill="#818CF8" fillOpacity="0.1"/>
      <line x1="19.5" y1="11.5" x2="22" y2="14" stroke="#818CF8" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

/** Update / notification bell */
export function UpdateIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 3 Q17 3 18 9 L19 16 L5 16 L6 9 Q7 3 12 3 Z" fill="#F59E0B" fillOpacity="0.2" stroke="#F59E0B" strokeWidth="1.4" strokeLinejoin="round"/>
      <line x1="12" y1="3" x2="12" y2="1.5" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M9.5 16 Q9.5 18 12 18 Q14.5 18 14.5 16" stroke="#F59E0B" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

/** Trophy cup */
export function TrophyIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* cup handles */}
      <path d="M8 5 Q4 5 4 9 Q4 12 8 12" stroke="#FCD34D" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      <path d="M16 5 Q20 5 20 9 Q20 12 16 12" stroke="#FCD34D" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      {/* cup body */}
      <path d="M8 3 L16 3 L15 14 Q12 16 9 14 Z" fill="#FBBF24"/>
      <path d="M8 3 L16 3 L15 14 Q12 16 9 14 Z" stroke="#F59E0B" strokeWidth="0.5"/>
      {/* stem */}
      <rect x="11" y="16" width="2" height="4"  fill="#F59E0B"/>
      {/* base */}
      <rect x="8"  y="20" width="8" height="2" rx="1" fill="#F59E0B"/>
      {/* star highlight */}
      <path d="M12 6 L12.5 7.5 L14 7.5 L12.8 8.4 L13.3 10 L12 9 L10.7 10 L11.2 8.4 L10 7.5 L11.5 7.5 Z" fill="#FEF3C7" opacity="0.7"/>
    </svg>
  );
}

/** Bird's-eye cricket pitch + field */
export function PitchIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* oval field */}
      <ellipse cx="12" cy="12" rx="10" ry="10" fill="#16A34A" fillOpacity="0.15" stroke="#16A34A" strokeWidth="0.8" opacity="0.5"/>
      {/* pitch rectangle */}
      <rect x="10.5" y="4" width="3" height="16" rx="1" fill="#D97706" fillOpacity="0.5" stroke="#D97706" strokeWidth="0.6"/>
      {/* crease lines */}
      <line x1="9" y1="6.5"  x2="15" y2="6.5"  stroke="#D97706" strokeWidth="0.8" strokeLinecap="round" opacity="0.8"/>
      <line x1="9" y1="17.5" x2="15" y2="17.5" stroke="#D97706" strokeWidth="0.8" strokeLinecap="round" opacity="0.8"/>
      {/* stumps dots */}
      <circle cx="12" cy="5.8"  r="0.7" fill="#FCD34D"/>
      <circle cx="12" cy="18.2" r="0.7" fill="#FCD34D"/>
    </svg>
  );
}

/** Helmet — batting helmet with grill */
export function HelmetIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* dome */}
      <path d="M4 15 Q4 6 12 6 Q20 6 20 15" fill="#3B82F6" stroke="#2563EB" strokeWidth="0.8"/>
      {/* brim/peak */}
      <path d="M3 14.5 L21 14.5 Q21.5 14.5 21.5 15.5 L21.5 17 Q21.5 18 20.5 18 L3.5 18 Q2.5 18 2.5 17 L2.5 15.5 Q2.5 14.5 3 14.5 Z" fill="#2563EB"/>
      {/* grill bars */}
      <rect x="7"    y="18" width="2" height="5" rx="1"   fill="#1E3A8A" opacity="0.9"/>
      <rect x="11"   y="18" width="2" height="5" rx="1"   fill="#1E3A8A" opacity="0.9"/>
      <rect x="15"   y="18" width="2" height="5" rx="1"   fill="#1E3A8A" opacity="0.9"/>
      {/* grill cross bar */}
      <rect x="6.5"  y="20.5" width="11" height="1.5" rx="0.75" fill="#1E3A8A" opacity="0.7"/>
    </svg>
  );
}

/** Cricket field with positions (top-down) */
export function FieldIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="10" fill="#16A34A" fillOpacity="0.12" stroke="#16A34A" strokeWidth="0.7" opacity="0.4"/>
      <circle cx="12" cy="12" r="5.5" fill="none" stroke="#16A34A" strokeWidth="0.5" opacity="0.3" strokeDasharray="1.5 1.5"/>
      <rect x="11" y="6" width="2" height="12" rx="1" fill="#D97706" fillOpacity="0.4"/>
      {/* fielder dots */}
      <circle cx="12" cy="3.5" r="1" fill="#4ADE80" opacity="0.7"/>
      <circle cx="12" cy="20.5" r="1" fill="#4ADE80" opacity="0.7"/>
      <circle cx="3.5" cy="12" r="1" fill="#4ADE80" opacity="0.7"/>
      <circle cx="20.5" cy="12" r="1" fill="#4ADE80" opacity="0.7"/>
      <circle cx="5.5" cy="5.5" r="0.9" fill="#4ADE80" opacity="0.5"/>
      <circle cx="18.5" cy="5.5" r="0.9" fill="#4ADE80" opacity="0.5"/>
      <circle cx="5.5" cy="18.5" r="0.9" fill="#4ADE80" opacity="0.5"/>
      <circle cx="18.5" cy="18.5" r="0.9" fill="#4ADE80" opacity="0.5"/>
    </svg>
  );
}
