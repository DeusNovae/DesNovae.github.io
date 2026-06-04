/* ========================================
   中国生命科学工具公司创业指南 - 交互脚本
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* ---- 导航栏滚动效果 ---- */
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    function onScroll() {
        // 导航栏阴影
        navbar.classList.toggle('scrolled', window.scrollY > 40);

        // 返回顶部按钮
        const btn = document.getElementById('backToTop');
        if (btn) {
            btn.classList.toggle('visible', window.scrollY > 600);
        }

        // 高亮当前section对应的导航项
        const sections = document.querySelectorAll('.section, .hero');
        const navLinks = document.querySelectorAll('.nav-menu a');
        let currentId = '';
        sections.forEach(sec => {
            const top = sec.offsetTop - 120;
            if (window.scrollY >= top) {
                currentId = sec.id;
            }
        });
        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === '#' + currentId);
        });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ---- 移动端菜单切换 ---- */
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('open');
        });
        // 点击导航链接后关闭菜单
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('open');
            });
        });
    }

    /* ---- 返回顶部 ---- */
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* ---- 滚动入场动画（Intersection Observer） ---- */
    const animateCards = () => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -40px 0px'
        });

        document.querySelectorAll('.card-animate').forEach(el => {
            observer.observe(el);
        });
    };
    animateCards();

    /* ---- Hero 粒子背景 ---- */
    const particlesEl = document.getElementById('particles');
    if (particlesEl) {
        const canvas = document.createElement('canvas');
        canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
        particlesEl.appendChild(canvas);
        const ctx = canvas.getContext('2d');

        function resize() {
            canvas.width = particlesEl.offsetWidth;
            canvas.height = particlesEl.offsetHeight;
        }
        resize();
        window.addEventListener('resize', resize);

        const particles = Array.from({ length: 50 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 2.5 + 0.8,
            dx: (Math.random() - 0.5) * 0.4,
            dy: (Math.random() - 0.5) * 0.4,
            alpha: Math.random() * 0.4 + 0.1,
        }));

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.x += p.dx;
                p.y += p.dy;
                if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
                ctx.fill();
            });

            // 连线
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 140) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(255,255,255,${0.08 * (1 - dist / 140)})`;
                        ctx.lineWidth = 0.6;
                        ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(draw);
        }
        draw();
    }

    /* ---- 表格排序（简易版） ---- */
    document.querySelectorAll('.data-table').forEach(table => {
        const ths = table.querySelectorAll('thead th');
        ths.forEach((th, idx) => {
            th.style.cursor = 'pointer';
            th.title = '点击排序';
            th.addEventListener('click', () => {
                sortTable(table, idx);
            });
        });
    });

    function sortTable(table, colIdx) {
        const tbody = table.querySelector('tbody');
        if (!tbody) return;
        const rows = Array.from(tbody.rows);
        const asc = table.dataset.sortCol != colIdx || table.dataset.sortDir !== 'asc';
        table.dataset.sortCol = colIdx;
        table.dataset.sortDir = asc ? 'asc' : 'desc';

        rows.sort((a, b) => {
            let va = a.cells[colIdx]?.innerText.trim() || '';
            let vb = b.cells[colIdx]?.innerText.trim() || '';
            // 尝试数字排序
            const na = parseFloat(va.replace(/[^0-9.\-]/g, ''));
            const nb = parseFloat(vb.replace(/[^0-9.\-]/g, ''));
            if (!isNaN(na) && !isNaN(nb)) {
                return asc ? na - nb : nb - na;
            }
            return asc ? va.localeCompare(vb, 'zh') : vb.localeCompare(va, 'zh');
        });
        rows.forEach(r => tbody.appendChild(r));

        // 更新箭头指示
        table.querySelectorAll('thead th').forEach((th, i) => {
            th.textContent = th.textContent.replace(/ [↑↓]$/, '');
            if (i === colIdx) {
                th.textContent += asc ? ' ↑' : ' ↓';
            }
        });
    }

    /* ---- 平滑滚动（兼容不支持CSS scroll-behavior的浏览器） ---- */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (!targetId || targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const top = target.offsetTop - parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 64;
                window.scrollTo({ top: top - 20, behavior: 'smooth' });
            }
        });
    });

    console.log('🧬 中国生命科学工具公司创业指南 - 脚本加载完成');
});
