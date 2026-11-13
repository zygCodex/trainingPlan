<script setup>
import { ref } from "vue";
import { reloadMastery } from "./composables/useMastery";
import { useImagePreference } from "./composables/useImagePreference";
import { reloadActionNotes } from "./composables/useActionNotes";
import { useTraining } from "./composables/useTraining";
import TodoView from "./components/TodoView.vue";
import TrainingView from "./components/TrainingView.vue";
import LibraryView from "./components/LibraryView.vue";
import DataBackup from "./components/DataBackup.vue";
import CelebrationModal from "./components/CelebrationModal.vue";
const { showImages, setShowImages, imagePreferenceWarning } = useImagePreference();
const navigation = [
  { id: "todos", label: "代办", path: "M9 6h11M9 12h11M9 18h11M3 6h1M3 12h1M3 18h1" },
  { id: "today", label: "今日训练", path: "M5 12h14M7 6v12M3 9v6M17 6v12M21 9v6" },
  { id: "library", label: "全部动作", path: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" },
];
const tab = ref("today"),
  training = useTraining(),
  libraryVersion = ref(0);
function restored() {
  training.reload();
  reloadActionNotes();
  reloadMastery();
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
        <button v-for="entry in navigation" :key="entry.id" :class="{ active: tab === entry.id }" :aria-current="tab === entry.id ? 'page' : undefined" @click="navigate(entry.id)">{{ entry.label }}</button>
      </nav>
      <label class="image-visibility">
        <span>显示图片</span>
        <input type="checkbox" role="switch" :checked="showImages" aria-label="显示图片" @change="setShowImages($event.target.checked)" />
        <span class="image-switch-track" aria-hidden="true"></span>
      </label>
    </header>
    <main>
      <p v-if="imagePreferenceWarning" class="storage-warning" role="status">{{ imagePreferenceWarning }}</p>
      <div
        v-if="training.storageWarning.value"
        class="storage-warning"
        role="status"
      >
        {{ training.storageWarning.value }}
      </div>
      <TodoView v-if="tab === 'todos'" :key="libraryVersion" />
      <TrainingView v-else-if="tab === 'today'" :key="libraryVersion" :training="training" /><LibraryView
        v-else :key="libraryVersion"
      />
      <DataBackup @restored="restored" />
    </main>
    <footer class="app-footer">
      <span>练就 LIANJIU <i> / </i> 先质量，再重量。</span
      ><span>记录保存在当前浏览器</span>
    </footer>
    <nav class="bottom-nav" aria-label="手机主导航">
      <button v-for="entry in navigation" :key="entry.id" :class="{ active: tab === entry.id }" :aria-current="tab === entry.id ? 'page' : undefined" @click="navigate(entry.id)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path :d="entry.path" /></svg>{{ entry.label }}
      </button>
    </nav>
    <CelebrationModal
      v-if="training.celebration.value"
      @close="training.celebration.value = false"
    />
  </div>
</template>
