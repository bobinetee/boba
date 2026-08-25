// Находим HTML-шаблон для карточки события в index.html
const eventTemplateElement = document.querySelector("[data-template='event']");

// Инструмент для красивого форматирования времени (например, "10:30 AM")
const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  hour: "numeric",
  minute: "numeric"
});

/**
 * Инициализирует статичное отображение события (используется в режиме Месяц).
 */
export function initStaticEvent(parent, event) {
  const eventElement = initEvent(event);

  if (isEventAllDay(event)) {
    eventElement.classList.add("event--filled");
  }

  parent.appendChild(eventElement);
}

/**
 * Инициализирует динамическое отображение события (используется в режиме Неделя/День).
 * Позиционируется с помощью стилей top/left/right/bottom, рассчитанных в week-calendar.js.
 */
export function initDynamicEvent(parent, event, dynamicStyles) {
  const eventElement = initEvent(event);

  eventElement.classList.add("event--filled");
  eventElement.classList.add("event--dynamic");

  // Применяем вычисленные стили для позиционирования
  eventElement.style.top = dynamicStyles.top;
  eventElement.style.left = dynamicStyles.left;
  eventElement.style.bottom = dynamicStyles.bottom;
  eventElement.style.right = dynamicStyles.right;

  eventElement.dataset.eventDynamic = true;

  parent.appendChild(eventElement);
}

/**
 * Вспомогательная функция: создает DOM-элемент события из шаблона и заполняет данными.
 */
function initEvent(event) {
  const eventContent = eventTemplateElement.content.cloneNode(true);
  const eventElement = eventContent.querySelector("[data-event]");
  const eventTitleElement = eventElement.querySelector("[data-event-title]");
  const eventStartTimeElement = eventElement.querySelector("[data-event-start-time]");
  const eventEndTimeElement = eventElement.querySelector("[data-event-end-time]");

  // Преобразуем минуты (из БД) в объекты даты для форматирования
  const startDate = eventTimeToDate(event, event.startTime);
  const endDate = eventTimeToDate(event, event.endTime);

  // Устанавливаем данные из объекта события (цвет, заголовок, время)
  eventElement.style.setProperty("--event-color", event.color);
  eventTitleElement.textContent = event.title;
  eventStartTimeElement.textContent = dateFormatter.format(startDate);
  eventEndTimeElement.textContent = dateFormatter.format(endDate);

  // При клике на событие отправляем запрос на открытие окна деталей
  eventElement.addEventListener("click", () => {
    eventElement.dispatchEvent(new CustomEvent("event-click", {
      detail: { event },
      bubbles: true
    }));
  });

  return eventElement;
}

/**
 * Проверяет, является ли событие "на весь день".
 */
export function isEventAllDay(event) {
  return event.startTime === 0 && event.endTime === 1440; // От 00:00 до 23:59
}

/**
 * Проверяет, начинается ли событие A раньше события B.
 */
export function eventStartsBefore(eventA, eventB) {
  return eventA.startTime < eventB.startTime;
}

/**
 * Проверяет, заканчивается ли событие A раньше события B.
 */
export function eventEndsBefore(eventA, eventB) {
  return eventA.endTime < eventB.endTime;
}

/**
 * Проверяет, пересекаются ли два события по времени.
 */
export function eventCollidesWith(eventA, eventB) {
  const maxStartTime = Math.max(eventA.startTime, eventB.startTime);
  const minEndTime = Math.min(eventA.endTime, eventB.endTime);
  return minEndTime > maxStartTime; // Пересечение есть, если минимальное время конца позже максимального времени начала
}

/**
 * Преобразует минуты от начала дня в объект Date.
 */
export function eventTimeToDate(event, eventTime) {
  return new Date(
    event.date.getFullYear(),
    event.date.getMonth(),
    event.date.getDate(),
    0,      // Часы
    eventTime // Минуты (JS автоматически пересчитает)
  );
}

/**
 * ВАЛИДАЦИЯ: Проверка корректности данных перед сохранением в БД.
 */
export function validateEvent(event) {
  if (event.startTime >= event.endTime) {
    return "Event end time must be after start time";
  }
  return null;
}

/**
 * Динамически подстраивает количество строк заголовка под высоту карточки события.
 */
export function adjustDynamicEventMaxLines(dynamicEventElement) {
  const availableHeight = dynamicEventElement.offsetHeight;
  const lineHeight = 16;
  const padding = 8;
  const maxTitleLines = Math.floor((availableHeight - lineHeight - padding) / lineHeight);

  dynamicEventElement.style.setProperty("--event-title-max-lines", maxTitleLines);
}

/**
 * Генерирует временный ID для нового события (используя timestamp).
 */
export function generateEventId() {
  return Date.now();
}
