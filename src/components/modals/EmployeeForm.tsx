import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Department } from '../../types';

interface EmployeeFormProps {
  isOpen: boolean;
  onClose: () => void;
  departments: Department[];
  aiEnabled: boolean;
  aiLoading: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export const EmployeeForm: React.FC<EmployeeFormProps> = ({
  isOpen,
  onClose,
  departments,
  aiEnabled,
  aiLoading,
  onSubmit
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-6">Nieuwe Medewerker</h2>
              <form onSubmit={onSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-2">Naam</label>
                    <Input name="name" placeholder="Bijv. Jan de Vries" required />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">E-mail Medewerker</label>
                    <Input name="email" type="email" placeholder="jan@gemeente.nl" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-2">Type</label>
                    <select name="status" className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10">
                      <option value="onboarding">Onboarding</option>
                      <option value="offboarding">Offboarding</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Dienst</label>
                    <select name="deptId" className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10">
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      {departments.length === 0 && <option value="default">Algemeen</option>}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Functie / Scenario</label>
                  <Input name="role" placeholder="Bijv. Software Engineer" required />
                </div>
                
                <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">AI Checklist</p>
                      <p className="text-xs text-zinc-500">Genereer taken met Gemini 3 Flash</p>
                    </div>
                  </div>
                  <input type="checkbox" name="useAI" defaultChecked={aiEnabled} className="w-5 h-5 accent-zinc-900" />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
                    Annuleren
                  </Button>
                  <Button type="submit" className="flex-1" disabled={aiLoading}>
                    {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Toevoegen"}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
