import { initToaster } from "./toaster.js";

/**
 * Инициализирует глобальную систему уведомлений приложения.
 */
export function initNotifications() {
  // Создаем экземпляр "тостера" (объекта для показа уведомлений), 
  // привязывая его к корню документа (document.body).
  const toaster = initToaster(document.body);

  /**
   * Слушаем событие успешного создания.
   * В 2026 году оно сработает после того, как PHP вернет ответ: "Запись в MySQL добавлена".
   */
  document.addEventListener("event-create", () => {
    toaster.success("Мероприятие успешно создано!");
  });

  /**
   * Слушаем событие успешного удаления.
   * Сработает после того, как в MySQL выполнится команда DELETE.
   */
  document.addEventListener("event-delete", () => {
    toaster.success("Мероприятие успешно удалено!");
  });

  /**
   * Слушаем событие успешного редактирования.
   * Сработает после завершения SQL-запроса UPDATE.
   */
  document.addEventListener("event-edit", () => {
    toaster.success("Мероприятие успешно измененно!");
  });
}
