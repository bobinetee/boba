import { getUrlDate } from "./url.js";

/**
 * Инициализирует все кнопки создания событий на странице.
 * Находит элементы по атрибуту [data-event-create-button].
 */
export function initEventCreateButtons() {
  const buttonElements = document.querySelectorAll("[data-event-create-button]");

  for (const buttonElement of buttonElements) {
    initEventCreateButton(buttonElement);
  }
}

/**
 * Настройка конкретной кнопки.
 * @param {HTMLElement} buttonElement - Элемент кнопки.
 */
function initEventCreateButton(buttonElement) {
  // Получаем текущую дату из URL (чтобы событие создавалось на тот день, который открыт)
  let selectedDate = getUrlDate();

  // При клике на кнопку не открывается окно напрямую, а отправляется "запрос" (событие)
  buttonElement.addEventListener("click", () => {
    // Создаем кастомное событие 'event-create-request'
    buttonElement.dispatchEvent(new CustomEvent("event-create-request", {
      detail: {
        date: selectedDate, // Передаем дату
        startTime: 600,     // Время начала по умолчанию (10:00 AM, так как 600 минут)
        endTime: 960        // Время конца по умолчанию (4:00 PM, так как 960 минут)
      },
      bubbles: true // Позволяет событию "всплывать" вверх по дереву HTML, чтобы его поймал главный скрипт
    }));
  });

  // Если пользователь переключил дату в календаре, обновляем selectedDate для новой кнопки
  document.addEventListener("date-change", (event) => {
    selectedDate = event.detail.date;
  });
}
