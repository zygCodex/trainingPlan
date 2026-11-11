import data from "./training.json";
export const { warmups, exercises, plan } = data;
export const actionModules = ["胸", "肩", "背", "腿", "手臂", "腹部"];
export const actions = Object.fromEntries(
  [...warmups, ...exercises].map((a) => [a.id, a]),
);
export const days = [
  {
    id: 1,
    name: "胸部",
    en: "CHEST DAY",
    short: "胸",
    focus: "胸部 · 推力",
    subtitle: "每一次推起，都在靠近更好的自己。",
    main: "平板杠铃卧推",
  },
  {
    id: 2,
    name: "背部",
    en: "BACK DAY",
    short: "背",
    focus: "背部 · 拉力",
    subtitle: "稳住身体，让每一次拉动都有力量。",
    main: "屈髋引体向上",
  },
  {
    id: 3,
    name: "腿部",
    en: "LEG DAY",
    short: "腿",
    focus: "下肢 · 髋稳定",
    subtitle: "从地面出发，把基础练得更扎实。",
    main: "单腿哑铃硬拉",
  },
  {
    id: 4,
    name: "肩与手臂",
    en: "SHOULDER DAY",
    short: "肩",
    focus: "肩部 · 手臂",
    subtitle: "专注动作的质量，感受一点点进步。",
    main: "站姿杠铃实力推",
  },
  {
    id: 5,
    name: "主动恢复",
    en: "RECOVERY DAY",
    short: "恢复",
    focus: "放松 · 恢复",
    subtitle: "放慢一点，也是前进的一部分。",
    main: "低强度活动",
  },
];

// Keep training amounts tied to their day, including source-listed alternatives.
export function trainingForAction(id) {
  return plan.filter((item) => item.actionId === id || actions[item.actionId].alternatives.includes(id))
    .map((item) => ({ ...item, prescription: id === "E014" ? null : item.prescription }));
}
