// Создаем специальный канал связи ("рацию") между вкладками одного сайта.
// Все вкладки, подписанные на "events-change-channel", смогут слышать друг друга.
const broadcastChannel = new BroadcastChannel("events-change-channel");

/**
 * Инициализирует синхронизацию данных между вкладками.
 */
export function initSync() {
  
  // 1. СЛУШАЕМ другие вкладки.
  // Когда в ЛЮБОЙ другой вкладке изменится событие, эта вкладка получит сообщение.
  broadcastChannel.addEventListener("message", () => {
    // Генерируем событие "events-change" внутри текущей вкладки.
    // Указываем источник 'broadcast-channel', чтобы избежать бесконечного цикла обновлений.
    document.dispatchEvent(new CustomEvent("events-change", {
      detail: {
        source: "broadcast-channel"
      },
      bubbles: true
    }));
  });

  // 2. ОПОВЕЩАЕМ другие вкладки.
  // Слушаем изменения событий в ТЕКУЩЕЙ вкладке.
  document.addEventListener("events-change", (event) => {
    // Если изменение произошло именно здесь (а не пришло по каналу от другой вкладки),
    // отправляем сигнал всем остальным вкладкам: "Эй, я обновил данные в базе/памяти!"
    if (event?.detail?.source !== "broadcast-channel") {
      broadcastChannel.postMessage({});
    }
  });
}
