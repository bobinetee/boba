import { generateMonthCalendarDays, today, isTheSameDay } from "./date.js";
import { isEventAllDay, eventStartsBefore } from "./event.js";
import { initEventList } from "./event-list.js";

// Подключаем шаблоны сетки месяца и отдельной ячейки дня
const calendarTemplateElemenent = document.querySelector("[data-template='month-calendar']");
const calendarDayTemplateElement = document.querySelector("[data-template='month-calendar-day']");

// Классы для CSS, чтобы сетка подстраивалась под количество недель (4, 5 или 6)
const calendarWeekClasses = {
  4: "four-week",
  5: "five-week",
  6: "six-week"
};

/**
 * Инициализация вида "Месяц"
 * @param {HTMLElement} parent - Контейнер <div class="calendar">
 * @param {Date} selectedDate - Выбранная дата (месяц)
 * @param {Object} eventStore - Хранилище, откуда мы берем данные (MySQL/LocalStorage)
 */
export function initMonthCalendar(parent, selectedDate, eventStore) {
  const calendarContent = calendarTemplateElemenent.content.cloneNode(true);
  const calendarElement = calendarContent.querySelector("[data-month-calendar]");
  const calendarDayListElement = calendarElement.querySelector("[data-month-calendar-day-list]");

  // 1. Генерируем массив всех дат, которые попадут в сетку месяца
  const calendarDays = generateMonthCalendarDays(selectedDate);
  const calendarWeeks = calendarDays.length / 7;

  // 2. Устанавливаем высоту сетки в зависимости от кол-ва недель
  const calendarWeekClass = calendarWeekClasses[calendarWeeks];
  calendarElement.classList.add(calendarWeekClass);

  // 3. Для каждого дня в сетке создаем ячейку
  for (const calendarDay of calendarDays) {
    // ВАЖНО: Запрашиваем из EventStore события именно для этого дня (из БД)
    const events = eventStore.getEventsByDate(calendarDay);
    
    // Сортируем события: сначала "весь день", потом по времени начала
    sortCalendarDayEvents(events);

    // Отрисовываем ячейку дня со списком событий
    initCalendarDay(calendarDayListElement, calendarDay, events);
  }

  parent.appendChild(calendarElement);
}

/**
 * Инициализация конкретной ячейки дня в сетке
 */
function initCalendarDay(parent, calendarDay, events) {
  const calendarDayContent = calendarDayTemplateElement.content.cloneNode(true);
  const calendarDayElemenent = calendarDayContent.querySelector("[data-month-calendar-day]");
  const calendarDayLabelElemenent = calendarDayContent.querySelector("[data-month-calendar-day-label]");
  const calendarEventListWrapper = calendarDayElemenent.querySelector("[data-month-calendar-event-list-wrapper]");

  // Подсветка "Сегодня" (Актуально на 19 января 2026)
  if (isTheSameDay(today(), calendarDay)) {
    calendarDayElemenent.classList.add("month-calendar__day--highlight");
  }

  // Устанавливаем число месяца (1, 2, 3...)
  calendarDayLabelElemenent.textContent = calendarDay.getDate();

  // При клике на число — переключаемся на вид "День"
  calendarDayLabelElemenent.addEventListener("click", () => {
    document.dispatchEvent(new CustomEvent("date-change", {
      detail: { date: calendarDay },
      bubbles: true
    }));

    document.dispatchEvent(new CustomEvent("view-change", {
      detail: { view: 'day' },
      bubbles: true
    }));
  });

  // При клике на пустое место в ячейке — открываем форму создания нового события
  calendarEventListWrapper.addEventListener("click", () => {
    document.dispatchEvent(new CustomEvent("event-create-request", {
      detail: {
        date: calendarDay,
        startTime: 600, // По умолчанию 10:00 AM
        endTime: 960    // По умолчанию 4:00 PM
      },
      bubbles: true
    }));
  });

  // Вставляем список событий в ячейку
  initEventList(calendarDayElemenent, events);

  parent.appendChild(calendarDayElemenent);
}

/**
 * Логика сортировки событий в ячейке
 */
function sortCalendarDayEvents(events) {
  events.sort((eventA, eventB) => {
    // События на весь день всегда вверху
    if (isEventAllDay(eventA)) return -1;
    if (isEventAllDay(eventB)) return 1;

    // Остальные — по времени начала
    return eventStartsBefore(eventA, eventB) ? -1 : 1;
  });
}
