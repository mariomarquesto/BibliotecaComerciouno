import React, { useState, useEffect } from 'react';
import { Container, Alert, Table, Spinner, Card, ListGroup, Button, Form } from 'react-bootstrap'; // <-- AGREGADO 'Form' aquí
import { db, collection, onSnapshot, doc, deleteDoc, updateDoc } from '../firebase/firebaseConfig';

function AdminReservations({ isAdmin }) { // Recibe isAdmin para control de acceso
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'pending', 'completed', 'cancelled'

  useEffect(() => {
    // Si no es admin, no cargar datos y mostrar error
    if (!isAdmin) {
      setLoading(false);
      setError("Acceso denegado. Solo administradores pueden ver esta sección.");
      return;
    }

    setLoading(true);
    const unsubscribe = onSnapshot(collection(db, "reservations"), (snapshot) => {
      const fetchedReservations = [];
      snapshot.forEach((doc) => {
        fetchedReservations.push({ id: doc.id, ...doc.data() });
      });
      // Ordenar las reservas por fecha, las más recientes primero
      fetchedReservations.sort((a, b) => b.reservationDate.seconds - a.reservationDate.seconds);
      setReservations(fetchedReservations);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching reservations:", err);
      setError("Error al cargar las reservas. Intenta de nuevo.");
      setLoading(false);
    });

    return () => unsubscribe(); // Limpiar el listener al desmontar
  }, [isAdmin]); // Dependencia en isAdmin para recargar si el rol cambia

  const handleUpdateReservationStatus = async (reservationId, newStatus) => {
    if (!isAdmin) {
      setMessage("No tienes permisos para actualizar reservas.");
      return;
    }
    setMessage(null);
    try {
      const reservationRef = doc(db, "reservations", reservationId);
      await updateDoc(reservationRef, {
        status: newStatus,
        lastUpdated: new Date()
      });
      setMessage(`Reserva actualizada a "${newStatus}" con éxito.`);
    } catch (err) {
      console.error("Error updating reservation status:", err);
      setMessage("Error al actualizar el estado de la reserva.");
    }
  };

  const handleDeleteReservation = async (reservationId) => {
    if (!isAdmin) {
      setMessage("No tienes permisos para eliminar reservas.");
      return;
    }
    setMessage(null);
    if (window.confirm("¿Estás seguro de que quieres eliminar esta reserva?")) {
      try {
        await deleteDoc(doc(db, "reservations", reservationId));
        setMessage("Reserva eliminada con éxito.");
      } catch (err) {
        console.error("Error deleting reservation:", err);
        setMessage("Error al eliminar la reserva.");
      }
    }
  };

  const filteredReservations = reservations.filter(res => 
    filterStatus === 'all' || res.status === filterStatus
  );

  if (loading) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando reservas...</span>
        </Spinner>
        <p className="mt-2">Cargando datos de reservas...</p>
      </Container>
    );
  }

  if (!isAdmin) {
    return (
      <Container className="my-5 text-center">
        <Alert variant="danger">Acceso denegado. Solo administradores pueden ver esta sección.</Alert>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <h2 className="text-center mb-4">Gestión de Reservas de Libros</h2>

      {error && <Alert variant="danger">{error}</Alert>}
      {message && <Alert variant="success">{message}</Alert>}

      <Card className="mb-4 shadow-sm">
        <Card.Header as="h5">Filtros</Card.Header>
        <Card.Body>
          <Form.Group className="mb-3">
            <Form.Label>Estado de la Reserva</Form.Label>
            <Form.Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">Todas</option>
              <option value="pending">Pendientes</option>
              <option value="completed">Completadas</option>
              <option value="cancelled">Canceladas</option>
            </Form.Select>
          </Form.Group>
        </Card.Body>
      </Card>

      {filteredReservations.length === 0 ? (
        <Alert variant="info" className="text-center">
          {filterStatus === 'all' ? "No hay reservas registradas." : `No hay reservas "${filterStatus}" en este momento.`}
        </Alert>
      ) : (
        <Table striped bordered hover responsive className="shadow-sm">
          <thead>
            <tr>
              <th>Libro</th>
              <th>Reservado Por</th>
              <th>Email</th>
              <th>Fecha de Reserva</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredReservations.map((res) => (
              <tr key={res.id}>
                <td>{res.bookTitle}</td>
                <td>{res.reserverName}</td>
                <td>{res.reserverEmail}</td>
                <td>{res.reservationDate ? new Date(res.reservationDate.seconds * 1000).toLocaleDateString() : 'N/A'}</td>
                <td>
                  <span className={`badge ${
                    res.status === 'pending' ? 'bg-warning text-dark' :
                    res.status === 'completed' ? 'bg-success' :
                    res.status === 'cancelled' ? 'bg-danger' : 'bg-secondary'
                  }`}>
                    {res.status.charAt(0).toUpperCase() + res.status.slice(1)}
                  </span>
                </td>
                <td>
                  {res.status === 'pending' && (
                    <>
                      <Button 
                        variant="success" 
                        size="sm" 
                        className="me-2" 
                        onClick={() => handleUpdateReservationStatus(res.id, 'completed')}
                      >
                        Completar
                      </Button>
                      <Button 
                        variant="danger" 
                        size="sm" 
                        onClick={() => handleUpdateReservationStatus(res.id, 'cancelled')}
                      >
                        Cancelar
                      </Button>
                    </>
                  )}
                  {(res.status === 'completed' || res.status === 'cancelled') && (
                    <Button 
                      variant="outline-danger" 
                      size="sm" 
                      onClick={() => handleDeleteReservation(res.id)}
                    >
                      Eliminar
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}

export default AdminReservations;
