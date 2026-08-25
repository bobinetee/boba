import { isTheSameDay } from "./date.js";

const API_URL = "api.php";
let eventsCache = [];

export function initEventStore() {
  loadEventsFromDB();

  document.addEventListener("event-create", async (event) => {
    const newEvent = event.detail.event;
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'create', 
          room_id: newEvent.room_id || 1, // По умолчанию 1, если не выбран
          title: newEvent.title,
          date: newEvent.date.toISOString().split('T')[0],
          startTime: newEvent.startTime,
          endTime: newEvent.endTime,
          color: newEvent.color
        })
      });
      const savedEvent = await response.json();
      if (savedEvent.error) throw new Error(savedEvent.error);

      savedEvent.date = new Date(savedEvent.date);
      eventsCache.push(savedEvent);
      document.dispatchEvent(new CustomEvent("events-change", { bubbles: true }));
    } catch (error) {
      console.error("Ошибка создания:", error);
      alert("Не удалось сохранить событие");
    }
  });

  document.addEventListener("event-delete", async (event) => {
    const deletedEvent = event.detail.event;
    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id: deletedEvent.id })
      });
      eventsCache = eventsCache.filter(e => e.id !== deletedEvent.id);
      document.dispatchEvent(new CustomEvent("events-change", { bubbles: true }));
    } catch (error) {
      console.error("Ошибка удаления:", error);
    }
  });

  document.addEventListener("event-edit", async (event) => {
    const editedEvent = event.detail.event;
    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'update', 
          id: editedEvent.id,
          title: editedEvent.title,
          date: editedEvent.date.toISOString().split('T')[0],
          startTime: editedEvent.startTime,
          endTime: editedEvent.endTime,
          color: editedEvent.color
        })
      });
      editedEvent.date = new Date(editedEvent.date);
      eventsCache = eventsCache.map(e => e.id === editedEvent.id ? editedEvent : e);
      document.dispatchEvent(new CustomEvent("events-change", { bubbles: true }));
    } catch (error) {
      console.error("Ошибка обновления:", error);
    }
  });

  return {
    getEventsByDate(date) {
      return eventsCache.filter((event) => isTheSameDay(event.date, date));
    }
  };
}

async function loadEventsFromDB() {
  try {
    const response = await fetch(`${API_URL}?action=bookings`);
    const data = await response.json();
    if (data.error) throw new Error(data.error);

    eventsCache = data.map(event => ({
      ...event,
      id: Number(event.id),
      room_id: Number(event.room_id),
      user_id: Number(event.user_id),
      startTime: Number(event.start_time),
      endTime: Number(event.end_time),
      date: new Date(event.booking_date)
    }));
    
    document.dispatchEvent(new CustomEvent("events-change", { bubbles: true }));
  } catch (error) {
    console.error("Ошибка загрузки из БД:", error);
  }
}