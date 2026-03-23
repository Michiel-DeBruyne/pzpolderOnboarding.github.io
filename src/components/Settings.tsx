import React from 'react';
import { motion } from 'motion/react';
import { 
  Settings as SettingsIcon, 
  Clock, 
  Building2, 
  Image as ImageIcon, 
  Mail, 
  Eye, 
  Loader2 
} from 'lucide-react';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';
import { SmtpConfig, Department, EmailTemplate } from '../types';

interface SettingsProps {
  settingsTab: 'general' | 'templates' | 'departments';
  setSettingsTab: (tab: 'general' | 'templates' | 'departments') => void;
  smtpConfig: SmtpConfig | null;
  isCheckingDeadlines: boolean;
  checkDeadlines: () => void;
  departments: Department[];
  emailTemplates: EmailTemplate[];
  previewTemplateId: string | null;
  setPreviewTemplateId: (id: string | null) => void;
  requestConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

export const Settings: React.FC<SettingsProps> = ({
  settingsTab,
  setSettingsTab,
  smtpConfig,
  isCheckingDeadlines,
  checkDeadlines,
  departments,
  emailTemplates,
  previewTemplateId,
  setPreviewTemplateId,
  requestConfirm
}) => {
  return (
    <motion.div 
      key="settings"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 max-w-4xl"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Email Configuratie</h1>
        <div className="flex bg-zinc-100 p-1 rounded-xl">
          {(['general', 'templates', 'departments'] as const).map((tab) => (
            <button 
              key={tab}
              onClick={() => setSettingsTab(tab)}
              className={cn(
                "px-4 py-2 text-sm font-bold rounded-lg transition-all",
                settingsTab === tab ? "bg-white shadow-sm text-zinc-900" : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              {tab === 'general' ? 'Algemeen' : tab === 'templates' ? 'E-mail Templates' : 'Dienst-notificaties'}
            </button>
          ))}
        </div>
      </div>
      
      {settingsTab === 'general' ? (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-bold mb-6 flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-zinc-400" /> SMTP Instellingen
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">SMTP Host</label>
                  <input 
                    type="text"
                    defaultValue={smtpConfig?.host}
                    onBlur={async (e) => {
                      await setDoc(doc(db, 'settings', 'smtp'), { host: e.target.value }, { merge: true });
                    }}
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">SMTP Port</label>
                  <input 
                    type="number"
                    defaultValue={(smtpConfig?.port === null || smtpConfig?.port === undefined || isNaN(smtpConfig.port)) ? '' : smtpConfig.port}
                    onBlur={async (e) => {
                      const val = parseInt(e.target.value);
                      await setDoc(doc(db, 'settings', 'smtp'), { port: isNaN(val) ? null : val }, { merge: true });
                    }}
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">SMTP Gebruiker</label>
                  <input 
                    type="text"
                    defaultValue={smtpConfig?.user}
                    onBlur={async (e) => {
                      await setDoc(doc(db, 'settings', 'smtp'), { user: e.target.value }, { merge: true });
                    }}
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">SMTP Wachtwoord</label>
                  <input 
                    type="password"
                    defaultValue={smtpConfig?.pass}
                    onBlur={async (e) => {
                      await setDoc(doc(db, 'settings', 'smtp'), { pass: e.target.value }, { merge: true });
                    }}
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                  />
                </div>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">Afzender E-mail (From)</label>
                <input 
                  type="text"
                  defaultValue={smtpConfig?.from}
                  placeholder='"Gemeente Onboarding" <noreply@gemeente.nl>'
                  onBlur={async (e) => {
                    await setDoc(doc(db, 'settings', 'smtp'), { from: e.target.value }, { merge: true });
                  }}
                  className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-zinc-900 text-white">
            <h3 className="font-bold mb-2 flex items-center gap-2">
              <Clock className="w-5 h-5 text-zinc-400" /> Systeem Status
            </h3>
            <p className="text-sm text-zinc-400 mb-4">
              De deadline-checker controleert dagelijks op openstaande taken. 
              Notificaties worden verzonden naar het ingestelde e-mailadres (Taak {'->'} Dienst {'->'} Categorie).
            </p>
            <Button 
              variant="secondary" 
              className="bg-white/10 border-white/10 hover:bg-white/20 text-white"
              onClick={checkDeadlines}
              disabled={isCheckingDeadlines}
            >
              {isCheckingDeadlines ? <Loader2 className="w-4 h-4 animate-spin" /> : "Handmatig Deadlines Controleren"}
            </Button>
          </Card>
        </div>
      ) : settingsTab === 'departments' ? (
        <div className="grid grid-cols-1 gap-8">
          <Card className="p-6">
            <h3 className="font-bold mb-6 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-zinc-400" /> E-mail per Dienst
            </h3>
            <div className="space-y-4">
              {departments.map(dept => (
                <div key={dept.id}>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">{dept.name}</label>
                  <div className="flex gap-2">
                    <input 
                      type="email"
                      defaultValue={dept.defaultEmail}
                      placeholder="dienst@gemeente.nl"
                      onBlur={async (e) => {
                        if (e.target.value !== dept.defaultEmail) {
                          await updateDoc(doc(db, 'departments', dept.id), { defaultEmail: e.target.value });
                        }
                      }}
                      className="flex-1 bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      ) : (
        <div className="space-y-8">
          <Card className="p-4 bg-amber-50 border-amber-100">
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                <ImageIcon className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h4 className="font-bold text-amber-900 text-sm">Screenshots toevoegen?</h4>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  U kunt afbeeldingen toevoegen door een <code className="bg-amber-100/50 px-1 rounded">{"<img />"}</code> tag te gebruiken met een volledige URL. 
                  Bijvoorbeeld: <code className="bg-amber-100/50 px-1 rounded">{'<img src="https://jouw-site.nl/afbeelding.png" style="max-width: 100%;" />'}</code>.
                </p>
              </div>
            </div>
          </Card>

          {emailTemplates.map(template => (
            <Card key={template.id} className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold flex items-center gap-2 capitalize">
                  <Mail className="w-5 h-5 text-zinc-400" /> {template.type === 'welcome' ? 'Welkomstmail' : 'Exit-enquête Mail'}
                </h3>
                <button 
                  onClick={() => setPreviewTemplateId(previewTemplateId === template.id ? null : template.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                    previewTemplateId === template.id 
                      ? "bg-zinc-900 text-white" 
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  )}
                >
                  <Eye className="w-4 h-4" />
                  {previewTemplateId === template.id ? 'Sluit Voorbeeld' : 'Bekijk Voorbeeld'}
                </button>
              </div>

              {previewTemplateId === template.id ? (
                <div className="space-y-4">
                  <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-6">
                    <div className="mb-4 pb-4 border-b border-zinc-200">
                      <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mb-1">Onderwerp</p>
                      <p className="font-medium">{template.subject.replace('{{name}}', 'Jan Jansen')}</p>
                    </div>
                    <div 
                      className="bg-white p-6 rounded-lg border border-zinc-200 shadow-sm overflow-auto max-h-[500px]"
                      dangerouslySetInnerHTML={{ 
                        __html: template.body
                          .replace(/{{name}}/g, 'Jan Jansen')
                          .replace('{{tasks}}', '<li>Laptop aanvragen</li><li>E-mailaccount aanmaken</li>') 
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">Onderwerp</label>
                    <input 
                      type="text"
                      defaultValue={template.subject}
                      onBlur={async (e) => {
                        if (e.target.value !== template.subject) {
                          await updateDoc(doc(db, 'emailTemplates', template.id), { subject: e.target.value });
                        }
                      }}
                      className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">Inhoud (HTML)</label>
                    <textarea 
                      defaultValue={template.body}
                      rows={12}
                      onBlur={async (e) => {
                        if (e.target.value !== template.body) {
                          await updateDoc(doc(db, 'emailTemplates', template.id), { body: e.target.value });
                        }
                      }}
                      className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                    />
                    <p className="mt-2 text-[10px] text-zinc-400">
                      Beschikbare variabelen: <code className="bg-zinc-100 px-1 rounded">{"{{name}}"}</code>, <code className="bg-zinc-100 px-1 rounded">{"{{tasks}}"}</code> (alleen welkomstmail)
                    </p>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  );
};
