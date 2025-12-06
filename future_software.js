// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 导航栏滚动效果
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 移动端菜单切换
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const menu = document.querySelector('.menu');
    
    if (mobileMenuBtn && menu) {
        mobileMenuBtn.addEventListener('click', function() {
            menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
            menu.style.flexDirection = 'column';
            menu.style.position = 'absolute';
            menu.style.top = '70px';
            menu.style.left = '0';
            menu.style.right = '0';
            menu.style.background = 'rgba(255, 255, 255, 0.95)';
            menu.style.backdropFilter = 'blur(10px)';
            menu.style.boxShadow = '0 5px 10px rgba(0, 0, 0, 0.1)';
            menu.style.padding = '20px';
            menu.style.gap = '15px';
            menu.style.zIndex = '999';
        });
    }

    // 平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                // 在移动设备上点击导航项后关闭菜单
                if (window.innerWidth <= 768 && menu) {
                    menu.style.display = 'none';
                }
            }
        });
    });

    // 产品卡片动画控制
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.product-card, .fade-in-up');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementPosition < windowHeight - 100) {
                element.classList.add('animated');
            }
        });
    };

    // 初始加载时执行一次动画检查
    animateOnScroll();
    
    // 滚动时执行动画检查
    window.addEventListener('scroll', animateOnScroll);



    // 产品入口按钮点击事件
    
    // 为未来便签添加特定点击事件
    const noteButton = document.getElementById('note-button');
    if (noteButton) {
        noteButton.addEventListener('click', function(e) {
            e.preventDefault();
            // 导航到便签应用（index.html）
            window.location.href = 'index4.html';
        });
    }
    
    // 为其他产品按钮添加通用点击事件
    const otherProductButtons = document.querySelectorAll('.product-btn:not(#note-button)');
    otherProductButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const productName = this.closest('.product-card').querySelector('h3').textContent;
            alert(`您即将进入${productName}应用`);
            // 这里可以添加跳转到相应产品页面的逻辑
            window.location.href = 'index1.html';
        });
    });

    // 导航项高亮
    const highlightNavigation = function() {
        const sections = document.querySelectorAll('section[id]');
        const navItems = document.querySelectorAll('.menu-item');
        
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (pageYOffset >= sectionTop - 100) {
                currentSection = section.getAttribute('id');
            }
        });
        
        navItems.forEach(item => {
            item.classList.remove('active');
            const href = item.getAttribute('href').substring(1);
            // 如果是首页链接（空字符串）或匹配当前section
            if (href === '' || href === currentSection) {
                item.classList.add('active');
            }
        });
    };

    // 监听滚动事件以更新导航高亮
    window.addEventListener('scroll', highlightNavigation);
    
    // 初始加载时更新导航高亮
    highlightNavigation();

    // 为元素添加淡入动画类
    setTimeout(() => {
        document.querySelectorAll('.hero-content, .hero-image, .section-title, .section-subtitle').forEach((el, index) => {
            el.classList.add('fade-in-up');
            el.style.animationDelay = `${index * 0.1}s`;
        });
    }, 100);

    // 动态设置产品卡片的动画延迟
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach((card, index) => {
        card.classList.add('fade-in-up');
        card.style.animationDelay = `${index * 0.2}s`;
    });

    // 页面加载完成后显示所有元素
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 500);
});

// 窗口调整大小时重新初始化导航菜单
window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
        const menu = document.querySelector('.menu');
        if (menu) {
            menu.style.display = 'flex';
            menu.style.flexDirection = 'row';
            menu.style.position = 'static';
            menu.style.top = 'auto';
            menu.style.left = 'auto';
            menu.style.right = 'auto';
            menu.style.background = 'none';
            menu.style.backdropFilter = 'none';
            menu.style.boxShadow = 'none';
            menu.style.padding = '0';
            menu.style.gap = '30px';
        }
    } else {
        const menu = document.querySelector('.menu');
        if (menu) {
            menu.style.display = 'none';
        }
    }
});

// 添加额外的动画效果
document.addEventListener('DOMContentLoaded', function() {
    // 为统计数字添加增长动画
    const animateStats = function() {
        const statsSection = document.querySelector('.about-stats');
        const statsSectionPosition = statsSection.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (statsSectionPosition < windowHeight - 100) {
            const statNumbers = document.querySelectorAll('.stat-item h4');
            
            statNumbers.forEach(number => {
                const target = parseInt(number.textContent.replace(/,/g, ''));
                let count = 0;
                const duration = 2000; // 2秒
                const increment = target / (duration / 16); // 60fps
                
                const updateCount = function() {
                    count += increment;
                    if (count < target) {
                        number.textContent = Math.ceil(count).toLocaleString();
                        requestAnimationFrame(updateCount);
                    } else {
                        number.textContent = target.toLocaleString();
                    }
                };
                
                updateCount();
            });
            
            // 只执行一次动画
            window.removeEventListener('scroll', animateStats);
        }
    };
    
    window.addEventListener('scroll', animateStats);
});

