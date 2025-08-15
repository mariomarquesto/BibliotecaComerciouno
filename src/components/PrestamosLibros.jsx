import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert, Table, Spinner, Modal } from 'react-bootstrap';
import { db, collection, addDoc, onSnapshot, doc, updateDoc } from '../firebase/firebaseConfig';
import moment from 'moment';

// Componente PrestamosLibros
function PrestamosLibros() {
    // --- Estados para el formulario de préstamo ---
    const [prestamoData, setPrestamoData] = useState({
        nombre: '',
        apellido: '',
        tipoUsuario: '', // 'profesor' o 'alumno'
        // Campos condicionales
        materia: '',    // Solo para profesor
        curso: '',      // Solo para alumno
        turno: '',      // Para alumno
        numeroInventario: '',
        tituloLibro: '',
    });
    const [mensaje, setMensaje] = useState(null);
    const [varianteMensaje, setVarianteMensaje] = useState('success');
    const [loading, setLoading] = useState(false);

    // --- Estados para las tablas de préstamos y devoluciones ---
    const [prestamosList, setPrestamosList] = useState([]);
    const [devolucionesList, setDevolucionesList] = useState([]);
    const [loadingPrestamos, setLoadingPrestamos] = useState(true);
    const [loadingDevoluciones, setLoadingDevoluciones] = useState(true);

    // --- Estados para el modal de confirmación de devolución ---
    const [showDevolverConfirm, setShowDevolverConfirm] = useState(false);
    const [prestamoToDevolver, setPrestamoToDevolver] = useState(null);

    // --- Efecto para cargar préstamos y devoluciones en tiempo real ---
    useEffect(() => {
        // Cargar Préstamos en tiempo real
        const unsubscribePrestamos = onSnapshot(collection(db, "prestamos"), (snapshot) => {
            const prestamos = [];
            snapshot.forEach((doc) => {
                prestamos.push({ id: doc.id, ...doc.data() });
            });
            setPrestamosList(prestamos);
            setLoadingPrestamos(false);
        }, (error) => {
            console.error("Error al obtener préstamos en tiempo real:", error);
            setMensaje('Error al cargar la lista de préstamos.');
            setVarianteMensaje('danger');
            setLoadingPrestamos(false);
        });

        // Cargar Devoluciones en tiempo real
        const unsubscribeDevoluciones = onSnapshot(collection(db, "devoluciones"), (snapshot) => {
            const devoluciones = [];
            snapshot.forEach((doc) => {
                devoluciones.push({ id: doc.id, ...doc.data() });
            });
            setDevolucionesList(devoluciones);
            setLoadingDevoluciones(false);
        }, (error) => {
            console.error("Error al obtener devoluciones en tiempo real:", error);
            setMensaje('Error al cargar la lista de devoluciones.');
            setVarianteMensaje('danger');
            setLoadingDevoluciones(false);
        });

        return () => {
            unsubscribePrestamos();
            unsubscribeDevoluciones();
        };
    }, []);

    // --- Manejo de cambios en los inputs del formulario ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        setPrestamoData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    // --- Manejo del envío del formulario de préstamo ---
    const handlePrestamoSubmit = async (e) => {
        e.preventDefault();
        setMensaje(null);
        setLoading(true);

        // Validaciones básicas
        if (!prestamoData.nombre || !prestamoData.apellido || !prestamoData.tipoUsuario || !prestamoData.numeroInventario || !prestamoData.tituloLibro) {
            setMensaje('Por favor, completa todos los campos obligatorios.');
            setVarianteMensaje('danger');
            setLoading(false);
            return;
        }

        if (prestamoData.tipoUsuario === 'profesor' && !prestamoData.materia) {
            setMensaje('Por favor, ingresa la materia para el profesor.');
            setVarianteMensaje('danger');
            setLoading(false);
            return;
        }

        if (prestamoData.tipoUsuario === 'alumno' && (!prestamoData.curso || !prestamoData.turno)) {
            setMensaje('Por favor, ingresa el curso y turno para el alumno.');
            setVarianteMensaje('danger');
            setLoading(false);
            return;
        }

        try {
            // Prepara los datos a guardar, ahora incluyendo 'numeroInventario' y 'tituloLibro'
            const dataToSave = {
                nombre: prestamoData.nombre,
                apellido: prestamoData.apellido,
                tipoUsuario: prestamoData.tipoUsuario,
                numeroInventario: prestamoData.numeroInventario,
                tituloLibro: prestamoData.tituloLibro,
                fechaPrestamo: new Date(), // Fecha actual del préstamo
                estado: 'prestado',
            };

            if (prestamoData.tipoUsuario === 'profesor') {
                dataToSave.materia = prestamoData.materia;
            } else if (prestamoData.tipoUsuario === 'alumno') {
                dataToSave.curso = prestamoData.curso;
                dataToSave.turno = prestamoData.turno;
            }

            await addDoc(collection(db, "prestamos"), dataToSave);

            setMensaje(`Préstamo del libro "${prestamoData.tituloLibro}" (N° ${prestamoData.numeroInventario}) a ${prestamoData.nombre} ${prestamoData.apellido} registrado con éxito.`);
            setVarianteMensaje('success');

            // Limpia el formulario
            setPrestamoData({
                nombre: '',
                apellido: '',
                tipoUsuario: '',
                materia: '',
                curso: '',
                turno: '',
                numeroInventario: '',
                tituloLibro: '',
            });

        } catch (e) {
            console.error("Error al registrar el préstamo: ", e);
            setMensaje(`Error al registrar el préstamo: ${e.message}`);
            setVarianteMensaje('danger');
        } finally {
            setLoading(false);
        }
    };

    // --- Manejo de la cancelación del formulario ---
    const handleCancel = () => {
        setPrestamoData({
            nombre: '',
            apellido: '',
            tipoUsuario: '',
            materia: '',
            curso: '',
            turno: '',
            numeroInventario: '',
            tituloLibro: '',
        });
        setMensaje(null);
    };

    // --- Funciones para la devolución ---
    const confirmDevolver = (prestamo) => {
        setPrestamoToDevolver(prestamo);
        setShowDevolverConfirm(true);
    };

    const handleDevolver = async () => {
        setShowDevolverConfirm(false);
        setMensaje(null);

        if (!prestamoToDevolver) return;

        try {
            await addDoc(collection(db, "devoluciones"), {
                ...prestamoToDevolver,
                fechaDevolucion: new Date(),
                prestamoId: prestamoToDevolver.id,
                estado: 'devuelto',
            });

            const prestamoRef = doc(db, "prestamos", prestamoToDevolver.id);
            await updateDoc(prestamoRef, {
                estado: 'devuelto',
                fechaDevolucion: new Date(),
            });

            setMensaje(`Libro "${prestamoToDevolver.tituloLibro}" (N° ${prestamoToDevolver.numeroInventario}) devuelto con éxito por ${prestamoToDevolver.nombre} ${prestamoToDevolver.apellido}.`);
            setVarianteMensaje('success');

        } catch (e) {
            console.error("Error al registrar la devolución: ", e);
            setMensaje(`Error al registrar la devolución: ${e.message}`);
            setVarianteMensaje('danger');
        } finally {
            setPrestamoToDevolver(null);
        }
    };

    return (
        <Container className="my-5">
            <h2 className="text-center mb-4">Gestión de Préstamos de Libros</h2>

            {mensaje && <Alert variant={varianteMensaje}>{mensaje}</Alert>}

            {/* --- Formulario de Préstamo --- */}
            <h3 className="mb-3">Registrar Nuevo Préstamo</h3>
            <Form onSubmit={handlePrestamoSubmit}>
                <div className="row">
                    <Form.Group className="mb-3 col-md-6">
                        <Form.Label>Nombre</Form.Label>
                        <Form.Control
                            type="text"
                            name="nombre"
                            value={prestamoData.nombre}
                            onChange={handleChange}
                            placeholder="Nombre del solicitante"
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3 col-md-6">
                        <Form.Label>Apellido</Form.Label>
                        <Form.Control
                            type="text"
                            name="apellido"
                            value={prestamoData.apellido}
                            onChange={handleChange}
                            placeholder="Apellido del solicitante"
                            required
                        />
                    </Form.Group>
                </div>

                <Form.Group className="mb-3">
                    <Form.Label>Tipo de Solicitante</Form.Label>
                    <Form.Select name="tipoUsuario" value={prestamoData.tipoUsuario} onChange={handleChange} required>
                        <option value="">Selecciona una opción</option>
                        <option value="profesor">Profesor</option>
                        <option value="alumno">Alumno</option>
                    </Form.Select>
                </Form.Group>

                {prestamoData.tipoUsuario === 'profesor' && (
                    <Form.Group className="mb-3">
                        <Form.Label>Materia</Form.Label>
                        <Form.Control
                            type="text"
                            name="materia"
                            value={prestamoData.materia}
                            onChange={handleChange}
                            placeholder="Materia que imparte"
                            required
                        />
                    </Form.Group>
                )}

                {prestamoData.tipoUsuario === 'alumno' && (
                    <>
                        <Form.Group className="mb-3">
                            <Form.Label>Curso</Form.Label>
                            <Form.Control
                                type="text"
                                name="curso"
                                value={prestamoData.curso}
                                onChange={handleChange}
                                placeholder="Ej: 5° B, 3° A"
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Turno</Form.Label>
                            <Form.Select name="turno" value={prestamoData.turno} onChange={handleChange} required>
                                <option value="">Selecciona un turno</option>
                                <option value="mañana">Mañana</option>
                                <option value="tarde">Tarde</option>
                                <option value="noche">Noche</option>
                            </Form.Select>
                        </Form.Group>
                    </>
                )}

                <div className="row">
                    <Form.Group className="mb-3 col-md-4">
                        <Form.Label>Número de Inventario</Form.Label>
                        <Form.Control
                            type="text"
                            name="numeroInventario"
                            value={prestamoData.numeroInventario}
                            onChange={handleChange}
                            placeholder="N° de inventario del libro"
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3 col-md-8">
                        <Form.Label>Título del Libro</Form.Label>
                        <Form.Control
                            type="text"
                            name="tituloLibro"
                            value={prestamoData.tituloLibro}
                            onChange={handleChange}
                            placeholder="Título, autor y editorial del libro"
                            required
                        />
                    </Form.Group>
                </div>

                <div className="d-flex justify-content-between mt-4">
                    <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? <Spinner animation="border" size="sm" /> : 'Guardar Préstamo'}
                    </Button>
                    <Button variant="secondary" onClick={handleCancel} disabled={loading}>
                        Cancelar
                    </Button>
                </div>
            </Form>

            <hr className="my-5" />

            {/* --- Tabla de Préstamos Activos --- */}
            <h3 className="text-center mb-4">Préstamos Activos</h3>
            {loadingPrestamos ? (
                <div className="text-center">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Cargando préstamos...</span>
                    </Spinner>
                    <p className="mt-2">Cargando préstamos desde la base de datos...</p>
                </div>
            ) : (
                prestamosList.filter(p => p.estado === 'prestado').length === 0 ? (
                    <Alert variant="info" className="text-center">
                        No hay préstamos activos en este momento.
                    </Alert>
                ) : (
                    <Table striped bordered hover responsive className="mt-3">
                        <thead>
                            <tr>
                                <th>N° Inventario</th>
                                <th>Título del Libro</th>
                                <th>Nombre Completo</th>
                                <th>Tipo</th>
                                <th>Detalle</th>
                                <th>Fecha Préstamo</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {prestamosList.filter(p => p.estado === 'prestado').map((prestamo) => (
                                <tr key={prestamo.id}>
                                    <td>{prestamo.numeroInventario}</td>
                                    <td>{prestamo.tituloLibro}</td>
                                    <td>{prestamo.nombre} {prestamo.apellido}</td>
                                    <td>{prestamo.tipoUsuario === 'profesor' ? 'Profesor' : 'Alumno'}</td>
                                    <td>
                                        {prestamo.tipoUsuario === 'profesor' ? `Materia: ${prestamo.materia}` : `Curso: ${prestamo.curso}, Turno: ${prestamo.turno}`}
                                    </td>
                                    <td>{moment(prestamo.fechaPrestamo.toDate()).format('DD/MM/YYYY HH:mm')}</td>
                                    <td>
                                        <Button
                                            variant="success"
                                            size="sm"
                                            onClick={() => confirmDevolver(prestamo)}
                                        >
                                            Devolver
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )
            )}

            <hr className="my-5" />

            {/* --- Tabla de Historial de Devoluciones --- */}
            <h3 className="text-center mb-4">Historial de Devoluciones</h3>
            {loadingDevoluciones ? (
                <div className="text-center">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Cargando devoluciones...</span>
                    </Spinner>
                    <p className="mt-2">Cargando historial de devoluciones...</p>
                </div>
            ) : (
                devolucionesList.length === 0 ? (
                    <Alert variant="info" className="text-center">
                        No hay devoluciones registradas en el historial.
                    </Alert>
                ) : (
                    <Table striped bordered hover responsive className="mt-3">
                        <thead>
                            <tr>
                                <th>N° Inventario</th>
                                <th>Título del Libro</th>
                                <th>Nombre Completo</th>
                                <th>Tipo</th>
                                <th>Detalle</th>
                                <th>Fecha Préstamo</th>
                                <th>Fecha Devolución</th>
                            </tr>
                        </thead>
                        <tbody>
                            {devolucionesList.map((devolucion) => (
                                <tr key={devolucion.id}>
                                    <td>{devolucion.numeroInventario}</td>
                                    <td>{devolucion.tituloLibro}</td>
                                    <td>{devolucion.nombre} {devolucion.apellido}</td>
                                    <td>{devolucion.tipoUsuario === 'profesor' ? 'Profesor' : 'Alumno'}</td>
                                    <td>
                                        {devolucion.tipoUsuario === 'profesor' ? `Materia: ${devolucion.materia}` : `Curso: ${devolucion.curso}, Turno: ${devolucion.turno}`}
                                    </td>
                                    <td>{moment(devolucion.fechaPrestamo.toDate()).format('DD/MM/YYYY HH:mm')}</td>
                                    <td>{moment(devolucion.fechaDevolucion.toDate()).format('DD/MM/YYYY HH:mm')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )
            )}

            {/* Modal de Confirmación de Devolución */}
            <Modal show={showDevolverConfirm} onHide={() => setShowDevolverConfirm(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar Devolución</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    ¿Estás seguro de que quieres registrar la devolución del libro **"{prestamoToDevolver?.tituloLibro}"**
                    (N° {prestamoToDevolver?.numeroInventario}) prestado a **{prestamoToDevolver?.nombre} {prestamoToDevolver?.apellido}**?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDevolverConfirm(false)}>
                        Cancelar
                    </Button>
                    <Button variant="success" onClick={handleDevolver}>
                        Confirmar Devolución
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default PrestamosLibros;