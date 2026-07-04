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
