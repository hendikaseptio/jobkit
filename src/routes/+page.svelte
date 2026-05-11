<script lang="ts">
    import { appState } from '$lib/appState.svelte';
    import ProfileTab from '$lib/components/ProfileTab.svelte';
    import CVTab from '$lib/components/CVTab.svelte';
    import LamaranTab from '$lib/components/LamaranTab.svelte';
</script>

<div class="max-w-7xl mx-auto px-4 py-8">
    {#if appState.activeTab === 'profile'}
        <ProfileTab />
    {:else if appState.activeTab === 'cv'}
        <CVTab />
    {:else if appState.activeTab === 'lamaran'}
        <LamaranTab />
    {/if}
</div>
