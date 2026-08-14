from fastapi import FastAPI, Depends, WebSocket, WebSocketDisconnect, HTTPException, Body
from pydantic import BaseModel
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import json
from typing import List

from database import engine, Base, get_db
import models
import security
from external_api import get_exchange_rate


models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="CaféTech Web API")


def seed_db():
    db = next(get_db())
    if db.query(models.InventoryItem).count() == 0:
        db.add_all([
            models.InventoryItem(nombre="Café Verde (Etiopía)", unidad="Kg", stock=250.0, umbral=50.0, imagen="https://images.unsplash.com/photo-1559525839-b184a4d698c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"),
            models.InventoryItem(nombre="Leche de Avena (Barista)", unidad="Litros", stock=15.0, umbral=10.0, imagen="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"),
            models.InventoryItem(nombre="Vasos Medianos 12oz", unidad="Paquete", stock=5.0, umbral=10.0, imagen="https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80")
        ])
        db.commit()

seed_db()


class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()


@app.post("/api/auth")
def authenticate():

    token = security.create_access_token({"sub": "admin_central"})
    return {"access_token": token, "token_type": "bearer"}


@app.get("/api/inventory")
def get_inventory(db: Session = Depends(get_db)):
    items = db.query(models.InventoryItem).all()
    return items

@app.post("/api/inventory/{item_id}/deduct")
def deduct_inventory(item_id: int, user: dict = Depends(security.verify_token), db: Session = Depends(get_db)):

    item = db.query(models.InventoryItem).filter(models.InventoryItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item no encontrado")
    
    if item.stock > 0:
        item.stock -= 1
        db.commit()
        db.refresh(item)
        return item
    raise HTTPException(status_code=400, detail="Sin stock")

@app.get("/api/exchange-rate")
def get_rate():
    rate = get_exchange_rate()
    return {"currency": "USD", "to_mxn": rate}

class NuevaTarea(BaseModel):
    tarea: str
    completada: bool = False

@app.get("/api/tareas")
def obtener_todas_las_tareas(db: Session = Depends(get_db)):
    return db.query(models.Task).all()

@app.post("/api/tareas")
def crear_tarea(datos: NuevaTarea, db: Session = Depends(get_db)):
    nueva = models.Task(tarea=datos.tarea, completada=datos.completada)
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    return nueva

@app.put("/api/tareas/{tarea_id}/toggle")
def toggle_tarea(tarea_id: int, db: Session = Depends(get_db)):
    tarea_db = db.query(models.Task).filter(models.Task.id == tarea_id).first()
    if not tarea_db:
        raise HTTPException(status_code=404, detail="Not found")
    tarea_db.completada = not tarea_db.completada
    db.commit()
    db.refresh(tarea_db)
    return tarea_db

@app.delete("/api/tareas/{tarea_id}")
def eliminar_tarea(tarea_id: int, db: Session = Depends(get_db)):
    tarea_db = db.query(models.Task).filter(models.Task.id == tarea_id).first()
    if not tarea_db:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(tarea_db)
    db.commit()
    return {"status": "ok"}


@app.websocket("/ws/pos")
async def websocket_pos(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()

            await manager.broadcast(f"POS Event: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)


import os
os.makedirs("public", exist_ok=True)
app.mount("/static", StaticFiles(directory="public"), name="static")

@app.get("/")
def read_index():
    return FileResponse("public/index.html")

