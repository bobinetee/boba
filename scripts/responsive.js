// Определяем медиа-запрос: десктопом считаем экраны шире 768 пикселей
const isDesktopMediaQuery = window.matchMedia("(min-width: 768px)");

/**
 * Инициализирует отслеживание размера экрана
 */
export function initResponsive() {
  // 1. Проверка при первой загрузке страницы:
  // Если пользователь зашел с мобильного, принудительно ставим вид "Неделя" (Week),
  // так как сетка месяца слишком велика для маленьких экранов.
  if (currentDeviceType() === "mobile") {
    document.dispatchEvent(new CustomEvent("view-change", {
      detail: { view: "week" },
      bubbles: true
    }));
  }

  // 2. Слушаем изменение размера окна (например, поворот планшета или изменение размера окна браузера)
  isDesktopMediaQuery.addEventListener("change", () => {
    const deviceType = currentDeviceType();

    // Сообщаем всему приложению, что тип устройства изменился (ПК или Мобилка)
    document.dispatchEvent(new CustomEvent("device-type-change", {
      detail: { deviceType },
      bubbles: true
    }));

    // Если перешли в мобильный режим — переключаем вид на недельный
    if (deviceType === "mobile") {
      document.dispatchEvent(new CustomEvent("view-change", {
        detail: { view: "week" },
        bubbles: true
      }));
    }
  });
}

/**
 * Функция-помощник: возвращает текущий тип устройства строкой
 * @returns {string} "desktop" или "mobile"
 */
export function currentDeviceType() {
  return isDesktopMediaQuery.matches ? "desktop" : "mobile";
}
