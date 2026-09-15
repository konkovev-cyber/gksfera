/**
 * Единый рубильник движения на сайте.
 *
 * Зачем: по WCAG 2.2.2 любое авто-обновляемое или движущееся содержимое, которое
 * видно дольше 5 секунд, обязано останавливаться по запросу пользователя.
 * Приём G186 прямо разрешает саму кнопку держать в любом месте страницы, лишь
 * бы она была доступная с клавиатуры и не ниже движущегося блока по порядку
 * табуляции. Поэтому контроль живёт в шапке, а фото в герое остаётся чистым:
 * на кадре ни точек, ни паузы — как и просил владелец.
 *
 * Состояние — атрибут data-motion на <html>: его читают и CSS (пауза
 * keyframes-анимаций), и React-компоненты (таймер смены фото). Порядок
 * таков, что применяются всегда один и тот же источник истины.
 */

export const MOTION_EVENT = "sfera-motion";
const STORAGE_KEY = "sfera-motion";

export function isMotionPaused(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.dataset.motion === "paused";
}

export function readMotionPreference(): boolean {
  // true = «анимации остановлены». Сначала явный выбор пользователя, потом
  // системное «уменьшить движение».
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "paused") return true;
    if (saved === "running") return false;
  } catch {}
  return false;
}

export function setMotionPaused(paused: boolean) {
  if (typeof document === "undefined") return;
  if (paused) document.documentElement.dataset.motion = "paused";
  else delete document.documentElement.dataset.motion;
  try {
    localStorage.setItem(STORAGE_KEY, paused ? "paused" : "running");
  } catch {}
  window.dispatchEvent(new CustomEvent(MOTION_EVENT, { detail: { paused } }));
}

/** Подписка на смену состояния: свой таб, другой таб, тот же таб. */
export function subscribeMotion(cb: (paused: boolean) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onEvent = (e: Event) => {
    const detail = (e as CustomEvent<{ paused: boolean }>).detail;
    cb(!!detail?.paused);
  };
  // Открытая в другой вкладке страница тоже меняет рубильник — читаем storage.
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) cb(isMotionPaused());
  };
  window.addEventListener(MOTION_EVENT, onEvent as EventListener);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(MOTION_EVENT, onEvent as EventListener);
    window.removeEventListener("storage", onStorage);
  };
}
