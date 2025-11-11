import dataclasses


@dataclasses.dataclass
class QuizQuestion:
    question: str
    options: list[str]
    correct_option_index: int

    def is_correct(self, selected_index: int) -> bool:
        return selected_index == self.correct_option_index
    
    def to_json(self) -> dict:
        return {
            "question": self.question,
            "options": self.options,
            "correct_option_index": self.correct_option_index
        }


@dataclasses.dataclass
class Quiz:
    questions: list[QuizQuestion]
