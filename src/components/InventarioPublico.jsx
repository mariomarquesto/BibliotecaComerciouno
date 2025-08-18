import React, { useState, useEffect } from 'react';
import { Container, Alert, Table, Spinner, Form, Button, Modal } from 'react-bootstrap';
import { db, collection, onSnapshot, addDoc } from '../firebase/firebaseConfig';

// No se usan interfaces de TypeScript en archivos .jsx
// Si necesitas tipado, deberías usar TypeScript y renombrar el archivo a .tsx

function InventarioPublico() {
  const [librosList, setLibrosList] = useState([]);
  const [loadingLibros, setLoadingLibros] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para la funcionalidad de reserva
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [bookToReserve, setBookToReserve] = useState(null);
  const [reserverName, setReserverName] = useState('');
  const [reserverEmail, setReserverEmail] = useState('');
  const [reservationMessage, setReservationMessage] = useState(null);
  const [reservationVariant, setReservationVariant] = useState('success');
  const [loadingReservation, setLoadingReservation] = useState(false);

  // Efecto para escuchar los cambios en la colección 'libros' en tiempo real
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "libros"), (snapshot) => {
      const libros = [];
      snapshot.forEach((doc) => {
        libros.push({ id: doc.id, ...doc.data() });
      });
      setLibrosList(libros);
      setLoadingLibros(false);
    }, (err) => {
      console.error("Error al obtener libros en tiempo real:", err);
      setError('Error al cargar la lista de libros.');
      setLoadingLibros(false);
    });

    return () => unsubscribe(); // Limpiar el listener al desmontar
  }, []);

  const handleOpenReservationModal = (libro) => {
    setBookToReserve(libro);
    setShowReservationModal(true);
    setReserverName(''); // Limpiar campos al abrir el modal
    setReserverEmail('');
    setReservationMessage(null); // Limpiar mensajes anteriores
  };

  const handleCloseReservationModal = () => {
    setShowReservationModal(false);
    setBookToReserve(null);
    setReserverName('');
    setReserverEmail('');
    setReservationMessage(null);
  };

  const handleReserveSubmit = async (e) => {
    e.preventDefault();
    setLoadingReservation(true);
    setReservationMessage(null);

    if (!reserverName.trim() || !reserverEmail.trim()) {
      setReservationMessage('Por favor, ingresa tu nombre y correo electrónico.');
      setReservationVariant('danger');
      setLoadingReservation(false);
      return;
    }

    if (!bookToReserve) {
      setReservationMessage('No se pudo identificar el libro a reservar.');
      setReservationVariant('danger');
      setLoadingReservation(false);
      return;
    }

    try {
      await addDoc(collection(db, "reservations"), {
        bookId: bookToReserve.id,
        bookTitle: bookToReserve.titulo,
        reserverName: reserverName.trim(),
        reserverEmail: reserverEmail.trim(),
        reservationDate: new Date(),
        status: 'pending', 
      });

      setReservationMessage(`¡Libro "${bookToReserve.titulo}" reservado con éxito! Nos pondremos en contacto contigo.`);
      setReservationVariant('success');
      setLoadingReservation(false);
      
      setTimeout(() => {
        handleCloseReservationModal();
      }, 3000); 
    } catch (err) {
      console.error("Error al reservar el libro:", err);
      setReservationMessage(`Error al reservar el libro: ${err.message}. Por favor, intenta de nuevo.`);
      setReservationVariant('danger');
      setLoadingReservation(false);
    }
  };

  const filteredLibros = librosList.filter(libro =>
    libro.titulo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container className="my-5">
      <h2 className="text-center mb-4">Inventario de Libros de la Biblioteca</h2>

      <Form.Group className="mb-4">
        <Form.Control
          type="text"
          placeholder="Buscar libro por título..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Form.Group>

      {loadingLibros ? (
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Cargando libros...</span>
          </Spinner>
          <p className="mt-2">Cargando libros desde la base de datos...</p>
        </div>
      ) : error ? (
        <Alert variant="danger" className="text-center">{error}</Alert>
      ) : (
        filteredLibros.length === 0 ? (
          <Alert variant="info" className="text-center">
            {searchTerm ? `No se encontraron libros que contengan "${searchTerm}".` : "No hay libros registrados en la base de datos."}
          </Alert>
        ) : (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Título</th>
                <th>Estante</th>
                <th>Fila</th>
                <th>Cantidad</th>
                <th>Fecha de Registro</th>
                <th>PDF (Digital)</th> 
              </tr>
            </thead>
            <tbody>
              {filteredLibros.map((libro) => (
                <tr key={libro.id}>
                  <td>{libro.titulo}</td>
                  <td>{libro.estante}</td>
                  <td>{libro.fila}</td>
                  <td>{libro.cantidad}</td>
                  <td>{libro.fechaRegistro ? new Date(libro.fechaRegistro.seconds * 1000).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    {libro.pdfUrl ? ( // Solo verifica si pdfUrl existe en Firestore
                      <Button 
                        variant="info" 
                        size="sm" 
                        href={libro.pdfUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        Ver PDF
                      </Button>
                    ) : (
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={() => handleOpenReservationModal(libro)}
                      >
                        Reservar Libro
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )
      )}

      {/* Modal de Reserva de Libro */}
      <Modal show={showReservationModal} onHide={handleCloseReservationModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Reservar Libro: {bookToReserve?.titulo}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {reservationMessage && (
            <Alert variant={reservationVariant}>{reservationMessage}</Alert>
          )}
          <Form onSubmit={handleReserveSubmit}>
            <Form.Group className="mb-3" controlId="reserverName">
              <Form.Label>Tu Nombre</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingresa tu nombre completo"
                value={reserverName}
                onChange={(e) => setReserverName(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="reserverEmail">
              <Form.Label>Tu Correo Electrónico</Form.Label>
              <Form.Control
                type="email"
                placeholder="Ingresa tu email (ej: tu@ejemplo.com)"
                value={reserverEmail}
                onChange={(e) => setReserverEmail(e.target.value)}
                required
              />
              <Form.Text className="text-muted">
                Usaremos este correo para contactarte sobre tu reserva.
              </Form.Text>
            </Form.Group>
            <Button variant="primary" type="submit" disabled={loadingReservation}>
              {loadingReservation ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                  Enviando Reserva...
                </>
              ) : 'Confirmar Reserva'}
            </Button>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseReservationModal} disabled={loadingReservation}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default InventarioPublico;