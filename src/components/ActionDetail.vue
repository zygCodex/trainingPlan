<script setup>
import { computed, useId } from "vue";
import { useMastery, masteryLabel } from "../composables/useMastery";
const { scores, storageWarning, setScore } = useMastery();
const ratingId = useId();
import ActionNotes from "./ActionNotes.vue";
import ActionPrescription from "./ActionPrescription.vue";
import { actions, canReplace, usesOriginalDose } from "../data";
const props = defineProps({ action: Object, item: Object, editable: Boolean });
defineEmits(["replace"]);
const original = computed(() =>
  props.item ? actions[props.item.actionId] : props.action,
);
const alternatives = computed(() =>
  original.value.alternatives.filter((id) => id !== props.action.id),
);
const needsDose = computed(() => props.item && !usesOriginalDose(original.value.id, props.action.id));
</script>
<template>
  <div class="action-detail">
    <div class="detail-topline">
      <span class="module-tag">{{ action.module }}</span>
      <label class="compact-mastery" :for="ratingId">
        <span>掌握程度</span>
        <select :id="ratingId" :aria-label="`${action.name}的掌握程度`" :value="scores[action.id] ?? ''" @change="setScore(action.id, $event.target.value)">
          <option value="">尚未评分</option>
          <option v-for="score in 10" :key="score" :value="score">{{ score }} 分 · {{ masteryLabel(score) }}</option>
        </select>
      </label>
    </div>
    <p v-if="storageWarning" class="storage-warning" role="status">{{ storageWarning }}</p>
    <div class="detail-overview">
      <dl class="detail-facts">
        <div><dt>目标部位</dt><dd>{{ action.muscles }}</dd></div>
        <div v-if="action.equipment !== '—'"><dt>使用器械</dt><dd>{{ action.equipment }}</dd></div>
        <div v-if="action.days"><dt>适用训练日</dt><dd>{{ action.days }}</dd></div>
      </dl>
    </div>
    <ActionPrescription :action="action" :item="item" />
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
    <section v-if="action.supplementalInstructions" class="detail-instructions">
      <h4>补充操作建议</h4>
      <ol class="cues"><li v-for="(cue, index) in action.supplementalInstructions.split('；')" :key="index">{{ cue }}</li></ol>
      <p class="small muted">按常见动作形式补充，非原教程说明。</p>
    </section>
    <div v-if="item?.superset && item.superset !== '—'" class="callout">
      {{ needsDose ? "原计划按三头、二头顺序组成超级组；替换后的轮次与组数需重新确定。" : "超级组：每轮先三头、再二头，交替完成 4 轮；两动作各 4 组。" }}
    </div>
    <ActionNotes :action="action" />
    <details v-if="alternatives.length" class="detail-alternatives" open>
      <summary>替代动作 <span>{{ alternatives.length }} 个可选</span></summary>
      <p class="small muted">{{ editable ? "点击替换今天的动作；补充建议的组次与重量需按新动作另定。" : "按器械和训练目的选择，展开可查看做法与区别。" }}</p>
      <div class="alternatives">
        <div v-for="id in alternatives" :key="id">
          <div class="alternative-heading">
            <strong>{{ actions[id].name }}</strong>
            <button v-if="editable" :disabled="!canReplace(original.id, id)" class="text-button" @click="$emit('replace', id)">{{ canReplace(original.id, id) ? "替换 ↗" : "仅供参考" }}</button>
          </div>
          <p class="small muted">{{ original.sourceAlternatives.includes(id) ? "原文可选形式" : "补充替代建议" }} · {{ actions[id].equipment }}</p>
          <p v-if="original.alternativeNotes[id]" class="small">{{ original.alternativeNotes[id] }}</p>
          <p v-else-if="id === 'E014' || original.id === 'E014'" class="small">动态内收与静态支撑的计量方式不同，不能直接沿用组次或把次数换成秒。</p>
          <details class="alternative-guide">
            <summary>查看做法与目标部位</summary>
            <p class="small muted">{{ actions[id].muscles }}</p>
            <ol class="cues"><li v-for="(cue, index) in (actions[id].supplementalInstructions || actions[id].instructions).split('；').filter(Boolean)" :key="index">{{ cue }}</li></ol>
          </details>
          <p v-if="id === 'E014'" class="muted small">支撑时长与计量方式待核实，暂不直接替换。</p>
        </div>
      </div>
    </details>
    <details class="source-note">
      <summary>来源备注</summary>

      <p>{{ action.source }}</p>
      <p v-if="action.illustration?.sourceKind === 'ai'">动作图片为 AI 生成示意图。</p>
      <p v-if="action.illustration?.note">图示说明：{{ action.illustration.note }}</p>
    </details>
  </div>
</template>
