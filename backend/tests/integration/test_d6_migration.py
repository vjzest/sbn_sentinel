import json
from sqlalchemy import create_engine
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))
from scripts.migrate_d6_schema import migrate, D6_COLUMNS
import pytest
from sqlalchemy import text, inspect


def table_exists(conn, table_name):
    return inspect(conn).has_table(table_name)


def get_columns(conn, table_name):
    return {c["name"] for c in inspect(conn).get_columns(table_name)}


# Use a separate test engine just for this migration to avoid polluting app engine
test_engine = create_engine("sqlite:///:memory:")


def setup_pre_d6_schema(engine):
    with engine.begin() as conn:
        conn.execute(text("""
            CREATE TABLE governed_recommendation_mappings (
                mapping_id VARCHAR,
                version VARCHAR,
                applicable_rule_id VARCHAR NOT NULL,
                eligible_result VARCHAR NOT NULL,
                recommendation_template TEXT NOT NULL,
                authority_requirement VARCHAR NOT NULL,
                priority VARCHAR NOT NULL,
                lifecycle_state VARCHAR NOT NULL,
                PRIMARY KEY (mapping_id, version)
            )
        """))
        conn.execute(text("""
            CREATE TABLE governed_recommendations (
                recommendation_id VARCHAR PRIMARY KEY,
                decision_context_id VARCHAR NOT NULL,
                rule_evaluation_id VARCHAR NOT NULL,
                journey_id VARCHAR NOT NULL,
                mapping_id VARCHAR NOT NULL,
                mapping_version VARCHAR NOT NULL,
                content TEXT,
                status VARCHAR,
                priority VARCHAR,
                generated_at VARCHAR
            )
        """))
        conn.execute(text("""
            CREATE TABLE governed_actions (
                action_id VARCHAR PRIMARY KEY,
                authorization_reference VARCHAR NOT NULL,
                journey_id VARCHAR NOT NULL,
                action_type VARCHAR,
                target_reference VARCHAR,
                status VARCHAR,
                current_result VARCHAR,
                parameters_json TEXT,
                created_at VARCHAR
            )
        """))
        conn.execute(text("""
            CREATE TABLE governed_execution_attempts (
                attempt_id VARCHAR PRIMARY KEY,
                action_id VARCHAR NOT NULL,
                journey_id VARCHAR NOT NULL,
                result VARCHAR,
                attempt_timestamp VARCHAR
            )
        """))
        conn.execute(text("""
            CREATE TABLE governed_outcomes (
                outcome_id VARCHAR PRIMARY KEY,
                action_id VARCHAR NOT NULL,
                journey_id VARCHAR NOT NULL,
                confirmation_state VARCHAR,
                resolution_state VARCHAR,
                expected_outcome_json TEXT,
                observed_outcome_json TEXT,
                created_at VARCHAR
            )
        """))
        conn.execute(text("""
            CREATE TABLE intel_decision_contexts (
                context_id VARCHAR PRIMARY KEY,
                signal_id VARCHAR NOT NULL
            )
        """))

        conn.execute(text("INSERT INTO governed_recommendation_mappings (mapping_id, version, applicable_rule_id, eligible_result, recommendation_template, authority_requirement, priority, lifecycle_state) VALUES ('REC-MAP-001', 'V1', 'rule1', 'TRUE', 'template', 'SYSTEM', 'HIGH', 'ACTIVE')"))
        conn.execute(text("INSERT INTO governed_actions (action_id, authorization_reference, journey_id) VALUES ('action_1', 'dec_1', 'journey_1')"))


@pytest.mark.governance
def test_d6_schema_migration_and_idempotency(monkeypatch):
    # Monkeypatch the engine used in scripts.migrate_d6_schema
    import scripts.migrate_d6_schema
    monkeypatch.setattr(scripts.migrate_d6_schema, "engine", test_engine)

    setup_pre_d6_schema(test_engine)

    with test_engine.connect() as conn:
        for table, cols in D6_COLUMNS.items():
            present = get_columns(conn, table)
            for col_name, _ in cols:
                assert col_name not in present, f"Column {col_name} should not exist pre-migration"

    # 1. Run migration
    migrate()

    # Verify columns added
    with test_engine.connect() as conn:
        for table, cols in D6_COLUMNS.items():
            present = get_columns(conn, table)
            for col_name, _ in cols:
                assert col_name in present, f"Column {col_name} missing after migration"

        # Verify data preserved
        res = conn.execute(text("SELECT action_id FROM governed_actions WHERE action_id = 'action_1'")).fetchone()
        assert res is not None

        # Verify backfill
        res2 = conn.execute(text("SELECT allowed_action_types_json FROM governed_recommendation_mappings WHERE mapping_id = 'REC-MAP-001'")).fetchone()
        assert res2[0] is not None
        assert "RESCHEDULE_APPOINTMENT" in res2[0]

    # 2. Run migration again to prove idempotency
    migrate()
