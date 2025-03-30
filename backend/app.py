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
        custom_date = data.get('date')  # Expected format: "YYYY-MM-DD"

        if not custom_date:
            return jsonify({"error": "Date is required in YYYY-MM-DD format"}), 400

        # Convert date string to datetime
        target_date = pd.to_datetime(custom_date)

        # Load dataset
        df = pd.read_csv('workflow2/final_dataset.csv')
        df['date'] = pd.to_datetime(df['date'], format='%Y-%m-%d')

        # Define recipe ingredient usage (in grams per dish)
        recipes = {
            "Tropical Fruit Salad": {"apple": 130, "banana": 90, "oranges": 30, "cucumber": 20, "okra": 0, "patato": 80, "tomato": 0},
            "Garden Vegetable Medley": {"cucumber": 55, "okra": 10, "tomato": 50, "apple": 50, "banana": 30, "oranges": 10, "patato": 70},
            "Hearty Potato Curry": {"patato": 100, "tomato": 50, "okra": 5, "apple": 60, "banana": 80, "cucumber": 50, "oranges": 40},
            "Fruity Veggie Smoothie": {"apple": 40, "banana": 60, "cucumber": 45, "oranges": 40, "okra": 5, "patato": 80, "tomato": 0},
            "Spicy Veggie Stir-Fry": {"patato": 90, "tomato": 50, "okra": 5, "cucumber": 35, "apple": 50, "banana": 85, "oranges": 50}
        }

        # Dictionary to store total predicted ingredient consumption
        ingredient_totals = {}

        # Get list of unique dishes (items)
        items = df['item_name'].unique()

        for item in items:
            df_item = df[df['item_name'] == item][['date', 'sale_units']].copy()
            df_item = df_item.rename(columns={'date': 'ds', 'sale_units': 'y'})
            
            # Fit Prophet model on historical data
            model = Prophet()
            model.fit(df_item)
            
            # Create a DataFrame for target date prediction
            future_df = pd.DataFrame({'ds': [target_date]})
            forecast = model.predict(future_df)
            
            # Predicted sales for the target date
            predicted_sales = forecast['yhat'].iloc[0]
            
            # Calculate ingredient consumption based on the recipe
            if item in recipes:
                for ingredient, grams_per_dish in recipes[item].items():
                    consumption = predicted_sales * grams_per_dish
                    ingredient_totals[ingredient] = ingredient_totals.get(ingredient, 0) + consumption

        # Convert ingredient totals to integers (rounded)
        ingredient_totals = {k: int(np.round(v)) for k, v in ingredient_totals.items()}

        # Create response JSON
        response = {
            "target_date": custom_date,
            "predicted_ingredient_consumption": ingredient_totals
        }

        return jsonify(response)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/compare_years', methods=['POST'])
def compare_years():
    try:
        data = request.get_json()
        custom_date = data.get('date')  # Expected format: "YYYY-MM-DD"
        selected_years = data.get('years', [])  # List of years to compare

        if not custom_date or not selected_years:
            return jsonify({"error": "Date and at least one year are required"}), 400

        # Convert date string to datetime
        target_date = pd.to_datetime(custom_date)

        # Load dataset
        df = pd.read_csv('workflow2/final_dataset.csv')
        df['date'] = pd.to_datetime(df['date'], format='%Y-%m-%d')

        # Define recipe ingredient usage (in grams per dish)
        recipes = {
            "Tropical Fruit Salad": {"apple": 130, "banana": 90, "oranges": 30, "cucumber": 20, "okra": 0, "patato": 80, "tomato": 0},
            "Garden Vegetable Medley": {"cucumber": 55, "okra": 10, "tomato": 50, "apple": 50, "banana": 30, "oranges": 10, "patato": 70},
            "Hearty Potato Curry": {"patato": 100, "tomato": 50, "okra": 5, "apple": 60, "banana": 80, "cucumber": 50, "oranges": 40},
            "Fruity Veggie Smoothie": {"apple": 40, "banana": 60, "cucumber": 45, "oranges": 40, "okra": 5, "patato": 80, "tomato": 0},
            "Spicy Veggie Stir-Fry": {"patato": 90, "tomato": 50, "okra": 5, "cucumber": 35, "apple": 50, "banana": 85, "oranges": 50}
        }

        # Dictionary to store total predicted ingredient consumption
        ingredient_totals = {}

        # Get list of unique dishes (items)
        items = df['item_name'].unique()

        # Calculate predicted consumption
        for item in items:
            df_item = df[df['item_name'] == item][['date', 'sale_units']].copy()
            df_item = df_item.rename(columns={'date': 'ds', 'sale_units': 'y'})
            
            # Fit Prophet model on historical data
            model = Prophet()
            model.fit(df_item)
            
            # Create a DataFrame for target date prediction
            future_df = pd.DataFrame({'ds': [target_date]})
            forecast = model.predict(future_df)
            
            # Predicted sales for the target date
            predicted_sales = forecast['yhat'].iloc[0]
            
            # Calculate ingredient consumption based on the recipe
            if item in recipes:
                for ingredient, grams_per_dish in recipes[item].items():
                    consumption = predicted_sales * grams_per_dish
                    ingredient_totals[ingredient] = ingredient_totals.get(ingredient, 0) + consumption

        # Convert ingredient totals to integers (rounded)
        ingredient_totals = {k: int(np.round(v)) for k, v in ingredient_totals.items()}

        # Calculate historical data for each year
        historical_data = []
        for year in selected_years:
            historical_date = target_date.replace(year=year)
            df_historical = df[df["date"] == historical_date]

            ingredient_consumption = {}
            for _, row in df_historical.iterrows():
                if row["item_name"] in recipes:
                    for ing, grams in recipes[row["item_name"]].items():
                        ingredient_consumption[ing] = ingredient_consumption.get(ing, 0) + (row["sale_units"] * grams)

            historical_data.append({
                "year": year,
                "ingredient_consumption": {k: int(v) for k, v in ingredient_consumption.items()}
            })

        # Create response JSON
        response = {
            "target_date": custom_date,
            "historical_data": historical_data,
            "predicted_ingredient_consumption": ingredient_totals
        }

        return jsonify(response)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/predict_waste', methods=['POST'])
