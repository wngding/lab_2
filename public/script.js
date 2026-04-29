localStorage.setItem("systemInfo", navigator.userAgent);

function showSystemInfo() {
  const systemInfoSpan = document.getElementById("system-info-text");
  if (!systemInfoSpan) return;

  const getSystemInfo = localStorage.getItem("systemInfo");
  systemInfoSpan.textContent = getSystemInfo;
}

function loadComments() {
  const commentsContainer = document.getElementById("comments");
  const url = "https://jsonplaceholder.typicode.com/posts/6/comments";
  if (!commentsContainer) return;

  commentsContainer.textContent = "Завантаження коментарів...";

  fetch(url)
    .then((response) => response.json())
    .then((comments) => {
      commentsContainer.innerHTML = "";

      comments.forEach((comment) => {
        const div = document.createElement("div");
        div.className = "comment";

        const email = document.createElement("div");
        email.className = "comment-email";
        email.textContent = comment.email;

        const title = document.createElement("div");
        title.className = "comment-title";
        title.textContent = comment.name;

        const body = document.createElement("div");
        body.className = "comment-body";
        body.textContent = comment.body;

        div.appendChild(email);
        div.appendChild(title);
        div.appendChild(body);

        commentsContainer.appendChild(div);
      });
    })
    .catch((error) => {
      commentsContainer.textContent = "Помилка завантаження коментарів";
      console.error(error);
    });
}

function initFeedbackModal() {
  const modal = document.getElementById("feedback-modal");
  const closeBtn = document.getElementById("modal-close");

  if (!modal || !closeBtn) return;

  setTimeout(() => {
    modal.style.display = "block";
  }, 60000);

  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });
}

function getAutoThemeByTime() {
  const now = new Date();
  const hour = now.getHours();
  if (hour >= 7 && hour < 21) return "day";
  return "night";
}

function applyTheme(theme) {
  document.body.classList.remove("day", "night");
  document.body.classList.add(theme);

  const toggleBtn = document.getElementById("theme-toggle");
  if (!toggleBtn) return;

  toggleBtn.textContent = theme === "night" ? "Денна тема" : "Нічна тема";
}

function initTheme() {
  const savedTheme = localStorage.getItem("theme");
  const theme = savedTheme || getAutoThemeByTime();
  applyTheme(theme);

  const toggleBtn = document.getElementById("theme-toggle");
  if (!toggleBtn) return;

  toggleBtn.addEventListener("click", () => {
    const currentTheme = document.body.classList.contains("night") ? "night" : "day";
    const newTheme = currentTheme === "night" ? "day" : "night";

    applyTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  });
}

function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const statusEl = document.getElementById("form-status");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (statusEl) statusEl.textContent = "Відправляю...";

    const fd = new FormData(form);
    const payload = {
      name: fd.get("name"),
      email: fd.get("email"),
      subject: fd.get("subject"),
      message: fd.get("message"),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = data.message || "Помилка відправки";
        if (statusEl) statusEl.textContent = msg;
        alert(msg);
        return;
      }

      const okMsg = data.message || "Відправлено!";
      if (statusEl) statusEl.textContent = okMsg;
      alert(okMsg);
      form.reset();
    } catch (err) {
      console.error(err);
      const msg = "Не вдалося з’єднатись із сервером";
      if (statusEl) statusEl.textContent = msg;
      alert(msg);
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  showSystemInfo();
  loadComments();
  initFeedbackModal();
  initTheme();
  initContactForm();
});