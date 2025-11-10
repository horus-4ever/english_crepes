import { Emitter } from "../events.js";
import { loadCart, saveCart } from "../utils/storage.js";

/**
 * Cart data model:
 * state = { items: { [name: string]: { name: string, qty: number } } }
 */
class CartStore extends Emitter {
  constructor() {
    super();
    this.state = loadCart();
  }

  _persistAndNotify() {
    saveCart(this.state);
    this.emit("change", this.getSnapshot());
  }

  getSnapshot() {
    // Return a simple, serializable view.
    const list = Object.values(this.state.items);
    // Keep a stable order (by name).
    list.sort((a, b) => a.name.localeCompare(b.name));
    const totalQty = list.reduce((sum, it) => sum + it.qty, 0);
    return { items: list, totalQty };
  }

  add(name, qty = 1) {
    if (!name) return;
    const existing = this.state.items[name] || { name, qty: 0 };
    existing.qty += qty;
    this.state.items[name] = existing;
    this._persistAndNotify();
  }

  decrement(name, qty = 1) {
    const existing = this.state.items[name];
    if (!existing) return;
    existing.qty -= qty;
    if (existing.qty <= 0) delete this.state.items[name];
    this._persistAndNotify();
  }

  remove(name) {
    if (this.state.items[name]) {
      delete this.state.items[name];
      this._persistAndNotify();
    }
  }

  clear() {
    this.state.items = {};
    this._persistAndNotify();
  }
}

// Export a singleton so all components share the same store.
export const cartStore = new CartStore();
