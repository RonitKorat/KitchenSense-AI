from flask import Flask, jsonify, request
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)

# Mock data for demonstration
inventory_data = {
    "items": [
        {"id": 1, "name": "Tomatoes", "quantity": 50, "unit": "kg", "expiry_date": "2024-03-30"},
        {"id": 2, "name": "Chicken", "quantity": 20, "unit": "kg", "expiry_date": "2024-03-29"},
    ]
}

waste_analytics = {
    "daily_waste": 5.2,
    "weekly_waste": 35.8,
    "monthly_waste": 150.3,
    "waste_by_category": {
        "vegetables": 40,
        "meat": 30,
        "dairy": 20,
        "other": 10
    }
}

@app.route('/')
def home():
    return jsonify({
        "message": "Welcome to Smart Kitchen API",
        "version": "1.0.0"
    })

# Inventory Management Routes
@app.route('/api/inventory', methods=['GET'])
def get_inventory():
    return jsonify(inventory_data)

@app.route('/api/inventory/scan', methods=['POST'])
def scan_inventory():
    # This would integrate with computer vision for real-time scanning
    return jsonify({"message": "Inventory scan completed"})

# Waste Analytics Routes
@app.route('/api/analytics/waste', methods=['GET'])
def get_waste_analytics():
    return jsonify(waste_analytics)

@app.route('/api/analytics/predictions', methods=['GET'])
def get_predictions():
    # This would integrate with ML models for spoilage prediction
    return jsonify({
        "predictions": [
            {
                "item": "Tomatoes",
                "spoilage_probability": 0.15,
                "recommended_action": "Use within 2 days"
            }
        ]
    })

# Menu Optimization Routes
@app.route('/api/menu/optimize', methods=['POST'])
def optimize_menu():
    # This would integrate with ML for menu optimization
    return jsonify({
        "optimized_menu": [
            {
                "dish": "Margherita Pizza",
                "waste_reduction": "15%",
                "profit_increase": "8%"
            }
        ]
    })

# Insights Dashboard Routes
@app.route('/api/insights', methods=['GET'])
def get_insights():
    return jsonify({
        "insights": [
            {
                "type": "waste_reduction",
                "message": "Reduce tomato order by 20% next week",
                "impact": "Potential savings: $150"
            },
            {
                "type": "inventory_alert",
                "message": "Chicken stock running low",
                "severity": "high"
            }
        ]
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
