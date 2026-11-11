<script setup>
import { computed, ref, useId, watch } from "vue";
import { useActionNotes, MAX_NOTE_LENGTH } from "../composables/useActionNotes";
const props = defineProps({ action: Object });
const { notes, storageWarning, saveNote } = useActionNotes();
const editing = ref(false), draft = ref(""), message = ref("");
const editorId = useId();
const currentNote = computed(() => Object.prototype.hasOwnProperty.call(notes.value, props.action.id)
  ? notes.value[props.action.id] : props.action.notes || "");
function edit() {
  draft.value = currentNote.value;
  message.value = "";
  editing.value = true;
}
function save() {
  if (saveNote(props.action.id, draft.value)) {
    editing.value = false;
    message.value = "心得已保存到当前浏览器。";
  }
}
function cancel() { editing.value = false; message.value = ""; }
watch(() => props.action.id, cancel);
</script>
<template>
  <div class="personal-note">
    <div class="note-heading">
      <h4>✎ 个人心得</h4>
      <button v-if="!editing" class="note-edit" :aria-label="`编辑${action.name}的个人心得`" @click="edit">编辑</button>
    </div>
    <template v-if="editing">
      <label :for="editorId" class="note-label">{{ action.name }}的心得</label>
      <textarea
        :id="editorId"
        v-model="draft"
        :maxlength="MAX_NOTE_LENGTH"
        rows="5"
        placeholder="记下发力感受、动作要点，或下次想调整的地方…"
      />
      <p class="note-counter">{{ draft.length }} / {{ MAX_NOTE_LENGTH }} · 点击保存后生效</p>
      <div class="note-actions">
        <button class="primary" @click="save">保存心得</button>
        <button class="backup-secondary" @click="cancel">取消</button>
      </div>
    </template>
    <p v-else class="note-content">{{ currentNote || "还没有心得，点击编辑记录自己的感受。" }}</p>
    <p v-if="message" class="note-message" role="status">{{ message }}</p>
    <p v-if="storageWarning" class="storage-warning" role="alert">{{ storageWarning }}</p>
  </div>
</template>
