import { fetchOrders, subscribeOrders } from "../api/ordersApi.js";

export class OrdersPage {
  constructor({ rootSelector = "#orders-root" } = {}) {
    this.root = document.querySelector(rootSelector);
    if (!this.root) return;

    this.unsub = null;
    this._bindActions();
    this._init();
  }

  _bindActions() {
    this.root.addEventListener("submit", async (e) => {
      const form = e.target.closest("form[data-action='mark-sent']");
      if (!form) return;
      e.preventDefault();

      const fd = new FormData(form);
      const idx = fd.get("order_index");
      const btn = form.querySelector("button[type='submit']");
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>Sending…`;
      }

      try {
        const res = await fetch("/orders/mark_sent", {
          method: "POST",
          body: fd,
          credentials: "same-origin",
          headers: { "Accept": "application/json" }
        });
        // SSE broadcast will refresh everyone; no manual update needed
        if (!res.ok) throw new Error("Failed to mark as sent");
      } catch (err) {
        console.error(err);
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.textContent = "Mark as sent";
        }
      }
    });
  }

  async _init() {
    // Initial load
    try {
      const { orders } = await fetchOrders();
      this._render(orders);
    } catch (e) {
      this._render([], "Could not load orders.");
    }

    // Live updates via SSE
    this.unsub = subscribeOrders((msg) => {
      if (msg.type === "orders") {
        this._render(msg.data);
      }
    });
  }

  destroy() {
    if (this.unsub) this.unsub();
  }

  _render(orders) {
    const count = Array.isArray(orders) ? orders.length : 0;

    if (count === 0) {
      this.root.innerHTML = `
        <div class="card shadow-sm">
          <div class="card-body text-center text-muted py-5">
            <div class="mb-2">No orders at the moment.</div>
            <div>New orders will appear here automatically after submission.</div>
          </div>
        </div>
      `;
      return;
    }

    const cards = orders.map((order, idx) => {
      const rows = (order.elements || [])
        .map(el => `
          <tr>
            <td class="fw-medium">${el.name}</td>
            <td class="text-center"><span class="badge text-bg-primary">${el.quantity}</span></td>
          </tr>
        `).join("");

      return `
        <div class="col-12">
          <div class="card shadow-sm">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <h2 class="h6 mb-1">Order #${idx + 1}</h2>
                  <span class="badge ${order.status === "pending" ? "text-bg-warning" : "text-bg-secondary"}">
                    ${order.status || "pending"}
                  </span>
                </div>
                <form method="post" action="/orders/mark_sent" data-action="mark-sent" class="ms-2">
                  <input type="hidden" name="order_index" value="${idx}">
                  <button type="submit" class="btn btn-success btn-sm">
                    Mark as sent
                  </button>
                </form>
              </div>

              <div class="table-responsive mt-3">
                <table class="table align-middle mb-0">
                  <thead>
                    <tr>
                      <th scope="col">Crêpe</th>
                      <th scope="col" class="text-center" style="width:7rem;">Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${rows}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join("");

    this.root.innerHTML = `
      <div class="mb-3">
        <span class="badge text-bg-primary">${count}</span>
        <span class="text-muted">order${count === 1 ? "" : "s"} awaiting preparation</span>
      </div>
      <div class="row g-3">
        ${cards}
      </div>
    `;
  }
}
