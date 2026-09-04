import json
import os
import joblib
import pandas as pd
import random
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split

# Sample training data generation


def generate_synthetic_data(num_samples=1000):
    data = []

    templates = [
        {"text": "Patient {name} appointment marked as No-Show.", "priority": "High", "action": "Auto-send rescheduling SMS to patient.", "insight": "Revenue loss of $150."},
        {"text": "New appointment booked by {name}.", "priority": "Low", "action": "Prepare intake forms.", "insight": "High priority walk-in expected."},
        {"text": "Missed call from {name} (+1-555-0198).", "priority": "Medium", "action": "Trigger callback task for front desk.", "insight": "Patient likely calling to reschedule."},
        {"text": "Email received from Lab Corp regarding {name} results.", "priority": "High", "action": "Notify Dr. Smith to review.", "insight": "Lab results available for review."},
        {"text": "Patient {name} wait time has reached 45 minutes.", "priority": "Critical", "action": "Re-route to Room 3.", "insight": "High wait time alert."},
        {"text": "{name} is complaining about billing issues.", "priority": "Medium", "action": "Assign to billing department.", "insight": "Patient dissatisfaction risk."},
        {"text": "Routine checkup completed for {name}.", "priority": "Low", "action": "Log to chart.", "insight": "Standard operational update."},
        {"text": "Insurance claim denied for {name}.", "priority": "High", "action": "Review and resubmit claim.", "insight": "Revenue risk detected."},
        {"text": "Urgent consultation requested by {name}.", "priority": "Critical", "action": "Alert duty doctor immediately.", "insight": "Potential clinical emergency."},
        {"text": "Prescription refill requested for {name}.", "priority": "Medium", "action": "Send to pharmacy queue.", "insight": "Routine medication management."}
    ]

    names = ["John", "Jane", "Alice", "Bob", "Michael", "Sarah", "David", "Emma"]

    for _ in range(num_samples):
        template = random.choice(templates)
        name = random.choice(names)
        text = template["text"].format(name=name)

        # Add some random noise to make the model generalize better
        noise = random.choice(["", " Please check.", " ASAP.", " Note this.", " Status pending."])

        data.append({
            "text": text + noise,
            "priority": template["priority"],
            "action": template["action"],
            "insight": template["insight"]
        })

    return pd.DataFrame(data)


def train_and_save_models():
    print("Generating synthetic clinical data...")
    df_synthetic = generate_synthetic_data(2000)

    # --- The Data Flywheel: Load real AI-verified recommendations ---
    real_data = []
    log_file = "local_training_data.jsonl"
    if os.path.exists(log_file):
        print(f"Found real-world learning data in {log_file}. Merging...")
        with open(log_file, "r") as f:
            for line in f:
                try:
                    point = json.loads(line)
                    if point.get("text") and point.get("priority") and point.get("action"):
                        real_data.append(point)
                except Exception:
                    pass

    if real_data:
        df_real = pd.DataFrame(real_data)
        df = pd.concat([df_synthetic, df_real], ignore_index=True)
        print(f"Training on combined dataset: {len(df)} samples ({len(df_real)} real-world samples).")
    else:
        df = df_synthetic
        print("Training on synthetic dataset only.")

    print("Training Priority Detection Model (Model 1)...")
    pipeline_priority = Pipeline([
        ('tfidf', TfidfVectorizer(ngram_range=(1, 2))),
        ('clf', RandomForestClassifier(n_estimators=100, random_state=42))
    ])
    pipeline_priority.fit(df['text'], df['priority'])

    print("Training Action Recommendation Model (Model 2)...")
    pipeline_action = Pipeline([
        ('tfidf', TfidfVectorizer(ngram_range=(1, 2))),
        ('clf', RandomForestClassifier(n_estimators=100, random_state=42))
    ])
    pipeline_action.fit(df['text'], df['action'])

    print("Training Insight Generation Model (Model 3)...")
    pipeline_insight = Pipeline([
        ('tfidf', TfidfVectorizer(ngram_range=(1, 2))),
        ('clf', RandomForestClassifier(n_estimators=100, random_state=42))
    ])
    pipeline_insight.fit(df['text'], df['insight'])

    # Save the models
    os.makedirs('models', exist_ok=True)
    joblib.dump(pipeline_priority, 'models/priority_model.pkl')
    joblib.dump(pipeline_action, 'models/action_model.pkl')
    joblib.dump(pipeline_insight, 'models/insight_model.pkl')

    print("Models trained and saved successfully in 'models/' directory!")


if __name__ == "__main__":
    train_and_save_models()
