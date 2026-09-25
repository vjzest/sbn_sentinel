from sqlalchemy import Column, String, Integer
from app.db.database import Base, SessionLocal


class CursorModel(Base):
    __tablename__ = "sync_cursors"
    id = Column(Integer, primary_key=True, index=True)
    connector_id = Column(String, nullable=False, index=True)
    resource_type = Column(String, nullable=False)
    checkpoint = Column(String, nullable=False)


class CursorStore:
    def get(self, connector_id: str, resource_type: str) -> str:
        with SessionLocal() as db:
            cursor = db.query(CursorModel).filter(
                CursorModel.connector_id == connector_id,
                CursorModel.resource_type == resource_type
            ).first()
            return cursor.checkpoint if cursor else None

    def commit(self, connector_id: str, resource_type: str, checkpoint: str):
        if not checkpoint:
            return
        with SessionLocal() as db:
            cursor = db.query(CursorModel).filter(
                CursorModel.connector_id == connector_id,
                CursorModel.resource_type == resource_type
            ).first()
            if cursor:
                cursor.checkpoint = checkpoint
            else:
                cursor = CursorModel(connector_id=connector_id, resource_type=resource_type, checkpoint=checkpoint)
                db.add(cursor)
            db.commit()


cursor_store = CursorStore()
