import { waitUntilAnimationsFinish } from "./animation.js";

/**
 * Инициализирует контейнер для уведомлений (тостер).
 * @param {HTMLElement} parent - Элемент, в который будет вставлен тостер (обычно body или диалог).
 */
export function initToaster(parent) {
  // Создаем динамически контейнер для всех будущих уведомлений
  const toasterElement = document.createElement("div");

  toasterElement.classList.add("toaster");
  parent.appendChild(toasterElement);

  return {
    // Метод для показа зеленого уведомления (успех)
    success(message) {
      showToast(toasterElement, message, "success");
    },
    // Метод для показа красного уведомления (ошибка)
    error(message) {
      showToast(toasterElement, message, "error");
    }
  };
}

/**
 * Создает и запускает процесс показа уведомления.
 */
function showToast(toasterElement, message, type) {
  const toastElement = createToast(message, type);
  animateToast(toasterElement, toastElement);
}

/**
 * Создает DOM-элемент уведомления.
 */
function createToast(message, type) {
  const toastElement = document.createElement("div");
  toastElement.textContent = message;
  toastElement.classList.add("toast");
  // Добавляет специфический класс (toast--success или toast--error) для смены цвета в CSS
  toastElement.classList.add(`toast--${type}`);

  return toastElement;
}

/**
 * Логика анимации появления и автоматического удаления.
 */
function animateToast(toasterElement, toastElement) {
  // Вычисляем разницу высот для плавной анимации сдвига, если уведомлений несколько
  const heightBefore = toasterElement.offsetHeight;
  toasterElement.appendChild(toastElement);
  const heightAfter = toasterElement.offsetHeight;
  const heightDiff = heightAfter - heightBefore;

  // Используем Web Animations API для плавного "выплывания" тоста
  const toasterAnimation = toasterElement.animate([
    { transform: `translate(0, ${heightDiff}px)` }, // Начало: смещено вниз
    { transform: "translate(0, 0)" }               // Конец: на своем месте
  ], {
    duration: 150,
    easing: "ease-out"
  });

  // Синхронизируем время начала анимации
  toasterAnimation.startTime = document.timeline.currentTime;

  // Ждем завершения анимации (включая ту, что прописана в CSS для исчезновения)
  waitUntilAnimationsFinish(toastElement)
    .then(() => {
      // Когда все анимации закончились (тост исчез) — полностью удаляем его из памяти и HTML
      toasterElement.removeChild(toastElement);
    })
    .catch((error) => {
      console.error("Finish toast animation promise failed", error);
    });
}
