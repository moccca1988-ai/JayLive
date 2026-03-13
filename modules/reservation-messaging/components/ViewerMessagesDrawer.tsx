'use client';

import { motion, AnimatePresence } from 'motion/react';
import { X, MessageSquare } from 'lucide-react';
import ReservationMessages from './ReservationMessages';

interface ViewerMessagesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ViewerMessagesDrawer({ isOpen, onClose }: ViewerMessagesDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[150] pointer-events-auto"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-md glass-card z-[160] shadow-2xl border-l border-white/5 flex flex-col pointer-events-auto rounded-none"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-7 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#7C6CFF]/10 rounded-xl flex items-center justify-center border border-[#7C6CFF]/20">
                  <MessageSquare size={20} className="text-[#7C6CFF]" />
                </div>
                <h2 className="text-xl font-black text-white tracking-tight">Messages</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-all text-white/40 hover:text-white cursor-pointer active:scale-90"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-7">
              <ReservationMessages role="viewer" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
