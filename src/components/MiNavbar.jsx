
import { Link, useNavigate } from 'react-router-dom';

import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Button from 'react-bootstrap/Button';
import localAuthService from '../auth/localAuthService'; 

// Importa el logo de la escuela
import logo from '../assets/logo.jpeg'; 

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
    // CAMBIO AQUÍ: Usamos 'app-navbar' para el fondo del Navbar
    <Navbar expand="lg" className="app-navbar rounded-3"> 
      <Container fluid>
        <Navbar.Brand as={Link} to="/biblioteca">
          <img
            src={logo}
            height="40" 
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
            {/* CAMBIO AQUÍ: Añadimos 'text-white' a los Nav.Link */}
            <Nav.Link as={Link} to="/" className="text-white"> 
              Home
            </Nav.Link>
            
            {isAdmin && (
              <Nav.Link as={Link} to="/ingresar-libro" className="text-white">
                Ingresar y Ver Libros
              </Nav.Link>
            )}

            <Nav.Link as={Link} to="/buscar-gutenberg" className="text-white">
              Buscar en Gutenberg
            </Nav.Link>

            {isAdmin && (
              // CAMBIO AQUÍ: Añadimos 'text-white' al NavDropdown title
              <NavDropdown title={<span className="text-white">Más Opciones</span>} id="navbarScrollingDropdown">
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
            {user ? (
              <>
                {/* CAMBIO AQUÍ: Añadimos 'text-white' a Navbar.Text */}
                <Navbar.Text className="me-2 text-white"> 
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
