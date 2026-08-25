<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

// === НАСТРОЙКИ БД ===
$host = 'localhost';
$db   = 'boba_calendar';
$user = 'root';
$pass = ''; // ← Укажите пароль от MySQL в XAMPP (по умолчанию пустой)

try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$db;charset=utf8mb4",
        $user, $pass,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]
    );
} catch (PDOException $e) {
    die(json_encode(['error' => 'Ошибка подключения к БД']));
}

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true) ?: [];
$action = $_GET['action'] ?? $input['action'] ?? '';

try {
    // ========================================
    // === АУТЕНТИФИКАЦИЯ =====================
    // ========================================
    
    if ($action === 'login') {
        $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ? AND is_active = TRUE");
        $stmt->execute([$input['username'] ?? '']);
        $user = $stmt->fetch();
        
        if ($user && password_verify($input['password'] ?? '', $user['password_hash'])) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['role'] = $user['role'];
            $_SESSION['full_name'] = $user['full_name'];
            $_SESSION['department'] = $user['department'];
            echo json_encode([
                'success' => true,
                'role' => $user['role'],
                'name' => $user['full_name'],
                'department' => $user['department']
            ]);
        } else {
            http_response_code(401);
            echo json_encode(['error' => 'Неверный логин или пароль']);
        }
        exit;
    }
    
    if ($action === 'logout') {
        session_destroy();
        echo json_encode(['success' => true]);
        exit;
    }
    
    if ($action === 'me') {
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Не авторизован']);
            exit;
        }
        echo json_encode([
            'id' => $_SESSION['user_id'],
            'role' => $_SESSION['role'],
            'name' => $_SESSION['full_name'],
            'department' => $_SESSION['department']
        ]);
        exit;
    }
    
    // ========================================
    // === УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ (АДМИН) ==
    // ========================================
    
    if ($action === 'users_list') {
        requireAdmin();
        $stmt = $pdo->query("
            SELECT id, employee_number, full_name, department, username, role, is_active, created_at 
            FROM users ORDER BY full_name
        ");
        echo json_encode($stmt->fetchAll());
        exit;
    }
    
    if ($action === 'user_create') {
        requireAdmin();
        
        // Проверка обязательных полей
        $required = ['employee_number', 'full_name', 'department', 'username', 'password'];
        foreach ($required as $field) {
            if (empty($input[$field])) {
                http_response_code(400);
                echo json_encode(['error' => "Поле '$field' обязательно"]);
                exit;
            }
        }
        
        // Проверка уникальности
        $stmt = $pdo->prepare("SELECT id FROM users WHERE employee_number = ? OR username = ?");
        $stmt->execute([$input['employee_number'], $input['username']]);
        if ($stmt->fetch()) {
            http_response_code(400);
            echo json_encode(['error' => 'Табельный номер или логин уже заняты']);
            exit;
        }
        
        $hash = password_hash($input['password'], PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("
            INSERT INTO users (employee_number, full_name, department, username, password_hash, role) 
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $input['employee_number'],
            $input['full_name'],
            $input['department'],
            $input['username'],
            $hash,
            $input['role'] ?? 'user'
        ]);
        echo json_encode(['success' => true, 'id' => (int)$pdo->lastInsertId()]);
        exit;
    }
    
    if ($action === 'user_update') {
        requireAdmin();
        $stmt = $pdo->prepare("
            UPDATE users SET full_name=?, department=?, role=?, is_active=? WHERE id=?
        ");
        $stmt->execute([
            $input['full_name'],
            $input['department'],
            $input['role'],
            $input['is_active'] ? 1 : 0,
            $input['id']
        ]);
        echo json_encode(['success' => true]);
        exit;
    }
    
    if ($action === 'user_reset_password') {
        requireAdmin();
        if (empty($input['password'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Пароль не указан']);
            exit;
        }
        $hash = password_hash($input['password'], PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("UPDATE users SET password_hash = ? WHERE id = ?");
        $stmt->execute([$hash, $input['id']]);
        echo json_encode(['success' => true]);
        exit;
    }
    
    if ($action === 'user_delete') {
        requireAdmin();
        // Нельзя удалить самого себя
        if ((int)$input['id'] === (int)$_SESSION['user_id']) {
            http_response_code(400);
            echo json_encode(['error' => 'Нельзя удалить самого себя']);
            exit;
        }
        $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$input['id']]);
        echo json_encode(['success' => true]);
        exit;
    }
    
    // ========================================
    // === КАЛЕНДАРЬ И БРОНИРОВАНИЯ ===========
    // ========================================
    
    if ($action === 'rooms') {
        requireAuth();
        $stmt = $pdo->query("SELECT * FROM rooms WHERE is_active = TRUE ORDER BY name");
        echo json_encode($stmt->fetchAll());
        exit;
    }
    
    if ($action === 'bookings') {
        requireAuth();
        $stmt = $pdo->query("
            SELECT b.*, r.name as room_name, u.full_name as user_name, u.department as user_department
            FROM bookings b
            JOIN rooms r ON b.room_id = r.id
            JOIN users u ON b.user_id = u.id
            ORDER BY b.booking_date, b.start_time
        ");
        echo json_encode($stmt->fetchAll());
        exit;
    }
    
    if ($action === 'create') {
        requireAuth();
        $stmt = $pdo->prepare("
            INSERT INTO bookings (room_id, user_id, title, booking_date, start_time, end_time, color, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
        ");
        $stmt->execute([
            $input['room_id'], $_SESSION['user_id'], $input['title'],
            $input['date'], $input['startTime'], $input['endTime'], $input['color']
        ]);
        echo json_encode(['id' => (int)$pdo->lastInsertId(), 'status' => 'pending']);
        exit;
    }
    
    if ($action === 'confirm') {
        requireAdmin();
        $stmt = $pdo->prepare("UPDATE bookings SET status = 'confirmed' WHERE id = ?");
        $stmt->execute([$input['id']]);
        echo json_encode(['success' => true]);
        exit;
    }
    
    if ($action === 'reject') {
        requireAdmin();
        $stmt = $pdo->prepare("UPDATE bookings SET status = 'rejected' WHERE id = ?");
        $stmt->execute([$input['id']]);
        echo json_encode(['success' => true]);
        exit;
    }
    
    if ($action === 'delete') {
        requireAuth();
        if ($_SESSION['role'] === 'admin') {
            $stmt = $pdo->prepare("DELETE FROM bookings WHERE id = ?");
            $stmt->execute([$input['id']]);
        } else {
            $stmt = $pdo->prepare("DELETE FROM bookings WHERE id = ? AND user_id = ?");
            $stmt->execute([$input['id'], $_SESSION['user_id']]);
        }
        echo json_encode(['success' => true]);
        exit;
    }
    
    http_response_code(400);
    echo json_encode(['error' => 'Неизвестное действие']);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

// === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===
function requireAuth() {
    global $_SESSION;
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Требуется авторизация']);
        exit;
    }
}

function requireAdmin() {
    global $_SESSION;
    requireAuth();
    if ($_SESSION['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(['error' => 'Доступ запрещен']);
        exit;
    }
}
?>