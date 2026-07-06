<script lang="ts">
  let { title = 'Belum ada data', body = 'Mulai dari catatan kecil dulu.' } = $props();
</script>

<div class="surface-panel p-6 text-center">
  <p class="text-lg font-black">{title}</p>
  <p class="mt-2 text-sm text-muted">{body}</p>
</div>
