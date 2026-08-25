/**
 * Функция-помощник, которая ждет завершения всех активных анимаций на элементе.
 * @param {HTMLElement} element - HTML-элемент, анимации которого нужно отследить.
 * @returns {Promise} - Промис, который выполнится, когда все анимации завершатся.
 */
export function waitUntilAnimationsFinish(element) {
  // 1. Получаем список всех текущих анимаций элемента через getAnimations()
  // 2. С помощью map создаем массив из "промисов завершения" (animation.finished)
  const animationPromises = element.getAnimations().map(animation => animation.finished);

  // 3. Ждем выполнения всех промисов в массиве. 
  // Используется allSettled, чтобы функция сработала, даже если какая-то анимация была отменена с ошибкой.
  return Promise.allSettled(animationPromises);
}
