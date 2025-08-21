import React, { useState, useEffect } from 'react';
import { Container, Spinner, Alert, Card, Table, Form, Row, Col } from 'react-bootstrap';
// Asegúrate de importar 'db', 'collection', y 'onSnapshot', 'getDocs' para Firestore
import { db, collection, onSnapshot, getDocs } from '../firebase/firebaseConfig';
import moment from 'moment';
import 'moment/locale/es';
import './ReportesBiblioteca.css'; // Asegúrate de que este archivo CSS exista si tienes estilos personalizados.

moment.locale('es');

function ReporteUsoBiblioteca() {
    const [usoList, setUsoList] = useState([]);
    const [loading, setLoading] = useState(true); // Carga principal de todos los reportes
    const [error, setError] = useState(null);

    const [usoPorMateria, setUsoPorMateria] = useState([]);
    const [usoPorProfesor, setUsoPorProfesor] = useState([]);
    const [usoPorTurno, setUsoPorTurno] = useState([]);
    const [usoPorPeriodo, setUsoPorPeriodo] = useState({});

    const [periodoFiltro, setPeriodoFiltro] = useState('diario');

    // --- NUEVOS ESTADOS PARA EL REPORTE DE VISITAS A LA PÁGINA ---
    const [totalPageVisits, setTotalPageVisits] = useState(0);
    const [loadingPageVisits, setLoadingPageVisits] = useState(true); // Carga específica para visitas
    const [errorPageVisits, setErrorPageVisits] = useState(null); // Error específico para visitas

    // useEffect para obtener todos los datos de uso de la biblioteca (usoBiblioteca)
    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "usoBiblioteca"), (snapshot) => {
            const uso = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setUsoList(uso);
            setLoading(false); // Desactiva la carga principal una vez que los datos de usoBiblioteca están listos
        }, (err) => {
            console.error("Error al obtener los datos de uso de la biblioteca:", err);
            setError("Error al cargar los datos de uso de la biblioteca.");
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // --- NUEVO useEffect para obtener el total de visitas a la página (page_visits) ---
    useEffect(() => {
        const fetchPageVisits = async () => {
            setLoadingPageVisits(true);
            setErrorPageVisits(null);
            try {
                const visitsSnapshot = await getDocs(collection(db, "page_visits"));
                setTotalPageVisits(visitsSnapshot.size); // El tamaño del snapshot es el total de documentos
            } catch (err) {
                console.error("Error al obtener el total de visitas:", err);
                setErrorPageVisits("Error al cargar el contador de visitas.");
            } finally {
                setLoadingPageVisits(false); // Desactiva la carga de visitas
            }
        };

        fetchPageVisits();
    }, []); // Se ejecuta una vez al montar el componente

    // useEffect para generar los reportes una vez que usoList o periodoFiltro cambian
    useEffect(() => {
        const generarReportes = () => {
            // Reporte: Uso por materia
            const materias = {};
            usoList.forEach(u => {
                if (u.materia) {
                    materias[u.materia] = (materias[u.materia] || 0) + 1;
                }
            });
            const materiasOrdenadas = Object.entries(materias)
                .sort(([, a], [, b]) => b - a)
                .map(([materia, cantidad]) => ({ materia, cantidad }));
            setUsoPorMateria(materiasOrdenadas);

            // Reporte: Uso por profesor
            const profesores = {};
            usoList.forEach(u => {
                if (u.profesor) {
                    profesores[u.profesor] = (profesores[u.profesor] || 0) + 1;
                }
            });
            const profesoresOrdenados = Object.entries(profesores)
                .sort(([, a], [, b]) => b - a)
                .map(([profesor, cantidad]) => ({ profesor, cantidad }));
            setUsoPorProfesor(profesoresOrdenados);

            // Reporte: Uso por turno
            const turnos = {};
            usoList.forEach(u => {
                if (u.turno) {
                    turnos[u.turno] = (turnos[u.turno] || 0) + 1;
                }
            });
            const turnosOrdenados = Object.entries(turnos)
                .sort(([, a], [, b]) => b - a)
                .map(([turno, cantidad]) => ({ turno, cantidad }));
            setUsoPorTurno(turnosOrdenados);

            // Reporte: Uso por período
            let usoAgrupado = {};
            const hoy = moment();
            usoList.forEach(u => {
                // Asegúrate de que 'horaEntrada' es un campo que existe en tus documentos 'usoBiblioteca'
                // y que está en un formato que moment pueda parsear.
                const fechaEntrada = moment(u.horaEntrada); 
                let periodo;

                if (periodoFiltro === 'diario') {
                    if (fechaEntrada.isSame(hoy, 'day')) {
                        periodo = 'Hoy';
                    } else if (fechaEntrada.isSame(hoy.clone().subtract(1, 'day'), 'day')) {
                        periodo = 'Ayer';
                    } else {
                        periodo = fechaEntrada.format('LL'); // Formato largo de fecha (ej. "20 de agosto de 2025")
                    }
                } else if (periodoFiltro === 'semanal') {
                    // Obtiene el inicio de la semana y el fin de la semana para el período
                    periodo = `Semana del ${fechaEntrada.clone().startOf('week').format('D [de] MMM')} al ${fechaEntrada.clone().endOf('week').format('D [de] MMM')}`;
                } else if (periodoFiltro === 'mensual') {
                    periodo = fechaEntrada.format('MMMM YYYY'); // Formato "Mes Año" (ej. "agosto 2025")
                }
                
                usoAgrupado[periodo] = (usoAgrupado[periodo] || 0) + 1;
            });
            setUsoPorPeriodo(usoAgrupado);
        };

        if (usoList.length > 0) {
            generarReportes();
        } else if (!loading) { // Si ya terminó de cargar y usoList está vacío, igual generar reportes vacíos
            generarReportes();
        }
    }, [usoList, periodoFiltro, loading]); // Añadido 'loading' a las dependencias para asegurar que se re-genere si usoList inicialmente vacío

    // Muestra un spinner si cualquier dato principal está cargando
    if (loading || loadingPageVisits) { // Combina el estado de carga
        return (
            <Container className="text-center my-5">
                <Spinner animation="border" />
                <p className="mt-3">Cargando reportes de la biblioteca...</p>
            </Container>
        );
    }

    // Muestra una alerta de error si hay un error principal
    if (error) {
        return <Alert variant="danger" className="my-5">{error}</Alert>;
    }

    return (
        <Container className="my-5">
            <h2 className="text-center mb-4">Reporte de Uso de la Biblioteca</h2>

            {/* Nueva Fila para la Tarjeta de Visitas a la Página */}
            <Row className="mb-4 justify-content-center">
                <Col md={6}> {/* Usamos md={6} para que ocupe la mitad del ancho en pantallas medianas */}
                    <Card className="text-center shadow-sm h-100">
                        <Card.Header as="h5" className="bg-info text-white">
                            Total de Visitas a la Página
                        </Card.Header>
                        <Card.Body className="d-flex flex-column justify-content-center align-items-center">
                            {errorPageVisits ? (
                                <Alert variant="danger" className="w-100">{errorPageVisits}</Alert>
                            ) : (
                                <>
                                    <Card.Title className="display-4 text-info">{totalPageVisits}</Card.Title>
                                    <Card.Text>Total de veces que los usuarios han visitado la aplicación.</Card.Text>
                                </>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Fila para los reportes de uso de la biblioteca (materias, profesor, turno) */}
            <Row>
                <Col lg={4} className="mb-4">
                    <Card>
                        <Card.Header as="h5">Uso por Materia</Card.Header>
                        <Card.Body>
                            <p>Cantidad de veces que la biblioteca fue usada por materia.</p>
                            {usoPorMateria.length > 0 ? (
                                <Table striped bordered hover responsive>
                                    <thead>
                                        <tr><th>Materia</th><th>Cantidad</th></tr>
                                    </thead>
                                    <tbody>
                                        {usoPorMateria.map((item, index) => (
                                            <tr key={index}>
                                                <td>{item.materia}</td>
                                                <td>{item.cantidad}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            ) : (
                                <Alert variant="info" className="text-center">
                                    No hay registros de uso por materia.
                                </Alert>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={4} className="mb-4">
                    <Card>
                        <Card.Header as="h5">Uso por Profesor</Card.Header>
                        <Card.Body>
                            <p>Cantidad de veces que la biblioteca fue usada por profesor.</p>
                            {usoPorProfesor.length > 0 ? (
                                <Table striped bordered hover responsive>
                                    <thead>
                                        <tr><th>Profesor</th><th>Cantidad</th></tr>
                                    </thead>
                                    <tbody>
                                        {usoPorProfesor.map((item, index) => (
                                            <tr key={index}>
                                                <td>{item.profesor}</td>
                                                <td>{item.cantidad}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            ) : (
                                <Alert variant="info" className="text-center">
                                    No hay registros de uso por profesor.
                                </Alert>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={4} className="mb-4">
                    <Card>
                        <Card.Header as="h5">Uso por Turno</Card.Header>
                        <Card.Body>
                            <p>Cantidad de veces que la biblioteca fue usada por turno.</p>
                            {usoPorTurno.length > 0 ? (
                                <Table striped bordered hover responsive>
                                    <thead>
                                        <tr><th>Turno</th><th>Cantidad</th></tr>
                                    </thead>
                                    <tbody>
                                        {usoPorTurno.map((item, index) => (
                                            <tr key={index}>
                                                <td>{item.turno}</td>
                                                <td>{item.cantidad}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            ) : (
                                <Alert variant="info" className="text-center">
                                    No hay registros de uso por turno.
                                </Alert>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Fila para el reporte de uso por período */}
            <Row>
                <Col>
                    <Card>
                        <Card.Header as="h5">Uso por Período</Card.Header>
                        <Card.Body>
                            <Form.Group className="mb-3">
                                <Form.Label>Seleccionar período</Form.Label>
                                <Form.Select value={periodoFiltro} onChange={(e) => setPeriodoFiltro(e.target.value)}>
                                    <option value="diario">Diario</option>
                                    <option value="semanal">Semanal</option>
                                    <option value="mensual">Mensual</option>
                                </Form.Select>
                            </Form.Group>
                            {Object.keys(usoPorPeriodo).length > 0 ? (
                                <Table striped bordered hover responsive>
                                    <thead>
                                        <tr>
                                            <th>Período</th>
                                            <th>Cantidad de Usos</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.entries(usoPorPeriodo).map(([periodo, cantidad]) => (
                                            <tr key={periodo}>
                                                <td>{periodo}</td>
                                                <td>{cantidad}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            ) : (
                                <Alert variant="info" className="text-center">
                                    No hay registros de uso para este período.
                                </Alert>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default ReporteUsoBiblioteca;