import json
import math
from pathlib import Path

MODEL_PATH = Path(__file__).resolve().parent / "churn_model.json"
MODEL_BUNDLE = None


def load_model_bundle():
    global MODEL_BUNDLE

    if MODEL_BUNDLE is None and MODEL_PATH.exists():
        MODEL_BUNDLE = json.loads(MODEL_PATH.read_text(encoding="utf-8"))

    return MODEL_BUNDLE


def clamp(value, minimum=0.0, maximum=1.0):
    return max(minimum, min(maximum, value))


def to_float(value, fallback=0.0):
    try:
        return float(value)
    except (TypeError, ValueError):
        return fallback


def normalize_category(value):
    return str(value).strip().lower()


def to_bool_text(value):
    return "true" if str(value).strip().lower() in {"true", "yes", "1"} else "false"


def sigmoid(value):
    if value < -500:
        return 0.0
    if value > 500:
        return 1.0
    return 1.0 / (1.0 + math.exp(-value))


def calculate_probability(customer):
    tenure = to_float(customer.get("tenure"))
    monthly_charges = to_float(customer.get("monthlyCharges"))
    total_charges = to_float(customer.get("totalCharges"))

    contract = customer.get("contract", "month-to-month")
    internet_service = customer.get("internetService", "fiber")
    payment_method = customer.get("paymentMethod", "electronic-check")
    tech_support = customer.get("techSupport", "no")
    online_security = customer.get("onlineSecurity", "no")
    senior_citizen = bool(customer.get("seniorCitizen", False))
    partner = bool(customer.get("partner", False))
    dependents = bool(customer.get("dependents", False))

    score = 0.28

    if tenure < 6:
        score += 0.23
    elif tenure < 18:
        score += 0.13
    elif tenure > 48:
        score -= 0.18

    if monthly_charges > 85:
        score += 0.16
    elif monthly_charges > 65:
        score += 0.08

    if total_charges > 0 and tenure > 0:
        average_paid = total_charges / max(tenure, 1)
        if average_paid < monthly_charges * 0.7:
            score += 0.06

    score += {
        "month-to-month": 0.22,
        "one-year": -0.09,
        "two-year": -0.18,
    }.get(contract, 0)

    score += {
        "fiber": 0.11,
        "dsl": 0.03,
        "none": -0.06,
    }.get(internet_service, 0)

    if payment_method == "electronic-check":
        score += 0.11

    if tech_support == "no":
        score += 0.08

    if online_security == "no":
        score += 0.08

    if senior_citizen:
        score += 0.05

    if partner:
        score -= 0.04

    if dependents:
        score -= 0.05

    return clamp(score)


def risk_level(probability):
    if probability >= 0.7:
        return "High"
    if probability >= 0.4:
        return "Medium"
    return "Low"


def recommendations_for(customer):
    recommendations = []

    if customer.get("contract") == "month-to-month":
        recommendations.append("Offer a discounted annual contract.")
    if customer.get("techSupport") == "no":
        recommendations.append("Bundle proactive technical support.")
    if customer.get("onlineSecurity") == "no":
        recommendations.append("Include online security in a retention package.")
    if to_float(customer.get("monthlyCharges")) > 80:
        recommendations.append("Review pricing and offer a loyalty credit.")
    if not recommendations:
        recommendations.append("Keep engagement high with personalized check-ins.")

    return recommendations


def predict_with_trained_model(customer):
    bundle = load_model_bundle()
    if not bundle:
        return None

    features = []
    for column in ["tenure", "monthlyCharges", "totalCharges"]:
        value = to_float(customer.get(column))
        features.append((value - bundle["means"][column]) / bundle["scales"][column])

    for column, options in bundle["categoricalValues"].items():
        raw_value = customer.get(column, "")
        category = to_bool_text(raw_value) if column in {"seniorCitizen", "partner", "dependents"} else normalize_category(raw_value)
        features.extend(1.0 if category == option else 0.0 for option in options)

    linear_value = sum(weight * value for weight, value in zip(bundle["weights"], features)) + bundle["bias"]

    return sigmoid(linear_value)


def predict_customer_churn(customer):
    probability = predict_with_trained_model(customer)
    model_type = "machine-learning"

    if probability is None:
        probability = calculate_probability(customer)
        model_type = "rule-based-fallback"

    return {
        "churn": probability >= 0.5,
        "probability": round(probability, 3),
        "riskLevel": risk_level(probability),
        "recommendations": recommendations_for(customer),
        "modelType": model_type,
    }
