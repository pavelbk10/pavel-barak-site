/* ===========================================
   PAVEL BARAK — Interactivity & Animations
   =========================================== */
(function () {
    'use strict';

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- Current year ---------- */
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* ---------- Header scroll state ---------- */
    const header = document.getElementById('header');
    const onScroll = () => {
        if (window.scrollY > 40) header.classList.add('scrolled');
        else header.classList.remove('scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ---------- Mobile nav toggle ---------- */
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    if (navToggle && navMenu) {
        const closeMenu = () => {
            navMenu.classList.remove('open');
            navToggle.classList.remove('open');
            navToggle.setAttribute('aria-expanded', 'false');
            navToggle.setAttribute('aria-label', 'פתח תפריט');
        };
        navToggle.addEventListener('click', () => {
            const open = navMenu.classList.toggle('open');
            navToggle.classList.toggle('open', open);
            navToggle.setAttribute('aria-expanded', String(open));
            navToggle.setAttribute('aria-label', open ? 'סגור תפריט' : 'פתח תפריט');
        });
        navMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
        document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
    }

    /* ---------- Reveal on scroll ---------- */
    const reveals = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window && !prefersReduced) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
        reveals.forEach(el => io.observe(el));
    } else {
        reveals.forEach(el => el.classList.add('visible'));
    }

    /* ---------- Animated counters ---------- */
    const counters = document.querySelectorAll('.stat-num[data-target]');
    const runCounter = (el) => {
        const target = +el.dataset.target;
        const dur = 1600;
        const start = performance.now();
        const step = (now) => {
            const p = Math.min((now - start) / dur, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.floor(eased * target);
            if (p < 1) requestAnimationFrame(step);
            else el.textContent = target;
        };
        requestAnimationFrame(step);
    };
    if ('IntersectionObserver' in window && !prefersReduced) {
        const cio = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) { runCounter(entry.target); cio.unobserve(entry.target); }
            });
        }, { threshold: 0.5 });
        counters.forEach(c => cio.observe(c));
    } else {
        counters.forEach(c => { c.textContent = c.dataset.target; });
    }

    /* ---------- Particle background ---------- */
    const canvas = document.getElementById('particles');
    if (canvas && !prefersReduced) {
        const ctx = canvas.getContext('2d');
        let w, h, particles;
        const colors = ['#7b2ff7', '#00d4ff', '#00ffa3', '#ff2f87'];

        const resize = () => {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
            const count = Math.min(70, Math.floor(w / 22));
            particles = Array.from({ length: count }, () => ({
                x: Math.random() * w,
                y: Math.random() * h,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                r: Math.random() * 1.8 + 0.6,
                c: colors[Math.floor(Math.random() * colors.length)]
            }));
        };

        const draw = () => {
            ctx.clearRect(0, 0, w, h);
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0 || p.x > w) p.vx *= -1;
                if (p.y < 0 || p.y > h) p.vy *= -1;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = p.c;
                ctx.globalAlpha = 0.7;
                ctx.fill();
                // connect close particles
                for (let j = i + 1; j < particles.length; j++) {
                    const q = particles[j];
                    const dx = p.x - q.x, dy = p.y - q.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 130) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(q.x, q.y);
                        ctx.strokeStyle = p.c;
                        ctx.globalAlpha = (1 - dist / 130) * 0.18;
                        ctx.lineWidth = 0.6;
                        ctx.stroke();
                    }
                }
            }
            ctx.globalAlpha = 1;
            requestAnimationFrame(draw);
        };

        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(resize, 200);
        });
        resize();
        draw();
    }

    /* ---------- Contact form validation ---------- */
    const form = document.getElementById('contactForm');
    if (form) {
        const success = document.getElementById('formSuccess');

        const showError = (input, msg) => {
            const group = input.closest('.form-group');
            group.classList.add('invalid');
            const err = group.querySelector('.form-error');
            if (err) err.textContent = msg;
            input.setAttribute('aria-invalid', 'true');
        };
        const clearError = (input) => {
            const group = input.closest('.form-group');
            group.classList.remove('invalid');
            const err = group.querySelector('.form-error');
            if (err) err.textContent = '';
            input.removeAttribute('aria-invalid');
        };

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            let valid = true;
            const name = form.name;
            const phone = form.phone;

            if (!name.value.trim()) { showError(name, 'נא להזין שם'); valid = false; }
            else clearError(name);

            const phoneClean = phone.value.replace(/[\s-]/g, '');
            if (!/^0\d{8,9}$/.test(phoneClean)) {
                showError(phone, 'נא להזין מספר טלפון תקין');
                valid = false;
            } else clearError(phone);

            if (valid) {
                success.hidden = false;
                form.reset();
                // Optional: open WhatsApp with prefilled details
                const msg = encodeURIComponent(
                    `היי פאבל, שמי ${name.value}. מעניין אותי: ${form.service.value}. ${form.message.value}`
                );
                setTimeout(() => {
                    window.open('https://wa.me/972528388022?text=' + msg, '_blank', 'noopener');
                }, 800);
            }
        });

        form.querySelectorAll('input').forEach(inp => {
            inp.addEventListener('input', () => clearError(inp));
        });
    }

    /* ---------- Accessibility widget ---------- */
    const buildA11y = () => {
        const btn = document.createElement('button');
        btn.className = 'a11y-btn';
        btn.setAttribute('aria-label', 'אפשרויות נגישות');
        btn.innerHTML = '<span aria-hidden="true">♿</span>';

        const panel = document.createElement('div');
        panel.className = 'a11y-panel';
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-label', 'תפריט נגישות');
        panel.hidden = true;
        panel.innerHTML = `
            <h3>נגישות</h3>
            <button data-act="contrast">ניגודיות גבוהה</button>
            <button data-act="bigtext">הגדל טקסט</button>
            <button data-act="links">הדגש קישורים</button>
            <button data-act="motion">עצור אנימציות</button>
            <button data-act="reset">איפוס</button>
            <a href="accessibility.html" class="a11y-statement">להצהרת הנגישות המלאה</a>
        `;

        document.body.appendChild(btn);
        document.body.appendChild(panel);

        const saved = JSON.parse(localStorage.getItem('a11y') || '{}');
        const apply = () => {
            document.body.classList.toggle('high-contrast', !!saved.contrast);
            document.body.classList.toggle('big-text', !!saved.bigtext);
            document.body.classList.toggle('highlight-links', !!saved.links);
            document.body.classList.toggle('no-motion', !!saved.motion);
            localStorage.setItem('a11y', JSON.stringify(saved));
        };
        apply();

        btn.addEventListener('click', () => {
            panel.hidden = !panel.hidden;
        });

        panel.addEventListener('click', (e) => {
            const act = e.target.dataset.act;
            if (!act) return;
            if (act === 'reset') {
                Object.keys(saved).forEach(k => delete saved[k]);
            } else {
                saved[act] = !saved[act];
            }
            apply();
        });

        document.addEventListener('click', (e) => {
            if (!panel.hidden && !panel.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
                panel.hidden = true;
            }
        });
        document.addEventListener('keydown', e => { if (e.key === 'Escape') panel.hidden = true; });
    };
    buildA11y();

})();
