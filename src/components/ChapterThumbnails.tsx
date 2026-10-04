import type { FC } from 'react';

export const ChapterThumbnail: FC<{ scene: string; title: string }> = ({ scene, title }) => {
  switch (scene) {
    case 'kitchen':
      return (
        <svg viewBox="0 0 400 225" className="chapter-svg" aria-label={title} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="kit-wall" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFF2DE" />
              <stop offset="100%" stopColor="#FED7AA" />
            </linearGradient>
            <linearGradient id="kit-tile" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#E2E8F0" />
              <stop offset="100%" stopColor="#CBD5E1" />
            </linearGradient>
          </defs>
          {/* Wall & Floor */}
          <rect width="400" height="150" fill="url(#kit-wall)" />
          <rect y="150" width="400" height="75" fill="#E2A665" />
          {/* Tiled backsplash */}
          <rect x="0" y="80" width="400" height="70" fill="url(#kit-tile)" opacity="0.6" />
          <path d="M0 100 H400 M0 120 H400 M0 140 H400" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.8" />
          {/* Window */}
          <rect x="250" y="20" width="80" height="70" rx="8" fill="#FEF08A" stroke="#EA580C" strokeWidth="4" />
          <line x1="290" y1="20" x2="290" y2="90" stroke="#EA580C" strokeWidth="3" />
          <line x1="250" y1="55" x2="330" y2="55" stroke="#EA580C" strokeWidth="3" />
          {/* Cabinet & Counter */}
          <rect x="0" y="110" width="220" height="85" rx="6" fill="#60A5FA" />
          <rect x="0" y="105" width="230" height="12" rx="3" fill="#FDE68A" />
          <circle cx="60" cy="145" r="4" fill="#1E3A8A" />
          <circle cx="150" cy="145" r="4" fill="#1E3A8A" />
          {/* Yellow Fridge */}
          <rect x="335" y="45" width="55" height="135" rx="10" fill="#FBBF24" />
          <rect x="335" y="105" width="55" height="4" fill="#D97706" />
          <rect x="340" y="80" width="4" height="20" rx="2" fill="#78350F" />
          <rect x="340" y="120" width="4" height="22" rx="2" fill="#78350F" />
          {/* Green and Blue Bins */}
          <rect x="80" y="145" width="45" height="60" rx="6" fill="#15803D" />
          <rect x="76" y="140" width="53" height="8" rx="3" fill="#166534" />
          <text x="102" y="180" fill="#FFFFFF" fontSize="12" fontWeight="800" textAnchor="middle">WET</text>
          <rect x="135" y="145" width="45" height="60" rx="6" fill="#1D4ED8" />
          <rect x="131" y="140" width="53" height="8" rx="3" fill="#1E40AF" />
          <text x="157" y="180" fill="#FFFFFF" fontSize="12" fontWeight="800" textAnchor="middle">DRY</text>
          {/* Characters silhouettes: Mum and Jyoti */}
          {/* Mum */}
          <ellipse cx="230" cy="75" rx="15" ry="16" fill="#9B6042" />
          <path d="M215 95 Q230 85 245 95 L250 165 L210 165 Z" fill="#F43F5E" />
          <path d="M218 105 L242 105 L240 155 L220 155 Z" fill="#FFFBEB" />
          {/* Jyoti */}
          <ellipse cx="50" cy="100" rx="13" ry="14" fill="#8F5A3C" />
          <circle cx="34" cy="98" r="6" fill="#2B1E1A" />
          <circle cx="66" cy="98" r="6" fill="#2B1E1A" />
          <path d="M38 116 Q50 110 62 116 L65 170 L35 170 Z" fill="#FBBF24" />
        </svg>
      );

    case 'bathroom':
      return (
        <svg viewBox="0 0 400 225" className="chapter-svg" aria-label={title} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bath-wall" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#E0F2FE" />
              <stop offset="100%" stopColor="#BAE6FD" />
            </linearGradient>
          </defs>
          <rect width="400" height="160" fill="url(#bath-wall)" />
          <rect y="160" width="400" height="65" fill="#94A3B8" />
          {/* Mirror */}
          <rect x="150" y="25" width="100" height="75" rx="8" fill="#F0F9FF" stroke="#38BDF8" strokeWidth="4" />
          <line x1="165" y1="35" x2="200" y2="35" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
          {/* Basin Counter */}
          <rect x="120" y="110" width="160" height="65" rx="6" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
          <ellipse cx="200" cy="120" rx="45" ry="12" fill="#E2E8F0" />
          {/* Tap */}
          <path d="M200 112 V96 Q200 88 192 88 H188" fill="none" stroke="#64748B" strokeWidth="5" strokeLinecap="round" />
          {/* Drain on floor with caution indicator */}
          <ellipse cx="70" cy="190" rx="35" ry="18" fill="#334155" stroke="#1E293B" strokeWidth="3" />
          <path d="M50 190 H90 M70 178 V202 M56 182 L84 198 M56 198 L84 182" stroke="#64748B" strokeWidth="2.5" />
          {/* Crossed-out packaging near drain */}
          <rect x="25" y="180" width="18" height="24" rx="3" fill="#EC4899" transform="rotate(-15 25 180)" />
          <circle cx="34" cy="192" r="14" fill="none" stroke="#EF4444" strokeWidth="3" />
          <line x1="24" y1="182" x2="44" y2="202" stroke="#EF4444" strokeWidth="3" />
          {/* Toiletries & Tube */}
          <rect x="245" y="92" width="14" height="26" rx="4" fill="#38BDF8" />
          <rect x="264" y="98" width="18" height="16" rx="3" fill="#F43F5E" />
          {/* Dry bin near bathroom */}
          <rect x="315" y="130" width="45" height="65" rx="6" fill="#1D4ED8" />
          <rect x="311" y="125" width="53" height="8" rx="3" fill="#1E40AF" />
          <text x="337" y="165" fill="#FFFFFF" fontSize="11" fontWeight="800" textAnchor="middle">DRY</text>
        </svg>
      );

    case 'street':
      return (
        <svg viewBox="0 0 400 225" className="chapter-svg" aria-label={title} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="sky-road" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#BAE6FD" />
              <stop offset="100%" stopColor="#FEF08A" />
            </linearGradient>
          </defs>
          <rect width="400" height="135" fill="url(#sky-road)" />
          <rect y="135" width="400" height="90" fill="#475569" />
          {/* Road markings */}
          <line x1="0" y1="180" x2="400" y2="180" stroke="#FDE047" strokeWidth="4" strokeDasharray="25,20" />
          {/* Pavement */}
          <rect y="120" width="400" height="20" fill="#94A3B8" />
          {/* Green Waste Collection Truck */}
          <g transform="translate(180, 70)">
            <rect x="40" y="20" width="110" height="65" rx="6" fill="#15803D" />
            <rect x="150" y="35" width="45" height="50" rx="6" fill="#16A34A" />
            <rect x="160" y="42" width="25" height="20" rx="3" fill="#E0F2FE" />
            <circle cx="70" cy="85" r="16" fill="#1E293B" stroke="#64748B" strokeWidth="4" />
            <circle cx="165" cy="85" r="16" fill="#1E293B" stroke="#64748B" strokeWidth="4" />
            {/* Recycling logo on truck */}
            <circle cx="95" cy="52" r="14" fill="#FFFFFF" opacity="0.9" />
            <text x="95" y="56" fill="#15803D" fontSize="12" fontWeight="900" textAnchor="middle">♻</text>
          </g>
          {/* Separated bags / bins on curb */}
          <rect x="40" y="105" width="28" height="38" rx="4" fill="#15803D" />
          <rect x="75" y="105" width="28" height="38" rx="4" fill="#1D4ED8" />
          <circle cx="125" cy="115" r="12" fill="#64748B" />
        </svg>
      );

    case 'school':
      return (
        <svg viewBox="0 0 400 225" className="chapter-svg" aria-label={title} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="school-sky" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#7DD3FC" />
              <stop offset="100%" stopColor="#E0F2FE" />
            </linearGradient>
          </defs>
          <rect width="400" height="145" fill="url(#school-sky)" />
          <rect y="145" width="400" height="80" fill="#D97706" opacity="0.85" />
          {/* School Building */}
          <rect x="50" y="45" width="180" height="100" rx="6" fill="#EA580C" />
          <polygon points="40,45 140,15 240,45" fill="#991B1B" />
          {/* School Windows & Door */}
          <rect x="70" y="60" width="30" height="30" rx="3" fill="#FEF08A" />
          <rect x="120" y="60" width="30" height="30" rx="3" fill="#FEF08A" />
          <rect x="170" y="60" width="30" height="30" rx="3" fill="#FEF08A" />
          <rect x="120" y="105" width="30" height="40" rx="3" fill="#78350F" />
          {/* Playground Tree */}
          <rect x="310" y="95" width="20" height="55" fill="#78350F" />
          <circle cx="320" cy="75" r="45" fill="#16A34A" />
          <circle cx="300" cy="65" r="30" fill="#22C55E" />
          {/* School Courtyard Sorting Bins */}
          <rect x="250" y="150" width="32" height="46" rx="4" fill="#15803D" />
          <rect x="247" y="146" width="38" height="6" rx="2" fill="#166534" />
          <text x="266" y="176" fill="#FFFFFF" fontSize="9" fontWeight="800" textAnchor="middle">WET</text>

          <rect x="290" y="150" width="32" height="46" rx="4" fill="#1D4ED8" />
          <rect x="287" y="146" width="38" height="6" rx="2" fill="#1E40AF" />
          <text x="306" y="176" fill="#FFFFFF" fontSize="9" fontWeight="800" textAnchor="middle">DRY</text>
          {/* Jyoti in school uniform */}
          <ellipse cx="195" cy="155" rx="9" ry="10" fill="#8F5A3C" />
          <path d="M187 167 L203 167 L200 205 L190 205 Z" fill="#2563EB" />
          <rect x="190" y="167" width="10" height="15" fill="#FFFFFF" />
        </svg>
      );

    case 'flood':
      return (
        <svg viewBox="0 0 400 225" className="chapter-svg" aria-label={title} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="rain-sky" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#64748B" />
              <stop offset="100%" stopColor="#94A3B8" />
            </linearGradient>
            <linearGradient id="flood-water" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>
          </defs>
          <rect width="400" height="120" fill="url(#rain-sky)" />
          {/* Rain streaks */}
          <line x1="40" y1="20" x2="25" y2="60" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="6,8" opacity="0.6" />
          <line x1="120" y1="15" x2="105" y2="55" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="6,8" opacity="0.6" />
          <line x1="220" y1="25" x2="205" y2="65" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="6,8" opacity="0.6" />
          <line x1="320" y1="10" x2="305" y2="50" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="6,8" opacity="0.6" />
          {/* Flooded Street */}
          <rect y="120" width="400" height="105" fill="url(#flood-water)" opacity="0.9" />
          {/* Blocked drain grill with accumulated bottles & plastics */}
          <rect x="60" y="145" width="90" height="45" rx="4" fill="#1E293B" />
          <line x1="75" y1="145" x2="75" y2="190" stroke="#94A3B8" strokeWidth="3" />
          <line x1="90" y1="145" x2="90" y2="190" stroke="#94A3B8" strokeWidth="3" />
          <line x1="105" y1="145" x2="105" y2="190" stroke="#94A3B8" strokeWidth="3" />
          <line x1="120" y1="145" x2="120" y2="190" stroke="#94A3B8" strokeWidth="3" />
          <line x1="135" y1="145" x2="135" y2="190" stroke="#94A3B8" strokeWidth="3" />
          {/* Floating rubbish blocking the grill */}
          <ellipse cx="78" cy="155" rx="14" ry="7" fill="#F43F5E" transform="rotate(-15 78 155)" />
          <ellipse cx="112" cy="158" rx="18" ry="8" fill="#FBBF24" transform="rotate(10 112 158)" />
          {/* Safety Barrier & Municipal Warning */}
          <polygon points="260,110 240,165 280,165" fill="#EA580C" />
          <polygon points="255,122 245,152 265,152" fill="#FFFFFF" />
          {/* Municipal Van / Worker silhouette */}
          <rect x="300" y="90" width="85" height="50" rx="6" fill="#0284C7" />
          <circle cx="320" cy="140" r="10" fill="#0F172A" />
          <circle cx="365" cy="140" r="10" fill="#0F172A" />
          <rect x="325" y="75" width="22" height="15" rx="4" fill="#F59E0B" />
        </svg>
      );

    case 'community':
    default:
      return (
        <svg viewBox="0 0 400 225" className="chapter-svg" aria-label={title} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="comm-sky" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#BAE6FD" />
              <stop offset="100%" stopColor="#FEF08A" />
            </linearGradient>
          </defs>
          <rect width="400" height="140" fill="url(#comm-sky)" />
          <rect y="140" width="400" height="85" fill="#86EFAC" />
          {/* Houses in background */}
          <polygon points="30,70 75,40 120,70" fill="#F43F5E" />
          <rect x="40" y="70" width="70" height="70" fill="#FED7AA" />
          <rect x="65" y="95" width="20" height="45" fill="#78350F" />

          <polygon points="270,70 315,35 360,70" fill="#0284C7" />
          <rect x="280" y="70" width="70" height="70" fill="#E2E8F0" />
          <rect x="305" y="95" width="20" height="45" fill="#1E293B" />
          {/* 4 Community Waste Bins */}
          <rect x="135" y="145" width="26" height="45" rx="4" fill="#15803D" />
          <text x="148" y="172" fill="#FFFFFF" fontSize="8" fontWeight="800" textAnchor="middle">WET</text>

          <rect x="168" y="145" width="26" height="45" rx="4" fill="#1D4ED8" />
          <text x="181" y="172" fill="#FFFFFF" fontSize="8" fontWeight="800" textAnchor="middle">DRY</text>

          <rect x="201" y="145" width="26" height="45" rx="4" fill="#DC2626" />
          <text x="214" y="172" fill="#FFFFFF" fontSize="8" fontWeight="800" textAnchor="middle">SAN</text>

          <rect x="234" y="145" width="26" height="45" rx="4" fill="#EAB308" />
          <text x="247" y="172" fill="#78350F" fontSize="8" fontWeight="800" textAnchor="middle">SPEC</text>
          {/* Cheerful community members */}
          <ellipse cx="110" cy="135" rx="8" ry="9" fill="#9B6042" />
          <path d="M102 145 H118 L116 185 H104 Z" fill="#6366F1" />

          <ellipse cx="275" cy="135" rx="8" ry="9" fill="#8F5A3C" />
          <path d="M267 145 H283 L281 185 H269 Z" fill="#10B981" />
        </svg>
      );
  }
};
