import { ref } from "vue";
import { actions } from "../data";

export const NOTES_KEY = "lianjiu.notes.v1";
export const MAX_NOTE_LENGTH = 5000;
const notes = ref({});
const storageWarning = ref("");
let loaded = false;
const owns = (id) => Object.prototype.hasOwnProperty.call(actions, id);

export function reloadActionNotes() {
  loaded = true;
  storageWarning.value = "";
  try {
    const saved = JSON.parse(localStorage.getItem(NOTES_KEY) || "{}");
    if (!saved || typeof saved !== "object" || Array.isArray(saved)) throw new Error("invalid notes");
    notes.value = Object.fromEntries(Object.entries(saved).filter(([id, text]) =>
      owns(id) && typeof text === "string" && text.length <= MAX_NOTE_LENGTH,
    ));
  } catch {
    notes.value = {};
    storageWarning.value = "无法读取本地心得，请检查浏览器存储权限。";
  }
}

export function useActionNotes() {
  if (!loaded) reloadActionNotes();
  function saveNote(id, text) {
    if (!owns(id) || typeof text !== "string" || text.length > MAX_NOTE_LENGTH) return false;
    const next = { ...notes.value, [id]: text };
    try {
      localStorage.setItem(NOTES_KEY, JSON.stringify(next));
      notes.value = next;
      storageWarning.value = "";
      return true;
    } catch {
      storageWarning.value = "心得保存失败，请检查浏览器存储权限或空间。草稿仍保留，请勿关闭编辑框。";
      return false;
    }
  }
  return { notes, storageWarning, saveNote };
}
