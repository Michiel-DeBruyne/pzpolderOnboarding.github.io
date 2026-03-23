export type Role = 'admin' | 'superuser' | 'user';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  departmentId?: string;
}

export interface Department {
  id: string;
  name: string;
  defaultEmail?: string;
}

export type EmployeeStatus = 'onboarding' | 'offboarding' | 'completed';

export interface Employee {
  id: string;
  name: string;
  email?: string;
  departmentId: string;
  status: EmployeeStatus;
  startDate: string;
  reason: string;
  createdBy: string;
  createdAt: any;
  welcomeEmailSent?: boolean;
  exitSurveySent?: boolean;
}

export interface Task {
  id: string;
  employeeId: string;
  title: string;
  description?: string;
  category: 'Account' | 'Hardware' | 'Software' | 'Toegang' | 'Other';
  departmentId: string;
  dateType?: 'relative' | 'fixed';
  relativeDueDate?: number;
  dueDate?: string;
  notificationEmail?: string;
  isCompleted: boolean;
  completedBy?: string;
  completedAt?: any;
  docLink?: string;
  reminderSent?: boolean;
  isPrerequisite?: boolean;
}

export interface TemplateTask {
  id: string;
  title: string;
  description?: string;
  category: string;
  departmentId: string;
  type: 'onboarding' | 'offboarding';
  dateType?: 'relative' | 'fixed';
  relativeDueDate?: number;
  dueDate?: string;
  applicableReasons?: string[];
  docLink?: string;
  isPrerequisite?: boolean;
}

export interface EmailTemplate {
  id: string;
  type: 'welcome' | 'exit';
  subject: string;
  body: string;
}

export interface SmtpConfig {
  id: string;
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
}
