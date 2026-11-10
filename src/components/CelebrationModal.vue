<script setup>
import { ref, onMounted } from "vue";
const emit = defineEmits(["close"]);
const dialog = ref(null);
const pieces = Array.from({ length: 45 }, (_, i) => ({
  left: `${(i * 37) % 100}%`,
  animationDelay: `${(i % 9) * 0.08}s`,
  animationDuration: `${2 + (i % 5) * 0.25}s`,
  background: ["#d7fc70", "#ffab72", "#d9e2ce", "#9fbaef"][i % 4],
  transform: `rotate(${i * 29}deg)`,
}));
onMounted(() => dialog.value.showModal());
</script>
<template>
  <dialog
    ref="dialog"
    class="celebration"
    @close="emit('close')"
    @click="
      (e) => {
        if (e.target === dialog) dialog.close();
      }
    "
  >
    <div class="confetti" aria-hidden="true">
      <i v-for="(piece, i) in pieces" :key="i" :style="piece"></i>
    </div>
    <div class="medal">✓</div>
    <p class="eyebrow">SESSION COMPLETE</p>
    <h2>今天的坚持，<br />已经算数了。</h2>
    <p>
      每一次认真完成，都在让你更强一点。<br />辛苦啦，给自己一个大大的肯定！
    </p>
    <button autofocus class="primary" @click="dialog.close()">
      收下这份成就 ✦
    </button>
  </dialog>
</template>
