const API_URL = "api.php";

let currentUser = null;

export async function checkAuth() {
  try {
    const response = await fetch(`${API_URL}?action=me`);
    if (response.status === 401) {
      currentUser = null;
      return null;
    }
    currentUser = await response.json();
    return currentUser;
  } catch (error) {
    console.error("Ошибка проверки авторизации:", error);
    return null;
  }
}

export function getCurrentUser() {
  return currentUser;
}

export function isAdmin() {
  return currentUser && currentUser.role === 'admin';
}

export async function login(username, password) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'login', username, password })
  });
  const data = await response.json();
  if (data.success) {
    currentUser = data;
  }
  return data;
}

export async function logout() {
  await fetch(`${API_URL}?action=logout`);
  currentUser = null;
}

export function initLoginForm() {
  const loginScreen = document.getElementById("login-screen");
  const appScreen = document.getElementById("app-screen");
  const form = document.getElementById("login-form");
  const errorBox = document.getElementById("login-error");
  const logoutBtn = document.getElementById("logout-btn");
  const userInfo = document.getElementById("user-info");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorBox.textContent = "";
    const username = form.username.value.trim();
    const password = form.password.value;

    const result = await login(username, password);
    if (result.success) {
      showApp();
    } else {
      errorBox.textContent = result.error || "Ошибка входа";
    }
  });

  logoutBtn.addEventListener("click", async () => {
    await logout();
    showLogin();
  });
}

function showApp() {
  document.getElementById("login-screen").style.display = "none";
  document.getElementById("app-screen").style.display = "block";
  
  // Обновляем информацию о пользователе в шапке
  const userInfo = document.getElementById("user-info");
  const logoutBtn = document.getElementById("logout-btn");
  if (userInfo && currentUser) {
    const roleBadge = currentUser.role === 'admin' 
      ? '<span class="role-badge role-badge--admin">Админ</span>' 
      : '<span class="role-badge role-badge--user">Сотрудник</span>';
    userInfo.innerHTML = `
      <div class="user-name">${currentUser.name}</div>
      <div class="user-meta">${currentUser.department} ${roleBadge}</div>
    `;
  }
  if (logoutBtn) logoutBtn.style.display = "inline-block";
  
  // Показываем админ-кнопку только для админа
  const adminBtn = document.getElementById("admin-panel-btn");
  if (adminBtn) {
    adminBtn.style.display = isAdmin() ? "inline-block" : "none";
  }
  
  // Уведомляем приложение, что пользователь вошёл
  document.dispatchEvent(new CustomEvent("user-logged-in", { detail: currentUser }));
}

function showLogin() {
  document.getElementById("login-screen").style.display = "flex";
  document.getElementById("app-screen").style.display = "none";
  document.getElementById("login-form").reset();
  document.getElementById("login-error").textContent = "";
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) logoutBtn.style.display = "none";
}

// Запуск при загрузке
export async function initAuth() {
  initLoginForm();
  const user = await checkAuth();
  if (user) {
    showApp();
  } else {
    showLogin();
  }
}