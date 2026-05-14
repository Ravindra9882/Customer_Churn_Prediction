# Customer Churn Prediction System

A final-year-ready full-stack machine learning project for predicting telecom customer churn.

## Features

- React frontend with dark analytics dashboard
- Flask REST API backend
- Single customer churn prediction
- Bulk CSV churn prediction
- SQLite prediction history
- Pure Python Logistic Regression training pipeline
- Saved ML model artifact
- Prediction history dashboard
- Risk distribution and churn split charts
- Click-based frontend pages for Prediction, Bulk Upload, Analytics, and Model

## Project Structure

```text
backend/
  app.py                    Flask API
  database.py               SQLite helper layer
  data/
    training_customers.csv  Training dataset
    sample_customers.csv    Small CSV sample
  model/
    train_model.py          ML training script
    churn_model.py          Prediction module
    churn_model.json        Trained model artifact
    metrics.txt             Accuracy/precision/recall/F1 report

frontend/
  src/main.jsx              React app
  src/styles.css            Dark dashboard styling
```

## Run Locally

### Backend

```bash
cd backend
.venv\Scripts\activate
pip install -r requirements.txt
python model/train_model.py
python app.py
```

Backend runs on:

```text
http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

## API Routes

`GET /api/health`

Checks backend and model readiness.

`GET /api/model-info`

Returns model name and evaluation metrics.

`POST /api/predict`

Predicts churn for one customer.

`POST /api/predict-bulk`

Predicts churn for many customers.

`GET /api/predictions`

Returns the 10 most recent saved predictions.

## Bulk CSV Upload

Use this file for testing:

```text
upload_test_customers.csv
```

Required CSV columns:

```text
customer_id,tenure,monthlyCharges,totalCharges,contract,internetService,paymentMethod,techSupport,onlineSecurity,seniorCitizen,partner,dependents
```

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md).

Important frontend environment variable:

```text
VITE_API_BASE_URL=https://your-backend-url
```
