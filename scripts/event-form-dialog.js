import { initDialog } from "./dialog.js";
import { initEventForm } from "./event-form.js";
import { initToaster } from "./toaster.js";

/**
 * Инициализирует логику диалогового окна с формой события.
 */
export function initEventFormDialog() {
  // Инициализируем само модальное окно "event-form"
  const dialog = initDialog("event-form");
  
  // Инициализируем систему всплывающих уведомлений (toaster) внутри этого окна
  // (нужно для вывода ошибок, например, если PHP вернет ошибку записи в БД)
  const toaster = initToaster(dialog.dialogElement);
  
  // Инициализируем логику полей формы
  const eventForm = initEventForm(toaster);

  // Находим заголовок окна (чтобы менять его на "Create" или "Edit")
  const dialogTitleElement = dialog.dialogElement.querySelector("[data-dialog-title]");

  /**
   * Слушаем запрос на СОЗДАНИЕ события (срабатывает при клике на "+" или кнопку в сайдбаре)
   */
  document.addEventListener("event-create-request", (event) => {
    dialogTitleElement.textContent = "Create event";
    
    // Переключаем форму в режим создания, подставляя дату и время по умолчанию
    eventForm.switchToCreateMode(
      event.detail.date,
      event.detail.startTime,
      event.detail.endTime
    );
    dialog.open();
  });

  /**
   * Слушаем запрос на РЕДАКТИРОВАНИЕ (срабатывает, если нажали "Edit" в просмотре деталей)
   */
  document.addEventListener("event-edit-request", (event) => {
    dialogTitleElement.textContent = "Edit event";
    
    // Переключаем форму в режим редактирования, заполняя её данными из MySQL
    eventForm.switchToEditMode(event.detail.event);
    dialog.open();
  });

  // Когда окно закрывается (любым способом), полностью очищаем форму
  dialog.dialogElement.addEventListener("close", () => {
    eventForm.reset();
  });

  // Если форма сообщила, что событие успешно СОЗДАНО (PHP вернул успех) — закрываем окно
  eventForm.formElement.addEventListener("event-create", () => {
    dialog.close();
  });

  // Если форма сообщила, что событие успешно ОТРЕДАКТИРОВАНО — закрываем окно
  eventForm.formElement.addEventListener("event-edit", () => {
    dialog.close();
  });
}
