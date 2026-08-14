import React, { useState, useEffect, useRef, Fragment } from 'react';
import './App.css';

function App() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [inventario, setInventario] = useState([]);
    const [notificaciones, setNotificaciones] = useState([]);
    const [token, setToken] = useState("");
    const [usdRate, setUsdRate] = useState(18.0);
    const [tareas, setTareas] = useState([]);
    const [nuevaTarea, setNuevaTarea] = useState('');
    const ws = useRef(null);

    useEffect(() => {
        // Dummy data para evitar errores de fetch en Vercel
        setInventario([
            { id: 1, nombre: "Café Verde", unidad: "kg", stock: 250, umbral: 50, imagen: "https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=100" },
            { id: 2, nombre: "Leche de Avena", unidad: "litros", stock: 10, umbral: 20, imagen: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=100" }
        ]);
        setTareas([
            { id: 1, tarea: "Limpiar máquina de espresso", completada: false },
            { id: 2, tarea: "Revisar inventario de vasos", completada: true }
        ]);
    }, []);

    const mostrarBurbuja = (mensaje, tipo) => {
        const id = Date.now();
        setNotificaciones(prev => [...prev, { id, mensaje, tipo }]);
        setTimeout(() => setNotificaciones(prev => prev.filter(n => n.id !== id)), 3000);
    };

    const descontarStock = (item_id) => {
        mostrarBurbuja(`Consumo registrado en local.`, "exito");
        setInventario(prev => prev.map(item => {
            if (item.id === item_id) return { ...item, stock: item.stock > 0 ? item.stock - 1 : 0 };
            return item;
        }));
    };

    const registrarVenta = (producto) => {
        mostrarBurbuja(`Venta de ${producto} registrada`, "exito");
        descontarStock(1);
    };

    const agregarTarea = () => {
        if(!nuevaTarea) return;
        setTareas([...tareas, { id: Date.now(), tarea: nuevaTarea, completada: false }]);
        setNuevaTarea('');
        mostrarBurbuja("Tarea agregada", "exito");
    };

    const toggleTarea = (id) => {
        setTareas(tareas.map(t => t.id === id ? { ...t, completada: !t.completada } : t));
    };

    const eliminarTarea = (id) => {
        setTareas(tareas.filter(t => t.id !== id));
        mostrarBurbuja("Tarea eliminada", "info");
    };

    return (
        <Fragment>
            <aside className="sidebar glass">
                <div className="logo">Café<span>Tech</span></div>
                <ul className="nav-menu">
                    <li className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>Dashboard Central</li>
                    <li className={`nav-item ${activeTab === 'pos' ? 'active' : ''}`} onClick={() => setActiveTab('pos')}>Punto de Venta (POS)</li>
                    <li className={`nav-item ${activeTab === 'tareas' ? 'active' : ''}`} onClick={() => setActiveTab('tareas')}>Tareas del Barista</li>
                </ul>
            </aside>

            <main className="main-content">
                <header className="header">
                    <div>
                        <h1 style={{fontSize: "1.8rem", fontWeight: 600}}>Bienvenido, <span style={{color: "var(--primary)"}}>Gerente</span></h1>
                        <p style={{color: "var(--text-muted)"}}>Sistema Integrado con React y Vercel</p>
                    </div>
                    <div className="user-profile">
                        <div style={{textAlign: "right"}}>
                            <div style={{fontWeight: 600}}>Luis Admin</div>
                        </div>
                        <div className="avatar">LA</div>
                    </div>
                </header>

                {activeTab === 'dashboard' && (
                    <section>
                        <div className="dashboard-grid">
                            <div className="metric-card glass">
                                <span className="metric-title">API Terceros (Tasa USD)</span>
                                <span className="metric-value">${usdRate.toFixed(2)} MXN</span>
                            </div>
                            <div className="metric-card glass">
                                <span className="metric-title">Sistema Status</span>
                                <span className="metric-value" style={{color: "var(--success)"}}>Online</span>
                            </div>
                        </div>

                        <div className="glass" style={{marginTop: "2rem", padding: "1.5rem"}}>
                            <h2>Inventario Central</h2>
                            <table className="table-container">
                                <thead>
                                    <tr>
                                        <th>Insumo</th>
                                        <th>Stock</th>
                                        <th>Estado</th>
                                        <th>Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {inventario.map(item => {
                                        const esCritico = item.stock <= item.umbral;
                                        return (
                                            <tr key={item.id}>
                                                <td>
                                                    <div style={{display: "flex", alignItems: "center", gap: "10px"}}>
                                                        <img src={item.imagen} style={{width: 40, height: 40, borderRadius: "50%"}} />
                                                        {item.nombre} ({item.unidad})
                                                    </div>
                                                </td>
                                                <td style={{fontSize: "1.2rem", fontWeight: "bold"}}>{item.stock}</td>
                                                <td>
                                                    <span className={`status-badge ${esCritico ? 'status-low' : 'status-ok'}`}>
                                                        {esCritico ? 'CRÍTICO' : 'ÓPTIMO'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button className="btn" onClick={() => descontarStock(item.id)}>Consumir</button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                {activeTab === 'pos' && (
                    <section>
                        <h2 style={{marginBottom: "1.5rem"}}>Terminal Punto de Venta</h2>
                        <div className="pos-grid">
                            <div className="product-card glass" onClick={() => registrarVenta("Latte Art")}>
                                <div className="product-img" style={{backgroundImage: "url('https://images.unsplash.com/photo-1559525839-b184a4d698c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80')"}}></div>
                                <h3>Latte Art</h3>
                                <p style={{color: "var(--primary)", fontWeight: "bold"}}>$65.00 MXN</p>
                                <p style={{fontSize: "0.8rem", color: "var(--text-muted)"}}>≈ ${(65/usdRate).toFixed(2)} USD</p>
                            </div>
                            <div className="product-card glass" onClick={() => registrarVenta("Espresso")}>
                                <div className="product-img" style={{backgroundImage: "url('https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80')"}}></div>
                                <h3>Espresso Doble</h3>
                                <p style={{color: "var(--primary)", fontWeight: "bold"}}>$45.00 MXN</p>
                                <p style={{fontSize: "0.8rem", color: "var(--text-muted)"}}>≈ ${(45/usdRate).toFixed(2)} USD</p>
                            </div>
                        </div>
                    </section>
                )}

                {activeTab === 'tareas' && (
                    <section>
                        <h2 style={{marginBottom: "1.5rem"}}>Lista de Tareas Diarias</h2>
                        <div className="glass" style={{padding: "1.5rem"}}>
                            <div style={{display: "flex", gap: "10px", marginBottom: "1rem"}}>
                                <input type="text" value={nuevaTarea} onChange={e => setNuevaTarea(e.target.value)} placeholder="Nueva tarea..." style={{flex: 1, padding: "8px", borderRadius: "6px", border: "none", outline: "none", background: "rgba(255,255,255,0.1)", color: "white"}} />
                                <button className="btn" onClick={agregarTarea}>Agregar</button>
                            </div>
                            <ul style={{listStyle: "none"}}>
                                {tareas.map(t => (
                                    <li key={t.id} style={{display: "flex", justifyContent: "space-between", padding: "10px", borderBottom: "1px solid rgba(255,255,255,0.1)"}}>
                                        <div style={{display: "flex", alignItems: "center", gap: "10px"}}>
                                            <input type="checkbox" checked={t.completada} onChange={() => toggleTarea(t.id)} />
                                            <span style={{textDecoration: t.completada ? "line-through" : "none", color: t.completada ? "var(--text-muted)" : "var(--text-main)"}}>{t.tarea}</span>
                                        </div>
                                        <button className="btn" style={{background: "var(--danger)", padding: "4px 8px"}} onClick={() => eliminarTarea(t.id)}>Borrar</button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>
                )}
            </main>

            <div className="toast-container">
                {notificaciones.map(n => (
                    <div key={n.id} className="toast" style={{borderLeft: `5px solid ${n.tipo === 'error' ? 'red' : 'green'}`}}>
                        {n.mensaje}
                    </div>
                ))}
            </div>
        </Fragment>
    );
}

export default App;
