import { generateWeekDays, isTheSameDay, today } from "./date.js";
import { isEventAllDay, eventStartsBefore, eventEndsBefore, initDynamicEvent, eventCollidesWith, adjustDynamicEventMaxLines } from "./event.js";
import { initEventList } from "./event-list.js";

// Подключаем шаблоны: сетка недели, заголовки дней, список событий "весь день" и колонки времени
const calendarTemplateElement = document.querySelector("[data-template='week-calendar']");
const calendarDayOfWeekTemplateElement = document.querySelector("[data-template='week-calendar-day-of-week']");
const calendarAllDayListItemTemplateElement = document.querySelector("[data-template='week-calendar-all-day-list-item']");
const calendarColumnTemplateElement = document.querySelector("[data-template='week-calendar-column']");

const dateFormatter = new Intl.DateTimeFormat("ru-RU", { weekday: 'short' });

/**
 * Инициализация вида "Неделя" или "День"
 * @param {HTMLElement} parent - Основной контейнер календаря
 * @param {Date} selectedDate - Выбранная дата
 * @param {Object} eventStore - Хранилище (откуда берем данные из MySQL)
 * @param {boolean} isSingleDay - Флаг: рисовать один день или всю неделю
 * @param {string} deviceType - Тип устройства (mobile/desktop)
 */
export function initWeekCalendar(parent, selectedDate, eventStore, isSingleDay, deviceType) {
  const calendarContent = calendarTemplateElement.content.cloneNode(true);
  const calendarElement = calendarContent.querySelector("[data-week-calendar]");
  const calendarDayOfWeekListElement = calendarElement.querySelector("[data-week-calendar-day-of-week-list]");
  const calendarAllDayListElement = calendarElement.querySelector("[data-week-calendar-all-day-list]");
  const calendarColumnsElement = calendarElement.querySelector("[data-week-calendar-columns]");

  // Генерируем массив дней: либо один выбранный, либо вся неделя (7 дней)
  const weekDays = isSingleDay ? [selectedDate] : generateWeekDays(selectedDate);

  for (const weekDay of weekDays) {
    // Получаем события из базы данных для конкретного дня
    const events = eventStore.getEventsByDate(weekDay);
    
    // Разделяем их на те, что идут весь день, и обычные (по времени)
    const allDayEvents = events.filter((event) => isEventAllDay(event));
    const nonAllDayEvents = events.filter((event) => !isEventAllDay(event));

    // Сортируем временные события для правильного наложения
    sortEventsByTime(nonAllDayEvents);

    // Отрисовываем заголовок дня (Пн, Вт...)
    initDayOfWeek(calendarDayOfWeekListElement, selectedDate, weekDay, deviceType);

    // Логика отображения: на десктопе рисуем всё, на мобилке — только события выбранного дня
    if (deviceType === "desktop" || (deviceType === "mobile" && isTheSameDay(weekDay, selectedDate))) {
      initAllDayListItem(calendarAllDayListElement, allDayEvents); // Верхняя плашка "Весь день"
      initColumn(calendarColumnsElement, weekDay, nonAllDayEvents); // Колонка с часами
    }
  }

  // Если это режим одного дня — добавляем спец. класс для стилей
  if (isSingleDay) {
    calendarElement.classList.add("week-calendar--day");
  }

  parent.appendChild(calendarElement);

  // После отрисовки корректируем количество строк в названиях событий (чтобы текст не вылезал)
  const dynamicEventElements = calendarElement.querySelectorAll("[data-event-dynamic]");
  for (const dynamicEventElement of dynamicEventElements) {
    adjustDynamicEventMaxLines(dynamicEventElement);
  }
}

/**
 * Инициализация заголовка дня (кнопка с числом и днем недели)
 */
function initDayOfWeek(parent, selectedDate, weekDay, deviceType) {
  const calendarDayOfWeekContent = calendarDayOfWeekTemplateElement.content.cloneNode(true);
  const calendarDayOfWeekElement = calendarDayOfWeekContent.querySelector("[data-week-calendar-day-of-week]");
  const calendarDayOfWeekButtonElement = calendarDayOfWeekElement.querySelector("[data-week-calendar-day-of-week-button]");
  const calendarDayOfWeekDayElement = calendarDayOfWeekElement.querySelector("[data-week-calendar-day-of-week-day]");
  const calendarDayOfWeekNumberElement = calendarDayOfWeekElement.querySelector("[data-week-calendar-day-of-week-number]");

  calendarDayOfWeekNumberElement.textContent = weekDay.getDate();
  calendarDayOfWeekDayElement.textContent = dateFormatter.format(weekDay);

  // Подсветка текущего дня (Сегодня: 19 января 2026)
  if (isTheSameDay(weekDay, today())) {
    calendarDayOfWeekButtonElement.classList.add("week-calendar__day-of-week-button--highlight");
  }

  // Подсветка выбранного дня
  if (isTheSameDay(weekDay, selectedDate)) {
    calendarDayOfWeekButtonElement.classList.add("week-calendar__day-of-week-button--selected");
  }

  // Переключение даты при клике на заголовок
  calendarDayOfWeekButtonElement.addEventListener("click", () => {
    document.dispatchEvent(new CustomEvent("date-change", {
      detail: { date: weekDay },
      bubbles: true
    }));

    // На десктопе переключаемся в режим "День"
    if (deviceType !== "mobile") {
      document.dispatchEvent(new CustomEvent("view-change", {
        detail: { view: "day" },
        bubbles: true
      }));
    }
  });

  parent.appendChild(calendarDayOfWeekElement);
}

