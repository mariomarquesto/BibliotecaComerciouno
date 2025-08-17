import React, { useState } from 'react';
import { Container, Form, Button, Alert, Card } from 'react-bootstrap';
// ¡IMPORTANTE! Importamos nuestro servicio de autenticación local
import localAuthService from '../auth/localAuthService'; 
// Para redirigir después del inicio de sesión
import { useNavigate } from 'react-router-dom'; 

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // Tipo explícito string | null para el error
  const navigate = useNavigate(); // Hook para la navegación programática

  const handleLogin = async (e) => {
    e.preventDefault(); // Evita que la página se recargue
    setLoading(true); // Activa el estado de carga
    setError(null); // Limpia errores anteriores

    try {
      // ¡AHORA USAMOS EL SERVICIO DE AUTENTICACIÓN LOCAL!
      const response = await localAuthService.login(email, password);
      
      if (response && response.user) {
        // Guarda la información del usuario en localStorage para persistencia de sesión
        // Esto permite que App.jsx sepa quién está logueado después de una recarga
        localStorage.setItem('currentUser', JSON.stringify(response.user));
        
        // Si el inicio de sesión es exitoso, redirige al usuario a la página de ingresar libros
        navigate('/ingresar-libro'); 
        // Forzamos una recarga completa de la página para que App.jsx vuelva a evaluar
        // el estado del usuario desde localStorage y actualice user/isAdmin.
        window.location.reload(); 
      } else {
        setError("Error de autenticación inesperado.");
      }

    } catch (err: any) { // Captura el error para acceder a sus propiedades (como 'message')
      console.error("Error al iniciar sesión local:", err);
      // Muestra el mensaje de error personalizado desde localAuthService
      setError(err.message || "Error al iniciar sesión. Verifica tus credenciales."); 
    } finally {
      setLoading(false); // Desactiva el estado de carga
    }
  };

  return (
    <Container className="my-5 d-flex justify-content-center">
      <Card style={{ width: '25rem' }} className="shadow-sm">
        <Card.Header className="text-center bg-primary text-white">
          <h5>Iniciar Sesión de Administrador Local</h5>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>} {/* Muestra mensajes de error */}
          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Dirección de Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Ingresa tu email (ej: mario@gmail.com)"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control
                type="password"
                placeholder="Contraseña (ej: mario123)"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100" disabled={loading}>
              {loading ? 'Iniciando...' : 'Iniciar Sesión'} {/* Cambia texto del botón durante carga */}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default LoginPage;