// 为按钮添加悬停音效（可选）
const addButtonEffects = function() {
    const buttons = document.querySelectorAll('button, .btn-primary, .product-btn');
    
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
        
        button.addEventListener('mousedown', function() {
            this.style.transform = 'translateY(0)';
        });
        
        button.addEventListener('mouseup', function() {
            this.style.transform = 'translateY(-3px)';
        });
    });
};

document.addEventListener('DOMContentLoaded', addButtonEffects);

// 生成5位包含字母和数字的安全代号
function generateSecurityCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// 头像预览功能
function previewAvatar(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('avatar-preview').src = e.target.result;
        }
        reader.readAsDataURL(input.files[0]);
    }
}

// 登录注册功能
document.addEventListener('DOMContentLoaded', function() {
    // DOM元素获取
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');
    const forgotModal = document.getElementById('forgot-modal');
    const closeBtns = document.querySelectorAll('.close-btn');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const forgotForm = document.getElementById('forgot-form');
    const toggleRegister = document.getElementById('toggle-register');
    const toggleLogin = document.getElementById('toggle-login');
    const forgotPasswordLink = document.getElementById('forgot-password-link');
    const toggleBackToLogin = document.getElementById('toggle-back-to-login');
    const userInfo = document.getElementById('user-info');
    const usernameDisplay = document.getElementById('username-display');
    const logoutBtn = document.getElementById('logout-btn');
    const deleteAccountBtn = document.getElementById('delete-account-btn');
    const authButtons = document.querySelector('.auth-buttons');
    const userAvatar = document.getElementById('user-avatar');
    
    // 模态框控制
    function showModal(modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    function hideModal(modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
    
    function hideAllModals() {
        hideModal(loginModal);
        hideModal(registerModal);
        hideModal(forgotModal);
    }
    
    // 事件监听
    loginBtn.addEventListener('click', () => showModal(loginModal));
    registerBtn.addEventListener('click', () => showModal(registerModal));
    
    closeBtns.forEach(btn => {
        btn.addEventListener('click', hideAllModals);
    });
    
    // 点击模态框外部关闭
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            hideAllModals();
        }
    });
    
    // 切换模态框
    toggleRegister.addEventListener('click', (e) => {
        e.preventDefault();
        hideModal(loginModal);
        showModal(registerModal);
    });
    
    toggleLogin.addEventListener('click', (e) => {
        e.preventDefault();
        hideModal(registerModal);
        showModal(loginModal);
    });
    
    // 忘记密码相关事件
    forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        hideModal(loginModal);
        showModal(forgotModal);
    });
    
    toggleBackToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        hideModal(forgotModal);
        showModal(loginModal);
    });
    
    // 注册功能
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;
        const avatarPreview = document.getElementById('avatar-preview');
        
        // 验证密码长度
        if (password.length < 8 || password.length > 12) {
            alert('密码必须为8-12位！');
            return;
        }
        
        // 验证密码
        if (password !== confirmPassword) {
            alert('两次输入的密码不一致！');
            return;
        }
        
        // 生成安全代号
        const securityCode = generateSecurityCode();
        
        // 创建新用户
        const newUser = {
            username: username,
            password: password, // 实际项目中应该加密密码
            avatar: avatarPreview.src,
            securityCode: securityCode
        };
        
        // 使用IPC通信保存用户
        window.electron.ipcRenderer.send('add-user', newUser);
        
        // 监听添加用户结果
        window.electron.ipcRenderer.once('add-user-result', (event, result) => {
            if (result.success) {
                // 显示安全代号
                alert(`注册成功！\n请记住您的安全代号：${securityCode}\n用于忘记密码时重置密码`);
                hideModal(registerModal);
                registerForm.reset();
                // 重置头像预览
                avatarPreview.src = 'https://picsum.photos/seed/avatar/100/100';
            } else {
                alert(result.message || '注册失败！');
            }
        });
    });
    
    // 获取当前登录用户
    function getCurrentUser() {
        return JSON.parse(localStorage.getItem('currentUser')) || null;
    }
    
    // 保存当前登录用户
    function saveCurrentUser(user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
    }
    
    // 检查登录状态
    function checkLoginStatus() {
        const currentUser = getCurrentUser();
        if (currentUser) {
            // 已登录，显示用户信息
            usernameDisplay.textContent = currentUser.username;
            userAvatar.src = currentUser.avatar || 'https://picsum.photos/seed/avatar/100/100';
            userInfo.style.display = 'flex';
            authButtons.style.display = 'none';
        } else {
            // 未登录，显示登录注册按钮
            userInfo.style.display = 'none';
            authButtons.style.display = 'flex';
        }
    }
    
    // 注册功能
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;
        const avatarPreview = document.getElementById('avatar-preview');
        
        // 验证密码长度
        if (password.length < 8 || password.length > 12) {
            alert('密码必须为8-12位！');
            return;
        }
        
        // 验证密码
        if (password !== confirmPassword) {
            alert('两次输入的密码不一致！');
            return;
        }
        
        // 检查用户名是否已存在
        const users = getUsers();
        if (users.some(user => user.username === username)) {
            alert('该用户名已被注册！');
            return;
        }
        
        // 生成安全代号
        const securityCode = generateSecurityCode();
        
        // 创建新用户
        const newUser = {
            username: username,
            password: password, // 实际项目中应该加密密码
            avatar: avatarPreview.src,
            securityCode: securityCode
        };
        
        // 保存用户
        users.push(newUser);
        saveUsers(users);
        
        // 显示安全代号
        alert(`注册成功！\n请记住您的安全代号：${securityCode}\n用于忘记密码时重置密码`);
        hideModal(registerModal);
        registerForm.reset();
        // 重置头像预览
        avatarPreview.src = 'https://picsum.photos/seed/avatar/100/100';
    });
    
    // 登录功能
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        
        // 使用IPC通信验证用户
        window.electron.ipcRenderer.send('verify-user', { username, password });
        
        // 监听验证结果
        window.electron.ipcRenderer.once('verify-user-result', (event, result) => {
            if (result.success) {
                // 登录成功
                localStorage.setItem('currentUser', JSON.stringify(result.user));
                checkLoginStatus();
                hideModal(loginModal);
                loginForm.reset();
                alert('登录成功！');
            } else {
                alert(result.message || '用户名或密码错误！');
            }
        });
    });
    
    // 退出登录
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        checkLoginStatus();
        alert('已退出登录！');
    });
    
    // 忘记密码功能
    forgotForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const username = document.getElementById('forgot-username').value;
        const securityCode = document.getElementById('forgot-security-code').value;
        const newPassword = document.getElementById('forgot-new-password').value;
        const confirmPassword = document.getElementById('forgot-confirm-password').value;
        
        // 验证密码长度
        if (newPassword.length < 8 || newPassword.length > 12) {
            alert('密码必须为8-12位！');
            return;
        }
        
        // 验证密码一致性
        if (newPassword !== confirmPassword) {
            alert('两次输入的密码不一致！');
            return;
        }
        
        // 使用IPC通信获取所有用户
        window.electron.ipcRenderer.send('get-users');
        
        // 监听获取用户结果
        window.electron.ipcRenderer.once('users-data', (event, users) => {
            // 查找用户
            const userIndex = users.findIndex(user => 
                user.username === username && user.securityCode === securityCode
            );
            
            if (userIndex !== -1) {
                // 重置密码
                users[userIndex].password = newPassword;
                
                // 保存更新后的用户数据
                // 这里需要重新添加所有用户，因为我们没有单独的更新用户IPC
                // 首先删除所有用户
                users.forEach(user => {
                    window.electron.ipcRenderer.send('delete-user', user.username);
                });
                
                // 然后重新添加所有用户
                let usersAdded = 0;
                users.forEach(user => {
                    window.electron.ipcRenderer.send('add-user', user);
                    window.electron.ipcRenderer.once('add-user-result', () => {
                        usersAdded++;
                        if (usersAdded === users.length) {
                            // 所有用户添加完成
                            alert('密码重置成功！请使用新密码登录');
                            hideModal(forgotModal);
                            forgotForm.reset();
                            showModal(loginModal);
                        }
                    });
                });
            } else {
                alert('用户名或安全代号错误！');
            }
        });
    });
    
    // 注销账户
    deleteAccountBtn.addEventListener('click', () => {
        if (confirm('确定要注销账户吗？此操作不可恢复！')) {
            const currentUser = getCurrentUser();
            if (currentUser) {
                // 使用IPC通信删除用户
                window.electron.ipcRenderer.send('delete-user', currentUser.username);
                
                // 监听删除结果
                window.electron.ipcRenderer.once('delete-user-result', (event, result) => {
                    if (result.success) {
                        // 清除当前登录状态
                        localStorage.removeItem('currentUser');
                        checkLoginStatus();
                        alert('账户已成功注销！');
                    } else {
                        alert('注销失败！');
                    }
                });
            }
        }
    });
    
    // 初始化登录状态
    checkLoginStatus();
});