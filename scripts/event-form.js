import { validateEvent, generateEventId } from "./event.js";

/**
 * Инициализирует логику работы полей формы.
 * @param {Object} toaster - Система уведомлений для вывода ошибок валидации.
 */
export function initEventForm(toaster) {
  const formElement = document.querySelector("[data-event-form]");

  // Режим работы: 'create' (новая запись) или 'edit' (обновление существующей)
  let mode = "create";

  // Слушаем отправку формы (нажатие кнопки Save)
  formElement.addEventListener("submit", (event) => {
    event.preventDefault(); // Отменяем перезагрузку страницы

    // 1. Собираем данные из полей формы в один объект
    const formEvent = formIntoEvent(formElement);

    // 2. Проверяем данные (например, чтобы время начала не было позже времени конца)
    const validationError = validateEvent(formEvent);
    if (validationError !== null) {
      toaster.error(validationError); // Если есть ошибка, показываем её пользователю
      return;
    }

    // 3. Если всё в порядке — отправляем событие дальше.
    // КРИТИЧЕСКОЕ МЕСТО: В 2026 году здесь должен быть запрос к PHP через fetch()
    if (mode === "create") {
      formElement.dispatchEvent(new CustomEvent("event-create", {
        detail: { event: formEvent },
        bubbles: true
      }));
    }

    if (mode === "edit") {
      formElement.dispatchEvent(new CustomEvent("event-edit", {
        detail: { event: formEvent },
        bubbles: true
      }));
    }
  });

  return {
    formElement,
    // Метод подготовки формы для создания нового события
    switchToCreateMode(date, startTime, endTime) {
      mode = "create";
      fillFormWithDate(formElement, date, startTime, endTime);
    },
    // Метод подготовки формы для редактирования (заполняем поля данными из БД)
    switchToEditMode(event) {
      mode = "edit";
      fillFormWithEvent(formElement, event);
    },
    // Очистка формы (сброс всех полей и ID)
    reset() {
      formElement.querySelector("#id").value = "";
      formElement.reset();
    }
  };
}
async function loadRooms() {
  const select = formElement.querySelector("#room");
  const res = await fetch("api.php?action=rooms");
  const rooms = await res.json();
  select.innerHTML = '<option value="">Выберите зал...</option>' +
    rooms.map(r => `<option value="${r.id}">${r.name} (${r.capacity} мест)</option>`).join("");
}

/**
 * Заполняет поля даты и времени значениями по умолчанию.
 */
function fillFormWithDate(formElement, date, startTime, endTime) {
  const dateInputElement = formElement.querySelector("#date");
  const startTimeSelectElement = formElement.querySelector("#start-time");
  const endTimeSelectElement = formElement.querySelector("#end-time");

  // Преобразуем дату в формат YYYY-MM-DD, который понимает HTML input type="date"
  dateInputElement.value = date.toISOString().substr(0, 10);
  startTimeSelectElement.value = startTime;
  endTimeSelectElement.value = endTime;
}

/**
 * Заполняет форму данными существующего события для редактирования.
 */
function fillFormWithEvent(formElement, event) {
  const idInputElement = formElement.querySelector("#id");
  const titleInputElement = formElement.querySelector("#title");
  const dateInputElement = formElement.querySelector("#date");
  const startTimeSelectElement = formElement.querySelector("#start-time");
  const endTimeSelectElement = formElement.querySelector("#end-time");
  const colorInputElement = formElement.querySelector(`input[name="color"][value="${event.color}"]`);

  idInputElement.value = event.id; // Передаем ID из базы в скрытое поле
  titleInputElement.value = event.title;
  dateInputElement.value = event.date.toISOString().substr(0, 10);
  startTimeSelectElement.value = event.startTime;
  endTimeSelectElement.value = event.endTime;
  colorInputElement.checked = true; // Выбираем нужный радио-баттон цвета
}

/**
 * СОБИРАЕТ ДАННЫЕ ИЗ HTML-ФОРМЫ В JS-ОБЪЕКТ.
 * Это то, что вы отправите в PHP через POST-запрос.
 */
function formIntoEvent(formElement) {
  const formData = new FormData(formElement);
  const room_id = formData.get("room_id");
// ...
const event = {
  // ...
  room_id: Number.parseInt(room_id, 10),
  // ...
};
  
  // Получаем значения по именам (атрибут 'name' в HTML)
  const id = formData.get("id");
  const title = formData.get("title");
  const date = formData.get("date");
  const startTime = formData.get("start-time");
  const endTime = formData.get("end-time");
  const color = formData.get("color");

  const event = {
    // Если ID есть — используем его, если нет — генерируем временный
    id: id ? Number.parseInt(id, 10) : generateEventId(),
    title,
    date: new Date(date),
    startTime: Number.parseInt(startTime, 10),
    endTime: Number.parseInt(endTime, 10),
    color
  };

  return event;
}
