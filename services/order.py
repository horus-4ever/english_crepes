from models.order import Order, OrderStatus, OrdersList


_orders: OrdersList = OrdersList(orders=[])


def create_new_order() -> Order:
    return Order(elements=[], status=OrderStatus.PENDING)

def send_order(order: Order) -> None:
    order.status = OrderStatus.SENT

def close_order(order: Order) -> None:
    order.status = OrderStatus.DELIVERED

def get_orders() -> OrdersList:
    return _orders