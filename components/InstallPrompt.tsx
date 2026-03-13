'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Share, PlusSquare, X } from 'lucide-react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone 
      || document.referrer.includes('android-app://');
    
    // Check if iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsStandalone(isStandaloneMode);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsIOS(isIOSDevice);

    const isDismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (isDismissed || isStandaloneMode) {
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    // For iOS, we show the prompt after a short delay if not dismissed
    if (isIOSDevice && !isStandaloneMode) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      return () => clearTimeout(timer);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      // iOS doesn't support native prompt, we just show instructions (which are already visible)
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setShowPrompt(false);
    }
    
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  if (!showPrompt || isStandalone) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-[200] bg-[#141414] border border-white/10 rounded-[24px] shadow-2xl p-5 flex flex-col gap-4 backdrop-blur-xl"
      >
        <button 
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-1 text-white/40 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
            <Download size={24} className="text-white" />
          </div>
          <div className="pr-6">
            <h3 className="text-white font-semibold text-[17px] tracking-tight mb-1">
              {isIOS ? 'App installieren' : 'Jetzt installieren'}
            </h3>
            <p className="text-gray-400 text-[14px] leading-snug">
              {isIOS 
                ? "Tippe auf Teilen und dann auf &apos;Zum Home-Bildschirm&apos;, um Jay Jaym Live auf deinem Gerät zu installieren."
                : "Installiere Jay Jaym Live für schnelleren Zugriff direkt auf deinem Homescreen."
              }
            </p>
          </div>
        </div>

        {isIOS ? (
          <div className="flex flex-col gap-3 bg-white/5 rounded-2xl p-4 border border-white/5">
            <div className="flex items-center gap-3 text-white/80 text-sm">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <Share size={16} />
              </div>
              <span>1. Tippe auf das &apos;Teilen&apos;-Symbol</span>
            </div>
            <div className="flex items-center gap-3 text-white/80 text-sm">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <PlusSquare size={16} />
              </div>
              <span>2. Wähle &apos;Zum Home-Bildschirm&apos;</span>
            </div>
            <button
              onClick={handleDismiss}
              className="w-full mt-2 py-3 px-4 rounded-xl font-medium text-[15px] text-white bg-indigo-500 hover:bg-indigo-600 transition-colors"
            >
              Verstanden
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={handleDismiss}
              className="flex-1 py-3 px-4 rounded-xl font-medium text-[15px] text-white/70 bg-white/5 hover:bg-white/10 transition-colors"
            >
              Später
            </button>
            <button
              onClick={handleInstall}
              className="flex-1 py-3 px-4 rounded-xl font-medium text-[15px] text-white bg-indigo-500 hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/20"
            >
              Installieren
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
