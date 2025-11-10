const KEY = "creperie.cart.v1";

export function loadCart() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { items: {} };
    const parsed = JSON.parse(raw);
    return (parsed && typeof parsed === "object") ? parsed : { items: {} };
  } catch {
    return { items: {} };
  }
}

export function saveCart(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Ignore quota errors silently.
  }
}
