import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Button from 'react-bootstrap/Button';
import localAuthService from '../auth/localAuthService'; 

// Importa el logo de la escuela
import logo from '../assets/logo.jpeg'; // Asegúrate de que la ruta sea correcta.
                                        // Si tu carpeta assets no existe, crea una y mueve logo.jpeg allí.

function MiNavbar({ user, isAdmin }) { 
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await localAuthService.logout();
      localStorage.removeItem('currentUser');
      navigate('/');
      window.location.reload(); 
    } catch (error) {
      console.error("Error al cerrar sesión local:", error);
    }
  };

  return (
    <Navbar expand="lg" className="bg-body-tertiary rounded-3">
      <Container fluid>
        <Navbar.Brand as={Link} to="/biblioteca">
          {/* ¡CAMBIO AQUÍ! Usamos la imagen del logo */}
          <img
            src={logo}
            height="40" // Ajusta la altura según sea necesario
            className="d-inline-block align-top"
            alt="Logo de la Biblioteca"
          />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarScroll" />
        <Navbar.Collapse id="navbarScroll">
          <Nav
            className="me-auto my-2 my-lg-0"
            style={{ maxHeight: "100px" }}
            navbarScroll
          >
            <Nav.Link as={Link} to="/">
              Home
            </Nav.Link>
            
            {/* Este enlace solo se muestra para administradores */}
            {isAdmin && (
              <Nav.Link as={Link} to="/ingresar-libro">
                Ingresar y Ver Libros
              </Nav.Link>
            )}

            {/* Este enlace siempre es visible */}
            <Nav.Link as={Link} to="/buscar-gutenberg">
              Buscar en Gutenberg
            </Nav.Link>

            {/* Agrupamos los elementos que solo deben ser visibles para administradores */}
            {isAdmin && (
              <NavDropdown title="Más Opciones" id="navbarScrollingDropdown">
                <NavDropdown.Item as={Link} to="/prestamos-libros">
                  Préstamos
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/reportes-devoluciones">
                  Reportes Devoluciones
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/reportes-uso">
                  Uso de la Biblioteca
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/registrar-otro-uso">
                  Registrar Otro Uso
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item as={Link} to="/inventario">
                  Inventario
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/reportes">
                  Reportes Inventario
                </NavDropdown.Item>
              </NavDropdown>
            )}
          </Nav>
          <Nav>
            {/* Lógica para mostrar Iniciar Sesión o Cerrar Sesión */}
            {user ? (
              <>
                <Navbar.Text className="me-2">
                  Bienvenido, {user.email} {isAdmin && "(Admin)"}
                </Navbar.Text>
                <Button variant="outline-danger" onClick={handleLogout}>
                  Cerrar Sesión
                </Button>
              </>
            ) : (
              <Button as={Link} to="/login" variant="outline-success">
                Iniciar Sesión
              </Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default MiNavbar;