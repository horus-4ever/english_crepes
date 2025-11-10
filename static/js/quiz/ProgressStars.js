export class ProgressStars {
  constructor({ total, starsRowEl, fillEl, progressTextEl }) {
    this.total = total;
    this.starsRowEl = starsRowEl;
    this.fillEl = fillEl;
    this.progressTextEl = progressTextEl;
    this.current = 0;

    // Ensure layout spans the full width
    this.starsRowEl.style.display = "flex";
    this.starsRowEl.style.justifyContent = "space-between";
    this.starsRowEl.style.alignItems = "center";
    this.starsRowEl.style.width = "100%";

    this._renderStars();
    this.update(0);
  }

  _renderStars() {
  const starSvg = () => `
    <svg class="star" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#F1C40F" d="M12 2l2.9 6.26L22 9.27l-5 4.87L18.2 22 12 18.56 5.8 22 7 14.14 2 9.27l7.1-1.01z"/>
    </svg>
  `;

  // End-cap: visually marks “order sent / completed”
  // (You can swap ✅ for 🚀, 🧾, 📦, etc. later if you prefer.)
  const endcap = `
    <span
      class="endcap"
      title="Order will be sent when all stars are lit"
      aria-label="Order sent"
      style="display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;filter: drop-shadow(0 2px 2px rgba(0,0,0,.2));"
    >✅</span>
  `;

  const stars = Array.from({ length: this.total }).map(() => starSvg()).join("");
  this.starsRowEl.innerHTML = stars + endcap;
}


  update(correctCount) {
    this.current = correctCount;
    const pct = this.total === 0 ? 0 : (correctCount / this.total) * 100;
    this.fillEl.style.width = `${pct}%`;
    if (this.progressTextEl) {
      this.progressTextEl.textContent = `${correctCount} / ${this.total}`;
    }
  }
}
