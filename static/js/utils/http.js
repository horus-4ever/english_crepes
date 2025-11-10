export async function postJSON(url, data, { signal } = {}) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "same-origin",
    body: JSON.stringify(data),
    signal
  });
  // Accept 2xx; throw with details otherwise
  if (!res.ok) {
    let detail = "";
    try { detail = await res.text(); } catch {}
    const err = new Error(`Request failed: ${res.status}`);
    err.status = res.status;
    err.detail = detail;
    throw err;
  }
  // Try parse JSON, fallback to empty object
  try { return await res.json(); } catch { return {}; }
}
