import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function WelcomePage() {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(44755);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => prev <= 0 ? 0 : prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  
  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;
  const formatTime = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm space-y-12">
        {/* Logo */}
        <div className="text-center">
          <h1 className="text-5xl font-bold text-black dark:text-white mb-3">
            EG Booster
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Boostez vos réseaux sociaux
          </p>
          {/* Social icons */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="w-10 h-10 rounded-full bg-black dark:bg-white flex items-center justify-center">
              <svg className="w-5 h-5 text-white dark:text-black" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
            </div>
            <div className="w-10 h-10 rounded-full bg-black dark:bg-white flex items-center justify-center">
              <svg className="w-5 h-5 text-white dark:text-black" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </div>
            <div className="w-10 h-10 rounded-full bg-black dark:bg-white flex items-center justify-center">
              <svg className="w-5 h-5 text-white dark:text-black" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </div>
            <div className="w-10 h-10 rounded-full bg-black dark:bg-white flex items-center justify-center">
              <svg className="w-5 h-5 text-white dark:text-black" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Timer */}
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Offre limitée
          </p>
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="text-center">
              <p className="text-4xl font-bold text-black dark:text-white tabular-nums">
                {formatTime(hours)}
              </p>
              <p className="text-xs text-gray-400 mt-1">h</p>
            </div>
            <span className="text-2xl text-gray-300 dark:text-gray-700">:</span>
            <div className="text-center">
              <p className="text-4xl font-bold text-black dark:text-white tabular-nums">
                {formatTime(minutes)}
              </p>
              <p className="text-xs text-gray-400 mt-1">min</p>
            </div>
            <span className="text-2xl text-gray-300 dark:text-gray-700">:</span>
            <div className="text-center">
              <p className="text-4xl font-bold text-black dark:text-white tabular-nums">
                {formatTime(seconds)}
              </p>
              <p className="text-xs text-gray-400 mt-1">s</p>
            </div>
          </div>

          {/* Offer */}
          <div className="bg-black dark:bg-white text-white dark:text-black rounded-2xl p-8 mb-8">
            <p className="text-sm opacity-70 mb-2">Inscrivez-vous maintenant</p>
            <p className="text-5xl font-bold mb-2">1000</p>
            <p className="text-lg font-semibold">vues gratuites</p>
          </div>

          {/* CTA */}
          <Button
            onClick={() => navigate('/register')}
            className="w-full h-14 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-xl hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all text-base animate-pulse"
            style={{ animationDuration: '2s' }}
          >
            Commencer
          </Button>
        </div>

        {/* Features */}
        <div className="space-y-4">
          <div className="text-center py-4 border-t border-b border-gray-100 dark:border-gray-900">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Vues • Abonnés • Likes
            </p>
          </div>
          <div className="text-center py-4 border-b border-gray-100 dark:border-gray-900">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              TikTok • Instagram • YouTube
            </p>
          </div>
        </div>

        {/* Login */}
        <div className="text-center">
          <button 
            onClick={() => navigate('/login')}
            className="text-sm text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-all hover:scale-105 font-medium"
          >
            Déjà inscrit ? Se connecter
          </button>
        </div>

        {/* Trust */}
        <div className="flex items-center justify-center gap-8 text-xs text-gray-400">
          <span>+10K utilisateurs</span>
          <span>•</span>
          <span>Livraison rapide</span>
        </div>
      </div>
    </div>
  );
}