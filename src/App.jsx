import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // useLocation se eliminó de aquí
import { Container, Spinner } from 'react-bootstrap';

// Importa todos tus componentes
import MiNavbar from './components/MiNavbar.jsx'; 
import FormularioLibros from './components/FormularioLibros.jsx'; // Importación correcta (.tsx)
import HomePage from './components/HomePage.jsx';
import Reportes from './components/Reportes.jsx'; // Importación correcta (.jsx)
import LoginPage from './components/LoginPage.jsx'; // Importación correcta (.tsx)
import BuscarGutenberg from './components/BuscarGutenberg.tsx'; // Importación correcta (.tsx)
import InventarioPublico from './components/InventarioPublico.jsx';
import AdminReservations from './components/AdminReservations.jsx';

// Importa tus otros componentes adicionales
import PrestamosLibros from './components/PrestamosLibros.jsx';
import ReportesDevoluciones from './components/ReportesDevoluciones.jsx';
import ReporteUsoBiblioteca from './components/ReporteUsoBiblioteca.jsx';
import FormularioUsoBiblioteca from './components/FormularioUsoBiblioteca.jsx';
import InventarioBiblioteca from './components/InventarioBiblioteca.jsx';

// Importa el nuevo componente PageViewTracker
import PageViewTracker from './components/PageViewTracker.jsx'; // Nueva importación

// Ya no se necesitan directamente aquí porque PageViewTracker los manejará
// import { db, collection, addDoc } from './firebase/firebaseConfig'; 

import './App.css'; 

function App() {
  const [user, setUser] = useState(null); 
  const [isAdmin, setIsAdmin] = useState(false); 
  const [loadingApp, setLoadingApp] = useState(true); 

  useEffect(() => {
    // Lógica de autenticación inicial: intenta recuperar el usuario de localStorage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser); 
        setIsAdmin(parsedUser.isAdmin); 
      } catch (e) {
        console.error("Error al parsear usuario de localStorage:", e);
        localStorage.removeItem('currentUser'); // Limpiar datos corruptos
        setUser(null);
        setIsAdmin(false);
      }
    }
    setLoadingApp(false); 
  }, []); // Se ejecuta solo una vez al montar la aplicación

  // El useEffect para el registro de visitas se ha movido a PageViewTracker.jsx
  // No hay código de seguimiento directo aquí.

  if (loadingApp) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando aplicación...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <Router>
      {/* Coloca PageViewTracker aquí, dentro del Router para que useLocation funcione */}
      <PageViewTracker user={user} isAdmin={isAdmin} /> 

      {/* El componente MiNavbar también debe estar dentro de Router para usar Link */}
      <MiNavbar user={user} isAdmin={isAdmin} /> 

      <Container className="mt-4">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/biblioteca" element={<InventarioPublico />} /> {/* Puedes usar este o Biblioteca */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/reportes" element={<Reportes />} />
          <Route path="/buscar-gutenberg" element={<BuscarGutenberg />} />
          <Route path="/inventario-publico" element={<InventarioPublico />} />
          
          {/* Rutas protegidas para el admin local */}
          <Route 
            path="/ingresar-libro" 
            element={isAdmin ? <FormularioLibros isAdmin={isAdmin} /> : <p className="text-center alert alert-warning">Acceso denegado. Solo administradores.</p>} 
          />
          {/* Ruta para el panel de reservas del administrador */}
          <Route
            path="/admin-reservations"
            element={isAdmin ? <AdminReservations isAdmin={isAdmin} /> : <p className="text-center alert alert-warning">Acceso denegado. Solo administradores.</p>}
          />
          
          {/* Tus otras rutas */}
          <Route path="/prestamos-libros" element={<PrestamosLibros />} />
          <Route path="/reportes-devoluciones" element={<ReportesDevoluciones />} />
          <Route path="/reportes-uso" element={<ReporteUsoBiblioteca />} />
          <Route path="/registrar-otro-uso" element={<FormularioUsoBiblioteca />} />
          <Route path="/inventario" element={<InventarioBiblioteca />} />
        </Routes>
      </Container>
      
      {/* Footer de la aplicación */}
      <footer className="app-footer mt-auto py-3 text-center">
        <Container>
          <span className="text-white">Desarrollado por Mario Marquestó.</span>
        </Container>
      </footer>
    </Router>
  );
}

export default App;
