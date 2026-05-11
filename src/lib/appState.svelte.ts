import { browser } from '$app/environment';

export interface UserData {
    name: string;
    email: string;
    phone: string;
    address: string;
    education: string;
    photo: string | null;
    summary: string;
    experience: string;
    skills: string;
}

export interface LamaranData {
    date: string;
    position: string;
    company: string;
    companyAddress: string;
    reason: string;
}

const DEFAULT_USER_DATA: UserData = {
    name: '',
    email: '',
    phone: '',
    address: '',
    education: '',
    photo: null,
    summary: '',
    experience: '',
    skills: ''
};

const DEFAULT_LAMARAN_DATA: LamaranData = {
    date: '',
    position: '',
    company: '',
    companyAddress: '',
    reason: ''
};

// Use Runes for global state
class JobKitState {
    user = $state<UserData>(DEFAULT_USER_DATA);
    lamaran = $state<LamaranData>(DEFAULT_LAMARAN_DATA);
    activeTab = $state<'profile' | 'cv' | 'lamaran'>('profile');
    cvTemplate = $state<'modern' | 'ats' | 'fresh' | 'formal'>('modern');

    constructor() {
        if (browser) {
            const savedUser = localStorage.getItem('jobkit_user');
            if (savedUser) this.user = { ...DEFAULT_USER_DATA, ...JSON.parse(savedUser) };
            
            const savedLamaran = localStorage.getItem('jobkit_lamaran');
            if (savedLamaran) this.lamaran = { ...DEFAULT_LAMARAN_DATA, ...JSON.parse(savedLamaran) };

            const savedSettings = localStorage.getItem('jobkit_settings');
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                if (settings.template) this.cvTemplate = settings.template;
            }

            // Sync back to localStorage on change
            $effect.root(() => {
                $effect(() => {
                    localStorage.setItem('jobkit_user', JSON.stringify(this.user));
                });
                $effect(() => {
                    localStorage.setItem('jobkit_lamaran', JSON.stringify(this.lamaran));
                });
                $effect(() => {
                    localStorage.setItem('jobkit_settings', JSON.stringify({ template: this.cvTemplate }));
                });
            });
        }
    }
}

export const appState = new JobKitState();
