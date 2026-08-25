/**
 * Возвращает объект даты для "сегодняшнего" дня.
 * Время принудительно устанавливается на 12:00 (полдень).
 * Это критически важно, чтобы при расчетах разница в часовых поясах или переход на летнее/зимнее время
 * не привели к случайному перескоку даты на день назад или вперед.
 */
export function today() {
  const now = new Date(); // Текущий момент (например, 20 января 2026)
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
}

/**
 * Добавляет указанное количество месяцев к переданной дате.
 * Встроена защита от "перескока" месяцев.
 * Пример: если к 31 января 2026 года прибавить 1 месяц, мы должны получить 28 февраля, а не 3 марта.
 */
export function addMonths(date, months) {
  // 1. Создаем временную дату на 1-е число целевого месяца
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth() + months, 1, date.getHours());
  
  // 2. Находим последний день этого целевого месяца (через вспомогательную функцию)
  const lastDayOfMonth = getLastDayOfMonthDate(firstDayOfMonth);
  
  // 3. Выбираем число: либо исходное (напр. 31), либо максимально возможное в новом месяце (напр. 28)
  const dayOfMonth = Math.min(date.getDate(), lastDayOfMonth.getDate());

  // 4. Возвращаем итоговую дату
  return new Date(date.getFullYear(), date.getMonth() + months, dayOfMonth, date.getHours());
}

/**
 * Вычитает месяцы из даты.
 * По сути вызывает addMonths с отрицательным значением.
 */
export function subtractMonths(date, months) {
  return addMonths(date, -months);
}

/**
 * Добавляет количество дней к дате.
 * Объект Date в JS сам заботится о смене месяца/года, если сумма дней превышает лимит месяца.
 */
export function addDays(date, days) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days, date.getHours());
}

/**
 * Вычитает дни из даты.
 */
export function subtractDays(date, days) {
  return addDays(date, -days);
}

/**
 * Основная функция генерации сетки календаря на месяц.
 * Возвращает массив дат, который всегда кратен 7 (полные недели).
 * Включает "хвосты" предыдущего и следующего месяцев.
 */
export function generateMonthCalendarDays(currentDate) {
  const calendarDays = [];

  // 1. Берем последний день ПРЕДЫДУЩЕГО месяца (относительно currentDate)
  const lastDayOfPreviousMonthDate = getLastDayOfMonthDate(subtractMonths(currentDate, 1));

  // 2. Определяем день недели этого последнего дня.
  // Используем формулу (day + 6) % 7, чтобы привести к формату ПН=0, ВС=6.
  const lastDayOfPreviousMonthWeekDay = (lastDayOfPreviousMonthDate.getDay() + 6) % 7;

  // 3. Заполняем начало массива днями прошлого месяца (если текущий месяц начинается не с ПН)
  // Если последний день прошлого месяца — это не воскресенье (6), то добавляем эти даты
  if (lastDayOfPreviousMonthWeekDay !== 6) {
    for (let i = lastDayOfPreviousMonthWeekDay; i >= 0; i -= 1) {
      calendarDays.push(subtractDays(lastDayOfPreviousMonthDate, i));
    }
  }

  // 4. Добавляем все числа ТЕКУЩЕГО месяца
  const lastDayOfCurrentMonthDate = getLastDayOfMonthDate(currentDate);
  for (let i = 1; i <= lastDayOfCurrentMonthDate.getDate(); i += 1) {
    // Отсчитываем дни от конца прошлого месяца
    calendarDays.push(addDays(lastDayOfPreviousMonthDate, i));
  }

  // 5. Вычисляем, сколько дней нужно добавить из СЛЕДУЮЩЕГО месяца
  // Округляем общее кол-во дней вверх до кратного 7 (полные строки в календаре)
  const totalWeeks = Math.ceil(calendarDays.length / 7);
  const totalDays = totalWeeks * 7;
  const missingDayAmount = totalDays - calendarDays.length;
  
  for (let i = 1; i <= missingDayAmount; i += 1) {
    // Добавляем дни, начиная от последнего дня текущего месяца
    calendarDays.push(addDays(lastDayOfCurrentMonthDate, i));
  }

  return calendarDays;
}

/**
 * Сравнивает две даты по Году, Месяцу и Числу.
 * Возвращает true, если это один и тот же календарный день, игнорируя время.
 */
export function isTheSameDay(dateA, dateB) {
  return dateA.getFullYear() === dateB.getFullYear() && 
         dateA.getMonth() === dateB.getMonth() && 
         dateA.getDate() === dateB.getDate();
}

/**
 * Возвращает массив из 7 дат текущей недели (ПН-ВС).
 */
export function generateWeekDays(date) {
  const weekDays = [];
  
  const day = date.getDay(); // 0 (Вс) - 6 (Сб)
  
  // Рассчитываем смещение до ближайшего Понедельника
  // Если сегодня Воскресенье (0), отнимаем 6 дней. Иначе отнимаем (день - 1).
  const diffToMonday = day === 0 ? 6 : day - 1;
  
  const firstWeekDay = subtractDays(date, diffToMonday);

  // Собираем массив из 7 дней, начиная с найденного понедельника
  for (let i = 0; i <= 6; i += 1) {
    weekDays.push(addDays(firstWeekDay, i));
  }
  return weekDays;
}

/**
 * Вспомогательная внутренняя функция для получения последней даты месяца.
 * Принцип работы: 
 * Мы создаем дату на 1-й день СЛЕДУЮЩЕГО месяца (month + 1), но ставим число дня 0.
 * В JavaScript число дня 0 автоматически переносит дату на последний день предыдущего месяца.
 */
function getLastDayOfMonthDate(date) {
  // Параметры: год, месяц+1, день: 0 (последний день текущего месяца), часы: 12
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 12);
}

