# 🚀 AI-Powered Smart Kitchen & Waste Minimizer

Are you looking to optimize inventory, reduce waste, and enhance efficiency in your kitchen? **AI-Powered Smart Kitchen & Waste Minimizer** is your ultimate solution! Leveraging advanced **Computer Vision, AI, and Predictive Analytics**, this system helps restaurants and food businesses streamline operations, reduce food waste, and maximize profit.

---

## 🔥 Key Features

- 📺 **Computer Vision for Smart Inventory Management**
  - **Visual Inventory Tracking**: Uses **YOLOv8** for object detection and **Custom CNN Model** for classifying fresh/spoiled ingredients and done stock prediction.
  - **Food Spoilage Detection**: Combines **YOLO** and **Custom CNN Model** for detecting spoiled food items.

- 🤖 **AI-Powered Demand & Waste Prediction**
  - **Sales Forecasting**:
    - **Long-Term Trends**: **Prophet model** forecasts sales using seasonality.
    - **Short-Term Adjustments**: **XGBoost model** predicts based on past sales & pricing factors.
    - **Final Prediction**: Weighted combination (**70% Prophet, 30% XGBoost**).
  - **Historical Comparison**:
    - Extracts past sales data for the same date (2010-2024) and compares predicted vs. historical ingredient consumption.
  - **Waste Prediction**:
    - Calculates daily waste levels based on sales and stock data.
    - **Predicting High-Waste Dishes**: Linear Regression identifies dishes contributing most to waste.
    - **Ingredient-Specific Waste Analysis**: Ranks ingredients by predicted waste for optimized procurement planning.
  - **Dynamic Inventory Replenishment**:
    - Analyzes waste trends to rank high-risk dishes & ingredients.
    - Predicts ingredient consumption based on sales and recipes.
    - Applies buffer stock (5-15%) for volatile ingredients.
    - Uses **Google Gemini AI** for dynamic stock optimization.

- 🍜 **Intelligent Menu Optimization**
  - **AI-Driven Recipe Recommendations**: Utilizes **historical consumption, waste predictions, and restaurant-specific data**.
  - **Cost Optimization**: Suggests **nearly spoiled ingredients** usage via **Gemini AI**.
  - **Custom Dish Creation**: Generates new dish ideas using **Gemini API**, considering **previous day's waste prediction** and **sales data** to create sustainable and optimized menu items.


- 📊 **Vision-Powered Waste Analysis & Reporting**
  - **Food Waste Classification**: Uses **YOLO** for waste identification.
  - **Waste Heatmap** (Future Work)
  - **Loss-to-Profit Dashboard**:
    - Computes **wastage (stock - sales units)**.
    - Calculates **profit (total revenue - total cost)**.
    - Visualizes financial impact through **charts & dashboards**.
    - Enables data-driven decision-making to **reduce waste & maximize profit**.

---

## 🛠️ Tech Stack

- **Backend**: Flask (Python)
- **Frontend**: React (JavaScript), Tailwind CSS
- **AI/ML**: Gemini API, YOLOv8, EfficientNetV2, Prophet, XGBoost, Linear Regression
- **Database**: Mongodb
- **Runtime**: Node.js (for frontend development and additional tasks)

---

## ⚡ Quick Start

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/MeetAghara512/HackNUThon  # Replace with your repo URL
cd HackNUThon
```

### 2️⃣ Backend Setup (Flask)

```bash
# Create a virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install backend dependencies
pip install -r requirements.txt

# Run the Flask app
python app.py
```

### 3️⃣ Frontend Setup (React)

```bash
cd frontend  # Navigate to the frontend directory
npm install  # Install frontend dependencies
npm run dev   # Start the React development server
```

### 4️⃣ Configuration

You'll need to configure API keys for **Gemini AI**. Refer to the project's configuration files (e.g., `.env`) for how to set these up. **Do not commit API keys directly to your repository.**

### 5️⃣ Start Optimizing!

Once the backend and frontend are running, you can access the application through your web browser.

- Upload inventory images/videos for real-time tracking.
- View AI-driven **sales forecasts & waste predictions**.
- Optimize ingredient usage & menu offerings.

---

## 🚀 Future Enhancements

- 📊 **Advanced Analytics**: More detailed waste tracking & profitability insights.
- ⚙️ **Customizable Inventory Settings**: User-defined ingredient thresholds & alert systems.
- 🌐 **Multilingual Support**: Expand accessibility for global users.
- 💾 **Data Exporting**: Allow users to save reports in **CSV, Excel, or PDF** formats.
- ✅ **User Feedback Integration**: Collect user input to refine AI-driven recommendations.

---

🌟 **AI-Powered Smart Kitchen & Waste Minimizer**: Reducing waste, maximizing profit, and making kitchens smarter! 🚀

