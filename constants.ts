
import { Task } from './types';

export const INITIAL_TASKS: Task[] = [
    {
        id: '1',
        title: 'Webmin: Gebruiker toevoegen aan LDAP',
        description: 'Automatische synchronisatie om middernacht.',
        dienst: 'IT',
        category: 'Account',
        isCompleted: false
    },
    {
        id: '2',
        title: 'Badge aanmaken',
        description: 'Fysieke badge printen en registreren.',
        dienst: 'Logistiek',
        category: 'Toegang',
        isCompleted: false
    },
    {
        id: '3',
        title: 'Orbit setup',
        description: 'Toevoegen aan relevante Orbit kanalen.',
        dienst: 'LIK',
        category: 'Software',
        isCompleted: false
    }
];

export const INITIAL_OFFBOARDING_TASKS: Task[] = [
    {
        id: 'o1',
        title: 'LDAP Account deactiveren',
        description: 'Account blokkeren in Webmin.',
        dienst: 'IT',
        category: 'Account',
        isCompleted: false
    },
    {
        id: 'o2',
        title: 'Badge innemen en deactiveren',
        description: 'Fysieke badge terugontvangen.',
        dienst: 'Logistiek',
        category: 'Toegang',
        isCompleted: false
    },
    {
        id: 'o3',
        title: 'Hardware inleveren (Laptop/GSM)',
        description: 'Controleren op schade en deactiveren.',
        dienst: 'LIK',
        category: 'Hardware',
        isCompleted: false
    }
];
