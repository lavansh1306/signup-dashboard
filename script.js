
const form = document.getElementById('signup-form');
const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loader = document.getElementById('loader');
const h1 = document.querySelector('h1');

function validateUsername(username) {
  return /^[^\s]{5,12}$/.test(username);
}
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function validatePassword(password) {
  return /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
}

function showMessage(input, message, isValid) {
  const msgEl = document.getElementById(`${input.id}-msg`);
  msgEl.textContent = message;
  msgEl.className = isValid ? 'success' : 'error';
}

usernameInput.addEventListener('input', () => {
  const valid = validateUsername(usernameInput.value.trim());
  showMessage(usernameInput, valid ? 'Valid username.' : '5–12 characters, no spaces.', valid);
});

emailInput.addEventListener('input', () => {
  const valid = validateEmail(emailInput.value.trim());
  showMessage(emailInput, valid ? 'Valid email.' : 'Invalid email format.', valid);
});

passwordInput.addEventListener('input', () => {
  const valid = validatePassword(passwordInput.value);
  showMessage(passwordInput, valid ? 'Strong password.' : 'At least 8 characters, 1 uppercase, 1 number.', valid);
});
function loadDashboard() {
  const tbody = document.getElementById('dashboard');
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  tbody.innerHTML = '';
  users.forEach(user => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${user.username}</td>
      <td>${user.email}</td>
      <td>${user.password}</td>
      <td><span class="timestamp">${user.time}</span></td>
    `;
    tbody.appendChild(row);
  });
}

h1.classList.add('glitch');
setTimeout(() => h1.classList.remove('glitch'), 1500);

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const username = usernameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (validateUsername(username) && validateEmail(email) && validatePassword(password)) {
    loader.classList.remove('hidden');

    setTimeout(() => {
      loader.classList.add('hidden');

      const users = JSON.parse(localStorage.getItem('users') || '[]');
      users.push({ username, email, password, time: new Date().toLocaleString() });
      localStorage.setItem('users', JSON.stringify(users));

      ['username', 'email', 'password'].forEach(id => {
        localStorage.removeItem(`autosave-${id}`);
        document.getElementById(id).value = '';
        document.getElementById(`${id}-msg`).textContent = '';
      });

      loadDashboard();
      showToast('User added successfully!');
    }, 1500);
  } else {
    showToast('Fix the errors first!', false);
  }
});

function clearEntries() {
  localStorage.removeItem('users');
  loadDashboard();
  showToast('All data cleared!');
}

function showToast(message, success = true) {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: ${success ? '#22c55e' : '#ef4444'};
    color: white;
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: bold;
    z-index: 999;
    box-shadow: 0 0 10px rgba(0,0,0,0.3);
    animation: fade 3s ease forwards;
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
function exportCSV() {
  const entries = JSON.parse(localStorage.getItem('users') || '[]');
  if (!entries.length) return showToast('No data to export!', false);

  const csv = ['Username,Email,Password,Timestamp'];
  entries.forEach(e => {
    csv.push(`${e.username},${e.email},${e.password},${e.time}`);
  });

  const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'user_data.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
const exportBtn = document.createElement('button');
exportBtn.innerText = '📤 Export CSV';
exportBtn.className = 'clear-btn';
exportBtn.style.float = 'left';
exportBtn.onclick = exportCSV;

document.addEventListener('DOMContentLoaded', () => {
  const dashHeader = document.querySelector('.dashboard-section header');
  dashHeader && dashHeader.insertBefore(exportBtn, dashHeader.firstChild);
  loadDashboard();
});
['username', 'email', 'password'].forEach(id => {
  const input = document.getElementById(id);
  input.value = localStorage.getItem(`autosave-${id}`) || '';
  input.addEventListener('input', () => localStorage.setItem(`autosave-${id}`, input.value));
});
