import React from 'react';
import { motion } from 'motion/react';
import { Users, Trash2, ChevronRight } from 'lucide-react';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Card } from './ui/Card';
import { cn } from '../lib/utils';
import { Employee, UserProfile } from '../types';

interface EmployeeListProps {
  employees: Employee[];
  setSelectedEmployee: (emp: Employee) => void;
  dashboardFilter: 'all' | 'onboarding' | 'offboarding';
  setDashboardFilter: (filter: 'all' | 'onboarding' | 'offboarding') => void;
  profile: UserProfile | null;
  requestConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

export const EmployeeList: React.FC<EmployeeListProps> = ({
  employees,
  setSelectedEmployee,
  dashboardFilter,
  setDashboardFilter,
  profile,
  requestConfirm
}) => {
  return (
    <motion.div 
      key="list"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Overzicht</h1>
        <div className="flex items-center gap-2 bg-white border border-zinc-200 p-1 rounded-xl">
          {(['all', 'onboarding', 'offboarding'] as const).map((f) => (
            <button 
              key={f}
              onClick={() => setDashboardFilter(f)}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-lg transition-colors",
                dashboardFilter === f ? "bg-zinc-900 text-white" : "text-zinc-500 hover:text-zinc-900"
              )}
            >
              {f === 'all' ? 'Alle' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map(emp => (
          <Card key={emp.id} className="group hover:border-zinc-400 transition-all cursor-pointer relative" >
            <div className="p-6" onClick={() => setSelectedEmployee(emp)}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                  <Users className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-2">
                  {profile?.role === 'superuser' && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        requestConfirm(
                          'Medewerker verwijderen',
                          'Weet u zeker dat u deze medewerker wilt verwijderen?',
                          () => deleteDoc(doc(db, 'employees', emp.id))
                        );
                      }}
                      className="p-2 text-zinc-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-zinc-900 transition-colors" />
                </div>
              </div>
              <h3 className="text-lg font-bold mb-1">{emp.name}</h3>
              <p className="text-sm text-zinc-500 mb-4">{emp.reason}</p>
              <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                  {emp.status}
                </span>
                <span className="text-xs text-zinc-400">
                  {emp.startDate}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      {employees.length === 0 && (
        <div className="text-center py-40">
          <Users className="w-16 h-16 text-zinc-200 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-zinc-400">Geen medewerkers gevonden</h2>
          <p className="text-zinc-400">Begin door een nieuwe medewerker toe te voegen.</p>
        </div>
      )}
    </motion.div>
  );
};
