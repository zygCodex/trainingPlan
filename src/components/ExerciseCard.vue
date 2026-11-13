<script setup>
import { ref, computed } from "vue";
import { actions, usesOriginalDose } from "../data";
import ActionDetail from "./ActionDetail.vue";
import ActionIllustration from "./ActionIllustration.vue";
const props = defineProps({
  item: Object,
  done: Boolean,
  replacement: String,
  readonly: Boolean,
});
defineEmits(["toggle", "replace"]);
const open = ref(false);
const action = computed(
  () => actions[props.replacement || props.item.actionId],
);
const needsDose = computed(() => !usesOriginalDose(props.item.actionId, action.value.id));
</script>
<template>
  <article class="exercise-card" :class="{ done, open }">
    <div class="exercise-row">
      <button
        class="exercise-main"
        :aria-expanded="open"
        :aria-controls="`detail-${item.id}`"
        @click="open = !open"
      >
        <span class="order">{{ String(item.order).padStart(2, "0") }}</span
        ><ActionIllustration v-if="action.illustration" :key="action.id" :illustration="action.illustration" compact />
        <span class="exercise-copy"
          ><span class="exercise-name"
            >{{ action.name }}
            <span v-if="replacement" class="mini-tag">已替换</span></span
          ><span class="dose"
            >{{ needsDose ? "替代动作 · 组次／时长需另定" : item.dose === "原文未说明" ? "组次／时长未说明" : item.dose
            }}<em v-if="!needsDose && item.side === '每侧'">每侧</em
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
