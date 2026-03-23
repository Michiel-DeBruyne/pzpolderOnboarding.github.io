import React, { useState, useEffect, useMemo } from 'react';
import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp, 
  where,
  getDocs,
  setDoc,
  getDoc
} from 'firebase/firestore';
import { 
  OAuthProvider, 
  onAuthStateChanged, 
  signOut,
  signInWithPopup,
  User as FirebaseUser
} from 'firebase/auth';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  Loader2,
} from 'lucide-react';
import { format, addDays, isBefore, parseISO } from 'date-fns';

import { db, auth } from './lib/firebase';
import { Employee, Task, Department, UserProfile, TemplateTask, EmployeeStatus, EmailTemplate, SmtpConfig, Role } from './types';
import { handleFirestoreError, OperationType } from './lib/error-handling';
import { generateAITasks } from './services/ai';

// UI Components
import { Button } from './components/ui/Button';
import { Card } from './components/ui/Card';

// Layout Components
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';

// View Components
import { Dashboard } from './components/Dashboard';
import { EmployeeList } from './components/EmployeeList';
import { EmployeeDetail } from './components/EmployeeDetail';
import { Settings } from './components/Settings';
import { Templates } from './components/Templates';
import { UserManagement } from './components/UserManagement';
import { Profile } from './components/Profile';
import { Departments } from './components/Departments';

// Modal Components
import { EmployeeForm } from './components/modals/EmployeeForm';
import { TaskForm } from './components/modals/TaskForm';
import { TemplateTaskForm } from './components/modals/TemplateTaskForm';
import { UserForm } from './components/modals/UserForm';
import { DepartmentForm } from './components/modals/DepartmentForm';
import { ConfirmModal } from './components/modals/ConfirmModal';

