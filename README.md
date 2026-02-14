# Resource Management System (RMS)

A comprehensive web application designed to manage educational resources, classes, and users (Admin, Teachers, and Students).

## Project Overview

RMS provides a centralized platform for educational institutions to organize course materials, manage department-level data, and facilitate resource sharing between teachers and students.

### Features

#### 🛡️ Admin Panel
- **User Management**: Create, edit, and deactivate accounts for Teachers and Students.
- **Department Management**: Organize headers for various engineering and science departments.
- **System Oversight**: Monitor global resource uploads and system health.
- **Dashboard Stats**: Real-time overview of total students, teachers, and resources.

#### 👨‍🏫 Teacher Panel
- **Class Management**: View assigned classes and semesters.
- **Resource Management**: Upload lecture notes, slides, and assignments (PDFs, Images, etc.).
- **Resource Linking**: Link existing files to multiple classes for efficient reuse.
- **Secure Handling**: Manage file versions and descriptions.

#### 🎓 Student Panel
- **Resource Discovery**: Access all study materials linked to their specific class and semester.
- **Downloadable Content**: Quick access to lecture notes and shared files.

---

## Tech Stack

### Frontend
- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Components**: Custom themed components with dark mode support.
- **State Management**: React Hooks and Context.
- **API Communication**: `authenticatedFetch` utility with JWT header support.

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **Database**: [PostgreSQL](https://www.postgresql.org/) using [asyncpg](https://magicstack.github.io/asyncpg/)
- **Security**: JWT Authentication (JOSE), Bcrypt password hashing.
- **CORS**: Configured for cross-domain Vercel deployments.

---

## Getting Started

### Local Development Setup

#### 1. Clone the repository
```bash
git clone <repository-url>
cd resource-management-system
```

#### 2. Backend Setup
```bash
cd backend
# Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure Environment Variables
# Create a .env file in the backend directory
# DATABASE_URL=postgresql://user:password@localhost/dbname
# SECRET_KEY=your_secret_key

# Run the server
uvicorn app.main:app --reload
```

#### 3. Frontend Setup
```bash
cd ../frontend
# Install dependencies
npm install

# Configure Environment Variables
# Create a .env.local file in the frontend directory
# NEXT_PUBLIC_API_URL=http://localhost:8000

# Run the development server
npm run dev
```

---

## Deployment Configuration

The project is optimized for deployment on **Vercel**.

### Important Note on Authentication
Due to domain mismatch between frontend (`*.vercel.app`) and backend (`*-backend.vercel.app`), the system uses a header-based authentication strategy.
The frontend uses a custom `authenticatedFetch` utility to send the JWT token in the `Authorization` header, ensuring cross-site requests are authenticated even when cookies are restricted.

---

## License

[MIT License](LICENSE)
