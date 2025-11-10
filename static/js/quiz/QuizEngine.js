import { ProgressStars } from "./ProgressStars.js";
import { cartStore } from "../store/cartStore.js";
import { postJSON } from "../utils/http.js";

export class QuizEngine {
  constructor({ root, data }) {
    this.root = root;
    this.data = data || { questions: [] };

    // Elements
    this.zone = root.querySelector("#question-zone");
    this.btnCheck = root.querySelector("#btn-check");
    this.status = document.getElementById("quiz-status");

    this.progress = new ProgressStars({
      total: this.data.questions.length,
      starsRowEl: root.querySelector("#stars-row"),
      fillEl: root.querySelector("#stars-fill"),
      progressTextEl: root.querySelector("#progress-text"),
    });

    // State
    this.index = 0;
    this.selectedIndex = -1;
    this.correctCount = 0;
    this._busy = false;
    this._timer = null;

    this._bind();
    this._renderQuestion();
  }

  _bind() {
    this.zone.addEventListener("click", (e) => {
      if (this._busy) return;
      const li = e.target.closest(".list-group-item");
      if (!li) return;
      this.zone.querySelectorAll(".list-group-item").forEach(el => {
        el.setAttribute("aria-pressed", "false");
        el.classList.remove("active");
      });
      li.setAttribute("aria-pressed", "true");
      li.classList.add("active");
      this.selectedIndex = Number(li.dataset.index);
      this.btnCheck.disabled = false;
    });

    this.btnCheck.addEventListener("click", () => this._checkAnswer());
  }

  _renderQuestion() {
    const q = this.data.questions[this.index];
    if (!q) { this._finish(); return; }

    this._clearTimer();
    this._busy = false;
    this.selectedIndex = -1;
    this.btnCheck.disabled = true;

    this.zone.innerHTML = `
      <div class="question-card">
        <div class="d-flex align-items-center justify-content-between">
          <h2 class="h5 mb-3">Question ${this.index + 1}</h2>
        </div>
        <p class="mb-3">${q.question}</p>
        <ul class="list-group">
          ${q.options.map((opt, i) => `
            <li class="list-group-item d-flex align-items-center"
                role="button"
                data-index="${i}"
                aria-pressed="false">
              <span class="me-2 badge text-bg-secondary">${i + 1}</span>
              <span>${opt}</span>
            </li>
          `).join("")}
        </ul>
        <div class="mt-3 small text-muted">Choose one option, then press “Check answer”.</div>
      </div>
    `;
  }

  async _checkAnswer() {
    if (this._busy) return;
    const q = this.data.questions[this.index];
    if (this.selectedIndex < 0 || !q) return;

    const items = this.zone.querySelectorAll(".list-group-item");
    items.forEach((li, i) => {
      if (i === q.correct_option_index) {
        li.classList.add("list-group-item-success");
      } else if (i === this.selectedIndex) {
        li.classList.add("list-group-item-danger");
      }
    });

    if (this.selectedIndex === q.correct_option_index) {
      this.correctCount += 1;
      this.progress.update(this.correctCount);
      // Replace the quiz content with the correct-answer image for 2 seconds
      this._showCorrectImageThenNext();
    } else {
      this.btnCheck.disabled = true;
      items.forEach(li => {
        li.setAttribute("aria-pressed", "false");
        li.classList.remove("active");
      });
      this.selectedIndex = -1;
    }
  }

  _showCorrectImageThenNext() {
  this._busy = true;
  this.btnCheck.disabled = true;

  // Hide any existing Next button (legacy markup or future variants)
  const nextBtn = this.root.querySelector("#btn-next, .btn-next");
  if (nextBtn) {
    nextBtn.classList.add("d-none");
    nextBtn.setAttribute("aria-hidden", "true");
    if ("disabled" in nextBtn) nextBtn.disabled = true;
  }

  this.zone.innerHTML = `
    <div class="text-center">
      <img src="/static/correct_answer.jpg"
           alt="Correct answer"
           class="img-fluid rounded shadow-sm"
           style="max-height: 50vh; object-fit: contain;" />
    </div>
  `;

  this._timer = setTimeout(() => {
    this.index += 1;
    if (this.index >= this.data.questions.length) {
      this._finish();
    } else {
      this._renderQuestion();
    }
  }, 2000);
}


  async _finish() {
    this._busy = true;
    this._clearTimer();

    const { items, totalQty } = cartStore.getSnapshot();
    if (totalQty === 0) {
      return;
    }

    const payload = { orders: items.map(it => ({ name: it.name, quantity: it.qty })) };

    try {
      await postJSON("/submit_order", payload);
      cartStore.clear();
      setTimeout(() => { window.location.assign("/"); }, 700);
    } catch (err) {
      console.error(err);
      const msg = (err && err.detail) ? `${err.message}: ${err.detail}` : "Failed to send the order. Please try again.";
      this._flash(msg, "danger");
      this._busy = false;
    }
  }

  _clearTimer() {
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }
  }

  _flash(message, type = "success") {
    const alert = document.createElement("div");
    alert.className = `alert alert-${type} py-2 px-3 small`;
    alert.textContent = message;
    this.status.prepend(alert);
    setTimeout(() => alert.remove(), 3000);
  }
}