/**
 * Отрисовка списка событий "Весь день" (верхняя часть)
 */
function initAllDayListItem(parent, events) {
  const calendarAllDayListItemContent = calendarAllDayListItemTemplateElement.content.cloneNode(true);
  const calendarAllDayListItemElement = calendarAllDayListItemContent.querySelector("[data-week-calendar-all-day-list-item]");

  initEventList(calendarAllDayListItemElement, events);
  parent.appendChild(calendarAllDayListItemElement);
}

/**
 * Отрисовка колонки времени (вертикальная сетка)
 */
function initColumn(parent, weekDay, events) {
  const calendarColumnContent = calendarColumnTemplateElement.content.cloneNode(true);
  const calendarColumnElement = calendarColumnContent.querySelector("[data-week-calendar-column]");
  
  // Здесь в продолжении кода (которого нет в вашем сообщении) 
  // обычно идет расчет стилей (top, height) для каждого события
  // Находим все ячейки (часы) внутри колонки дня
  const calendarColumnCellElements = calendarColumnElement.querySelectorAll("[data-week-calendar-cell]");

  // 1. ВЫЧИСЛЯЕМ ПОЗИЦИИ: вызываем функцию расчёта координат для событий
  const eventsWithDynamicStyles = calculateEventsDynamicStyles(events);
  
  for (const eventWithDynamicStyles of eventsWithDynamicStyles) {
    // Отрисовываем каждое событие с вычисленными отступами (top, left, bottom, right)
    initDynamicEvent(
      calendarColumnElement,
      eventWithDynamicStyles.event,
      eventWithDynamicStyles.styles
    );
  }

  // 2. ОБРАБОТКА КЛИКОВ ПО СЕТКЕ:
  for (const calendarColumnCellElement of calendarColumnCellElements) {
    // Извлекаем время начала ячейки из атрибута data-week-calendar-cell (напр. "600" для 10:00 AM)
    const cellStartTime = Number.parseInt(
      calendarColumnCellElement.dataset.weekCalendarCell,
      10
    );
    const cellEndTime = cellStartTime + 60; // Конец ячейки через час

    // При клике на пустую ячейку времени — предлагаем создать новое событие именно в этот час
    calendarColumnCellElement.addEventListener("click", () => {
      document.dispatchEvent(new CustomEvent("event-create-request", {
        detail: {
          date: weekDay,
          startTime: cellStartTime,
          endTime: cellEndTime
        },
        bubbles: true
      }));
    });
  }

  parent.appendChild(calendarColumnElement);
}

/**
 * ГЛАВНАЯ ФУНКЦИЯ РАСЧЕТА СТИЛЕЙ:
 * Превращает время в минутах (из базы данных) в проценты (%) для CSS.
 */
function calculateEventsDynamicStyles(events) {
  // Группируем события, которые накладываются друг на друга по времени
  const { eventGroups, totalColumns } = groupEvents(events);
  const columnWidth = 100 / totalColumns; // Ширина одного события, если их несколько в ряд
  const initialEventGroupItems = [];

  for (const eventGroup of eventGroups) {
    for (const eventGroupItem of eventGroup) {
      if (eventGroupItem.isInitial) {
        initialEventGroupItems.push(eventGroupItem);
      }
    }
  }

  return initialEventGroupItems.map((eventGroupItem) => {
    // ВАЖНО ДЛЯ БД: Здесь минуты из MySQL превращаются в координаты на экране
    // 1440 — это количество минут в сутках
    const topPercentage = 100 * (eventGroupItem.event.startTime / 1440);
    const bottomPercentage = 100 - 100 * (eventGroupItem.event.endTime / 1440);
    
    // Расчет положения по горизонтали (если события пересекаются)
    const leftPercentage = columnWidth * eventGroupItem.columnIndex;
    const rightPercentage = columnWidth * (totalColumns - eventGroupItem.columnIndex - eventGroupItem.columnSpan);

    return {
      event: eventGroupItem.event,
      styles: {
        top: `${topPercentage}%`,
        bottom: `${bottomPercentage}%`,
        left: `${leftPercentage}%`,
        right: `${rightPercentage}%`
      }
    }
  });
}

/**
 * ГРУППИРОВКА ПЕРЕСЕКАЮЩИХСЯ СОБЫТИЙ:
 * Позволяет событиям в 2026 году отображаться «лесенкой», если они идут в одно время.
 */
