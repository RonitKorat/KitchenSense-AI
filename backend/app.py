from flask import Flask, request, jsonify, Response
from flask_pymongo import PyMongo
from flask_cors import CORS
import subprocess
import json
import os
import sys
import time
import pandas as pd
import numpy as np
from prophet import Prophet

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# MongoDB configuration
app.config["MONGO_URI"] = "mongodb+srv://22BCE009:22BCE009@mongodb.qcyigcb.mongodb.net/hack_nu"
mongo = PyMongo(app)

db = mongo.db.users  # Reference to the users collection

# Import required modules for forecasting
import pandas as pd
import numpy as np
from prophet import Prophet

# Define recipes with ingredient quantities
RECIPES = {
    "Tropical Fruit Salad": {"apple": 150, "banana": 100, "oranges": 130, "cucumber": 0, "okra": 0, "patato": 0, "tomato": 0},
    "Garden Vegetable Medley": {"cucumber": 75, "okra": 60, "tomato": 50, "apple": 0, "banana": 0, "oranges": 0, "patato": 0},
    "Hearty Potato Curry": {"patato": 150, "tomato": 50, "okra": 60, "apple": 0, "banana": 0, "cucumber": 0, "oranges": 0},
    "Fruity Veggie Smoothie": {"apple": 100, "banana": 100, "cucumber": 75, "oranges": 130, "okra": 0, "patato": 0, "tomato": 0},
    "Spicy Veggie Stir-Fry": {"patato": 150, "tomato": 50, "okra": 60, "cucumber": 75, "apple": 0, "banana": 0, "oranges": 0}
}

# Load the dataset
df = pd.read_csv('workflow2/menu_dataset.csv')

# Health check endpoint
@app.route("/api/health", methods=["GET"])
def health_check():
    try:
        # Check if MongoDB is connected
        mongo.db.command('ping')
        return jsonify({"status": "healthy", "database": "connected"}), 200
    except Exception as e:
        return jsonify({"status": "unhealthy", "error": str(e)}), 500

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

@app.route('/api/generate_forecast', methods=['POST'])
def generate_forecast():
    try:
        data = request.get_json()
        custom_month = data.get('month')
        custom_year = data.get('year')

        if not custom_month or not custom_year:
            return jsonify({"error": "Month and year are required"}), 400

        # Convert month name to datetime
        target_date = pd.to_datetime(f"{custom_year}-{pd.to_datetime(custom_month, format='%B').month:02d}-01")

        # Initialize a dictionary to hold total predicted consumption per ingredient
        ingredient_totals = {}

        # Get list of unique items
        items = df['item_name'].unique()

        for item in items:
            df_item = df[df['item_name'] == item].copy()
            df_item['ds'] = pd.to_datetime(
                df_item['year'].astype(str) + '-' +
                df_item['month'].apply(lambda x: str(pd.to_datetime(x, format='%B').month).zfill(2)) + '-01'
            )
            df_item = df_item.sort_values("ds")[['ds', 'sale_units']].rename(columns={'sale_units': 'y'})
            
            # Fit Prophet model on historical data for the item
            model = Prophet()
            model.fit(df_item)
            
            # Create a DataFrame for target date prediction
            future_df = pd.DataFrame({'ds': [target_date]})
            forecast = model.predict(future_df)
            
            predicted_sales = forecast['yhat'].iloc[0]
            
            if item in RECIPES:
                for ing, grams in RECIPES[item].items():
                    consumption = predicted_sales * grams
                    ingredient_totals[ing] = ingredient_totals.get(ing, 0) + consumption

        # Round values to integers
        ingredient_totals = {k: int(np.round(v)) for k, v in ingredient_totals.items()}

        # Create response JSON
        response = {
            "target_month": custom_month,
            "target_year": custom_year,
            "predicted_ingredient_consumption": ingredient_totals
        }

        return jsonify(response)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/compare_years', methods=['POST'])
def compare_years():
    try:
        data = request.get_json()
        custom_month = data.get('month')
        year1 = data.get('year1')
        year2 = data.get('year2')

        if not all([custom_month, year1, year2]):
            return jsonify({"error": "Month and both years are required"}), 400

        # Identify ingredient sale columns (excluding 'sale_units')
        ingredient_columns = [col for col in df.columns if col.startswith("sale_") and col != "sale_units"]

        # Initialize list to store consumption data
        consumption_list = []

        # Process both years
        for year in [year1, year2]:
            # Filter data for the specific year and custom month
            filtered_df = df[(df["month"] == custom_month) & (df["year"] == year)]
            
            # Sum ingredient consumption
            ingredient_consumption = filtered_df[ingredient_columns].sum().to_dict()
            
            # Rename keys to remove "sale_" prefix
            ingredient_consumption = {key.replace("sale_", ""): value for key, value in ingredient_consumption.items()}
            
            # Create an object with required keys
            consumption_obj = {
                "month": custom_month,
                "year": int(year),
                "ingredient_consumption": {k: int(v) for k, v in ingredient_consumption.items()}
            }
            
            # Append to the list
            consumption_list.append(consumption_obj)

        return jsonify(consumption_list)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
