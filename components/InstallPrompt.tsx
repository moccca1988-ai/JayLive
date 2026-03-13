'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download } from 'lucide-react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (isDismissed) {
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-[100] bg-[#141414] border border-white/10 rounded-[24px] shadow-2xl p-5 flex flex-col gap-4 backdrop-blur-xl"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 border border-white/5">
              <Download size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-[17px] tracking-tight mb-1">
                Jetzt installieren
              </h3>
              <p className="text-gray-400 text-[14px] leading-snug">
                Installiere Jay Jaym Live für schnelleren Zugriff direkt auf deinem Homescreen.
              </p>
            </div>
          </div>

          <div className="flex gap-3 mt-1">
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
              Jetzt installieren
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
