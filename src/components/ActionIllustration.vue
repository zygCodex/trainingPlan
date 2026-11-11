<script setup>
import { computed } from "vue";
const props = defineProps({ illustration: Object, compact: Boolean });
const source = computed(() => `${import.meta.env.BASE_URL}${props.illustration.src}`);
const frameStyle = computed(() => ({ aspectRatio: `${props.illustration.region[2]} / ${props.illustration.region[3]}` }));
const imageStyle = computed(() => {
  const [x, y, width, height] = props.illustration.region;
  return {
    width: `${props.illustration.sheetWidth / width * 100}%`,
    height: `${props.illustration.sheetHeight / height * 100}%`,
    left: `${-x / width * 100}%`,
    top: `${-y / height * 100}%`,
  };
});
</script>
<template>
  <div class="action-illustration" :class="{ compact }" :style="frameStyle">
    <img
      :src="source"
      :alt="compact ? '' : `${illustration.label} · ${illustration.sourceKind === 'ai' ? 'AI 生成动作示意图' : '用户提供的动作插画'}`"
      :aria-hidden="compact ? 'true' : undefined"
      :style="imageStyle"
      loading="lazy"
      decoding="async"
    />
  </div>
</template>
