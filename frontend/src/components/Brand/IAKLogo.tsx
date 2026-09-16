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
  // K: Right structure
  k: "polygon(65% 0%, 100% 0%, 100% 100%, 65% 100%)",
  // Connector: The swirl wrapping around the bottom and middle.
  connector: "polygon(0% 80%, 100% 80%, 100% 100%, 0% 100%, 0% 50%, 25% 50%, 25% 65%, 0% 65%)" 
};

const LogoPart: React.FC<{ part: string; stage: number; activeFrom: number; isCrown?: boolean }> = ({ 
  part, 
  stage, 
  activeFrom,
  isCrown = false
}) => {
  return (
    <img
      src="/logo.png"
      id={`iak-${part}`}
      data-part={part}
      className="absolute inset-0 w-full h-full transition-opacity duration-700 ease-out"
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

      <LogoPart part="body" stage={stage} activeFrom={2} />
      <LogoPart part="connector" stage={stage} activeFrom={3} />
      <LogoPart part="a" stage={stage} activeFrom={4} />
      <LogoPart part="k" stage={stage} activeFrom={5} />
      
      {/* Crown must activate at stage 8, with extra brightness at stage 9 */}
      <LogoPart part="crown" stage={stage} activeFrom={8} isCrown={true} />

    </div>
  );
};
