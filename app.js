// 未来便签应用的核心功能

// DOM 元素 - 通用
const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');
const themeButtons = document.querySelectorAll('.theme-btn');
const navItems = document.querySelectorAll('.nav-item');
const currentDateElement = document.getElementById('currentDate');
const welcomeCard = document.querySelector('.welcome-card');
const addFirstTaskButton = document.getElementById('addFirstTask');
const todoPanel = document.getElementById('todo-panel');

// DOM 元素 - 待办事项
const todoInput = document.getElementById('todoInput');
const addButton = document.getElementById('addButton');
const todoList = document.getElementById('todoList');
const filterButtons = document.querySelectorAll('.filter-btn');
const clearCompletedButton = document.getElementById('clearCompleted');
const taskCount = document.querySelector('.task-count');

// DOM 元素 - 闹钟
const alarmInput = document.getElementById('alarmInput');
const alarmDateTime = document.getElementById('alarmDateTime');
const addAlarmButton = document.getElementById('addAlarmButton');
const alarmList = document.getElementById('alarmList');

// 数据
let todos = [];
let alarms = [];
let currentFilter = 'all';
let alarmCheckInterval;

// 初始化主题
function initTheme() {
    // 从本地存储中获取主题，如果没有则使用默认主题
    const savedTheme = localStorage.getItem('appTheme') || 'yellow';
    setTheme(savedTheme);
}

// 设置主题
function setTheme(theme) {
    // 移除所有主题类
    document.body.classList.remove('theme-yellow', 'theme-green', 'theme-blue', 'theme-purple');
    
    // 添加选中的主题类
    document.body.classList.add(`theme-${theme}`);
    
    // 更新主题按钮的激活状态
    themeButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.theme === theme) {
            btn.classList.add('active');
        }
    });
    
    // 保存主题到本地存储
    localStorage.setItem('appTheme', theme);
}

// 为主题按钮添加事件监听器
function setupThemeSwitcher() {
    themeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const theme = button.dataset.theme;
            setTheme(theme);
        });
    });
}

// 初始化应用
function init() {
    // 从 localStorage 加载数据
    loadTodos();
    loadAlarms();
    // 渲染列表
    renderTodos();
    renderAlarms();
    // 更新任务计数
    updateTaskCount();
    // 添加事件监听器
    addEventListeners();
    // 设置主题切换
    setupThemeSwitcher();
    initTheme();
    
    // 显示当前日期
    updateCurrentDate();
    // 启动闹钟检查间隔（每秒检查一次）
    alarmCheckInterval = setInterval(checkAlarms, 1000);
}

// 加载待办事项
function loadTodos() {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
        todos = JSON.parse(savedTodos);
    }
}

// 保存待办事项
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// 加载闹钟
function loadAlarms() {
    const savedAlarms = localStorage.getItem('alarms');
    if (savedAlarms) {
        alarms = JSON.parse(savedAlarms);
    }
}

// 保存闹钟
function saveAlarms() {
    localStorage.setItem('alarms', JSON.stringify(alarms));
}

// 渲染待办事项列表
function renderTodos() {
    todoList.innerHTML = '';
    
    // 根据当前过滤器筛选待办事项
    let filteredTodos = todos.filter(todo => {
        if (currentFilter === 'active') return !todo.completed;
        if (currentFilter === 'completed') return todo.completed;
        return true;
    });
    
    // 按完成状态排序：未完成的排在前面，完成的排在后面
    filteredTodos.sort((a, b) => {
        if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
        }
        // 同为完成或未完成时，按创建时间排序（新的在前）
        return b.createdAt - a.createdAt;
    });
    
    // 如果没有待办事项，显示提示信息
    if (filteredTodos.length === 0) {
        const emptyMessage = document.createElement('li');
        emptyMessage.className = 'todo-item empty-message';
        emptyMessage.style.textAlign = 'center';
        emptyMessage.style.color = '#888';
        
        if (currentFilter === 'active') {
            emptyMessage.textContent = '没有进行中的待办事项';
        } else if (currentFilter === 'completed') {
            emptyMessage.textContent = '没有已完成的待办事项';
        } else {
            emptyMessage.textContent = '添加你的第一个待办事项';
        }
        
        todoList.appendChild(emptyMessage);
        return;
    }
    
    // 渲染每个待办事项
    filteredTodos.forEach(todo => {
        const li = document.createElement('li');
        li.className = 'todo-item';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'checkbox';
        checkbox.checked = todo.completed;
        checkbox.addEventListener('change', () => toggleTodo(todo.id));
        
        const todoText = document.createElement('span');
        todoText.className = 'todo-text' + (todo.completed ? ' completed' : '');
        todoText.textContent = todo.text;
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-btn';
        deleteButton.textContent = '删除';
        deleteButton.addEventListener('click', () => deleteTodo(todo.id));
        
        li.appendChild(checkbox);
        li.appendChild(todoText);
        li.appendChild(deleteButton);
        
        todoList.appendChild(li);
    });
}

