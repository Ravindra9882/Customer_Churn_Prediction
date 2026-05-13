# Customer Churn Prediction System

## Final Year Project Report

### Submitted By

Name: ___________________________

Roll Number: ____________________

Department: _____________________

Institution: ____________________

Academic Year: __________________

---

## Abstract

Customer churn is one of the most important business problems faced by subscription-based companies such as telecom, internet service, banking, and SaaS providers. Losing existing customers directly affects revenue and increases the cost of customer acquisition. The Customer Churn Prediction System is a full-stack machine learning web application developed to predict whether a customer is likely to discontinue a service.

The project uses a Flask backend, React frontend, SQLite database, and a pure Python logistic regression model. Users can enter customer details manually or upload a CSV file for bulk prediction. The system predicts churn probability, classifies the customer into a risk category, stores prediction history, and displays analytics through a dashboard. The project demonstrates the practical use of machine learning, REST APIs, database storage, and modern frontend development in solving a real-world business problem.

---

## Table of Contents

1. Introduction
2. Problem Statement
3. Objectives
4. Scope of the Project
5. Existing System
6. Proposed System
7. Technology Stack
8. System Architecture
9. Dataset Description
10. Machine Learning Model
11. System Modules
12. Database Design
13. API Design
14. Implementation Details
15. Testing
16. Results and Output
17. Advantages
18. Limitations
19. Future Enhancements
20. Conclusion
21. References

---

## 1. Introduction

Customer churn refers to the loss of customers who stop using a company's product or service. In highly competitive markets, retaining existing customers is often more cost-effective than acquiring new ones. Businesses therefore need systems that can identify high-risk customers early and support timely retention actions.

This project focuses on predicting customer churn using customer profile information such as tenure, monthly charges, total charges, contract type, internet service, payment method, technical support, online security, senior citizen status, partner status, and dependent status.

The system provides a complete workflow:

- Customer data entry through a web interface
- Churn prediction using a trained model
- Risk classification as Low, Medium, or High
- Retention recommendations
- Bulk CSV upload for multiple customers
- Prediction history storage
- Analytics dashboard for visual interpretation

---

## 2. Problem Statement

Companies often lose customers without identifying the warning signs early enough. Manual analysis of customer behavior is time-consuming, inconsistent, and difficult to scale. There is a need for an automated system that can analyze customer attributes and predict the likelihood of churn.

The problem addressed in this project is:

> To design and develop a web-based machine learning system that predicts customer churn probability and helps businesses identify customers who require retention actions.

---

## 3. Objectives

The main objectives of this project are:

- To develop a machine learning model for customer churn prediction.
- To build a Flask REST API for serving predictions.
- To create a React-based user interface for entering customer details.
- To support bulk churn prediction through CSV upload.
- To store prediction history using SQLite.
- To display analytics such as risk distribution, churn split, and recent predictions.
- To provide model metrics for demonstration and viva purposes.
- To make the project suitable for local execution and cloud deployment.

---

## 4. Scope of the Project

The project is designed as an academic and demonstration-ready churn prediction system. It can be used by telecom or subscription-based companies to estimate customer churn risk from structured customer data.

The scope includes:

- Single customer churn prediction
- Bulk customer churn prediction
- Machine learning model training
- Prediction history management
- Dashboard-based analytics
- Deployment configuration for hosting platforms

The system is not intended to replace enterprise-scale churn systems but demonstrates the core concepts and implementation approach.

---

## 5. Existing System

In traditional systems, customer churn is often identified using manual reports, spreadsheet analysis, or simple business rules. These methods have several drawbacks:

- Manual analysis is slow and error-prone.
- It is difficult to process large customer datasets efficiently.
- Rule-based decisions may not capture complex patterns.
- There is limited support for real-time prediction.
- Historical prediction tracking is often missing.

---

## 6. Proposed System

The proposed system automates churn prediction using a machine learning model and provides a user-friendly web interface. It allows users to enter customer details, receive churn probability, view risk level, and get retention recommendations.

The system also supports CSV upload, allowing multiple customers to be scored together. Prediction results are saved in a SQLite database and used to generate analytics.

Key features of the proposed system:

- Full-stack web application
- REST API based backend
- React dashboard frontend
- Machine learning based churn prediction
- Bulk CSV upload
- SQLite prediction history
- Analytics dashboard
- Model performance display

---

## 7. Technology Stack

### Frontend

- React.js
- Vite
- JavaScript
- CSS
- Lucide React icons

### Backend

- Python
- Flask
- Flask-CORS
- Gunicorn

