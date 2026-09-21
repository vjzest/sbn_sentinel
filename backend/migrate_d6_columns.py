import sqlite3

def upgrade_db():
    conn = sqlite3.connect('sentinel.db')
    cursor = conn.cursor()

    try:
        cursor.execute("ALTER TABLE governed_recommendation_mappings ADD COLUMN allowed_action_types_json TEXT;")
        print("Added allowed_action_types_json to governed_recommendation_mappings.")
    except sqlite3.OperationalError as e:
        print("Note: allowed_action_types_json may already exist:", e)

    try:
        cursor.execute("ALTER TABLE governed_recommendations ADD COLUMN intended_target_reference TEXT;")
        print("Added intended_target_reference to governed_recommendations.")
    except sqlite3.OperationalError as e:
        print("Note: intended_target_reference may already exist:", e)

    conn.commit()
    conn.close()
    print("Database upgrade complete.")

if __name__ == "__main__":
    upgrade_db()
