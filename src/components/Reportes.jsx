import React, { useState, useEffect } from 'react';
import { Container, Card, Spinner, Alert, ListGroup } from 'react-bootstrap';
import { db, collection, getDocs } from '../firebase/firebaseConfig';

function Reportes() {
  // Estado para el total de libros
  const [totalLibros, setTotalLibros] = useState(0);
  // Estado para el conteo de libros por estante
  const [librosPorEstante, setLibrosPorEstante] = useState({});
  // Nuevo estado para el conteo de libros por estante y fila
  const [librosPorFila, setLibrosPorFila] = useState({});
  // Estado para indicar si los datos se están cargando
  const [loading, setLoading] = useState(true);
  // Estado para manejar errores
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReportsData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Obtiene todos los documentos de la colección "libros"
        const querySnapshot = await getDocs(collection(db, "libros"));
        let count = 0;
        const estantesCount = {};
        const filasCount = {}; // Objeto temporal para contar por fila y estante

        // Itera sobre cada documento (libro)
        querySnapshot.forEach((doc) => {
          const libro = doc.data();
          count += libro.cantidad || 0;

          const estante = libro.estante;
          const fila = libro.fila;

          // Cuenta libros por estante
          if (estante) {
            estantesCount[estante] = (estantesCount[estante] || 0) + (libro.cantidad || 0);
          }

          // Cuenta libros por estante y fila, usando una clave combinada
          if (estante && fila) {
            const key = `Estante ${estante}, Fila ${fila}`;
            filasCount[key] = (filasCount[key] || 0) + (libro.cantidad || 0);
          }
        });

        // Actualiza los estados con los datos calculados
        setTotalLibros(count);
        setLibrosPorEstante(estantesCount);
        setLibrosPorFila(filasCount);

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
          
          {/* Nueva Tarjeta de Libros por Estante y Fila */}
          <div className="col-12 mb-4">
            <Card className="shadow-sm">
              <Card.Header as="h5">Libros por Estante y Fila</Card.Header>
              <ListGroup variant="flush">
                {/* Mapea y muestra los datos de librosPorFila */}
                {Object.keys(librosPorFila).sort((a, b) => {
                  const [estanteA, filaA] = a.split(', Fila ').map(part => parseInt(part.replace('Estante ', '')));
                  const [estanteB, filaB] = b.split(', Fila ').map(part => parseInt(part.replace('Estante ', '')));
                  if (estanteA !== estanteB) return estanteA - estanteB;
                  return filaA - filaB;
                }).map((key) => (
                  <ListGroup.Item key={key} className="d-flex justify-content-between align-items-center">
                    {key}
                    <span className="badge bg-secondary rounded-pill">{librosPorFila[key]} libros</span>
                  </ListGroup.Item>
                ))}
                {Object.keys(librosPorFila).length === 0 && (
                  <ListGroup.Item className="text-center text-muted">No hay libros registrados con estante y fila.</ListGroup.Item>
                )}
              </ListGroup>
            </Card>
          </div>
        </div>
      )}
    </Container>
  );
}

export default Reportes;