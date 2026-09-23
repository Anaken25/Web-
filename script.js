/* ============================================================
   SCRIPT.JS — вся интерактивность сайта
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ========== 1. ШАПКА ПРИ СКРОЛЛЕ ========== */
  const header = document.getElementById('header');
  const upBtn = document.getElementById('upBtn');

  function onScroll() {
    const y = window.scrollY;
    if (header) header.classList.toggle('scrolled', y > 40);
    if (upBtn) upBtn.classList.toggle('show', y > 500);
  }
  window.addEventListener('scroll', onScroll);
  onScroll();

  /* ========== 2. МОБИЛЬНОЕ МЕНЮ ========== */
  const burger = document.getElementById('burger');
  const menu = document.getElementById('menu');

  if (burger && menu) {
    burger.addEventListener('click', function (e) {
      e.stopPropagation();
      menu.classList.toggle('active');
      burger.textContent = menu.classList.contains('active') ? '✕' : '☰';
    });

    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        menu.classList.remove('active');
        if (burger) burger.textContent = '☰';
      });
    });

    document.addEventListener('click', function (e) {
      if (menu.classList.contains('active') &&
          !menu.contains(e.target) &&
          e.target !== burger) {
        menu.classList.remove('active');
        burger.textContent = '☰';
      }
    });
  }

  /* ========== 3. АНИМАЦИИ ПРИ СКРОЛЛЕ ========== */
  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('active'); });
  }

  /* ========== 4. СЧЁТЧИКИ ЦИФР В HERO ========== */
  const counters = document.querySelectorAll('.stat-num[data-count]');

  function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1500;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(tick);
  }

  if (counters.length && 'IntersectionObserver' in window) {
    const counterIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { counterIO.observe(c); });
  } else {
    counters.forEach(function (c) {
      c.textContent = c.dataset.count + (c.dataset.suffix || '');
    });
  }

  /* ========== 5. ФИЛЬТРЫ ПОРТФОЛИО ========== */
  const filters = document.querySelectorAll('.filter');
  const cases = document.querySelectorAll('.case');

  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filters.forEach(function (f) { f.classList.remove('active'); });
      btn.classList.add('active');

      const cat = btn.dataset.filter;
      cases.forEach(function (card) {
        const show = (cat === 'all' || card.dataset.cat === cat);
        card.classList.toggle('hidden', !show);
      });
    });
  });

  /* ========== 6. МОДАЛЬНОЕ ОКНО КЕЙСОВ ========== */
  const modal = document.getElementById('modal');
  const modalClose = document.getElementById('modalClose');
  const modalHero = document.getElementById('modalHero');
  const modalTag = document.getElementById('modalTag');
  const modalTitle = document.getElementById('modalTitle');
  const modalTask = document.getElementById('modalTask');
  const modalSolution = document.getElementById('modalSolution');
  const modalResults = document.getElementById('modalResults');
  const modalStack = document.getElementById('modalStack');
  const modalCta = document.getElementById('modalCta');

  function openModal(card) {
    const d = card.dataset;

    if (modalHero) {
      modalHero.className = 'modal-hero ' + (d.preview || 'p1');
      modalHero.textContent = d.title || '';
    }
    if (modalTag) modalTag.textContent = d.tag || '';
    if (modalTitle) modalTitle.textContent = d.title || '';
    if (modalTask) modalTask.textContent = d.task || '';
    if (modalSolution) modalSolution.textContent = d.solution || '';

    if (modalResults) {
      modalResults.innerHTML = '';
      [d.r1, d.r2, d.r3].forEach(function (r) {
        if (!r) return;
        const parts = r.split('|');
        const div = document.createElement('div');
        div.className = 'modal-result';
        div.innerHTML = '<div class="num">' + (parts[0] || '') +
                        '</div><div class="lbl">' + (parts[1] || '') + '</div>';
        modalResults.appendChild(div);
      });
    }

    if (modalStack) {
      modalStack.innerHTML = '';
      (d.stack || '').split(',').forEach(function (s) {
        const t = s.trim();
        if (!t) return;
        const span = document.createElement('span');
        span.textContent = t;
        modalStack.appendChild(span);
      });
    }

    if (modal) modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (modal) modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  cases.forEach(function (card) {
    card.addEventListener('click', function () { openModal(card); });
  });

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeModal();
    });
  }
  if (modalCta) {
    modalCta.addEventListener('click', closeModal);
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });

  /* ========== 7. КАЛЬКУЛЯТОР ========== */
  const calcPrice = document.getElementById('calcPrice');
  const calcTime = document.getElementById('calcTime');
  const calcGroups = document.querySelectorAll('.calc-options');

  function updateCalc() {
    let total = 0;
    let days = 0;
    calcGroups.forEach(function (group) {
      const active = group.querySelector('.calc-opt.active');
      if (active) {
        total += parseInt(active.dataset.price, 10) || 0;
        days += parseInt(active.dataset.days, 10) || 0;
      }
    });
    if (calcPrice) calcPrice.textContent = total.toLocaleString('ru-RU') + ' ₽';
    if (calcTime) calcTime.textContent = 'Срок: ~' + days + ' дней';
  }

  calcGroups.forEach(function (group) {
    group.querySelectorAll('.calc-opt').forEach(function (opt) {
      opt.addEventListener('click', function () {
        group.querySelectorAll('.calc-opt').forEach(function (o) {
          o.classList.remove('active');
        });
        opt.classList.add('active');
        updateCalc();
      });
    });
  });
  updateCalc();

  /* ========== 8. FAQ АККОРДЕОН ========== */
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(function (item) {
    const q = item.querySelector('.faq-q');
    if (!q) return;
    q.addEventListener('click', function () {
      const isOpen = item.classList.contains('open');
      faqItems.forEach(function (i) { i.classList.remove('open'); });
      if (!isOpen) item.classList.add('open');
    });
  });

  /* ========== 9. ФОРМА ЗАЯВКИ ========== */
  const form = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');

  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const name = form.querySelector('[name="name"]');
      const contact = form.querySelector('[name="contact"]');
      const agree = form.querySelector('[name="agree"]');

      if (!name || !name.value.trim()) {
        showStatus('Пожалуйста, укажите имя', 'error');
        return;
      }
      if (!contact || !contact.value.trim()) {
        showStatus('Укажите email или телефон', 'error');
        return;
      }
      if (agree && !agree.checked) {
        showStatus('Подтвердите согласие с политикой конфиденциальности', 'error');
        return;
      }

      const action = form.getAttribute('action') || '';
      if (action.includes('formspree.io') && !action.includes('ВАШ_КОД')) {
        try {
          const btn = form.querySelector('button[type="submit"]');
          const originalText = btn.textContent;
          btn.textContent = 'Отправка...';
          btn.disabled = true;

          const response = await fetch(action, {
            method: 'POST',
            body: new FormData(form),
            headers: { 'Accept': 'application/json' }
          });

          btn.textContent = originalText;
          btn.disabled = false;

          if (response.ok) {
            showStatus('Спасибо, ' + name.value.trim() + '! Заявка отправлена — свяжусь в течение часа.', 'success');
            form.reset();
          } else {
            showStatus('Ошибка отправки. Напишите в Telegram или на почту.', 'error');
          }
        } catch (err) {
          showStatus('Ошибка сети. Напишите в Telegram или на почту.', 'error');
        }
      } else {
        showStatus('Спасибо, ' + name.value.trim() + '! Заявка принята. (Подключите Formspree, чтобы получать заявки)', 'success');
        form.reset();
      }
    });
  }

  function showStatus(text, type) {
    if (!formStatus) return;
    formStatus.textContent = text;
    formStatus.className = 'form-status ' + type;
    setTimeout(function () { formStatus.className = 'form-status'; }, 8000);
  }

  /* ========== 10. КНОПКА «ВВЕРХ» ========== */
  if (upBtn) {
    upBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ========== 11. ПЛАВНЫЙ СКРОЛЛ ПО ЯКОРЯМ ========== */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      const href = link.getAttribute('href');
      if (href === '#' || href.length < 2) return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

  /* ========== 12. ПЕРЕКЛЮЧАТЕЛЬ ТЕМЫ ========== */
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      themeToggle.textContent = '☀️';
    }
    themeToggle.addEventListener('click', function () {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      if (isDark) {
        document.documentElement.removeAttribute('data-theme');
        themeToggle.textContent = '🌙';
        localStorage.setItem('theme', 'light');
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.textContent = '☀️';
        localStorage.setItem('theme', 'dark');
      }
    });
  }

});