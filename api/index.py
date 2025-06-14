import sys
import os

# Add server directory to path
server_path = os.path.join(os.path.dirname(__file__), '..', 'server')
sys.path.insert(0, server_path)

# Import and export the FastAPI app
from main import app

# Export for Vercel
app = app 