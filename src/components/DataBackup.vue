<script setup>
import { computed, ref } from "vue";
import { createBackup, parseBackup, restoreBackup, MAX_BACKUP_BYTES } from "../utils/backup";
const emit = defineEmits(["restored"]);
const fileInput = ref(null), pending = ref(null), message = ref(""), error = ref(""), reading = ref(false);
const dates = computed(() => Object.keys(pending.value?.data.training || {}).sort());
const noteCount = computed(() => Object.keys(pending.value?.data.notes || {}).length);
const scoreCount = computed(() => Object.keys(pending.value?.data.mastery || {}).length);
function exportData() {
  error.value = "";
  message.value = "";
  try {
    const backup = createBackup();
    const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `lianjiu-backup-${backup.exportedAt.replace(/[:.]/g, "-")}.json`;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    message.value = "已生成备份，请保存下载的 JSON 文件。可在另一台设备导入。";
  } catch {
    error.value = "导出失败，无法读取完整的本地记录。请检查浏览器存储权限，原记录未修改。";
  }
}
async function selectFile(event) {
  pending.value = null;
  error.value = "";
  message.value = "";
  const file = event.target.files?.[0];
  if (!file) return;
  if (file.size > MAX_BACKUP_BYTES) {
    error.value = "文件过大，请选择 2 MB 以内的 JSON 备份。";
    event.target.value = "";
    return;
  }
  reading.value = true;
  try { pending.value = parseBackup(await file.text()); }
  catch (cause) { error.value = cause.message || "无法读取文件，请重新选择。"; }
  finally { reading.value = false; event.target.value = ""; }
}
function cancel() { pending.value = null; }
function confirmImport() {
  if (!pending.value) return;
  error.value = "";
  try {
    const includesNotes = pending.value.version === 2;
    restoreBackup(pending.value);
    pending.value = null;
    message.value = includesNotes ? "导入成功，心得、评分和训练记录已更新。" : "导入成功，评分和训练记录已更新，原有心得已保留。";
    emit("restored");
  } catch (cause) { error.value = cause.message; }
}
</script>
<template>
  <details class="data-backup">
    <summary>数据备份 · 导入 / 导出</summary>
    <p class="muted">备份包含所有动作的个人心得、掌握程度评分，以及各日期的训练完成、动作替换和恢复记录。动作资料和训练计划由网站提供，无需备份。</p>
    <div class="backup-actions">
      <button class="primary" @click="exportData">导出备份</button>
      <button class="backup-secondary" :disabled="reading" @click="fileInput.click()">{{ reading ? "正在读取…" : "导入备份" }}</button>
      <input ref="fileInput" class="backup-file" type="file" accept=".json,application/json" aria-label="选择 JSON 备份文件" :disabled="reading" @change="selectFile" />
    </div>
    <section v-if="pending" class="backup-preview" aria-label="导入备份预览">
      <h3>确认导入备份</h3>
      <p>备份时间：{{ new Date(pending.exportedAt).toLocaleString("zh-CN") }}</p>
      <p>{{ scoreCount }} 个动作评分 · {{ dates.length }} 天训练记录<span v-if="pending.version === 2"> · {{ noteCount }} 条动作心得</span></p>
      <p v-if="dates.length">记录日期：{{ dates[0] }} 至 {{ dates[dates.length - 1] }}</p>
      <p v-if="pending.version === 1">这是旧版备份，不包含个人心得；导入时会保留当前心得。</p>
      <p>导入将替换当前浏览器的全部评分和训练记录<span v-if="pending.version === 2">，以及个人心得</span>，包括备份中为空的数据。建议先导出当前记录，保留一份备份。</p>
      <div class="backup-actions">
        <button class="primary" @click="confirmImport">确认替换并导入</button>
        <button class="backup-secondary" @click="cancel">取消</button>
      </div>
    </section>
    <p v-if="message" class="backup-message" role="status">{{ message }}</p>
    <p v-if="error" class="storage-warning" role="alert">{{ error }}</p>
  </details>
</template>
