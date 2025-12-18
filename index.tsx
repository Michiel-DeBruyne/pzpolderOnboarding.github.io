
import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { Task, User, Category, AppState, Employee, EmployeeStatus, Theme, Department } from './types';
import { INITIAL_TASKS, INITIAL_OFFBOARDING_TASKS } from './constants';
import { generateId } from './utils';

// --- Components ---

const Navbar = ({ user, onLogout, setView, currentView, theme, onToggleTheme }: { 
    user: User, 
    onLogout: () => void, 
    setView: (v: any) => void, 
    currentView: string,
    theme: Theme,
    onToggleTheme: () => void
}) => (
    <nav className="nav-container">
        <div className="nav-logo">
            <span className="logo-icon">✓</span>
            <span className="logo-text">Portal</span>
        </div>
        <div className="nav-links">
            <button className={currentView === 'employees' || (currentView === 'checklist' && !currentView.includes('offboarding')) ? 'active' : ''} onClick={() => setView('employees')}>Onboarding</button>
            <button className={currentView === 'offboarding' ? 'active' : ''} onClick={() => setView('offboarding')}>Offboarding</button>
            <div className="nav-dropdown">
                <button className={currentView.includes('template') ? 'active' : ''}>Templates ▾</button>
                <div className="dropdown-content">
                    <button onClick={() => setView('template_onboarding')}>Onboarding Template</button>
                    <button onClick={() => setView('template_offboarding')}>Offboarding Template</button>
                </div>
            </div>
            {user.role === 'SuperUser' && (
                <div className="nav-dropdown">
                    <button className={currentView === 'admin_beheer' || currentView === 'dept_beheer' ? 'active' : ''}>Beheer ▾</button>
                    <div className="dropdown-content">
                        <button onClick={() => setView('admin_beheer')}>Beheer Admins</button>
                        <button onClick={() => setView('dept_beheer')}>Beheer Diensten</button>
                    </div>
                </div>
            )}
        </div>
        <div className="nav-user">
            <button onClick={onToggleTheme} className="theme-toggle" title="Wissel thema">
                {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <div className="user-info">
                <span className="user-name">{user.name}</span>
                <span className="user-dept">{user.role}</span>
            </div>
            <button onClick={onLogout} className="logout-btn">Uitloggen</button>
        </div>
    </nav>
);

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => {
    if (!isOpen) return null;
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button className="close-x" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    {children}
                </div>
            </div>
        </div>
    );
};

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Bevestigen", type = "danger" }: { 
    isOpen: boolean, onClose: () => void, onConfirm: () => void, title: string, message: string, confirmText?: string, type?: "danger" | "primary" 
}) => (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
        <p style={{ margin: '0 0 24px 0', fontSize: '14px', lineHeight: '1.5', color: 'var(--text)' }}>{message}</p>
        <div className="modal-footer" style={{ marginTop: 0 }}>
            <button className="secondary-btn" onClick={onClose}>Annuleren</button>
            <button 
                className="primary-action-btn" 
                style={type === 'danger' ? { backgroundColor: 'var(--danger)' } : {}} 
                onClick={() => { onConfirm(); onClose(); }}
            >
                {confirmText}
            </button>
        </div>
    </Modal>
);

const LoginScreen = ({ onLogin, admins, departments }: { onLogin: (u: User) => void, admins: User[], departments: Department[] }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedAdminId, setSelectedAdminId] = useState<string>(admins[0]?.id || '');
    
    const handleLogin = () => {
        const admin = admins.find(a => a.id === selectedAdminId);
        if (!admin) return;
        setIsLoading(true);
        setTimeout(() => {
            onLogin(admin);
        }, 800);
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="microsoft-logo">
                    <div className="square red"></div><div className="square green"></div>
                    <div className="square blue"></div><div className="square yellow"></div>
                </div>
                <h1>Aanmelden</h1>
                <p>Selecteer uw organisatie-account.</p>
                <div className="dept-selector" style={{ marginBottom: '20px', textAlign: 'left' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '5px', color: 'var(--text)' }}>Account:</label>
                    <select 
                        value={selectedAdminId} 
                        onChange={(e) => setSelectedAdminId(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text)' }}
                    >
                        {admins.map(a => {
                            const dept = departments.find(d => d.id === a.dienstId);
                            return <option key={a.id} value={a.id}>{a.name} ({dept?.name || 'SuperUser'})</option>;
                        })}
                    </select>
                </div>
                <button className="sso-button" onClick={handleLogin} disabled={isLoading || !selectedAdminId}>
                    {isLoading ? 'Bezig...' : 'Aanmelden'}
                </button>
            </div>
        </div>
    );
};

