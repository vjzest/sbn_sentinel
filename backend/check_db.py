from sqlalchemy import create_engine, text
engine = create_engine("sqlite:///sbn_sentinel.db") 
try:
    with engine.connect() as conn:
        result = conn.execute(text("SELECT count(*) FROM encounters"))
        print("Encounters count:", result.fetchone())
except Exception as e:
    print("Error querying encounters:", e)
