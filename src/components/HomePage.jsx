import React from 'react';
import { Container } from 'react-bootstrap'; // Importamos Container si lo vamos a usar dentro

             

function HomePage() {
  return (
    // Agregamos una clase de Bootstrap para el color de fondo y algo de padding
    // bg-light es un gris claro. Puedes cambiarlo a bg-info, bg-success, etc.
    <div className="bg-light p-5 rounded">
      <Container className="text-center my-5">
        <h1 className="display-4 mb-3">👋 ¡Bienvenido a la Biblioteca Virtual!</h1>
        <p className="lead">Escuela de Comercio Número 1 </p>
        <p className="lead">General Manuel Belgrano </p>
        <hr className="my-4" />
        <p>Usa la barra de navegación para **"Ingresar Libro"** o para **"Explorar Inventario"**.</p>
      </Container>
    </div>
  );
}

export default HomePage;