export const App = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [templateTasks, setTemplateTasks] = useState<TemplateTask[]>([]);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [smtpConfig, setSmtpConfig] = useState<SmtpConfig | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [view, setView] = useState<'dashboard' | 'employees' | 'departments' | 'templates' | 'users' | 'settings' | 'profile'>('dashboard');
  const [settingsTab, setSettingsTab] = useState<'general' | 'templates' | 'departments'>('general');
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [dashboardFilter, setDashboardFilter] = useState<'all' | 'onboarding' | 'offboarding'>('all');
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [isAddingEmployee, setIsAddingEmployee] = useState(false);
  const [isAddingTemplateTask, setIsAddingTemplateTask] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isAddingDepartment, setIsAddingDepartment] = useState(false);
  const [editingTemplateTask, setEditingTemplateTask] = useState<TemplateTask | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [aiLoading, setAiLoading] = useState(false);
  const [isCheckingDeadlines, setIsCheckingDeadlines] = useState(false);
  const [confirmation, setConfirmation] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);

  const requestConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmation({ title, message, onConfirm });
  };

  // Auth Listener
  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const docRef = doc(db, 'users', u.uid);
          const docSnap = await getDoc(docRef);
          let currentProfile: UserProfile | null = null;
          
          if (docSnap.exists()) {
            currentProfile = { id: u.uid, ...docSnap.data() } as UserProfile;
          } else {
            const q = query(collection(db, 'users'), where('email', '==', u.email?.toLowerCase()));
            const querySnap = await getDocs(q);
            
            if (!querySnap.empty) {
              const existingDoc = querySnap.docs[0];
              const data = existingDoc.data();
              currentProfile = { id: u.uid, ...data } as UserProfile;
              await setDoc(docRef, data);
              await deleteDoc(existingDoc.ref);
            } else {
              currentProfile = {
                id: u.uid,
                name: u.displayName || 'User',
                email: u.email || '',
                role: u.email?.toLowerCase() === 'xxsjogsxx69@gmail.com' ? 'superuser' : 'user',
              };
              await setDoc(docRef, currentProfile);
            }
          }

          if (currentProfile) {
            if (u.email?.toLowerCase() === 'xxsjogsxx69@gmail.com' && currentProfile.role !== 'superuser') {
              currentProfile.role = 'superuser';
              await updateDoc(docRef, { role: 'superuser' });
            }
            setProfile(currentProfile);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${u.uid}`);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
  }, []);

  // Data Listeners
  useEffect(() => {
    if (!user) return;

    const qEmployees = query(collection(db, 'employees'));
    const unsubEmployees = onSnapshot(qEmployees, (snapshot) => {
      setEmployees(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Employee)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'employees'));

    const qDepts = query(collection(db, 'departments'));
    const unsubDepts = onSnapshot(qDepts, (snapshot) => {
      setDepartments(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Department)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'departments'));

    const qTemplates = query(collection(db, 'templateTasks'));
    const unsubTemplates = onSnapshot(qTemplates, (snapshot) => {
      setTemplateTasks(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as TemplateTask)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'templateTasks'));

    const qEmails = query(collection(db, 'emailTemplates'));
    const unsubEmails = onSnapshot(qEmails, (snapshot) => {
      setEmailTemplates(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as EmailTemplate)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'emailTemplates'));

    const unsubSmtp = onSnapshot(doc(db, 'settings', 'smtp'), (snapshot) => {
      if (snapshot.exists()) {
        setSmtpConfig({ id: snapshot.id, ...snapshot.data() } as SmtpConfig);
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, 'settings/smtp'));

    if (profile?.role === 'superuser') {
      const syncData = async () => {
        const templateSnap = await getDocs(collection(db, 'templateTasks'));
        const seenTitles = new Set();
        for (const t of templateSnap.docs) {
          const data = t.data();
          if (seenTitles.has(data.title)) {
            await deleteDoc(doc(db, 'templateTasks', t.id));
          } else {
            seenTitles.add(data.title);
          }
        }

        if (seenTitles.size === 0) {
          const defaults = [
            { title: 'Laptop aanvragen', category: 'Hardware', type: 'onboarding' },
            { title: 'E-mailaccount aanmaken', category: 'Account', type: 'onboarding' },
            { title: 'Toegang tot Slack/Teams', category: 'Software', type: 'onboarding' },
            { title: 'Sleutelkaart/Druppel verstrekken', category: 'Toegang', type: 'onboarding' },
            { title: 'Laptop innemen', category: 'Hardware', type: 'offboarding' },
            { title: 'E-mailaccount deactiveren', category: 'Account', type: 'offboarding' },
            { title: 'Toegang intrekken', category: 'Toegang', type: 'offboarding' },
          ];
          for (const t of defaults) {
            await addDoc(collection(db, 'templateTasks'), { ...t, departmentId: 'default', description: '' });
          }
        }

        const emailSnap = await getDocs(collection(db, 'emailTemplates'));
        const seenTypes = new Set();
        for (const t of emailSnap.docs) {
          const data = t.data();
          if (seenTypes.has(data.type)) {
            await deleteDoc(doc(db, 'emailTemplates', t.id));
          } else {
            seenTypes.add(data.type);
          }
        }

        if (!seenTypes.has('welcome')) {
          await addDoc(collection(db, 'emailTemplates'), {
            type: 'welcome',
            subject: 'Welkom bij de gemeente, {{name}}!',
            body: '<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px;">\n<h1 style="color: #18181b;">Welkom {{name}}!</h1>\n<p>We zijn blij dat je er bent. Je voorbereidingen zijn bijna klaar.</p>\n<p>De volgende belangrijke taken zijn al voor je afgerond:</p>\n<ul>\n{{tasks}}\n</ul>\n<p>We hebben alles klaargezet voor je eerste dag. Tot snel!</p>\n<div style="margin-top: 30px; padding: 20px; background: #f4f4f5; border-radius: 8px;">\n<p style="margin: 0; font-size: 14px; color: #71717a;">Dit is een automatisch bericht van het Onboarding Systeem.</p>\n</div>\n</div>'
          });
        }
        if (!seenTypes.has('exit')) {
          await addDoc(collection(db, 'emailTemplates'), {
            type: 'exit',
            subject: 'Bedankt voor je inzet, {{name}}',
            body: '<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px;">\n<h1 style="color: #18181b;">Bedankt {{name}}</h1>\n<p>Vandaag is je laatste dag. We willen je bedanken voor al je inzet.</p>\n<p>Zou je ons willen helpen door een korte exit-enquête in te vullen?</p>\n<a href="https://forms.example.com/exit-survey" style="display: inline-block; padding: 12px 24px; background: #18181b; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px;">Start Enquête</a>\n<div style="margin-top: 30px; padding: 20px; background: #f4f4f5; border-radius: 8px;">\n<p style="margin: 0; font-size: 14px; color: #71717a;">Dit is een automatisch bericht van het Offboarding Systeem.</p>\n</div>\n</div>'
          });
        }
      };
      syncData();
    }

    let unsubUsers = () => {};
    if (profile?.role === 'superuser') {
      const qUsers = query(collection(db, 'users'));
      unsubUsers = onSnapshot(qUsers, (snapshot) => {
        setAllUsers(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as UserProfile)));
      }, (error) => handleFirestoreError(error, OperationType.LIST, 'users'));
    }

    return () => {
      unsubEmployees();
      unsubDepts();
      unsubTemplates();
      unsubEmails();
      unsubSmtp();
      unsubUsers();
    };
  }, [user, profile]);

  // Task Listener for selected employee
  useEffect(() => {
    if (!selectedEmployee) {
      setTasks([]);
      return;
    }

    const path = `employees/${selectedEmployee.id}/tasks`;
    const qTasks = query(collection(db, path));
    const unsubTasks = onSnapshot(qTasks, (snapshot) => {
      setTasks(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Task)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, path));

    return () => unsubTasks();
  }, [selectedEmployee]);

  const checkDeadlines = async () => {
    if (isCheckingDeadlines) return;
    setIsCheckingDeadlines(true);
    
    try {
      for (const emp of employees) {
        const tasksPath = `employees/${emp.id}/tasks`;
        const q = query(collection(db, tasksPath), where('isCompleted', '==', false), where('reminderSent', '==', false));
        const snap = await getDocs(q);
        
        for (const d of snap.docs) {
          const task = { id: d.id, ...d.data() } as Task;
          if (task.dueDate && isBefore(parseISO(task.dueDate), addDays(new Date(), 1))) {
            const email = task.notificationEmail;
            if (email) {
              await fetch('/api/send-notification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  to: email,
                  subject: `Deadline bereikt: ${task.title}`,
                  text: `Beste collega,\n\nDe deadline voor de taak "${task.title}" voor medewerker ${emp.name} is bereikt (${task.dueDate}).\n\nGelieve deze taak zo snel mogelijk uit te voeren.\n\nMet vriendelijke groet,\nOnboarding Portal`
                })
              });
              await updateDoc(doc(db, tasksPath, task.id), { reminderSent: true });
            }
          }
        }
      }
    } catch (err) {
      console.error("Deadline check failed", err);
    } finally {
      setIsCheckingDeadlines(false);
    }
  };

  useEffect(() => {
    if (profile?.role === 'superuser' && employees.length > 0) {
      checkDeadlines();
    }
  }, [profile, employees.length]);

  const handleLogin = async () => {
    const provider = new OAuthProvider('microsoft.com');
    provider.setCustomParameters({ prompt: 'select_account', tenant: 'common' });
    await signInWithPopup(auth, provider);
  };

  const handleLogout = () => signOut(auth);

  const addEmployee = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const deptId = formData.get('deptId') as string;
    const status = formData.get('status') as EmployeeStatus;
    const role = formData.get('role') as string;
    const useAI = formData.get('useAI') === 'on';

    try {
      const empRef = await addDoc(collection(db, 'employees'), {
        name,
        email,
        departmentId: deptId,
        status,
        reason: role,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        startDate: format(new Date(), 'yyyy-MM-dd'),
        welcomeEmailSent: false,
        exitSurveySent: false
      });

      const relevantTemplates = templateTasks.filter(t => t.type === status);
      const startDate = new Date();
      const deptsToNotify = new Map<string, string[]>();
      
      for (const t of relevantTemplates) {
        const taskPath = `employees/${empRef.id}/tasks`;
        let dueDate = null;
        if (t.dateType === 'fixed' && t.dueDate) {
          dueDate = t.dueDate;
        } else if (t.relativeDueDate !== undefined) {
          dueDate = format(addDays(startDate, t.relativeDueDate), 'yyyy-MM-dd');
        }
        
        const dept = departments.find(d => d.id === t.departmentId);
        const notificationEmail = dept?.defaultEmail || '';

        if (dept && dept.defaultEmail) {
          const currentTasks = deptsToNotify.get(dept.id) || [];
          deptsToNotify.set(dept.id, [...currentTasks, t.title]);
        }

        await addDoc(collection(db, taskPath), {
          employeeId: empRef.id,
          title: t.title,
          description: t.description || '',
          category: t.category,
          departmentId: t.departmentId,
          dateType: t.dateType || 'relative',
          relativeDueDate: t.relativeDueDate || null,
          dueDate,
          notificationEmail,
          isCompleted: false,
          createdAt: serverTimestamp(),
          docLink: t.docLink || '',
          reminderSent: false,
          isPrerequisite: t.isPrerequisite || false
        });
      }

      // Send notifications to departments
      for (const [deptId, taskTitles] of deptsToNotify.entries()) {
        const dept = departments.find(d => d.id === deptId);
        if (dept?.defaultEmail) {
          try {
            await fetch('/api/send-notification', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                to: dept.defaultEmail,
                subject: `Nieuwe taken voor ${dept.name}: ${name}`,
                text: `Beste ${dept.name} team,\n\nEr is een nieuwe medewerker aangemaakt (${status === 'onboarding' ? 'Onboarding' : 'Offboarding'}): ${name}.\n\nDe volgende taken zijn aan jullie afdeling toegewezen:\n\n${taskTitles.map(title => `- ${title}`).join('\n')}\n\nLog in op de portal om de voortgang te beheren.`
              })
            });
          } catch (notificationErr) {
            console.error(`Failed to notify department ${dept.name}`, notificationErr);
          }
        }
      }

      if (useAI) {
        setAiLoading(true);
        try {
          const aiTasks = await generateAITasks(name, role, status === 'completed' ? 'onboarding' : status);
          for (const t of aiTasks) {
            const taskPath = `employees/${empRef.id}/tasks`;
            await addDoc(collection(db, taskPath), {
              employeeId: empRef.id,
              title: t.title,
              description: t.description,
              category: t.category,
              departmentId: deptId,
              isCompleted: false,
              createdAt: serverTimestamp()
            });
          }
        } catch (err) {
          console.error("AI Generation failed", err);
        }
        setAiLoading(false);
      }

      setIsAddingEmployee(false);
      setView('employees');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'employees');
    }
  };

  const canUserCompleteTask = (task: Task) => {
    if (profile?.role === 'superuser') return true;
    if (!profile?.departmentId) return false;
    return task.departmentId === profile.departmentId || task.departmentId === 'default';
  };

  const toggleTask = async (task: Task) => {
    if (!canUserCompleteTask(task)) return;
    const path = `employees/${task.employeeId}/tasks/${task.id}`;
    try {
      await updateDoc(doc(db, path), {
        isCompleted: !task.isCompleted,
        completedBy: !task.isCompleted ? user?.displayName : null,
        completedAt: !task.isCompleted ? serverTimestamp() : null
      });
      
      if (!task.isCompleted) {
        checkAutomation(task.employeeId);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const checkAutomation = async (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    if (!employee || employee.welcomeEmailSent) return;

    const tasksSnap = await getDocs(collection(db, `employees/${employeeId}/tasks`));
    const employeeTasks = tasksSnap.docs.map(d => ({ id: d.id, ...d.data() } as Task));

    const prerequisites = employeeTasks.filter(t => t.isPrerequisite);
    const allPrerequisitesDone = prerequisites.length > 0 && prerequisites.every(t => t.isCompleted);

    if (allPrerequisitesDone) {
      const startDate = new Date(employee.startDate);
      const now = new Date();
      const diffTime = startDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 7 && diffDays >= 0) {
        try {
          const response = await fetch('/api/send-automation-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: employee.email,
              type: 'welcome',
              employeeName: employee.name,
              completedTasks: employeeTasks.filter(t => t.isCompleted).map(t => t.title)
            })
          });
          
          if (response.ok) {
            await updateDoc(doc(db, 'employees', employeeId), { welcomeEmailSent: true });
          }
        } catch (error) {
          console.error("Automation error:", error);
        }
      }
    }
  };

  useEffect(() => {
    const checkExitSurveys = async () => {
      const now = new Date();
      const todayStr = format(now, 'yyyy-MM-dd');
      
      for (const employee of employees) {
        if (employee.status === 'offboarding' && !employee.exitSurveySent) {
          if (employee.startDate <= todayStr) {
            try {
              const response = await fetch('/api/send-automation-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  to: employee.email,
                  type: 'exit',
                  employeeName: employee.name,
                  completedTasks: []
                })
              });
              
              if (response.ok) {
                await updateDoc(doc(db, 'employees', employee.id), { exitSurveySent: true });
              }
            } catch (error) {
              console.error("Exit survey error:", error);
            }
          }
        }
      }
    };

    if (employees.length > 0) {
      checkExitSurveys();
    }
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    return employees.filter(e => {
      const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase()) || 
                           e.reason.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = dashboardFilter === 'all' || e.status === dashboardFilter;
      return matchesSearch && matchesFilter;
    });
  }, [employees, search, dashboardFilter]);

  const filteredTasks = useMemo(() => {
    return tasks
      .filter(t => {
        const matchesStatus = taskFilter === 'all' || 
                             (taskFilter === 'pending' && !t.isCompleted) || 
                             (taskFilter === 'completed' && t.isCompleted);
        const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                             t.description.toLowerCase().includes(search.toLowerCase());
        return matchesStatus && matchesSearch;
      })
      .sort((a, b) => a.isCompleted === b.isCompleted ? 0 : a.isCompleted ? 1 : -1);
  }, [tasks, taskFilter, search]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-50">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-50 p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white border border-zinc-200 rounded-2xl shadow-sm p-8 text-center"
        >
          <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Portal</h1>
          <p className="text-zinc-500 mb-8">Beheer onboarding en offboarding met uw werkaccount.</p>
          <Button onClick={handleLogin} className="w-full py-3 bg-[#2f2f2f] hover:bg-black">
            <svg className="w-5 h-5 mr-2" viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg"><path fill="#f3f3f3" d="M0 0h11v11H0z"/><path fill="#f3f3f3" d="M12 0h11v11H12z"/><path fill="#f3f3f3" d="M0 12h11v23H0z"/><path fill="#f3f3f3" d="M12 12h11v11H12z"/></svg>
            Aanmelden met Microsoft
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-zinc-50 overflow-hidden">
      <Sidebar 
        view={view} 
        setView={setView} 
        profile={profile} 
        user={user}
        isConfigOpen={isConfigOpen} 
        setIsConfigOpen={setIsConfigOpen} 
        handleLogout={handleLogout} 
        setSelectedEmployee={setSelectedEmployee}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        <Header search={search} setSearch={setSearch} setIsAddingEmployee={setIsAddingEmployee} />

        <div className="flex-1 overflow-y-auto p-8">
          {view === 'dashboard' && (
            <Dashboard 
              employees={employees} 
              departments={departments}
              setView={setView} 
              setDashboardFilter={setDashboardFilter} 
            />
          )}

          {view === 'employees' && (
            <EmployeeList 
              employees={filteredEmployees} 
              dashboardFilter={dashboardFilter} 
              setDashboardFilter={setDashboardFilter} 
              setSelectedEmployee={setSelectedEmployee} 
              profile={profile}
              requestConfirm={requestConfirm}
            />
          )}

          {view === 'departments' && (
            <Departments 
              departments={departments}
              setIsAddingDepartment={setIsAddingDepartment}
              setEditingDepartment={setEditingDepartment}
              requestConfirm={requestConfirm}
              profile={profile}
            />
          )}

          {view === 'templates' && (
            <Templates 
              templateTasks={templateTasks} 
              setIsAddingTemplateTask={setIsAddingTemplateTask} 
              setEditingTemplateTask={setEditingTemplateTask} 
              requestConfirm={requestConfirm} 
            />
          )}

          {view === 'users' && profile?.role === 'superuser' && (
            <UserManagement 
              allUsers={allUsers} 
              setIsAddingUser={setIsAddingUser} 
              setEditingUser={setEditingUser} 
              requestConfirm={requestConfirm} 
              departments={departments}
              profile={profile}
            />
          )}

          {view === 'settings' && (
            <Settings 
              settingsTab={settingsTab} 
              setSettingsTab={setSettingsTab} 
              smtpConfig={smtpConfig} 
              departments={departments} 
              emailTemplates={emailTemplates} 
              previewTemplateId={previewTemplateId} 
              setPreviewTemplateId={setPreviewTemplateId} 
              requestConfirm={requestConfirm} 
              isCheckingDeadlines={isCheckingDeadlines}
              checkDeadlines={checkDeadlines}
            />
          )}

          {view === 'profile' && (
            <Profile 
              profile={profile} 
              theme={theme} 
              setTheme={setTheme} 
              aiEnabled={aiEnabled} 
              setAiEnabled={setAiEnabled} 
              user={user}
            />
          )}
        </div>
      </main>

      {selectedEmployee && (
        <EmployeeDetail 
          employee={selectedEmployee} 
          tasks={filteredTasks} 
          taskFilter={taskFilter} 
          setTaskFilter={setTaskFilter} 
          toggleTask={toggleTask} 
          setIsAddingTask={setIsAddingTask} 
          setEditingTask={setEditingTask} 
          requestConfirm={requestConfirm} 
          onClose={() => setSelectedEmployee(null)} 
          departments={departments}
          profile={profile}
        />
      )}

      {/* Modals */}
      <EmployeeForm 
        isOpen={isAddingEmployee} 
        onClose={() => setIsAddingEmployee(false)} 
        onSubmit={addEmployee} 
        departments={departments} 
        aiLoading={aiLoading} 
        aiEnabled={aiEnabled}
      />

      <TaskForm 
        isOpen={isAddingTask || !!editingTask} 
        onClose={() => { setIsAddingTask(false); setEditingTask(null); }} 
        editingTask={editingTask} 
        selectedEmployee={selectedEmployee} 
        onSubmit={async (e) => {
          e.preventDefault();
          if (!selectedEmployee) return;
          const formData = new FormData(e.currentTarget);
          const data = {
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            category: formData.get('category') as string,
            docLink: formData.get('docLink') as string,
            dateType: formData.get('dateType') as 'relative' | 'fixed',
            relativeDueDate: formData.get('relativeDueDate') ? parseInt(formData.get('relativeDueDate') as string) : null,
            dueDate: formData.get('dueDate') as string || null,
            notificationEmail: formData.get('notificationEmail') as string,
          };

          const path = `employees/${selectedEmployee.id}/tasks`;
          try {
            if (editingTask) {
              await updateDoc(doc(db, path, editingTask.id), data);
            } else {
              await addDoc(collection(db, path), {
                ...data,
                employeeId: selectedEmployee.id,
                isCompleted: false,
                createdAt: serverTimestamp(),
                reminderSent: false
              });
            }
            setIsAddingTask(false);
            setEditingTask(null);
          } catch (err) {
            handleFirestoreError(err, editingTask ? OperationType.UPDATE : OperationType.CREATE, path);
          }
        }}
      />

      <TemplateTaskForm 
        isOpen={isAddingTemplateTask || !!editingTemplateTask} 
        onClose={() => { setIsAddingTemplateTask(false); setEditingTemplateTask(null); }} 
        editingTask={editingTemplateTask} 
        onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const data = {
            title: formData.get('title') as string,
            type: formData.get('type') as 'onboarding' | 'offboarding',
            category: formData.get('category') as string,
            description: formData.get('description') as string,
            relativeDueDate: parseInt(formData.get('relativeDueDate') as string),
            isPrerequisite: formData.get('isPrerequisite') === 'on',
            departmentId: 'default'
          };

          try {
            if (editingTemplateTask) {
              await updateDoc(doc(db, 'templateTasks', editingTemplateTask.id), data);
            } else {
              await addDoc(collection(db, 'templateTasks'), data);
            }
            setIsAddingTemplateTask(false);
            setEditingTemplateTask(null);
          } catch (err) {
            handleFirestoreError(err, editingTemplateTask ? OperationType.UPDATE : OperationType.CREATE, 'templateTasks');
          }
        }}
      />

      <UserForm 
        isOpen={isAddingUser || !!editingUser} 
        onClose={() => { setIsAddingUser(false); setEditingUser(null); }} 
        editingUser={editingUser} 
        departments={departments} 
        onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const email = (formData.get('email') as string).toLowerCase();
          const data = {
            name: formData.get('name') as string,
            email,
            role: formData.get('role') as Role,
            departmentId: formData.get('departmentId') as string
          };

          try {
            if (editingUser) {
              await updateDoc(doc(db, 'users', editingUser.id), data);
            } else {
              // Check if user already exists
              const q = query(collection(db, 'users'), where('email', '==', email));
              const snap = await getDocs(q);
              if (snap.empty) {
                await addDoc(collection(db, 'users'), data);
              } else {
                alert("Gebruiker met dit e-mailadres bestaat al.");
              }
            }
            setIsAddingUser(false);
            setEditingUser(null);
          } catch (err) {
            handleFirestoreError(err, editingUser ? OperationType.UPDATE : OperationType.CREATE, 'users');
          }
        }}
      />

      <DepartmentForm 
        isOpen={isAddingDepartment || !!editingDepartment}
        onClose={() => { setIsAddingDepartment(false); setEditingDepartment(null); }}
        editingDepartment={editingDepartment}
        onSubmit={async (data) => {
          if (editingDepartment) {
            try {
              await updateDoc(doc(db, 'departments', editingDepartment.id), data);
              setEditingDepartment(null);
            } catch (error) {
              handleFirestoreError(error, OperationType.UPDATE, `departments/${editingDepartment.id}`);
            }
          } else {
            try {
              await addDoc(collection(db, 'departments'), data);
              setIsAddingDepartment(false);
            } catch (error) {
              handleFirestoreError(error, OperationType.CREATE, 'departments');
            }
          }
        }}
      />

      <ConfirmModal 
        confirmation={confirmation} 
        onClose={() => setConfirmation(null)} 
      />
    </div>
  );
};
