import React from 'react';

interface IAKLogoProps {
  stage?: number;
  reducedMotion?: boolean;
  className?: string;
}

const LogoPart: React.FC<{ part: string; stage: number; activeFrom: number; className?: string; clipPath: string }> = ({ 
  part, 
  stage, 
  activeFrom,
  className = "",
  clipPath
}) => {
  const isActive = stage >= activeFrom;
  return (
    <div 
      id={`iak-${part}`}
      className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-out ${className}`}
      style={{ 
        opacity: isActive ? 1 : 0,
        clipPath: clipPath,
        WebkitClipPath: clipPath
      }}
    >
      <img src="/logo.png" alt="" className="w-full h-full object-contain drop-shadow-2xl" />
    </div>
  );
};

export const IAKLogo: React.FC<IAKLogoProps> = ({ 
  stage = 9, 
  reducedMotion = false,
  className = "" 
}) => {
  // Approximate polygon masks for each part of the raster image.
  // These divide the 2D space to isolate each glowing component.
  const masks = {
    // Crown: Top-left area above the 'I'
    crown: "polygon(0% 0%, 35% 0%, 35% 25%, 0% 25%)",
    
    // Body (I): Left vertical pillar
    body: "polygon(0% 25%, 28% 25%, 28% 90%, 0% 90%)",
    
    // A: Center structure
    a: "polygon(28% 0%, 65% 0%, 65% 90%, 28% 90%)",
    
    // K: Right structure
    k: "polygon(65% 0%, 100% 0%, 100% 100%, 65% 100%)",
    
    // Connector: The swirl wrapping around the bottom and middle.
    // We use a complex polygon to isolate the swirl path around the letters.
    connector: "polygon(0% 80%, 100% 80%, 100% 100%, 0% 100%, 0% 50%, 25% 50%, 25% 65%, 0% 65%)" 
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      
      {/* Dim original */}
      <img
        src="/logo.png"
        className="absolute inset-0 w-full h-full object-contain opacity-20"
        alt="IAK Logo Base"
      />

      <LogoPart part="body" stage={stage} activeFrom={2} clipPath={masks.body} />
      <LogoPart part="connector" stage={stage} activeFrom={3} clipPath={masks.connector} />
      <LogoPart part="a" stage={stage} activeFrom={4} clipPath={masks.a} />
      <LogoPart part="k" stage={stage} activeFrom={5} clipPath={masks.k} />
      
      {/* Crown must activate at stage 8, with extra brightness at stage 9 */}
      <LogoPart 
        part="crown" 
        stage={stage} 
        activeFrom={8} 
        clipPath={masks.crown} 
        className={stage >= 9 ? "drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]" : ""}
      />

    </div>
  );
};
