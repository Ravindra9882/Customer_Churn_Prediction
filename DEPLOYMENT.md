# Deployment Guide

## Backend

Recommended platform: Render, Railway, or any Python web host.

Build command:

```bash
pip install -r requirements.txt
python model/train_model.py
```

Start command:

```bash
gunicorn app:app
```

Important files:

- `backend/requirements.txt`
- `backend/Procfile`
- `backend/model/train_model.py`
- `backend/model/churn_model.json`

## Frontend

Recommended platform: Vercel, Netlify, or Render Static Site.

Build command:

```bash
npm install
npm run build
```

Publish directory:

```text
dist
```

Environment variable:

```text
VITE_API_BASE_URL=https://your-backend-url
```

## Render Blueprint

The root `render.yaml` can deploy both services. After deployment, update `VITE_API_BASE_URL` with the actual backend URL if Render gives a different service URL.
