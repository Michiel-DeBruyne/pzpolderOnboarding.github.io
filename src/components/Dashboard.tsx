import React from 'react';
import { motion } from 'motion/react';
import { Card } from './ui/Card';
import { Employee, Department } from '../types';

interface DashboardProps {
  employees: Employee[];
  departments: Department[];
  setView: (view: any) => void;
  setDashboardFilter: (filter: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ employees, departments, setView, setDashboardFilter }) => {
  return (
    <motion.div 
      key="dashboard"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <p className="text-sm text-zinc-500 mb-1">Totaal Medewerkers</p>
          <h3 className="text-3xl font-bold">{employees.length}</h3>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-zinc-500 mb-1">Actieve Onboarding</p>
          <h3 className="text-3xl font-bold">{employees.filter(e => e.status === 'onboarding').length}</h3>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-zinc-500 mb-1">Actieve Offboarding</p>
          <h3 className="text-3xl font-bold">{employees.filter(e => e.status === 'offboarding').length}</h3>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <h3 className="font-bold mb-4">Recente Activiteit</h3>
          <div className="space-y-4">
            {employees.slice(0, 5).map(emp => (
              <div key={emp.id} className="flex items-center justify-between py-2 border-b border-zinc-50 last:border-0">
                <div>
                  <p className="font-medium text-sm">{emp.name}</p>
                  <p className="text-xs text-zinc-400">{emp.reason}</p>
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-1 bg-zinc-100 rounded-md">
                  {emp.status}
                </span>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="font-bold mb-4">Diensten Overzicht</h3>
          <div className="space-y-4">
            {departments.map(dept => (
              <div key={dept.id} className="flex items-center justify-between py-2 border-b border-zinc-50 last:border-0">
                <p className="text-sm font-medium">{dept.name}</p>
                <span className="text-sm text-zinc-400">
                  {employees.filter(e => e.departmentId === dept.id).length} medewerkers
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </motion.div>
  );
};
