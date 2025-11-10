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


@dataclasses.dataclass
class QuizGame:
    quiz: Quiz
    current_question_index: int = 0
    score: int = 0
    completed: bool = False

    def answer_current_question(self, selected_index: int) -> bool:
        current_question = self.quiz.questions[self.current_question_index]
        is_correct = current_question.is_correct(selected_index)
        if is_correct:
            self.score += 1
        self.current_question_index += 1
        if self.current_question_index >= len(self.quiz.questions):
            self.completed = True
        return is_correct
