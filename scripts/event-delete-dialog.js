import { initDialog } from "./dialog.js";

/**
 * Инициализирует логику диалога удаления события.
 */
export function initEventDeleteDialog() {
  // Инициализируем стандартное поведение диалога (открытие/закрытие) для окна "event-delete"
  const dialog = initDialog("event-delete");

  // Находим красную кнопку "Delete" внутри этого окна
  const deleteButtonElement = dialog.dialogElement.querySelector("[data-event-delete-button]");

  // Переменная для хранения данных события, которое мы ХОТИМ удалить
  let currentEvent = null;

  /**
   * Слушаем запрос на удаление. 
   * Это событие обычно прилетает, когда пользователь нажал на иконку корзины в календаре.
   */
  document.addEventListener("event-delete-request", (event) => {
    // Сохраняем данные события (включая его ID из базы данных)
    currentEvent = event.detail.event;
    
    // Подставляем название события в текст вопроса: "Вы действительно хотите удалить [Название]?"
    fillEventDeleteDialog(dialog.dialogElement, event.detail.event);
    
    // Открываем модальное окно
    dialog.open();
  });

  /**
   * Обработчик клика по кнопке подтверждения "Delete"
   */
  deleteButtonElement.addEventListener("click", () => {
    // 1. Сначала плавно закрываем окно
    dialog.close();
    
    // 2. Генерируем событие "event-delete". 
    // Именно его должен поймать ваш главный скрипт, чтобы вызвать PHP-файл 
    // и выполнить SQL-запрос: DELETE FROM events WHERE id = currentEvent.id
    deleteButtonElement.dispatchEvent(new CustomEvent("event-delete", {
      detail: {
        event: currentEvent
      },
      bubbles: true
    }));
  });
}

/**
 * Заполняет текстовые поля в диалоге данными удаляемого события.
 */
function fillEventDeleteDialog(parent, event) {
  const eventDeleteTitleElement = parent.querySelector("[data-event-delete-title]");
  // Вставляем заголовок события в тег <strong>, который мы видели в HTML
  eventDeleteTitleElement.textContent = event.title;
}
