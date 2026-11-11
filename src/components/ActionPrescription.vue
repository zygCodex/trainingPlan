<script setup>
import { computed } from "vue";
import { trainingForAction } from "../data";
const props = defineProps({ action: Object, item: Object });
const entries = computed(() => props.item ? [{ ...props.item, prescription: props.action.id === "E014" ? null : props.item.prescription }] : trainingForAction(props.action.id));
const range = (values) => values[0] === values[1] ? String(values[0]) : `${values[0]}～${values[1]}`;
</script>
<template>
  <section class="prescription-panel" aria-label="组数与次数">
    <h4>组数 / 次数</h4>
    <template v-if="entries.length">
      <div v-for="entry in entries" :key="entry.id" class="prescription-entry">
        <div class="prescription-day">{{ entry.dayLabel }}<span v-if="entry.side === '每侧'">每侧执行</span><span v-if="entry.superset !== '—'">超级组</span></div>
        <template v-if="entry.prescription?.work">
          <dl class="prescription-lines">
            <div v-if="entry.prescription.preparation">
              <dt>{{ entry.prescription.preparation.kind }}组</dt>
              <dd>{{ entry.prescription.preparation.sets }} 组 <small>次数未单独说明</small></dd>
            </div>
            <div class="prescription-work"><dt>正式组</dt><dd>{{ range(entry.prescription.work.sets) }} 组 × {{ range(entry.prescription.work.reps) }} 次</dd></div>
          </dl>
          <p v-if="!entry.prescription.preparation" class="prescription-missing">适应／热身组：原文未单独列出</p>
        </template>
        <p v-else class="prescription-missing">{{ action.id === "E014" ? "支撑时长与计量方式待核实，不能直接套用髋内收的次数。" : "原文未说明该热身动作的组数、次数或时长。" }}</p>
        <p v-if="entry.side === '原文未说明'" class="prescription-missing">单侧／双侧计量：原文未说明</p>
        <p v-if="entry.remark && entry.remark !== '—'" class="prescription-remark">{{ entry.remark }}</p>
      </div>
      <p class="prescription-missing">重量与组间休息：原文未说明</p>
    </template>
    <p v-else class="prescription-missing">补充图示动作，未编入本文训练计划；原文未提供对应组数／次数。</p>
  </section>
</template>
