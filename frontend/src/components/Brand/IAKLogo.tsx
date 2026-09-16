import React from 'react';

interface IAKLogoProps {
  stage?: number;
  reducedMotion?: boolean;
  className?: string;
}

const MASKS: Record<string, string> = {
  // Crown: Top-left area above the 'I'
  crown: "polygon(0% 0%, 35% 0%, 35% 25%, 0% 25%)",
  // Body (I): Left vertical pillar
  body: "polygon(0% 25%, 28% 25%, 28% 90%, 0% 90%)",
  // A: Center structure
  a: "polygon(28% 0%, 65% 0%, 65% 90%, 28% 90%)",
  // K1: Left half of right structure (Stage 5)
  k1: "polygon(65% 0%, 80% 0%, 80% 100%, 65% 100%)",
  // K2: Right half of right structure (Stage 6)
  k2: "polygon(80% 0%, 100% 0%, 100% 100%, 80% 100%)",
  // Connector: The swirl wrapping around the bottom and middle.
  connector: "polygon(0% 80%, 100% 80%, 100% 100%, 0% 100%, 0% 50%, 25% 50%, 25% 65%, 0% 65%)" 
};

const LogoPart: React.FC<{ part: string; stage: number; activeFrom: number; isCrown?: boolean; reducedMotion?: boolean }> = ({ 
  part, 
  stage, 
  activeFrom,
  isCrown = false,
  reducedMotion = false
}) => {
  return (
    <img
      src="/logo.png"
      id={`iak-${part}`}
      data-part={part}
      className={`absolute inset-0 w-full h-full ${reducedMotion ? 'transition-none' : 'transition-opacity duration-700 ease-out'}`}
      alt=""
      style={{
        opacity: stage >= activeFrom ? 1 : 0,
        clipPath: MASKS[part],
        WebkitClipPath: MASKS[part],
        filter: (isCrown && stage >= 8) ? 'drop-shadow(0 0 10px rgba(212,175,55,.45))' : 'none'
      }}
    />
  );
};

export const IAKLogo: React.FC<IAKLogoProps> = ({ 
  stage = 9, 
  reducedMotion = false,
  className = "" 
}) => {
  return (
    <div className={`relative w-full h-full ${className}`}>
      
      {/* Dim original */}
      <img
        src="/logo.png"
        className="absolute inset-0 w-full h-full opacity-20"
        alt="IAK Logo Base"
      />

      <LogoPart part="body" stage={stage} activeFrom={2} reducedMotion={reducedMotion} />
      <LogoPart part="connector" stage={stage} activeFrom={3} reducedMotion={reducedMotion} />
      <LogoPart part="a" stage={stage} activeFrom={4} reducedMotion={reducedMotion} />
      <LogoPart part="k1" stage={stage} activeFrom={5} reducedMotion={reducedMotion} />
      <LogoPart part="k2" stage={stage} activeFrom={6} reducedMotion={reducedMotion} />
      
      {/* Crown must activate at stage 8, with extra brightness at stage 9 */}
      <LogoPart part="crown" stage={stage} activeFrom={8} isCrown={true} reducedMotion={reducedMotion} />

    </div>
  );
};
