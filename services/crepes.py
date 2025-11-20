from models.crepes import Crepe, Menu

"""
        Crepe(
            name="Chocolate Crepe",
            description="A delicious crepe filled with chocolate. Perfect for chocolate lovers!",
            image_url="chocolate_crepe.jpg"
        ),
        """

def get_menu() -> Menu:
    return Menu(crepes=[
        Crepe(
            name="Sugar Crepe",
            description="A traditional sugar crepe. Perfect for a the 'goûter!'",
            image_url="sugar_crepe.jpg"
        ),
        Crepe(
            name="カリン Jam Crepe",
            description="A crepe filled with homemade カリン jam. Unique and tasty!",
            image_url="karin_jam_crepe.jpg"
        ),
        Crepe(
            name="Natural Crepe",
            description="A simple natural crepe. Enjoy the pure taste of crepe!",
            image_url="natural_crepe.jpg"
        ),
        Crepe(
            name="Chocolate Crepe",
            description="A delicious crepe filled with chocolate. Perfect for chocolate lovers!",
            image_url="chocolate_crepe.jpg"
        )
    ])
