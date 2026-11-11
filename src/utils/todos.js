export const TODOS_KEY = "lianjiu.todos.v1";
export const MAX_TODO_LENGTH = 300;
export const MAX_TODOS = 1000;
function validDay(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}
export function validateTodos(value) {
  if (!Array.isArray(value) || value.length > MAX_TODOS) throw new Error("代办数据格式不正确，当前记录未修改。");
  const ids = new Set();
  return value.map((task) => {
    if (!task || typeof task !== "object" || Array.isArray(task) ||
      typeof task.id !== "string" || !/^[\w-]{1,80}$/.test(task.id) || ids.has(task.id) ||
      typeof task.text !== "string" || !task.text.trim() || task.text.length > MAX_TODO_LENGTH ||
      typeof task.createdAt !== "string" || Number.isNaN(Date.parse(task.createdAt)) ||
      (task.completedOn !== null && (typeof task.completedOn !== "string" || !validDay(task.completedOn)))) {
      throw new Error("代办数据格式不正确，当前记录未修改。");
    }
    ids.add(task.id);
    return { id: task.id, text: task.text.trim(), createdAt: task.createdAt, completedOn: task.completedOn };
  });
}
