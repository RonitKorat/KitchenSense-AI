import os
import google.generativeai as genai
import pandas as pd
import json
import time

# Configure Gemini API key
genai.configure(api_key="AIzaSyBeZR1UE57ipQIN0xgQOIuP1jNmucP13nU")

# Get the script's directory
script_dir = os.path.dirname(os.path.abspath(__file__))
dataset_path = os.path.join(script_dir, "menu_dataset_final.csv")
output_path = os.path.join(script_dir, "generated_menu.json")

# Load menu dataset
try:
    if not os.path.exists(dataset_path):
        raise FileNotFoundError(f"Dataset not found at {dataset_path}")

    df = pd.read_csv(dataset_path)
    menu_items = df.to_dict(orient='records')
except Exception as e:
    print(json.dumps({"error": f"Error loading dataset: {str(e)}"}))
    exit(1)

# Define input data
input_data = {
    "high_risk_ingredients": {
        "apple": 2292.68,
        "banana": 1811.57,
        "cucumber": 1889.34,
        "okra": 1575.99,
        "oranges": 2355.04,
        "patato": 2801.04,
        "tomato": 1313.33
    },
    "target_month": "January",
    "target_year": 2025,
    "predicted_ingredient_consumption": {
        "apple": 21582,
        "banana": 17373,
        "cucumber": 16977,
        "oranges": 22585,
        "okra": 12878,
        "patato": 22418,
        "tomato": 10732
    }
}

prompt = f"""
You are an AI-powered **Smart Menu Generator** designed to optimize a restaurant's menu for **{input_data['target_month']} {input_data['target_year']}** while considering:
- **Reducing food waste**: Prioritize "high-risk" ingredients nearing spoilage.
- **Profit optimization**: Adjust normal dish prices based on demand & historical sales data.
- **Dynamic pricing**:
  - **Special dishes (high-risk ingredients)**: Apply **10-30% discount** based on perishability & sales trends.
  - **Normal dishes (high-demand ingredients)**: Adjust prices **based on past sales and profit margins**.

### **Dataset Information (Menu Items & Sales Data)**
{json.dumps(input_data, indent=4)}

### **Return JSON Output ONLY (No Explanations)**
Ensure the JSON output is **correctly formatted**.

{{
    "month": "{input_data['target_month']}",
    "year": {input_data['target_year']},
    "menu": {{
        "special_dishes": [
            {{"name": "Dish Name", "ingredients": ["ingredient1", "ingredient2"], "price": 5.99, "discount": "20%", "description": "An innovative dish created using soon-to-expire ingredients."}}
        ],
        "normal_dishes": [
            {{"name": "Dish Name", "ingredients": ["ingredient1", "ingredient2"], "price": 8.99, "description": "A high-demand dish adjusted for profit optimization."}}
        ]
    }}
}}
"""

# Generate menu using Gemini
try:
    print(json.dumps({"status": "Generating menu..."}))  # Initial status
    model = genai.GenerativeModel('gemini-2.0-flash')
    response = model.generate_content(prompt)
    
    # Extract the JSON part from the response
    response_text = response.text
    # Find the JSON part between ```json and ``` markers
    if "```json" in response_text:
        response_text = response_text.split("```json")[1].split("```")[0].strip()
    
    # Parse the response text as JSON
    try:
        menu_data = json.loads(response_text)
    except json.JSONDecodeError:
        # If response is not valid JSON, create a default structure
        menu_data = {
            "month": input_data['target_month'],
            "year": input_data['target_year'],
            "menu": {
                "special_dishes": [],
                "normal_dishes": []
            }
        }
    
    # Save to JSON file
    with open(output_path, 'w') as f:
        json.dump(menu_data, f, indent=4)
    
    # Print the final JSON response
    print(json.dumps({
        "status": "success",
        "data": menu_data,
        "file_path": output_path
    }))
    
except Exception as e:
    error_response = {
        "status": "error",
        "error": f"Error generating menu: {str(e)}"
    }
    print(json.dumps(error_response))
    exit(1)
