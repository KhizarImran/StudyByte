# StudyByte

A modern full-stack study application built with FastAPI and React, designed to enhance learning experiences through interactive features and data-driven insights.

## 🚀 Tech Stack

### Backend
- **FastAPI** - Modern, fast web framework for building APIs
- **Python 3.11+** - Programming language
- **Uvicorn** - ASGI web server
- **SQLite/PostgreSQL** - Database (configurable)

### Frontend
- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **ESLint** - Code linting

## 📁 Project Structure

```
StudyByte/
├── client/                 # React frontend application
│   ├── src/               # Source code
│   ├── public/            # Static assets
│   ├── dist/              # Production build
│   └── package.json       # Frontend dependencies
├── server/                # FastAPI backend application
│   ├── main.py           # FastAPI application entry point
│   ├── utils/            # Utility functions
│   ├── data/             # Data files and models
│   ├── requirements.txt  # Python dependencies
│   └── .gitignore        # Backend gitignore
└── README.md             # Project documentation
```

## 🛠️ Development Setup

### Prerequisites
- **Python 3.11+**
- **Node.js 18+**
- **npm or yarn**

### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On macOS/Linux
   source venv/bin/activate
   ```

3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the FastAPI development server:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

The backend API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend application will be available at `http://localhost:5173`

## 🚀 Production Deployment

### Option 1: Vercel (Recommended)
Deploy both frontend and backend on Vercel using serverless functions.

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Configure `vercel.json` in project root
3. Deploy:
   ```bash
   vercel --prod
   ```

### Option 2: Separate Deployment
- **Frontend**: Deploy on Vercel, Netlify, or similar
- **Backend**: Deploy on Railway, Render, or Heroku

## 📝 API Documentation

When the backend is running, visit `http://localhost:8000/docs` for interactive API documentation powered by FastAPI's automatic OpenAPI integration.

## 🧪 Testing

### Backend Testing
```bash
cd server
pytest
```

### Frontend Testing
```bash
cd client
npm run test
```

## 📜 Available Scripts

### Frontend (client/)
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend (server/)
- `uvicorn main:app --reload` - Start development server
- `python -m pytest` - Run tests
- `pip freeze > requirements.txt` - Update dependencies

## 🌟 Features

- Modern, responsive UI built with React and Tailwind CSS
- Fast and efficient API with FastAPI
- Type-safe development with TypeScript
- Hot reload for both frontend and backend development
- Comprehensive API documentation
- Production-ready deployment configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔧 Environment Variables

Create a `.env` file in the server directory:

```env
# Database
DATABASE_URL=sqlite:///./studybyte.db

# API Configuration
API_HOST=localhost
API_PORT=8000

# Security
SECRET_KEY=your-secret-key-here
```

## 📞 Support

If you have any questions or need help with setup, please open an issue on GitHub.

---

**Happy Studying! 📚**
