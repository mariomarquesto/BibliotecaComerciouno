import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container, Spinner } from 'react-bootstrap';

// Importa todos tus componentes
import MiNavbar from './components/MiNavbar.jsx'; 
import FormularioLibros from './components/FormularioLibros.jsx';
import HomePage from './components/HomePage.jsx';
import Reportes from './components/Reportes.jsx';
import LoginPage from './components/LoginPage.tsx'; // Asegúrate de que el archivo se llame LoginPage.tsx
import BuscarGutenberg from './components/BuscarGutenberg.jsx';
import Biblioteca from './components/Biblioteca.jsx'; // ¡IMPORTA EL NUEVO COMPONENTE BIBLIOTECA!

// Importa tus otros componentes adicionales
import PrestamosLibros from './components/PrestamosLibros.jsx';
import ReportesDevoluciones from './components/ReportesDevoluciones.jsx';
import ReporteUsoBiblioteca from './components/ReporteUsoBiblioteca.jsx';
import FormularioUsoBiblioteca from './components/FormularioUsoBiblioteca.jsx';
import InventarioBiblioteca from './components/InventarioBiblioteca.jsx';

// Importa solo lo necesario de Firebase (Firestore si lo usas, pero no para Auth local)
// localAuthService NO se importa aquí directamente porque App.jsx no lo usa.
// Se usa en LoginPage.tsx y MiNavbar.jsx.

import './App.css'; 

function App() {
  const [user, setUser] = useState(null); 
  const [isAdmin, setIsAdmin] = useState(false); 
  const [loadingApp, setLoadingApp] = useState(true); 

  useEffect(() => {
    // Al cargar la aplicación, intenta recuperar el usuario de localStorage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser); // <-- Esto sí utiliza setUser
        setIsAdmin(parsedUser.isAdmin); // <-- Esto sí utiliza setIsAdmin
      } catch (e) {
        console.error("Error al parsear usuario de localStorage:", e);
        localStorage.removeItem('currentUser'); // Limpiar datos corruptos
        setUser(null);
        setIsAdmin(false);
      }
    }
    setLoadingApp(false); 
  }, []); // Se ejecuta solo una vez al montar

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
      <MiNavbar user={user} isAdmin={isAdmin} /> 

      <Container className="mt-4">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/biblioteca" element={<Biblioteca />} /> {/* ¡NUEVA RUTA PARA BIBLIOTECA! */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/reportes" element={<Reportes />} />
          <Route path="/buscar-gutenberg" element={<BuscarGutenberg />} />
          
          {/* Rutas protegidas para el admin local (definido por el login exitoso) */}
          <Route 
            path="/ingresar-libro" 
            element={isAdmin ? <FormularioLibros isAdmin={isAdmin} /> : <p className="text-center alert alert-warning">Acceso denegado. Solo administradores.</p>} 
          />
          {/* AdminPanel.tsx no se usa en este setup hardcodeado de admins, así que su ruta no es necesaria.
             Si deseas volver a la gestión de admins por Firestore, esta ruta y el componente AdminPanel.tsx serían útiles.
          */}
          
          {/* Tus otras rutas */}
          <Route path="/prestamos-libros" element={<PrestamosLibros />} />
          <Route path="/reportes-devoluciones" element={<ReportesDevoluciones />} />
          <Route path="/reportes-uso" element={<ReporteUsoBiblioteca />} />
          <Route path="/registrar-otro-uso" element={<FormularioUsoBiblioteca />} />
          <Route path="/inventario" element={<InventarioBiblioteca />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
