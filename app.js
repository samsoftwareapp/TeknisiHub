const serviceBaseUrl = "http://127.0.0.1:48721";

const serviceStatus = document.getElementById("serviceStatus");
const notice = document.getElementById("notice");
const errorMessage = document.getElementById("errorMessage");
const phoneForm = document.getElementById("phoneForm");
const codeForm = document.getElementById("codeForm");
const passwordForm = document.getElementById("passwordForm");
const agreementPanel = document.getElementById("agreementPanel");
const refreshButton = document.getElementById("refreshButton");
const agreeButton = document.getElementById("agreeButton");
const agreeCheckbox = document.getElementById("agreeCheckbox");

function setText(element, value) {
  if (element) {
    element.textContent = value;
  }
}

function setNotice(message, isWarning = false) {
  if (!notice) {
    return;
  }

  notice.textContent = message;
  notice.classList.toggle("warning", isWarning);
}

function setError(message) {
  if (!errorMessage) {
    return;
  }

  if (!message) {
    errorMessage.textContent = "";
    errorMessage.classList.add("hidden");
    return;
  }

  errorMessage.textContent = message;
  errorMessage.classList.remove("hidden");
}

function toggleElement(element, visible) {
  if (!element) {
    return;
  }

  element.classList.toggle("hidden", !visible);
}

function applyStatus(status) {
  setText(serviceStatus, "Terhubung");
  setError("");

  toggleElement(phoneForm, status.requiresPhoneNumber);
  toggleElement(codeForm, status.requiresVerificationCode);
  toggleElement(passwordForm, status.requiresPassword);
  toggleElement(agreementPanel, status.isLoggedIn && !status.hasAgreed);

  if (status.isLoggedIn && status.hasAgreed) {
    setNotice("Login lokal selesai. Tahap berikutnya kita sambungkan ke katalog file dan modul flash.");
    return;
  }

  if (status.isLoggedIn && !status.hasAgreed) {
    setNotice("User sudah login lokal. Simpan persetujuan untuk membuka akses dashboard.");
    return;
  }

  if (status.lastError) {
    setNotice(status.lastError, true);
    return;
  }

  if (status.requiresVerificationCode) {
    setNotice("Masukkan kode verifikasi Telegram yang diterima user.");
    return;
  }

  if (status.requiresPassword) {
    setNotice("Akun menggunakan 2FA. Lanjutkan dengan password Telegram.");
    return;
  }

  setNotice("Masukkan nomor Telegram untuk memulai login lewat local service.");
}

async function fetchJson(path, options = {}) {
  const requestUrl = `${serviceBaseUrl}${path}`;
  const response = await fetch(requestUrl, {
    headers: {
      "Content-Type": "application/json"
    },
    ...options
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.message || "Request gagal.");
  }

  return payload;
}

async function refreshStatus() {
  try {
    const health = await fetchJson("/health");
    setText(serviceStatus, health.ready ? "Siap" : "Belum siap");

    const status = await fetchJson("/auth/status");
    applyStatus(status);
  } catch (error) {
    setText(serviceStatus, "Tidak aktif");
    toggleElement(phoneForm, true);
    toggleElement(codeForm, false);
    toggleElement(passwordForm, false);
    toggleElement(agreementPanel, false);
    setError(`Koneksi ke local service gagal: ${error.message || "unknown error"}`);
    setNotice("Local service belum aktif. Jalankan TeknisiHub.LocalService dulu, lalu refresh.", true);
  }
}

phoneForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const phoneNumber = document.getElementById("phoneNumber").value.trim();

  try {
    const result = await fetchJson("/auth/start", {
      method: "POST",
      body: JSON.stringify({ phoneNumber })
    });
    setNotice(result.message);
    await refreshStatus();
  } catch (error) {
    setNotice(error.message, true);
  }
});

codeForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const verificationCode = document.getElementById("verificationCode").value.trim();

  try {
    const result = await fetchJson("/auth/code", {
      method: "POST",
      body: JSON.stringify({ verificationCode })
    });
    setNotice(result.message);
    await refreshStatus();
  } catch (error) {
    setNotice(error.message, true);
  }
});

passwordForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const password = document.getElementById("password").value.trim();

  try {
    const result = await fetchJson("/auth/password", {
      method: "POST",
      body: JSON.stringify({ password })
    });
    setNotice(result.message);
    await refreshStatus();
  } catch (error) {
    setNotice(error.message, true);
  }
});

agreeButton.addEventListener("click", async () => {
  try {
    const result = await fetchJson("/auth/agree", {
      method: "POST",
      body: JSON.stringify({ accepted: agreeCheckbox.checked })
    });
    setNotice(result.message);
    await refreshStatus();
  } catch (error) {
    setNotice(error.message, true);
  }
});

if (refreshButton) {
  refreshButton.addEventListener("click", refreshStatus);
}

refreshStatus();
