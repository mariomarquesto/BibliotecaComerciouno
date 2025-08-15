import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap'; 

import MiNavbar from './components/Navbar.jsx'; 
import FormularioLibros from './components/FormularioLibros.jsx';
import HomePage from './components/HomePage.jsx';
import Reportes from './components/Reportes.jsx';
import PrestamosLibros from './components/PrestamosLibros.jsx';
import ReportesDevoluciones from './components/ReportesDevoluciones.jsx'; 
import ReporteUsoBiblioteca from './components/ReporteUsoBiblioteca.jsx';
import FormularioUsoBiblioteca from './components/FormularioUsoBiblioteca.jsx';
import InventarioBiblioteca from './components/InventarioBiblioteca.jsx'; // ¡NUEVO! Importa el componente

import './App.css';

function App() {
  return (
    <Router>
      <MiNavbar />
      <Container className="mt-4">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/ingresar-libro" element={<FormularioLibros />} />
          <Route path="/prestamos-libros" element={<PrestamosLibros />} />
          <Route path="/reportes" element={<Reportes />} /> 
          <Route path="/reportes-devoluciones" element={<ReportesDevoluciones />} />
          <Route path="/reportes-uso" element={<ReporteUsoBiblioteca />} />
          <Route path="/registrar-otro-uso" element={<FormularioUsoBiblioteca />} />
          <Route path="/inventario" element={<InventarioBiblioteca />} /> {/* ¡NUEVA RUTA AÑADIDA! */}
        </Routes>
      </Container>
    </Router>
  );
}

export default App;