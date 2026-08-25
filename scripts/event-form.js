import { validateEvent, generateEventId } from "./event.js";

export function initEventForm(toaster) {
  const formElement = document.querySelector("[data-event-form]");
  let mode = "create";

  formElement.addEventListener("submit", (event) => {
    event.preventDefault();
    
    const formEvent = formIntoEvent(formElement);
    const validationError = validateEvent(formEvent);
    
    if (validationError !== null) {
      toaster.error(validationError);
      return;
    }

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
    switchToCreateMode(date, startTime, endTime) {
      mode = "create";
      fillFormWithDate(formElement, date, startTime, endTime);
      loadRooms(); // Загружаем список залов
    },
    switchToEditMode(eventData) {
      mode = "edit";
      fillFormWithEvent(formElement, eventData);
      loadRooms(); // Загружаем список залов
    },
    reset() {
      formElement.querySelector("#id").value = "";
      formElement.reset();
    }
  };
}

async function loadRooms() {
  const formElement = document.querySelector("[data-event-form]");
  const select = formElement.querySelector("#room");
  if (!select) return;
  
  try {
    const res = await fetch("api.php?action=rooms");
    const rooms = await res.json();
    select.innerHTML = '<option value="">Выберите зал...</option>' +
      rooms.map(r => `<option value="${r.id}">${r.name} (${r.capacity} мест)</option>`).join("");
  } catch (e) {
    console.error("Ошибка загрузки залов", e);
  }
}

function fillFormWithDate(formElement, date, startTime, endTime) {
  const dateInputElement = formElement.querySelector("#date");
  const startTimeSelectElement = formElement.querySelector("#start-time");
  const endTimeSelectElement = formElement.querySelector("#end-time");

  dateInputElement.value = date.toISOString().substr(0, 10);
  startTimeSelectElement.value = startTime;
  endTimeSelectElement.value = endTime;
}

function fillFormWithEvent(formElement, eventData) {
  const idInputElement = formElement.querySelector("#id");
  const titleInputElement = formElement.querySelector("#title");
  const dateInputElement = formElement.querySelector("#date");
  const startTimeSelectElement = formElement.querySelector("#start-time");
  const endTimeSelectElement = formElement.querySelector("#end-time");
  const colorInputElement = formElement.querySelector(`input[name="color"][value="${eventData.color}"]`);
  const roomSelectElement = formElement.querySelector("#room");

  idInputElement.value = eventData.id;
  titleInputElement.value = eventData.title;
  dateInputElement.value = eventData.date.toISOString().substr(0, 10);
  startTimeSelectElement.value = eventData.startTime;
  endTimeSelectElement.value = eventData.endTime;
  if (colorInputElement) colorInputElement.checked = true;
  if (roomSelectElement && eventData.room_id) roomSelectElement.value = eventData.room_id;
}

function formIntoEvent(formElement) {
  const formData = new FormData(formElement);
  
  const id = formData.get("id");
  const title = formData.get("title");
  const date = formData.get("date");
  const startTime = formData.get("start-time");
  const endTime = formData.get("end-time");
  const color = formData.get("color");
  const room_id = formData.get("room_id");

  // ✅ ИСПРАВЛЕНО: переменная event объявляется только ОДИН раз
  const event = {
    id: id ? Number.parseInt(id, 10) : generateEventId(),
    title,
    date: new Date(date),
    startTime: Number.parseInt(startTime, 10),
    endTime: Number.parseInt(endTime, 10),
    color,
    room_id: room_id ? Number.parseInt(room_id, 10) : 1 // По умолчанию зал №1
  };

  return event;
}
