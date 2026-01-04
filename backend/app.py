from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)

def get_db():
    conn = sqlite3.connect("database.db")
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Create the dances table if it doesn't exist"""
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS dances (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            style TEXT,
            difficulty TEXT,
            duration INTEGER,
            music TEXT,
            video_url TEXT,
            notes TEXT
        )
    """)
    conn.commit()
    conn.close()

@app.route("/dances", methods=["POST"])
def add_dance():
    data = request.json
    conn = get_db()
    conn.execute(
        "INSERT INTO dances (name, style, difficulty, duration, music, video_url, notes) VALUES (?, ?, ?, ?, ?, ?, ?)",
        (
            data["name"],
            data["style"],
            data["difficulty"],
            data["duration"],
            data["music"],
            data["video_url"],
            data["notes"]
        )
    )
    conn.commit()
    conn.close()
    return jsonify({"message": "Dance added"}), 201

@app.route("/dances", methods=["GET"])
def get_dances():
    
    columns = ["name", "style", "difficulty", "duration", "music", "video_url", "notes"]
    
    filters = []
    values = []

 
    for col in columns:
        value = request.args.get(col)
        if value:
            filters.append(f"{col} LIKE ?")  
            values.append(f"%{value}%")      

    query = "SELECT * FROM dances"

    if filters:
        query += " WHERE " + " AND ".join(filters)

    conn = get_db()
    dances = conn.execute(query, values).fetchall()
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
    app.run(debug=True)