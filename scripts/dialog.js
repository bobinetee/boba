import { waitUntilAnimationsFinish } from "./animation.js";

/**
 * Инициализирует логику диалогового окна по его имени.
 * @param {string} name - Значение атрибута data-dialog (например, 'event-form' или 'event-delete').
 */
export function initDialog(name) {
  // Находим само окно и все кнопки закрытия в документе
  const dialogElement = document.querySelector(`[data-dialog=${name}]`);
  const closeButtonElements = document.querySelectorAll("[data-dialog-close-button]");

  /**
   * Функция плавного закрытия окна.
   */
  function close() {
    // Добавляем CSS-класс для запуска анимации исчезновения (например, fade-out)
    dialogElement.classList.add("dialog--closing");

    // Ждем завершения анимации (используя функцию из animation.js)
    return waitUntilAnimationsFinish(dialogElement)
      .then(() => {
        // Когда анимация закончилась: убираем класс и окончательно закрываем тег <dialog>
        dialogElement.classList.remove("dialog--closing");
        dialogElement.close();
      })
      .catch((error) => {
        console.error("Finish dialog animation promise failed", error);
      });
  }

  // Навешиваем событие закрытия на все кнопки с атрибутом data-dialog-close-button
  for (const closeButtonElement of closeButtonElements) {
    closeButtonElement.addEventListener("click", () => {
      close();
    });
  }

  // Закрытие окна при клике на "подложку" (тёмную область вокруг окна)
  dialogElement.addEventListener("click", (event) => {
    if (event.target === dialogElement) {
      close();
    }
  });

  // Перехват стандартного закрытия (например, при нажатии клавиши Esc)
  dialogElement.addEventListener("cancel", (event) => {
    event.preventDefault(); // Отменяем мгновенное закрытие браузером
    close();               // Запускаем наше плавное закрытие
  });

  // Возвращаем объект с методами, чтобы другими скриптами можно было управлять окном
  return {
    dialogElement,
    open() {
      dialogElement.showModal(); // Стандартный метод HTML5 для открытия модалок
    },
    close() {
      return close();
    }
  };
}
