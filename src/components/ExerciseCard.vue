<script setup>
import { ref, computed, watch } from "vue";
import { actions } from "../data";
import ActionDetail from "./ActionDetail.vue";
const props = defineProps({
  item: Object,
  done: Boolean,
  replacement: String,
  readonly: Boolean,
  next: Boolean,
});
defineEmits(["toggle", "replace"]);
const open = ref(false);
const detailToggle = ref(null);
const action = computed(
  () => actions[props.replacement || props.item.actionId],
);
const isSupport = computed(() => action.value.id === "E014");
const dose = computed(() => {
  if (isSupport.value) return "支撑时长／组次待确认";
  if (props.item.dose === "原文未说明") return "组次／时长未说明";
  return props.item.dose;
});
watch(
  () => props.replacement,
  () => detailToggle.value?.focus({ preventScroll: true }),
  { flush: "post" },
);
</script>
<template>
  <article class="exercise-card" :class="{ done, open, next }">
    <div class="exercise-row">
      <button
        ref="detailToggle"
        class="exercise-main"
        :aria-expanded="open"
        :aria-controls="`detail-${item.id}`"
        @click="open = !open"
      >
        <span class="order">{{ String(item.order).padStart(2, "0") }}</span
        ><span class="exercise-copy"
          ><span class="exercise-name"
            >{{ action.name }}
            <span v-if="replacement" class="mini-tag">已替换</span>
            <span v-if="next" class="mini-tag next-tag">下一项</span></span
          ><span class="dose"
            >{{ dose }}<em v-if="!isSupport && item.side === '每侧'">每侧</em
            ><em v-if="item.superset !== '—'">超级组 A</em></span
          ></span
        ><span class="chevron" :class="{ rotated: open }">⌄</span></button
      ><button
        v-if="!readonly"
        class="check"
        :class="{ checked: done }"
        :aria-label="`${done ? '取消完成' : '标记完成'}：${action.name}`"
        :aria-pressed="!!done"
        @click="$emit('toggle')"
      >
        <span>{{ done ? "✓" : "" }}</span>
      </button>
    </div>
    <ActionDetail
      v-if="open"
      :id="`detail-${item.id}`"
      :action="action"
      :item="item"
      :editable="!readonly"
      @replace="$emit('replace', $event)"
    />
  </article>
</template>
