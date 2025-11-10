import dataclasses
from enum import Enum
from models.crepes import Crepe


class OrderStatus(Enum):
    PENDING = "pending"
    SENT = "sent"
    DELIVERED = "delivered"


@dataclasses.dataclass
class OrderElement:
    crepe: Crepe
    quantity: int = 1
    

@dataclasses.dataclass
class Order:
    elements: list[OrderElement]
    status: OrderStatus = OrderStatus.PENDING

    def add_element(self, crepe: Crepe, quantity: int = 1) -> None:
        order_element = OrderElement(crepe=crepe, quantity=quantity)
        self.elements.append(order_element)


@dataclasses.dataclass
class OrdersList:
    orders: list[Order]

    def add_order(self, order: Order) -> None:
        self.orders.append(order)
