from flask import Flask, request, jsonify, Response
from flask_pymongo import PyMongo
from flask_cors import CORS
import subprocess
import json
import os
import sys
import time

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

# Menu API
@app.route("/menu", methods=["GET"])
def menu():
    try:
        # Get the absolute path to the script
        current_dir = os.path.dirname(os.path.abspath(__file__))
        script_path = os.path.join(current_dir, "workflow3", "one.py")
        output_path = os.path.join(current_dir, "workflow3", "generated_menu.json")
        
        # Check if script exists
        if not os.path.exists(script_path):
            return jsonify({
                "error": "Menu generation script not found",
                "path": script_path
            }), 500

        # Get Python executable path
        python_executable = sys.executable

        # Run the script with full paths
        process = subprocess.Popen(
            [python_executable, script_path],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            cwd=current_dir,
            bufsize=1,
            universal_newlines=True
        )

        # Wait for the process to complete with timeout
        timeout = 120  # 120 seconds timeout
        start_time = time.time()
        
        # Read output in real-time
        while True:
            if process.poll() is not None:
                break
                
            if time.time() - start_time > timeout:
                process.kill()
                return jsonify({
                    "error": "Menu generation timed out",
                    "details": "The process took too long to complete"
                }), 500
                
            # Read output line by line
            line = process.stdout.readline()
            if line:
                try:
                    # Try to parse the line as JSON
                    status_data = json.loads(line)
                    print("Status update:", status_data)
                except json.JSONDecodeError:
                    print("Non-JSON output:", line)
            
            time.sleep(0.1)

        # Get the final output
        stdout, stderr = process.communicate()

        # Log the complete output for debugging
        print("Complete stdout:", stdout)
        print("Complete stderr:", stderr)

        if process.returncode == 0:
            try:
                # Try to read from the generated JSON file first
                if os.path.exists(output_path):
                    with open(output_path, 'r') as f:
                        menu_data = json.load(f)
                else:
                    # If file doesn't exist, try to parse stdout
                    menu_data = json.loads(stdout)
                
                return jsonify({
                    "status": "success",
                    "data": menu_data,
                    "file_path": output_path
                })
            except json.JSONDecodeError as e:
                return jsonify({
                    "error": "Invalid JSON format returned from script",
                    "details": stdout,
                    "json_error": str(e)
                }), 500
        else:
            return jsonify({
                "error": "Failed to generate menu",
                "details": stderr,
                "return_code": process.returncode
            }), 500
    except Exception as e:
        return jsonify({
            "error": "Internal server error",
            "details": str(e),
            "type": type(e).__name__
        }), 500

if __name__ == "__main__":
    app.run(debug=True)
