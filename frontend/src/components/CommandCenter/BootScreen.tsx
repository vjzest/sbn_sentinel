'use client';
import React, { useEffect, useState } from 'react';
import { Activity, CheckCircle2, ShieldAlert } from 'lucide-react';

interface BootScreenProps {
  onComplete: () => void;
}

export const BootScreen: React.FC<BootScreenProps> = ({ onComplete }) => {
  const [stage, setStage] = useState(1);
  const [healthStatus, setHealthStatus] = useState<'pending' | 'ready' | 'failed'>('pending');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Use a prefers-reduced-motion hook or media query check inside the component
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    setPrefersReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const performBoot = async () => {
      try {
        // Stage 1: INITIALIZING
        setStage(1);
        await new Promise(r => setTimeout(r, 800));
        
        if (!isMounted) return;

        // Fire off readiness check concurrently while animation starts
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/v1/health/ready`)
          .then(res => res.ok ? res.json() : Promise.reject(new Error('Backend unreachable')))
          .then(data => {
            if (isMounted) {
              if (data.ready) {
                setHealthStatus('ready');
              } else {
                setHealthStatus('failed');
                setErrorMessage('Backend returned not ready.');
              }
            }
          })
          .catch(err => {
            if (isMounted) {
              setHealthStatus('failed');
              setErrorMessage(err.message || 'Network failure');
            }
          });

        // Stages 2-6: LOADING (progressive illumination)
        for (let s = 2; s <= 6; s++) {
          if (!isMounted) return;
          setStage(s);
          await new Promise(r => setTimeout(r, 400));
        }

        // Stage 7: FINALIZING (Holding for backend)
        if (isMounted) setStage(7);
        
      } catch (error) {
        if (isMounted) {
          setHealthStatus('failed');
          setErrorMessage((error as Error).message);
        }
      }
    };

    performBoot();
    return () => { isMounted = false; };
  }, []);

  // Poll for health status during stage 7
  useEffect(() => {
    if (stage === 7) {
      if (healthStatus === 'ready') {
        // Stage 8: CROWN ACTIVATING
        setTimeout(() => setStage(8), 500);
        // Stage 9: READY
        setTimeout(() => {
          setStage(9);
          setTimeout(onComplete, 1500);
        }, 1200);
      }
    }
  }, [stage, healthStatus, onComplete]);

  // Determine illumination based on stage
  const getOpacity = (triggerStage: number) => {
    if (stage >= triggerStage) return 1;
    return 0;
  };

  const getTransitionClass = () => {
    return prefersReducedMotion ? 'transition-opacity duration-300' : 'transition-all duration-700 ease-out';
  };

  return (
    <div className="fixed inset-0 bg-[var(--color-canvas)] text-[var(--color-text-primary)] flex flex-col items-center justify-center z-50 p-6 overflow-hidden">
      
      {/* Central Visual Area */}
      <div className="relative w-full max-w-md flex flex-col items-center">
        
        {/* IAK SVG Container */}
        <div className="relative w-64 h-64 mb-12">
          {/* Dim outline / Base copy */}
          <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full opacity-20" aria-hidden="true">
            <g fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M40 70 L60 70 L60 150 L40 150 Z" /> {/* I */}
              <path d="M100 50 L120 150 L80 150 Z" /> {/* A */}
              <path d="M140 70 L160 70 L160 150 L140 150 Z M160 110 L190 70 M160 110 L190 150" /> {/* K */}
              <path d="M80 40 L100 20 L120 40 Z" /> {/* Crown */}
              <path d="M50 110 L150 110" strokeDasharray="4 4" /> {/* Inner stroke */}
            </g>
          </svg>

          {/* Gold copy (Revealed progressively) */}
          <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full" aria-hidden="true">
            <g fill="none" stroke="var(--color-brand-gold)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path 
                d="M40 70 L60 70 L60 150 L40 150 Z" 
                className={getTransitionClass()}
                style={{ opacity: getOpacity(2) }}
              />
              <path 
                d="M50 110 L150 110" strokeDasharray="4 4"
                className={getTransitionClass()}
                style={{ opacity: getOpacity(3) }}
              />
              <path 
                d="M100 50 L120 150 L80 150 Z" 
                className={getTransitionClass()}
                style={{ opacity: getOpacity(4) }}
              />
              <path 
                d="M140 70 L160 70 L160 150 L140 150 Z M160 110 L190 70 M160 110 L190 150" 
                className={getTransitionClass()}
                style={{ opacity: getOpacity(5) }}
              />
              
              {/* Crown Activates at Stage 8 */}
              <path 
                d="M80 40 L100 20 L120 40 Z" 
                className={getTransitionClass()}
                fill={stage >= 8 ? 'var(--color-brand-gold)' : 'none'}
                style={{ 
                  opacity: getOpacity(8), 
                  transform: stage >= 8 && !prefersReducedMotion ? 'scale(1.1)' : 'scale(1)',
                  transformOrigin: '100px 30px'
                }}
              />
            </g>
          </svg>
        </div>

        {/* Status Text Area */}
        <div className="h-16 flex items-center justify-center w-full">
          {healthStatus === 'failed' ? (
            <div className="flex flex-col items-center text-[var(--color-semantic-critical)] animate-in fade-in zoom-in duration-300">
              <div className="flex items-center gap-2 font-bold mb-2">
                <ShieldAlert className="w-5 h-5" />
                <span>Readiness Verification Failed</span>
              </div>
              <span className="text-xs text-[var(--color-text-secondary)]">{errorMessage}</span>
            </div>
          ) : stage >= 9 ? (
            <div className="flex items-center gap-2 text-[var(--color-brand-gold)] font-bold animate-in fade-in zoom-in duration-300">
              <CheckCircle2 className="w-5 h-5" />
              <span>Sentinel is ready.</span>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-sm font-medium text-[var(--color-text-secondary)]">
              {stage < 9 && <Activity className="w-4 h-4 animate-spin text-[var(--color-brand-gold)] opacity-70" />}
              <span>
                {stage === 1 && 'INITIALIZING...'}
                {stage >= 2 && stage <= 6 && 'LOADING SUBSYSTEMS...'}
                {stage === 7 && 'FINALIZING...'}
                {stage === 8 && 'CROWN ACTIVATING...'}
              </span>
            </div>
          )}
        </div>

        {/* Cosmetic Progress Line */}
        <div className="w-full max-w-xs h-1 bg-[var(--color-surface-raised)] rounded-full mt-6 overflow-hidden">
          <div 
            className="h-full bg-[var(--color-brand-gold)] transition-all ease-out"
            style={{ 
              width: healthStatus === 'failed' ? '0%' : `${(stage / 9) * 100}%`,
              transitionDuration: prefersReducedMotion ? '0s' : '500ms'
            }}
          />
        </div>

      </div>
    </div>
  );
};
