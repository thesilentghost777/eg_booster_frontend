import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingStep {
  target: string; // selector CSS de l'élément à mettre en lumière
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface OnboardingTourProps {
  steps: OnboardingStep[];
  onComplete: () => void;
  onSkip: () => void;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  steps,
  onComplete,
  onSkip,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    updateTargetPosition();
    window.addEventListener('resize', updateTargetPosition);
    return () => {
      window.removeEventListener('resize', updateTargetPosition);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [currentStep]);

  const scrollToTarget = (element: Element) => {
    // Calculer la position pour centrer l'élément à l'écran
    const elementRect = element.getBoundingClientRect();
    const absoluteElementTop = elementRect.top + window.pageYOffset;
    const middle = absoluteElementTop - (window.innerHeight / 2) + (elementRect.height / 2);
    
    // Scroll fluide vers l'élément
    window.scrollTo({
      top: Math.max(0, middle),
      behavior: 'smooth'
    });

    // Attendre que le scroll soit terminé avant de mettre à jour la position
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      updateTargetPosition();
    }, 500); // Délai pour laisser le temps au scroll de se terminer
  };

  const updateTargetPosition = () => {
    const target = document.querySelector(steps[currentStep].target);
    if (target) {
      const rect = target.getBoundingClientRect();
      setTargetRect(rect);
      
      // Sur mobile, vérifier si l'élément est visible
      const isElementVisible = 
        rect.top >= 0 &&
        rect.bottom <= window.innerHeight &&
        rect.left >= 0 &&
        rect.right <= window.innerWidth;
      
      // Si l'élément n'est pas visible sur mobile, scroller vers lui
      if (!isElementVisible && window.innerWidth < 768) {
        scrollToTarget(target);
      }
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!targetRect) return null;

  const step = steps[currentStep];
  const padding = 8;
  const spotlightStyle = {
    left: targetRect.left - padding,
    top: targetRect.top - padding,
    width: targetRect.width + padding * 2,
    height: targetRect.height + padding * 2,
  };

  // Position de la tooltip avec détection intelligente
  const getTooltipPosition = () => {
    const position = step.position || 'bottom';
    const isMobile = window.innerWidth < 768;
    const tooltipStyle: React.CSSProperties = {
      position: 'fixed',
      maxWidth: isMobile ? '90vw' : '320px',
      zIndex: 10002,
    };

    // Sur mobile, privilégier une position qui ne cache pas l'élément
    const spaceBelow = window.innerHeight - targetRect.bottom;
    const spaceAbove = targetRect.top;
    
    // Déterminer automatiquement la meilleure position sur mobile
    let finalPosition = position;
    if (isMobile) {
      if (spaceBelow > 200) {
        finalPosition = 'bottom';
      } else if (spaceAbove > 200) {
        finalPosition = 'top';
      } else {
        // Si pas assez d'espace en haut ou en bas, utiliser le côté
        finalPosition = targetRect.left > window.innerWidth / 2 ? 'left' : 'right';
      }
    }

    switch (finalPosition) {
      case 'top':
        tooltipStyle.left = isMobile ? '5vw' : targetRect.left + targetRect.width / 2;
        tooltipStyle.bottom = window.innerHeight - targetRect.top + 16;
        if (!isMobile) tooltipStyle.transform = 'translateX(-50%)';
        break;
      case 'bottom':
        tooltipStyle.left = isMobile ? '5vw' : targetRect.left + targetRect.width / 2;
        tooltipStyle.top = targetRect.bottom + 16;
        if (!isMobile) tooltipStyle.transform = 'translateX(-50%)';
        break;
      case 'left':
        tooltipStyle.right = window.innerWidth - targetRect.left + 16;
        tooltipStyle.top = targetRect.top + targetRect.height / 2;
        tooltipStyle.transform = 'translateY(-50%)';
        break;
      case 'right':
        tooltipStyle.left = targetRect.right + 16;
        tooltipStyle.top = targetRect.top + targetRect.height / 2;
        tooltipStyle.transform = 'translateY(-50%)';
        break;
    }

    // S'assurer que la tooltip reste dans l'écran sur mobile
    if (isMobile) {
      if (tooltipStyle.top && typeof tooltipStyle.top === 'number') {
        tooltipStyle.top = Math.max(16, Math.min(tooltipStyle.top, window.innerHeight - 250));
      }
      if (tooltipStyle.bottom && typeof tooltipStyle.bottom === 'number') {
        tooltipStyle.bottom = Math.max(16, tooltipStyle.bottom);
      }
    }

    return tooltipStyle;
  };

  return (
    <div className="fixed inset-0 z-[10000]">
      {/* Overlay sombre avec découpe */}
      <div className="absolute inset-0 pointer-events-none">
        <svg width="100%" height="100%" className="absolute inset-0">
          <defs>
            <mask id="spotlight-mask">
              <rect width="100%" height="100%" fill="white" />
              <rect
                x={spotlightStyle.left}
                y={spotlightStyle.top}
                width={spotlightStyle.width}
                height={spotlightStyle.height}
                rx="16"
                fill="black"
              />
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.75)"
            mask="url(#spotlight-mask)"
          />
        </svg>
      </div>

      {/* Bordure lumineuse autour de l'élément */}
      <div
        className="absolute border-4 border-primary rounded-2xl shadow-[0_0_0_4px_rgba(99,102,241,0.2),0_0_20px_rgba(99,102,241,0.4)] animate-pulse-glow transition-all duration-300 pointer-events-none"
        style={spotlightStyle}
      />

      {/* Tooltip avec les instructions */}
      <div
        className="bg-card border-2 border-primary rounded-2xl p-4 sm:p-5 shadow-elevated animate-in fade-in slide-in-from-bottom-4 duration-300"
        style={getTooltipPosition()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-primary">
                Étape {currentStep + 1} sur {steps.length}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-foreground">{step.title}</h3>
          </div>
          <button
            onClick={onSkip}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 touch-manipulation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{step.description}</p>

        {/* Progress bar */}
        <div className="h-1 bg-muted rounded-full mb-4 overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="text-muted-foreground touch-manipulation text-xs sm:text-sm px-2 sm:px-3"
          >
            <ChevronLeft className="w-4 h-4 sm:mr-1" />
            <span className="hidden sm:inline">Précédent</span>
          </Button>

          <div className="flex gap-1">
            {steps.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  index === currentStep
                    ? "bg-primary w-4 sm:w-6"
                    : "bg-muted"
                )}
              />
            ))}
          </div>

          <Button
            size="sm"
            onClick={handleNext}
            className="gradient-primary text-white touch-manipulation text-xs sm:text-sm px-2 sm:px-3"
          >
            {currentStep === steps.length - 1 ? 'Terminer' : 'Suivant'}
            <ChevronRight className="w-4 h-4 sm:ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};