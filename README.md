# 💃 DanceLibrary CRUD Application
A full-stack web application that allows users to create, manage, and organize dance entries with video uploads, filtering, and authentication. Built with Flask and SQLite.

# Live Demo
Try it here: [Render Link] https://your-app.onrender.com)](https://dancelibrary-6oxw.onrender.com
## Features

### 🔐 User Authentication
- User signup and login
- Password hashing using bcrypt
- User-specific dance libraries
- Conditional UI rendering based on login state

### 🩰 Dance Management (Full CRUD)
- Create new dance entries
- View all dances for a logged-in user
- Edit dance details through modal interface
- Delete individual dances
- Bulk delete multiple dances

### 🔎 Search & Filtering
Client-side filtering by:
- Dance name
- Style
- Music
- Multi-term search with dynamic filter chips
- Real-time filtering without page reload

### 🎥 Video Upload Support
- Secure file uploads using secure_filename
- Videos stored locally
- Dynamic video playback modal

### 🎨 Interactive UI
- Modal-based editing system
- Dropdown action menus per dance card
- Conditional action visibility based on authentication
- Bulk edit mode toggle

## 🛠 Tech Stack
### Frontend
- HTML
- CSS
- JavaScript (Vanilla JS)

### Backend
- Flask (Python)
- Flask-CORS
  
### Database
- SQLite

### Authentication
- bcrypt password hashing

### File Handling
- Werkzeug secure file uploads
  
## ⚙️ Local Setup Instructions
### 1. Clone the repository
git clone <your-repo-url>
cd <project-folder>

### 2. Create a virtual environment
python3 -m venv venv

### 3. Activate the virtual environment
Mac/Linux: source venv/bin/activate

Windows: venv\Scripts\activate

### 4. Install dependencies
pip install -r requirements.txt

### 5. Run the Flask server
python app.py

The server will run on: http://127.0.0.1:5000

## 🔮 Future Improvements
- Backend route protection (token-based authentication)
- Pagination for large datasets
- Cloud database deployment
- Production deployment (Render / Railway / etc.)
- UI design refinement and aesthetic enhancements
