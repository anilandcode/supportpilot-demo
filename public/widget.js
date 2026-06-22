(function () {
  if (window.__supportPilotWidgetLoaded) return;
  window.__supportPilotWidgetLoaded = true;

  var script = document.currentScript;
  var scriptUrl = script && script.src ? new URL(script.src) : new URL(window.location.href);
  var workspace = (script && (script.dataset.workspace || script.dataset.workspaceId)) || "";
  var embedUrl = (script && script.dataset.embedUrl) || new URL("/embed", scriptUrl.origin).toString();
  var accent = (script && script.dataset.accent) || "#2563eb";
  var label = (script && script.dataset.label) || "Chat";
  var position = (script && script.dataset.position) || "bottom-right";
  var widgetSession = "";

  function withWorkspace(url) {
    var nextUrl = new URL(url, scriptUrl.origin);
    if (workspace) nextUrl.searchParams.set("workspace", workspace);
    if (widgetSession) nextUrl.searchParams.set("widgetSession", widgetSession);
    return nextUrl.toString();
  }

  function updateFrameSrc() {
    frame.src = withWorkspace(embedUrl);
  }

  function setStyles(node, styles) {
    Object.keys(styles).forEach(function (key) {
      node.style[key] = styles[key];
    });
  }

  var root = document.createElement("div");
  root.setAttribute("data-supportpilot-widget", "true");
  setStyles(root, {
    position: "fixed",
    bottom: "24px",
    zIndex: "2147483000",
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
  });
  setStyles(root, position === "bottom-left" ? { left: "24px" } : { right: "24px" });

  var frame = document.createElement("iframe");
  updateFrameSrc();
  frame.title = label;
  frame.loading = "lazy";
  frame.allow = "clipboard-write";
  setStyles(frame, {
    display: "none",
    width: "400px",
    height: "620px",
    maxWidth: "calc(100vw - 32px)",
    maxHeight: "calc(100vh - 96px)",
    border: "1px solid rgba(15, 23, 42, 0.16)",
    borderRadius: "18px",
    background: "white",
    boxShadow: "0 24px 80px rgba(15, 23, 42, 0.24)",
    overflow: "hidden",
  });

  var button = document.createElement("button");
  button.type = "button";
  button.setAttribute("aria-label", "Open chat");
  button.innerHTML =
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  setStyles(button, {
    width: "58px",
    height: "58px",
    marginTop: "12px",
    marginLeft: "auto",
    border: "0",
    borderRadius: "9999px",
    background: accent,
    color: "white",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 16px 40px rgba(15, 23, 42, 0.28)",
  });

  var open = false;
  button.addEventListener("click", function () {
    open = !open;
    frame.style.display = open ? "block" : "none";
    button.setAttribute("aria-label", open ? "Close chat" : "Open chat");
  });

  root.appendChild(frame);
  root.appendChild(button);

  var configUrl = new URL("/api/widget/config", scriptUrl.origin);
  if (workspace) configUrl.searchParams.set("workspace", workspace);
  fetch(configUrl.toString(), { credentials: "omit" })
    .then(function (response) {
      if (!response.ok) return null;
      return response.json();
    })
    .then(function (config) {
      if (!config) return;
      accent = config.workspace && config.workspace.brandColor ? config.workspace.brandColor : accent;
      label = config.widgetConfig && config.widgetConfig.launcherLabel ? config.widgetConfig.launcherLabel : label;
      position = config.widgetConfig && config.widgetConfig.position ? config.widgetConfig.position : position;
      button.style.background = accent;
      button.setAttribute("aria-label", "Open " + label);
      frame.title = label;
      root.style.left = position === "bottom-left" ? "24px" : "";
      root.style.right = position === "bottom-left" ? "" : "24px";
    })
    .catch(function () {});

  var sessionUrl = new URL("/api/widget/session", scriptUrl.origin);
  fetch(sessionUrl.toString(), {
    method: "POST",
    credentials: "omit",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ workspace: workspace }),
  })
    .then(function (response) {
      if (!response.ok) return null;
      return response.json();
    })
    .then(function (session) {
      if (!session || !session.required || !session.token) return;
      widgetSession = session.token;
      updateFrameSrc();
    })
    .catch(function () {});

  document.addEventListener("DOMContentLoaded", function () {
    document.body.appendChild(root);
  });
  if (document.body) document.body.appendChild(root);
})();
