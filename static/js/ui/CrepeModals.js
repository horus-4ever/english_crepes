import { cartStore } from "../store/cartStore.js";

/**
 * On modal show: if the crêpe exists in cart -> show qty controls; else show Add.
 * Keeps qty synced while modal is open.
 */
export class CrepeModals {
  constructor() {
    this._onModalShow = this._onModalShow.bind(this);
    this._onModalHidden = this._onModalHidden.bind(this);
    this._subscriptions = new WeakMap(); // modalEl -> unsubscribe fn

    // Bind submit for "Add" forms (present in all modals)
    document.addEventListener("submit", (e) => {
      const form = e.target.closest('.modal form[data-role="add-form"]');
      if (!form) return;
      e.preventDefault();
      const name = (new FormData(form).get("item_name") || "").toString().trim();
      if (!name) return;
      cartStore.add(name, 1);
      // Switch to qty UI in this modal
      const modalEl = form.closest(".modal");
      if (modalEl) this._renderModalState(modalEl, name);
    });

    // Delegate clicks for qty controls inside any modal
    document.addEventListener("click", (e) => {
      const wrap = e.target.closest('.modal [data-role="qty-controls"]');
      if (!wrap) return;
      const modalEl = wrap.closest(".modal");
      const name = modalEl?.getAttribute("data-crepe-name") || "";

      const btn = e.target.closest("[data-action]");
      if (!btn) return;
      const act = btn.getAttribute("data-action");
      if (act === "inc") cartStore.add(name, 1);
      else if (act === "dec") cartStore.decrement(name, 1);
      else if (act === "remove") cartStore.remove(name);

      // Re-render current modal state (might flip back to Add if qty -> 0)
      if (modalEl) this._renderModalState(modalEl, name);
    });

    // Hook into Bootstrap modal lifecycle
    document.querySelectorAll(".modal").forEach((modalEl) => {
      modalEl.addEventListener("show.bs.modal", this._onModalShow);
      modalEl.addEventListener("hidden.bs.modal", this._onModalHidden);
    });
  }

  _onModalShow(ev) {
    const modalEl = ev.currentTarget;
    const name = modalEl.getAttribute("data-crepe-name") || "";
    this._renderModalState(modalEl, name);

    // While open, keep synced with cart changes
    const unsub = cartStore.on("change", () => this._renderModalState(modalEl, name));
    this._subscriptions.set(modalEl, unsub);
  }

  _onModalHidden(ev) {
    const modalEl = ev.currentTarget;
    const unsub = this._subscriptions.get(modalEl);
    if (unsub) unsub();
    this._subscriptions.delete(modalEl);
  }

  _renderModalState(modalEl, name) {
    const addForm = modalEl.querySelector('[data-role="add-form"]');
    const qtyWrap = modalEl.querySelector('[data-role="qty-controls"]');
    const qtyEl = modalEl.querySelector('[data-role="qty"]');
    if (!addForm || !qtyWrap || !qtyEl) return;

    const { items } = cartStore.getSnapshot();
    const entry = items.find((it) => it.name === name);
    const qty = entry ? entry.qty : 0;

    if (qty > 0) {
      addForm.classList.add("d-none");
      qtyWrap.classList.remove("d-none");
      qtyEl.textContent = String(qty);
    } else {
      qtyWrap.classList.add("d-none");
      addForm.classList.remove("d-none");
    }
  }
}
