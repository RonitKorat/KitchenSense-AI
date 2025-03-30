import pandas as pd
import numpy as np
from prophet import Prophet
import json
from pathlib import Path
import logging

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def predict_ingredient_consumption(custom_month, custom_year):
    try:
        # Define the path to the CSV file
        csv_path = Path(__file__).parent / 'data' / 'menu_dataset_final.csv'
        logger.info(f"Reading CSV file from: {csv_path}")
        
        # Load csv file
        df = pd.read_csv(csv_path)
        logger.info(f"Successfully loaded CSV file with {len(df)} rows")

        # Convert input to target date
        target_date = pd.to_datetime(f"{custom_year}-{pd.to_datetime(custom_month, format='%B').month:02d}-01")
        logger.info(f"Target date set to: {target_date}")

        # Define recipes with ingredient quantities
        recipes = {
            "Tropical Fruit Salad": {"apple": 150, "banana": 100, "oranges": 130, "cucumber": 0, "okra": 0, "patato": 0, "tomato": 0},
            "Garden Vegetable Medley": {"cucumber": 75, "okra": 60, "tomato": 50, "apple": 0, "banana": 0, "oranges": 0, "patato": 0},
            "Hearty Potato Curry": {"patato": 150, "tomato": 50, "okra": 60, "apple": 0, "banana": 0, "cucumber": 0, "oranges": 0},
            "Fruity Veggie Smoothie": {"apple": 100, "banana": 100, "cucumber": 75, "oranges": 130, "okra": 0, "patato": 0, "tomato": 0},
            "Spicy Veggie Stir-Fry": {"patato": 150, "tomato": 50, "okra": 60, "cucumber": 75, "apple": 0, "banana": 0, "oranges": 0}
        }

        # Initialize a dictionary to hold total predicted consumption per ingredient
        ingredient_totals = {}

        # Get list of unique items
        items = df['item_name'].unique()
        logger.info(f"Found {len(items)} unique menu items")

        for item in items:
            logger.debug(f"Processing item: {item}")
            df_item = df[df['item_name'] == item].copy()
            
            # Convert dates
            df_item['ds'] = pd.to_datetime(
                df_item['year'].astype(str) + '-' +
                df_item['month'].apply(lambda x: str(pd.to_datetime(x, format='%B').month).zfill(2)) + '-01'
            )
            
            # Prepare data for Prophet
            df_item = df_item.sort_values("ds")[['ds', 'sale_units']].rename(columns={'sale_units': 'y'})
            
            try:
                # Fit Prophet model on historical data for the item
                model = Prophet()
                model.fit(df_item)
                
                # Create a DataFrame for target date prediction
                future_df = pd.DataFrame({'ds': [target_date]})
                forecast = model.predict(future_df)
                
                predicted_sales = forecast['yhat'].iloc[0]
                logger.debug(f"Predicted sales for {item}: {predicted_sales}")
                
                if item in recipes:
                    for ing, grams in recipes[item].items():
                        consumption = predicted_sales * grams
                        ingredient_totals[ing] = ingredient_totals.get(ing, 0) + consumption
                        logger.debug(f"Added {consumption}g of {ing} from {item}")
                        
            except Exception as e:
                logger.error(f"Error processing item {item}: {str(e)}")
                continue

        # Round the values to integers
        ingredient_totals = {k: int(np.round(v)) for k, v in ingredient_totals.items()}
        logger.info("Successfully calculated ingredient totals")

        # Create JSON object
        predicted_ingredient_consumption_json = {
            "target_month": custom_month,
            "target_year": custom_year,
            "predicted_ingredient_consumption": ingredient_totals
        }

        return predicted_ingredient_consumption_json

    except Exception as e:
        logger.error(f"Error in predict_ingredient_consumption: {str(e)}")
        raise

if __name__ == "__main__":
    # Example usage
    try:
        custom_month = input("Enter the month: ")
        custom_year = input("Enter the year: ")
        
        result = predict_ingredient_consumption(custom_month, custom_year)
        print(json.dumps(result, indent=4))
    except Exception as e:
        print(f"Error: {str(e)}") 