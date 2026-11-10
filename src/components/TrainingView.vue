<script setup>
import { computed } from "vue";
import { days } from "../data";
import DayPicker from "./DayPicker.vue";
import ExerciseCard from "./ExerciseCard.vue";
const props = defineProps({ training: Object });
const currentDay = computed(() =>
  days.find((d) => d.id === props.training.day.value),
);
const nextItem = computed(() =>
  props.training.items.value.find(
    (item) => !props.training.record.value.done[item.id],
  ),
);
const sections = computed(() =>
  [
    { name: "热身激活", en: "WARM UP", stage: "热身" },
    { name: "正式训练", en: "WORKOUT", stage: "正式训练" },
  ].map((section) => {
    const items = props.training.items.value.filter(
      (item) => item.stage === section.stage,
    );
    const doneCount = items.filter(
      (item) => props.training.record.value.done[item.id],
    ).length;
    return { ...section, items, doneCount };
  }),
);
</script>
<template>
  <section>
    <div class="page-intro">
      <div>
        <p class="eyebrow">YOUR DAILY SESSION</p>
        <h1>今天，也要练得漂亮<span>。</span></h1>
        <p class="muted">先质量，再重量。跟着自己的节奏来。</p>
      </div>
      <span class="date-label">{{
        training.date.value.replaceAll("-", " / ")
      }}</span>
    </div>
    <DayPicker
      :model-value="training.day.value"
      @update:model-value="training.selectDay"
    />
    <div class="hero">
      <div class="hero-copy">
        <span class="hero-label"
          ><i></i> DAY 0{{ currentDay.id }} / {{ currentDay.en }}</span
        >
        <h2>{{ currentDay.focus }}</h2>
        <p>{{ currentDay.subtitle }}</p>
        <div class="hero-bottom">
          <span>{{
            currentDay.id === 5
              ? "给身体一点恢复的时间"
              : `热身 ${sections[0].items.length} 项　/　正式训练 ${sections[1].items.length} 项`
          }}</span
          ><span class="pill">{{
            training.complete.value ? "✓ 今日已完成" : "按自己的节奏"
          }}</span>
        </div>
      </div>
      <div class="hero-art" aria-hidden="true">
        <svg viewBox="0 0 260 200">
          <g
            transform="translate(130 100) rotate(-32)"
            fill="none"
            stroke="currentColor"
            stroke-width="13"
            stroke-linecap="round"
          >
            <path d="M-100 0H100" />
            <path d="M-70-40V40M-48-55V55M48-55V55M70-40V40" />
          </g></svg
        ><span>GET<br />STRONGER.</span>
      </div>
    </div>
    <template v-if="currentDay.id !== 5"
      ><div class="progress-panel" aria-live="polite">
        <div>
          <strong>{{
            training.complete.value
              ? "今天的坚持，已经算数了。"
              : "每完成一项，离目标更近一步"
          }}</strong
          ><span
            ><b>{{ training.count.value }}</b> /
            {{ training.items.value.length }} 已完成</span
          >
        </div>
        <div
          class="progress-track"
          role="progressbar"
          aria-label="今日训练完成进度"
          :aria-valuenow="training.count.value"
          :aria-valuemax="training.items.value.length"
          aria-valuemin="0"
        >
          <i
            :style="{
              width: `${(training.count.value / training.items.value.length) * 100}%`,
            }"
          ></i>
        </div>
        <p>完成一个动作的全部组数后，点右侧打勾。</p>
      </div>
      <div v-for="s in sections" :key="s.stage" class="training-section">
        <div class="section-heading">
          <h3>
            <span :class="{ orange: s.stage === '热身' }">↗</span
            >{{ s.name }} <small>{{ s.en }}</small>
          </h3>
          <span>{{ s.doneCount }} / {{ s.items.length }} 已完成</span>
        </div>
        <div class="exercise-list">
          <ExerciseCard
            v-for="item in s.items"
            :key="`${training.date.value}-${currentDay.id}-${item.id}`"
            :item="item"
            :done="!!training.record.value.done[item.id]"
            :next="item.id === nextItem?.id"
            :replacement="training.record.value.replacements[item.id]"
            @toggle="training.toggle(item.id)"
            @replace="training.replace(item, $event)"
          />
        </div>
      </div>
    </template>
    <section v-else class="recovery">
      <span class="recovery-icon">☀</span>
      <h3>今天，让身体充充电。</h3>
      <p>核心与腹肌训练 · 低强度有氧散步 · 筋膜滚压</p>
      <p class="muted">
        原文未提供具体动作、组次和时长，根据自己的状态安排恢复。
      </p>
      <button
        class="primary"
        :aria-pressed="!!training.record.value.recovery"
        @click="training.recover"
      >
        {{
          training.record.value.recovery
            ? "✓ 已完成今日恢复 · 点击取消"
            : "完成今日恢复 ✓"
        }}
      </button>
    </section>
    <div class="end-note">
      <span>✦</span>
      <p>不用每次都突破自己，<br />愿意开始，就已经很好。</p>
    </div>
  </section>
</template>
