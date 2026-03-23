import React from 'react';
import { motion } from 'motion/react';
import { User } from 'firebase/auth';
import { Card } from './ui/Card';
import { cn } from '../lib/utils';
import { UserProfile } from '../types';

interface ProfileProps {
  user: User | null;
  profile: UserProfile | null;
  aiEnabled: boolean;
  setAiEnabled: (enabled: boolean) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

export const Profile: React.FC<ProfileProps> = ({
  user,
  profile,
  aiEnabled,
  setAiEnabled,
  theme,
  setTheme
}) => {
  return (
    <motion.div 
      key="profile"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <h1 className="text-3xl font-bold">Instellingen</h1>
      <Card className="p-8 max-w-2xl">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold mb-4">Profiel</h3>
            <div className="flex items-center gap-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
              <img src={user?.photoURL || ''} className="w-16 h-16 rounded-full border-2 border-white shadow-sm" alt="" referrerPolicy="no-referrer" />
              <div>
                <p className="font-bold">{user?.displayName}</p>
                <p className="text-sm text-zinc-500">{user?.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 bg-zinc-200 text-zinc-700 rounded text-[10px] font-bold uppercase">
                  {profile?.role}
                </span>
              </div>
            </div>
          </div>
          
          <div className="pt-6 border-t border-zinc-100">
            <h3 className="text-lg font-bold mb-4">Systeem</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                <div>
                  <p className="font-medium">AI Generatie</p>
                  <p className="text-xs text-zinc-500">Gebruik Gemini 3 Flash voor automatische checklists</p>
                </div>
                <button 
                  onClick={() => setAiEnabled(!aiEnabled)}
                  className={cn(
                    "w-12 h-6 rounded-full relative transition-colors",
                    aiEnabled ? "bg-zinc-900" : "bg-zinc-200"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                    aiEnabled ? "right-1" : "left-1"
                  )} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                <div>
                  <p className="font-medium">Thema</p>
                  <p className="text-xs text-zinc-500">Wissel tussen licht en donker thema</p>
                </div>
                <button 
                  onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                  className="px-3 py-1 bg-white border border-zinc-200 rounded-lg text-xs font-bold uppercase"
                >
                  {theme === 'light' ? 'Licht' : 'Donker'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