def predict_waste():
    try:
        data = request.get_json()
        target_date = data.get('date')  # Expected format: "YYYY-MM-DD"

        if not target_date:
            return jsonify({"error": "Date is required in YYYY-MM-DD format"}), 400

        # Get the absolute path to the script
        current_dir = os.path.dirname(os.path.abspath(__file__))
        script_path = os.path.join(current_dir, "workflow2", "waste_prediction.py")
        
        # Check if script exists
        if not os.path.exists(script_path):
            return jsonify({
                "error": "Waste prediction script not found",
                "path": script_path,
                "current_dir": current_dir
            }), 500

        # Get Python executable path
        python_executable = sys.executable

        # Run the script with full paths
        process = subprocess.Popen(
            [python_executable, script_path, target_date],
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
                    "error": "Waste prediction timed out",
                    "details": "The process took too long to complete"
                }), 500
                
            # Read output line by line
            line = process.stdout.readline()
            if line:
                try:
                    # Try to parse the line as JSON
                    result = json.loads(line)
                    if "error" in result:
                        return jsonify(result), 500
                    return jsonify(result)
                except json.JSONDecodeError:
                    continue
            
            time.sleep(0.1)

        # Get the final output
        stdout, stderr = process.communicate()

        if process.returncode == 0:
            try:
                result = json.loads(stdout)
                if "error" in result:
                    return jsonify(result), 500
                return jsonify(result)
            except json.JSONDecodeError as e:
                return jsonify({
                    "error": "Invalid JSON format returned from script",
                    "details": stdout,
                    "json_error": str(e)
                }), 500
        else:
            return jsonify({
                "error": "Failed to predict waste",
                "details": stderr,
                "return_code": process.returncode
            }), 500

    except Exception as e:
        return jsonify({
            "error": "Internal server error",
            "details": str(e),
            "type": type(e).__name__
        }), 500

@app.route('/api/predict_optimal_stock', methods=['POST'])
def predict_optimal_stock():
    try:
        data = request.get_json()
        target_date = data.get('date')  # Expected format: "YYYY-MM-DD"

        if not target_date:
            return jsonify({"error": "Date is required in YYYY-MM-DD format"}), 400

        # Get the absolute path to the script
        current_dir = os.path.dirname(os.path.abspath(__file__))
        script_path = os.path.join(current_dir, "workflow2", "stock.py")
        
        # Check if script exists
        if not os.path.exists(script_path):
            return jsonify({
                "error": "Waste prediction script not found",
                "path": script_path
            }), 500

        # Get Python executable path
        python_executable = sys.executable

        # Run the script with full paths
        process = subprocess.Popen(
            [python_executable, script_path, target_date],
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
                    "error": "Waste prediction timed out",
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
                # Parse the final JSON output
                result = json.loads(stdout)
                return jsonify({
                    "status": "success",
                    "data": result
                })
            except json.JSONDecodeError as e:
                return jsonify({
                    "error": "Invalid JSON format returned from script",
                    "details": stdout,
                    "json_error": str(e)
                }), 500
        else:
            return jsonify({
                "error": "Failed to generate waste prediction",
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
