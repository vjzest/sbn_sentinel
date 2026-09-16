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
  const getOpacity = (minStage: number) => {
    return stage >= minStage ? 1 : 0;
  };
  
  const getTransition = () => {
    return reducedMotion ? 'opacity 0.2s ease-out' : 'opacity 0.5s ease-out, filter 0.8s ease-out';
  };

  const imageClass = "absolute inset-0 w-full h-full object-contain";

  return (
    <div className={`relative ${className}`}>
      {/* SVG Definitions for clipping the flat raster image */}
      <svg width="0" height="0" className="absolute pointer-events-none">
        <defs>
          <clipPath id="mask-crown" clipPathUnits="objectBoundingBox">
            <polygon points="0,0 0.45,0 0.45,0.28 0,0.28" />
          </clipPath>
          <clipPath id="mask-body" clipPathUnits="objectBoundingBox">
            <polygon points="0.2,0.28 0.45,0.28 0.45,1 0.2,1" />
          </clipPath>
          <clipPath id="mask-connector" clipPathUnits="objectBoundingBox">
            <polygon points="0,0.5 0.6,0.5 0.6,1 0,1" />
          </clipPath>
          <clipPath id="mask-a" clipPathUnits="objectBoundingBox">
            <polygon points="0.45,0 0.7,0 0.7,1 0.45,1" />
          </clipPath>
          <clipPath id="mask-k" clipPathUnits="objectBoundingBox">
            <polygon points="0.7,0 1,0 1,1 0.7,1" />
          </clipPath>
        </defs>
      </svg>

      {/* Dim Base Image (Stage 1) */}
      <img src="/logo.svg" className={imageClass} style={{ opacity: stage >= 1 ? 0.2 : 0, transition: getTransition() }} alt="IAK Logo Base" />

      {/* Stage 2: Body */}
      <img id="iak-body" src="/logo.svg" className={imageClass} style={{ clipPath: 'url(#mask-body)', opacity: getOpacity(2), transition: getTransition() }} alt="" />

      {/* Stage 3: Connector */}
      <img id="iak-connector" src="/logo.svg" className={imageClass} style={{ clipPath: 'url(#mask-connector)', opacity: getOpacity(3), transition: getTransition() }} alt="" />

      {/* Stage 4: A */}
      <img id="iak-a" src="/logo.svg" className={imageClass} style={{ clipPath: 'url(#mask-a)', opacity: getOpacity(4), transition: getTransition() }} alt="" />

      {/* Stage 5-6: K */}
      <img id="iak-k" src="/logo.svg" className={imageClass} style={{ clipPath: 'url(#mask-k)', opacity: getOpacity(5), transition: getTransition() }} alt="" />

      {/* Stage 8: Crown */}
      <img id="iak-crown" src="/logo.svg" className={imageClass} 
           style={{ 
             clipPath: 'url(#mask-crown)', 
             opacity: getOpacity(8), 
             transition: getTransition(),
             filter: stage >= 9 ? 'drop-shadow(0 0 15px rgba(255,255,255,0.8))' : 'none'
           }} alt="Crown" />
    </div>
  );
};
