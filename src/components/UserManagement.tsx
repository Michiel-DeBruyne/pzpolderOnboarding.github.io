import React from 'react';
import { motion } from 'motion/react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { doc, deleteDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db } from '../lib/firebase';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';
import { UserProfile, Department } from '../types';

interface UserManagementProps {
  allUsers: UserProfile[];
  setIsAddingUser: (open: boolean) => void;
  setEditingUser: (user: UserProfile) => void;
  departments: Department[];
  profile: UserProfile | null;
  requestConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({
  allUsers,
  setIsAddingUser,
  setEditingUser,
  departments,
  profile,
  requestConfirm
}) => {
  return (
    <motion.div 
      key="users"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gebruikersbeheer</h1>
          <p className="text-zinc-500 mt-1">Beheer beheerders en hun rollen/afdelingen.</p>
        </div>
        <Button onClick={() => setIsAddingUser(true)}>
          <Plus className="w-4 h-4" /> Gebruiker Toevoegen
        </Button>
      </div>
      
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100">
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Naam</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Email</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Rol</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Dienst</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-400 text-right">Acties</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.map(u => (
                <tr key={u.id} className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50/50 transition-colors">
                  <td className="p-4 font-medium">{u.name}</td>
                  <td className="p-4 text-zinc-500">{u.email}</td>
                  <td className="p-4">
                    <span className={cn(
                      "px-2 py-1 rounded-md text-[10px] font-bold uppercase",
                      u.role === 'superuser' ? "bg-purple-100 text-purple-600" : 
                      u.role === 'admin' ? "bg-blue-100 text-blue-600" : "bg-zinc-100 text-zinc-600"
                    )}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 text-zinc-500">
                    {departments.find(d => d.id === u.departmentId)?.name || 'Geen'}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setEditingUser(u)}
                        className="p-2 text-zinc-300 hover:text-zinc-900 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {u.id !== profile?.id && (
                        <button 
                          onClick={() => {
                            requestConfirm(
                              'Gebruiker verwijderen',
                              'Weet u zeker dat u deze gebruiker wilt verwijderen?',
                              () => deleteDoc(doc(db, 'users', u.id))
                            );
                          }}
                          className="p-2 text-zinc-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </motion.div>
  );
};
