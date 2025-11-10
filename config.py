from dotenv import load_dotenv
import os

load_dotenv()


class Config:
    PASSWORD = os.getenv("PASSWORD")