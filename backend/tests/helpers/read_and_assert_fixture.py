import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../src/runtime')))

from app.services.governance_registry import governance_registry  # noqa: E402


def main():
    if len(sys.argv) < 4:
        print("Usage: read_and_assert_fixture.py <jny_id> <rec_id> <dec_id>")
        sys.exit(1)

    rec_id = sys.argv[2]
    dec_id = sys.argv[3]

    # Read back from fresh process
    r1 = governance_registry.get_recommendation(rec_id)
    if not r1:
        print("Recommendation not found")
        sys.exit(1)
    if r1.recommendation_id != rec_id or r1.recommendation_content != "Subproc Rec":
        print(f"Mismatch in recommendation: {r1}")
        sys.exit(1)

    d1 = governance_registry.get_human_decision(dec_id)
    if not d1:
        print("Decision not found")
        sys.exit(1)
    if d1.decision_id != dec_id:
        print(f"Mismatch in decision: {d1}")
        sys.exit(1)

    print("SUCCESS")


if __name__ == "__main__":
    main()