const ProgressBar = ({ percent }: { percent: number }) => (
    <div className="progress-cell">
        <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${percent}%` }}></div>
        </div>
        <span className="progress-text">{Math.round(percent)}%</span>
    </div>
);

const TaskCard = ({ task, onToggle, isTemplate = false, onDelete, canEdit = true, departments }: { 
    task: Task, onToggle: (id: string) => void, isTemplate?: boolean, onDelete?: (id: string) => void, canEdit?: boolean, departments: Department[] 
}) => {
    const dept = departments.find(d => d.id === task.dienst);
    return (
        <div className={`task-card ${task.isCompleted ? 'completed' : ''} ${!canEdit ? 'read-only' : ''}`}>
            <div className="task-header">
                <div className="task-main">
                    {!isTemplate && (
                        <input type="checkbox" checked={task.isCompleted} onChange={() => onToggle(task.id)} disabled={!canEdit} />
                    )}
                    <div className="task-content">
                        <h3>{task.title}</h3>
                        {task.description && <p>{task.description}</p>}
                    </div>
                </div>
                {isTemplate && canEdit && <button className="delete-btn" onClick={() => onDelete?.(task.id)}>Verwijder</button>}
            </div>
            <div className="task-footer">
                <div className="tags">
                    <span className="tag dienst">{dept?.name || 'Onbekende Dienst'}</span>
                    <span className="tag category">{task.category}</span>
                </div>
                {task.isCompleted && (
                    <div className="completion-info">Voltooid door <strong>{task.completedBy}</strong> op {task.completedAt}</div>
                )}
            </div>
        </div>
    );
};

const App = () => {
    const [state, setState] = useState<AppState>(() => {
        const saved = localStorage.getItem('onboarding_v6_state');
        if (saved) return JSON.parse(saved);
        return {
            user: null,
            departments: [
                { id: 'it-dept', name: 'IT' },
                { id: 'lik-dept', name: 'LIK' },
                { id: 'log-dept', name: 'Logistiek' }
            ],
            templateTasks: INITIAL_TASKS.map(t => ({ ...t, dienst: t.dienst === 'IT' ? 'it-dept' : t.dienst === 'LIK' ? 'lik-dept' : 'log-dept' })),
            offboardingTemplateTasks: INITIAL_OFFBOARDING_TASKS.map(t => ({ ...t, dienst: t.dienst === 'IT' ? 'it-dept' : t.dienst === 'LIK' ? 'lik-dept' : 'log-dept' })),
            employees: [],
            admins: [
                { id: '1', name: 'Super Admin', email: 'it@org.be', role: 'SuperUser', dienstId: 'it-dept' }
            ],
            view: 'employees',
            selectedEmployeeId: null,
            filterDienstId: 'All',
            filterCategory: 'All',
            theme: 'light',
            employeeSearchQuery: '',
            showOnlyIncomplete: false
        };
    });

    const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);
    const [empModalStatus, setEmpModalStatus] = useState<EmployeeStatus>('onboarding');
    const [isAddAdminModalOpen, setIsAddAdminModalOpen] = useState(false);
    const [isAddDeptModalOpen, setIsAddDeptModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

    // Confirmation Modal States
    const [confirmDeleteEmp, setConfirmDeleteEmp] = useState<string | null>(null);
    const [confirmDeleteDept, setConfirmDeleteDept] = useState<string | null>(null);

    useEffect(() => {
        localStorage.setItem('onboarding_v6_state', JSON.stringify(state));
    }, [state]);

    const handleLogin = (user: User) => setState(prev => ({ ...prev, user, filterDienstId: 'All', employeeSearchQuery: '' }));
    const handleLogout = () => setState(prev => ({ ...prev, user: null }));
    const toggleTheme = () => setState(prev => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }));

    const accessibleEmployees = useMemo(() => {
        if (!state.user) return [];
        const isOffboardingView = state.view === 'offboarding';
        let filtered = state.employees.filter(e => isOffboardingView ? e.status === 'offboarding' : e.status === 'onboarding');
        
        // Apply search filter
        if (state.employeeSearchQuery) {
            const query = state.employeeSearchQuery.toLowerCase();
            filtered = filtered.filter(e => e.name.toLowerCase().includes(query));
        }

        if (state.user.role === 'SuperUser') return filtered;
        return filtered.filter(e => e.departmentId === state.user?.dienstId);
    }, [state.employees, state.user, state.view, state.employeeSearchQuery]);

    const selectedEmployee = useMemo(() => 
        state.employees.find(e => e.id === state.selectedEmployeeId),
    [state.employees, state.selectedEmployeeId]);

    const filteredTasks = useMemo(() => {
        if (!selectedEmployee || !state.user) return [];
        const currentTasks = selectedEmployee.status === 'offboarding' ? selectedEmployee.offboardingTasks : selectedEmployee.tasks;
        return currentTasks.filter(t => {
            const isDeptAllowed = state.user?.role === 'SuperUser' || t.dienst === state.user?.dienstId;
            if (!isDeptAllowed) return false;
            
            const dienstMatch = state.filterDienstId === 'All' || t.dienst === state.filterDienstId;
            const catMatch = state.filterCategory === 'All' || t.category === state.filterCategory;
            const incompleteMatch = !state.showOnlyIncomplete || !t.isCompleted;

            return dienstMatch && catMatch && incompleteMatch;
        });
    }, [selectedEmployee, state.filterDienstId, state.filterCategory, state.user, state.showOnlyIncomplete]);

    // Actions
    const createEmployee = (name: string, departmentId: string, status: EmployeeStatus) => {
        const newEmployee: Employee = {
            id: generateId(),
            name,
            departmentId,
            startDate: new Date().toLocaleDateString('nl-BE'),
            status,
            tasks: status === 'onboarding' ? state.templateTasks.map(t => ({ ...t, id: generateId(), isCompleted: false })) : [],
            offboardingTasks: status === 'offboarding' ? state.offboardingTemplateTasks.map(t => ({ ...t, id: generateId(), isCompleted: false })) : []
        };
        setState(prev => ({ ...prev, employees: [newEmployee, ...prev.employees], view: status === 'onboarding' ? 'employees' : 'offboarding', employeeSearchQuery: '' }));
        setIsEmpModalOpen(false);
    };

    const updateEmployee = (id: string, name: string, departmentId: string) => {
        setState(prev => ({
            ...prev,
            employees: prev.employees.map(e => e.id === id ? { ...e, name, departmentId } : e)
        }));
        setEditingEmployee(null);
    };

    const deleteEmployee = (id: string) => {
        setState(prev => ({ ...prev, employees: prev.employees.filter(e => e.id !== id) }));
    };

    const startOffboarding = (id: string) => {
        setState(prev => ({
            ...prev,
            employees: prev.employees.map(e => {
                if (e.id === id) {
                    return {
                        ...e,
                        status: 'offboarding',
                        offboardingTasks: prev.offboardingTemplateTasks.map(t => ({ ...t, id: generateId(), isCompleted: false }))
                    };
                }
                return e;
            })
        }));
    };

    const addDepartment = (name: string) => {
        const newDept: Department = { id: generateId(), name };
        setState(prev => ({ ...prev, departments: [...prev.departments, newDept] }));
        setIsAddDeptModalOpen(false);
    };

    const deleteDepartment = (id: string) => {
        setState(prev => ({ ...prev, departments: prev.departments.filter(d => d.id !== id) }));
    };

    const toggleEmployeeTask = (taskId: string) => {
        if (!state.selectedEmployeeId) return;
        setState(prev => ({
            ...prev,
            employees: prev.employees.map(emp => {
                if (emp.id === prev.selectedEmployeeId) {
                    const taskType = emp.status === 'offboarding' ? 'offboardingTasks' : 'tasks';
                    return {
                        ...emp,
                        [taskType]: emp[taskType].map(t => {
                            if (t.id === taskId) {
                                const nextStatus = !t.isCompleted;
                                return {
                                    ...t,
                                    isCompleted: nextStatus,
                                    completedBy: nextStatus ? prev.user?.name : undefined,
                                    completedAt: nextStatus ? new Date().toLocaleString('nl-BE') : undefined
                                };
                            }
                            return t;
                        })
                    };
                }
                return emp;
            })
        }));
    };

    if (!state.user) {
        return <LoginScreen onLogin={handleLogin} admins={state.admins} departments={state.departments} />;
    }

    return (
        <div className={`app-container ${state.theme}`}>
            <Navbar 
                user={state.user} 
                onLogout={handleLogout} 
                setView={(v) => setState(p => ({ ...p, view: v, selectedEmployeeId: null, employeeSearchQuery: '' }))} 
                currentView={state.view} 
                theme={state.theme}
                onToggleTheme={toggleTheme}
            />

            <main className="main-content">
                {/* Employee Lists */}
                {(state.view === 'employees' || state.view === 'offboarding') && (
                    <div className="employees-view">
                        <header className="dashboard-header">
                            <div className="header-flex">
                                <h1>{state.view === 'employees' ? 'Medewerkers Onboarding' : 'Medewerkers Offboarding'}</h1>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <div className="search-container" style={{ position: 'relative' }}>
                                        <input 
                                            type="text" 
                                            placeholder="Medewerker zoeken..." 
                                            className="search-input"
                                            value={state.employeeSearchQuery}
                                            onChange={(e) => setState(p => ({ ...p, employeeSearchQuery: e.target.value }))}
                                            style={{
                                                padding: '10px 16px',
                                                borderRadius: '4px',
                                                border: '1px solid var(--border)',
                                                background: 'var(--input-bg)',
                                                color: 'var(--text)',
                                                width: '240px'
                                            }}
                                        />
                                        {state.employeeSearchQuery && (
                                            <button 
                                                onClick={() => setState(p => ({ ...p, employeeSearchQuery: '' }))}
                                                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                                            >
                                                &times;
                                            </button>
                                        )}
                                    </div>
                                    <button className="primary-action-btn" onClick={() => { setEmpModalStatus(state.view === 'employees' ? 'onboarding' : 'offboarding'); setIsEmpModalOpen(true); }}>
                                        + Nieuwe Medewerker
                                    </button>
                                </div>
                            </div>
                        </header>
                        <div className="employee-list-container">
                            <table className="employee-table">
                                <thead>
                                    <tr>
                                        <th>Naam</th><th>Dienst</th><th>Datum</th><th>Voortgang</th><th style={{ textAlign: 'right' }}>Acties</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {accessibleEmployees.length > 0 ? accessibleEmployees.map(emp => {
                                        const currentTasks = emp.status === 'offboarding' ? emp.offboardingTasks : emp.tasks;
                                        const visibleTasks = currentTasks.filter(t => state.user!.role === 'SuperUser' || t.dienst === state.user!.dienstId);
                                        const completed = visibleTasks.filter(t => t.isCompleted).length;
                                        const total = visibleTasks.length;
                                        const percent = total > 0 ? (completed / total) * 100 : 0;
                                        const dept = state.departments.find(d => d.id === emp.departmentId);

                                        return (
                                            <tr key={emp.id} className="employee-row" onClick={() => setState(p => ({ ...p, view: 'checklist', selectedEmployeeId: emp.id }))}>
                                                <td><span className="emp-name-cell">{emp.name}</span></td>
                                                <td><span className="emp-dept-badge">{dept?.name || 'SuperUser'}</span></td>
                                                <td>{emp.startDate}</td>
                                                <td><ProgressBar percent={percent} /></td>
                                                <td style={{ textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                                                    <button className="icon-btn edit" onClick={() => setEditingEmployee(emp)}>✎</button>
                                                    {emp.status === 'onboarding' && (
                                                        <button className="icon-btn offboard" onClick={() => startOffboarding(emp.id)}>Offboarden</button>
                                                    )}
                                                    <button className="icon-btn delete" onClick={() => setConfirmDeleteEmp(emp.id)}>🗑</button>
                                                </td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr><td colSpan={5} style={{textAlign: 'center', padding: '40px', color: 'var(--text-muted)'}}>Geen medewerkers gevonden.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Checklist View */}
                {state.view === 'checklist' && selectedEmployee && (
                    <div className="checklist-view">
                        <button className="back-link" onClick={() => setState(p => ({ ...p, view: selectedEmployee.status === 'offboarding' ? 'offboarding' : 'employees', selectedEmployeeId: null }))}>← Terug</button>
                        <header className="dashboard-header">
                            <div className="header-flex">
                                <h1>Checklist: {selectedEmployee.name}</h1>
                                <div className="incomplete-toggle" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <input 
                                        type="checkbox" 
                                        id="incompleteOnly" 
                                        checked={state.showOnlyIncomplete} 
                                        onChange={(e) => setState(p => ({ ...p, showOnlyIncomplete: e.target.checked }))} 
                                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                    />
                                    <label htmlFor="incompleteOnly" style={{ cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}>Alleen onvoltooid tonen</label>
                                </div>
                            </div>
                            <div className="filters">
                                <div className="filter-group">
                                    <label>Filter Dienst:</label>
                                    <select value={state.filterDienstId} onChange={(e) => setState(p => ({ ...p, filterDienstId: e.target.value }))}>
                                        <option value="All">Alle</option>
                                        {state.departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                    </select>
                                </div>
                                <div className="filter-group">
                                    <label>Categorie:</label>
                                    <select value={state.filterCategory} onChange={(e) => setState(p => ({ ...p, filterCategory: e.target.value as any }))}>
                                        <option value="All">Alle</option>
                                        <option value="Account">Account</option><option value="Hardware">Hardware</option>
                                        <option value="Software">Software</option><option value="Toegang">Toegang</option>
                                    </select>
                                </div>
                            </div>
                        </header>
                        <div className="task-grid">
                            {filteredTasks.length > 0 ? filteredTasks.map(task => (
                                <TaskCard key={task.id} task={task} onToggle={toggleEmployeeTask} departments={state.departments} />
                            )) : (
                                <div style={{textAlign: 'center', padding: '60px', background: 'var(--surface)', borderRadius: '8px', border: '1px dashed var(--border)', color: 'var(--text-muted)'}}>
                                    Geen taken gevonden voor de huidige filters.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Template Managers */}
                {(state.view === 'template_onboarding' || state.view === 'template_offboarding') && (
                    <div className="template-manager">
                        <h1>{state.view === 'template_onboarding' ? 'Onboarding Template' : 'Offboarding Template'}</h1>
                        <div className="add-task-form">
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                const form = e.target as any;
                                const isOff = state.view === 'template_offboarding';
                                const newTask: Task = {
                                    id: generateId(), title: form.title.value, description: form.desc.value,
                                    dienst: form.dienstId.value, category: form.cat.value, isCompleted: false
                                };
                                setState(prev => ({ ...prev, [isOff ? 'offboardingTemplateTasks' : 'templateTasks']: [...prev[isOff ? 'offboardingTemplateTasks' : 'templateTasks'], newTask] }));
                                form.reset();
                            }}>
                                <div className="form-row">
                                    <input name="title" placeholder="Taak Titel" required /><input name="desc" placeholder="Beschrijving" />
                                </div>
                                <div className="form-row">
                                    <select name="dienstId" required>
                                        {state.departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                    </select>
                                    <select name="cat">
                                        <option value="Account">Account</option><option value="Hardware">Hardware</option>
                                        <option value="Software">Software</option><option value="Toegang">Toegang</option>
                                    </select>
                                    <button type="submit" className="primary-action-btn">Toevoegen</button>
                                </div>
                            </form>
                        </div>
                        <div className="task-grid">
                            {(state.view === 'template_onboarding' ? state.templateTasks : state.offboardingTemplateTasks).map(task => (
                                <TaskCard key={task.id} task={task} isTemplate onToggle={() => {}} onDelete={(id) => {
                                    const isOff = state.view === 'template_offboarding';
                                    setState(prev => ({ ...prev, [isOff ? 'offboardingTemplateTasks' : 'templateTasks']: prev[isOff ? 'offboardingTemplateTasks' : 'templateTasks'].filter(t => t.id !== id) }));
                                }} departments={state.departments} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Beheer Views (SuperUser only) */}
                {state.view === 'dept_beheer' && state.user.role === 'SuperUser' && (
                    <div className="admin-beheer">
                        <h1>Beheer Diensten</h1>
                        <button className="primary-action-btn" onClick={() => setIsAddDeptModalOpen(true)}>+ Nieuwe Dienst</button>
                        <div className="employee-list-container" style={{ marginTop: '20px' }}>
                            <table className="employee-table">
                                <thead><tr><th>Naam</th><th style={{ textAlign: 'right' }}>Acties</th></tr></thead>
                                <tbody>
                                    {state.departments.map(d => (
                                        <tr key={d.id}><td><strong>{d.name}</strong></td><td style={{ textAlign: 'right' }}><button className="icon-btn delete" onClick={() => setConfirmDeleteDept(d.id)}>🗑</button></td></tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {state.view === 'admin_beheer' && state.user.role === 'SuperUser' && (
                    <div className="admin-beheer">
                        <h1>Beheer Admins</h1>
                        <button className="primary-action-btn" onClick={() => setIsAddAdminModalOpen(true)}>+ Nieuwe Admin</button>
                        <div className="employee-list-container" style={{ marginTop: '20px' }}>
                            <table className="employee-table">
                                <thead><tr><th>Naam</th><th>Email</th><th>Dienst</th><th style={{ textAlign: 'right' }}>Acties</th></tr></thead>
                                <tbody>
                                    {state.admins.map(a => (
                                        <tr key={a.id}><td><strong>{a.name}</strong></td><td>{a.email}</td><td><span className="emp-dept-badge">{state.departments.find(d => d.id === a.dienstId)?.name}</span></td><td style={{ textAlign: 'right' }}><button className="icon-btn delete" onClick={() => setState(p => ({ ...p, admins: p.admins.filter(ad => ad.id !== a.id) }))}>🗑</button></td></tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>

            {/* Confirmation Dialogs */}
            <ConfirmationModal 
                isOpen={!!confirmDeleteEmp}
                onClose={() => setConfirmDeleteEmp(null)}
                onConfirm={() => confirmDeleteEmp && deleteEmployee(confirmDeleteEmp)}
                title="Medewerker verwijderen"
                message="Weet u zeker dat u deze medewerker wilt verwijderen? Alle voortgang en data gaan onherroepelijk verloren."
                confirmText="Verwijderen"
            />

            <ConfirmationModal 
                isOpen={!!confirmDeleteDept}
                onClose={() => setConfirmDeleteDept(null)}
                onConfirm={() => confirmDeleteDept && deleteDepartment(confirmDeleteDept)}
                title="Dienst verwijderen"
                message="Weet u zeker dat u deze dienst wilt verwijderen? Dit kan invloed hebben op medewerkers en taken die aan deze dienst zijn gekoppeld."
                confirmText="Dienst verwijderen"
            />

            {/* Modals */}
            <Modal isOpen={isEmpModalOpen} onClose={() => setIsEmpModalOpen(false)} title={`Medewerker ${empModalStatus}`}>
                <form className="add-emp-form" onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.target as any;
                    createEmployee(form.name.value, form.deptId.value, empModalStatus);
                }}>
                    <div className="form-group"><label>Naam</label><input name="name" required autoFocus /></div>
                    <div className="form-group">
                        <label>Dienst</label>
                        <select name="deptId">
                            {state.departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                    </div>
                    <div className="modal-footer"><button type="submit" className="primary-action-btn">Aanmaken</button></div>
                </form>
            </Modal>

            <Modal isOpen={isAddDeptModalOpen} onClose={() => setIsAddDeptModalOpen(false)} title="Nieuwe Dienst">
                <form className="add-emp-form" onSubmit={(e) => { e.preventDefault(); addDepartment((e.target as any).name.value); }}>
                    <div className="form-group"><label>Dienst Naam</label><input name="name" required /></div>
                    <div className="modal-footer"><button type="submit" className="primary-action-btn">Toevoegen</button></div>
                </form>
            </Modal>

            <Modal isOpen={isAddAdminModalOpen} onClose={() => setIsAddAdminModalOpen(false)} title="Nieuwe Admin">
                <form className="add-emp-form" onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.target as any;
                    const newAdmin: User = { id: generateId(), name: form.name.value, email: form.email.value, role: form.role.value, dienstId: form.dienstId.value };
                    setState(p => ({ ...p, admins: [...p.admins, newAdmin] }));
                    setIsAddAdminModalOpen(false);
                }}>
                    <div className="form-group"><label>Naam</label><input name="name" required /></div>
                    <div className="form-group"><label>Email</label><input name="email" type="email" required /></div>
                    <div className="form-group">
                        <label>Dienst</label>
                        <select name="dienstId">{state.departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
                    </div>
                    <div className="form-group">
                        <label>Rol</label>
                        <select name="role"><option value="Admin">Admin</option><option value="SuperUser">SuperUser (IT)</option></select>
                    </div>
                    <div className="modal-footer"><button type="submit" className="primary-action-btn">Toevoegen</button></div>
                </form>
            </Modal>

            <Modal isOpen={!!editingEmployee} onClose={() => setEditingEmployee(null)} title="Medewerker Bewerken">
                {editingEmployee && (
                    <form className="add-emp-form" onSubmit={(e) => {
                        e.preventDefault();
                        const form = e.target as any;
                        updateEmployee(editingEmployee.id, form.name.value, form.deptId.value);
                    }}>
                        <div className="form-group"><label>Naam</label><input name="name" defaultValue={editingEmployee.name} required /></div>
                        <div className="form-group">
                            <label>Dienst</label>
                            <select name="deptId" defaultValue={editingEmployee.departmentId}>{state.departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
                        </div>
                        <div className="modal-footer"><button type="submit" className="primary-action-btn">Opslaan</button></div>
                    </form>
                )}
            </Modal>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
