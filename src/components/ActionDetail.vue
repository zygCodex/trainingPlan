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
    <figure v-if="action.illustration" class="action-figure">
      <ActionIllustration :key="action.id" :illustration="action.illustration" />
      <figcaption>{{ action.illustration.label }} · {{ action.illustration.sourceKind === "ai" ? "AI 生成动作示意图" : "动作插画参考" }}</figcaption>
      <p v-if="action.illustration.note" class="illustration-note">{{ action.illustration.note }}</p>
    </figure>
    <div class="detail-meta">
      <span>所属模块 <b>{{ action.module }}</b></span>
      <span v-if="action.equipment !== '—'"
        >器械 <b>{{ action.equipment }}</b></span
      ><span
        >作用区域 <b>{{ action.muscles }}</b></span
      ><span v-if="action.days"
        >适用训练日 <b>{{ action.days }}</b></span
      >
    </div>
    <h4>{{ action.id.startsWith("W") ? "操作方式" : "动作要领" }}</h4>
    <ul class="cues">
      <li v-for="(cue, index) in action.instructions.split('；')" :key="index">
        {{ cue }}
      </li>
    </ul>
    <div v-if="item?.superset && item.superset !== '—'" class="callout">
      ↔ 超级组：每轮先三头、再二头，交替完成 4 轮；两动作各 4 组。
    </div>
    <div v-if="editable && action.id !== original.id" class="replacement-info">
      已替换原动作：{{ original.name }}
      <button class="text-button" @click="$emit('replace', original.id)">
        恢复原动作 ↩
      </button>
    </div>
    <template v-if="alternatives.length"
      ><h4>
        替代动作
        <small>{{
          editable ? "点击切换今天的动作" : "原文提供的可选形式"
        }}</small>
      </h4>
      <div class="alternatives">
        <div v-for="id in alternatives" :key="id">
          <button
            :disabled="!editable || id === 'E014'"
            class="alternative"
            @click="$emit('replace', id)"
          >
            <span>{{ actions[id].name }}</span
            ><span>{{
              editable && id !== "E014" ? "替换 ↗" : "可选形式"
            }}</span>
          </button>
          <p v-if="id === 'E014'" class="muted small">
            支撑时长与计量方式待核实，暂不直接替换。
          </p>
        </div>
      </div></template
    >
    <p
      v-else-if="action.id.startsWith('E') && action.id === original.id"
      class="muted small"
    >
      替代动作：原文未提供。
    </p>
    <ActionNotes :action="action" />
    <p v-if="item" class="small muted">计划备注：{{ item.remark }}</p>
    <details class="source-note">
      <summary>来源备注</summary>
      <p>{{ action.source }}</p>
    </details>
  </div>
</template>
