from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
import asyncio

from app.services.simulation_engine import simulation_engine
from app.db.database import get_db
from app.models.signal import SignalModel

router = APIRouter()

@router.get("")
@router.get("/")
def get_historical_signals(db: Session = Depends(get_db)):
    signals = db.query(SignalModel).order_by(SignalModel.timestamp.desc()).limit(100).all()
    result = []
    for s in signals:
        result.append({
            "id": s.id,
            "source": s.source,
            "type": s.type,
            "message": s.message,
            "timestamp": s.timestamp.isoformat() if s.timestamp else None,
            "metadata": s.metadata_data,
            "ai_insight": s.ai_insight,
            "recommended_action": s.recommended_action
        })
    return result

import threading
from app.services.ml_trainer import train_and_save_models
from app.services.ml_engine import ml_engine

@router.post("/retrain-ai")
def trigger_ai_retraining():
    """
    Advanced Feature: Manually trigger the Local ML Engine to retrain itself
    using all the newly accumulated 'Teacher Model' recommendations.
    """
    def background_train():
        try:
            train_and_save_models()
            ml_engine.load_models() # Reload into memory
            print("AI Retraining complete and models reloaded.")
        except Exception as e:
            print(f"Retraining failed: {e}")
            
    # Run in a separate thread so it doesn't block the API
    thread = threading.Thread(target=background_train)
    thread.start()
    
    return {"status": "success", "message": "Local Machine Learning model retraining has started in the background."}

@router.on_event("startup")
async def startup_event():
    simulation_engine.start()

@router.on_event("shutdown")
async def shutdown_event():
    simulation_engine.stop()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    q = asyncio.Queue()
    simulation_engine.add_client(q)
    try:
        while True:
            # Wait for new message from the queue
            message = await q.get()
            await websocket.send_text(message)
    except WebSocketDisconnect:
        simulation_engine.remove_client(q)
