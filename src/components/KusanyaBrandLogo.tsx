import React from 'react';

interface KusanyaBrandLogoProps {
  className?: string;
  size?: 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  variant?: 'light' | 'dark' | 'color';
}

export const KusanyaEmblem: React.FC<{ className?: string; sizeClassName?: string }> = ({
  className = '',
  sizeClassName = 'w-5 h-5'
}) => (
  <div className={`relative ${sizeClassName} shrink-0 rounded-lg overflow-hidden shadow-sm shadow-amber-900/20 ${className}`}>
    <svg viewBox="0 0 512 512" className="w-full h-full">
      <defs>
        <linearGradient id="emblemBgGrad" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="50%" stopColor="#EA580C" />
          <stop offset="100%" stopColor="#C2410C" />
        </linearGradient>
        <linearGradient id="emblemCoinGrad" x1="200" y1="160" x2="312" y2="280" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="50%" stopColor="#FACC15" />
          <stop offset="100%" stopColor="#CA8A04" />
        </linearGradient>
        <linearGradient id="emblemBasket" x1="160" y1="210" x2="352" y2="400" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="50%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>
        <linearGradient id="emblemRing" x1="80" y1="100" x2="432" y2="350" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width="512" height="512" rx="100" fill="url(#emblemBgGrad)" />
      
      {/* Inner Light Glow */}
      <circle cx="256" cy="220" r="160" fill="#FDE047" fillOpacity="0.25" />

      {/* World Ring */}
      <circle cx="256" cy="220" r="135" stroke="url(#emblemRing)" strokeWidth="26" fill="none" />

      {/* Unity Hands clamping the ring */}
      <circle cx="256" cy="115" r="16" fill="#C68642" stroke="#522E10" strokeWidth="4" />
      <circle cx="195" cy="125" r="15" fill="#F1C27D" stroke="#78350F" strokeWidth="4" />
      <circle cx="317" cy="125" r="15" fill="#5A331A" stroke="#1C0F08" strokeWidth="4" />
      <circle cx="130" cy="210" r="16" fill="#E0AC69" stroke="#78350F" strokeWidth="4" />
      <circle cx="138" cy="275" r="16" fill="#6A3F23" stroke="#1C0F08" strokeWidth="4" />
      <circle cx="382" cy="210" r="16" fill="#FFE5C4" stroke="#B45309" strokeWidth="4" />
      <circle cx="374" cy="275" r="16" fill="#A86B35" stroke="#451A03" strokeWidth="4" />
      <circle cx="205" cy="330" r="15" fill="#F1C27D" stroke="#78350F" strokeWidth="4" />
      <circle cx="307" cy="330" r="15" fill="#5A331A" stroke="#1C0F08" strokeWidth="4" />

      {/* Gold Coin */}
      <circle cx="256" cy="220" r="62" fill="url(#emblemCoinGrad)" stroke="#FEF08A" strokeWidth="5" />
      <text x="256" y="242" fontFamily="system-ui, sans-serif" fontSize="62" fontWeight="900" fill="#78350F" textAnchor="middle">$</text>

      {/* Basket */}
      <ellipse cx="256" cy="265" rx="100" ry="22" fill="#FEF3C7" stroke="#78350F" strokeWidth="6" />
      <path d="M156 265 Q170 380 256 385 Q342 380 356 265 Z" fill="url(#emblemBasket)" stroke="#78350F" strokeWidth="6" />
      
      {/* KF Monogram on basket */}
      <text x="220" y="342" fontFamily="system-ui, sans-serif" fontSize="76" fontWeight="900" fill="#FEF3C7" stroke="#78350F" strokeWidth="4" textAnchor="middle">K</text>
      <text x="286" y="342" fontFamily="system-ui, sans-serif" fontSize="76" fontWeight="900" fill="#FEF3C7" stroke="#78350F" strokeWidth="4" textAnchor="middle">F</text>

      {/* KUSANYA Bottom Text */}
      <text x="256" y="458" fontFamily="system-ui, sans-serif" fontSize="64" fontWeight="900" letterSpacing="4" fill="#FFFFFF" textAnchor="middle">KUSANYA</text>
    </svg>
  </div>
);

