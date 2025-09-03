// =======================
// Theme Toggle
// =======================
function toggleTheme() {
  document.body.classList.toggle("dark-mode");

  // Save preference
  if (document.body.classList.contains("dark-mode")) {
    localStorage.setItem("theme", "dark");
  } else {
    localStorage.setItem("theme", "light");
  }
}

// Apply saved theme on load
document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
  }
});

// =======================
// LocalStorage Helpers
// =======================
function saveData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function loadData(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}

function removeData(key) {
  localStorage.removeItem(key);
}

// =======================
// Input Validation
// =======================
function validateInput(value) {
  return value && value.trim().length > 0;
}

// =======================
// User Messaging
// =======================
function showMessage(msg, type = "info") {
  // Create message box
  const box = document.createElement("div");
  box.className = `msg msg-${type}`;
  box.innerText = msg;

  document.body.appendChild(box);

  // Auto-remove after 3s
  setTimeout(() => {
    box.remove();
  }, 3000);
}
