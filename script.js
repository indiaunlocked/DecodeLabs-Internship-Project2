/* ============================================================
   GreenRoots Plant Nursery — script.js
   Vanilla JavaScript | No Frameworks | ES6+
   Features:
     1. Mobile nav toggle (aria, keyboard, outside-click)
     2. Header scroll shadow
     3. Active nav link highlight (IntersectionObserver)
     4. Scroll-reveal animations (IntersectionObserver)
     5. Plant category filter
     6. Add-to-cart with toast notification + cart count
     7. Back-to-top button
     8. Smooth anchor scrolling
     9. Resize handler
   ============================================================ */

'use strict';

/* ── 1. DOM References ───────────────────────────────────── */
const header      = document.getElementById('site-header');
const navToggle   = document.getElementById('nav-toggle');
const navMenu     = document.getElementById('nav-menu');
const navLinks    = document.querySelectorAll('.nav-link');
const sections    = document.querySelectorAll('main section[id]');
const backToTop   = document.getElementById('back-to-top');
const filterBtns  = document.querySelectorAll('.filter-btn');
const plantItems  = document.querySelectorAll('.plant-item');

/* ── 2. App State ────────────────────────────────────────── */
const state = {
  menuOpen:      false,
  scrolled:      false,
  activeSection: '',
};

/* ── 3. Utility: debounce ────────────────────────────────── */
function debounce(fn, ms = 120) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

/* ── 4. Mobile Navigation ────────────────────────────────── */
function openMenu() {
  state.menuOpen = true;
  navMenu.classList.add('open');
  navToggle.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  state.menuOpen = false;
  navMenu.classList.remove('open');
  navToggle.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

navToggle.addEventListener('click', () => {
  state.menuOpen ? closeMenu() : openMenu();
});

// Close when a nav link is clicked
navLinks.forEach(link => link.addEventListener('click', () => {
  if (state.menuOpen) closeMenu();
}));

// Close on outside tap/click
document.addEventListener('click', (e) => {
  if (
    state.menuOpen &&
    !navMenu.contains(e.target) &&
    !navToggle.contains(e.target)
  ) closeMenu();
});

// Close on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && state.menuOpen) {
    closeMenu();
    navToggle.focus();
  }
});

/* ── 5. Header Scroll Shadow ─────────────────────────────── */
function onScroll() {
  const y = window.scrollY;

  // Header shadow
  if (y > 24 && !state.scrolled) {
    header.classList.add('scrolled');
    state.scrolled = true;
  } else if (y <= 24 && state.scrolled) {
    header.classList.remove('scrolled');
    state.scrolled = false;
  }

  // Back-to-top visibility
  if (y > 400) {
    backToTop.classList.add('visible');
  } else {
    backToTop.classList.remove('visible');
  }

  updateActiveNav();
}

/* ── 6. Active Nav Link ──────────────────────────────────── */
function updateActiveNav() {
  const mid = window.scrollY + window.innerHeight / 3;
  let current = '';

  sections.forEach(sec => {
    if (mid >= sec.offsetTop && mid < sec.offsetTop + sec.offsetHeight) {
      current = sec.id;
    }
  });

  if (current === state.activeSection) return;
  state.activeSection = current;

  navLinks.forEach(link => {
    const href = link.getAttribute('href').replace('#', '');
    if (href === current) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'true');
    } else {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
    }
  });
}

// RAF-throttled scroll listener
let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => { onScroll(); ticking = false; });
    ticking = true;
  }
}, { passive: true });

/* ── 7. Scroll Reveal (IntersectionObserver) ─────────────── */
const revealTargets = document.querySelectorAll(
  '.plant-item, .service-card, .tip-card, .testimonial-card, ' +
  '.about-grid, .q-card, .value-chip, .hero-trust'
);

revealTargets.forEach((el, i) => {
  el.classList.add('reveal');
  el.style.transitionDelay = `${(i % 4) * 0.07}s`;
});

const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

revealTargets.forEach(el => revealObs.observe(el));

