import os
import json
import logging
import firebase_admin
from firebase_admin import credentials, firestore

# ----------------- Firebase Initialization -----------------

def _build_credentials() -> credentials.Certificate:
    env_credentials = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    inline_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
    local_fallback = os.path.join(os.getcwd(), "serviceAccountKey.json")

    if env_credentials and os.path.isfile(env_credentials):
        logging.info(f"Using Firebase service account file: {env_credentials}")
        return credentials.Certificate(env_credentials)

    if inline_json:
        try:
            logging.info("Using Firebase service account from FIREBASE_SERVICE_ACCOUNT_JSON env var")
            return credentials.Certificate(json.loads(inline_json))
        except json.JSONDecodeError as exc:
            raise ValueError("FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON") from exc

    if env_credentials:
        try:
            logging.info("Using Firebase service account JSON from GOOGLE_APPLICATION_CREDENTIALS env var")
            return credentials.Certificate(json.loads(env_credentials))
        except json.JSONDecodeError:
            raise FileNotFoundError(
                f"GOOGLE_APPLICATION_CREDENTIALS is set but is not a file path and not valid JSON: {env_credentials}"
            )

    if os.path.isfile(local_fallback):
        logging.info(f"Using Firebase service account file: {local_fallback}")
        return credentials.Certificate(local_fallback)

    raise FileNotFoundError(
        "Firebase service account not found. Provide one of: "
        "(1) GOOGLE_APPLICATION_CREDENTIALS as a mounted file path, "
        "(2) FIREBASE_SERVICE_ACCOUNT_JSON as raw JSON, "
        "or (3) serviceAccountKey.json in the backend folder."
    )


cred = _build_credentials()
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred, {
        "projectId": os.getenv("FIREBASE_PROJECT_ID", "react-deploy-d9306")
    })

# Firestore client
db = firestore.client()

# ----------------- Helper Functions -----------------

def get_document(collection: str, doc_id: str) -> dict | None:
    """Fetch a single document by its ID."""
    doc_ref = db.collection(collection).document(doc_id)
    doc = doc_ref.get()
    if doc.exists:
        data = doc.to_dict()
        data["id"] = doc.id
        return data
    return None

def get_all_documents(collection: str) -> list[dict]:
    """Fetch all documents from a collection."""
    docs = db.collection(collection).stream()
    results = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        results.append(data)
    return results

def query_documents(collection: str, field: str, operator: str, value) -> list[dict]:
    """Query documents by a single field condition."""
    docs = db.collection(collection).where(field, operator, value).stream()
    results = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        results.append(data)
    return results

def add_document(collection: str, data: dict, doc_id: str = None) -> str:
    """Add a document. If doc_id is provided, use it as the document ID; otherwise auto-generate."""
    if doc_id:
        db.collection(collection).document(doc_id).set(data)
        return doc_id
    else:
        _, doc_ref = db.collection(collection).add(data)
        return doc_ref.id

def update_document(collection: str, doc_id: str, data: dict) -> None:
    """Update fields on an existing document."""
    db.collection(collection).document(doc_id).update(data)

def delete_document(collection: str, doc_id: str) -> None:
    """Delete a document by its ID."""
    db.collection(collection).document(doc_id).delete()