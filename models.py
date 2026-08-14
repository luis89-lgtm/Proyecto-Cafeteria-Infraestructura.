from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from database import Base
import datetime

class InventoryItem(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, index=True)
    unidad = Column(String)
    stock = Column(Float, default=0.0)
    umbral = Column(Float, default=0.0)
    imagen = Column(String)

class Sale(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, index=True)
    producto = Column(String)
    cantidad = Column(Integer)
    total = Column(Float)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

from sqlalchemy import Boolean
class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    tarea = Column(String, index=True)
    completada = Column(Boolean, default=False)
