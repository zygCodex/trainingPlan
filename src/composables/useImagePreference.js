import { ref } from "vue";
const KEY = "lianjiu.showImages.v1";
const showImages = ref(true);
const imagePreferenceWarning = ref("");
let loaded = false;
export function useImagePreference() {
  if (!loaded) {
    loaded = true;
    try {
      const saved = localStorage.getItem(KEY);
      if (saved !== null) {
        const value = JSON.parse(saved);
        if (typeof value === "boolean") showImages.value = value;
      }
    } catch {
      imagePreferenceWarning.value = "无法读取图片显示设置，已使用默认显示。";
    }
  }
  function setShowImages(value) {
    showImages.value = Boolean(value);
    try {
      localStorage.setItem(KEY, JSON.stringify(showImages.value));
      imagePreferenceWarning.value = "";
    } catch {
      imagePreferenceWarning.value = "图片显示设置暂时无法保存，刷新后可能恢复默认。";
    }
  }
  return { showImages, setShowImages, imagePreferenceWarning };
}