/* ── 8. Plant Category Filter ────────────────────────────── */
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Update button states
    filterBtns.forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');

    const filter = btn.dataset.filter;

    // Show/hide plant items with a small stagger
    plantItems.forEach((item, i) => {
      const match = filter === 'all' || item.dataset.category === filter;

      if (match) {
        // Remove hidden with a tiny delay for stagger effect
        setTimeout(() => {
          item.classList.remove('hidden');
          item.style.animationDelay = `${i * 0.05}s`;
        }, i * 40);
      } else {
        item.classList.add('hidden');
      }
    });
  });
});


/* ── 10. Back to Top ─────────────────────────────────────── */
backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ── 11. Smooth Scroll for Anchor Links ─────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const id = this.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;

    e.preventDefault();
    const offset = header.offsetHeight + 16;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;

    window.scrollTo({ top, behavior: 'smooth' });

    // Accessibility: move focus to section
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
  });
});

/* ── 12. Resize Handler ──────────────────────────────────── */
const onResize = debounce(() => {
  if (window.innerWidth >= 768 && state.menuOpen) closeMenu();
}, 200);

window.addEventListener('resize', onResize);

/* ── 13. Initialisation ──────────────────────────────────── */
function init() {
  onScroll();

  // Reveal elements already in viewport on load
  revealTargets.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92) {
      el.classList.add('visible');
    }
  });

  // Console signature
  console.log(
    '%c 🌿 GreenRoots Plant Nursery ',
    'background:#2d5a3d; color:#fff; font-family:serif; padding:4px 10px; border-radius:4px;'
  );
  console.log(
    '%c Built with HTML5 · CSS3 · Vanilla JS | DecodeLabs Project 1 ✓',
    'color:#4a7c59;'
  );
}

document.addEventListener('DOMContentLoaded', init);


/* ============================================================
   PROJECT 2 — Backend API Development
   Mock REST API with GET / POST endpoints, input validation
   ============================================================ */

/* ── Plant Database (mock server-side data store) ─────────── */
const PLANT_DB = [
  { id: 1, name: 'Monstera Deliciosa', category: 'indoor',     price: 649, care: 'Easy',      inStock: true,  tag: 'Bestseller' },
  { id: 2, name: 'Peace Lily',          category: 'indoor',     price: 399, care: 'Easy',      inStock: true,  tag: 'Air Purifier' },
  { id: 3, name: 'Echeveria Rosette',   category: 'succulents', price: 199, care: 'Very Easy', inStock: true,  tag: 'Trending' },
  { id: 4, name: 'Bougainvillea',       category: 'outdoor',    price: 549, care: 'Moderate',  inStock: true,  tag: '' },
  { id: 5, name: 'Tulsi — Holy Basil',  category: 'herbs',      price: 149, care: 'Easy',      inStock: true,  tag: 'Popular' },
  { id: 6, name: 'Aloe Vera',           category: 'succulents', price: 249, care: 'Very Easy', inStock: false, tag: 'Medicinal' },
  { id: 7, name: 'Jasmine Creeper',     category: 'outdoor',    price: 349, care: 'Moderate',  inStock: true,  tag: 'Fragrant' },
  { id: 8, name: 'Mint — Pudina',       category: 'herbs',      price: 99,  care: 'Easy',      inStock: true,  tag: 'Kitchen Fav' },
];

/* ── In-memory submissions store (simulates a database) ───── */
const submissionsDB = [];

/* ── API Logger ───────────────────────────────────────────── */
const apiLog    = document.getElementById('api-log');
const apiDot    = document.getElementById('api-dot');
const apiText   = document.getElementById('api-status-text');

function logEntry(method, path, status, info = '') {
  if (!apiLog) return;
  const now = new Date();
  const time = now.toTimeString().slice(0, 8);

  const entry = document.createElement('div');
  entry.className = 'api-log-entry';

  const methodClass = method === 'GET' ? 'log-method-get' : 'log-method-post';
  const statusClass = status >= 200 && status < 300 ? 'log-status-ok' : 'log-status-err';

  entry.innerHTML =
    `<span class="log-time">${time}</span>` +
    `<span class="${methodClass}">${method}</span>` +
    `<span class="log-path">${path}</span>` +
    `<span class="${statusClass}">${status}</span>` +
    (info ? `<span class="log-info">— ${info}</span>` : '');

  apiLog.appendChild(entry);
  apiLog.scrollTop = apiLog.scrollHeight;
}

