import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Employee, Task } from '../../types';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  selectedEmployee: Employee | null;
  editingTask: Task | null;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  isOpen,
  onClose,
  selectedEmployee,
  editingTask,
  onSubmit
}) => {
  if (!selectedEmployee && !editingTask) return null;

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
              <h2 className="text-2xl font-bold mb-6">{editingTask ? 'Bewerk Taak' : 'Nieuwe Taak'}</h2>
              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">Titel</label>
                  <Input name="title" required placeholder="Bijv. Toegang tot CRM" defaultValue={editingTask?.title} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">Documentatie Link</label>
                  <Input name="docLink" placeholder="https://..." defaultValue={editingTask?.docLink} />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">Deadline Type</label>
                  <div className="flex gap-4 mt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="dateType" 
                        value="relative" 
                        defaultChecked={editingTask ? editingTask.dateType === 'relative' : true} 
                        className="w-4 h-4 accent-zinc-900" 
                      />
                      <span className="text-sm">Relatief</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="dateType" 
                        value="fixed" 
                        defaultChecked={editingTask?.dateType === 'fixed'} 
                        className="w-4 h-4 accent-zinc-900" 
                      />
                      <span className="text-sm">Vaste Datum</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">Deadline</label>
                    <div className="relative">
                      <Input 
                        type="number" 
                        name="relativeDueDate" 
                        placeholder="Dagen" 
                        defaultValue={(editingTask?.relativeDueDate === null || editingTask?.relativeDueDate === undefined || isNaN(editingTask.relativeDueDate)) ? '' : editingTask.relativeDueDate}
                        className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none block w-full" 
                      />
                      <Input 
                        type="date" 
                        name="dueDate" 
                        defaultValue={editingTask?.dueDate || ''}
                        className="absolute inset-0 opacity-0 pointer-events-none focus:opacity-100 focus:pointer-events-auto transition-opacity" 
                      />
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-1">Vul dagen in voor relatief, of kies datum voor vast.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">Notificatie E-mail</label>
                    <Input type="email" name="notificationEmail" placeholder="beheerder@gemeente.nl" defaultValue={editingTask?.notificationEmail} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">Categorie</label>
                  <select name="category" defaultValue={editingTask?.category || 'Account'} className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10">
                    <option value="Account">Account</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Software">Software</option>
                    <option value="Toegang">Toegang</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">Omschrijving</label>
                  <textarea name="description" rows={3} defaultValue={editingTask?.description} className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-zinc-900/10" />
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
