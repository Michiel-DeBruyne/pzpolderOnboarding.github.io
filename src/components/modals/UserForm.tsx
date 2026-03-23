import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { UserProfile, Department } from '../../types';

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingUser: UserProfile | null;
  departments: Department[];
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export const UserForm: React.FC<UserFormProps> = ({
  isOpen,
  onClose,
  editingUser,
  departments,
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
              <h2 className="text-2xl font-bold mb-6">{editingUser ? 'Bewerk Gebruiker' : 'Nieuwe Gebruiker'}</h2>
              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">Naam</label>
                  <Input name="name" required placeholder="Bijv. Jan de Vries" defaultValue={editingUser?.name} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">Email</label>
                  <Input name="email" type="email" required placeholder="jan@gemeente.nl" defaultValue={editingUser?.email} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">Rol</label>
                    <select name="role" defaultValue={editingUser?.role || 'user'} className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10">
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="superuser">Superuser</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">Dienst</label>
                    <select name="departmentId" defaultValue={editingUser?.departmentId || 'default'} className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10">
                      <option value="default">Geen</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
                    Annuleren
                  </Button>
                  <Button type="submit" className="flex-1">
                    {editingUser ? 'Opslaan' : 'Toevoegen'}
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
