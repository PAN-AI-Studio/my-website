/* ============================================
   个人开发者网站 - 交互脚本
   ============================================ */

(function () {
  'use strict';

  /* ---------- 主题切换 ---------- */
  const THEME_KEY = 'site-theme';
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');

  // 读取保存的主题，默认深色
  function getTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
    return 'dark';
  }

  // 应用主题
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (themeIcon) {
      themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
    localStorage.setItem(THEME_KEY, theme);
  }

  // 初始化
  applyTheme(getTheme());

  // 切换按钮
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
    });
  }

  /* ---------- 移动端导航 ---------- */
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      navLinks.classList.toggle('open');
    });

    // 点击链接后关闭菜单
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
      });
    });

    // 点击外部关闭菜单
    document.addEventListener('click', function (e) {
      if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('open');
      }
    });
  }

  /* ---------- 当前页面高亮 ---------- */
  function highlightCurrentNav() {
    var path = window.location.pathname;
    var page = path.split('/').pop() || 'index.html';

    var links = document.querySelectorAll('.nav-links a');
    links.forEach(function (link) {
      var href = link.getAttribute('href');
      if (href === page || (page === '' && href === 'index.html')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  highlightCurrentNav();

  /* ---------- 滚动时导航背景加深 ---------- */
  var nav = document.querySelector('.nav');
  if (nav) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 20) {
        nav.style.boxShadow = '0 1px 4px rgba(0,0,0,0.2)';
      } else {
        nav.style.boxShadow = 'none';
      }
    });
  }

  /* ---------- Hero 入场动画 ---------- */
  function initHeroAnimation() {
    var hero = document.querySelector('.hero');
    if (!hero) return;

    var label = hero.querySelector('.section-label');
    var title = hero.querySelector('h1');
    var subtitle = hero.querySelector('.subtitle');
    var actions = hero.querySelector('.hero-actions');

    if (label) { label.classList.add('hero-anim'); }
    if (title) { title.classList.add('hero-anim', 'hero-anim-delay-1'); }
    if (subtitle) { subtitle.classList.add('hero-anim', 'hero-anim-delay-2'); }
    if (actions) { actions.classList.add('hero-anim', 'hero-anim-delay-3'); }
  }

  initHeroAnimation();

  /* ---------- 滚动显现动画（Intersection Observer） ---------- */
  function initScrollReveal() {
    // 给需要动画的元素打上标记
    var targets = document.querySelectorAll(
      '.section-head, .software-card, .about-preview, .contact-cta, .card-glass, .timeline-item'
    );

    targets.forEach(function (el, i) {
      el.classList.add('reveal');
      // 同行元素错开延迟
      if (el.closest('.software-grid')) {
        var siblings = el.parentElement.querySelectorAll('.software-card');
        var idx = Array.prototype.indexOf.call(siblings, el);
        el.classList.add('reveal-delay-' + (idx + 1));
      }
    });

    if (!('IntersectionObserver' in window)) {
      // 不支持就全显示
      targets.forEach(function (el) { el.classList.add('visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -30px 0px'
    });

    targets.forEach(function (el) { observer.observe(el); });
  }

  initScrollReveal();

  /* ---------- 侧边目录导航（滚动高亮） ---------- */
  function initSideToc() {
    var dots = document.querySelectorAll('.side-toc-dot');
    if (!dots.length) return;

    var sections = [];
    dots.forEach(function (dot) {
      var targetId = dot.getAttribute('data-target');
      var el = document.getElementById(targetId);
      if (el) sections.push({ dot: dot, el: el });
    });

    // 点击跳转
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var targetId = dot.getAttribute('data-target');
        var el = document.getElementById(targetId);
        if (el) {
          var top = el.getBoundingClientRect().top + window.pageYOffset - 80;
          window.scrollTo({ top: top, behavior: 'smooth' });
        }
      });
    });

    // 滚动时更新激活状态
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          updateActiveDot(sections);
          ticking = false;
        });
        ticking = true;
      }
    });

    function updateActiveDot(sections) {
      var scrollBottom = window.scrollY + window.innerHeight - 100;
      var activeIndex = 0;

      for (var i = sections.length - 1; i >= 0; i--) {
        if (sections[i].el.offsetTop <= scrollBottom) {
          activeIndex = i;
          break;
        }
      }

      dots.forEach(function (d, i) {
        d.classList.toggle('active', i === activeIndex);
      });
    }

    updateActiveDot(sections);
  }

  initSideToc();

  /* ---------- 按钮点击波纹 ---------- */
  function initRipple() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.btn');
      if (!btn) return;

      var ripple = document.createElement('span');
      ripple.className = 'btn-ripple';

      var rect = btn.getBoundingClientRect();
      var size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';

      btn.appendChild(ripple);

      ripple.addEventListener('animationend', function () {
        ripple.remove();
      });
    });
  }

  initRipple();

  /* ---------- 卡片 3D 倾斜 ---------- */
  function initCardTilt() {
    var cards = document.querySelectorAll('.software-card:not(.software-card-ghost)');

    cards.forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = 'perspective(800px) rotateY(' + (x * 4) + 'deg) rotateX(' + (-y * 4) + 'deg) translateY(-4px)';
      });

      card.addEventListener('mouseleave', function () {
        card.style.transform = 'perspective(800px) rotateY(0) rotateX(0) translateY(0)';
      });
    });
  }

  initCardTilt();

  /* ---------- Hero 装饰圆环视差 ---------- */
  function initHeroParallax() {
    var decos = document.querySelectorAll('.hero-deco');
    if (!decos.length) return;

    var hero = document.querySelector('.hero');
    if (!hero) return;

    window.addEventListener('scroll', function () {
      var heroRect = hero.getBoundingClientRect();
      if (heroRect.bottom < 0 || heroRect.top > window.innerHeight) return;

      var scrollRatio = -heroRect.top / (heroRect.height + window.innerHeight);
      scrollRatio = Math.max(-0.3, Math.min(0.3, scrollRatio));

      if (decos[0]) decos[0].style.transform = 'translateY(' + (scrollRatio * 30) + 'px)';
      if (decos[1]) decos[1].style.transform = 'translateY(' + (scrollRatio * -20) + 'px) translateX(' + (scrollRatio * 10) + 'px)';
    });
  }

  initHeroParallax();

  /* ---------- 数字递增动画 ---------- */
  function initCountUp() {
    var nums = document.querySelectorAll('.count-up');
    if (!nums.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseInt(el.getAttribute('data-count'), 10);
        var duration = 1200;
        var start = performance.now();

        function tick(now) {
          var elapsed = now - start;
          var progress = Math.min(elapsed / duration, 1);
          // ease-out
          progress = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.floor(progress * target);
          if (progress < 1) {
            requestAnimationFrame(tick);
          } else {
            el.textContent = target;
          }
        }

        requestAnimationFrame(tick);
        observer.unobserve(el);
      });
    }, { threshold: 0.5 });

    nums.forEach(function (n) { observer.observe(n); });
  }

  initCountUp();

  /* ---------- 丝滑全屏翻页 ---------- */
  function initSmoothScroll() {
    var screens = document.querySelectorAll('.screen');
    if (screens.length < 2) return;

    var isScrolling = false;
    var touchStartY = 0;

    function getCurrentIndex() {
      var center = window.scrollY + window.innerHeight / 2;
      for (var i = screens.length - 1; i >= 0; i--) {
        if (screens[i].offsetTop <= center) return i;
      }
      return 0;
    }

    function scrollToScreen(index) {
      if (index < 0 || index >= screens.length) return;
      isScrolling = true;
      var target = screens[index];
      var top = target.offsetTop - 1; // -1px 防边界抖动
      window.scrollTo({ top: top, behavior: 'smooth' });
      setTimeout(function () { isScrolling = false; }, 800);
    }

    // 鼠标滚轮
    window.addEventListener('wheel', function (e) {
      if (isScrolling) { e.preventDefault(); return; }
      var current = getCurrentIndex();
      if (e.deltaY > 30 && current < screens.length - 1) {
        e.preventDefault();
        scrollToScreen(current + 1);
      } else if (e.deltaY < -30 && current > 0) {
        e.preventDefault();
        scrollToScreen(current - 1);
      }
    }, { passive: false });

    // 触摸滑动
    window.addEventListener('touchstart', function (e) {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchend', function (e) {
      if (isScrolling) return;
      var diff = touchStartY - e.changedTouches[0].clientY;
      var current = getCurrentIndex();
      if (diff > 50 && current < screens.length - 1) {
        scrollToScreen(current + 1);
      } else if (diff < -50 && current > 0) {
        scrollToScreen(current - 1);
      }
    });

    // 键盘上下键
    window.addEventListener('keydown', function (e) {
      if (isScrolling) return;
      var current = getCurrentIndex();
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        if (current < screens.length - 1) { e.preventDefault(); scrollToScreen(current + 1); }
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        if (current > 0) { e.preventDefault(); scrollToScreen(current - 1); }
      }
    });
  }

  initSmoothScroll();

  /* ---------- Hero 鼠标跟随光斑 ---------- */
  /* ---------- 鼠标粒子跟随（Hero 区域） ---------- */
  function initCursorParticles() {
    var hero = document.querySelector('.hero');
    if (!hero) return;

    var lastSpawn = 0;
    var particles = [];

    document.addEventListener('mousemove', function (e) {
      var hr = hero.getBoundingClientRect();
      var inHero = e.clientX > hr.left && e.clientX < hr.right &&
                   e.clientY > hr.top && e.clientY < hr.bottom;
      if (!inHero) return;

      var now = performance.now();
      if (now - lastSpawn < 25) return; // 每25ms生成一个粒子
      lastSpawn = now;

      var p = document.createElement('div');
      p.className = 'cursor-particle';
      var size = 2 + Math.random() * 3;
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.left = e.clientX + 'px';
      p.style.top = e.clientY + 'px';
      p.style.setProperty('--dx', (Math.random() - 0.5) * 40 + 'px');
      p.style.setProperty('--dy', (Math.random() - 0.5) * 40 + 'px');
      document.body.appendChild(p);
      particles.push(p);

      // 动画结束后清理
      setTimeout(function () {
        if (p.parentNode) p.parentNode.removeChild(p);
      }, 800);

      // 保持粒子总数
      if (particles.length > 80) {
        var old = particles.shift();
        if (old && old.parentNode) old.parentNode.removeChild(old);
      }
    });
  }

  initCursorParticles();

  /* ---------- 漂浮粒子生成 ---------- */
  function spawnParticles(containerId, count) {
    var container = document.getElementById(containerId);
    if (!container) return;

    for (var i = 0; i < count; i++) {
      var particle = document.createElement('span');
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDuration = (4 + Math.random() * 8) + 's';
      particle.style.animationDelay = Math.random() * 6 + 's';
      particle.style.width = (1 + Math.random() * 2) + 'px';
      particle.style.height = particle.style.width;
      container.appendChild(particle);
    }
  }

  spawnParticles('hero-particles', 20);
  spawnParticles('software-particles', 15);
  spawnParticles('about-particles', 12);
  spawnParticles('contact-particles', 18);

  /* ---------- 软件板块数据流 ---------- */
  function spawnDataStreams() {
    var section = document.getElementById('section-software');
    if (!section) return;

    for (var i = 0; i < 8; i++) {
      var stream = document.createElement('div');
      stream.className = 'data-stream';
      stream.style.left = (5 + Math.random() * 90) + '%';
      stream.style.height = (60 + Math.random() * 200) + 'px';
      stream.style.animationDuration = (2 + Math.random() * 4) + 's';
      stream.style.animationDelay = Math.random() * 3 + 's';
      section.appendChild(stream);
    }
  }

  spawnDataStreams();

})();