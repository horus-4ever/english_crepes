// Entry point
import { initBootstrap } from "./bootstrapInit.js";
import { CartDrawer } from "./ui/CartDrawer.js";
import { CrepeModals } from "./ui/CrepeModals.js";
import { CardBadges } from "./ui/CardBadges.js";   // <-- add this

document.addEventListener("DOMContentLoaded", () => {
  initBootstrap();

  new CrepeModals();
  new CartDrawer({ selector: "#cartDrawer" });
  new CardBadges();                                 // <-- start badge sync
});
