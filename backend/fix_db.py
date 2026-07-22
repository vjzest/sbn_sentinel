import sqlite3
conn = sqlite3.connect("sentinel.db")
cursor = conn.cursor()
try:
    cursor.execute("ALTER TABLE encounters ADD COLUMN payer_network VARCHAR DEFAULT 'Uninsured'")
except Exception as e:
    print(e)
try:
    cursor.execute("ALTER TABLE encounters ADD COLUMN cpt_code VARCHAR DEFAULT '99213'")
except Exception as e:
    print(e)
try:
    cursor.execute("ALTER TABLE encounters ADD COLUMN billing_amount FLOAT DEFAULT 95.0")
except Exception as e:
    print(e)
conn.commit()
conn.close()
print("Table patched.")
