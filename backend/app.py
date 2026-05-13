import os

from flask import Flask, jsonify, request
from flask_cors import CORS

from database import get_recent_predictions, init_db, save_prediction, save_predictions
from model.churn_model import MODEL_PATH, predict_customer_churn

app = Flask(__name__)
CORS(app)

init_db()


@app.get("/api/health")
def health():
    return jsonify({"modelReady": MODEL_PATH.exists(), "status": "ok"})


@app.get("/api/model-info")
def model_info():
    metrics_path = MODEL_PATH.with_name("metrics.txt")
    metrics = metrics_path.read_text(encoding="utf-8") if metrics_path.exists() else ""

    return jsonify(
        {
            "modelReady": MODEL_PATH.exists(),
            "modelName": "Pure Python Logistic Regression" if MODEL_PATH.exists() else "Rule-based fallback",
            "metrics": metrics,
        }
    )


@app.post("/api/predict")
def predict():
    customer = request.get_json(silent=True) or {}
    prediction = predict_customer_churn(customer)
    prediction_id = save_prediction(customer, prediction)

    return jsonify(
        {
            "id": prediction_id,
            "churn": prediction["churn"],
            "probability": prediction["probability"],
            "riskLevel": prediction["riskLevel"],
            "recommendations": prediction["recommendations"],
            "modelType": prediction["modelType"],
        }
    )


@app.post("/api/predict-bulk")
def predict_bulk():
    payload = request.get_json(silent=True) or {}
    customers = payload.get("customers", [])

    if not isinstance(customers, list) or not customers:
        return jsonify({"error": "customers must be a non-empty list"}), 400

    prediction_records = []
    for customer in customers:
        if isinstance(customer, dict):
            prediction_records.append((customer, predict_customer_churn(customer)))

    if not prediction_records:
        return jsonify({"error": "customers must contain valid objects"}), 400

    saved_ids = save_predictions(prediction_records)
    predictions = []

    for index, ((customer, prediction), prediction_id) in enumerate(zip(prediction_records, saved_ids), start=1):
        predictions.append(
            {
                "row": index,
                "id": prediction_id,
                "customer": customer,
                "churn": prediction["churn"],
                "probability": prediction["probability"],
                "riskLevel": prediction["riskLevel"],
                "recommendations": prediction["recommendations"],
                "modelType": prediction["modelType"],
            }
        )

    return jsonify({"count": len(predictions), "predictions": predictions})


@app.get("/api/predictions")
def predictions():
    limit = request.args.get("limit", 25, type=int)
    limit = max(1, min(limit, 100))
    return jsonify({"predictions": get_recent_predictions(limit)})


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
