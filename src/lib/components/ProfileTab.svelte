<script lang="ts">
    import { appState } from '$lib/appState.svelte';

    function handlePhotoUpload(event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                appState.user.photo = e.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    }

    function removePhoto() {
        appState.user.photo = null;
    }
</script>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <div class="lg:col-span-1">
        <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <div class="flex flex-col items-center text-center">
                <div class="relative group">
                    <div class="w-32 h-32 bg-slate-100 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-md overflow-hidden">
                        {#if appState.user.photo}
                            <img src={appState.user.photo} alt="Profile" class="w-full h-full object-cover" />
                        {:else}
                            <i class="fas fa-user text-4xl text-slate-400"></i>
                        {/if}
                    </div>
                    <label class="absolute bottom-4 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer shadow-lg hover:bg-blue-700 transition-all">
                        <i class="fas fa-camera"></i>
                        <input type="file" class="hidden" accept="image/*" onchange={handlePhotoUpload} />
                    </label>
                </div>
                <h2 class="text-xl font-bold">{appState.user.name || 'Nama Lengkap'}</h2>
                <p class="text-slate-500 text-sm">{appState.user.email || 'email@example.com'}</p>
                {#if appState.user.photo}
                    <button onclick={removePhoto} class="text-xs text-red-500 mt-2 hover:underline">Hapus Foto</button>
                {/if}
            </div>
            <div class="mt-8 space-y-4">
                <div class="flex items-center gap-3 text-sm text-slate-600">
                    <i class="fas fa-phone w-5 text-blue-600"></i>
                    <span>{appState.user.phone || '08xxxxxxxxxx'}</span>
                </div>
                <div class="flex items-center gap-3 text-sm text-slate-600">
                    <i class="fas fa-location-dot w-5 text-blue-600"></i>
                    <span class="line-clamp-2">{appState.user.address || 'Alamat belum diisi'}</span>
                </div>
            </div>
        </div>
    </div>

    <div class="lg:col-span-2">
        <div class="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <h3 class="text-lg font-bold mb-6 flex items-center gap-2 text-slate-800">
                <i class="fas fa-edit text-blue-600"></i> Edit Data Diri Utama
            </h3>
            <form class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label for="prof-name" class="block text-sm font-semibold text-slate-700 mb-2">Nama Lengkap</label>
                        <input id="prof-name" type="text" bind:value={appState.user.name} class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-50" placeholder="Masukkan nama lengkap" />
                    </div>
                    <div>
                        <label for="prof-birth" class="block text-sm font-semibold text-slate-700 mb-2">Tempat, Tanggal Lahir</label>
                        <input id="prof-birth" type="text" bind:value={appState.user.birthPlaceAndDate} class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-50" placeholder="Contoh: Pemalang, 09 Mei 2003" />
                    </div>
                    <div>
                        <label for="prof-email" class="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                        <input id="prof-email" type="email" bind:value={appState.user.email} class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-50" placeholder="nama@email.com" />
                    </div>
                    <div>
                        <label for="prof-phone" class="block text-sm font-semibold text-slate-700 mb-2">Nomor HP</label>
                        <input id="prof-phone" type="text" bind:value={appState.user.phone} class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-50" placeholder="08xxxxxx" />
                    </div>
                    <div>
                        <label for="prof-edu" class="block text-sm font-semibold text-slate-700 mb-2">Pendidikan Terakhir</label>
                        <input id="prof-edu" type="text" bind:value={appState.user.education} class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-50" placeholder="Contoh: S1 Teknik Informatika" />
                    </div>
                </div>
                <div>
                    <label for="prof-addr" class="block text-sm font-semibold text-slate-700 mb-2">Alamat</label>
                    <textarea id="prof-addr" bind:value={appState.user.address} rows="3" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-50" placeholder="Alamat lengkap..."></textarea>
                </div>
                <div class="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex gap-3 items-start">
                    <i class="fas fa-info-circle text-blue-500 mt-1"></i>
                    <p class="text-xs text-blue-700 leading-relaxed">Data di atas akan sinkron otomatis ke CV dan Surat Lamaran. Perubahan disimpan secara real-time ke memori lokal browser Anda.</p>
                </div>
            </form>
        </div>
    </div>
</div>
