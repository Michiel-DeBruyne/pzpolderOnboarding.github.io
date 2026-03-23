import React from 'react';
import { 
  CheckCircle2, 
  LayoutDashboard, 
  Users, 
  Building2, 
  ClipboardList, 
  Settings, 
  ChevronRight, 
  LogOut 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { UserProfile } from '../../types';
import { User } from 'firebase/auth';

interface SidebarProps {
  view: 'dashboard' | 'employees' | 'departments' | 'templates' | 'users' | 'settings' | 'profile';
  setView: (view: 'dashboard' | 'employees' | 'departments' | 'templates' | 'users' | 'settings' | 'profile') => void;
  setSelectedEmployee: (emp: any) => void;
  isConfigOpen: boolean;
  setIsConfigOpen: (open: boolean) => void;
  profile: UserProfile | null;
  user: User | null;
  handleLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  view,
  setView,
  setSelectedEmployee,
  isConfigOpen,
  setIsConfigOpen,
  profile,
  user,
  handleLogout
}) => {
  return (
    <aside className="w-64 border-r border-zinc-200 bg-white flex flex-col">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
          <CheckCircle2 className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-lg">Portal</span>
      </div>
      
      <nav className="flex-1 px-4 space-y-1">
        <button 
          onClick={() => { setView('dashboard'); setSelectedEmployee(null); }}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors",
            view === 'dashboard' ? "bg-zinc-100 text-zinc-900 font-medium" : "text-zinc-500 hover:bg-zinc-50"
          )}
        >
          <LayoutDashboard className="w-5 h-5" />
          Dashboard
        </button>
        <button 
          onClick={() => { setView('employees'); setSelectedEmployee(null); }}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors",
            view === 'employees' ? "bg-zinc-100 text-zinc-900 font-medium" : "text-zinc-500 hover:bg-zinc-50"
          )}
        >
          <Users className="w-5 h-5" />
          Medewerkers
        </button>
        <button 
          onClick={() => { setView('departments'); setSelectedEmployee(null); }}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors",
            view === 'departments' ? "bg-zinc-100 text-zinc-900 font-medium" : "text-zinc-500 hover:bg-zinc-50"
          )}
        >
          <Building2 className="w-5 h-5" />
          Diensten
        </button>
        <button 
          onClick={() => { setView('templates'); setSelectedEmployee(null); }}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors",
            view === 'templates' ? "bg-zinc-100 text-zinc-900 font-medium" : "text-zinc-500 hover:bg-zinc-50"
          )}
        >
          <ClipboardList className="w-5 h-5" />
          Sjablonen
        </button>
        
        <div className="space-y-1">
          <button 
            onClick={() => setIsConfigOpen(!isConfigOpen)}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors",
              (view === 'settings') ? "bg-zinc-50 text-zinc-900 font-medium" : "text-zinc-500 hover:bg-zinc-50"
            )}
          >
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5" />
              Configuratie
            </div>
            <ChevronRight className={cn("w-4 h-4 transition-transform", isConfigOpen && "rotate-90")} />
          </button>
          
          <AnimatePresence>
            {isConfigOpen && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden pl-11 space-y-1"
              >
                <button 
                  onClick={() => { setView('settings'); setSelectedEmployee(null); }}
                  className={cn(
                    "w-full text-left py-2 text-sm transition-colors",
                    view === 'settings' ? "text-zinc-900 font-bold" : "text-zinc-500 hover:text-zinc-700"
                  )}
                >
                  Email
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {profile?.role === 'superuser' && (
          <button 
            onClick={() => { setView('users'); setSelectedEmployee(null); }}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors",
              view === 'users' ? "bg-zinc-100 text-zinc-900 font-medium" : "text-zinc-500 hover:bg-zinc-50"
            )}
          >
            <Users className="w-5 h-5" />
            Gebruikers
          </button>
        )}
        <button 
          onClick={() => { setView('profile'); setSelectedEmployee(null); }}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors",
            view === 'profile' ? "bg-zinc-100 text-zinc-900 font-medium" : "text-zinc-500 hover:bg-zinc-50"
          )}
        >
          <Settings className="w-5 h-5" />
          Instellingen
        </button>
      </nav>

      <div className="p-4 border-t border-zinc-200">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <img src={user?.photoURL || ''} className="w-8 h-8 rounded-full border border-zinc-200" alt="" referrerPolicy="no-referrer" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.displayName}</p>
            <p className="text-xs text-zinc-500 truncate capitalize">{profile?.role}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Uitloggen
        </button>
      </div>
    </aside>
  );
};
