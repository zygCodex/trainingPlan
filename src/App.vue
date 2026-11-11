<script setup>
import { ref } from "vue";
import { reloadActionNotes } from "./composables/useActionNotes";
import { useTraining } from "./composables/useTraining";
import TrainingView from "./components/TrainingView.vue";
import LibraryView from "./components/LibraryView.vue";
import DataBackup from "./components/DataBackup.vue";
import CelebrationModal from "./components/CelebrationModal.vue";
const tab = ref("today"),
  training = useTraining(),
  libraryVersion = ref(0);
function restored() {
  training.reload();
  reloadActionNotes();
  libraryVersion.value++;
}
function navigate(value) {
  tab.value = value;
  window.scrollTo({ top: 0, behavior: "instant" });
}
</script>
<template>
  <div class="app-shell">
    <header class="app-header">
      <a class="brand" href="#" @click.prevent="navigate('today')"
        ><span class="brand-symbol">↗</span
        ><strong>练就<span> LIANJIU</span></strong></a
      >
      <nav class="desktop-nav" aria-label="主导航">
        <button
          :class="{ active: tab === 'today' }"
          :aria-current="tab === 'today' ? 'page' : undefined"
          @click="navigate('today')"
        >
          今日训练</button
        ><button
          :class="{ active: tab === 'library' }"
          :aria-current="tab === 'library' ? 'page' : undefined"
          @click="navigate('library')"
        >
          全部数据
        </button>
      </nav>
      <span class="header-tag"><i></i> 一点一点，练就自己</span>
    </header>
    <main>
      <div
        v-if="training.storageWarning.value"
        class="storage-warning"
        role="status"
      >
        {{ training.storageWarning.value }}
      </div>
      <TrainingView v-if="tab === 'today'" :key="libraryVersion" :training="training" /><LibraryView
        v-else :key="libraryVersion"
      />
      <DataBackup @restored="restored" />
    </main>
    <footer class="app-footer">
      <span>练就 LIANJIU <i> / </i> 先质量，再重量。</span
      ><span>记录保存在当前浏览器</span>
    </footer>
    <nav class="bottom-nav" aria-label="手机主导航">
      <button
        :class="{ active: tab === 'today' }"
        :aria-current="tab === 'today' ? 'page' : undefined"
        @click="navigate('today')"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
        >
          <path d="M5 12h14M7 6v12M3 9v6M17 6v12M21 9v6" /></svg
        >今日训练</button
      ><button
        :class="{ active: tab === 'library' }"
        :aria-current="tab === 'library' ? 'page' : undefined"
        @click="navigate('library')"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
        >
          <rect x="4" y="4" width="6" height="6" rx="1" />
          <rect x="14" y="4" width="6" height="6" rx="1" />
          <rect x="4" y="14" width="6" height="6" rx="1" />
          <rect x="14" y="14" width="6" height="6" rx="1" /></svg
        >全部数据
      </button>
    </nav>
    <CelebrationModal
      v-if="training.celebration.value"
      @close="training.celebration.value = false"
    />
  </div>
</template>
