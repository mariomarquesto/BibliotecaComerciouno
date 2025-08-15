import React from "react";
import { Link } from "react-router-dom";

import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";

function MiNavbar() {
  return (
    <Navbar expand="lg" className="bg-body-tertiary rounded-3">
      <Container fluid>
        <Navbar.Brand as={Link} to="/">
          BIBLIOTECA
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
            <Nav.Link as={Link} to="/ingresar-libro">
              Ingresar y Ver Libros
            </Nav.Link>

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
              <NavDropdown.Item as={Link} to="/inventario"> {/* ¡NUEVO ENLACE! */}
                Inventario
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/reportes">
                Reportes Inventario
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default MiNavbar;