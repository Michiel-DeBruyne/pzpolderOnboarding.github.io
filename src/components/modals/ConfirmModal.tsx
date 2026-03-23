import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/Button';

interface ConfirmModalProps {
  confirmation: { title: string; message: string; onConfirm: () => void } | null;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  confirmation,
  onClose
}) => {
  return (
    <AnimatePresence>
      {confirmation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-zinc-900/60 backdrop-blur-md"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8 text-center"
          >
            <h3 className="text-xl font-bold mb-2">{confirmation.title}</h3>
            <p className="text-zinc-500 text-sm mb-8 leading-relaxed">{confirmation.message}</p>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={onClose}>
                Annuleren
              </Button>
              <Button 
                className="flex-1 bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20" 
                onClick={() => {
                  confirmation.onConfirm();
                  onClose();
                }}
              >
                Bevestigen
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
