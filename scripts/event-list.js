import { initStaticEvent } from "./event.js";

// Находим HTML-шаблон для элемента списка событий (мы видели его в HTML-файле)
const eventListItemTemplateElement = document.querySelector("[data-template='event-list-item']");

/**
 * Функция для создания и отображения списка событий в конкретном контейнере (например, в ячейке дня).
 * @param {HTMLElement} parent - Родительский элемент (ячейка дня), где находится список <ul>.
 * @param {Array} events - Массив объектов событий, загруженных из базы данных.
 */
export function initEventList(parent, events) {
  // Находим внутри родителя сам список <ul data-event-list>
  const eventListElement = parent.querySelector("[data-event-list]");

  // Останавливаем всплытие клика. 
  // Это нужно, чтобы при клике на само событие не срабатывал клик по ячейке дня под ним.
  eventListElement.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  // Перебираем каждое событие из массива
  for (const event of events) {
    // 1. Клонируем содержимое шаблона <template>
    const eventListItemContent = eventListItemTemplateElement.content.cloneNode(true);
    const eventListItemElement = eventListItemContent.querySelector("[data-event-list-item]");

    // 2. Инициализируем "статичное" событие. 
    // Эта функция наполнит созданный элемент текстом, временем и цветом из БД.
    initStaticEvent(eventListItemElement, event);

    // 3. Добавляем готовое событие в список на странице
    eventListElement.appendChild(eventListItemElement);
  }
}
