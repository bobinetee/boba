import { today, subtractMonths, addMonths, generateMonthCalendarDays, isTheSameDay } from "./date.js";
import { getUrlDate } from "./url.js";

// Находим шаблон для одной ячейки дня в мини-календаре
const calendarDayListItemTemplateElement = document.querySelector("[data-template='mini-calendar-day-list-item']");

// Форматтер для шапки (напр. "January 2026")
const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  month: 'long',
  year: 'numeric'
});

/**
 * Инициализирует все мини-календари на странице (в десктопном и мобильном меню)
 */
export function initMiniCalendars() {
  const calendarElements = document.querySelectorAll("[data-mini-calendar]");

  for (const calendarElement of calendarElements) {
    initMiniCalendar(calendarElement);
  }
}

/**
 * Настройка конкретного экземпляра мини-календаря
 */
function initMiniCalendar(calendarElement) {
  const calendarPreviousButtonElement = calendarElement.querySelector("[data-mini-calendar-previous-button]");
  const calendarNextButtonElement = calendarElement.querySelector("[data-mini-calendar-next-button]");

  // selectedDate — день, который выбран в основном календаре
  // miniCalendarDate — месяц, который сейчас отображается именно в маленьком календаре
  let selectedDate = getUrlDate();
  let miniCalendarDate = getUrlDate();

  // Функция для перерисовки мини-календаря
  function refreshMiniCalendar() {
    refreshDateElement(calendarElement, miniCalendarDate);
    refreshDayListElement(calendarElement, miniCalendarDate, selectedDate);
  }

  // Переключение месяца назад
  calendarPreviousButtonElement.addEventListener("click", () => {
    miniCalendarDate = subtractMonths(miniCalendarDate, 1);
    refreshMiniCalendar();
  });

  // Переключение месяца вперед
  calendarNextButtonElement.addEventListener("click", () => {
    miniCalendarDate = addMonths(miniCalendarDate, 1);
    refreshMiniCalendar();
  });

  // Если дата изменилась в основном календаре, синхронизируем мини-календарь
  document.addEventListener("date-change", (event) => {
    selectedDate = event.detail.date;
    miniCalendarDate = event.detail.date;
    refreshMiniCalendar();
  });

  refreshMiniCalendar();
}

/**
 * Обновляет текст заголовка (Месяц Год)
 */
function refreshDateElement(parent, date) {
  const calendarDateElement = parent.querySelector("[data-mini-calendar-date]");
  calendarDateElement.textContent = dateFormatter.format(date);
}

/**
 * Генерация и отрисовка сетки дней (1, 2, 3...)
 */
function refreshDayListElement(parent, miniCalendarDate, selectedDate) {
  const calendarDayListElement = parent.querySelector("[data-mini-calendar-day-list]");

  // Очищаем старые дни
  calendarDayListElement.replaceChildren();
  
  // Генерируем массив дат для сетки на месяц (из date.js)
  const calendarDays = generateMonthCalendarDays(miniCalendarDate);

  for (const calendarDay of calendarDays) {
    // Клонируем шаблон
    const calendarDayListItemContent = calendarDayListItemTemplateElement.content.cloneNode(true);
    const calendarDayListItemElement = calendarDayListItemContent.querySelector("[data-mini-calendar-day-list-item]");
    const calendarDayElement = calendarDayListItemElement.querySelector("[data-mini-calendar-day]");

    calendarDayElement.textContent = calendarDay.getDate();

    // Стилизация: если день принадлежит другому месяцу (хвосты)
    if (miniCalendarDate.getMonth() !== calendarDay.getMonth()) {
      calendarDayElement.classList.add("mini-calendar__day--other");
    }

    // Стилизация: выделяем выбранный день (синий цвет)
    if (isTheSameDay(selectedDate, calendarDay)) {
      calendarDayElement.classList.add("button--primary");
    } else {
      calendarDayElement.classList.add("button--secondary");
    }

    // Стилизация: выделяем сегодняшний день (рамка/фон)
    if (isTheSameDay(today(), calendarDay)) {
      calendarDayElement.classList.add("mini-calendar__day--highlight");
    }

    // Клик по числу в мини-календаре отправляет глобальное событие "date-change"
    calendarDayElement.addEventListener("click", () => {
      calendarDayElement.dispatchEvent(new CustomEvent("date-change", {
        detail: { date: calendarDay },
        bubbles: true
      }));
    });

    calendarDayListElement.appendChild(calendarDayListItemElement);
  }
}
