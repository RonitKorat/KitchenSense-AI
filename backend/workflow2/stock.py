import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error
import json
import google.generativeai as genai
from prophet import Prophet
import sys

# Configure Gemini API key
genai.configure(api_key="AIzaSyBeZR1UE57ipQIN0xgQOIuP1jNmucP13nU")

def predict_optimal_stock(target_date):
    try:
        # Load the dataset
        df = pd.read_csv("final_dataset.csv")

        # Convert date column to datetime format and extract year
        df['date'] = pd.to_datetime(df['date'])
        df['year'] = df['date'].dt.year

        # Calculate waste units (stock level - sale units, ensuring no negative values)
        df['waste_units'] = (df['stock_level'] - df['sale_units']).clip(lower=0)

        # Define features (X) and target (y)
        X = df[['sale_units', 'price', 'year']]
        y = df['waste_units']

        # Split into training and testing datasets
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        # Train Linear Regression model
        reg = LinearRegression()
        reg.fit(X_train, y_train)

        # Predict waste units for the test set
        y_pred = reg.predict(X_test)

        # Create DataFrame to store predictions
        df_test = df.loc[X_test.index, ['item_name']].copy()
        df_test['predicted_waste'] = y_pred

        # Identify high-risk dishes (sorted by highest predicted waste)
        high_risk = df_test.groupby('item_name')['predicted_waste'].mean().sort_values(ascending=False)

        # Convert to JSON format
        high_risk_dish = json.dumps(high_risk.to_dict(), indent=4)

        # List of ingredients
        ingredients = ["apple", "banana", "cucumber", "okra", "orange", "potato", "tomato"]

        high_risk_ml = {}

        # Features for prediction
        features = ['sale_units', 'price', 'year']

        for ing in ingredients:
            waste_col = f"waste_{ing}"
            stock_col = f"stock_{ing}"
            sale_col = "sale_units"  # Using total sale units (no individual sale per ingredient)

            # Calculate waste for each ingredient
            df[waste_col] = (df[stock_col] - df[sale_col]).clip(lower=0)

            # Prepare data for model training
            X = df[features]
            y = df[waste_col]

            # Train-test split
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

            # Train Linear Regression model
            model = LinearRegression()
            model.fit(X_train, y_train)

            # Predict waste units for the test set
            y_pred = model.predict(X_test)
            mse = mean_squared_error(y_test, y_pred)

            # Store average predicted waste as risk factor
            avg_predicted_waste = y_pred.mean()
            high_risk_ml[ing] = avg_predicted_waste

        # Convert to JSON format
        high_risk = pd.Series(high_risk_ml).sort_values(ascending=False)
        high_risk_ingredients = json.dumps(high_risk.to_dict(), indent=4)

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

        # Create JSON object for predicted consumption
        predicted_ingredient_consumption_json = json.dumps({
            "target_date": target_date.strftime("%Y-%m-%d"),
            "predicted_ingredient_consumption": ingredient_totals
        }, indent=4)

        # Format input for Gemini
        prompt = f"""
        Based on the following data:
        - High-risk items with lower predicted sales: {high_risk_dish}
        - High-risk ingredients prone to wastage: {high_risk_ingredients}
        - Predicted ingredient consumption for the upcoming month: {predicted_ingredient_consumption_json}

        Generate a JSON object containing the optimal stock levels for each ingredient. The stock levels should:
        - Ensure sufficient availability while preventing over-purchasing.
        - Minimize wastage based on historical trends and predicted demand.
        - Be data-driven and reliable.

        Strictly return only the JSON object with optimal stock levels, without any additional text or explanations.
        """

        response = genai.GenerativeModel("gemini-2.0-flash").generate_content(prompt)

        # Parse and return the response
        result = json.loads(response.text)
        print(json.dumps(result, indent=4))
        return result

    except Exception as e:
        print(json.dumps({"error": str(e)}, indent=4))
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Please provide target date in YYYY-MM-DD format"}))
        sys.exit(1)
    
    target_date = pd.to_datetime(sys.argv[1])
    predict_optimal_stock(target_date) 