/* ── API: GET /api/plants ─────────────────────────────────── */
async function apiGetPlants(categoryFilter = 'all') {
  // Simulate network latency (80–200ms)
  await new Promise(r => setTimeout(r, 80 + Math.random() * 120));

  const filtered = categoryFilter === 'all'
    ? PLANT_DB
    : PLANT_DB.filter(p => p.category === categoryFilter);

  const path = categoryFilter === 'all'
    ? '/api/plants'
    : `/api/plants?category=${categoryFilter}`;

  if (filtered.length === 0) {
    logEntry('GET', path, 404, 'No plants found');
    return { status: 404, body: { error: 'No plants found for this category.' } };
  }

  const body = {
    status:  'success',
    count:   filtered.length,
    data:    filtered,
  };

  logEntry('GET', path, 200, `${filtered.length} plant(s) returned`);
  return { status: 200, body };
}

/* ── API: POST /api/contact ───────────────────────────────── */
async function apiPostContact(payload) {
  // Simulate network latency
  await new Promise(r => setTimeout(r, 150 + Math.random() * 200));

  // Server-side validation mirror
  const errors = validatePayload(payload);
  if (errors.length > 0) {
    logEntry('POST', '/api/contact', 422, 'Validation failed');
    return { status: 422, body: { error: 'Unprocessable Entity', details: errors } };
  }

  // Save to in-memory DB (simulates database INSERT)
  const record = {
    id:        submissionsDB.length + 1,
    ...payload,
    createdAt: new Date().toISOString(),
  };
  submissionsDB.push(record);

  logEntry('POST', '/api/contact', 201, `ID #${record.id} saved`);
  return {
    status: 201,
    body: {
      status:  'success',
      message: 'Your message has been received! We\'ll respond within 24 hours.',
      id:      record.id,
    },
  };
}

/* ── Validation Helper ────────────────────────────────────── */
function validatePayload(data) {
  const errs = [];
  if (!data.name  || data.name.trim().length < 2)    errs.push({ field: 'name',    msg: 'Name must be at least 2 characters.' });
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errs.push({ field: 'email', msg: 'Please enter a valid email address.' });
  if (data.phone  && !/^[\+\d\s\-]{7,15}$/.test(data.phone))         errs.push({ field: 'phone', msg: 'Phone number format is invalid.' });
  if (!data.subject || data.subject === '')           errs.push({ field: 'subject', msg: 'Please select a subject.' });
  if (!data.message || data.message.trim().length < 10) errs.push({ field: 'message', msg: 'Message must be at least 10 characters.' });
  return errs;
}

