// Импорт функций для отрисовки разных видов календаря
import { initMonthCalendar } from "./month-calendar.js";
import { initWeekCalendar } from "./week-calendar.js";
// Импорт утилит для определения типа устройства (мобилка/пк) и работы с URL
import { currentDeviceType } from "./responsive.js";
import { getUrlDate, getUrlView } from "./url.js";

/**
 * Инициализация основного календаря
 * @param {Object} eventStore - Хранилище событий (в 2026 году здесь будут данные из MySQL)
 */
export function initCalendar(eventStore) {
  // Находим контейнер <div class="calendar" data-calendar>, который мы видели в HTML
  const calendarElement = document.querySelector("[data-calendar]");

  // Извлекаем начальные настройки из адресной строки (например, ?view=month&date=2026-01-17)
  let selectedView = getUrlView();
  let selectedDate = getUrlDate();
  let deviceType = currentDeviceType();

  /**
   * Функция полной перерисовки календаря
   */
function refreshCalendar() {
    const calendarScrollableElement = calendarElement.querySelector("[data-calendar-scrollable]");
    const scrollTop = calendarScrollableElement === null ? 0 : calendarScrollableElement.scrollTop;

    calendarElement.replaceChildren();

    if (selectedView === "month") {
      initMonthCalendar(calendarElement, selectedDate, eventStore);
    } else if (selectedView === "week") {
      initWeekCalendar(calendarElement, selectedDate, eventStore, false, deviceType);
    } else {
      initWeekCalendar(calendarElement, selectedDate, eventStore, true, deviceType);
    }

    // ✅ Безопасный вариант с проверкой
    const scrollableElement = calendarElement.querySelector("[data-calendar-scrollable]");
    if (scrollableElement) {
      scrollableElement.scrollTo({ top: scrollTop });
    }
}

  // --- ПОДПИСКИ НА СОБЫТИЯ (Events) ---

  // Слушаем изменение режима (День/Неделя/Месяц) из выпадающего списка
  document.addEventListener("view-change", (event) => {
    selectedView = event.detail.view;
    refreshCalendar();
  });

  // Слушаем изменение даты (переключение стрелками "Вперед/Назад")
  document.addEventListener("date-change", (event) => {
    selectedDate = event.detail.date;
    refreshCalendar();
  });

  // Слушаем изменение размера экрана (например, поворот телефона)
  document.addEventListener("device-type-change", (event) => {
    deviceType = event.detail.deviceType;
    refreshCalendar();
  });

  // КРИТИЧЕСКИ ВАЖНО ДЛЯ БД: Перерисовываем календарь, если события были добавлены, удалены или изменены
  document.addEventListener("events-change", () => {
    refreshCalendar();
  });

  // Самый первый запуск календаря при загрузке страницы
  refreshCalendar();
}
