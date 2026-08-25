import { today, addDays, addMonths, subtractDays, subtractMonths } from "./date.js";
import { getUrlDate, getUrlView } from "./url.js";

// Форматтер для вывода текущего месяца и года в шапке (например, "January 2026")
const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  month: "long",
  year: "numeric"
});

/**
 * Инициализация навигации календаря
 */
export function initNav() {
  // Находим кнопки и текстовое поле даты по атрибутам из HTML
  const todayButtonElements = document.querySelectorAll("[data-nav-today-button]");
  const previousButtonElement = document.querySelector("[data-nav-previous-button]");
  const nextButtonElement = document.querySelector("[data-nav-next-button]");
  const dateElement = document.querySelector("[data-nav-date]");

  // Извлекаем текущий вид (день/неделя/месяц) и дату из URL
  let selectedView = getUrlView();
  let selectedDate = getUrlDate();

  // Настройка кнопок "Today" (их две: для ПК и мобилок)
  for (const todayButtonElement of todayButtonElements) {
    todayButtonElement.addEventListener("click", () => {
      // Отправляем событие изменения даты на "сегодня" (19 января 2026)
      todayButtonElement.dispatchEvent(new CustomEvent("date-change", {
        detail: { date: today() },
        bubbles: true
      }));
    });
  }

  // Клик по стрелке "Назад" (<)
  previousButtonElement.addEventListener("click", () => {
    previousButtonElement.dispatchEvent(new CustomEvent("date-change", {
      detail: {
        // Вычисляем дату в зависимости от того, смотрим мы день, неделю или месяц
        date: getPreviousDate(selectedView, selectedDate)
      },
      bubbles: true
    }));
  });

  // Клик по стрелке "Вперед" (>)
  nextButtonElement.addEventListener("click", () => {
    nextButtonElement.dispatchEvent(new CustomEvent("date-change", {
      detail: {
        date: getNextDate(selectedView, selectedDate)
      },
      bubbles: true
    }));
  });

  // Если пользователь сменил режим (например, с месяца на неделю), запоминаем это
  document.addEventListener("view-change", (event) => {
    selectedView = event.detail.view;
  });

  // Главный обработчик изменения даты
  document.addEventListener("date-change", (event) => {
    selectedDate = event.detail.date;
    // Обновляем текст в шапке (напр. меняем "January" на "February")
    refreshDateElement(dateElement, selectedDate);
  });

  // Устанавливаем дату в шапке при самой первой загрузке страницы
  refreshDateElement(dateElement, selectedDate);
}

/**
 * Обновляет текст даты в навигационной панели
 */
function refreshDateElement(dateElement, selectedDate) {
  dateElement.textContent = dateFormatter.format(selectedDate);
}

/**
 * Логика вычисления предыдущей даты
 */
function getPreviousDate(selectedView, selectedDate) {
  if (selectedView === "day") return subtractDays(selectedDate, 1);
  if (selectedView === "week") return subtractDays(selectedDate, 7);
  return subtractMonths(selectedDate, 1);
}

/**
 * Логика вычисления следующей даты
 */
function getNextDate(selectedView, selectedDate) {
  if (selectedView === "day") return addDays(selectedDate, 1);
  if (selectedView === "week") return addDays(selectedDate, 7);
  return addMonths(selectedDate, 1);
}
