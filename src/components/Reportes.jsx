import React, { useState, useEffect } from 'react';
import { Container, Card, Spinner, Alert, ListGroup } from 'react-bootstrap';
import { db, collection, getDocs } from '../firebase/firebaseConfig'; // Importa getDocs para obtener datos una vez

function Reportes() {
  const [totalLibros, setTotalLibros] = useState(0);
  const [librosPorEstante, setLibrosPorEstante] = useState({}); // Objeto para contar libros por estante
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReportsData = async () => {
      setLoading(true);
      setError(null);
      try {
        const querySnapshot = await getDocs(collection(db, "libros"));
        let count = 0;
        const estantesCount = {}; // Objeto temporal para contar libros por estante

        querySnapshot.forEach((doc) => {
          const libro = doc.data();
          count += libro.cantidad || 0; // Suma la cantidad de cada libro

          // Cuenta libros por estante
          const estante = libro.estante;
          if (estante) {
            estantesCount[estante] = (estantesCount[estante] || 0) + (libro.cantidad || 0);
          }
        });

        setTotalLibros(count);
        setLibrosPorEstante(estantesCount);

      } catch (err) {
        console.error("Error al generar reportes:", err);
        setError("No se pudieron cargar los datos de los reportes. Intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    };

    fetchReportsData();
  }, []); // Se ejecuta solo una vez al montar el componente

  return (
    <Container className="my-5">
      <h2 className="text-center mb-4">Reportes de la Biblioteca</h2>

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Cargando reportes...</span>
          </Spinner>
          <p className="mt-2">Generando reportes de la base de datos...</p>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <div className="row">
          {/* Tarjeta de Total de Libros */}
          <div className="col-md-6 mb-4">
            <Card className="text-center shadow-sm">
              <Card.Header as="h5">Total de Libros en Inventario</Card.Header>
              <Card.Body>
                <Card.Title className="display-4 text-primary">{totalLibros}</Card.Title>
                <Card.Text>Cantidad total de ejemplares disponibles en la biblioteca.</Card.Text>
              </Card.Body>
            </Card>
          </div>

          {/* Tarjeta de Libros por Estante */}
          <div className="col-md-6 mb-4">
            <Card className="shadow-sm">
              <Card.Header as="h5">Libros por Estante</Card.Header>
              <ListGroup variant="flush">
                {Object.keys(librosPorEstante).sort((a, b) => parseInt(a) - parseInt(b)).map((estante) => (
                  <ListGroup.Item key={estante} className="d-flex justify-content-between align-items-center">
                    Estante {estante}
                    <span className="badge bg-secondary rounded-pill">{librosPorEstante[estante]} libros</span>
                  </ListGroup.Item>
                ))}
                {Object.keys(librosPorEstante).length === 0 && (
                  <ListGroup.Item className="text-center text-muted">No hay libros registrados en estantes.</ListGroup.Item>
                )}
              </ListGroup>
            </Card>
          </div>
          
          {/* Puedes añadir más tarjetas de reportes aquí, por ejemplo:
          <div className="col-md-6 mb-4">
            <Card className="text-center shadow-sm">
              <Card.Header as="h5">Libros por Fila</Card.Header>
              <Card.Body>
                <Card.Title className="display-4 text-success">...</Card.Title>
                <Card.Text>...</Card.Text>
              </Card.Body>
            </Card>
          </div>
          */}
        </div>
      )}
    </Container>
  );
}

export default Reportes;