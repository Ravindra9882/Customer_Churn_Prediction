import json
import sqlite3
from pathlib import Path

DATABASE_PATH = Path(__file__).resolve().parent / "data" / "churn.db"


def get_connection():
    DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def init_db():
    with get_connection() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS predictions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                customer_payload TEXT NOT NULL,
                churn INTEGER NOT NULL,
                probability REAL NOT NULL,
                risk_level TEXT NOT NULL,
                recommendations TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        connection.commit()


def save_prediction(customer, prediction):
    with get_connection() as connection:
        cursor = connection.execute(
            """
            INSERT INTO predictions (
                customer_payload,
                churn,
                probability,
                risk_level,
                recommendations
            )
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                json.dumps(customer),
                int(prediction["churn"]),
                prediction["probability"],
                prediction["riskLevel"],
                json.dumps(prediction["recommendations"]),
            ),
        )
        connection.commit()
        return cursor.lastrowid


def save_predictions(prediction_records):
    if not prediction_records:
        return []

    with get_connection() as connection:
        ids = []
        for customer, prediction in prediction_records:
            cursor = connection.execute(
                """
                INSERT INTO predictions (
                    customer_payload,
                    churn,
                    probability,
                    risk_level,
                    recommendations
                )
                VALUES (?, ?, ?, ?, ?)
                """,
                (
                    json.dumps(customer),
                    int(prediction["churn"]),
                    prediction["probability"],
                    prediction["riskLevel"],
                    json.dumps(prediction["recommendations"]),
                ),
            )
            ids.append(cursor.lastrowid)
        connection.commit()
        return ids


def get_recent_predictions(limit=10):
    with get_connection() as connection:
        rows = connection.execute(
            """
            SELECT id, customer_payload, churn, probability, risk_level, recommendations, created_at
            FROM predictions
            ORDER BY created_at DESC, id DESC
            LIMIT ?
            """,
            (limit,),
        ).fetchall()

    return [
        {
            "id": row["id"],
            "customer": json.loads(row["customer_payload"]),
            "churn": bool(row["churn"]),
            "probability": row["probability"],
            "riskLevel": row["risk_level"],
            "recommendations": json.loads(row["recommendations"]),
            "createdAt": row["created_at"],
        }
        for row in rows
    ]
