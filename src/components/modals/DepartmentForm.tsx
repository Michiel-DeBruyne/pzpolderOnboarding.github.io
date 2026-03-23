import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Department } from '../../types';

interface DepartmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Department>) => void;
  editingDepartment: Department | null;
}

export const DepartmentForm: React.FC<DepartmentFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingDepartment
}) => {
  const [name, setName] = useState('');
  const [defaultEmail, setDefaultEmail] = useState('');

  useEffect(() => {
    if (editingDepartment) {
      setName(editingDepartment.name);
      setDefaultEmail(editingDepartment.defaultEmail || '');
    } else {
      setName('');
      setDefaultEmail('');
    }
  }, [editingDepartment, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-900"
        >
          <X className="w-5 h-5" />
        </button>
        
        <h2 className="text-2xl font-bold mb-6">
          {editingDepartment ? 'Dienst Bewerken' : 'Nieuwe Dienst'}
        </h2>
        
        <form onSubmit={(e) => {
          e.preventDefault();
          onSubmit({ name, defaultEmail });
        }} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
              Naam Dienst
            </label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
              placeholder="Bijv. IT, HR, Marketing"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
              Standaard Email (Optioneel)
            </label>
            <input 
              type="email" 
              value={defaultEmail}
              onChange={(e) => setDefaultEmail(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
              placeholder="it@bedrijf.nl"
            />
            <p className="text-[10px] text-zinc-400 mt-2">
              Dit emailadres wordt gebruikt voor meldingen over taken van deze dienst.
            </p>
          </div>

          <div className="pt-4 flex gap-3">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
              Annuleren
            </Button>
            <Button type="submit" className="flex-1">
              {editingDepartment ? 'Opslaan' : 'Toevoegen'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
