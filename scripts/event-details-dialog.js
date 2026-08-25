import { initDialog } from "./dialog.js";
import { eventTimeToDate } from "./event.js";

// Форматтер для красивого вывода даты (напр., "Sat, January 17, 2026")
const eventDateFormatter = new Intl.DateTimeFormat("ru-RU", {
  weekday: 'short',
  day: 'numeric',
  month: 'long',
  year: 'numeric'
});

// Форматтер для времени (напр., "3:28 PM")
const eventTimeFormatter = new Intl.DateTimeFormat("ru-RU", {
  hour: 'numeric',
  minute: 'numeric'
});

/**
 * Инициализация диалога просмотра деталей события
 */
export function initEventDetailsDialog() {
  // Инициализируем стандартный диалог с именем "event-details"
  const dialog = initDialog("event-details");

  // Кнопки "Удалить" и "Редактировать" внутри этого окна
  const deleteButtonElemenet = dialog.dialogElement.querySelector("[data-event-details-delete-button]");
  const editButtonElement = dialog.dialogElement.querySelector("[data-event-details-edit-button]");

  // Переменная для хранения события, на которое кликнул пользователь
  let currentEvent = null;

  /**
   * Слушаем клик по событию в календаре
   */
  document.addEventListener("event-click", (event) => {
    currentEvent = event.detail.event;
    // Заполняем поля окна данными из MySQL (через объект события)
    fillEventDetailsDialog(dialog.dialogElement, event.detail.event);
    dialog.open();
  });

  /**
   * Логика нажатия на кнопку "Удалить" в окне деталей
   */
  deleteButtonElemenet.addEventListener("click", () => {
    dialog
      .close() // Сначала закрываем текущее окно
      .then(() => {
        // Затем вызываем цепочку удаления (откроется второе окно подтверждения)
        deleteButtonElemenet.dispatchEvent(new CustomEvent("event-delete-request", {
          detail: { event: currentEvent },
          bubbles: true
        }));
      });
  });

  /**
   * Логика нажатия на кнопку "Редактировать"
   */
  editButtonElement.addEventListener("click", () => {
    dialog
      .close() // Закрываем детали
      .then(() => {
        // Вызываем событие редактирования (откроется форма с предзаполненными полями)
        editButtonElement.dispatchEvent(new CustomEvent("event-edit-request", {
          detail: { event: currentEvent },
          bubbles: true
        }));
      });
  });
}

/**
 * Функция наполнения окна данными
 */
function fillEventDetailsDialog(parent, event) {
  const eventDetailsElement = parent.querySelector("[data-event-details]");
  const eventDetailsTitleElement = eventDetailsElement.querySelector("[data-event-details-title]");
  const eventDetailsDateElement = eventDetailsElement.querySelector("[data-event-details-date]");
  const eventDetailsStartTimeElement = eventDetailsElement.querySelector("[data-event-details-start-time]");
  const eventDetailsEndTimeElement = eventDetailsElement.querySelector("[data-event-details-end-time]");

  // Подставляем текст заголовка
  eventDetailsTitleElement.textContent = event.title;
  
  // Форматируем и выставляем дату
  eventDetailsDateElement.textContent = eventDateFormatter.format(event.date);
  
  // Преобразуем минуты (напр. 600) в реальное время и форматируем его
  eventDetailsStartTimeElement.textContent = eventTimeFormatter.format(
    eventTimeToDate(event, event.startTime)
  );
  eventDetailsEndTimeElement.textContent = eventTimeFormatter.format(
    eventTimeToDate(event, event.endTime)
  );

  // Устанавливаем цвет события из базы через CSS-переменную
  eventDetailsElement.style.setProperty("--event-color", event.color);
}
