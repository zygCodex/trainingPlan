import { TODOS_KEY, validateTodos } from "./todos";
import { actions, plan } from "../data";
import { NOTES_KEY, MAX_NOTE_LENGTH } from "../composables/useActionNotes";

export const TRAINING_KEY = "lianjiu.training.v1";
export const MASTERY_KEY = "lianjiu.mastery.v1";
export const MAX_BACKUP_BYTES = 2 * 1024 * 1024;
const object = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const owns = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
function requireValue(condition) {
  if (!condition) throw new Error("备份内容不符合要求，请选择本页面导出的完整 JSON 备份。当前记录未修改。");
}
function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

export function validateData(data) {
  requireValue(object(data) && object(data.training) && object(data.mastery));
  const training = {}, mastery = {};
  for (const [id, score] of Object.entries(data.mastery)) {
    requireValue(owns(actions, id) && Number.isInteger(score) && score >= 1 && score <= 10);
    mastery[id] = score;
  }
  for (const [date, session] of Object.entries(data.training)) {
    requireValue(validDate(date) && object(session));
    requireValue([1, 2, 3, 4, 5].includes(session.day) && object(session.records));
    const records = {};
    for (const [day, record] of Object.entries(session.records)) {
      requireValue(["1", "2", "3", "4", "5"].includes(day) && object(record));
      requireValue(object(record.done) && object(record.replacements));
      requireValue(typeof record.celebrated === "boolean" && typeof record.recovery === "boolean");
      const done = {}, replacements = {};
      const items = plan.filter((item) => item.day === Number(day));
      for (const [id, value] of Object.entries(record.done)) {
        requireValue(items.some((item) => item.id === id) && typeof value === "boolean");
        done[id] = value;
      }
      for (const [id, target] of Object.entries(record.replacements)) {
        const item = items.find((item) => item.id === id);
        requireValue(item && actions[item.actionId].alternatives.includes(target) && target !== "E014");
        replacements[id] = target;
      }
      records[day] = { done, replacements, celebrated: record.celebrated, recovery: record.recovery };
    }
    training[date] = { day: session.day, records };
  }
  const result = { training, mastery };
  if (owns(data, "notes")) {
    requireValue(object(data.notes));
    result.notes = {};
    for (const [id, text] of Object.entries(data.notes)) {
      requireValue(owns(actions, id) && typeof text === "string" && text.length <= MAX_NOTE_LENGTH);
      result.notes[id] = text;
    }
  }
  if (owns(data, "todos")) result.todos = validateTodos(data.todos);
  return result;
}

export function createBackup(storage = localStorage) {
  const data = validateData({
    training: JSON.parse(storage.getItem(TRAINING_KEY) || "{}"),
    mastery: JSON.parse(storage.getItem(MASTERY_KEY) || "{}"),
    notes: JSON.parse(storage.getItem(NOTES_KEY) || "{}"),
    todos: JSON.parse(storage.getItem(TODOS_KEY) || "[]"),
  });
  return { app: "lianjiu", version: 3, exportedAt: new Date().toISOString(), data };
}

export function parseBackup(text) {
  let backup;
  try { backup = JSON.parse(text); }
  catch { throw new Error("文件不是有效的 JSON，当前记录未修改。"); }
  requireValue(object(backup) && backup.app === "lianjiu");
  if (![1, 2, 3].includes(backup.version)) throw new Error("暂不支持此备份版本，当前记录未修改。");
  requireValue(typeof backup.exportedAt === "string" && !Number.isNaN(Date.parse(backup.exportedAt)));
  if (backup.version >= 2) requireValue(object(backup.data) && owns(backup.data, "notes"));
  if (backup.version === 3) requireValue(object(backup.data) && owns(backup.data, "todos"));
  const data = validateData(backup.data);
  // Old exports never contained personal notes; preserve current notes on import.
  if (backup.version === 1) delete data.notes;
  if (backup.version < 3) delete data.todos;
  return { ...backup, data };
}

export function restoreBackup(backup, storage = localStorage) {
  if (backup.version === 3) requireValue(object(backup.data) && owns(backup.data, "todos"));
  const data = validateData(backup.data);
  const keys = [TRAINING_KEY, MASTERY_KEY];
  if (owns(data, "notes")) keys.push(NOTES_KEY);
  if (owns(data, "todos")) keys.push(TODOS_KEY);
  const previous = keys.map((key) => storage.getItem(key));
  const values = [JSON.stringify(data.training), JSON.stringify(data.mastery)];
  if (owns(data, "notes")) values.push(JSON.stringify(data.notes));
  if (owns(data, "todos")) values.push(JSON.stringify(data.todos));
  const written = [];
  try {
    keys.forEach((key, index) => {
      storage.setItem(key, values[index]);
      written.push(index);
    });
  } catch {
    try {
      written.reverse().forEach((index) => {
        if (previous[index] === null) storage.removeItem(keys[index]);
        else storage.setItem(keys[index], previous[index]);
      });
    } catch {
      throw new Error("导入失败，部分数据可能已改变。请保留备份文件，允许浏览器保存数据后重新导入。");
    }
    throw new Error("浏览器无法保存备份，导入已取消，原记录已保留。请检查存储权限或空间。");
  }
}
