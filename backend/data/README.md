# Backend Data

This folder contains backend data assets.

- `sample_customers.csv`: small example dataset for testing and future model training.
- `churn.db`: SQLite database created automatically when the Flask app starts.

The current app uses a transparent rule-based churn model in `backend/model/churn_model.py`.
You can later replace that module with a trained scikit-learn model while keeping the Flask routes and database layer mostly unchanged.

