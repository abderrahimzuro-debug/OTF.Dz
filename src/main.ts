import "@fontsource-variable/noto-sans-arabic";
import { invoke } from "@tauri-apps/api/core";
import "./styles.css";

function requiredElement<ElementType extends HTMLElement>(selector: string): ElementType {
  const element = document.querySelector<ElementType>(selector);
  if (!element) throw new Error(`Missing required element: ${selector}`);
  return element;
}

const app = requiredElement<HTMLDivElement>("#app");
const mode = requiredElement<HTMLHeadingElement>("#runtime-mode");
const description = requiredElement<HTMLParagraphElement>("#runtime-description");
const detailsButton = requiredElement<HTMLButtonElement>("#runtime-details");
const detailsPanel = requiredElement<HTMLDivElement>("#runtime-panel");
const result = requiredElement<HTMLParagraphElement>("#runtime-result");
const nativeRuntime = "__TAURI_INTERNALS__" in window;

requiredElement<HTMLSpanElement>("#app-version").textContent = __APP_VERSION__;
app.dataset.runtime = nativeRuntime ? "desktop" : "browser";
mode.textContent = nativeRuntime ? "تطبيق سطح المكتب" : "معاينة المتصفح";
description.textContent = nativeRuntime
  ? "الواجهة تعمل داخل Tauri ويمكنها التواصل مع Rust."
  : "الواجهة تعمل في المتصفح؛ وظائف سطح المكتب الأصلية غير متاحة هنا.";
result.textContent = nativeRuntime
  ? "اضغط على «فحص الاتصال بـ Rust» للتحقق من جسر الأوامر."
  : "تم تحميل الواجهة محليًا. لا يتم استدعاء أوامر Rust في وضع المتصفح.";
detailsButton.textContent = nativeRuntime ? "فحص الاتصال بـ Rust ↙" : "تفاصيل المعاينة ↙";

detailsButton.addEventListener("click", async () => {
  const opening = detailsPanel.hidden;
  detailsPanel.hidden = !opening;
  detailsButton.setAttribute("aria-expanded", String(opening));
  if (!opening || !nativeRuntime) return;

  detailsButton.disabled = true;
  result.textContent = "جارٍ فحص الاتصال بـ Rust…";
  try {
    const info = await invoke<RuntimeInfo>("get_runtime_info");
    result.textContent = `الاتصال ناجح · الإصدار ${info.version} · ${info.platform} / ${info.arch}`;
    app.dataset.nativeChecked = "true";
  } catch {
    result.textContent = "تعذر الاتصال بـ Rust. راجع سجل التطبيق وإعدادات الأوامر.";
    app.dataset.nativeChecked = "false";
  } finally {
    detailsButton.disabled = false;
  }
});

app.dataset.ready = "true";
