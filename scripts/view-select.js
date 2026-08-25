import { getUrlView } from "./url.js";

/**
 * Инициализирует логику переключателя режимов просмотра календаря.
 */
export function initViewSelect() {
  // Находим элемент <select> по атрибуту [data-view-select], который мы видели в HTML
  const viewSelectElement = document.querySelector("[data-view-select]");
  
  // При загрузке страницы устанавливаем значение селекта из URL (например, 'month')
  viewSelectElement.value = getUrlView();

  /**
   * Слушаем ручное изменение значения пользователем в выпадающем списке.
   */
  viewSelectElement.addEventListener("change", (event) => {
    // Когда пользователь выбирает другой режим, отправляем глобальное событие "view-change"
    viewSelectElement.dispatchEvent(new CustomEvent("view-change", {
      detail: {
        view: viewSelectElement.value // Передаем новое значение: 'day', 'week' или 'month'
      },
      bubbles: true // Позволяет событию всплывать для обработки в calendar.js
    }));
  });

  /**
   * Слушаем событие "view-change" из других источников.
   * Например, если приложение само решило сменить вид (как в responsive.js при переходе на мобилку).
   */
  document.addEventListener("view-change", (event) => {
    // Синхронизируем значение в выпадающем списке, чтобы оно соответствовало реальности
    viewSelectElement.value = event.detail.view;
  });
}
