<script setup>
import { ref, computed } from "vue";
import { plan, warmups, exercises, actionModules } from "../data";
import DayPicker from "./DayPicker.vue";
import ExerciseCard from "./ExerciseCard.vue";
import ActionDetail from "./ActionDetail.vue";
import ActionIllustration from "./ActionIllustration.vue";
import { useMastery, masteryLabel } from "../composables/useMastery";
const { scores, storageWarning, setScore } = useMastery();
const category = ref("plan"),
  libraryDay = ref(1),
  query = ref(""),
  selectedModule = ref(""),
  illustratedOnly = ref(false);
const categories = [
  { id: "plan", name: "完整计划" },
  { id: "warmups", name: "热身动作库" },
  { id: "exercises", name: "正式动作库" },
];
const filtered = computed(() =>
  (category.value === "warmups" ? warmups : exercises).filter((a) =>
    (!selectedModule.value || a.module === selectedModule.value) &&
    (!illustratedOnly.value || !!a.illustration) &&
    `${a.name} ${a.equipment} ${a.muscles} ${a.module}`
      .toLowerCase()
      .includes(query.value.trim().toLowerCase()),
  ),
);
</script>
<template>
  <section>
    <div class="page-intro">
      <div>
        <p class="eyebrow">THE TRAINING LIBRARY</p>
        <h1>练之前，多了解一点<span>。</span></h1>
        <p class="muted">四分化计划与动作资料，都在这里。</p>
      </div>
      <span class="library-count">{{ warmups.length + exercises.length }} <small>个动作</small></span>
    </div>
    <div class="category-tabs" aria-label="资料分类">
      <button
        v-for="c in categories"
        :key="c.id"
        :class="{ active: category === c.id }"
        :aria-pressed="category === c.id"
        @click="category = c.id"
      >
        {{ c.name }}
      </button>
    </div>
    <template v-if="category === 'plan'"
      ><DayPicker v-model="libraryDay" />
      <p class="library-hint">
        完整计划仅供查阅。到「今日训练」开始打勾和替换动作。
      </p>
      <div v-if="libraryDay !== 5" class="exercise-list">
        <ExerciseCard
          v-for="item in plan.filter((p) => p.day === libraryDay)"
          :key="item.id"
          :item="item"
          readonly
        />
      </div>
      <div v-else class="recovery">
        <h3>主动恢复日</h3>
        <p>核心／腹肌 · 低强度有氧散步 · 筋膜滚压</p>
        <p class="muted">原文未提供具体动作、组次或时长。</p>
      </div></template
    >
    <template v-else>
      <div class="module-filters" role="group" aria-label="按所属模块筛选">
        <button
          v-for="module in ['', ...actionModules]"
          :key="module"
          :class="{ active: selectedModule === module }"
          :aria-pressed="selectedModule === module"
          @click="selectedModule = module"
        >{{ module || "全部模块" }}</button>
      </div>
      <label class="illustrated-filter">
        <input v-model="illustratedOnly" type="checkbox" /> 只看有图动作
      </label>
      <label class="search"
        ><span>⌕</span
        ><input
          v-model="query"
          type="search"
          placeholder="搜索动作、器械或肌肉区域"
          aria-label="搜索动作"
        /><span>{{ filtered.length }} 项</span></label
      >
      <p class="library-hint">展开动作，为自己的掌握程度打 1–10 分。评分保存在当前浏览器，可随时修改。</p>
      <p v-if="storageWarning" class="storage-warning" role="status">{{ storageWarning }}</p>
      <div class="library-grid">
        <details v-for="a in filtered" :key="a.id" class="library-card">
          <summary>
            <ActionIllustration v-if="a.illustration" :illustration="a.illustration" compact />
            <div class="library-card-title">
              <span class="eyebrow"
                >{{ a.id }} /
                {{ category === "warmups" ? "WARM UP" : "EXERCISE" }}</span
              >
              <h3>{{ a.name }}</h3>
              <span class="module-tag" :aria-label="`所属模块：${a.module}`">{{ a.module }}</span>
              <p>{{ a.muscles }}</p>
              <p class="mastery-summary" :class="{ rated: scores[a.id] }">
                掌握程度 · {{ scores[a.id] ? `${scores[a.id]} / 10 · ` : "" }}{{ masteryLabel(scores[a.id]) }}
              </p>
            </div>
            <span class="chevron">⌄</span>
          </summary>
          <ActionDetail :action="a">
            <template #rating>
          <div class="mastery-field">
            <div class="mastery-heading">
              <label :for="`mastery-${a.id}`">掌握程度</label>
              <select
                :id="`mastery-${a.id}`"
                :value="scores[a.id] ?? ''"
                :aria-label="`${a.name}的掌握程度`"
                @change="setScore(a.id, $event.target.value)"
              >
                <option value="">尚未评分</option>
                <option v-for="score in 10" :key="score" :value="score">{{ score }} 分</option>
              </select>
            </div>
            <p class="mastery-status" role="status">{{ masteryLabel(scores[a.id]) }}</p>
            <details class="mastery-help"><summary>评分标准</summary><p class="mastery-guide">1–2 刚开始了解 · 3–4 正在熟悉 · 5–6 基本掌握 · 7–8 比较熟练 · 9–10 很有把握</p></details>
          </div>
            </template>
          </ActionDetail>
        </details>
      </div>
      <div v-if="!filtered.length" class="empty">
        没有找到匹配的动作，试试其他模块或关键词。
        <button class="text-button" @click="selectedModule = ''; query = ''; illustratedOnly = false">清除筛选与搜索</button>
      </div></template
    >
    <div class="source-footer">
      <h4>关于这份计划</h4>
      <p>
        依据谭成义新手四分化教程的博客整理，未逐项核对原视频。缺失的组次与时长保留为未说明。
      </p>
      <a
        href="https://smallsmartao.github.io/2026/08/30/2026-08-30-TanChengyi-Beginner-4Split-Strength-Training-Guide/"
        target="_blank"
        rel="noopener noreferrer"
        >阅读原文 ↗</a
      ><a href="./training-plan.md" target="_blank">查看整理文档 ↗</a>
    </div>
  </section>
</template>
