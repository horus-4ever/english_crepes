from models.quiz import QuizQuestion, Quiz
from random import sample


def get_questions_bank() -> list[QuizQuestion]:
    return [
        QuizQuestion(
            question="What is the translation of もはや ?",
            options=["not again", "not anymore", "soon", "never"],
            correct_option_index=1
        ),
        QuizQuestion(
            question="What is the meaning of the word 'patient' ?",
            options=["customer", "tolerant", "sick person", "doctor"],
            correct_option_index=2
        ),
        QuizQuestion(
            question="If I ... in Harry Potter's world, I would become the greatest wizard of all times !",
            options=["was", "were", "am", "be"],
            correct_option_index=1
        )
    ]


def create_new_quiz() -> Quiz:
    questions = sample(get_questions_bank(), k=3)
    return Quiz(questions=questions)
