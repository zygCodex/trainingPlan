<script setup>
import { ref, computed } from "vue";
import { plan, warmups, exercises } from "../data";
import DayPicker from "./DayPicker.vue";
import ExerciseCard from "./ExerciseCard.vue";
import ActionDetail from "./ActionDetail.vue";
const category = ref("plan"),
  libraryDay = ref(1),
  query = ref("");
const categories = [
  { id: "plan", name: "完整计划" },
  { id: "warmups", name: "热身动作库" },
  { id: "exercises", name: "正式动作库" },
];
const filtered = computed(() =>
  (category.value === "warmups" ? warmups : exercises).filter((a) =>
    `${a.name} ${a.equipment} ${a.muscles}`
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
      <span class="library-count">32 <small>个动作</small></span>
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
    <template v-else
      ><label class="search"
        ><span>⌕</span
        ><input
          v-model="query"
          type="search"
          placeholder="搜索动作、器械或肌肉区域"
          aria-label="搜索动作"
        /><span>{{ filtered.length }} 项</span></label
      >
      <div class="library-grid">
        <details v-for="a in filtered" :key="a.id" class="library-card">
          <summary>
            <div>
              <span class="eyebrow"
                >{{ a.id }} /
                {{ category === "warmups" ? "WARM UP" : "EXERCISE" }}</span
              >
              <h3>{{ a.name }}</h3>
              <p>{{ a.muscles }}</p>
            </div>
            <span class="chevron">⌄</span>
          </summary>
          <ActionDetail :action="a" />
        </details>
      </div>
      <div v-if="!filtered.length" class="empty">
        没有找到相关动作，试试换个关键词。
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
