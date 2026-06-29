<script lang="ts">
  import { toast } from '$lib/stores/toast';
</script>

{#if $toast}
  <div class="fixed inset-x-4 top-4 z-50 mx-auto max-w-md rounded-2xl bg-ink px-4 py-3 text-sm font-bold text-paper shadow-soft">
    {$toast.message}
  </div>
{/if}
