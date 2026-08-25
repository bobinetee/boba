import { initDialog } from "./dialog.js";

/**
 * Инициализирует логику мобильного сайдбара (выездного меню).
 */
export function initMobileSidebar() {
  // Используем общую функцию инициализации диалогов для "mobile-sidebar"
  const dialog = initDialog("mobile-sidebar");

  /**
   * Слушаем запрос на открытие мобильного меню.
   * Этот запрос (событие) отправляет кнопка "гамбургер" из файла hamburger.js.
   */
  document.addEventListener("mobile-sidebar-open-request", () => {
    dialog.open();
  });

  /**
   * Слушаем изменение даты.
   * Если пользователь внутри мобильного меню нажал на какую-то дату в мини-календаре,
   * меню должно автоматически закрыться, чтобы показать основной календарь с новой датой.
   */
  document.addEventListener("date-change", () => {
    dialog.close();
  });
}
