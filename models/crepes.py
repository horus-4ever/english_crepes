import dataclasses
import json


@dataclasses.dataclass
class Crepe:
    name: str
    description: str
    image_url: str

    def to_json(self):
        return json.dumps(dataclasses.asdict(self))
    

@dataclasses.dataclass
class Menu:
    crepes: list[Crepe]

    def find_crepe_by_name(self, name: str) -> Crepe | None:
        for crepe in self.crepes:
            if crepe.name == name:
                return crepe
        return None
    
    def __iter__(self):
        return iter(self.crepes)
