<script lang="ts">
    import { appState } from '$lib/appState.svelte';

    const keywords = {
        it: ['Javascript', 'React', 'Node.js', 'SQL', 'Git', 'Agile', 'Problem Solving', 'API', 'Docker', 'Cloud Computing'],
        admin: ['Microsoft Office', 'Data Entry', 'Scheduling', 'Communication', 'Organization', 'Customer Service', 'Filing', 'Budgeting'],
        marketing: ['SEO', 'Content Strategy', 'Social Media', 'Analytics', 'Copywriting', 'Public Relations', 'Email Marketing', 'Market Research']
    };

    let selectedRole = $state('');

    function addKeyword(word: string) {
        const current = (appState.user.skills || '').trim();
        if (current) {
            if (!current.toLowerCase().includes(word.toLowerCase())) {
                appState.user.skills = current + ', ' + word;
            }
        } else {
            appState.user.skills = word;
        }
    }

    let skillsArray = $derived((appState.user.skills || '').split(',').map(s => s.trim()).filter(s => s !== ''));
</script>

<div class="grid grid-cols-1 xl:grid-cols-2 gap-8">
    <!-- INPUT SIDE -->
    <div class="space-y-6 no-print">
        <div class="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-bold">Sesuaikan CV</h3>
                <select bind:value={appState.cvTemplate} class="text-sm border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="modern">Modern (Sidebar)</option>
                    <option value="ats">ATS (Hitam Putih)</option>
                    <option value="fresh">Fresh Graduate</option>
                    <option value="formal">Formal Corporate</option>
                </select>
            </div>

            <div class="space-y-6">
                <div>
                    <label for="cv-edu" class="block text-sm font-semibold text-slate-700 mb-2">Pendidikan Terakhir</label>
                    <input id="cv-edu" type="text" bind:value={appState.user.education} class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50" placeholder="Contoh: S1 Teknik Informatika" />
                </div>
                <div>
                    <label for="cv-summary" class="block text-sm font-semibold text-slate-700 mb-2">Deskripsi Diri</label>
                    <textarea id="cv-summary" bind:value={appState.user.summary} class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50" rows="4" placeholder="Ceritakan tentang dirimu..."></textarea>
                </div>
                <div>
                    <label for="cv-exp" class="block text-sm font-semibold text-slate-700 mb-2">Pengalaman Kerja</label>
                    <textarea id="cv-exp" bind:value={appState.user.experience} class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50" rows="5" placeholder="Sebutkan riwayat pekerjaan..."></textarea>
                </div>
                <div>
                    <label for="cv-skills" class="block text-sm font-semibold text-slate-700 mb-2">Keahlian (Pisahkan dengan koma)</label>
                    <textarea id="cv-skills" bind:value={appState.user.skills} class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50" rows="3" placeholder="Contoh: Web Design, Photoshop..."></textarea>
                </div>
                <button onclick={() => window.print()} class="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-xl font-bold shadow-lg shadow-green-100 transition-all flex items-center justify-center gap-2">
                    <i class="fas fa-file-pdf"></i> Download PDF
                </button>
            </div>
        </div>

        <!-- ATS HELPER -->
        <div class="bg-slate-900 text-white p-8 rounded-3xl shadow-xl">
            <h4 class="font-bold mb-4 flex items-center gap-2 text-blue-400">
                <i class="fas fa-magic"></i> ATS Optimizer Helper
            </h4>
            <div class="space-y-4">
                <select bind:value={selectedRole} class="w-full bg-slate-800 border-slate-700 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">-- Pilih Bidang Kerja --</option>
                    <option value="it">Teknologi Informasi (IT)</option>
                    <option value="admin">Administrasi / Office</option>
                    <option value="marketing">Marketing & Sales</option>
                </select>
                
                {#if selectedRole}
                    <div class="flex flex-wrap gap-2">
                        {#each keywords[selectedRole as keyof typeof keywords] as word}
                            <button 
                                onclick={() => addKeyword(word)}
                                class="bg-slate-800 hover:bg-blue-600 border border-slate-700 text-xs px-2 py-1 rounded transition-all flex items-center gap-1"
                            >
                                {word} <i class="fas fa-plus text-[10px] opacity-50"></i>
                            </button>
                        {/each}
                    </div>
                {/if}
            </div>
        </div>
    </div>

    <!-- PREVIEW SIDE -->
    <div class="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden print:shadow-none print:border-none min-h-[29.7cm]">
        <div class="tpl-{appState.cvTemplate}">
            <article id="cv-preview" class="max-w-[21cm] mx-auto transition-all bg-white min-h-[29.7cm]">
                
                {#if appState.cvTemplate === 'ats'}
                    <div class="p-[2cm] text-black font-serif leading-tight">
                        <header class="text-center border-b-2 border-black pb-2 mb-4">
                            <h1 class="text-3xl font-bold uppercase">{appState.user.name || 'NAMA LENGKAP'}</h1>
                            <div class="text-sm mt-1">
                                {appState.user.email} | {appState.user.phone} | {appState.user.address}
                            </div>
                        </header>
                        
                        <section class="mb-4">
                            <h2 class="text-lg font-bold border-b border-black uppercase mb-2">Profil Profesional</h2>
                            <p class="text-sm text-justify whitespace-pre-wrap">{appState.user.summary || '-'}</p>
                        </section>

                        <section class="mb-4">
                            <h2 class="text-lg font-bold border-b border-black uppercase mb-2">Pengalaman Kerja</h2>
                            <div class="text-sm whitespace-pre-wrap">{appState.user.experience || '-'}</div>
                        </section>

                        <section class="mb-4">
                            <h2 class="text-lg font-bold border-b border-black uppercase mb-2">Pendidikan</h2>
                            <p class="text-sm font-bold">{appState.user.education || '-'}</p>
                        </section>

                        <section>
                            <h2 class="text-lg font-bold border-b border-black uppercase mb-2">Keahlian</h2>
                            <p class="text-sm">{appState.user.skills || '-'}</p>
                        </section>
                    </div>

                {:else if appState.cvTemplate === 'formal'}
                    <header class="bg-slate-800 text-white p-10 text-center relative">
                        {#if appState.user.photo}
                            <img src={appState.user.photo} alt="" class="absolute top-10 right-10 w-24 h-24 rounded border-2 border-slate-600 object-cover" />
                        {/if}
                        <h1 class="text-3xl font-bold uppercase tracking-widest">{appState.user.name || 'NAMA LENGKAP'}</h1>
                        <p class="text-slate-400 mt-2">{appState.user.education}</p>
                    </header>
                    <div class="bg-slate-100 p-4 flex justify-center gap-6 text-xs font-semibold text-slate-600 border-b">
                        <span><i class="fas fa-envelope mr-1"></i> {appState.user.email}</span>
                        <span><i class="fas fa-phone mr-1"></i> {appState.user.phone}</span>
                        <span><i class="fas fa-map-marker-alt mr-1"></i> {appState.user.address}</span>
                    </div>
                    <div class="p-10 space-y-8">
                        <section>
                            <h2 class="text-lg font-bold text-slate-800 border-l-4 border-slate-800 pl-3 mb-4 uppercase">Profil</h2>
                            <p class="text-sm text-slate-600 leading-relaxed text-justify whitespace-pre-wrap">{appState.user.summary}</p>
                        </section>
                        <section>
                            <h2 class="text-lg font-bold text-slate-800 border-l-4 border-slate-800 pl-3 mb-4 uppercase">Pengalaman</h2>
                            <div class="text-sm text-slate-600 whitespace-pre-wrap">{appState.user.experience}</div>
                        </section>
                        <section>
                            <h2 class="text-lg font-bold text-slate-800 border-l-4 border-slate-800 pl-3 mb-4 uppercase">Keahlian</h2>
                            <div class="flex flex-wrap gap-2">
                                {#each skillsArray as skill}
                                    <span class="bg-white border border-slate-300 px-3 py-1 rounded text-xs font-medium text-slate-700">{skill}</span>
                                {/each}
                            </div>
                        </section>
                    </div>

                {:else} <!-- MODERN & FRESH -->
                    <div class="flex flex-col md:flex-row min-h-[29.7cm]">
                        <aside class="{appState.cvTemplate === 'fresh' ? 'bg-blue-50 text-slate-800 border-r border-blue-100' : 'bg-slate-900 text-white'} w-full md:w-72 p-8 flex flex-col gap-8">
                            <div class="flex flex-col items-center gap-4">
                                {#if appState.user.photo}
                                    <div class="w-32 h-32 rounded-2xl overflow-hidden border-2 {appState.cvTemplate === 'fresh' ? 'border-blue-200' : 'border-slate-700'}">
                                        <img src={appState.user.photo} alt="" class="w-full h-full object-cover" />
                                    </div>
                                {/if}
                                <div class="text-center">
                                    <h1 class="text-xl font-bold uppercase tracking-tight">{appState.user.name || 'NAMA LENGKAP'}</h1>
                                    <p class="text-xs {appState.cvTemplate === 'fresh' ? 'text-blue-600' : 'text-slate-400'} mt-1 uppercase">{appState.user.education}</p>
                                </div>
                            </div>

                            <section>
                                <h3 class="text-xs font-bold {appState.cvTemplate === 'fresh' ? 'text-blue-600' : 'text-blue-400'} uppercase tracking-widest mb-3 border-b border-current opacity-50 pb-1">Kontak</h3>
                                <div class="space-y-3 text-xs opacity-90">
                                    <p class="flex items-center gap-2"><i class="fas fa-envelope w-4"></i> {appState.user.email}</p>
                                    <p class="flex items-center gap-2"><i class="fas fa-phone w-4"></i> {appState.user.phone}</p>
                                    <p class="flex items-center gap-2"><i class="fas fa-map-marker-alt w-4"></i> {appState.user.address}</p>
                                </div>
                            </section>

                            <section>
                                <h3 class="text-xs font-bold {appState.cvTemplate === 'fresh' ? 'text-blue-600' : 'text-blue-400'} uppercase tracking-widest mb-3 border-b border-current opacity-50 pb-1">Keahlian</h3>
                                <div class="flex flex-wrap gap-2">
                                    {#each skillsArray as skill}
                                        <span class="{appState.cvTemplate === 'fresh' ? 'bg-blue-100 text-blue-700' : 'bg-blue-900 text-blue-100'} px-2 py-1 rounded text-[10px] font-bold">
                                            {skill}
                                        </span>
                                    {/each}
                                </div>
                            </section>
                        </aside>

                        <main class="flex-1 p-10 flex flex-col gap-8 bg-white">
                            <section>
                                <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                                    <span class="w-8 h-1 bg-blue-600 rounded"></span>
                                    PROFIL PROFESIONAL
                                </h2>
                                <p class="text-sm text-slate-600 leading-relaxed text-justify whitespace-pre-wrap">{appState.user.summary || 'Belum ada deskripsi.'}</p>
                            </section>

                            <section>
                                <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                                    <span class="w-8 h-1 bg-blue-600 rounded"></span>
                                    PENGALAMAN KERJA
                                </h2>
                                <div class="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{appState.user.experience}</div>
                            </section>

                            <section>
                                <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                                    <span class="w-8 h-1 bg-blue-600 rounded"></span>
                                    PENDIDIKAN
                                </h2>
                                <p class="text-sm font-semibold text-slate-800">{appState.user.education}</p>
                            </section>
                        </main>
                    </div>
                {/if}

            </article>
        </div>
    </div>
</div>

<style>
    /* Add print specific font overrides for ATS if needed */
    .tpl-ats {
        font-family: 'Times New Roman', serif;
    }
</style>
