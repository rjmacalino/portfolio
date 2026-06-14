'use strict';

document.addEventListener('DOMContentLoaded', () => {
  console.log('%c🚀 Hey there, fellow dev. Like what you see? Let\'s build something.', 'color: #38bdf8; font-size: 1.1rem; font-weight: bold;');

  const navbar  = document.getElementById('navbar');
  const navName = document.getElementById('nav-name');
  const hero    = document.getElementById('hero');
  const navLinks = document.querySelectorAll('#navbar a');
  const sections = document.querySelectorAll('section[id]');
  const copyBtn  = document.getElementById('btn-copy-email');
  const EMAIL    = 'rjhaymacalino@gmail.com';

  // ── Nav: show name + border once hero scrolls out ────────────────────────

  const heroObserver = new IntersectionObserver(
    ([entry]) => {
      const past = !entry.isIntersecting;
      navbar.classList.toggle('scrolled', past);
      navName.classList.toggle('visible', past);
    },
    { threshold: 0.1 }
  );
  heroObserver.observe(hero);

  // ── Nav: highlight active section ────────────────────────────────────────

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
        });
      });
    },
    { rootMargin: '-40% 0px -55% 0px' }
  );

  sections.forEach(s => sectionObserver.observe(s));

  // ── Scroll-in animations ─────────────────────────────────────────────────

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll('.reveal, .reveal-group').forEach(el => {
    revealObserver.observe(el);
  });

  // ── 3D tilt on project cards ──────────────────────────────────────────────

  const projectsGrid = document.querySelector('.projects-grid');
  if (projectsGrid) {
    projectsGrid.addEventListener('mousemove', (e) => {
      const card = e.target.closest('.card');
      if (!card) return;
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(700px) rotateY(${px * 5}deg) rotateX(${-py * 5}deg) translateY(-4px)`;
    });
    projectsGrid.addEventListener('mouseout', (e) => {
      const card = e.target.closest('.card');
      if (card && !card.contains(e.relatedTarget)) card.style.transform = '';
    });
  }

  // ── Copy email to clipboard ───────────────────────────────────────────────

  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      const original = copyBtn.textContent;
      copyBtn.textContent = 'Copied!';
      copyBtn.style.color = '#4ade80';
      copyBtn.style.borderColor = '#4ade80';
      setTimeout(() => {
        copyBtn.textContent = original;
        copyBtn.style.color = '';
        copyBtn.style.borderColor = '';
      }, 2000);
    } catch (_) {
      // fallback for browsers that block clipboard without user gesture
      copyBtn.textContent = EMAIL;
      setTimeout(() => { copyBtn.textContent = 'Copy Email'; }, 3000);
    }
  });
});
