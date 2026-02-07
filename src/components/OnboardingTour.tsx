import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    updateTargetPosition();
    window.addEventListener('resize', updateTargetPosition);
    return () => window.removeEventListener('resize', updateTargetPosition);
  }, [currentStep]);

  const updateTargetPosition = () => {
    const target = document.querySelector(steps[currentStep].target);
    if (target) {
      setTargetRect(target.getBoundingClientRect());
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

  // Position de la tooltip
  const getTooltipPosition = () => {
    const position = step.position || 'bottom';
    const tooltipStyle: React.CSSProperties = {
      position: 'fixed',
      maxWidth: '320px',
      zIndex: 10002,
    };

    switch (position) {
      case 'top':
        tooltipStyle.left = targetRect.left + targetRect.width / 2;
        tooltipStyle.bottom = window.innerHeight - targetRect.top + 16;
        tooltipStyle.transform = 'translateX(-50%)';
        break;
      case 'bottom':
        tooltipStyle.left = targetRect.left + targetRect.width / 2;
        tooltipStyle.top = targetRect.bottom + 16;
        tooltipStyle.transform = 'translateX(-50%)';
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

    return tooltipStyle;
  };

  return (
    <div className="fixed inset-0 z-[10000]">
      {/* Overlay sombre avec découpe */}
      <div className="absolute inset-0">
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
        className="absolute border-4 border-primary rounded-2xl shadow-[0_0_0_4px_rgba(99,102,241,0.2),0_0_20px_rgba(99,102,241,0.4)] animate-pulse-glow transition-all duration-300"
        style={spotlightStyle}
      />

      {/* Tooltip avec les instructions */}
      <div
        className="bg-card border-2 border-primary rounded-2xl p-5 shadow-elevated animate-in fade-in slide-in-from-bottom-4 duration-300"
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
            <h3 className="text-lg font-bold text-foreground">{step.title}</h3>
          </div>
          <button
            onClick={onSkip}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-4">{step.description}</p>

        {/* Progress bar */}
        <div className="h-1 bg-muted rounded-full mb-4 overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="text-muted-foreground"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Précédent
          </Button>

          <div className="flex gap-1">
            {steps.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  index === currentStep
                    ? "bg-primary w-6"
                    : "bg-muted"
                )}
              />
            ))}
          </div>

          <Button
            size="sm"
            onClick={handleNext}
            className="gradient-primary text-white"
          >
            {currentStep === steps.length - 1 ? 'Terminer' : 'Suivant'}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};