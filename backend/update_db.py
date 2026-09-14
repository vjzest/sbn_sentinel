import sqlite3
conn = sqlite3.connect('sentinel.db')
conn.execute("UPDATE users SET role = 'Organization Administrator' WHERE role = 'Unassigned'")
conn.commit()
conn.close()
