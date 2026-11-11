<script setup>
import { computed } from "vue";
import ActionIllustration from "./ActionIllustration.vue";
import ActionNotes from "./ActionNotes.vue";
import { actions } from "../data";
const props = defineProps({ action: Object, item: Object, editable: Boolean });
defineEmits(["replace"]);
const original = computed(() =>
  props.item ? actions[props.item.actionId] : props.action,
);
const alternatives = computed(() =>
  [
    ...new Set([
      ...(original.value.alternatives || []),
      ...(props.action.alternatives || []),
    ]),
  ].filter((id) => id !== props.action.id && id !== original.value.id),
);
</script>
<template>
  <div class="action-detail">
    <div class="detail-overview">
      <figure v-if="action.illustration" class="action-figure">
        <ActionIllustration :key="action.id" :illustration="action.illustration" />
        <figcaption>{{ action.illustration.sourceKind === "ai" ? "AI 生成示意图" : "动作示意图" }}</figcaption>
      </figure>
      <dl class="detail-facts">
        <div class="detail-primary-facts">
          <dt>所属模块</dt><dd><span class="module-tag">{{ action.module }}</span></dd>
        </div>
        <div v-if="item">
          <dt>训练安排</dt><dd>{{ item.dose === "原文未说明" ? "组次／时长未说明" : item.dose }}<span v-if="item.side === '每侧'"> · 每侧</span></dd>
        </div>
        <div><dt>目标部位</dt><dd>{{ action.muscles }}</dd></div>
        <div v-if="action.equipment !== '—'"><dt>使用器械</dt><dd>{{ action.equipment }}</dd></div>
        <div v-if="action.days"><dt>适用训练日</dt><dd>{{ action.days }}</dd></div>
      </dl>
    </div>
    <p v-if="action.illustration?.note" class="illustration-note">图示说明：{{ action.illustration.note }}</p>
    <slot name="rating" />
    <div v-if="editable && action.id !== original.id" class="replacement-info">
      当前替换自：{{ original.name }}
      <button class="text-button" @click="$emit('replace', original.id)">恢复原动作 ↩</button>
    </div>
    <section class="detail-instructions">
      <h4>{{ action.id.startsWith("W") ? "操作方式" : "动作要领" }}</h4>
      <ol class="cues">
        <li v-for="(cue, index) in action.instructions.split('；').filter(Boolean)" :key="index">{{ cue }}</li>
      </ol>
    </section>
    <div v-if="item?.superset && item.superset !== '—'" class="callout">
      超级组：每轮先三头、再二头，交替完成 4 轮；两动作各 4 组。
    </div>
    <ActionNotes :action="action" />
    <details v-if="alternatives.length" class="detail-alternatives" :open="editable">
      <summary>替代动作 <span>{{ alternatives.length }} 个可选</span></summary>
      <p class="small muted">{{ editable ? "点击切换今天的动作" : "原文提供的可选形式" }}</p>
      <div class="alternatives">
        <div v-for="id in alternatives" :key="id">
          <button :disabled="!editable || id === 'E014'" class="alternative" @click="$emit('replace', id)">
            <span>{{ actions[id].name }}</span><span>{{ editable && id !== "E014" ? "替换 ↗" : "可选形式" }}</span>
          </button>
          <p v-if="id === 'E014'" class="muted small">支撑时长与计量方式待核实，暂不直接替换。</p>
        </div>
      </div>
    </details>
    <details class="source-note">
      <summary>来源与计划备注</summary>
      <p v-if="item">计划备注：{{ item.remark }}</p>
      <p>{{ action.source }}</p>
    </details>
  </div>
</template>
