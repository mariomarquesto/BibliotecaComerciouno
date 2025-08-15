import React, { useState, useEffect } from 'react';
import { Container, Spinner, Alert, Card, ListGroup, Form, Button, Modal, Row, Col } from 'react-bootstrap';
import { db, collection, onSnapshot, addDoc } from '../firebase/firebaseConfig';
import { serverTimestamp } from 'firebase/firestore'; // ¡CAMBIO AQUÍ!
import { FaPlus } from 'react-icons/fa';

function InventarioBiblioteca() {
    const [inventario, setInventario] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const [item, setItem] = useState('');
    const [categoria, setCategoria] = useState('');
    const [cantidad, setCantidad] = useState(1);
    const [notas, setNotas] = useState('');

    const categorias = [
        'Mapas', 
        'Juegos de Ajedrez', 
        'Materiales de Geometría', 
        'Netbooks', 
        'Mesas y Sillas', 
        'Escritorios', 
        'General'
    ];

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "inventarioBiblioteca"), (snapshot) => {
            const inventarioAgrupado = {};
            snapshot.docs.forEach((doc) => {
                const data = { id: doc.id, ...doc.data() };
                const categoria = data.categoria || 'Sin Categoría';
                if (!inventarioAgrupado[categoria]) {
                    inventarioAgrupado[categoria] = [];
                }
                inventarioAgrupado[categoria].push(data);
            });
            setInventario(inventarioAgrupado);
            setLoading(false);
        }, (err) => {
            console.error("Error al obtener el inventario:", err);
            setError("Error al cargar el inventario.");
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleAddItem = async (e) => {
        e.preventDefault();
        if (!item || !categoria || !cantidad) {
            alert('Por favor, completa todos los campos.');
            return;
        }

        const nuevoItem = {
            item,
            categoria,
            cantidad: Number(cantidad),
            notas,
            timestamp: serverTimestamp(),
        };

        try {
            await addDoc(collection(db, "inventarioBiblioteca"), nuevoItem);
            // Limpiar formulario
            setItem('');
            setCategoria('');
            setCantidad(1);
            setNotas('');
            setShowModal(false);
        } catch (err) {
            console.error("Error al añadir el item:", err);
            alert("Hubo un error al guardar el item.");
        }
    };

    if (loading) {
        return <Container className="text-center my-5"><Spinner animation="border" /></Container>;
    }

    if (error) {
        return <Container className="text-center my-5"><Alert variant="danger">{error}</Alert></Container>;
    }

    return (
        <Container className="my-5">
            <Row className="mb-4 align-items-center">
                <Col>
                    <h2 className="mb-0">Inventario de la Biblioteca</h2>
                </Col>
                <Col className="text-end">
                    <Button variant="primary" onClick={() => setShowModal(true)}>
                        <FaPlus className="me-2" />
                        Añadir Nuevo Artículo
                    </Button>
                </Col>
            </Row>

            <Row>
                {Object.keys(inventario).sort().map(categoria => (
                    <Col md={6} lg={4} className="mb-4" key={categoria}>
                        <Card>
                            <Card.Header as="h5">{categoria}</Card.Header>
                            <Card.Body>
                                <ListGroup variant="flush">
                                    {inventario[categoria].map(invItem => (
                                        <ListGroup.Item key={invItem.id} className="d-flex justify-content-between align-items-center">
                                            {invItem.item}
                                            <span className="fw-bold">{invItem.cantidad}</span>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Añadir Nuevo Artículo</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleAddItem}>
                        <Form.Group className="mb-3">
                            <Form.Label>Artículo</Form.Label>
                            <Form.Control type="text" value={item} onChange={(e) => setItem(e.target.value)} required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Categoría</Form.Label>
                            <Form.Select value={categoria} onChange={(e) => setCategoria(e.target.value)} required>
                                <option value="">Selecciona una categoría</option>
                                {categorias.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Cantidad</Form.Label>
                            <Form.Control type="number" value={cantidad} onChange={(e) => setCantidad(e.target.value)} min="1" required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Notas (opcional)</Form.Label>
                            <Form.Control as="textarea" rows={3} value={notas} onChange={(e) => setNotas(e.target.value)} />
                        </Form.Group>
                        <Button variant="primary" type="submit" className="w-100">
                            Guardar Artículo
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
}

export default InventarioBiblioteca;