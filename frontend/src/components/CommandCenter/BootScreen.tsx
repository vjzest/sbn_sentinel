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
        const token = localStorage.getItem('token');
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/v1/health/ready`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          cache: 'no-store'
        })
          .then(async res => {
            if (res.status === 401 || res.status === 403) {
              localStorage.removeItem('token');
              window.location.href = '/';
              throw new Error('Unauthorized');
            }
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.json().catch(() => ({}));
          })
          .then(data => {
            if (isMounted) {
              if (data.ready === true) {
                setHealthStatus('ready');
              } else {
                setHealthStatus('failed');
                setErrorMessage('Backend checks did not pass');
              }
            }
          })
          .catch(err => {
            if (isMounted) {
              console.error("Backend check failed:", err);
              setHealthStatus('failed');
              setErrorMessage('Backend offline or unavailable');
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
        
        {/* Exact Segmented Logo Container */}
        <div className="w-48 h-48 md:w-56 md:h-56 mb-8 relative flex items-center justify-center transition-all duration-700" style={{ opacity: stage >= 1 ? 1 : 0 }}>
          <img 
            src="/logo.svg" 
            alt="IAK Logo" 
            className="w-full h-full object-contain drop-shadow-2xl"
            style={{ 
              clipPath: stage < 8 ? `inset(${100 - (stage * 12.5)}% 0 0 0)` : 'inset(0 0 0 0)',
              transition: 'clip-path 0.8s ease-out, opacity 0.5s ease-out',
              filter: stage >= 8 ? 'drop-shadow(0 0 20px rgba(248, 181, 0, 0.4))' : 'none'
            }}
          />
          {/* Big Blinking Dot */}
          {stage >= 7 && (
            <div 
              className={`absolute top-[15%] left-[25%] w-2.5 h-2.5 rounded-full bg-[#FDE68A] transition-all duration-500 ${
                stage >= 8 ? 'animate-ping drop-shadow-[0_0_20px_#FDE68A]' : 'opacity-80 scale-75'
              }`}
            />
          )}
          {stage >= 9 && (
            <div className="absolute top-[15%] left-[25%] w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_15px_2px_#ffffff] transition-all duration-1000" />
          )}
        </div>


        {/* Status Text Area (Top) */}
        <div className="h-8 flex items-center justify-center w-full mb-3">
          {healthStatus === 'failed' ? (
            <span className="text-sm font-bold text-[var(--color-semantic-critical)] tracking-widest uppercase">
              STARTUP FAILED
            </span>
          ) : (
            <span className="text-sm font-bold text-[var(--color-text-secondary)] tracking-widest uppercase">
              {stage === 1 && '1. INITIALIZING'}
              {stage >= 2 && stage <= 6 && `${stage}. LOADING`}
              {stage === 7 && '7. FINALIZING'}
              {stage === 8 && '8. CROWN ACTIVATING'}
              {stage === 9 && '9. READY'}
            </span>
          )}
        </div>

        {/* Cosmetic Progress Line */}
        <div className="w-full h-[2px] bg-white/10 relative overflow-hidden mb-3">
          <div 
            className="absolute top-0 left-0 h-full bg-[var(--color-brand-gold)] transition-all ease-out shadow-[0_0_8px_var(--color-brand-gold)]"
            style={{ 
              width: healthStatus === 'failed' ? '0%' : `${(stage / 9) * 100}%`,
              transitionDuration: prefersReducedMotion ? '0s' : '500ms'
            }}
          />
          {/* Glowing tip */}
          {stage > 0 && stage < 9 && healthStatus !== 'failed' && (
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_#fff] transition-all ease-out"
              style={{ 
                left: `calc(${(stage / 9) * 100}% - 3px)`,
                transitionDuration: prefersReducedMotion ? '0s' : '500ms'
              }}
            />
          )}
        </div>

        {/* Status Subtext Area (Bottom) */}
        <div className="h-6 flex items-center justify-center w-full">
          {healthStatus === 'failed' ? (
            <span className="text-xs text-[var(--color-semantic-critical)] opacity-80">{errorMessage}</span>
          ) : (
            <span className="text-xs text-[var(--color-brand-gold)] opacity-70">
              {stage === 1 && 'Initializing Sentinel...'}
              {stage === 7 && 'Almost there...'}
              {stage === 9 && 'Sentinel is ready.'}
            </span>
          )}
        </div>

        {/* Cosmetic Progress Line Old code removed here since I placed it above */}
      </div>
    </div>
  );
};
