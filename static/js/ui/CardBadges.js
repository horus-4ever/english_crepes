import { cartStore } from "../store/cartStore.js";

/**
 * Keeps the green quantity badges on crêpe cards in sync with the cart.
 * It looks for elements: .cart-qty-badge[data-crepe-name="<name>"]
 */
export class CardBadges {
  constructor() {
    this._render = this._render.bind(this);
    this.unsubscribe = cartStore.on("change", this._render);
    // Initial render
    this._render(cartStore.getSnapshot());
    // In case cards are dynamically added later, you can re-call this._render()
  }

  destroy() {
    if (this.unsubscribe) this.unsubscribe();
  }

  _render(snapshot) {
    const snap = snapshot || cartStore.getSnapshot();
    const qtyByName = new Map(snap.items.map(it => [it.name, it.qty]));

    document.querySelectorAll(".cart-qty-badge[data-crepe-name]").forEach((el) => {
      const name = el.getAttribute("data-crepe-name") || "";
      const qty = qtyByName.get(name) || 0;

      if (qty > 0) {
        el.textContent = String(qty);
        el.classList.remove("d-none");
      } else {
        el.classList.add("d-none");
      }
    });
  }
}
