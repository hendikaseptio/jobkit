<script lang="ts">
    import './layout.css';
    import { appState } from '$lib/appState.svelte';
    let { children } = $props();
</script>

<div class="min-h-screen flex flex-col">
    <!-- NAVIGATION -->
    <nav class="sticky top-0 z-50 glass no-print border-b border-slate-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16 items-center">
                <div class="flex items-center gap-2">
                    <div class="bg-blue-600 p-2 rounded-lg text-white">
                        <i class="fas fa-briefcase text-xl"></i>
                    </div>
                    <span class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">JobKit</span>
                </div>
                <div class="hidden md:flex gap-4">
                    <button 
                        onclick={() => appState.activeTab = 'profile'} 
                        class="px-4 py-2 rounded-xl font-medium transition-all hover:bg-blue-50 {appState.activeTab === 'profile' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : ''}"
                    >
                        <i class="fas fa-user-circle mr-2"></i>Profil
                    </button>
                    <button 
                        onclick={() => appState.activeTab = 'cv'} 
                        class="px-4 py-2 rounded-xl font-medium transition-all hover:bg-blue-50 {appState.activeTab === 'cv' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : ''}"
                    >
                        <i class="fas fa-file-invoice mr-2"></i>CV Generator
                    </button>
                    <button 
                        onclick={() => appState.activeTab = 'lamaran'} 
                        class="px-4 py-2 rounded-xl font-medium transition-all hover:bg-blue-50 {appState.activeTab === 'lamaran' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : ''}"
                    >
                        <i class="fas fa-envelope-open-text mr-2"></i>Surat Lamaran
                    </button>
                </div>
            </div>
        </div>
    </nav>

    <main class="flex-1 pb-20 md:pb-0">
        {@render children()}
    </main>

    <!-- MOBILE DOCK MENU -->
    <div class="fixed bottom-0 left-0 right-0 z-50 glass md:hidden no-print border-t border-slate-200 px-4 py-2">
        <div class="flex justify-around items-center h-16">
            <button 
                onclick={() => appState.activeTab = 'profile'} 
                class="flex flex-col items-center gap-1 transition-all {appState.activeTab === 'profile' ? 'text-blue-600' : 'text-slate-400'}"
            >
                <i class="fas fa-user-circle text-xl"></i>
                <span class="text-[10px] font-bold uppercase tracking-wider">Profil</span>
            </button>
            
            <button 
                onclick={() => appState.activeTab = 'cv'} 
                class="flex flex-col items-center gap-1 transition-all {appState.activeTab === 'cv' ? 'text-blue-600' : 'text-slate-400'}"
            >
                <i class="fas fa-file-invoice text-xl"></i>
                <span class="text-[10px] font-bold uppercase tracking-wider">CV</span>
            </button>

            <button 
                onclick={() => appState.activeTab = 'lamaran'} 
                class="flex flex-col items-center gap-1 transition-all {appState.activeTab === 'lamaran' ? 'text-blue-600' : 'text-slate-400'}"
            >
                <i class="fas fa-envelope-open-text text-xl"></i>
                <span class="text-[10px] font-bold uppercase tracking-wider">Lamaran</span>
            </button>
        </div>
    </div>

    <footer class="no-print bg-white border-t border-slate-100 py-12 mt-auto">
        <div class="max-w-7xl mx-auto px-4 text-center">
            <div class="flex justify-center gap-6 mb-6">
                <a href="https://github.com/hendikaseptio" target="_blank" rel="noopener noreferrer" class="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all border border-slate-100">
                    <i class="fab fa-github"></i>
                </a>
                <a href="https://www.instagram.com/hendika_septio/" target="_blank" rel="noopener noreferrer" class="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-pink-50 hover:text-pink-600 transition-all border border-slate-100">
                    <i class="fab fa-instagram"></i>
                </a>
                <a href="https://www.youtube.com/@hendikaseptio5135" target="_blank" rel="noopener noreferrer" class="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all border border-slate-100">
                    <i class="fab fa-youtube"></i>
                </a>
            </div>
            <p class="text-slate-500 font-medium mb-2">Developed by <span class="text-blue-600 font-bold">Hendika Septio</span></p>
            <p class="text-slate-400 text-xs tracking-widest uppercase font-semibold">&copy; 2026 JobKit Portal - Svelte 5 Power</p>
        </div>
    </footer>
</div>
