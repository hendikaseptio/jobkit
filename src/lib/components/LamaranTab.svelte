<script lang="ts">
    import { appState } from '$lib/appState.svelte';
    import { onMount } from 'svelte';

    onMount(() => {
        if (!appState.lamaran.date) {
            const now = new Date();
            appState.lamaran.date = `Jakarta, ${now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`;
        }
    });

    let newAttachment = $state('');
    let editingIndex = $state<number | null>(null);
    let editingValue = $state('');
    let showModal = $state(false);

    function addAttachment() {
        if (newAttachment.trim()) {
            appState.lamaran.attachments = [...appState.lamaran.attachments, newAttachment.trim()];
            newAttachment = '';
            showModal = false;
        }
    }

    function removeAttachment(index: number) {
        const name = appState.lamaran.attachments[index];
        appState.lamaran.attachments = appState.lamaran.attachments.filter((_, i) => i !== index);
        appState.deleteAttachment(name);
        if (editingIndex === index) editingIndex = null;
    }

    function startEdit(index: number, value: string) {
        editingIndex = index;
        editingValue = value;
    }

    function saveEdit() {
        if (editingIndex !== null && editingValue.trim()) {
            const oldName = appState.lamaran.attachments[editingIndex];
            const newName = editingValue.trim();
            
            const arr = [...appState.lamaran.attachments];
            arr[editingIndex] = newName;
            appState.lamaran.attachments = arr;

            // Handle data migration in IndexedDB if it exists
            if (appState.attachmentData[oldName]) {
                const data = appState.attachmentData[oldName];
                appState.deleteAttachment(oldName);
                appState.saveAttachment(newName, data);
            }
        }
        editingIndex = null;
    }

    function moveAttachment(index: number, direction: 'up' | 'down') {
        const arr = [...appState.lamaran.attachments];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex >= 0 && newIndex < arr.length) {
            [arr[index], arr[newIndex]] = [arr[newIndex], arr[index]];
            appState.lamaran.attachments = arr;
            if (editingIndex === index) editingIndex = newIndex;
            else if (editingIndex === newIndex) editingIndex = index;
        }
    }

    function handleFileUpload(event: Event) {
        const input = event.target as HTMLInputElement;
        const files = input.files;
        if (files && files.length > 0) {
            Array.from(files).forEach((file, index) => {
                const reader = new FileReader();
                reader.onload = async (e) => {
                    const data = e.target?.result as string;
                    
                    // Prioritaskan nama yang diketik user. 
                    // Jika upload banyak file sekaligus, file pertama pakai nama input, sisanya pakai nama asli.
                    let name = (index === 0 && newAttachment.trim()) ? newAttachment.trim() : file.name;
                    
                    // Cek duplikasi nama
                    if (appState.lamaran.attachments.includes(name)) {
                        name = `${name} (${new Date().getTime().toString().slice(-3)})`;
                    }

                    appState.lamaran.attachments = [...appState.lamaran.attachments, name];
                    await appState.saveAttachment(name, data);
                    
                    // Reset input setelah file pertama diproses
                    if (index === 0) newAttachment = '';
                };
                reader.readAsDataURL(file);
            });
            input.value = ''; 
            showModal = false;
        }
    }
</script>

