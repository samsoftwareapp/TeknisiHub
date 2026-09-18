(function initializeTeknisiHubMasterDownload(globalScope) {
  function getServiceBaseUrl() {
    if (typeof globalScope.resolveTeknisiHubServiceBaseUrl !== "function") {
      throw new Error("Koneksi aplikasi lokal belum siap.");
    }

    return globalScope.resolveTeknisiHubServiceBaseUrl();
  }

  async function readResponse(response) {
    const rawText = await response.text();
    if (!rawText) {
      return {};
    }

    try {
      return JSON.parse(rawText);
    } catch {
      return { message: rawText };
    }
  }

  async function saveBlob(blob, fileName, feature) {
    if (!(blob instanceof Blob)) {
      throw new Error("File hasil belum tersedia untuk disimpan.");
    }

    const formData = new FormData();
    formData.set("file", blob, String(fileName || "TeknisiHub-output.bin"));
    formData.set("feature", String(feature || ""));

    const response = await fetch(`${getServiceBaseUrl()}/settings/master-download/save`, {
      method: "POST",
      body: formData
    });
    const payload = await readResponse(response);
    if (!response.ok) {
      throw new Error(payload.message || payload.title || `Penyimpanan gagal (${response.status}).`);
    }

    if (!payload.success && !payload.cancelled) {
      throw new Error(payload.message || "File hasil tidak dapat disimpan.");
    }

    return payload;
  }

  async function saveObjectUrl(objectUrl, fileName, feature) {
    const response = await fetch(objectUrl);
    if (!response.ok) {
      throw new Error("File hasil tidak dapat disiapkan untuk disimpan.");
    }

    return saveBlob(await response.blob(), fileName, feature);
  }

  globalScope.teknisiHubMasterDownload = Object.freeze({
    saveBlob,
    saveObjectUrl
  });
})(window);
