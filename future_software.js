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