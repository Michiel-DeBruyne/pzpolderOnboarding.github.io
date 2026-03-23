import React from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  Plus, 
  Clock, 
  Edit2, 
  Trash2, 
  ClipboardList 
} from 'lucide-react';
import { doc, deleteDoc } from 'firebase/firestore';
import { format, isBefore, parseISO, startOfDay } from 'date-fns';
import { nl } from 'date-fns/locale';
import { db } from '../lib/firebase';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';
import { Employee, Task, Department, UserProfile } from '../types';

interface EmployeeDetailProps {
  employee: Employee;
  tasks: Task[];
  taskFilter: 'all' | 'pending' | 'completed';
  setTaskFilter: (filter: 'all' | 'pending' | 'completed') => void;
  toggleTask: (task: Task) => void;
  setIsAddingTask: (open: boolean) => void;
  setEditingTask: (task: Task | null) => void;
  requestConfirm: (title: string, message: string, onConfirm: () => void) => void;
  onClose: () => void;
  departments: Department[];
  profile: UserProfile | null;
}

export const EmployeeDetail: React.FC<EmployeeDetailProps> = ({
  employee,
  tasks,
  taskFilter,
  setTaskFilter,
  toggleTask,
  setIsAddingTask,
  setEditingTask,
  requestConfirm,
  onClose,
  departments,
  profile
}) => {
  const canUserCompleteTask = (task: Task) => {
    if (profile?.role === 'superuser') return true;
    if (!profile?.departmentId) return false;
    return task.departmentId === profile.departmentId || task.departmentId === 'default';
  };
  return (
    <motion.div 
      key="checklist"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-4xl mx-auto"
    >
      <button 
        onClick={onClose}
        className="text-zinc-500 hover:text-zinc-900 mb-6 flex items-center gap-2 text-sm font-medium"
      >
        ← Terug naar overzicht
      </button>
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{employee.name}</h1>
          <div className="flex items-center gap-3">
            <span className="px-2 py-1 bg-zinc-100 text-zinc-600 rounded-lg text-xs font-bold uppercase tracking-wider">
              {employee.status}
            </span>
            <span className="text-zinc-400">•</span>
            <span className="text-zinc-500 text-sm">{employee.reason}</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-sm text-zinc-500 mb-1">Voortgang</p>
            <div className="flex items-center gap-3">
              <div className="w-32 h-2 bg-zinc-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-zinc-900 transition-all duration-500" 
                  style={{ width: `${tasks.length ? (tasks.filter(t => t.isCompleted).length / tasks.length) * 100 : 0}%` }}
                />
              </div>
              <span className="text-sm font-bold">
                {tasks.filter(t => t.isCompleted).length}/{tasks.length}
              </span>
            </div>
          </div>
          <Button onClick={() => setIsAddingTask(true)}>
            <Plus className="w-4 h-4" /> Taak Toevoegen
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6">
        {(['all', 'pending', 'completed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setTaskFilter(f)}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all",
              taskFilter === f 
                ? "bg-zinc-900 text-white shadow-lg shadow-zinc-900/20" 
                : "bg-white text-zinc-400 hover:text-zinc-600 border border-zinc-100"
            )}
          >
            {f === 'all' ? 'Alle Taken' : f === 'pending' ? 'Openstaand' : 'Voltooid'}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {tasks.map(task => (
          <Card key={task.id} className={cn("transition-all", task.isCompleted && "opacity-60")}>
            <div className="p-5 flex items-start gap-4">
              <button 
                onClick={() => toggleTask(task)}
                disabled={!canUserCompleteTask(task)}
                className={cn(
                  "mt-1 w-6 h-6 rounded-full flex items-center justify-center transition-colors",
                  task.isCompleted ? "bg-green-500 text-white" : "border-2 border-zinc-200 text-transparent hover:border-zinc-400",
                  !canUserCompleteTask(task) && "opacity-30 cursor-not-allowed"
                )}
                title={!canUserCompleteTask(task) ? "U heeft geen rechten om taken van deze dienst af te vinken" : ""}
              >
                <CheckCircle2 className="w-4 h-4" />
              </button>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <h3 className={cn("font-bold", task.isCompleted && "line-through")}>{task.title}</h3>
                    {task.isPrerequisite && (
                      <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[8px] font-bold uppercase tracking-wider rounded">Vereist</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {task.dueDate && !task.isCompleted && (
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md flex items-center gap-1",
                        isBefore(parseISO(task.dueDate), startOfDay(new Date())) 
                          ? "bg-red-50 text-red-500" 
                          : "bg-zinc-50 text-zinc-400"
                      )}>
                        <Clock className="w-3 h-3" />
                        {task.dueDate}
                      </span>
                    )}
                    {task.departmentId !== 'default' && (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 bg-zinc-100 px-2 py-1 rounded-md">
                        {departments.find(d => d.id === task.departmentId)?.name || 'Onbekende Dienst'}
                      </span>
                    )}
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 bg-zinc-50 px-2 py-1 rounded-md">
                      {task.category}
                    </span>
                    <button 
                      onClick={() => setEditingTask(task)}
                      className="text-zinc-300 hover:text-zinc-900 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={async () => {
                        requestConfirm(
                          'Taak verwijderen',
                          'Weet u zeker dat u deze taak wilt verwijderen?',
                          () => deleteDoc(doc(db, `employees/${employee.id}/tasks`, task.id))
                        );
                      }}
                      className="text-zinc-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-zinc-500 mb-3">{task.description}</p>
                <div className="flex flex-wrap items-center gap-4">
                  {task.docLink && (
                    <a 
                      href={task.docLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 hover:underline"
                    >
                      <ClipboardList className="w-3.5 h-3.5" />
                      Documentatie
                    </a>
                  )}
                  {task.isCompleted && (
                    <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-medium">
                      <CheckCircle2 className="w-3 h-3" />
                      Voltooid door {task.completedBy} {task.completedAt?.toDate ? `op ${format(task.completedAt.toDate(), 'dd MMM yyyy HH:mm', { locale: nl })}` : ''}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
        {tasks.length === 0 && (
          <div className="text-center py-20 bg-white border border-dashed border-zinc-200 rounded-3xl">
            <ClipboardList className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
            <p className="text-zinc-400">Geen taken gevonden voor deze medewerker.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
