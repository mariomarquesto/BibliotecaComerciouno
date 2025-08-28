import React, { useState, useEffect } from 'react';
import { Container, Spinner, Alert, Card, ListGroup, Form, Button, Modal, Row, Col, Table } from 'react-bootstrap';
import { db, collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc } from '../firebase/firebaseConfig';
import { serverTimestamp } from 'firebase/firestore';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

function InventarioBiblioteca() {
    const [inventario, setInventario] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [item, setItem] = useState('');
    const [categoria, setCategoria] = useState('');
    const [cantidad, setCantidad] = useState(1);
    const [notas, setNotas] = useState('');
    const [editingItem, setEditingItem] = useState(null);

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

    const resetForm = () => {
        setShowModal(false);
        setEditingItem(null);
        setItem('');
        setCategoria('');
        setCantidad(1);
        setNotas('');
    };

    const handleOpenAddModal = () => {
        setEditingItem(null);
        setItem('');
        setCategoria('');
        setCantidad(1);
        setNotas('');
        setShowModal(true);
    };

    const handleEditClick = (invItem) => {
        setEditingItem(invItem);
        setItem(invItem.item);
        setCategoria(invItem.categoria);
        setCantidad(invItem.cantidad);
        setNotas(invItem.notas);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!item || !categoria || !cantidad) {
            alert('Por favor, completa todos los campos obligatorios.');
            return;
        }

        if (editingItem) {
            const itemRef = doc(db, "inventarioBiblioteca", editingItem.id);
            try {
                await updateDoc(itemRef, {
                    item,
                    categoria,
                    cantidad: Number(cantidad),
                    notas,
                });
                resetForm();
            } catch (err) {
                console.error("Error al actualizar el item:", err);
                alert("Hubo un error al actualizar el item.");
            }
        } else {
            const newItem = {
                item,
                categoria,
                cantidad: Number(cantidad),
                notas,
                timestamp: serverTimestamp(),
            };
            try {
                await addDoc(collection(db, "inventarioBiblioteca"), newItem);
                resetForm();
            } catch (err) {
                console.error("Error al añadir el item:", err);
                alert("Hubo un error al guardar el item.");
            }
        }
    };

    const handleDeleteItem = async (id) => {
        if (window.confirm("¿Estás seguro de que quieres eliminar este artículo? Esta acción no se puede deshacer.")) {
            try {
                await deleteDoc(doc(db, "inventarioBiblioteca", id));
                console.log("Document successfully deleted!");
            } catch (err) {
                console.error("Error removing document: ", err);
                alert("Hubo un error al eliminar el artículo.");
            }
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
                    <Button variant="primary" onClick={handleOpenAddModal}>
                        <FaPlus className="me-2" />
                        Añadir Nuevo Artículo
                    </Button>
                </Col>
            </Row>

            <Row>
                {Object.keys(inventario).sort().map(categoria => (
                    <Col lg={12} className="mb-4" key={categoria}>
                        <Card>
                            <Card.Header as="h5">{categoria}</Card.Header>
                            <Card.Body>
                                <Table striped bordered hover responsive>
                                    <thead>
                                        <tr>
                                            <th>Artículo</th>
                                            <th>Cantidad</th>
                                            <th>Notas</th>
                                            <th className="text-center">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {inventario[categoria].map(invItem => (
                                            <tr key={invItem.id}>
                                                <td>{invItem.item}</td>
                                                <td>{invItem.cantidad}</td>
                                                <td>{invItem.notas || '-'}</td>
                                                <td className="text-center">
                                                    <Button 
                                                        variant="outline-secondary" 
                                                        size="sm" 
                                                        className="me-2"
                                                        onClick={() => handleEditClick(invItem)}
                                                    >
                                                        <FaEdit />
                                                    </Button>
                                                    <Button 
                                                        variant="outline-danger" 
                                                        size="sm"
                                                        onClick={() => handleDeleteItem(invItem.id)}
                                                    >
                                                        <FaTrash />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Modal show={showModal} onHide={resetForm}>
                <Modal.Header closeButton>
                    <Modal.Title>{editingItem ? 'Editar Artículo' : 'Añadir Nuevo Artículo'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
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
                            {editingItem ? 'Actualizar Artículo' : 'Guardar Artículo'}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
}

export default InventarioBiblioteca;