function groupEvents(events) {
  if (events.length === 0) {
    return { eventGroups: [], totalColumns: 0 };
  }

  // Создаем первую группу и помещаем туда первое событие
  const firstEventGroup = [
    {
      event: events[0],
      columnIndex: 0,
      isInitial: true,
      eventIndex: 0
    }
  ];

  const eventGroups = [firstEventGroup];

  for (let i = 1; i < events.length; i += 1) {
    const lastEventGroup = eventGroups[eventGroups.length - 1];
    const loopEvent = events[i];

    // Проверяем: пересекается ли текущее событие с кем-то из прошлой группы
    const lastEventGroupCollidingItems = lastEventGroup.filter((eventGroupItem) => 
      eventCollidesWith(eventGroupItem.event, loopEvent)
    );

    // Если не пересекается — создаем новую группу (событие пойдет во всю ширину)
    if (lastEventGroupCollidingItems.length === 0) {
      const newEventGroupItem = {
        event: loopEvent,
        columnIndex: 0,
        isInitial: true,
        eventIndex: i
      };

      const newEventGroup = [newEventGroupItem];
      eventGroups.push(newEventGroup);
      continue;
    }

    // Если пересекается со всеми — сдвигаем его в новую колонку в рамках той же группы
    if (lastEventGroupCollidingItems.length === lastEventGroup.length) {
      const newEventGroupItem = {
        event: loopEvent,
        columnIndex: lastEventGroup.length,
        isInitial: true,
        eventIndex: i
      };

      lastEventGroup.push(newEventGroupItem);
      continue;
    }
    // ... логика продолжается ...
    // 1. Поиск свободной колонки (горизонтальное смещение)
    let newColumnIndex = 0;
    while (true) {
      // Проверяем, занят ли текущий индекс колонки (0, 1, 2...) другим пересекающимся событием
      const isColumnIndexInUse = lastEventGroupCollidingItems.some((eventGroupItem) => eventGroupItem.columnIndex === newColumnIndex);

      if (isColumnIndexInUse) {
        newColumnIndex += 1; // Если занято, пробуем следующую колонку
      } else {
        break; // Нашли свободное место
      }
    }

    // Создаем новый объект элемента группы событий
    const newEventGroupItem = {
      event: loopEvent,
      columnIndex: newColumnIndex,
      isInitial: true,
      eventIndex: i
    };

    // Формируем новую группу событий для расчета
    const newEventGroup = [
      ...lastEventGroupCollidingItems.map((eventGroupItem) => ({
        ...eventGroupItem,
        isInitial: false // Помечаем как "не начальный", чтобы избежать дубликатов при отрисовке
      })),
      newEventGroupItem
    ];

    eventGroups.push(newEventGroup);
  }

  // 2. Расчет общего количества необходимых колонок
  let totalColumns = 0;
  for (const eventGroup of eventGroups) {
    for (const eventGroupItem of eventGroup) {
      // Ищем максимальный индекс колонки среди всех групп
      totalColumns = Math.max(totalColumns, eventGroupItem.columnIndex + 1);
    }
  }

  // 3. Расчет ширины (columnSpan) для каждого события
  for (const eventGroup of eventGroups) {
    // Сортируем элементы группы по их позиции слева направо
    eventGroup.sort((columnGroupItemA, columnGroupItemB) => {
      return columnGroupItemA.columnIndex < columnGroupItemB.columnIndex ? -1 : 1;
    });

    for (let i = 0; i < eventGroup.length; i += 1) {
      const loopEventGroupItem = eventGroup[i];
      if (i === eventGroup.length - 1) {
        // Если событие последнее в ряду — оно растягивается до правого края
        loopEventGroupItem.columnSpan = totalColumns - loopEventGroupItem.columnIndex;
      } else {
        // Иначе — растягивается только до начала следующего события
        const nextLoopEventGroupItem = eventGroup[i + 1];
        loopEventGroupItem.columnSpan = nextLoopEventGroupItem.columnIndex - loopEventGroupItem.columnIndex;
      }
    }
  }

  // 4. Финальная корректировка ширины (чтобы одно событие имело одинаковую ширину во всех группах)
  for (let i = 0; i < events.length; i += 1) {
    let lowestColumnSpan = Infinity;

    // Находим минимально возможную ширину для этого события среди всех пересечений
    for (const eventGroup of eventGroups) {
      for (const eventGroupItem of eventGroup) {
        if (eventGroupItem.eventIndex === i) {
          lowestColumnSpan = Math.min(lowestColumnSpan, eventGroupItem.columnSpan);
        }
      }
    }

    // Применяем эту ширину ко всем вхождениям события
    for (const eventGroup of eventGroups) {
      for (const eventGroupItem of eventGroup) {
        if (eventGroupItem.eventIndex === i) {
          eventGroupItem.columnSpan = lowestColumnSpan;
        }
      }
    }
  }

  return { eventGroups, totalColumns };
}

/**
 * Сортировка событий по времени (используется перед расчетом позиций)
 */
function sortEventsByTime(events) {
  events.sort((eventA, eventB) => {
    // Сначала те, что начинаются раньше
    if (eventStartsBefore(eventA, eventB)) return -1;
    if (eventStartsBefore(eventB, eventA)) return 1;

    // Если начинаются одновременно — те, что длиннее (заканчиваются позже), идут первыми
    return eventEndsBefore(eventA, eventB) ? 1 : -1;
  });
}
