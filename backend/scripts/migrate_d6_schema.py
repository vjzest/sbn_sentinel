from app.db.database import engine
import json
from sqlalchemy import inspect, text
import os
import sys

# Add src/runtime to path so imports work
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../src/runtime')))

D6_COLUMNS = {
    "governed_recommendation_mappings": [
        ("allowed_action_types_json", "TEXT"),
    ],
    "governed_recommendations": [
        ("intended_target_reference", "TEXT"),
    ],
    "governed_actions": [
        ("execute_by", "TEXT"),
        ("intent_hash", "TEXT"),
    ],
    "governed_execution_attempts": [
        ("attempt_number", "INTEGER"),
        ("connector", "TEXT"),
        ("request_reference", "TEXT"),
        ("response_reference", "TEXT"),
        ("error_message", "TEXT"),
    ],
    "governed_outcomes": [
        ("source_reference", "TEXT"),
        ("closure_reason", "TEXT"),
        ("confirmed_at", "TEXT"),
        ("closed_at", "TEXT"),
        ("reopened_at", "TEXT"),
    ],
    "intel_decision_contexts": [
        ("operational_target_reference", "TEXT"),
        ("operational_target_type", "TEXT"),
    ]
}


def existing_columns(conn, table):
    return {c["name"] for c in inspect(conn).get_columns(table)}


def migrate():
    print("Starting D6 idempotent schema migration...")
    with engine.begin() as conn:
        for table_name, columns in D6_COLUMNS.items():
            try:
                present = existing_columns(conn, table_name)
                for name, ddl_type in columns:
                    if name not in present:
                        conn.execute(text(f"ALTER TABLE {table_name} ADD COLUMN {name} {ddl_type}"))
                        print(f"Added column {name} to {table_name}")
            except Exception as e:
                print(f"Skipping table {table_name}: {e}")

        try:
            conn.execute(text(
                "CREATE UNIQUE INDEX IF NOT EXISTS "
                "uq_governed_actions_intent_hash "
                "ON governed_actions(intent_hash)"
            ))
            print("Created unique index uq_governed_actions_intent_hash")
        except Exception as e:
            print(f"Index creation skipped/failed: {e}")

    CANONICAL_ACTIONS = {
        "REC-MAP-001": ["RESCHEDULE_APPOINTMENT", "SEND_NOTIFICATION"],
        "REC-MAP-002": ["UPDATE_OPERATIONAL_STATUS", "SEND_NOTIFICATION"],
        "REC-MAP-003": ["CREATE_FOLLOWUP_TASK"],
        "REC-MAP-004": ["CREATE_FOLLOWUP_TASK"],
    }

    print("Backfilling canonical recommendation mappings...")
    with engine.begin() as conn:
        for mapping_id, actions in CANONICAL_ACTIONS.items():
            conn.execute(text("""
                UPDATE governed_recommendation_mappings
                SET allowed_action_types_json = :actions
                WHERE mapping_id = :mapping_id
                AND version = 'V1'
                AND (
                    allowed_action_types_json IS NULL
                    OR TRIM(allowed_action_types_json) = ''
                    OR allowed_action_types_json = '[]'
                )
            """), {
                "mapping_id": mapping_id,
                "actions": json.dumps(actions),
            })
    print("D6 schema migration complete.")


if __name__ == "__main__":
    migrate()
