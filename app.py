from flask import Flask, render_template, request, jsonify, Response, stream_with_context, redirect, url_for
from services.crepes import get_menu
from services.order import get_orders, create_new_order
from services.quiz import create_new_quiz
import json
import queue
import threading
import time

app = Flask(__name__)


class OrdersBroadcaster:
    def __init__(self):
        self._listeners = set()
        self._lock = threading.Lock()

    def subscribe(self):
        q = queue.Queue()
        with self._lock:
            self._listeners.add(q)
        return q

    def unsubscribe(self, q):
        with self._lock:
            self._listeners.discard(q)

    def publish(self, payload: dict):
        with self._lock:
            listeners = list(self._listeners)
        for q in listeners:
            try:
                q.put_nowait(payload)
            except queue.Full:
                pass

broadcaster = OrdersBroadcaster()


def orders_to_jsonable(orders_list):
    # orders_list is OrdersList
    return [
        {
            "status": order.status.value,
            "elements": [
                {"name": el.crepe.name, "quantity": el.quantity}
                for el in order.elements
            ],
        }
        for order in orders_list.orders
    ]


@app.route("/")
def home():
    crepes = get_menu()
    return render_template("index.html", crepes=crepes)

@app.route("/commands", methods=["GET"])
def commands():
    return render_template("commands.html", orders=get_orders())

@app.route("/api/orders", methods=["GET"])
def api_orders():
    return jsonify({"orders": orders_to_jsonable(get_orders())})

@app.route("/api/orders/stream")
def orders_stream():
    def event_stream():
        q = broadcaster.subscribe()
        keepalive = 0
        try:
            # Send initial snapshot
            snapshot = {"type": "orders", "data": orders_to_jsonable(get_orders())}
            yield f"event: orders\ndata: {json.dumps(snapshot['data'])}\n\n"
            last_ka = time.time()
            while True:
                try:
                    payload = q.get(timeout=10)
                    if payload and payload.get("type") == "orders":
                        data = json.dumps(payload["data"])
                        yield f"event: orders\ndata: {data}\n\n"
                except queue.Empty:
                    # Heartbeat to keep connections alive through proxies
                    now = time.time()
                    if now - last_ka > 20:
                        yield ": keep-alive\n\n"
                        last_ka = now
        finally:
            broadcaster.unsubscribe(q)

    headers = {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no"
    }
    return Response(stream_with_context(event_stream()), headers=headers)

# --- Submit order (from customer cart)
@app.route("/submit_order", methods=["POST"])
def submit_order():
    json_request = request.get_json(force=True, silent=True) or {}
    orders = json_request.get("orders", [])
    new_order = create_new_order()
    menu = get_menu()
    for order in orders:
        crepe = menu.find_crepe_by_name(order.get("name", ""))
        if crepe:
            qty = int(order.get("quantity", 1))
            new_order.add_element(crepe, quantity=max(qty, 1))
    get_orders().add_order(new_order)

    # Notify listeners
    broadcaster.publish({"type": "orders", "data": orders_to_jsonable(get_orders())})
    return jsonify({"ok": True}), 200


@app.route("/orders/mark_sent", methods=["POST"])
def orders_mark_sent():
    idx = int(request.form.get("order_index", -1))
    orders = get_orders()
    if 0 <= idx < len(orders.orders):
        orders.orders.pop(idx)

    # Notify listeners
    broadcaster.publish({"type": "orders", "data": orders_to_jsonable(get_orders())})
    # Support both form POST (redirect) and fetch/AJAX
    if request.headers.get("Accept", "").startswith("application/json") or request.is_json:
        return jsonify({"ok": True}), 200
    return redirect(url_for("commands"))

@app.route("/quiz")
def quiz():
    quiz = create_new_quiz()
    quiz_data = {"questions": [q.to_json() for q in quiz.questions]}
    return render_template("quiz.html", quiz=quiz_data)

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000, threaded=True)