### Database

- SQLite

### Machine Learning

- Pure Python Logistic Regression
- JSON-based model artifact

### Deployment Support

- Render
- Vercel or Netlify for frontend

---

## 8. System Architecture

The system follows a client-server architecture.

```text
User
 |
 | interacts with
 v
React Frontend
 |
 | HTTP requests
 v
Flask REST API
 |
 | uses
 v
Machine Learning Model
 |
 | stores results in
 v
SQLite Database
```

### Architecture Explanation

The user interacts with the React frontend. The frontend sends prediction requests to the Flask backend using REST API calls. The backend loads the trained model, processes the input data, generates predictions, and stores the results in the SQLite database. The frontend also fetches prediction history and model metrics from the backend.

---

## 9. Dataset Description

The dataset used in this project contains customer information related to telecom services. The model uses the following input features:

| Feature | Description |
|---|---|
| tenure | Number of months the customer has stayed with the company |
| monthlyCharges | Monthly amount charged to the customer |
| totalCharges | Total amount charged to the customer |
| contract | Contract type such as month-to-month, one-year, or two-year |
| internetService | Type of internet service used |
| paymentMethod | Customer payment method |
| techSupport | Whether the customer has technical support |
| onlineSecurity | Whether online security service is enabled |
| seniorCitizen | Whether the customer is a senior citizen |
| partner | Whether the customer has a partner |
| dependents | Whether the customer has dependents |
| churn | Target output indicating whether the customer churned |

The training dataset is stored at:

```text
backend/data/training_customers.csv
```

A sample CSV file for testing bulk upload is provided as:

```text
upload_test_customers.csv
```

---

## 10. Machine Learning Model

The project uses a pure Python implementation of Logistic Regression. Logistic Regression is suitable for binary classification problems where the output has two possible classes, such as churn or not churn.

### Model Workflow

1. Load customer records from the training CSV file.
2. Separate input features and target output.
3. Normalize numeric features such as tenure, monthly charges, and total charges.
4. Encode categorical values using one-hot encoding.
5. Split the dataset into training and testing data.
6. Train logistic regression using gradient descent.
7. Evaluate the model using accuracy, precision, recall, F1 score, and confusion matrix.
8. Save the trained model as a JSON artifact.

### Model Artifact

The trained model is saved at:

```text
backend/model/churn_model.json
```

### Model Metrics

The current model metrics are stored at:

```text
backend/model/metrics.txt
```

Current recorded metrics:

| Metric | Value |
|---|---:|
| Accuracy | 1.000 |
| Precision | 1.000 |
| Recall | 1.000 |
| F1 Score | 1.000 |

Note: These metrics are based on the current small demonstration dataset. For production-level use, a larger real-world dataset should be used.

---

## 11. System Modules

### 11.1 Prediction Module

The prediction module allows the user to enter details of a single customer. After submitting the form, the backend returns:

- Churn prediction
- Churn probability
- Risk level
- Retention recommendations
- Model type

### 11.2 Bulk Upload Module

The bulk upload module allows the user to upload a CSV file containing multiple customer records. The system reads the CSV file, sends the records to the backend, and displays predictions in tabular format.

### 11.3 Analytics Module

The analytics module displays insights from saved prediction history, including:

- Total saved predictions
- Average churn risk
- High-risk customer count
- Latest prediction record
- Risk distribution
- Churn split

### 11.4 Model Information Module

The model information page shows:

- Model name
- Model readiness status
- Accuracy
- Precision
- Recall
- F1 score
- Confusion matrix

### 11.5 Database Module

The database module stores prediction records in SQLite. This allows the analytics dashboard to display historical prediction data.

---

## 12. Database Design

The project uses SQLite for storing prediction history.

Database file:

```text
backend/data/churn.db
```

Table name:

```text
predictions
```

### Table Structure

| Column | Type | Description |
|---|---|---|
| id | INTEGER | Primary key |
| customer_payload | TEXT | Customer input data stored as JSON text |
| churn | INTEGER | Churn prediction value |
| probability | REAL | Predicted churn probability |
| risk_level | TEXT | Low, Medium, or High |
| recommendations | TEXT | Retention recommendations stored as JSON text |
| created_at | TIMESTAMP | Prediction creation time |

---

## 13. API Design

The Flask backend exposes the following REST API endpoints:

### Health Check

```text
GET /api/health
```

Returns backend status and model readiness.

### Model Information

```text
GET /api/model-info
```

Returns model name, readiness status, and metrics.

