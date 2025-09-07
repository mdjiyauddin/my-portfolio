/* =========================
   Portfolio – All-in-One JS
   ========================= */

/* ---------- tiny helpers ---------- */
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));

/* ---------- minimal styles injection (dark-mode, buttons, modal, chips) ---------- */
(() => {
  const css = `
  :root{--bg:#ffffff;--fg:#0e0e10;--muted:#6b7280;--brand:#2563eb;--card:#f8fafc;}
  body.dark-mode{--bg:#0b0f14;--fg:#e5e7eb;--muted:#9aa4b2;--brand:#60a5fa;--card:#0f172a;}
  body{background:var(--bg); color:var(--fg); transition:background .25s ease,color .25s ease;}
  header, .section, .project-card, .footer{background:transparent;}
  .active{color:var(--brand)!important; font-weight:600; text-underline-offset:6px; text-decoration:underline;}
  /* floating buttons */
  .fab{position:fixed; z-index:9999; border:none; border-radius:999px; padding:.65rem .9rem; cursor:pointer; box-shadow:0 6px 20px rgba(0,0,0,.15); background:var(--card); color:var(--fg)}
  #themeToggle{top:20px; right:20px}
  #toTop{bottom:20px; right:20px; display:none}
  /* filter bar */
  .filter-bar{display:flex; gap:.6rem; flex-wrap:wrap; align-items:center; margin:.75rem 0 1rem}
  .filter-input{flex:1 1 240px; padding:.55rem .8rem; border:1px solid rgba(0,0,0,.12); border-radius:12px; background:var(--card); color:var(--fg); outline:none}
  .chip{padding:.35rem .6rem; border-radius:999px; border:1px solid rgba(0,0,0,.12); background:transparent; color:var(--fg); cursor:pointer; font-size:.9rem}
  .chip.active{background:var(--brand); color:white; border-color:transparent}
  .project-card{border:1px solid rgba(0,0,0,.08); border-radius:16px; padding:1rem; background:var(--card)}
  .hidden{display:none!important}
  /* modal */
  .modal-overlay{position:fixed; inset:0; background:rgba(0,0,0,.6); display:none; place-items:center; z-index:9998}
  .modal{width:min(920px,92vw); height:min(85vh,920px); background:var(--bg); border-radius:16px; overflow:hidden; display:flex; flex-direction:column; box-shadow:0 20px 60px rgba(0,0,0,.35)}
  .modal header{display:flex; align-items:center; justify-content:space-between; padding:.75rem 1rem; border-bottom:1px solid rgba(0,0,0,.1)}
  .modal header h4{margin:0; font-size:1rem}
  .modal .close{border:none; background:transparent; font-size:1.25rem; cursor:pointer; color:var(--fg)}
  .modal iframe{flex:1; width:100%; border:0; background:var(--card)}
  /* contact form */
  .contact-form{margin-top:1rem; display:grid; gap:.75rem; max-width:640px}
  .contact-form input,.contact-form textarea{padding:.65rem .8rem; border-radius:12px; border:1px solid rgba(0,0,0,.12); background:var(--card); color:var(--fg)}
  .btn{padding:.6rem 1rem; border-radius:12px; border:1px solid transparent; background:var(--brand); color:white; cursor:pointer}
  .error{font-size:.9rem; color:#ef4444}
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
})();

/* ---------- Smooth scroll for internal nav ---------- */
$$('nav a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const id = a.getAttribute('href');
    const el = $(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', id);
  });
});

/* ---------- Active nav highlight (IntersectionObserver fallback to scroll) ---------- */
(() => {
  const sections = $$('section[id]');
  const links = new Map($$('nav a[href^="#"]').map(a => [a.getAttribute('href').slice(1), a]));
  const activate = (id) => {
    links.forEach(l => l.classList.remove('active'));
    const link = links.get(id);
    if (link) link.classList.add('active');
  };
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) activate(entry.target.id);
      });
    }, { rootMargin: '-40% 0px -50% 0px', threshold: 0.01 });
    sections.forEach(s => io.observe(s));
  } else {
    window.addEventListener('scroll', () => {
      let current = sections[0]?.id;
      sections.forEach(sec => {
        if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
      });
      activate(current);
    });
  }
})();

/* ---------- Dark/Light mode toggle with persistence ---------- */
(() => {
  const btn = document.createElement('button');
  btn.id = 'themeToggle';
  btn.className = 'fab';
  btn.setAttribute('aria-label', 'Toggle theme');
  const apply = (mode) => {
    document.body.classList.toggle('dark-mode', mode === 'dark');
    btn.textContent = mode === 'dark' ? '☀️' : '🌙';
    localStorage.setItem('theme', mode);
  };
  const preferDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const saved = localStorage.getItem('theme') || (preferDark ? 'dark' : 'light');
  apply(saved);
  btn.addEventListener('click', () => apply(document.body.classList.contains('dark-mode') ? 'light' : 'dark'));
  document.body.appendChild(btn);
})();

/* ---------- Back-to-top button ---------- */
(() => {
  const topBtn = document.createElement('button');
  topBtn.id = 'toTop';
  topBtn.className = 'fab';
  topBtn.title = 'Back to top';
  topBtn.textContent = '⬆️';
  document.body.appendChild(topBtn);
  const toggle = () => (topBtn.style.display = window.scrollY > 300 ? 'block' : 'none');
  window.addEventListener('scroll', toggle, { passive: true });
  topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

/* ---------- Time-based greeting in hero ---------- */
(() => {
  const hero = $('.hero div') || $('#home') || document.body;
  if (!hero) return;
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good Morning ☀️' : hour < 18 ? 'Good Afternoon 🌞' : 'Good Evening 🌙';
  const h3 = document.createElement('h3');
  h3.textContent = `${greet}, Jiyauddin!`;
  h3.style.marginTop = '0';
  h3.style.opacity = '0.9';
  hero.prepend(h3);
})();

/* ---------- Projects: auto-tag from “Tech Used”, filter & search UI ---------- */
(() => {
  const container = $('#projects');
  if (!container) return;

  const cards = $$('.project-card', container);
  // Extract tags from the "Tech Used:" line inside each card
  cards.forEach(card => {
    const strong = $$('strong', card).find(el => /tech used/i.test(el.textContent));
    let tags = [];
    if (strong) {
      const txt = strong.parentElement?.textContent || '';
      const after = txt.split(':')[1] || '';
      tags = after.split(/,|\|/).map(s => s.trim()).filter(Boolean);
    }
    // fallback: scan lines
    if (tags.length === 0) {
      const t = (card.textContent || '').match(/(HTML|CSS|JS|JavaScript|React|Node|Python|OpenWeather|Typed\.js|ScrollReveal|speech|pyttsx3|API)/gi) || [];
      tags = Array.from(new Set(t.map(s => s.replace(/\.js$/i, '').toUpperCase())));
    }
    card.dataset.tags = tags.map(t => t.toLowerCase()).join(',');
  });

  // Build unique tag list
  const allTags = Array.from(new Set(cards.flatMap(c => (c.dataset.tags || '').split(',').filter(Boolean)))).sort();
  // Build filter bar
  const bar = document.createElement('div'); bar.className = 'filter-bar';
  const input = document.createElement('input'); input.className = 'filter-input'; input.placeholder = 'Search projects… (title, tech)';
  bar.appendChild(input);

  const chipWrap = document.createElement('div'); chipWrap.style.display = 'flex'; chipWrap.style.flexWrap = 'wrap'; chipWrap.style.gap = '.5rem';
  allTags.slice(0, 12).forEach(tag => {
    const chip = document.createElement('button');
    chip.className = 'chip';
    chip.textContent = tag;
    chip.dataset.tag = tag;
    chip.addEventListener('click', () => {
      chip.classList.toggle('active');
      applyFilter();
    });
    chipWrap.appendChild(chip);
  });
  bar.appendChild(chipWrap);
  container.prepend(bar);

  function applyFilter() {
    const q = input.value.trim().toLowerCase();
    const activeTags = $$('.chip.active', bar).map(c => c.dataset.tag);
    cards.forEach(card => {
      const title = $('h4', card)?.textContent.toLowerCase() || '';
      const body = card.textContent.toLowerCase();
      const tags = (card.dataset.tags || '').split(',').filter(Boolean);
      const matchQuery = !q || title.includes(q) || body.includes(q);
      const matchTags = activeTags.length === 0 || activeTags.every(t => tags.includes(t));
      card.classList.toggle('hidden', !(matchQuery && matchTags));
    });
  }
  input.addEventListener('input', applyFilter);
})();

/* ---------- Resume modal (open PDF in overlay) ---------- */
(() => {
  const resumeSection = $('#resume');
  if (!resumeSection) return;
  const link = $('a[href$=".pdf"]', resumeSection) || $('a', resumeSection);
  if (!link) return;

  // modal structure
  const overlay = document.createElement('div'); overlay.className = 'modal-overlay'; overlay.setAttribute('role', 'dialog'); overlay.setAttribute('aria-modal', 'true');
  const modal = document.createElement('div'); modal.className = 'modal';
  const head = document.createElement('header');
  const title = document.createElement('h4'); title.textContent = 'Resume Preview';
  const closeBtn = document.createElement('button'); closeBtn.className = 'close'; closeBtn.innerHTML = '✕';
  head.append(title, closeBtn);
  const frame = document.createElement('iframe');
  modal.append(head, frame);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  function openModal(src) {
    frame.src = src;
    overlay.style.display = 'grid';
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    overlay.style.display = 'none';
    frame.src = 'about:blank';
    document.body.style.overflow = '';
  }
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
  closeBtn.addEventListener('click', closeModal);
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  link.addEventListener('click', (e) => {
    e.preventDefault();
    const src = link.getAttribute('href');
    if (src) openModal(src);
  });
})();

/* ---------- Contact form (inject + validate + mailto) ---------- */
(() => {
  const contact = $('#contact');
  if (!contact) return;

  // Avoid duplicates
  if ($('.contact-form', contact)) return;

  const form = document.createElement('form');
  form.className = 'contact-form';
  form.innerHTML = `
    <h4 style="margin:.25rem 0 0">Send me a message 💬</h4>
    <input type="text" name="name" placeholder="Your Name" required />
    <input type="email" name="email" placeholder="Email Address" required />
    <textarea name="message" rows="5" placeholder="Your Message" required></textarea>
    <div class="error" aria-live="polite"></div>
    <button type="submit" class="btn">Send</button>
  `;
  contact.appendChild(form);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();
    const error = $('.error', form);
    error.textContent = '';

    // simple validation
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!name || !emailOk || message.length < 5) {
      error.textContent = !emailOk ? 'Please enter a valid email.' : 'Please fill all fields (message too short?).';
      return;
    }
    // Use mailto (opens default email app)
    const subject = encodeURIComponent(`Portfolio Contact – ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    const to = 'kbarkat544@gmail.com';
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
    form.reset();
  });
})();

