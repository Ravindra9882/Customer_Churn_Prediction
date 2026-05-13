import csv
import json
import math
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_PATH = BASE_DIR / "data" / "training_customers.csv"
MODEL_PATH = BASE_DIR / "model" / "churn_model.json"
METRICS_PATH = BASE_DIR / "model" / "metrics.txt"

FEATURE_COLUMNS = [
    "tenure",
    "monthlyCharges",
    "totalCharges",
    "contract",
    "internetService",
    "paymentMethod",
    "techSupport",
    "onlineSecurity",
    "seniorCitizen",
    "partner",
    "dependents",
]

CATEGORICAL_VALUES = {
    "contract": ["month-to-month", "one-year", "two-year"],
    "internetService": ["fiber", "dsl", "none"],
    "paymentMethod": ["electronic-check", "credit-card", "bank-transfer", "mailed-check"],
    "techSupport": ["yes", "no"],
    "onlineSecurity": ["yes", "no"],
    "seniorCitizen": ["true", "false"],
    "partner": ["true", "false"],
    "dependents": ["true", "false"],
}


def to_float(value):
    try:
        return float(value)
    except (TypeError, ValueError):
        return 0.0


def to_bool_text(value):
    return "true" if str(value).strip().lower() in {"true", "yes", "1"} else "false"


def normalize_category(value):
    return str(value).strip().lower()


def load_rows():
    with DATA_PATH.open(newline="", encoding="utf-8") as file:
        return list(csv.DictReader(file))


def build_feature_names():
    feature_names = ["tenure", "monthlyCharges", "totalCharges"]
    for column, values in CATEGORICAL_VALUES.items():
        for value in values:
            feature_names.append(f"{column}={value}")
    return feature_names


def vectorize(row, means=None, scales=None):
    numeric = {
        "tenure": to_float(row.get("tenure")),
        "monthlyCharges": to_float(row.get("monthlyCharges")),
        "totalCharges": to_float(row.get("totalCharges")),
    }

    values = []
    for column in ["tenure", "monthlyCharges", "totalCharges"]:
        value = numeric[column]
        if means and scales:
            value = (value - means[column]) / scales[column]
        values.append(value)

    for column, options in CATEGORICAL_VALUES.items():
        raw_value = row.get(column, "")
        category = to_bool_text(raw_value) if column in {"seniorCitizen", "partner", "dependents"} else normalize_category(raw_value)
        values.extend(1.0 if category == option else 0.0 for option in options)

    return values


def sigmoid(value):
    if value < -500:
        return 0.0
    if value > 500:
        return 1.0
    return 1.0 / (1.0 + math.exp(-value))


def predict_probability(features, weights, bias):
    return sigmoid(sum(weight * value for weight, value in zip(weights, features)) + bias)


def train_logistic_regression(x_train, y_train, epochs=4500, learning_rate=0.05):
    weights = [0.0 for _ in x_train[0]]
    bias = 0.0

    for _ in range(epochs):
        weight_gradients = [0.0 for _ in weights]
        bias_gradient = 0.0

        for features, actual in zip(x_train, y_train):
            predicted = predict_probability(features, weights, bias)
            error = predicted - actual
            for index, value in enumerate(features):
                weight_gradients[index] += error * value
            bias_gradient += error

        row_count = len(x_train)
        for index in range(len(weights)):
            weights[index] -= learning_rate * weight_gradients[index] / row_count
        bias -= learning_rate * bias_gradient / row_count

    return weights, bias


def calculate_metrics(y_true, probabilities):
    predictions = [1 if probability >= 0.5 else 0 for probability in probabilities]
    total = len(y_true)
    correct = sum(1 for actual, predicted in zip(y_true, predictions) if actual == predicted)
    true_positive = sum(1 for actual, predicted in zip(y_true, predictions) if actual == 1 and predicted == 1)
    true_negative = sum(1 for actual, predicted in zip(y_true, predictions) if actual == 0 and predicted == 0)
    false_positive = sum(1 for actual, predicted in zip(y_true, predictions) if actual == 0 and predicted == 1)
    false_negative = sum(1 for actual, predicted in zip(y_true, predictions) if actual == 1 and predicted == 0)

    precision = true_positive / max(true_positive + false_positive, 1)
    recall = true_positive / max(true_positive + false_negative, 1)
    f1 = 2 * precision * recall / max(precision + recall, 0.00001)

    return {
        "accuracy": correct / total,
        "precision": precision,
        "recall": recall,
        "f1": f1,
        "confusionMatrix": {
            "truePositive": true_positive,
            "trueNegative": true_negative,
            "falsePositive": false_positive,
            "falseNegative": false_negative,
        },
    }


def train_model():
    rows = load_rows()
    split_index = int(len(rows) * 0.75)
    train_rows = rows[:split_index]
    test_rows = rows[split_index:]

    means = {}
    scales = {}
    for column in ["tenure", "monthlyCharges", "totalCharges"]:
        values = [to_float(row[column]) for row in train_rows]
        means[column] = sum(values) / len(values)
        variance = sum((value - means[column]) ** 2 for value in values) / len(values)
        scales[column] = math.sqrt(variance) or 1.0

    x_train = [vectorize(row, means, scales) for row in train_rows]
    y_train = [1 if normalize_category(row["churn"]) == "yes" else 0 for row in train_rows]
    x_test = [vectorize(row, means, scales) for row in test_rows]
    y_test = [1 if normalize_category(row["churn"]) == "yes" else 0 for row in test_rows]

    weights, bias = train_logistic_regression(x_train, y_train)
    probabilities = [predict_probability(features, weights, bias) for features in x_test]
    metrics = calculate_metrics(y_test, probabilities)

    MODEL_PATH.write_text(
        json.dumps(
            {
                "modelName": "Pure Python Logistic Regression",
                "featureColumns": FEATURE_COLUMNS,
                "featureNames": build_feature_names(),
                "categoricalValues": CATEGORICAL_VALUES,
                "means": means,
                "scales": scales,
                "weights": weights,
                "bias": bias,
                "metrics": metrics,
            },
            indent=2,
        ),
        encoding="utf-8",
    )

    METRICS_PATH.write_text(
        "\n".join(
            [
                "Customer Churn Prediction Model",
                "Model: Pure Python Logistic Regression",
                f"Accuracy: {metrics['accuracy']:.3f}",
                f"Precision: {metrics['precision']:.3f}",
                f"Recall: {metrics['recall']:.3f}",
                f"F1 Score: {metrics['f1']:.3f}",
                "",
                "Confusion Matrix:",
                json.dumps(metrics["confusionMatrix"], indent=2),
            ]
        ),
        encoding="utf-8",
    )

    print(f"Model saved to {MODEL_PATH}")
    print(f"Metrics saved to {METRICS_PATH}")
    print(f"Accuracy: {metrics['accuracy']:.3f}")


if __name__ == "__main__":
    train_model()
