const API_URL = "api.php";

export function initAdminPanel() {
  const adminBtn = document.getElementById("admin-panel-btn");
  const adminDialog = document.getElementById("admin-dialog");
  const closeBtn = document.getElementById("admin-close-btn");
  const addBtn = document.getElementById("admin-add-btn");
  const searchInput = document.getElementById("admin-search");
  const tbody = document.getElementById("admin-users-tbody");
  
  const userFormDialog = document.getElementById("user-form-dialog");
  const userForm = document.getElementById("user-form");
  const userFormTitle = document.getElementById("user-form-title");
  const passwordLabel = document.getElementById("password-label");
  const passwordInput = document.getElementById("user-password");
  const employeeInput = document.getElementById("user-employee");
  const usernameInput = document.getElementById("user-username");

  let allUsers = [];

  adminBtn?.addEventListener("click", async () => {
    await loadUsers();
    adminDialog.showModal();
  });
  closeBtn?.addEventListener("click", () => adminDialog.close());
  
  addBtn?.addEventListener("click", () => openUserForm(null));
  
  searchInput?.addEventListener("input", () => renderUsers(searchInput.value));

  userForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(userForm));
    const isEdit = !!data.id;
    
    const payload = {
      ...data,
      is_active: userForm.querySelector("#user-active").checked
    };
    
    if (isEdit) {
      if (!payload.password) delete payload.password; // не меняем, если пусто
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'user_update', ...payload })
      });
      // Если меняли пароль — отдельный запрос
      if (payload.password) {
        await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'user_reset_password', id: payload.id, password: payload.password })
        });
      }
    } else {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'user_create', ...payload })
      });
      const result = await res.json();
      if (result.error) {
        alert(result.error);
        return;
      }
    }
    userFormDialog.close();
    await loadUsers();
  });

  document.getElementById("user-form-close")?.addEventListener("click", () => userFormDialog.close());
  document.getElementById("user-form-cancel")?.addEventListener("click", () => userFormDialog.close());

  async function loadUsers() {
    const res = await fetch(`${API_URL}?action=users_list`);
    allUsers = await res.json();
    renderUsers(searchInput?.value || "");
  }

  function renderUsers(query) {
    const q = query.toLowerCase().trim();
    const filtered = allUsers.filter(u => 
      !q || u.full_name.toLowerCase().includes(q) || u.department.toLowerCase().includes(q) || u.employee_number.includes(q)
    );
    
    tbody.innerHTML = filtered.map(u => `
      <tr>
        <td>${escapeHtml(u.employee_number)}</td>
        <td>${escapeHtml(u.full_name)}</td>
        <td>${escapeHtml(u.department)}</td>
        <td>${escapeHtml(u.username)}</td>
        <td>${u.role === 'admin' ? '👑 Админ' : 'Сотрудник'}</td>
        <td>${u.is_active == 1 ? '✅ Активен' : '⛔ Отключен'}</td>
        <td class="admin-actions">
          <button class="btn-small" data-edit="${u.id}">✏️</button>
          <button class="btn-small" data-reset="${u.id}">🔑</button>
          <button class="btn-small btn-danger" data-delete="${u.id}">🗑️</button>
        </td>
      </tr>
    `).join("");

    // Обработчики кнопок
    tbody.querySelectorAll("[data-edit]").forEach(btn => {
      btn.addEventListener("click", () => {
        const user = allUsers.find(u => u.id == btn.dataset.edit);
        openUserForm(user);
      });
    });
    tbody.querySelectorAll("[data-reset]").forEach(btn => {
      btn.addEventListener("click", async () => {
        const newPass = prompt("Введите новый пароль:");
        if (!newPass) return;
        await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'user_reset_password', id: btn.dataset.reset, password: newPass })
        });
        alert("Пароль сброшен");
      });
    });
    tbody.querySelectorAll("[data-delete]").forEach(btn => {
      btn.addEventListener("click", async () => {
        if (!confirm("Удалить сотрудника? Все его брони тоже удалятся.")) return;
        await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'user_delete', id: btn.dataset.delete })
        });
        await loadUsers();
      });
    });
  }

  function openUserForm(user) {
    userForm.reset();
    if (user) {
      userFormTitle.textContent = "Редактирование сотрудника";
      userForm.querySelector("#user-id").value = user.id;
      employeeInput.value = user.employee_number;
      employeeInput.disabled = true; // табельный номер менять нельзя
      usernameInput.value = user.username;
      usernameInput.disabled = true; // логин тоже
      userForm.querySelector("#user-fullname").value = user.full_name;
      userForm.querySelector("#user-department").value = user.department;
      userForm.querySelector("#user-role").value = user.role;
      userForm.querySelector("#user-active").checked = user.is_active == 1;
      passwordLabel.textContent = "Новый пароль (оставьте пустым, чтобы не менять)";
      passwordInput.required = false;
    } else {
      userFormTitle.textContent = "Новый сотрудник";
      employeeInput.disabled = false;
      usernameInput.disabled = false;
      passwordLabel.textContent = "Пароль *";
      passwordInput.required = true;
    }
    userFormDialog.showModal();
  }

  function escapeHtml(s) {
    return String(s || "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
}