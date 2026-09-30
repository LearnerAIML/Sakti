FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 HOST=0.0.0.0 PORT=8000 ENVIRONMENT=production
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend ./backend
COPY frontend/static ./frontend/static
COPY data ./data
COPY scripts ./scripts
COPY tests/eval_questions.json ./tests/eval_questions.json
RUN useradd -m sakti && chown -R sakti /app
USER sakti
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=5s CMD python -c "import urllib.request;urllib.request.urlopen('http://127.0.0.1:8000/health')" || exit 1
# Set GEMINI_API_KEY (and ADMIN_TOKEN) as runtime environment variables on your host.
CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
