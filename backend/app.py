import bcrypt
import os
from werkzeug.utils import secure_filename
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask import send_from_directory
import sqlite3
from flask import render_template

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app = Flask(__name__, static_folder="static")
#CORS(app)

def get_db():
    conn = sqlite3.connect("database.db")
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()

    """Create the users table if it doesn't exist"""
    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL
        )
    """)


    """Create the dances table if it doesn't exist"""
    conn.execute("""
        CREATE TABLE IF NOT EXISTS dances (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            style TEXT,
            difficulty TEXT,
            duration INTEGER,
            music TEXT,
            video_url TEXT,
            notes TEXT,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    """)
    conn.commit()
    conn.close()

@app.route("/")
def serve_frontend():
    return send_from_directory("static", "index.html")

# --------------------------
# USER AUTHENTICATION ROUTES
#---------------------------
@app.route("/signup", methods=["POST"])
def signup():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"message": "Username and password required"}), 400

    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())

    conn = get_db()
    try:
        conn.execute(
            "INSERT INTO users (username, password_hash) VALUES (?, ?)",
            (username, hashed)
        )
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({"message": "Username already exists"}), 400

    conn.close()
    return jsonify({"message": "Signed Up!"}), 200



@app.route("/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"message": "Username and password required"}), 400

    conn = get_db()
    user = conn.execute(
        "SELECT * FROM users WHERE username = ?", (username,)
    ).fetchone()
    conn.close()

    if not user:
        return jsonify({"message": "User not found"}), 404

    if bcrypt.checkpw(password.encode("utf-8"), user["password_hash"]):
        return jsonify({"message": "Login successful", "user_id": user["id"]}), 200
    else:
        return jsonify({"message": "Incorrect password"}), 401



# ------------
# DANCE ROUTES
#-------------

@app.route("/uploads/<filename>")
def uploaded_file(filename):
    return send_from_directory("uploads", filename)

@app.route("/dances", methods=["POST"])
def add_dance():
    user_id = request.form.get("user_id")
    name = request.form.get("name")
    style = request.form.get("style")
    difficulty = request.form.get("difficulty")
    duration = request.form.get("duration")
    music = request.form.get("music")
    notes = request.form.get("notes")

    if not user_id or not name:
        return jsonify({"message": "user_id and name are required"}), 400

    video_url = None
    if "video" in request.files:
        video_file = request.files["video"]
        filename = secure_filename(video_file.filename)
        path = os.path.join(UPLOAD_FOLDER, filename)
        video_file.save(path)
        video_url = f"/{path}" 

    conn = get_db()
    conn.execute("""
        INSERT INTO dances (user_id, name, style, difficulty, duration, music, video_url, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (user_id, name, style, difficulty, duration, music, video_url, notes))
    conn.commit()
    conn.close()

    return jsonify({"message": "Dance added!"}), 200
    

@app.route("/dances", methods=["GET"])
def get_dances():
    user_id = request.args.get("user_id")

    if not user_id:
        return jsonify([])

    conn = get_db()
    dances = conn.execute(
        "SELECT * FROM dances WHERE user_id = ?",
        (user_id,)
    ).fetchall()
    conn.close()

    return jsonify([dict(d) for d in dances])


@app.route("/dances/<int:id>", methods=["PUT"])
def update_dance(id):
    data = request.json
    columns = ["name", "style", "difficulty", "duration", "music", "video_url", "notes"]
    
    updates = []
    values = []

    for col in columns:
        if col in data:
            updates.append(f"{col} = ?")
            values.append(data[col])

    if not updates:
        return jsonify({"message": "No valid fields to update"}), 400

    query = "UPDATE dances SET " + ", ".join(updates) + " WHERE id = ?"
    values.append(id)

    conn = get_db()
    conn.execute(query, values)
    conn.commit()
    conn.close()

    return jsonify({"message": "Dance updated"})


@app.route("/dances/<int:id>", methods=["DELETE"])
def delete_dance(id):
    conn = get_db()
    conn.execute("DELETE FROM dances WHERE id=?", (id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Dance deleted"})

if __name__ == "__main__":
    init_db()
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
    
