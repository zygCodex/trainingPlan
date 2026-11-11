import { ref, computed, onMounted, onUnmounted } from "vue";
import { plan, actions } from "../data";
const KEY = "lianjiu.training.v1";
export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function useTraining() {
  const date = ref(localDate()),
    day = ref(1),
    records = ref({}),
    storageWarning = ref("");
  const celebration = ref(false);
  let allRecords = {};
  function load() {
    storageWarning.value = "";
    celebration.value = false;
    date.value = localDate();
    day.value = 1;
    records.value = {};
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || "{}");
      allRecords =
        saved && typeof saved === "object" && !Array.isArray(saved)
          ? saved
          : {};
      const today = allRecords[date.value];
      if (today && typeof today === "object") {
        if ([1, 2, 3, 4, 5].includes(today.day)) day.value = today.day;
        const clean = {};
        for (const [key, value] of Object.entries(today.records || {})) {
          if (
            ![1, 2, 3, 4, 5].includes(+key) ||
            !value ||
            typeof value !== "object"
          )
            continue;
          const done = {},
            replacements = {};
          for (const p of plan.filter((p) => p.day === +key)) {
            if (value.done?.[p.id] === true) done[p.id] = true;
            const target = value.replacements?.[p.id];
            if (
              actions[p.actionId].alternatives.includes(target) &&
              target !== "E014"
            )
              replacements[p.id] = target;
          }
          clean[key] = {
            done,
            replacements,
            celebrated: value.celebrated === true,
            recovery: value.recovery === true,
          };
        }
        records.value = clean;
      }
    } catch {
      allRecords = {};
      storageWarning.value = "本地记录暂时不可用，本次仍可正常训练。";
    }
  }
  load();
  const items = computed(() => plan.filter((p) => p.day === day.value));
  const record = computed(
    () =>
      records.value[day.value] || {
        done: {},
        replacements: {},
        celebrated: false,
        recovery: false,
      },
  );
  const count = computed(
    () => items.value.filter((p) => record.value.done[p.id]).length,
  );
  const complete = computed(() =>
    day.value === 5
      ? record.value.recovery
      : count.value === items.value.length && items.value.length > 0,
  );
  function current() {
    return (records.value[day.value] ||= {
      done: {},
      replacements: {},
      celebrated: false,
      recovery: false,
    });
  }
  function persist() {
    allRecords[date.value] = { day: day.value, records: records.value };
    try {
      localStorage.setItem(KEY, JSON.stringify(allRecords));
    } catch {
      storageWarning.value = "浏览器未能保存记录，关闭页面后进度可能丢失。";
    }
  }
  function ensureDate() {
    if (date.value !== localDate()) {
      celebration.value = false;
      load();
      return false;
    }
    return true;
  }
  function selectDay(id) {
    ensureDate();
    day.value = id;
    persist();
  }
  function maybeCelebrate() {
    if (complete.value && !current().celebrated) {
      current().celebrated = true;
      celebration.value = true;
    }
  }
  function toggle(id) {
    if (!ensureDate() || !items.value.some((p) => p.id === id)) return;
    const r = current();
    r.done[id] = !r.done[id];
    maybeCelebrate();
    persist();
  }
  function recover() {
    if (!ensureDate()) return;
    current().recovery = !current().recovery;
    maybeCelebrate();
    persist();
  }
  function replace(item, target) {
    if (!ensureDate() || !items.value.some((p) => p.id === item.id)) return;
    if (
      target !== item.actionId &&
      (!actions[item.actionId].alternatives.includes(target) ||
        target === "E014")
    )
      return;
    const r = current();
    if (
      r.done[item.id] &&
      !window.confirm("替换后需要重新完成这个动作，是否继续？")
    )
      return;
    r.done[item.id] = false;
    if (target === item.actionId) delete r.replacements[item.id];
    else r.replacements[item.id] = target;
    persist();
  }
  let timer;
  const onVisible = () => {
    if (!document.hidden) ensureDate();
  };
  onMounted(() => {
    timer = setInterval(ensureDate, 30000);
    document.addEventListener("visibilitychange", onVisible);
  });
  onUnmounted(() => {
    clearInterval(timer);
    document.removeEventListener("visibilitychange", onVisible);
  });
  return {
    reload: load,
    date,
    day,
    items,
    record,
    count,
    complete,
    celebration,
    storageWarning,
    selectDay,
    toggle,
    recover,
    replace,
  };
}
