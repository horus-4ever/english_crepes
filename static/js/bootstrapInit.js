export function initBootstrap() {
  // Enable tooltips if present
  const triggers = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  triggers.forEach((el) => {
    // FIX: Use 'window.bootstrap' to access the global object
    try { new window.bootstrap.Tooltip(el); } catch {}
  });
}