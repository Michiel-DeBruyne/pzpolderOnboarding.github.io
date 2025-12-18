
export type Category = 'Account' | 'Software' | 'Hardware' | 'Toegang';
export type EmployeeStatus = 'onboarding' | 'offboarding';
export type Theme = 'light' | 'dark';

export interface Department {
    id: string;
    name: string;
}

export interface Task {
    id: string;
    title: string;
    description?: string;
    dienst: string; // Veranderd naar string voor dynamische koppeling
    category: Category;
    isCompleted: boolean;
    completedBy?: string;
    completedAt?: string;
}

export interface Employee {
    id: string;
    name: string;
    departmentId: string; // Gekoppeld aan Department.id
    startDate: string;
    status: EmployeeStatus;
    tasks: Task[];
    offboardingTasks: Task[];
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    dienstId: string; // Gekoppeld aan Department.id
}

export interface AppState {
    user: User | null;
    departments: Department[];
    templateTasks: Task[];
    offboardingTemplateTasks: Task[];
    employees: Employee[];
    admins: User[];
    view: 'employees' | 'offboarding' | 'checklist' | 'template_onboarding' | 'template_offboarding' | 'admin_beheer' | 'dept_beheer';
    selectedEmployeeId: string | null;
    filterDienstId: string | 'All';
    filterCategory: Category | 'All';
    theme: Theme;
    // New fields
    employeeSearchQuery: string;
    showOnlyIncomplete: boolean;
}

export interface Artifact {
    id: string;
    status: 'streaming' | 'completed';
    html: string;
    styleName: string;
}
