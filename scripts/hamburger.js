/**
 * Инициализирует кнопку мобильного меню.
 */
export function initHamburger() {
  // Находим кнопку с тремя полосками по атрибуту [data-hamburger-button]
  const hamburgetButtonElement = document.querySelector("[data-hamburger-button]");

  // Слушаем клик по этой кнопке
  hamburgetButtonElement.addEventListener("click", () => {
    
    // Вместо того чтобы открывать меню напрямую, кнопка отправляет "сигнал" (CustomEvent).
    // Этот сигнал поймает другой скрипт (mobile-sidebar.js), который и покажет окно.
    hamburgetButtonElement.dispatchEvent(new CustomEvent("mobile-sidebar-open-request", {
      bubbles: true // Позволяет событию подняться вверх по иерархии DOM
    }));
  });
}