// 渲染闹钟列表
function renderAlarms() {
    alarmList.innerHTML = '';
    
    // 获取所有有效的闹钟（激活且时间在未来）
    const activeAlarms = alarms.filter(alarm => 
        alarm.active && alarm.alarmTime > Date.now()
    );
    
    // 按时间排序
    activeAlarms.sort((a, b) => a.alarmTime - b.alarmTime);
    
    if (activeAlarms.length === 0) {
        const emptyMessage = document.createElement('li');
        emptyMessage.className = 'alarm-item';
        emptyMessage.style.textAlign = 'center';
        emptyMessage.style.color = '#888';
        emptyMessage.style.border = 'none';
        emptyMessage.style.background = 'transparent';
        emptyMessage.textContent = '没有设置闹钟提醒';
        alarmList.appendChild(emptyMessage);
        return;
    }
    
    activeAlarms.forEach(alarm => {
        const li = document.createElement('li');
        li.className = 'alarm-item';
        
        const alarmInfo = document.createElement('div');
        alarmInfo.className = 'alarm-info';
        
        const alarmIcon = document.createElement('span');
        alarmIcon.className = 'alarm-icon';
        alarmIcon.textContent = '⏰';
        
        const alarmText = document.createElement('span');
        alarmText.className = 'alarm-text';
        alarmText.textContent = alarm.text;
        
        const alarmTime = document.createElement('span');
        alarmTime.className = 'alarm-time';
        alarmTime.textContent = formatDateTime(alarm.alarmTime);
        
        alarmInfo.appendChild(alarmIcon);
        alarmInfo.appendChild(alarmText);
        alarmInfo.appendChild(alarmTime);
        
        const alarmActions = document.createElement('div');
        alarmActions.className = 'alarm-actions';
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'alarm-delete-btn';
        deleteBtn.textContent = '删除';
        deleteBtn.addEventListener('click', () => deleteAlarm(alarm.id));
        
        alarmActions.appendChild(deleteBtn);
        
        li.appendChild(alarmInfo);
        li.appendChild(alarmActions);
        
        alarmList.appendChild(li);
    });
}

// 格式化日期时间
function formatDateTime(timestamp) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

// 检查并触发闹钟
function checkAlarms() {
    const now = Date.now();
    const triggeredAlarms = alarms.filter(alarm => 
        alarm.active && alarm.alarmTime && 
        alarm.alarmTime <= now && alarm.alarmTime > now - 60000 // 1分钟内触发
    );
    
    triggeredAlarms.forEach(alarm => {
        showAlarmNotification(alarm.text);
        // 标记闹钟为已触发
        alarm.active = false;
    });
    
    // 如果有触发的闹钟，保存更新
    if (triggeredAlarms.length > 0) {
        saveAlarms();
        renderAlarms();
    }
}

