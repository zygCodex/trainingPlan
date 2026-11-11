import { computed, onMounted, onUnmounted, ref } from "vue";
import { localDate } from "./useTraining";
import { TODOS_KEY, MAX_TODOS } from "../utils/todos";
import { validateTodos } from "../utils/todos";
export function useTodos() {
  const tasks = ref([]), today = ref(localDate()), error = ref("");
  try { tasks.value = validateTodos(JSON.parse(localStorage.getItem(TODOS_KEY) || "[]")); }
  catch { error.value = "无法读取本地代办，请检查浏览器存储权限或备份文件。"; }
  const pending = computed(() => tasks.value.filter(task => task.completedOn === null));
  const completedToday = computed(() => tasks.value.filter(task => task.completedOn === today.value));
  const visible = computed(() => [...pending.value, ...completedToday.value]);
  function persist(next) {
    try {
      const valid = validateTodos(next);
      localStorage.setItem(TODOS_KEY, JSON.stringify(valid));
      tasks.value = valid;
      error.value = "";
      return true;
    } catch {
      error.value = "代办保存失败，清单未修改。请检查浏览器存储权限或空间。";
      return false;
    }
  }
  function add(text) {
    if (tasks.value.length >= MAX_TODOS) { error.value = "代办记录已达上限，请先导出备份并删除不再需要的记录。"; return false; }
    return persist([...tasks.value, { id: crypto.randomUUID(), text, createdAt: new Date().toISOString(), completedOn: null }]);
  }
  function update(id, text) { return persist(tasks.value.map(task => task.id === id ? { ...task, text } : task)); }
  function remove(id) { return persist(tasks.value.filter(task => task.id !== id)); }
  function toggle(id) {
    today.value = localDate();
    return persist(tasks.value.map(task => task.id === id ? { ...task, completedOn: task.completedOn === null ? today.value : null } : task));
  }
  let timer;
  function refreshDate() {
    today.value = localDate();
    clearTimeout(timer);
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    timer = setTimeout(refreshDate, tomorrow.valueOf() - now.valueOf() + 50);
  }
  const onVisible = () => { if (!document.hidden) refreshDate(); };
  onMounted(() => {
    refreshDate();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", refreshDate);
  });
  onUnmounted(() => {
    clearTimeout(timer);
    document.removeEventListener("visibilitychange", onVisible);
    window.removeEventListener("focus", refreshDate);
  });
  return { today, pending, completedToday, visible, error, add, update, remove, toggle };
}
