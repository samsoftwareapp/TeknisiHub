(function initializeTeknisiHubRuntime(globalScope) {
  const runtimeConfig = Object.freeze({
    serviceHost: "127.0.0.1",
    servicePort: "48721",
    serviceBaseUrl: "http://127.0.0.1:48721",
    googleAuthRedirectUri: "http://127.0.0.1:48721/auth/google/callback"
  });

  globalScope.teknisiHubRuntime = runtimeConfig;
  globalScope.resolveTeknisiHubServiceBaseUrl = function resolveTeknisiHubServiceBaseUrl() {
    return runtimeConfig.serviceBaseUrl;
  };
})(window);