// 显示闹钟通知
function showAlarmNotification(text) {
    // 先移除之前的通知
    const existingNotification = document.querySelector('.alarm-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = 'alarm-notification';
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'close-notification';
    closeBtn.textContent = '×';
    closeBtn.addEventListener('click', () => {
        notification.remove();
    });
    
    const title = document.createElement('h3');
    title.textContent = '闹钟提醒';
    
    const message = document.createElement('p');
    message.textContent = text;
    
    notification.appendChild(closeBtn);
    notification.appendChild(title);
    notification.appendChild(message);
    
    document.body.appendChild(notification);
    
    // 5秒后自动关闭通知
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.transition = 'opacity 0.3s, transform 0.3s';
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

// 删除闹钟
function deleteAlarm(id) {
    const todo = todos.find(todo => todo.id === id);
    if (todo) {
        todo.hasAlarm = false;
        todo.alarmTime = null;
        saveTodos();
        renderTodos();
        renderAlarms();
    }
}

// 添加新的待办事项
function addTodo() {
    const text = todoInput.value.trim();
    if (text === '') return;
    
    const newTodo = {
        id: Date.now(), // 使用时间戳作为唯一ID
        text: text,
        completed: false,
        createdAt: new Date().getTime()
    };
    
    todos.push(newTodo);
    saveTodos();
    renderTodos();
    updateTaskCount();
    
    // 隐藏欢迎卡片
    toggleWelcomeCard(false);
    
    // 清空输入框
    todoInput.value = '';
}

// 添加新的闹钟
function addAlarm() {
    const text = alarmInput.value.trim();
    const dateTimeValue = alarmDateTime.value;
    
    if (text === '' || dateTimeValue === '') {
        alert('请输入闹钟内容和时间');
        return;
    }
    
    const alarmTime = new Date(dateTimeValue).getTime();
    const now = new Date().getTime();
    
    if (alarmTime <= now) {
        alert('请设置未来的时间');
        return;
    }
    
    const newAlarm = {
        id: Date.now(),
        text: text,
        alarmTime: alarmTime,
        createdAt: now,
        active: true
    };
    
    alarms.push(newAlarm);
    saveAlarms();
    renderAlarms();
    
    // 清空输入框
    alarmInput.value = '';
    alarmDateTime.value = '';
}

// 切换待办事项的完成状态
function toggleTodo(id) {
    const todo = todos.find(todo => todo.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        renderTodos();
        updateTaskCount();
    }
}

// 删除待办事项
function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    renderTodos();
    updateTaskCount();
}

// 删除闹钟
function deleteAlarm(id) {
    alarms = alarms.filter(alarm => alarm.id !== id);
    saveAlarms();
    renderAlarms();
}

// 设置过滤器
function setFilter(filter) {
    currentFilter = filter;
    
    // 更新过滤器按钮的状态
    filterButtons.forEach(button => {
        button.classList.remove('active');
        if (button.dataset.filter === filter) {
            button.classList.add('active');
        }
    });
    
    renderTodos();
}

// 清除已完成的待办事项
function clearCompleted() {
    todos = todos.filter(todo => !todo.completed);
    saveTodos();
    renderTodos();
    updateTaskCount();
}

// 切换选项卡
function switchTab(tabId) {
    // 更新选项卡按钮状态
    tabButtons.forEach(button => {
        button.classList.remove('active');
        if (button.dataset.tab === tabId) {
            button.classList.add('active');
        }
    });
    
    // 更新选项卡面板状态
    tabPanels.forEach(panel => {
        panel.classList.remove('active');
        if (panel.id === `${tabId}-panel`) {
            panel.classList.add('active');
        }
    });
}

// 更新任务计数
function updateTaskCount() {
    const activeCount = todos.filter(todo => !todo.completed).length;
    taskCount.textContent = `${activeCount} 个待办事项`;
    
    // 启用或禁用清除已完成按钮
    const hasCompletedTodos = todos.some(todo => todo.completed);
    clearCompletedButton.disabled = !hasCompletedTodos;
}

// 更新当前日期显示
function updateCurrentDate() {
    const now = new Date();
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    };
    currentDateElement.textContent = now.toLocaleDateString('zh-CN', options);
}

// 切换侧边栏导航
function switchSection(sectionId) {
    // 更新导航项的激活状态
    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.dataset.section === sectionId) {
            item.classList.add('active');
        }
    });
    
    // 根据导航选择显示相应内容
    if (sectionId === 'todo' || sectionId === 'planned' || sectionId === 'flagged' || sectionId === 'task') {
        // 显示待办事项面板
        todoPanel.classList.add('active');
        document.getElementById('alarm-panel').classList.remove('active');
        
        // 根据待办事项数量显示或隐藏欢迎卡片
        if (sectionId === 'todo') {
            toggleWelcomeCard(todos.length === 0);
        } else {
            // 切换到其他待办事项相关部分时，隐藏欢迎卡片
            toggleWelcomeCard(false);
        }
    } else if (sectionId === 'alarm') {
        // 显示闹钟面板
        document.getElementById('alarm-panel').classList.add('active');
        todoPanel.classList.remove('active');
        // 隐藏欢迎卡片
        toggleWelcomeCard(false);
    }
}

// 切换欢迎卡片显示
function toggleWelcomeCard(show) {
    if (welcomeCard) {
        welcomeCard.style.display = show ? 'block' : 'none';
    }
}

// 添加事件监听器
function addEventListeners() {
    // 侧边栏导航切换事件
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            switchSection(item.dataset.section);
        });
    });
    
    // 添加第一个任务按钮点击事件
    if (addFirstTaskButton) {
        addFirstTaskButton.addEventListener('click', () => {
            toggleWelcomeCard(false);
            if (todoInput) {
                todoInput.focus();
            }
        });
    }
    
    // 待办事项相关事件
    addButton.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTodo();
        }
    });
    
    // 过滤器按钮点击事件
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            setFilter(button.dataset.filter);
        });
    });
    
    // 清除已完成按钮点击事件
    clearCompletedButton.addEventListener('click', clearCompleted);
    
    // 初始禁用清除已完成按钮
    clearCompletedButton.disabled = true;
    
    // 闹钟相关事件
    addAlarmButton.addEventListener('click', addAlarm);
    alarmInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addAlarm();
        }
    });
    
    // 设置默认时间为当前时间后的5分钟
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    const formattedDateTime = now.toISOString().slice(0, 16);
    alarmDateTime.value = formattedDateTime;
}

// 启动应用
init();