/* ── Form Validation (client-side, mirrors server) ────────── */
const FIELD_RULES = {
  'cf-name':    { errId: 'err-name',    validate: v => v.trim().length >= 2 ? '' : 'Name must be at least 2 characters.' },
  'cf-email':   { errId: 'err-email',   validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Enter a valid email address.' },
  'cf-phone':   { errId: 'err-phone',   validate: v => !v || /^[\+\d\s\-]{7,15}$/.test(v) ? '' : 'Phone format invalid (digits, spaces, + or -).' },
  'cf-subject': { errId: 'err-subject', validate: v => v ? '' : 'Please select a subject.' },
  'cf-message': { errId: 'err-message', validate: v => v.trim().length >= 10 ? '' : 'Message must be at least 10 characters.' },
};

function setFieldState(inputEl, errEl, msg) {
  if (msg) {
    inputEl.classList.add('invalid');
    inputEl.classList.remove('valid');
    errEl.textContent = msg;
  } else {
    inputEl.classList.remove('invalid');
    inputEl.classList.add('valid');
    errEl.textContent = '';
  }
}

function validateAllFields() {
  let valid = true;
  Object.entries(FIELD_RULES).forEach(([id, rule]) => {
    const el  = document.getElementById(id);
    const err = document.getElementById(rule.errId);
    if (!el) return;
    const msg = rule.validate(el.value);
    setFieldState(el, err, msg);
    if (msg) valid = false;
  });
  return valid;
}

// Inline (blur) validation
Object.entries(FIELD_RULES).forEach(([id, rule]) => {
  const el  = document.getElementById(id);
  const err = document.getElementById(rule.errId);
  if (!el) return;
  el.addEventListener('blur', () => setFieldState(el, err, rule.validate(el.value)));
  el.addEventListener('input', () => {
    if (el.classList.contains('invalid')) {
      setFieldState(el, err, rule.validate(el.value));
    }
  });
});

// Character counter for message
const msgEl   = document.getElementById('cf-message');
const charRem = document.getElementById('char-remaining');
if (msgEl && charRem) {
  msgEl.addEventListener('input', () => {
    const left = 500 - msgEl.value.length;
    charRem.textContent = left;
    charRem.style.color = left < 50 ? '#d32f2f' : '';
  });
}

/* ── Form Submit Handler ──────────────────────────────────── */
const contactFormEl = document.getElementById('contact-form-el');
const submitBtn     = document.getElementById('form-submit-btn');

// Toast helpers
function showFormToast(type, message) {
  let toast = document.getElementById('form-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'form-toast';
    toast.className = 'form-toast';
    contactFormEl.appendChild(toast);
  }
  toast.className = `form-toast ${type} show`;
  toast.innerHTML = `<span class="form-toast-icon">${type === 'success' ? '✅' : '❌'}</span><span>${message}</span>`;
  setTimeout(() => toast.classList.remove('show'), 6000);
}

if (contactFormEl) {
  contactFormEl.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Client-side validation first
    if (!validateAllFields()) {
      logEntry('POST', '/api/contact', 400, 'Client validation failed');
      return;
    }

    // Gather payload
    const payload = {
      name:    document.getElementById('cf-name').value.trim(),
      email:   document.getElementById('cf-email').value.trim(),
      phone:   document.getElementById('cf-phone').value.trim(),
      subject: document.getElementById('cf-subject').value,
      message: document.getElementById('cf-message').value.trim(),
    };

    // Loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    // Hit the POST endpoint
    const res = await apiPostContact(payload);

    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;

    if (res.status === 201) {
      showFormToast('success', res.body.message);
      contactFormEl.reset();
      if (charRem) charRem.textContent = '500';
      // Clear valid states
      document.querySelectorAll('.contact-form input, .contact-form select, .contact-form textarea')
        .forEach(el => el.classList.remove('valid', 'invalid'));
    } else {
      const detail = res.body.details ? res.body.details.map(d => d.msg).join(' · ') : res.body.error;
      showFormToast('error', `Error ${res.status}: ${detail}`);
    }
  });
}

/* ── API Status Initialisation ────────────────────────────── */
async function initApiStatus() {
  if (!apiDot) return;
  apiDot.className = 'api-dot loading';
  if (apiText) apiText.textContent = 'Connecting…';

  await new Promise(r => setTimeout(r, 600));

  apiDot.className = 'api-dot online';
  if (apiText) apiText.textContent = '200 OK';
  logEntry('GET', '/api/health', 200, 'Server online');
  logEntry('GET', '/api/plants', 200, `${PLANT_DB.length} plants in DB`);
}

/* ── GET Endpoint Demo Buttons ────────────────────────────── */
function syntaxHighlight(json) {
  return JSON.stringify(json, null, 2)
    .replace(/("[\w\s\-–—]+")(\s*:)/g, '<span class="json-key">$1</span>$2')
    .replace(/:\s*("([^"]*)")/g, ': <span class="json-string">"$2"</span>')
    .replace(/:\s*(\d+\.?\d*)/g, ': <span class="json-number">$1</span>')
    .replace(/:\s*(true|false)/g, ': <span class="json-bool">$1</span>');
}

document.querySelectorAll('.api-fetch-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const filter  = btn.dataset.filter;
    const respBox = document.getElementById('api-response-box');
    if (!respBox) return;

    btn.disabled = true;
    respBox.innerHTML = '<code style="color:#6a8f7a">// Fetching…</code>';

    const res = await apiGetPlants(filter);

    respBox.innerHTML = `<code>${syntaxHighlight(res.body)}</code>`;
    btn.disabled = false;
  });
});

/* ── Boot the API layer ───────────────────────────────────── */
document.addEventListener('DOMContentLoaded', initApiStatus);
