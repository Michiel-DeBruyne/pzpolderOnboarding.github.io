import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { TemplateTask } from '../../types';

interface TemplateTaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingTask: TemplateTask | null;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export const TemplateTaskForm: React.FC<TemplateTaskFormProps> = ({
  isOpen,
  onClose,
  editingTask,
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
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-6">{editingTask ? 'Bewerk Sjabloon Taak' : 'Nieuwe Sjabloon Taak'}</h2>
              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">Titel</label>
                  <Input name="title" required placeholder="Bijv. Laptop aanvragen" defaultValue={editingTask?.title} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">Type</label>
                  <select name="type" defaultValue={editingTask?.type || 'onboarding'} className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10">
                    <option value="onboarding">Onboarding</option>
                    <option value="offboarding">Offboarding</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">Deadline (Dagen)</label>
                    <Input 
                      type="number" 
                      name="relativeDueDate" 
                      placeholder="Bijv. 7" 
                      defaultValue={(editingTask?.relativeDueDate === null || editingTask?.relativeDueDate === undefined || isNaN(editingTask.relativeDueDate)) ? '' : editingTask.relativeDueDate}
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">Categorie</label>
                    <select name="category" defaultValue={editingTask?.category || 'Hardware'} className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10">
                      <option value="Account">Account</option>
                      <option value="Hardware">Hardware</option>
                      <option value="Software">Software</option>
                      <option value="Toegang">Toegang</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">Omschrijving</label>
                  <textarea name="description" rows={3} defaultValue={editingTask?.description} className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-zinc-900/10" />
                </div>
                <div className="flex items-center gap-2 p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                  <input type="checkbox" name="isPrerequisite" defaultChecked={editingTask?.isPrerequisite} className="w-4 h-4 accent-zinc-900" />
                  <span className="text-sm font-medium">Markeer als vereiste taak</span>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
                    Annuleren
                  </Button>
                  <Button type="submit" className="flex-1">
                    {editingTask ? 'Opslaan' : 'Toevoegen'}
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