<div class="grid grid-cols-1 xl:grid-cols-2 gap-8">
    <div class="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 no-print">
        <h3 class="text-xl font-bold mb-6">Detail Lamaran</h3>
        <div class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label for="lamaran-date" class="block text-sm font-semibold text-slate-700 mb-1">Tempat, Tanggal</label>
                    <input id="lamaran-date" type="text" bind:value={appState.lamaran.date} class="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none bg-slate-50 focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                    <label for="lamaran-pos" class="block text-sm font-semibold text-slate-700 mb-1">Posisi Dilamar</label>
                    <input id="lamaran-pos" type="text" bind:value={appState.lamaran.position} class="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none bg-slate-50 focus:ring-2 focus:ring-blue-500" placeholder="Contoh: Software Engineer" />
                </div>
            </div>
            <div>
                <label for="lamaran-company" class="block text-sm font-semibold text-slate-700 mb-1">Nama Perusahaan</label>
                <input id="lamaran-company" type="text" bind:value={appState.lamaran.company} class="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none bg-slate-50 focus:ring-2 focus:ring-blue-500" placeholder="PT. Maju Bersama" />
            </div>
            <div>
                <label for="lamaran-addr" class="block text-sm font-semibold text-slate-700 mb-1">Alamat Perusahaan</label>
                <textarea id="lamaran-addr" bind:value={appState.lamaran.companyAddress} class="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none bg-slate-50 focus:ring-2 focus:ring-blue-500" rows="2"></textarea>
            </div>
            <div>
                <label for="lamaran-reason" class="block text-sm font-semibold text-slate-700 mb-1">Alasan Melamar / Deskripsi Tambahan</label>
                <textarea id="lamaran-reason" bind:value={appState.lamaran.reason} class="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none bg-slate-50 focus:ring-2 focus:ring-blue-500" rows="4" placeholder="Saya tertarik melamar karena..."></textarea>
            </div>

            <!-- ATTACHMENTS MANAGEMENT -->
            <div class="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                <div class="flex items-center justify-between mb-4">
                    <h4 class="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <i class="fas fa-paperclip text-blue-600"></i> Lampiran Berkas
                    </h4>
                    <button 
                        onclick={() => showModal = true}
                        class="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-all flex items-center gap-1.5 font-semibold"
                    >
                        <i class="fas fa-plus"></i> Tambah
                    </button>
                </div>
                
                <div class="space-y-2">
                    {#if appState.lamaran.attachments.length === 0}
                        <p class="text-center py-4 text-xs text-slate-400 italic">Belum ada lampiran</p>
                    {/if}
                    {#each appState.lamaran.attachments as item, i}
                        <div class="flex items-center justify-between bg-white p-2 px-3 rounded-lg border border-slate-100 shadow-sm group">
                            {#if editingIndex === i}
                                <div class="flex-1 flex gap-1">
                                    <input 
                                        type="text" 
                                        bind:value={editingValue} 
                                        onkeydown={(e) => e.key === 'Enter' && saveEdit()}
                                        onblur={saveEdit}
                                        class="flex-1 px-2 py-1 text-sm border border-blue-300 rounded outline-none focus:ring-1 focus:ring-blue-500"
                                        autofocus
                                    />
                                </div>
                            {:else}
                                <span class="text-sm text-slate-600">{i + 1}. {item}</span>
                            {/if}
                            
                            <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all ml-4">
                                {#if editingIndex !== i}
                                    <button onclick={() => startEdit(i, item)} class="p-1 text-slate-400 hover:text-blue-600" title="Rename">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                {/if}
                                <button onclick={() => moveAttachment(i, 'up')} disabled={i === 0} class="p-1 text-slate-400 hover:text-blue-600 disabled:opacity-30">
                                    <i class="fas fa-chevron-up"></i>
                                </button>
                                <button onclick={() => moveAttachment(i, 'down')} disabled={i === appState.lamaran.attachments.length - 1} class="p-1 text-slate-400 hover:text-blue-600 disabled:opacity-30">
                                    <i class="fas fa-chevron-down"></i>
                                </button>
                                <button onclick={() => removeAttachment(i)} class="p-1 text-slate-400 hover:text-red-600">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>

            <!-- MODAL TAMBAH LAMPIRAN -->
            {#if showModal}
                <div class="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <!-- Backdrop -->
                    <!-- svelte-ignore a11y_click_events_have_key_events -->
                    <!-- svelte-ignore a11y_no_static_element_interactions -->
                    <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onclick={() => showModal = false}></div>
                    
                    <!-- Modal Content -->
                    <div class="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div class="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 class="font-bold text-slate-800 flex items-center gap-2">
                                <i class="fas fa-file-circle-plus text-blue-600"></i> Tambah Lampiran
                            </h3>
                            <button onclick={() => showModal = false} class="text-slate-400 hover:text-slate-600">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        
                        <div class="p-8 space-y-6">
                            <div>
                                <label for="modal-name" class="block text-sm font-semibold text-slate-700 mb-2">Nama Berkas</label>
                                <input 
                                    id="modal-name"
                                    type="text" 
                                    bind:value={newAttachment} 
                                    placeholder="Contoh: Sertifikat TOEFL" 
                                    class="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50" 
                                />
                            </div>
                            
                            <div class="relative">
                                <div class="absolute inset-0 flex items-center"><span class="w-full border-t border-slate-100"></span></div>
                                <div class="relative flex justify-center text-xs uppercase"><span class="bg-white px-2 text-slate-400 font-bold">Atau</span></div>
                            </div>
                            
                            <label class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 hover:border-blue-400 transition-all group">
                                <div class="flex flex-col items-center justify-center pt-5 pb-6">
                                    <i class="fas fa-cloud-upload-alt text-3xl text-slate-300 group-hover:text-blue-500 mb-2"></i>
                                    <p class="text-sm text-slate-500"><span class="font-semibold">Klik untuk upload</span> berkas</p>
                                    <p class="text-xs text-slate-400 mt-1">PDF, JPG, PNG up to 5MB</p>
                                </div>
                                <input type="file" multiple class="hidden" onchange={handleFileUpload} />
                            </label>
                        </div>
                        
                        <div class="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                            <button onclick={() => showModal = false} class="flex-1 px-4 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-all">
                                Batal
                            </button>
                            <button onclick={addAttachment} class="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">
                                Simpan
                            </button>
                        </div>
                    </div>
                </div>
            {/if}

            <button onclick={() => window.print()} class="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2">
                <i class="fas fa-print"></i> Cetak Surat Lamaran
            </button>
        </div>
    </div>

    <div class="bg-white p-12 rounded-xl shadow-lg border border-slate-100 print:p-0 print:shadow-none min-h-[29.7cm]">
        <div id="lamaran-preview" class="max-w-[21cm] mx-auto text-slate-900 leading-relaxed">
            <div class="text-right mb-8">
                <p>{appState.lamaran.date || 'Jakarta, 10 Mei 2026'}</p>
            </div>

            <div class="mb-8">
                <p>Kepada Yth.<br>
                HRD <span class="font-bold">{appState.lamaran.company || 'Nama Perusahaan'}</span><br>
                <span>{appState.lamaran.companyAddress || 'Alamat Perusahaan'}</span></p>
            </div>

            <div class="mb-6">
                <p>Perihal: <span class="font-bold">Lamaran Pekerjaan - <span>{appState.lamaran.position || 'Posisi'}</span></span></p>
            </div>

            <p class="mb-4">Dengan hormat,</p>

            <p class="mb-4">Saya yang bertanda tangan di bawah ini:</p>
            
            <div class="ml-8 mb-6 space-y-1">
                <div class="flex">
                    <span class="w-32">Nama</span>
                    <span class="mr-2">:</span>
                    <span class="font-semibold">{appState.user.name || '-'}</span>
                </div>
                <div class="flex">
                    <span class="w-32">Email</span>
                    <span class="mr-2">:</span>
                    <span class="break-all">{appState.user.email || '-'}</span>
                </div>
                <div class="flex">
                    <span class="w-32">Telepon</span>
                    <span class="mr-2">:</span>
                    <span>{appState.user.phone || '-'}</span>
                </div>
                <div class="flex">
                    <span class="w-32">Pendidikan</span>
                    <span class="mr-2">:</span>
                    <span>{appState.user.education || '-'}</span>
                </div>
            </div>

            <p class="mb-4 text-justify">
                Berdasarkan informasi yang saya dapatkan, saya bermaksud untuk melamar posisi <b>{appState.lamaran.position || 'Posisi'}</b> di <b>{appState.lamaran.company || 'Nama Perusahaan'}</b>. 
                <span>{appState.lamaran.reason || 'Saya memiliki latar belakang pendidikan dan pengalaman yang relevan untuk berkontribusi bagi perusahaan.'}</span>
            </p>

            <p class="mb-8">Besar harapan saya untuk dapat mendiskusikan kualifikasi saya lebih lanjut dalam sesi wawancara. Atas perhatian Bapak/Ibu, saya ucapkan terima kasih.</p>

            <div class="mt-12">
                <p>Hormat saya,</p>
                <div class="h-24"></div>
                <p class="font-bold underline">{appState.user.name || 'Nama Lengkap'}</p>
            </div>

            {#if appState.lamaran.attachments.length > 0}
                <div class="mt-8 pt-6 border-t border-slate-100 text-sm text-slate-600">
                    <p class="font-bold mb-2">Lampiran:</p>
                    <ul class="list-none space-y-1">
                        {#each appState.lamaran.attachments as item, i}
                            <li>{i + 1}. {item}</li>
                        {/each}
                    </ul>
                </div>
            {/if}
        </div>

        <!-- VISUAL ATTACHMENTS (New Pages) -->
        <div class="mt-10">
            {#each appState.lamaran.attachments as item}
                {#if appState.attachmentData[item]}
                    <div class="print-page-container flex flex-col items-center">
                        <p class="text-xs text-slate-400 mb-4 no-print text-center">--- Halaman Lampiran: {item} ---</p>
                        <div class="max-w-full bg-white print:shadow-none shadow-sm border border-slate-100 rounded-lg overflow-hidden">
                            <img src={appState.attachmentData[item]} alt={item} class="w-full h-auto object-contain max-h-[26cm]" />
                        </div>
                    </div>
                {/if}
            {/each}
        </div>
    </div>
</div>

<style>
    @media print {
        .print-page-container {
            break-before: page;
            display: block !important;
            padding: 1.5cm 0 !important;
        }
        /* Memberikan margin buatan (padding) agar teks tidak mepet pinggir kertas */
        #lamaran-preview {
            padding: 1.5cm !important;
            margin: 0 !important;
            max-width: none !important;
        }
        img {
            display: block;
            margin: 0 auto;
            max-width: 100% !important;
            max-height: 26cm !important;
            object-fit: contain;
        }
    }
</style>
