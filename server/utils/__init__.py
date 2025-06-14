# This file makes the utils directory a Python package
# Import and expose modules for easy access

from .openai_client_simple import openai_client

# You can add more imports here as you expand
# from .database import db_client
# from .helpers import utility_functions

__all__ = ["openai_client"] 