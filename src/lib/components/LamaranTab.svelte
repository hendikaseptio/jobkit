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
                    let name = index === 0 && newAttachment.trim() ? newAttachment.trim() : file.name;

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
    function handleReupload(index: number, event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const data = e.target?.result as string;
                const name = appState.lamaran.attachments[index];
                await appState.saveAttachment(name, data);
            };
            reader.readAsDataURL(file);
        }
        input.value = '';
    }

    let copyText = $state('Copy');
    let emailBodyContent = $derived(`Yth. HRD ${appState.lamaran.company || 'Bapak/Ibu Personalia'},

Perkenalkan saya ${appState.user.name || 'Nama Anda'}. Sesuai dengan informasi lowongan pekerjaan yang saya dapatkan dari ${appState.lamaran.source || 'informasi yang tersedia'}, melalui email ini saya bermaksud melamar pekerjaan ${appState.lamaran.position ? `untuk posisi ${appState.lamaran.position} ` : ''}di ${appState.lamaran.company || 'perusahaan yang Bapak/Ibu pimpin'}.

Berikut adalah data singkat saya:
Nama: ${appState.user.name || '-'}
Tempat, Tanggal Lahir: ${appState.user.birthPlaceAndDate || '-'}
Pendidikan: ${appState.user.education || '-'}
Telepon: ${appState.user.phone || '-'}

Sebagai bahan pertimbangan, saya telah melampirkan berkas-berkas pendukung pada email ini.
Besar harapan saya untuk dapat berdiskusi lebih lanjut mengenai kesempatan ini.

Terima kasih atas waktu dan perhatian Bapak/Ibu.

Hormat saya,
${appState.user.name || 'Nama Anda'}
${appState.user.phone || 'Nomor HP'}`);

    function copyEmailBody() {
        navigator.clipboard.writeText(emailBodyContent);
        copyText = 'Tersalin!';
        setTimeout(() => (copyText = 'Copy'), 2000);
    }

    let printWithAttachments = $state(true);

    function handlePrint(withAttachments: boolean) {
        printWithAttachments = withAttachments;
        setTimeout(() => {
            window.print();
            printWithAttachments = true;
        }, 100);
    }

    // ZOOM & PAN LOGIC
    let zoom = $state(0.7);
    let isDragging = $state(false);
    let startPos = { x: 0, y: 0 };
    let scrollPos = { x: 0, y: 0 };
    let viewerElement = $state<HTMLDivElement>();

    function onMouseDown(e: MouseEvent) {
        if (!viewerElement) return;
        isDragging = true;
        startPos = { x: e.clientX, y: e.clientY };
        scrollPos = { x: viewerElement.scrollLeft, y: viewerElement.scrollTop };
    }

    function onMouseMove(e: MouseEvent) {
        if (!isDragging || !viewerElement) return;
        e.preventDefault();
        const dx = e.clientX - startPos.x;
        const dy = e.clientY - startPos.y;
        viewerElement.scrollLeft = scrollPos.x - dx;
        viewerElement.scrollTop = scrollPos.y - dy;
    }

    function onMouseUp() {
        isDragging = false;
    }
</script>

