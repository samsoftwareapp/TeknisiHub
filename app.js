const serviceBaseUrl = "http://127.0.0.1:48721";

const serviceStatus = document.getElementById("serviceStatus");
const notice = document.getElementById("notice");
const errorMessage = document.getElementById("errorMessage");
const joinChannelHint = document.getElementById("joinChannelHint");
const joinChannelLink = document.getElementById("joinChannelLink");
const phoneForm = document.getElementById("phoneForm");
const codeForm = document.getElementById("codeForm");
const passwordForm = document.getElementById("passwordForm");
const agreementPanel = document.getElementById("agreementPanel");
const dashboardPanel = document.getElementById("dashboardPanel");
const refreshButton = document.getElementById("refreshButton");
const agreeButton = document.getElementById("agreeButton");
const agreeCheckbox = document.getElementById("agreeCheckbox");
const logoutButton = document.getElementById("logoutButton");
const dashboardTitle = document.getElementById("dashboardTitle");
const dashboardSubtitle = document.getElementById("dashboardSubtitle");
const dashboardLoginStatus = document.getElementById("dashboardLoginStatus");
const dashboardChannelStatus = document.getElementById("dashboardChannelStatus");
const dashboardAgreementStatus = document.getElementById("dashboardAgreementStatus");
const dashboardJoinCta = document.getElementById("dashboardJoinCta");
const dashboardJoinLink = document.getElementById("dashboardJoinLink");

function setText(element, value) {
  if (element) {
    element.textContent = value;
  }
}

function setNotice(message, isWarning = false) {
  if (!notice) {
    return;
  }

  if (!message) {
    notice.textContent = "";
    notice.classList.add("hidden");
    notice.classList.remove("warning");
    return;
  }

  notice.textContent = message;
  notice.classList.remove("hidden");
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

  const hasChannelLink = Boolean(status.requiredChannelInviteLink);
  const showJoinChannelHint = hasChannelLink && (!status.isLoggedIn || !status.isChannelMember);
  toggleElement(joinChannelHint, showJoinChannelHint);
  toggleElement(dashboardJoinCta, status.isLoggedIn && !status.isChannelMember && hasChannelLink);

  if (hasChannelLink) {
    joinChannelLink.href = status.requiredChannelInviteLink;
    dashboardJoinLink.href = status.requiredChannelInviteLink;
  }

  const showDashboard = status.isLoggedIn;

  toggleElement(phoneForm, status.requiresPhoneNumber && !showDashboard);
  toggleElement(codeForm, status.requiresVerificationCode && !showDashboard);
  toggleElement(passwordForm, status.requiresPassword && !showDashboard);
  toggleElement(agreementPanel, status.isLoggedIn && !status.hasAgreed);
  toggleElement(dashboardPanel, showDashboard);

  if (showDashboard) {
    const displayName = status.displayName || "TeknisiHub User";
    setText(dashboardTitle, `Halo, ${displayName}`);
    setText(dashboardLoginStatus, "Login Telegram aktif");
    setText(
      dashboardChannelStatus,
      status.isChannelMember ? "Membership channel valid" : "Belum join channel wajib"
    );
    setText(
      dashboardAgreementStatus,
      status.hasAgreed ? "Persetujuan tersimpan" : "Menunggu persetujuan"
    );

    if (status.isChannelMember && status.hasAgreed) {
      setText(
        dashboardSubtitle,
        "Session Telegram aktif. Dashboard siap dipakai untuk tahap katalog file dan tool lokal."
      );
      setNotice("");
      return;
    }

    if (!status.isChannelMember) {
      setText(
        dashboardSubtitle,
        "Session Telegram aktif, tetapi akses belum dibuka karena akun belum join channel yang diwajibkan."
      );
      setNotice("Login berhasil, tetapi akun belum tergabung di channel yang diwajibkan.", true);
      return;
    }

    setText(
      dashboardSubtitle,
      "Session Telegram aktif. Simpan persetujuan lokal untuk membuka akses dashboard penuh."
    );
    setText(dashboardLoginStatus, "Login Telegram aktif");
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
    toggleElement(joinChannelHint, false);
    toggleElement(phoneForm, true);
    toggleElement(codeForm, false);
    toggleElement(passwordForm, false);
    toggleElement(agreementPanel, false);
    toggleElement(dashboardPanel, false);
    toggleElement(dashboardJoinCta, false);
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

if (logoutButton) {
  logoutButton.addEventListener("click", async () => {
    try {
      const result = await fetchJson("/auth/logout", {
        method: "POST",
        body: JSON.stringify({})
      });

      const phoneInput = document.getElementById("phoneNumber");
      const codeInput = document.getElementById("verificationCode");
      const passwordInput = document.getElementById("password");

      if (phoneInput) {
        phoneInput.value = "";
      }

      if (codeInput) {
        codeInput.value = "";
      }

      if (passwordInput) {
        passwordInput.value = "";
      }

      if (agreeCheckbox) {
        agreeCheckbox.checked = false;
      }

      setNotice(result.message);
      await refreshStatus();
    } catch (error) {
      setNotice(error.message, true);
    }
  });
}

if (refreshButton) {
  refreshButton.addEventListener("click", refreshStatus);
}

refreshStatus();
