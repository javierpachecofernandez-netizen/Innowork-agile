/* =====================================================
   INNOWORK AGILE — script.js
   ===================================================== */

'use strict';

// ── View Navigation ─────────────────────────────────
function switchView(viewId, navEl) {
  // Deactivate all views
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  // Activate target
  const target = document.getElementById('view-' + viewId);
  if (target) target.classList.add('active');

  // Update sidebar nav
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  if (navEl) {
    // If navEl is the element itself or within the sidebar
    const item = navEl.closest ? navEl.closest('.nav-item') || navEl : navEl;
    if (item && item.classList) item.classList.add('active');
  }

  // Close mobile sidebar
  document.getElementById('sidebar').classList.remove('open');

  // Animate progress bars in the newly shown view
  setTimeout(animateProgressBars, 80);
}

// ── Tab Switching ────────────────────────────────────
function switchTab(btn, context) {
  const tabId = btn.getAttribute('data-tab');
  if (!tabId) return;

  // Find the parent view section
  const view = btn.closest('.view');
  if (!view) return;

  // Deactivate all tabs in this view
  view.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  view.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));

  btn.classList.add('active');
  const content = document.getElementById('tab-' + tabId);
  if (content) content.classList.add('active');
}

// ── Progress Bar Animation ───────────────────────────
function animateProgressBars() {
  document.querySelectorAll('.view.active .prog-fill').forEach(fill => {
    const target = fill.style.width;
    fill.style.width = '0%';
    requestAnimationFrame(() => {
      fill.style.transition = 'width 0.7s cubic-bezier(.4,0,.2,1)';
      fill.style.width = target;
    });
  });
}

// ── Kanban Drag & Drop ───────────────────────────────
let draggedCard = null;

function drag(event) {
  draggedCard = event.currentTarget;
  event.dataTransfer.effectAllowed = 'move';
  draggedCard.style.opacity = '0.5';
  setTimeout(() => {
    if (draggedCard) draggedCard.classList.add('dragging');
  }, 0);
}

function allowDrop(event) {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
  const col = event.currentTarget;
  col.classList.add('drag-over');
}

function drop(event) {
  event.preventDefault();
  const targetCol = event.currentTarget;
  targetCol.classList.remove('drag-over');

  if (draggedCard && targetCol !== draggedCard.parentNode) {
    targetCol.appendChild(draggedCard);
    draggedCard.style.opacity = '1';
    draggedCard.classList.remove('dragging');

    // Update col counts
    updateColCounts();

    // Visual feedback
    draggedCard.style.transform = 'scale(0.97)';
    setTimeout(() => { if (draggedCard) draggedCard.style.transform = ''; }, 200);
  } else if (draggedCard) {
    draggedCard.style.opacity = '1';
    draggedCard.classList.remove('dragging');
  }
  draggedCard = null;
}

// Clear drag-over on dragleave
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.col-cards').forEach(col => {
    col.addEventListener('dragleave', (e) => {
      if (!col.contains(e.relatedTarget)) {
        col.classList.remove('drag-over');
      }
    });
    col.addEventListener('dragend', () => {
      col.classList.remove('drag-over');
      if (draggedCard) {
        draggedCard.style.opacity = '1';
        draggedCard.classList.remove('dragging');
        draggedCard = null;
      }
    });
  });
});

function updateColCounts() {
  document.querySelectorAll('.kanban-col').forEach(col => {
    const count = col.querySelectorAll('.kanban-card').length;
    const counter = col.querySelector('.col-count');
    if (counter) counter.textContent = count;
  });
}

// ── Mobile Sidebar Toggle ────────────────────────────
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

// Close sidebar when clicking outside
document.addEventListener('click', (e) => {
  const sidebar = document.getElementById('sidebar');
  const toggle = document.getElementById('mobile-toggle');
  if (
    sidebar.classList.contains('open') &&
    !sidebar.contains(e.target) &&
    e.target !== toggle &&
    !toggle.contains(e.target)
  ) {
    sidebar.classList.remove('open');
  }
});

// ── KPI Card click ripple ────────────────────────────
function addRippleEffect() {
  document.querySelectorAll('.kpi-card, .kanban-card, .course-card, .fb-full-card, .goal-item').forEach(card => {
    card.addEventListener('click', function(e) {
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(59,130,246,0.15);
        width: 80px; height: 80px;
        left: ${e.clientX - rect.left - 40}px;
        top: ${e.clientY - rect.top - 40}px;
        pointer-events: none;
        transform: scale(0);
        animation: ripple-anim 0.5s ease-out forwards;
      `;
      this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 520);
    });
  });
}

// Inject ripple keyframes
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
  @keyframes ripple-anim {
    to { transform: scale(6); opacity: 0; }
  }
`;
document.head.appendChild(rippleStyle);

// ── Sidebar nav click handlers (via attribute) ───────
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function() {
      const view = this.getAttribute('data-view');
      if (view) switchView(view, this);
    });
  });

  // Animate initial progress bars
  setTimeout(animateProgressBars, 300);
  addRippleEffect();

  // Init col counts
  updateColCounts();
});

// ── Inline onclick fix for panel links ──────────────
// The HTML uses onclick= with switchView(). We make sure nav items
// get properly highlighted when triggered from panel links.
const _originalSwitchView = switchView;
window.switchView = function(viewId, navEl) {
  _originalSwitchView(viewId, null);
  // Highlight correct sidebar item
  document.querySelectorAll('.nav-item').forEach(n => {
    n.classList.remove('active');
    if (n.getAttribute('data-view') === viewId) n.classList.add('active');
  });
  setTimeout(animateProgressBars, 80);
};

// ── Subtle entrance animations for KPI cards ────────
function staggerEntrance() {
  const cards = document.querySelectorAll('.kpi-card');
  cards.forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(12px)';
    card.style.transition = `opacity 0.4s ease ${i * 60}ms, transform 0.4s ease ${i * 60}ms`;
    setTimeout(() => {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, 100 + i * 60);
  });
}

// ── Smooth number counter for KPI values ────────────
function animateCounters() {
  document.querySelectorAll('.kpi-value').forEach(el => {
    const text = el.textContent;
    const match = text.match(/^(\d+)/);
    if (!match) return;
    const target = parseInt(match[1]);
    if (target === 0 || target > 1000) return;
    let current = 0;
    const step = Math.ceil(target / 30);
    const suffix = text.replace(/^\d+/, '');
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = current + suffix;
      if (current >= target) clearInterval(timer);
    }, 20);
  });
}

window.addEventListener('load', () => {
  staggerEntrance();
  setTimeout(animateCounters, 200);
});