export const KusanyaBrandLogo: React.FC<KusanyaBrandLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  variant = 'color'
}) => {
  const sizeMap = {
    xxs: { icon: 'w-4 h-4', text: 'text-xs', sub: 'text-[7px]' },
    xs: { icon: 'w-6 h-6', text: 'text-sm', sub: 'text-[8px]' },
    sm: { icon: 'w-8 h-8', text: 'text-lg', sub: 'text-[9px]' },
    md: { icon: 'w-10 h-10', text: 'text-xl', sub: 'text-[11px]' },
    lg: { icon: 'w-14 h-14', text: 'text-2xl', sub: 'text-xs' },
    xl: { icon: 'w-20 h-20', text: 'text-3xl', sub: 'text-sm' },
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Brand Icon Badge matching the official Kusanya emblem */}
      <div className={`relative ${sizeMap[size].icon} shrink-0 rounded-2xl overflow-hidden shadow-md shadow-amber-900/20 group`}>
        <svg viewBox="0 0 512 512" className="w-full h-full transform group-hover:scale-105 transition-transform">
          <defs>
            <linearGradient id="logoBgGrad" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="50%" stopColor="#EA580C" />
              <stop offset="100%" stopColor="#C2410C" />
            </linearGradient>
            <linearGradient id="logoCoinGrad" x1="200" y1="160" x2="312" y2="280" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="50%" stopColor="#FACC15" />
              <stop offset="100%" stopColor="#CA8A04" />
            </linearGradient>
            <linearGradient id="logoBasket" x1="160" y1="210" x2="352" y2="400" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="50%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#78350F" />
            </linearGradient>
            <linearGradient id="logoRing" x1="80" y1="100" x2="432" y2="350" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>
          </defs>

          {/* Background */}
          <rect width="512" height="512" rx="100" fill="url(#logoBgGrad)" />
          
          {/* Inner Light Glow */}
          <circle cx="256" cy="220" r="160" fill="#FDE047" fillOpacity="0.25" />

          {/* World Ring */}
          <circle cx="256" cy="220" r="135" stroke="url(#logoRing)" strokeWidth="26" fill="none" />

          {/* Unity Hands clamping the ring */}
          {/* Top */}
          <circle cx="256" cy="115" r="16" fill="#C68642" stroke="#522E10" strokeWidth="4" />
          <circle cx="195" cy="125" r="15" fill="#F1C27D" stroke="#78350F" strokeWidth="4" />
          <circle cx="317" cy="125" r="15" fill="#5A331A" stroke="#1C0F08" strokeWidth="4" />
          {/* Sides */}
          <circle cx="130" cy="210" r="16" fill="#E0AC69" stroke="#78350F" strokeWidth="4" />
          <circle cx="138" cy="275" r="16" fill="#6A3F23" stroke="#1C0F08" strokeWidth="4" />
          <circle cx="382" cy="210" r="16" fill="#FFE5C4" stroke="#B45309" strokeWidth="4" />
          <circle cx="374" cy="275" r="16" fill="#A86B35" stroke="#451A03" strokeWidth="4" />
          {/* Bottom */}
          <circle cx="205" cy="330" r="15" fill="#F1C27D" stroke="#78350F" strokeWidth="4" />
          <circle cx="307" cy="330" r="15" fill="#5A331A" stroke="#1C0F08" strokeWidth="4" />

          {/* Gold Coin */}
          <circle cx="256" cy="220" r="62" fill="url(#logoCoinGrad)" stroke="#FEF08A" strokeWidth="5" />
          <text x="256" y="242" fontFamily="system-ui, sans-serif" fontSize="62" fontWeight="900" fill="#78350F" textAnchor="middle">$</text>

          {/* Basket */}
          <ellipse cx="256" cy="265" rx="100" ry="22" fill="#FEF3C7" stroke="#78350F" strokeWidth="6" />
          <path d="M156 265 Q170 380 256 385 Q342 380 356 265 Z" fill="url(#logoBasket)" stroke="#78350F" strokeWidth="6" />
          
          {/* KF Monogram on basket */}
          <text x="220" y="342" fontFamily="system-ui, sans-serif" fontSize="76" fontWeight="900" fill="#FEF3C7" stroke="#78350F" strokeWidth="4" textAnchor="middle">K</text>
          <text x="286" y="342" fontFamily="system-ui, sans-serif" fontSize="76" fontWeight="900" fill="#FEF3C7" stroke="#78350F" strokeWidth="4" textAnchor="middle">F</text>

          {/* KUSANYA Bottom Text */}
          <text x="256" y="458" fontFamily="system-ui, sans-serif" fontSize="64" fontWeight="900" letterSpacing="4" fill="#FFFFFF" textAnchor="middle">KUSANYA</text>
        </svg>
      </div>

      {showText && (
        <div>
          <div className="flex items-center gap-1.5">
            <span className={`font-black tracking-tight ${sizeMap[size].text} ${variant === 'light' ? 'text-white' : 'text-slate-900'}`}>
              Kusanya<span className="text-emerald-600">.org</span>
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded">
              UGX MoMo
            </span>
          </div>
          <p className={`font-medium ${sizeMap[size].sub} ${variant === 'light' ? 'text-slate-300' : 'text-slate-500'}`}>
            Uganda's Crowdfunding & Community Giving
          </p>
        </div>
      )}
    </div>
  );
};
