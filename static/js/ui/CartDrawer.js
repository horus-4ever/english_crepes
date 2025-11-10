import { cartStore } from "../store/cartStore.js";
import { postJSON } from "../utils/http.js";

export class CartDrawer {
  constructor({ selector = "#cartDrawer" } = {}) {
    this.root = document.querySelector(selector);
    if (!this.root) return;

    this.body = this.root.querySelector(".offcanvas-body");
    this.unsubscribe = cartStore.on("change", () => this.render());

    this._isSubmitting = false;
    this._abortController = null;

    this._delegateClicks();
    this.render();
  }

  destroy() {
    if (this.unsubscribe) this.unsubscribe();
    if (this._abortController) this._abortController.abort();
  }

  _delegateClicks() {
    this.body.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-action]");
      if (!btn) return;

      const action = btn.getAttribute("data-action");
      const name = btn.getAttribute("data-name");

      if (action === "inc") {
        cartStore.add(name, 1);
      } else if (action === "dec") {
        cartStore.decrement(name, 1);
      } else if (action === "remove") {
        cartStore.remove(name);
      } else if (action === "clear") {
        cartStore.clear();
      } else if (action === "send") {
        this._sendOrder();
      } else if (action === "cancel-send") {
        this._cancelSend();
      }
    });
  }

  async _sendOrder() {
    const { items, totalQty } = cartStore.getSnapshot();
    if (totalQty === 0 || this._isSubmitting) return;

    // Shape payload to what /submit_order expects
    const payload = {
      orders: items.map(it => ({ name: it.name, quantity: it.qty }))
    };

    // UI: mark submitting (disable buttons, show spinner)
    this._isSubmitting = true;
    this.render(); // re-render to reflect disabled state

    // Make the POST
    this._abortController = new AbortController();
    try {
      await postJSON("/submit_order", payload, { signal: this._abortController.signal });
      cartStore.clear();
      this._flash("Order sent! 🎉");
    } catch (err) {
      console.error(err);
      const msg = (err && err.detail) ? `${err.message}: ${err.detail}` : "Failed to send the order. Please try again.";
      this._flash(msg, "danger");
    } finally {
      this._isSubmitting = false;
      this._abortController = null;
      this.render();
    }
  }

  _cancelSend() {
    if (this._abortController) {
      this._abortController.abort();
      this._flash("Sending canceled.", "warning");
      this._isSubmitting = false;
      this._abortController = null;
      this.render();
    }
  }

  _flash(message, type = "success") {
    const alert = document.createElement("div");
    alert.className = `alert alert-${type} py-2 px-3 small`;
    alert.textContent = message;
    this.body.prepend(alert);
    setTimeout(() => alert.remove(), 3000);
  }

  render() {
    if (!this.body) return;
    const { items, totalQty } = cartStore.getSnapshot();

    const disabled = this._isSubmitting ? "disabled" : "";
    const sendLabel = this._isSubmitting
      ? `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Sending...`
      : `Send Order`;

    if (totalQty === 0) {
      this.body.innerHTML = `
        <div class="text-center text-muted small my-3">
          <div class="mb-2">Your cart is empty.</div>
          <div>Add some crêpes to get started!</div>
        </div>
        <div class="mt-auto d-grid gap-2">
          <button type="button" class="btn btn-outline-secondary btn-lg w-100" data-action="clear" disabled>
            Clear Cart
          </button>
          <button type="button" class="btn btn-success btn-lg w-100" data-action="send" disabled>
            Send Order
          </button>
        </div>
      `;
      return;
    }

    const icon = {
      minus: `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor"
             viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 0 1H4a.5.5 0 0 1-.5-.5z"/></svg>
      `,
      plus: `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor"
             viewBox="0 0 16 16" aria-hidden="true">
          <path d="M8 4a.5.5 0 0 1 .5.5V7.5H11.5a.5.5 0 0 1 0 1H8.5V11.5a.5.5 0 0 1-1 0V8.5H4.5a.5.5 0 0 1 0-1H7.5V4.5A.5.5 0 0 1 8 4z"/>
        </svg>
      `,
      trash: `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor"
             viewBox="0 0 16 16" aria-hidden="true">
          <path d="M5.5 5.5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zm2.5.5a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0v-7z"/>
          <path fill-rule="evenodd"
            d="M14.5 3a1 1 0 0 1-1 1H13v9A2 2 0 0 1 11 15H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1 0-2h3A1.5 1.5 0 0 1 7 1h2a1.5 1.5 0 0 1 1.5 1h3a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3a.5.5 0 0 0 .5.5h10a.5.5 0 0 0 .5-.5H2.5z"/>
        </svg>
      `
    };

    const listHtml = items.map(it => `
      <li class="list-group-item d-flex flex-column align-items-stretch py-3">
        <div class="d-flex align-items-center">
          <span class="fw-semibold fs-4 text-truncate flex-grow-1">${it.name}</span>
        </div>
        <div class="d-flex align-items-center justify-content-between mt-2">
          <div class="btn-group" role="group" aria-label="Quantity controls for ${it.name}">
            <button class="btn btn-light btn-lg px-3" data-action="dec" data-name="${it.name}" aria-label="Decrease ${it.name}" ${disabled}>
              ${icon.minus}
            </button>
            <span class="px-3 fs-5 d-inline-flex align-items-center justify-content-center" style="min-width:3rem" aria-live="polite">${it.qty}</span>
            <button class="btn btn-light btn-lg px-3" data-action="inc" data-name="${it.name}" aria-label="Increase ${it.name}" ${disabled}>
              ${icon.plus}
            </button>
          </div>
          <button class="btn btn-outline-danger btn-lg p-2 ms-3 flex-shrink-0"
                  data-action="remove" data-name="${it.name}"
                  aria-label="Remove ${it.name}" title="Remove" ${disabled}>
            ${icon.trash}
            <span class="visually-hidden">Remove</span>
          </button>
        </div>
      </li>
    `).join("");

    const cancelBtn = this._isSubmitting
      ? `<button type="button" class="btn btn-outline-secondary btn-lg w-100" data-action="cancel-send">Cancel</button>`
      : `<button type="button" class="btn btn-outline-secondary btn-lg w-100" data-action="clear" ${disabled}>Clear Cart</button>`;

    this.body.innerHTML = `
      <ul class="list-group mb-3">
        ${listHtml}
      </ul>
      <div class="mt-auto d-grid gap-2">
        ${cancelBtn}
        <button type="button" class="btn btn-success btn-lg w-100" data-action="send" ${disabled}>
          ${sendLabel}
        </button>
      </div>
    `;
  }
}
