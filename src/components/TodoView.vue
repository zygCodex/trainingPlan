<script setup>
import { ref } from "vue";
import { useTodos } from "../composables/useTodos";
import { MAX_TODO_LENGTH } from "../utils/todos";
const { today, pending, completedToday, visible, error, add, update, remove, toggle } = useTodos();
const draft = ref(""), editingId = ref(null), editText = ref(""), inputError = ref("");
function create() {
  inputError.value = "";
  if (!draft.value.trim()) { inputError.value = "请先填写代办内容。"; return; }
  if (add(draft.value.trim())) draft.value = "";
}
function edit(task) { editingId.value = task.id; editText.value = task.text; inputError.value = ""; }
function save(id) {
  if (!editText.value.trim()) { inputError.value = "代办内容不能为空。"; return; }
  if (update(id, editText.value.trim())) { editingId.value = null; inputError.value = ""; }
}
function discard() { editingId.value = null; inputError.value = ""; }
function deleteTask(id) { if (remove(id) && editingId.value === id) discard(); }
</script>
<template>
  <section class="todo-view">
    <div class="page-intro">
      <div><p class="eyebrow">ONE THING AT A TIME</p><h1>把今天，安排好<span>。</span></h1><p class="muted">未完成的继续保留；当天完成划线，第二天自动隐藏。</p></div>
      <span class="date-label">{{ today.replaceAll("-", " / ") }}</span>
    </div>
    <form class="todo-add" @submit.prevent="create">
      <label for="new-todo">添加代办</label>
      <div><input id="new-todo" v-model="draft" type="text" :maxlength="MAX_TODO_LENGTH" placeholder="例如：整理本周训练安排" autocomplete="off" /><button class="primary" type="submit">添加</button></div>
    </form>
    <p v-if="inputError" class="storage-warning" role="alert">{{ inputError }}</p>
    <p v-if="error" class="storage-warning" role="alert">{{ error }}</p>
    <div class="todo-heading"><h2>代办清单 <span>{{ pending.length }} 项待完成</span></h2><span>今日完成 {{ completedToday.length }}</span></div>
    <ul v-if="visible.length" class="todo-list">
      <li v-for="task in visible" :key="task.id" class="todo-item" :class="{ completed: task.completedOn !== null }">
        <input type="checkbox" class="todo-check" :checked="task.completedOn !== null" :aria-label="`${task.completedOn ? '取消完成' : '完成'}：${task.text}`" @change="toggle(task.id)" />
        <div class="todo-copy">
          <form v-if="editingId === task.id" class="todo-edit-form" @submit.prevent="save(task.id)">
            <label :for="`todo-edit-${task.id}`">编辑代办</label>
            <textarea :id="`todo-edit-${task.id}`" v-model="editText" :maxlength="MAX_TODO_LENGTH" rows="2"></textarea>
            <div class="todo-row-actions"><button class="primary" type="submit">保存</button><button class="backup-secondary" type="button" @click="discard">取消</button></div>
          </form>
          <template v-else>
            <p class="todo-text">{{ task.text }}</p>
            <div class="todo-row-actions"><span v-if="task.completedOn" class="todo-done-label">今日已完成</span><button type="button" :aria-label="`编辑代办：${task.text}`" @click="edit(task)">编辑</button><button type="button" :aria-label="`删除代办：${task.text}`" @click="deleteTask(task.id)">删除</button></div>
          </template>
        </div>
      </li>
    </ul>
    <div v-else class="todo-empty"><span aria-hidden="true">✓</span><h3>清单还是空的</h3><p>添加一件想完成的小事，从这里开始。</p></div>
  </section>
</template>