{#snippet letterContent()}
    <div class="text-right mb-8">
        <p>{appState.lamaran.date || 'Jakarta, 10 Mei 2026'}</p>
    </div>

    <div class="mb-8">
        <p>
            Kepada Yth,<br />
            {#if appState.lamaran.company}
                HRD {appState.lamaran.company}<br />
                {#if appState.lamaran.companyAddress}
                    <span class="whitespace-pre-line">{appState.lamaran.companyAddress}</span>
                {:else}
                    Di Tempat.
                {/if}
            {:else}
                HRD Bapak / Ibu Personalia<br />
                Di Tempat.
            {/if}
        </p>
    </div>

    <p class="mb-4">Dengan Hormat,</p>

    <p class="mb-4">Saya yang bertanda tangan dibawah ini :</p>

    <div class="ml-8 mb-6 space-y-1">
        <div class="flex">
            <span class="w-48 flex-shrink-0">Nama</span>
            <span class="mr-2 flex-shrink-0">:</span>
            <span class="font-semibold">{appState.user.name || 'Hanum Salsa Nabilah'}</span>
        </div>
        <div class="flex">
            <span class="w-48 flex-shrink-0">Tempat, Tanggal Lahir</span>
            <span class="mr-2 flex-shrink-0">:</span>
            <span>{appState.user.birthPlaceAndDate || 'Pemalang, 09 Mei 2003'}</span>
        </div>
        <div class="flex">
            <span class="w-48 flex-shrink-0">Alamat</span>
            <span class="mr-2 flex-shrink-0">:</span>
            <span class="whitespace-pre-line">{appState.user.address || 'Dsn Kauman, Ds. Kauman\nRT. 02/ RW. 01, Kec. Comal\nKab. Pemalang'}</span>
        </div>
        <div class="flex">
            <span class="w-48 flex-shrink-0">Telepon</span>
            <span class="mr-2 flex-shrink-0">:</span>
            <span>{appState.user.phone || '0838 9023 7082'}</span>
        </div>
    </div>

    <p class="mb-4 text-justify">
        Sehubung dengan adanya informasi penerimaan karyawan di
        {#if appState.lamaran.company}
            <span class="font-bold">{appState.lamaran.company}</span>
        {:else}
            Perusahaan yang Bapak / Ibu pimpin
        {/if}
        {#if appState.lamaran.source}
            yang saya dapatkan melalui <span class="font-bold">{appState.lamaran.source}</span>,
        {:else}
            yang saya dapatkan,
        {/if}
        saya bermaksud mengajukan surat lamaran kerja
        {#if appState.lamaran.position}
            untuk mengisi posisi <span class="font-bold">{appState.lamaran.position}</span>
        {:else}
            agar dapat diterima bekerja
        {/if}
        {#if appState.lamaran.company}
            di perusahaan tersebut.
        {:else}
            di tempat Bapak / Ibu pimpin.
        {/if}
    </p>

    <p class="mb-4 text-justify">Sebagai bahan pertimbangan Bapak / Ibu, saya melampirkan berkas - berkas sebagai berikut :</p>

    {#if appState.lamaran.attachments.length > 0}
        <div class="ml-8 mb-6">
            <ul class="list-none space-y-1">
                {#each appState.lamaran.attachments as item, i}
                    <li>{i + 1}. {item}</li>
                {/each}
            </ul>
        </div>
    {/if}

    <p class="mb-8 text-justify">
        Demikian surat lamaran ini saya buat, besar harapan saya untuk dapat bekerja di tempat yang Bapak / Ibu pimpin, saya ucapkan terima kasih.
    </p>

    <div class="mt-12">
        <p>Hormat Saya</p>
        <div class="h-24"></div>
        <p class="font-bold">{appState.user.name || 'Hanum Salsa Nabilah'}</p>
    </div>
{/snippet}

<div class="grid grid-cols-1 xl:grid-cols-2 gap-8">
    <div class="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 no-print">
        <h3 class="text-xl font-bold mb-6">Detail Lamaran</h3>
        <div class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label for="lamaran-date" class="block text-sm font-semibold text-slate-700 mb-1">Tempat, Tanggal</label>
                    <input
                        id="lamaran-date"
                        type="text"
                        bind:value={appState.lamaran.date}
                        class="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none bg-slate-50 focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label for="lamaran-pos" class="block text-sm font-semibold text-slate-700 mb-1">Posisi Dilamar</label>
                    <input
                        id="lamaran-pos"
                        type="text"
                        bind:value={appState.lamaran.position}
                        class="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none bg-slate-50 focus:ring-2 focus:ring-blue-500"
                        placeholder="Contoh: Staff Admin"
                    />
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label for="lamaran-company" class="block text-sm font-semibold text-slate-700 mb-1">Nama Perusahaan</label>
                    <input
                        id="lamaran-company"
                        type="text"
                        bind:value={appState.lamaran.company}
                        class="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none bg-slate-50 focus:ring-2 focus:ring-blue-500"
                        placeholder="PT. Maju Mundur"
                    />
                </div>
                <div>
                    <label for="lamaran-source" class="block text-sm font-semibold text-slate-700 mb-1">Sumber Informasi Lowongan</label>
                    <input
                        id="lamaran-source"
                        type="text"
                        bind:value={appState.lamaran.source}
                        class="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none bg-slate-50 focus:ring-2 focus:ring-blue-500"
                        placeholder="Contoh: Instagram / LinkedIn / Teman"
                    />
                </div>
            </div>
            <div>
                <label for="lamaran-addr" class="block text-sm font-semibold text-slate-700 mb-1">Alamat Perusahaan</label>
                <textarea
                    id="lamaran-addr"
                    bind:value={appState.lamaran.companyAddress}
                    class="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none bg-slate-50 focus:ring-2 focus:ring-blue-500"
                    rows="2"
                    placeholder="Alamat lengkap perusahaan..."
                ></textarea>
            </div>

            <!-- ATTACHMENTS MANAGEMENT -->
            <div class="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                <div class="flex items-center justify-between mb-4">
                    <h4 class="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <i class="fas fa-paperclip text-blue-600"></i> Lampiran Berkas
                    </h4>
                    <button
                        onclick={() => (showModal = true)}
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
                                    <button onclick={() => startEdit(i, item)} class="p-1 text-slate-400 hover:text-blue-600" title="Ganti Nama">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                {/if}
                                <label class="p-1 text-slate-400 hover:text-blue-600 cursor-pointer" title="Upload Ulang File">
                                    <i class="fas fa-file-arrow-up"></i>
                                    <input type="file" class="hidden" onchange={(e) => handleReupload(i, e)} />
                                </label>
                                <button
                                    onclick={() => moveAttachment(i, 'up')}
                                    disabled={i === 0}
                                    class="p-1 text-slate-400 hover:text-blue-600 disabled:opacity-30"
                                >
                                    <i class="fas fa-chevron-up"></i>
                                </button>
                                <button
                                    onclick={() => moveAttachment(i, 'down')}
                                    disabled={i === appState.lamaran.attachments.length - 1}
                                    class="p-1 text-slate-400 hover:text-blue-600 disabled:opacity-30"
                                >
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
                    <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onclick={() => (showModal = false)}></div>

                    <!-- Modal Content -->
                    <div class="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div class="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 class="font-bold text-slate-800 flex items-center gap-2">
                                <i class="fas fa-file-circle-plus text-blue-600"></i> Tambah Lampiran
                            </h3>
                            <button onclick={() => (showModal = false)} class="text-slate-400 hover:text-slate-600">
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
                                <div class="relative flex justify-center text-xs uppercase">
                                    <span class="bg-white px-2 text-slate-400 font-bold">Atau</span>
                                </div>
                            </div>

                            <label
                                class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 hover:border-blue-400 transition-all group"
                            >
                                <div class="flex flex-col items-center justify-center pt-5 pb-6">
                                    <i class="fas fa-cloud-upload-alt text-3xl text-slate-300 group-hover:text-blue-500 mb-2"></i>
                                    <p class="text-sm text-slate-500"><span class="font-semibold">Klik untuk upload</span> berkas</p>
                                    <p class="text-xs text-slate-400 mt-1">PDF, JPG, PNG up to 5MB</p>
                                </div>
                                <input type="file" multiple class="hidden" onchange={handleFileUpload} />
                            </label>
                        </div>

                        <div class="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                            <button
                                onclick={() => (showModal = false)}
                                class="flex-1 px-4 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-all"
                            >
                                Batal
                            </button>
                            <button
                                onclick={addAttachment}
                                class="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
                            >
                                Simpan
                            </button>
                        </div>
                    </div>
                </div>
            {/if}

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                    onclick={() => handlePrint(true)}
                    class="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2"
                >
                    <i class="fas fa-print"></i> Cetak + Lampiran
                </button>
                <button
                    onclick={() => handlePrint(false)}
                    class="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                >
                    <i class="fas fa-file-lines"></i> Surat Saja
                </button>
            </div>

            <!-- EMAIL BODY TEMPLATE -->
            <div class="mt-8 pt-8 border-t border-slate-200">
                <div class="flex items-center justify-between mb-4">
                    <h4 class="font-bold text-slate-800 flex items-center gap-2">
                        <i class="fas fa-envelope text-blue-600"></i> Template Body Email
                    </h4>
                    <button
                        onclick={copyEmailBody}
                        class="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-all flex items-center gap-1.5 font-semibold"
                    >
                        <i class="fas fa-copy"></i>
                        {copyText}
                    </button>
                </div>
                <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm text-slate-700 whitespace-pre-wrap font-mono relative group">
                    {emailBodyContent}
                </div>
            </div>
        </div>
    </div>

    <!-- MOBILE VIEWER -->
    <div class="no-print md:hidden relative bg-slate-100 rounded-[2rem] border-4 border-slate-200 overflow-hidden flex flex-col h-[600px] shadow-inner">
        <!-- Zoom Controls (Always Visible) -->
        <div class="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-4 bg-white/90 backdrop-blur shadow-2xl border border-slate-200 px-5 py-2.5 rounded-2xl transition-all">
            <button onclick={() => (zoom = Math.max(0.4, zoom - 0.1))} class="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-lg text-slate-600 transition-all">
                <i class="fas fa-minus text-xs"></i>
            </button>
            <div class="flex flex-col items-center min-w-[50px]">
                <span class="text-[10px] font-black text-slate-800">{Math.round(zoom * 100)}%</span>
            </div>
            <button onclick={() => (zoom = Math.min(1.5, zoom + 0.1))} class="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-lg text-slate-600 transition-all">
                <i class="fas fa-plus text-xs"></i>
            </button>
            <div class="w-px h-4 bg-slate-200 mx-1"></div>
            <button onclick={() => (zoom = 0.5)} class="text-[9px] font-black uppercase tracking-widest text-blue-600">Reset</button>
        </div>

        <!-- Scroll/Pan Area -->
        <div 
            bind:this={viewerElement}
            onmousedown={onMouseDown}
            onmousemove={onMouseMove}
            onmouseup={onMouseUp}
            onmouseleave={onMouseUp}
            class="flex-1 overflow-auto p-10 cursor-grab active:cursor-grabbing select-none scrollbar-hide bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:15px_15px]"
        >
            <div 
                style="transform: scale({zoom}); transform-origin: top center; width: 210mm; min-height: 297mm;"
                class="bg-white shadow-[0_10px_30px_rgba(0,0,0,0.1)] mx-auto p-[1.5cm] text-slate-900 leading-relaxed transition-transform duration-200"
            >
                {@render letterContent()}
            </div>
        </div>
    </div>

    <!-- DESKTOP PREVIEW -->
    <div class="no-print hidden md:block bg-white p-12 rounded-3xl shadow-sm border border-slate-200">
        <div class="max-w-[21cm] mx-auto text-slate-900 leading-relaxed">
            {@render letterContent()}
        </div>
    </div>

    <!-- PRINT VIEW -->
    <div class="hidden print:block bg-white print:p-0 print:shadow-none">
        <div id="lamaran-preview" class="w-[210mm] mx-auto text-slate-900 leading-relaxed">
            {@render letterContent()}
        </div>
    </div>


    <!-- VISUAL ATTACHMENTS (New Pages) -->
    <div class="mt-10 {!printWithAttachments ? 'no-print' : ''}">
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
