import { OrdersPage } from "../ui/OrdersPage.js";

document.addEventListener("DOMContentLoaded", () => {
  new OrdersPage({ rootSelector: "#orders-root" });
});
