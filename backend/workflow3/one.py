import google.generativeai as genai
import pandas as pd
import json

# Configure Gemini API key
genai.configure(api_key="AIzaSyBeZR1UE57ipQIN0xgQOIuP1jNmucP13nU")  # Replace with your actual API key

# Load menu dataset
dataset_path = "menu_dataset_final.csv"
try:
    df = pd.read_csv(dataset_path)
    menu_items = df.to_dict(orient='records')  # Convert dataset to list of dictionaries
except Exception as e:
    print(f"❌ Error loading dataset: {e}")
    menu_items = []  # Use an empty dataset if there's an error

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

```json
{{
    "month": "{input_data['target_month']}",
    "year": {input_data['target_year']},
    "menu": {{
        "special_dishes": [
            {{
                "name": "Dish Name",
                "ingredients": ["ingredient1", "ingredient2"],
                "price": 5.99,
                "discount": "20%",
                "description": "An innovative dish created using soon-to-expire ingredients."
            }}
        ],
        "normal_dishes": [
            {{
                "name": "Dish Name",
                "ingredients": ["ingredient1", "ingredient2"],
                "price": 8.99,
                "description": "A high-demand dish adjusted for profit optimization."
            }}
        ]
    }}
}}
"""


# Call Gemini API to generate the menu
response = genai.GenerativeModel("gemini-2.0-flash").generate_content(prompt)
# Validate and save JSON output
menu_output = response.text.strip()
start_index = menu_output.find("{")
end_index = menu_output.rfind("}") + 1

if start_index != -1 and end_index != -1:
    menu_json = json.loads(menu_output[start_index:end_index])  # Parse JSON safely
    output_path = "optimized_menu.json"
    with open(output_path, "w") as json_file:
        json.dump(menu_json, json_file, indent=4)
    print(f"✅ Menu saved successfully: {output_path}")
else:
    print("❌ Error: No valid JSON found in response.")