/* ---------- Enhance ScrollReveal defaults if library is present ---------- */
(() => {
  if (!('ScrollReveal' in window)) return;
  // already called in HTML; we add a few custom targets
  ScrollReveal().reveal('.project-card', { interval: 80, distance: '24px', origin: 'bottom' });
})();

/* ---------- Safety: ensure Typed.js target exists ---------- */
(() => {
  if (!$('#typing') && $('.hero div')) {
    const span = document.createElement('span'); span.id = 'typing';
    const h2 = $('.hero h2') || $('.hero div');
    h2 && h2.appendChild(document.createTextNode(' ')) && h2.appendChild(span);
  }
  // If Typed library present but not initialized in HTML (fallback)
  if (window.Typed && !window.__typedInit) {
    window.__typedInit = true;
    try {
      new Typed("#typing", {
        strings: ["Web Developer", "Python Programmer", "Data Science Learner"],
        typeSpeed: 70, backSpeed: 40, loop: true
      });
    } catch (_) { }
  }
})();

/* ---------- Small UX: header glow on scroll direction ---------- */
(() => {
  let lastY = window.scrollY;
  const header = document.querySelector('header');
  if (!header) return;
  header.style.transition = 'box-shadow .2s ease, backdrop-filter .2s ease';
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    const down = y > lastY;
    lastY = y;
    header.style.backdropFilter = y > 10 ? 'saturate(140%) blur(6px)' : 'none';
    header.style.boxShadow = y > 10 ? '0 6px 30px rgba(0,0,0,.12)' : 'none';
    header.style.opacity = down && y > 140 ? '0.96' : '1';
  }, { passive: true });
})();
