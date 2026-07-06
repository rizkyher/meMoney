<script lang="ts">
  import BottomNav from './BottomNav.svelte';
  import ChatBubble from './ChatBubble.svelte';
  import Sidebar from './Sidebar.svelte';
  import TopBar from './TopBar.svelte';

  let { children, user, csrfToken = '' } = $props();
</script>

<div class="app-root">
  <div class="flex min-h-dvh w-full">
    <Sidebar />
    <div class="flex min-w-0 flex-1 flex-col pb-24 md:pb-0">
      <TopBar {user} />
      <main class="w-full flex-1 px-4 py-4 md:px-6 md:py-6 lg:px-8">
        <div class="content-wrap">
          {@render children()}
        </div>
      </main>
    </div>
  </div>
  <BottomNav />
  <ChatBubble {csrfToken} />
</div>
