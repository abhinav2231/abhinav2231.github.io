/**
 * admin.js — Private Admin Panel Logic for Abhinav Portfolio
 * Handles: password authentication, message rendering, deletion & clearing.
 * 
 * Default password: abhinav123
 * To change: update the ADMIN_PASSWORD constant below.
 */

const ADMIN_PASSWORD = 'abhinav123';
const SESSION_KEY = 'admin_authenticated';
const MESSAGES_KEY = 'portfolio_messages';

// =========================================================
// Helper: Sanitize HTML to prevent XSS
// =========================================================
function escapeHTML(str) {
  return String(str).replace(/[&<>'"/]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
    '/': '&#47;'
  }[tag] || tag));
}

// =========================================================
// Helper: Get/Save messages from localStorage
// =========================================================
function getMessages() {
  return JSON.parse(localStorage.getItem(MESSAGES_KEY) || '[]');
}

function saveMessages(messages) {
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
}

// =========================================================
// Helper: Get initial letter for avatar
// =========================================================
function getInitial(name) {
  return escapeHTML(name.trim().charAt(0).toUpperCase());
}

// =========================================================
// Render Messages Dashboard
// =========================================================
function renderMessages() {
  const container = document.getElementById('messages-container');
  const totalCount = document.getElementById('total-count');
  if (!container) return;

  const messages = getMessages();
  totalCount.textContent = messages.length;

  if (messages.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
        <h3>No messages yet</h3>
        <p>When visitors send messages via the contact form, they'll appear here.</p>
      </div>
    `;
    return;
  }

  // Sort newest first
  const sorted = [...messages].sort((a, b) => b.id - a.id);

  container.innerHTML = sorted.map(msg => `
    <div class="message-card" data-id="${msg.id}">
      <div class="message-card-header">
        <div style="display:flex;align-items:center;gap:14px;">
          <div class="sender-avatar">${getInitial(msg.name)}</div>
          <div class="sender-details">
            <h4>${escapeHTML(msg.name)}</h4>
            <a href="mailto:${escapeHTML(msg.email)}">${escapeHTML(msg.email)}</a>
          </div>
        </div>
        <div class="message-meta">
          <span class="message-date">${escapeHTML(msg.date)}</span>
          <button class="msg-delete-btn" data-id="${msg.id}" aria-label="Delete message">
            <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path></svg>
            Delete
          </button>
        </div>
      </div>
      <div class="message-subject">Subject: ${escapeHTML(msg.subject)}</div>
      <div class="message-body">${escapeHTML(msg.message)}</div>
      <div class="message-actions">
        <a href="mailto:${escapeHTML(msg.email)}?subject=Re: ${escapeHTML(msg.subject)}" class="reply-btn">
          <svg viewBox="0 0 24 24"><polyline points="9 17 4 12 9 7"></polyline><path d="M20 18v-2a4 4 0 0 0-4-4H4"></path></svg>
          Reply via Email
        </a>
      </div>
    </div>
  `).join('');

  // Attach delete listeners
  container.querySelectorAll('.msg-delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.getAttribute('data-id'));
      if (confirm('Delete this message?')) {
        const updated = getMessages().filter(m => m.id !== id);
        saveMessages(updated);
        renderMessages();
      }
    });
  });
}

// =========================================================
// Show Admin Dashboard
// =========================================================
function showAdmin() {
  document.getElementById('login-page').style.display = 'none';
  const adminPage = document.getElementById('admin-page');
  adminPage.style.display = 'block';
  adminPage.classList.add('visible');
  renderMessages();
}

// =========================================================
// Show Login Page
// =========================================================
function showLogin() {
  sessionStorage.removeItem(SESSION_KEY);
  document.getElementById('admin-page').style.display = 'none';
  document.getElementById('admin-page').classList.remove('visible');
  document.getElementById('login-page').style.display = 'flex';
  document.getElementById('admin-password').value = '';
}

// =========================================================
// Init on DOM ready
// =========================================================
document.addEventListener('DOMContentLoaded', () => {

  // Check if already authenticated in this session
  if (sessionStorage.getItem(SESSION_KEY) === 'true') {
    showAdmin();
    return;
  }

  // Login form submission
  const loginForm = document.getElementById('login-form');
  const passwordInput = document.getElementById('admin-password');
  const loginError = document.getElementById('login-error');

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const entered = passwordInput.value.trim();

    if (entered === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      loginError.classList.remove('show');
      showAdmin();
    } else {
      loginError.classList.add('show');
      passwordInput.value = '';
      passwordInput.focus();
      // Shake effect on the card
      const card = document.querySelector('.login-card');
      card.style.animation = 'none';
      card.offsetHeight; // reflow
      card.style.animation = 'shake 0.4s ease';
    }
  });

  // Logout
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('Log out of the admin panel?')) showLogin();
    });
  }

  // Clear all messages
  const clearAllBtn = document.getElementById('clear-all-btn');
  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to delete ALL messages? This cannot be undone.')) {
        saveMessages([]);
        renderMessages();
      }
    });
  }
});
