import { validateEvent, generateEventId } from "./event.js";

export function initEventForm(toaster) {
  const formElement = document.querySelector("[data-event-form]");
  let mode = "create";

  formElement.addEventListener("submit", (e) => {
    e.preventDefault();
    
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
      loadRooms();
    },
    switchToEditMode(eventData) {
      mode = "edit";
      fillFormWithEvent(formElement, eventData);
      loadRooms();
    },
    reset() {
      formElement.querySelector("#id").value = "";
      formElement.reset();
    }
  };
}

async function loadRooms() {
  const form = document.querySelector("[data-event-form]");
  const select = form.querySelector("#room");
  if (!select) return;
  
  try {
    const res = await fetch("api.php?action=rooms");
    const rooms = await res.json();
    select.innerHTML = '<option value="">Выберите зал...</option>' +
      rooms.map(r => `<option value="${r.id}">${r.name} (${r.capacity} мест)</option>`).join("");
  } catch (err) {
    console.error("Ошибка загрузки залов", err);
  }
}

function fillFormWithDate(formElement, date, startTime, endTime) {
  formElement.querySelector("#date").value = date.toISOString().substr(0, 10);
  formElement.querySelector("#start-time").value = startTime;
  formElement.querySelector("#end-time").value = endTime;
}

function fillFormWithEvent(formElement, eventData) {
  formElement.querySelector("#id").value = eventData.id;
  formElement.querySelector("#title").value = eventData.title;
  formElement.querySelector("#date").value = eventData.date.toISOString().substr(0, 10);
  formElement.querySelector("#start-time").value = eventData.startTime;
  formElement.querySelector("#end-time").value = eventData.endTime;
  
  const colorInput = formElement.querySelector(`input[name="color"][value="${eventData.color}"]`);
  if (colorInput) colorInput.checked = true;
  
  const roomSelect = formElement.querySelector("#room");
  if (roomSelect && eventData.room_id) roomSelect.value = eventData.room_id;
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

  const event = {
    id: id ? Number.parseInt(id, 10) : generateEventId(),
    title,
    date: new Date(date),
    startTime: Number.parseInt(startTime, 10),
    endTime: Number.parseInt(endTime, 10),
    color,
    room_id: room_id ? Number.parseInt(room_id, 10) : 1
  };

  return event;
}
