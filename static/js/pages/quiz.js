import { QuizEngine } from "../quiz/QuizEngine.js";

document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("quiz-start");
  const hero = document.getElementById("quiz-hero");
  const root = document.getElementById("quiz-root");
  const dataEl = document.getElementById("quiz-data");

  startBtn?.addEventListener("click", () => {
    try {
      const json = JSON.parse(dataEl?.textContent || "{}");
      // Hide the hero section entirely
      hero?.classList.add("d-none");
      // Reveal the quiz
      root.classList.remove("d-none");
      // Initialize engine
      new QuizEngine({ root, data: json });
    } catch (e) {
      console.error("Failed to parse quiz data", e);
      alert("Oops! Could not load the quiz. Please reload the page.");
    }
  });
});
