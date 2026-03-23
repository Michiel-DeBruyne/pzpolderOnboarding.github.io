import React from 'react';
import { motion } from 'motion/react';
import { Building2, Plus, Edit2, Trash2, Mail } from 'lucide-react';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Department, UserProfile } from '../types';

interface DepartmentsProps {
  departments: Department[];
  setIsAddingDepartment: (open: boolean) => void;
  setEditingDepartment: (dept: Department) => void;
  requestConfirm: (title: string, message: string, onConfirm: () => void) => void;
  profile: UserProfile | null;
}

export const Departments: React.FC<DepartmentsProps> = ({
  departments,
  setIsAddingDepartment,
  setEditingDepartment,
  requestConfirm,
  profile
}) => {
  const isSuperuser = profile?.role === 'superuser';

  return (
    <motion.div 
      key="departments"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Diensten</h1>
          <p className="text-zinc-500 mt-1">Beheer de verschillende afdelingen en hun contactgegevens.</p>
        </div>
        {isSuperuser && (
          <Button onClick={() => setIsAddingDepartment(true)}>
            <Plus className="w-4 h-4" /> Dienst Toevoegen
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map(dept => (
          <Card key={dept.id} className="group hover:border-zinc-400 transition-all">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                  <Building2 className="w-5 h-5" />
                </div>
                {isSuperuser && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => setEditingDepartment(dept)}
                      className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => {
                        requestConfirm(
                          'Dienst verwijderen',
                          'Weet u zeker dat u deze dienst wilt verwijderen? Dit kan invloed hebben op taken en gebruikers die aan deze dienst zijn gekoppeld.',
                          () => deleteDoc(doc(db, 'departments', dept.id))
                        );
                      }}
                      className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              
              <h3 className="text-lg font-bold mb-2">{dept.name}</h3>
              
              {dept.defaultEmail ? (
                <div className="flex items-center gap-2 text-sm text-zinc-500">
                  <Mail className="w-4 h-4" />
                  {dept.defaultEmail}
                </div>
              ) : (
                <p className="text-sm text-zinc-400 italic">Geen standaard email ingesteld</p>
              )}
            </div>
          </Card>
        ))}
      </div>

      {departments.length === 0 && (
        <div className="text-center py-40 bg-white border border-dashed border-zinc-200 rounded-3xl">
          <Building2 className="w-16 h-16 text-zinc-200 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-zinc-400">Geen diensten gevonden</h2>
          <p className="text-zinc-400">Begin door een nieuwe dienst toe te voegen.</p>
        </div>
      )}
    </motion.div>
  );
};
