import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    
    console.log("Conectando al Comisariato Central...");
  }, []);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>CaféTech - Sistema de Inventarios</h1>
        <span className="badge-role">Rol: Administrador Almacén</span>
      </header>
      
      <main className="dashboard-content">
        <section className="alerts-section">
          <h2>Alertas Críticas</h2>
          <div className="alert-card critical">
             Sucursal Centro: Leche de Avena agotada
          </div>
        </section>

        <section className="inventory-grid">
          <h2>Stock en Tiempo Real</h2>
          {}
          <div className="product-card">
            <h3>Café Verde (Etiopía)</h3>
            <p>Stock: 250 kg</p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
