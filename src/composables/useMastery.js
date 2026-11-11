import { ref } from "vue";
import { actions } from "../data";

const KEY = "lianjiu.mastery.v1";
const validScore = (score) => Number.isInteger(score) && score >= 1 && score <= 10;

export function masteryLabel(score) {
  if (!validScore(score)) return "尚未评分";
  if (score <= 2) return "刚开始了解";
  if (score <= 4) return "正在熟悉";
  if (score <= 6) return "基本掌握";
  if (score <= 8) return "比较熟练";
  return "很有把握";
}

export function useMastery() {
  const scores = ref({});
  const storageWarning = ref("");
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || "{}");
    if (saved && typeof saved === "object" && !Array.isArray(saved)) {
      scores.value = Object.fromEntries(
        Object.entries(saved).filter(([id, score]) => actions[id] && validScore(score)),
      );
    }
  } catch {
    storageWarning.value = "无法读取本地评分，本次仍可打分。";
  }

  function setScore(id, value) {
    if (!actions[id]) return;
    const score = value === "" ? null : Number(value);
    if (score !== null && !validScore(score)) return;
    if (score === null) delete scores.value[id];
    else scores.value[id] = score;
    try {
      localStorage.setItem(KEY, JSON.stringify(scores.value));
      storageWarning.value = "";
    } catch {
      storageWarning.value = "评分暂时无法保存，离开页面后可能丢失。请允许浏览器保存本地数据。";
    }
  }

  return { scores, storageWarning, setScore };
}