### Single Prediction

```text
POST /api/predict
```

Accepts one customer object and returns churn prediction.

### Bulk Prediction

```text
POST /api/predict-bulk
```

Accepts a list of customer objects and returns predictions for all valid rows.

### Prediction History

```text
GET /api/predictions
```

Returns recent prediction records from SQLite.

---

## 14. Implementation Details

### Backend Implementation

The backend is implemented using Flask. The main backend file is:

```text
backend/app.py
```

It initializes the Flask application, enables CORS, connects to the database layer, and defines API routes.

The database logic is implemented in:

```text
backend/database.py
```

The model prediction logic is implemented in:

```text
backend/model/churn_model.py
```

The model training pipeline is implemented in:

```text
backend/model/train_model.py
```

### Frontend Implementation

The frontend is implemented using React. The main frontend file is:

```text
frontend/src/main.jsx
```

The styling is implemented in:

```text
frontend/src/styles.css
```

The frontend communicates with the backend using the API base URL:

```text
VITE_API_BASE_URL
```

If the environment variable is not provided, the frontend uses:

```text
http://localhost:5000
```

---

## 15. Testing

The project was tested using backend checks, frontend build checks, and API smoke testing.

### Test Cases

| Test Case | Expected Result | Status |
|---|---|---|
| Start Flask backend | Server starts without syntax errors | Passed |
| Health API | Returns status ok and model readiness | Passed |
| Single prediction API | Returns churn result and probability | Passed |
| Bulk prediction with CSV | Returns prediction list | Passed |
| Prediction history API | Returns saved predictions | Passed |
| React production build | Build completes successfully | Passed |
| Model info page | Displays model metrics | Passed |

### Verified Commands

Backend syntax check:

```bash
python -m py_compile backend/app.py backend/database.py backend/model/churn_model.py backend/model/train_model.py
```

Frontend production build:

```bash
cd frontend
npm run build
```

---

## 16. Results and Output

The system successfully predicts customer churn for both individual and bulk customer records. It provides risk levels and recommendations based on the model output.

### Example Output

```json
{
  "churn": true,
  "probability": 0.86,
  "riskLevel": "High",
  "recommendations": [
    "Offer a discounted annual contract.",
    "Bundle proactive technical support.",
    "Include online security in a retention package."
  ],
  "modelType": "machine-learning"
}
```

### Dashboard Output

The dashboard displays:

- Churn probability gauge
- Risk level indicator
- Retention recommendations
- Bulk prediction table
- Prediction history table
- Risk distribution chart
- Churn split chart
- Model performance report

---

## 17. Advantages

- Easy-to-use web interface
- Supports both single and bulk predictions
- Uses a transparent machine learning model
- Stores prediction history
- Provides analytics dashboard
- Gives retention recommendations
- Can be deployed using common hosting platforms
- Suitable for academic demonstration and viva

---

## 18. Limitations

- The current dataset is small and mainly suitable for demonstration.
- The model metrics may be overly high because of limited test data.
- The frontend CSV parser handles simple CSV files and not all advanced CSV formats.
- No authentication or user management is implemented.
- The SQLite database is suitable for small-scale use, not high-volume production systems.

---

## 19. Future Enhancements

The project can be improved in the following ways:

- Use a larger real-world telecom churn dataset.
- Add advanced ML models such as Random Forest, XGBoost, or Neural Networks.
- Add model comparison and feature importance visualization.
- Add user authentication and role-based access.
- Export prediction results as PDF or CSV.
- Add automated unit and integration tests.
- Use PostgreSQL or MySQL for production deployment.
- Add scheduled retraining of the model.
- Improve CSV parsing for quoted fields and complex data.
- Add explainable AI techniques such as SHAP or LIME.

---

## 20. Conclusion

The Customer Churn Prediction System successfully demonstrates how machine learning can be integrated with a full-stack web application to solve a practical business problem. The system predicts churn risk, provides retention recommendations, supports bulk upload, stores prediction history, and displays analytics through a dashboard.

The project combines important final-year project concepts including machine learning, REST API development, frontend development, database management, and deployment readiness. With a larger dataset and further enhancements, the system can be extended into a more powerful business intelligence tool for customer retention.

---

## 21. References

- Python Documentation: https://docs.python.org/
- Flask Documentation: https://flask.palletsprojects.com/
- React Documentation: https://react.dev/
- Vite Documentation: https://vite.dev/
- SQLite Documentation: https://www.sqlite.org/docs.html
- Logistic Regression Concept: Machine Learning classification theory

