import React from 'react';
import { Container } from 'react-bootstrap';

function HomePage() {
  return (
    // Contenedor principal. El gradiente de fondo vibrante ahora viene de App.css (#root)
    // Este div asegura que el contenido esté centrado vertical y horizontalmente.
    <div style={{
      minHeight: 'calc(100vh - 56px)', // Ocupa el espacio restante de la pantalla (resta la altura de la Navbar)
      display: 'flex',
      justifyContent: 'center', // Centra horizontalmente
      alignItems: 'center',    // Centra verticalmente
      padding: '20px',
      overflow: 'hidden',      // Oculta cualquier desbordamiento de animaciones o contenido
    }}>
      {/* Estilos CSS y animaciones integrados directamente en el componente */}
      <style>
        {`
        /* Animación de entrada: el contenido aparece con un desvanecimiento y una pequeña escala */
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        /* Animación sutil de pulso: hace que la sombra de la tarjeta "respire" */
        @keyframes pulseShadow {
          0% {
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
          }
          50% {
            box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
          }
          100% {
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
          }
        }

        /* Estilos base para la tarjeta principal de la Home Page */
        .homepage-card {
          background: #fff; /* Fondo blanco para la tarjeta, para que resalte sobre el gradiente */
          border-radius: 15px;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
          animation: pulseShadow 2s infinite ease-in-out; /* Aplica la animación de pulso */
          max-width: 900px; /* Limita el ancho de la tarjeta para mejor legibilidad */
          width: 100%; /* Asegura que la tarjeta ocupe el ancho disponible */
        }

        /* Estilos y animaciones para los elementos de texto dentro de la Home Page */
        .homepage-text {
          animation: fadeInScale 1.2s ease-out forwards; /* Aplica la animación de entrada */
          opacity: 0; /* Inicia invisible */
          transform: translateY(20px); /* Inicia ligeramente abajo */
          color: #333; /* Color de texto oscuro para mayor contraste en fondo blanco de tarjeta */
        }

        /* Asegura que los títulos y párrafos lead dentro de la tarjeta tengan el color correcto */
        .homepage-card h1, .homepage-card p.lead {
          color: #333; 
        }

        /* Animación de "saludo" para el emoji */
        .welcome-icon {
          display: inline-block;
          animation: wave 2s infinite; /* Aplica la animación de onda */
          transform-origin: 70% 70%; /* Punto de rotación para el efecto de onda */
        }

        @keyframes wave {
          0% { transform: rotate(0deg); }
          10% { transform: rotate(14deg); }
          20% { transform: rotate(-8deg); }
          30% { transform: rotate(14deg); }
          40% { transform: rotate(-4deg); }
          50% { transform: rotate(10deg); }
          60% { transform: rotate(0deg); }
          100% { transform: rotate(0deg); }
        }
        `}
      </style>
      
      {/* Contenedor central con estilos de Bootstrap y clase para animación */}
      <Container className="text-center py-5 homepage-card">
        <h1 className="display-4 mb-3 homepage-text">
          <span className="welcome-icon">👋</span> ¡Bienvenido a la Biblioteca Virtual!
        </h1>
        <p className="lead homepage-text" style={{ animationDelay: '0.3s' }}>
          Escuela de Comercio Número 1
        </p>
        <p className="lead homepage-text" style={{ animationDelay: '0.6s' }}>
          General Manuel Belgrano
        </p>
        <hr className="my-4 homepage-text" style={{ animationDelay: '0.9s' }} />
        
        {/* Mensaje final con enlaces, también animado */}
        <p className="homepage-text mt-4" style={{ animationDelay: '1.2s' }}>
          Usa la barra de navegación para navegar por la aplicación.
        </p>
      </Container>
    </div>
  );
}

export default HomePage;