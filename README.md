# LifeOS

A unified life management system.

## Setup & Run

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local frontend dev)
- Python 3.11+ (for local backend dev)

### Quick Start (Docker)

1.  **Build and Run**:
    ```bash
    docker-compose up --build
    ```
2.  **Access**:
    - Frontend: [http://localhost:3000](http://localhost:3000)
    - Backend API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### Manual Setup

#### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Features Implemented
- **Authentication**: Register & Login (JWT).
- **Health Module**: Track Sleep, Mood, Stress, Water.
- **Wealth Module**: Expense tracking, Budgeting, Financial Charts.
- **Relationship Module**: Contact management, Interaction logging.
- **Tasks & Habits**: Daily todos, Habit streaks, Priority management.
- **Purpose Module**: Goal setting, OKR tracking, Progress visualization.
- **AI Insights**: Automated correlations (e.g., Sleep vs Mood).
- **Weekly Review**: Aggregated Life Score and AI-generated summaries.
- **Unified Dashboard**: Central hub with widgets for all life areas.
- **Global Search**: (Planned) Quickly find any data point.

## Deployment

To deploy LifeOS for production:

1.  **Database**: Provision a managed PostgreSQL instance (e.g., AWS RDS, Supabase).
2.  **Backend**: Deploy the FastAPI app to a container service (e.g., AWS ECS, Google Cloud Run, or Railway).
    -   Set `DATABASE_URL` environment variable.
    -   Set `SECRET_KEY` for JWT.
3.  **Frontend**: Deploy the Next.js app to Vercel or Netlify.
    -   Set `NEXT_PUBLIC_API_URL` to your backend URL.

## Contributing

1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/amazing-feature`).
3.  Commit your changes (`git commit -m 'Add some amazing feature'`).
4.  Push to the branch (`git push origin feature/amazing-feature`).
5.  Open a Pull Request.
