import os
import subprocess
import sys
from pathlib import Path

# SES-012: Automated Release Verification Script
# Enforces Engineering Acceptance Principles before allowing a production deployment.

def print_header(title):
    print(f"\n{'='*50}\n[SES-012] {title}\n{'='*50}")

def check_env_vars():
    print_header("Verifying Environment Variables")
    required_vars = ["SECRET_KEY", "DATABASE_URL"]
    
    # Simple check if a .env exists (could also parse it)
    env_path = Path(".env")
    if not env_path.exists():
        print("❌ CRITICAL: .env file is missing. Production requires isolated configuration.")
        return False
        
    print("✅ Environment configuration exists.")
    return True

def run_linters():
    print_header("Running Static Analysis (Flake8)")
    try:
        result = subprocess.run(["flake8", "app/", "tests/"], capture_output=True, text=True)
        if result.returncode != 0:
            print(f"❌ CRITICAL: Linter failed.\n{result.stdout}")
            return False
        print("✅ Static analysis passed.")
        return True
    except FileNotFoundError:
        print("❌ CRITICAL: flake8 not installed in current environment.")
        return False

def run_tests():
    print_header("Running Automated Tests (Pytest)")
    try:
        result = subprocess.run(["pytest", "tests/unit/", "-q"], capture_output=True, text=True)
        if result.returncode != 0:
            print(f"❌ CRITICAL: Unit tests failed.\n{result.stdout}")
            return False
        print("✅ Unit tests passed.")
        return True
    except FileNotFoundError:
        print("❌ CRITICAL: pytest not installed in current environment.")
        return False

def main():
    print("\nStarting SES-012 Production Readiness Verification...")
    
    checks = [
        check_env_vars(),
        run_linters(),
        run_tests()
    ]
    
    if all(checks):
        print("\n✅ SUCCESS: All engineering acceptance criteria met. System is ready for Release Approval.")
        sys.exit(0)
    else:
        print("\n❌ FAILED: Production readiness verification failed. Release blocked.")
        sys.exit(1)

if __name__ == "__main__":
    main()
