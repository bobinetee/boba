import { initAuth } from "./auth.js";
import { initAdminPanel } from "./admin.js";
import { initCalendar } from "./calendar.js";
import { initEventCreateButtons } from "./event-create-button.js";
import { initEventDeleteDialog } from "./event-delete-dialog.js";
import { initEventDetailsDialog } from "./event-details-dialog.js";
import { initEventFormDialog } from "./event-form-dialog.js";
import { initEventStore } from "./event-store.js";
import { initHamburger } from "./hamburger.js";
import { initMiniCalendars } from "./mini-calendar.js";
import { initMobileSidebar } from "./mobile-sidebar.js";
import { initNav } from "./nav.js";
import { initNotifications } from "./notifications.js";
import { initViewSelect } from "./view-select.js";
import { initResponsive } from "./responsive.js";
import { initUrl } from "./url.js";

// 1. Сначала проверяем авторизацию
await initAuth();
initAdminPanel();

// 2. Ждём успешного входа пользователя, затем запускаем календарь
document.addEventListener("user-logged-in", () => {
  const eventStore = initEventStore();
  initCalendar(eventStore);
  initEventCreateButtons();
  initEventDeleteDialog();
  initEventDetailsDialog();
  initEventFormDialog();
  initHamburger();
  initMiniCalendars();
  initMobileSidebar();
  initNav();
  initNotifications();
  initViewSelect();
  initResponsive();
  initUrl();
});