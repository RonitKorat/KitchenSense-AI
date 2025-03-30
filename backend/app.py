from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# MongoDB configuration
app.config["MONGO_URI"] = "mongodb+srv://22BCE009:22BCE009@mongodb.qcyigcb.mongodb.net/hack_nu"
mongo = PyMongo(app)

db = mongo.db.users  # Reference to the users collection

# Signup API
@app.route("/signup", methods=["POST"])
def signup():
    data = request.json
    if not all(k in data for k in ("name", "email", "restaurant_name", "password")):
        return jsonify({"error": "Missing required fields"}), 400
    
    if db.find_one({"email": data["email"]}):
        return jsonify({"error": "Email already exists"}), 400
    
    db.insert_one(data)
    return jsonify({"message": "User registered successfully"}), 201

# Login API
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    user = db.find_one({"email": data.get("email"), "password": data.get("password")})
    
    if user:
        return jsonify({"message": "Login successful"}), 200
    return jsonify({"error": "Invalid email or password"}), 401

if __name__ == "__main__":
    app.run(debug=True)
