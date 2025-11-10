from models.crepes import Crepe, Menu


def get_menu() -> Menu:
    return Menu(crepes=[
        Crepe(
            name="Sugar Crepe",
            description="A traditional sugar crepe. Perfect for a the 'goûter!'",
            image_url="sugar_crepe.jpg"
        ),
        Crepe(
            name="Chocolate Crepe",
            description="A delicious crepe filled with chocolate. Perfect for chocolate lovers!",
            image_url="chocolate_crepe.jpg"
        ),
        Crepe(
            name="Quince Jam Crepe",
            description="A crepe filled with homemade quince jam. Unique and tasty!",
            image_url="quince_jam_crepe.jpg"
        ),
        Crepe(
            name="Caramel Crepe",
            description="A crepe filled with caramel sauce. For caramel enthusiasts!",
            image_url="caramel_crepe.jpg"
        ),
        Crepe(
            name="Salted Butter Caramel Crepe",
            description="A crepe filled with salted butter caramel. A perfect balance of sweet and salty!",
            image_url="salted_butter_caramel_crepe.jpg"
        ),
        Crepe(
            name="Natural Crepe",
            description="A simple natural crepe. Enjoy the pure taste of crepe!",
            image_url="natural_crepe.jpg"
        )
    ])
