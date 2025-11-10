export async function fetchOrders() {
  const res = await fetch("/api/orders", { credentials: "same-origin" });
  if (!res.ok) throw new Error(`Failed to load orders: ${res.status}`);
  return res.json(); // { orders: [...] }
}

export function subscribeOrders(onMessage) {
  const es = new EventSource("/api/orders/stream", { withCredentials: true });

  es.addEventListener("orders", (ev) => {
    try {
      const data = JSON.parse(ev.data);
      onMessage({ type: "orders", data });
    } catch (e) {
      // ignore malformed payloads
    }
  });

  es.onerror = () => {
    // The browser will attempt to reconnect automatically.
    // You could add UI retries or backoff here if desired.
  };

  return () => es.close();
}
