import { today } from "./date.js";

/**
 * Инициализирует отслеживание изменений и обновление URL.
 */
export function initUrl() {
  // 1. Получаем текущие значения из адресной строки при загрузке
  let selectedView = getUrlView();
  let selectedDate = getUrlDate();

  /**
   * Обновляет параметры в адресной строке без перезагрузки страницы.
   */
  function updateUrl() {
    const url = new URL(window.location);

    // Записываем вид (month/week/day) и дату в формате ISO (например, 2026-01-19...)
    url.searchParams.set("view", selectedView);
    url.searchParams.set("date", selectedDate.toISOString());

    // history.replaceState обновляет URL в браузере, не добавляя новую запись в историю переходов
    history.replaceState(null, "", url);
  }

  // Слушаем событие смены режима (Месяц/Неделя) и обновляем URL
  document.addEventListener("view-change", (event) => {
    selectedView = event.detail.view;
    updateUrl();
  });

  // Слушаем событие смены даты (перелистывание календаря) и обновляем URL
  document.addEventListener("date-change", (event) => {
    selectedDate = event.detail.date;
    updateUrl();
  });
}

/**
 * Извлекает режим просмотра из URL.
 * @returns {string} 'month' (по умолчанию), 'week' или 'day'.
 */
export function getUrlView() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("view") || "month";
}

/**
 * Извлекает дату из URL.
 * @returns {Date} Объект даты из URL или сегодняшний день (19 января 2026), если в URL пусто.
 */
export function getUrlDate() {
  const urlParams = new URLSearchParams(window.location.search);
  const date = urlParams.get("date");

  return date ? new Date(date) : today();
}
