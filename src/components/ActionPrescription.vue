<script setup>
import { computed } from "vue";
import { trainingForAction, usesOriginalDose } from "../data";
const props = defineProps({ action: Object, item: Object });
const needsDose = computed(() => props.item && !usesOriginalDose(props.item.actionId, props.action.id));
const entries = computed(() => props.item ? [{ ...props.item, prescription: props.action.id === "E014" ? null : props.item.prescription }] : trainingForAction(props.action.id));
</script>
<template>
  <div class="prescription-text" aria-label="组数与次数">
    <p v-if="needsDose" class="prescription-dose"><span class="prescription-label">替代动作组次／时长：</span>需按当前动作另定，单侧／双侧与重量也需重新选择。</p>
    <p v-for="entry in needsDose ? [] : entries" :key="entry.id" class="prescription-dose">
      <span v-if="entries.length > 1" class="prescription-context">{{ entry.dayLabel }} · </span><span class="prescription-label">组数/次数：</span><span>{{ action.id === "E014" ? "支撑时长与计量方式待核实" : entry.dose }}<span v-if="entry.side === '每侧'"> · 每侧</span></span>
    </p>
    <p v-if="!entries.length" class="prescription-dose"><span class="prescription-label">组数/次数：</span>{{ action.supplemental ? "补充替代动作，组次／时长需另定" : "原文未说明（图示补充动作）" }}</p>
    <details v-if="entries.length" class="prescription-notes">
      <summary>训练备注</summary>
      <p v-if="needsDose">原计划参考：{{ item.name }} · {{ item.dose }}{{ item.side === '每侧' ? ' · 每侧' : '' }}。仅供比较，不作为替代动作的执行剂量。</p>
      <div v-for="entry in entries" :key="entry.id">
        <p v-if="entries.length > 1">{{ entry.dayLabel }}</p>
        <p v-if="entry.prescription?.preparation">{{ entry.prescription.preparation.kind }}组次数未单独说明。</p>
        <p v-if="entry.side === '原文未说明'">单侧／双侧计量：原文未说明。</p>
        <p v-if="entry.remark && entry.remark !== '—'">{{ entry.remark }}</p>
      </div>
      <p>重量与组间休息：原文未说明。</p>
    </details>
  </div>
</template>
