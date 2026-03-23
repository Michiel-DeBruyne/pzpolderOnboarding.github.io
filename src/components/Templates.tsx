import React from 'react';
import { motion } from 'motion/react';
import { Plus, LogOut, Edit2, Trash2 } from 'lucide-react';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { TemplateTask } from '../types';

interface TemplatesProps {
  templateTasks: TemplateTask[];
  setEditingTemplateTask: (task: TemplateTask) => void;
  setIsAddingTemplateTask: (open: boolean) => void;
  requestConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

export const Templates: React.FC<TemplatesProps> = ({
  templateTasks,
  setEditingTemplateTask,
  setIsAddingTemplateTask,
  requestConfirm
}) => {
  return (
    <motion.div 
      key="templates"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Sjablonen</h1>
        <Button onClick={() => setIsAddingTemplateTask(true)}>
          <Plus className="w-4 h-4" /> Nieuwe Taak
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-green-500" /> Onboarding Taken
          </h3>
          <div className="space-y-3">
            {templateTasks.filter(t => t.type === 'onboarding').map(task => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold">{task.title}</p>
                    {task.isPrerequisite && (
                      <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[8px] font-bold uppercase tracking-wider rounded">Vereist</span>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-400 uppercase tracking-wider">{task.category}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setEditingTemplateTask(task)}
                    className="text-zinc-300 hover:text-zinc-900 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => {
                      requestConfirm(
                        'Sjabloon taak verwijderen',
                        'Weet u zeker dat u deze sjabloon taak wilt verwijderen?',
                        () => deleteDoc(doc(db, 'templateTasks', task.id))
                      );
                    }}
                    className="text-zinc-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <LogOut className="w-4 h-4 text-red-500" /> Offboarding Taken
          </h3>
          <div className="space-y-3">
            {templateTasks.filter(t => t.type === 'offboarding').map(task => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold">{task.title}</p>
                    {task.isPrerequisite && (
                      <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[8px] font-bold uppercase tracking-wider rounded">Vereist</span>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-400 uppercase tracking-wider">{task.category}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setEditingTemplateTask(task)}
                    className="text-zinc-300 hover:text-zinc-900 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => {
                      requestConfirm(
                        'Sjabloon taak verwijderen',
                        'Weet u zeker dat u deze sjabloon taak wilt verwijderen?',
                        () => deleteDoc(doc(db, 'templateTasks', task.id))
                      );
                    }}
                    className="text-zinc-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </motion.div>
  );
};
