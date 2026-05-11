<script lang="ts">
    import { appState } from '$lib/appState.svelte';
    import { onMount } from 'svelte';
    import { domToPng } from 'modern-screenshot';

    onMount(() => {
        if (!appState.lamaran.date) {
            const now = new Date();
            appState.lamaran.date = `Jakarta, ${now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`;
        }
    });

    async function downloadAsImage() {
        const element = document.getElementById('lamaran-preview');
        if (!element) return;
        
        try {
            const dataUrl = await domToPng(element, {
                scale: 2,
                backgroundColor: '#ffffff'
            });
            
            const link = document.createElement('a');
            link.download = `Surat_Lamaran_${appState.user.name.replace(/\s+/g, '_') || 'JobKit'}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('Download failed:', err);
            alert('Gagal mengambil gambar. Gunakan fitur PDF sebagai alternatif.');
        }
    }
</script>

<div class="grid grid-cols-1 xl:grid-cols-2 gap-8">
    <div class="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 no-print">
        <h3 class="text-xl font-bold mb-6">Detail Lamaran</h3>
        <div class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-semibold text-slate-700 mb-1">Tempat, Tanggal</label>
                    <input type="text" bind:value={appState.lamaran.date} class="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none bg-slate-50 focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                    <label class="block text-sm font-semibold text-slate-700 mb-1">Posisi Dilamar</label>
                    <input type="text" bind:value={appState.lamaran.position} class="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none bg-slate-50 focus:ring-2 focus:ring-blue-500" placeholder="Contoh: Software Engineer" />
                </div>
            </div>
            <div>
                <label class="block text-sm font-semibold text-slate-700 mb-1">Nama Perusahaan</label>
                <input type="text" bind:value={appState.lamaran.company} class="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none bg-slate-50 focus:ring-2 focus:ring-blue-500" placeholder="PT. Maju Bersama" />
            </div>
            <div>
                <label class="block text-sm font-semibold text-slate-700 mb-1">Alamat Perusahaan</label>
                <textarea bind:value={appState.lamaran.companyAddress} class="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none bg-slate-50 focus:ring-2 focus:ring-blue-500" rows="2"></textarea>
            </div>
            <div>
                <label class="block text-sm font-semibold text-slate-700 mb-1">Alasan Melamar / Deskripsi Tambahan</label>
                <textarea bind:value={appState.lamaran.reason} class="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none bg-slate-50 focus:ring-2 focus:ring-blue-500" rows="4" placeholder="Saya tertarik melamar karena..."></textarea>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button onclick={() => window.print()} class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 text-sm">
                    <i class="fas fa-print"></i> Cetak PDF
                </button>
                <button onclick={downloadAsImage} class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 text-sm">
                    <i class="fas fa-image"></i> Simpan Gambar
                </button>
            </div>
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
        </div>
    </div>
</div>
