import os
import sys
import django
from django.db import connections
from django.db.utils import OperationalError

def test_connection():
    print("Initializing Django settings...")
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
    try:
        django.setup()
    except Exception as e:
        print(f"Error loading Django settings: {e}")
        return False

    db_conn = connections['default']
    print(f"Connecting to database '{db_conn.settings_dict['NAME']}' on {db_conn.settings_dict['HOST']}:{db_conn.settings_dict['PORT']} as user '{db_conn.settings_dict['USER']}'...")
    try:
        db_conn.cursor()
        print("\n[SUCCESS] Successfully connected to the PostgreSQL database!")
        return True
    except OperationalError as e:
        print("\n[ERROR] Database connection failed!")
        print(f"Details: {e}")
        print("\nPlease check that:")
        print("1. Your PostgreSQL server is running.")
        print("2. You have created the database specified in DB_NAME.")
        print("3. Your credentials (DB_USER, DB_PASSWORD, DB_HOST, DB_PORT) in '.env' are correct.")
        return False

if __name__ == "__main__":
    success = test_connection()
    sys.exit(0 if success else 1)
