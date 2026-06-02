(function initializeTeknisiHubRuntime(globalScope) {
  const runtimeConfig = Object.freeze({
    serviceHost: "127.0.0.1",
    servicePort: "48721",
    serviceBaseUrl: "http://127.0.0.1:48721",
    googleAuthRedirectUri: "http://127.0.0.1:48721/auth/google/callback"
  });
  const serviceOrigin = new URL(runtimeConfig.serviceBaseUrl).origin;
  const protectedMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);
  const localApiState = {
    headerName: "X-TeknisiHub-Local-Nonce",
    nonce: "",
    expiresAtMs: 0,
    unsupported: false,
    pending: null
  };
  const originalFetch = typeof globalScope.fetch === "function"
    ? globalScope.fetch.bind(globalScope)
    : null;
  const originalXhrOpen = globalScope.XMLHttpRequest?.prototype?.open;
  const originalXhrSend = globalScope.XMLHttpRequest?.prototype?.send;

  globalScope.teknisiHubRuntime = runtimeConfig;
  globalScope.resolveTeknisiHubServiceBaseUrl = function resolveTeknisiHubServiceBaseUrl() {
    return runtimeConfig.serviceBaseUrl;
  };

  function normalizeUrl(value) {
    try {
      const rawUrl = value instanceof Request ? value.url : String(value || "");
      return new URL(rawUrl, globalScope.location.href);
    } catch {
      return null;
    }
  }

  function resolveRequestMethod(input, options) {
    return String(options?.method || (input instanceof Request ? input.method : "GET") || "GET").toUpperCase();
  }

  function isLocalServiceUrl(value) {
    const url = normalizeUrl(value);
    return Boolean(url && url.origin === serviceOrigin);
  }

  function isSessionEndpoint(value) {
    const url = normalizeUrl(value);
    return Boolean(url && url.origin === serviceOrigin && url.pathname === "/local-api/session");
  }

  function shouldAttachNonce(value, method) {
    return !localApiState.unsupported &&
      protectedMethods.has(String(method || "GET").toUpperCase()) &&
      isLocalServiceUrl(value) &&
      !isSessionEndpoint(value);
  }

  function isNonceFresh() {
    return Boolean(localApiState.nonce && Date.now() < localApiState.expiresAtMs - 60000);
  }

  async function ensureLocalApiSession() {
    if (localApiState.unsupported) {
      return localApiState;
    }

    if (isNonceFresh()) {
      return localApiState;
    }

    if (localApiState.pending) {
      return localApiState.pending;
    }

    if (!originalFetch) {
        throw new Error("Browser tidak mendukung koneksi aplikasi lokal.");
    }

    localApiState.pending = originalFetch(`${runtimeConfig.serviceBaseUrl}/local-api/session`, {
      cache: "no-store",
      headers: {
        Accept: "application/json"
      }
    })
      .then(async (response) => {
        if (response.status === 404 || response.status === 405) {
          localApiState.unsupported = true;
          localApiState.nonce = "";
          localApiState.expiresAtMs = 0;
          return localApiState;
        }

        const payload = await response.json().catch(() => ({}));
        if (!response.ok || !payload?.nonce) {
          throw new Error(payload?.message || `Koneksi aplikasi lokal gagal (${response.status}).`);
        }

        localApiState.unsupported = false;
        localApiState.headerName = payload.headerName || localApiState.headerName;
        localApiState.nonce = payload.nonce;
        localApiState.expiresAtMs = Date.parse(payload.expiresUtc || "") || Date.now() + 30 * 60 * 1000;
        return localApiState;
      })
      .finally(() => {
        localApiState.pending = null;
      });

    return localApiState.pending;
  }

  function appendNonceHeader(headers, session) {
    const nextHeaders = new Headers(headers || {});
    nextHeaders.set(session.headerName || localApiState.headerName, session.nonce || localApiState.nonce);
    return nextHeaders;
  }

  if (originalFetch) {
    globalScope.fetch = async function fetchWithTeknisiHubLocalNonce(input, options) {
      const method = resolveRequestMethod(input, options);
      if (!shouldAttachNonce(input, method)) {
        return originalFetch(input, options);
      }

      const session = await ensureLocalApiSession();
      if (!session.nonce) {
        return originalFetch(input, options);
      }

      const sourceHeaders = options?.headers || (input instanceof Request ? input.headers : undefined);
      const headers = appendNonceHeader(sourceHeaders, session);
      return originalFetch(input, {
        ...(options || {}),
        headers
      });
    };
  }

  if (originalXhrOpen && originalXhrSend) {
    globalScope.XMLHttpRequest.prototype.open = function openWithTeknisiHubLocalNonce(method, url, ...rest) {
      this.__teknisiHubLocalApi = {
        method: String(method || "GET").toUpperCase(),
        url
      };
      return originalXhrOpen.call(this, method, url, ...rest);
    };

    globalScope.XMLHttpRequest.prototype.send = function sendWithTeknisiHubLocalNonce(body) {
      const request = this.__teknisiHubLocalApi;
      if (!request || !shouldAttachNonce(request.url, request.method)) {
        return originalXhrSend.call(this, body);
      }

      const sendNow = () => {
        if (!localApiState.nonce) {
          return originalXhrSend.call(this, body);
        }

        try {
          this.setRequestHeader(localApiState.headerName, localApiState.nonce);
        } catch {
          // XHR may reject late headers after abort/timeout; send continues and backend will reject if needed.
        }
        return originalXhrSend.call(this, body);
      };

      if (isNonceFresh()) {
        return sendNow();
      }

      ensureLocalApiSession()
        .then(sendNow)
        .catch(() => originalXhrSend.call(this, body));
      return undefined;
    };
  }

  globalScope.teknisiHubLocalApi = Object.freeze({
    ensureSession: ensureLocalApiSession,
    getHeaderName: () => localApiState.headerName,
    getNonce: () => localApiState.nonce
  });
})(window);
