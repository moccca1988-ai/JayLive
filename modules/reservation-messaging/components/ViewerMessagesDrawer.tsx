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
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[#141414] z-[160] shadow-2xl border-l border-white/10 flex flex-col pointer-events-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-2">
                <MessageSquare size={20} className="text-white" />
                <h2 className="text-xl font-bold text-white tracking-tight">Messages</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2.5 bg-white/5 rounded-full hover:bg-white/10 transition-colors text-white/70 hover:text-white cursor-pointer active:scale-95"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-6">
              <ReservationMessages role="viewer" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
