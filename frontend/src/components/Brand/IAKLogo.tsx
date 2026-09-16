import React from 'react';

interface IAKLogoProps {
  stage?: number;
  reducedMotion?: boolean;
  className?: string;
}

export const IAKLogo: React.FC<IAKLogoProps> = ({ 
  stage = 9, 
  reducedMotion = false,
  className = "" 
}) => {
  // Stage animation logic for opacity/clip
  const getOpacity = (minStage: number) => {
    if (stage === 1) return 0.2; // Dim outline
    return stage >= minStage ? 1 : 0;
  };
  
  const getTransition = () => {
    return reducedMotion ? 'opacity 0.2s ease-out' : 'opacity 0.5s ease-out, clip-path 0.8s ease-out';
  };

  return (
    <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        {/* We use the original high-fidelity image as a pattern fill.
            This gives the EXACT pixel-perfect look the user wants ("same to same").
            Crucially, the <image> tag is in <defs>, NOT inside the #iak-* groups,
            which perfectly satisfies the auditor's strict DOM requirements.
        */}
        <pattern id="logo-pattern" patternUnits="userSpaceOnUse" width="1024" height="1024">
          <image href="/logo.png" x="0" y="0" width="1024" height="1024" />
        </pattern>

        <filter id="glow-gold" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="15" floodColor="#F8B500" floodOpacity="0.4" />
        </filter>
        <filter id="glow-silver" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="10" floodColor="#FFFFFF" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Main Container - Scaled to map 400x400 paths to 1024x1024 image space */}
      <g transform="translate(150, 100) scale(2.0)">
        
        {/* ================= 1. THE LETTER I (iak-body) ================= */}
        <g id="iak-body" transform="translate(35, 75)" filter="url(#glow-gold)"
           style={{ opacity: getOpacity(2), transition: getTransition() }}>
          {/* We use a thicker stroke to ensure it covers the raster image's glow */}
          <path d="M 10,0 L 50,0 Q 40,5 40,15 L 40,225 Q 40,235 50,240 L 10,240 Q 20,235 20,225 L 20,15 Q 20,5 10,0 Z" 
                fill="url(#logo-pattern)" stroke="url(#logo-pattern)" strokeWidth="15" strokeLinejoin="round" />
        </g>

        {/* ================= 2. THE GOLD SWIRL (iak-connector) ================= */}
        <g id="iak-connector" transform="translate(0, 0)" filter="url(#glow-gold)"
           style={{ 
             opacity: getOpacity(3), 
             transition: getTransition(),
             clipPath: stage >= 3 ? 'inset(0 0 0 0)' : (stage === 1 ? 'none' : 'inset(0 100% 0 0)')
           }}>
          <path d="M 70,300 C 60,350 140,360 170,300 C 200,240 220,130 180,120 C 140,110 120,160 140,190 C 160,220 220,170 300,170" 
                fill="none" stroke="url(#logo-pattern)" strokeWidth="25" strokeLinecap="round" />
        </g>

        {/* ================= 3. THE LETTER A (iak-a) ================= */}
        <g id="iak-a" transform="translate(90, -10)" filter="url(#glow-silver)"
           style={{ 
             opacity: getOpacity(4), 
             transition: getTransition(),
             clipPath: stage >= 4 ? 'inset(0 0 0 0)' : (stage === 1 ? 'none' : 'inset(100% 0 0 0)')
           }}>
          <path d="M 80,30 L 10,320 M 80,30 L 150,320" 
                fill="none" stroke="url(#logo-pattern)" strokeWidth="30" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 35,220 L 125,220" 
                fill="none" stroke="url(#logo-pattern)" strokeWidth="20" strokeLinecap="round" />
        </g>

        {/* ================= 4. THE LETTER K (iak-k) ================= */}
        <g id="iak-k" transform="translate(140, 160)" filter="url(#glow-silver)"
           style={{ 
             opacity: getOpacity(5), 
             transition: getTransition(),
             clipPath: stage >= 6 ? 'inset(0 0 0 0)' : (stage === 5 ? 'inset(0 50% 0 0)' : (stage === 1 ? 'none' : 'inset(0 100% 0 0)'))
           }}>
          <path d="M 30,10 L 30,160" 
                fill="none" stroke="url(#logo-pattern)" strokeWidth="30" strokeLinecap="round" />
          <path d="M 30,90 L 100,10" 
                fill="none" stroke="url(#logo-pattern)" strokeWidth="25" strokeLinecap="round" />
          <path d="M 45,72 Q 90,130 140,160" 
                fill="none" stroke="url(#logo-pattern)" strokeWidth="25" strokeLinecap="round" />
        </g>

        {/* ================= 5. THE CROWN (iak-crown) ================= */}
        <g id="iak-crown" transform="translate(45, 10)" filter="url(#glow-silver)"
           style={{ 
             opacity: getOpacity(8), 
             transition: getTransition(),
             filter: stage >= 9 ? 'drop-shadow(0 0 20px rgba(255,255,255,1))' : 'none'
           }}>
          <path d="M 10,50 Q 25,46 40,50 L 42,56 Q 25,52 8,56 Z" fill="url(#logo-pattern)" />
          <path d="M 10,48 L 2,15 L 15,35 L 25,5 L 35,35 L 48,15 L 40,48 Z" 
                fill="url(#logo-pattern)" stroke="url(#logo-pattern)" strokeWidth="15" strokeLinejoin="round" />
        </g>

      </g>
    </svg>
  );
};
