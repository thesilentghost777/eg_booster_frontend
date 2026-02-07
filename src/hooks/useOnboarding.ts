import { useState, useEffect } from 'react';

const ONBOARDING_KEY = 'app_onboarding_completed';

export const useOnboarding = () => {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà complété le tutoriel
    const completed = localStorage.getItem(ONBOARDING_KEY);
    setIsOnboardingComplete(completed === 'true');
    setIsLoading(false);
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setIsOnboardingComplete(true);
  };

  const resetOnboarding = () => {
    localStorage.removeItem(ONBOARDING_KEY);
    setIsOnboardingComplete(false);
  };

  return {
    isOnboardingComplete,
    isLoading,
    completeOnboarding,
    resetOnboarding,
  };
};