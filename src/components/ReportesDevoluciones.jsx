import React, { useState, useEffect } from 'react';
import { Container, Spinner, Alert, Card, ListGroup, Table, Form, Row, Col, Badge } from 'react-bootstrap';
import { db, collection, onSnapshot } from '../firebase/firebaseConfig';
import moment from 'moment';
import 'moment/locale/es';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

moment.locale('es');

function ReportesDevoluciones() {
    const [prestamosList, setPrestamosList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [usoPorMateria, setUsoPorMateria] = useState([]);
    const [usoPorProfesor, setUsoPorProfesor] = useState([]);
    const [usoPorAlumno, setUsoPorAlumno] = useState([]);
    const [prestamosPorPeriodo, setPrestamosPorPeriodo] = useState({});

    const [periodoFiltro, setPeriodoFiltro] = useState('diario');

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "prestamos"), (snapshot) => {
            const prestamos = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setPrestamosList(prestamos);
            setLoading(false);
        }, (err) => {
            console.error("Error al obtener los préstamos:", err);
            setError("Error al cargar los datos de préstamos.");
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const generarReportes = () => {
            const prestamosProfesores = prestamosList.filter(p => p.tipoUsuario === 'profesor');
            const prestamosAlumnos = prestamosList.filter(p => p.tipoUsuario === 'alumno');

            // Reporte: Uso por materia
            const materias = {};
            prestamosProfesores.forEach(p => {
                if (p.materia) {
                    materias[p.materia] = (materias[p.materia] || 0) + 1;
                }
            });
            const materiasOrdenadas = Object.entries(materias)
                .sort(([, a], [, b]) => b - a)
                .map(([materia, cantidad]) => ({ materia, cantidad }));
            setUsoPorMateria(materiasOrdenadas);

            // Reporte: Uso por profesor
            const profesores = {};
            prestamosProfesores.forEach(p => {
                const nombreCompleto = `${p.nombre} ${p.apellido}`;
                profesores[nombreCompleto] = (profesores[nombreCompleto] || 0) + 1;
            });
            const profesoresOrdenados = Object.entries(profesores)
                .sort(([, a], [, b]) => b - a)
                .map(([nombre, cantidad]) => ({ nombre, cantidad }));
            setUsoPorProfesor(profesoresOrdenados);

            // Reporte: Uso por alumno
            const alumnos = {};
            prestamosAlumnos.forEach(p => {
                const nombreCompleto = `${p.nombre} ${p.apellido}`;
                alumnos[nombreCompleto] = (alumnos[nombreCompleto] || 0) + 1;
            });
            const alumnosOrdenados = Object.entries(alumnos)
                .sort(([, a], [, b]) => b - a)
                .map(([nombre, cantidad]) => ({ nombre, cantidad }));
            setUsoPorAlumno(alumnosOrdenados);

            // Reporte: Libros prestados por período
            let prestamosAgrupados = {};
            const hoy = moment();
            prestamosList.forEach(p => {
                const fechaPrestamo = moment(p.fechaPrestamo.toDate());
                let periodo;

                if (periodoFiltro === 'diario') {
                    if (fechaPrestamo.isSame(hoy, 'day')) {
                        periodo = 'Hoy';
                    } else if (fechaPrestamo.isSame(hoy.clone().subtract(1, 'day'), 'day')) {
                        periodo = 'Ayer';
                    } else {
                        periodo = fechaPrestamo.format('LL');
                    }
                } else if (periodoFiltro === 'semanal') {
                    periodo = `Semana del ${fechaPrestamo.startOf('week').format('D [de] MMM')} al ${fechaPrestamo.endOf('week').format('D [de] MMM')}`;
                } else if (periodoFiltro === 'mensual') {
                    periodo = fechaPrestamo.format('MMMM YYYY');
                }

                prestamosAgrupados[periodo] = (prestamosAgrupados[periodo] || 0) + 1;
            });
            setPrestamosPorPeriodo(prestamosAgrupados);
        };

        if (prestamosList.length > 0) {
            generarReportes();
        }
    }, [prestamosList, periodoFiltro]);

    if (loading) {
        return (
            <Container className="text-center my-5">
                <Spinner animation="border" />
                <p className="mt-3">Cargando datos de reportes...</p>
            </Container>
        );
    }

    if (error) {
        return <Alert variant="danger" className="my-5">{error}</Alert>;
    }

    return (
        <Container className="my-5">
            <h2 className="text-center mb-4 ">Reportes de la Biblioteca</h2>

            <Row>
                <Col lg={12} className="mb-4">
                    <Card>
                        <Card.Header as="h5">Uso por Materia</Card.Header>
                        <Card.Body>
                            <p>Préstamos por materia (histórico).</p>
                            {usoPorMateria.length > 0 ? (
                                <ListGroup variant="flush">
                                    {usoPorMateria.map((item, index) => (
                                        <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                                            {item.materia}
                                            <Badge bg="primary" pill>{item.cantidad}</Badge>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            ) : (
                                <Alert variant="info" className="text-center">
                                    No hay préstamos de profesores registrados.
                                </Alert>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={12} className="mb-4">
                    <Card>
                        <Card.Header as="h5">Uso por Profesor</Card.Header>
                        <Card.Body>
                            <p>Préstamos por profesor (histórico).</p>
                            {usoPorProfesor.length > 0 ? (
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={usoPorProfesor} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="nombre" angle={-45} textAnchor="end" height={80} interval={0} />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="cantidad" fill="#8884d8" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <Alert variant="info" className="text-center">
                                    No hay préstamos de profesores registrados.
                                </Alert>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row>
                <Col lg={12} className="mb-4">
                    <Card>
                        <Card.Header as="h5">Uso por Alumno</Card.Header>
                        <Card.Body>
                            <p>Préstamos por Alumno (histórico).</p>
                            {usoPorAlumno.length > 0 ? (
                                <ListGroup variant="flush">
                                    {usoPorAlumno.map((item, index) => (
                                        <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                                            {item.nombre}
                                            <Badge bg="primary" pill>{item.cantidad}</Badge>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            ) : (
                                <Alert variant="info" className="text-center">
                                    No hay préstamos de alumnos registrados.
                                </Alert>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={12} className="mb-4">
                    <Card>
                        <Card.Header as="h5">Libros Prestados</Card.Header>
                        <Card.Body>
                            <Form.Group className="mb-3">
                                <Form.Label>Seleccionar período</Form.Label>
                                <Form.Select value={periodoFiltro} onChange={(e) => setPeriodoFiltro(e.target.value)}>
                                    <option value="diario">Diario</option>
                                    <option value="semanal">Semanal</option>
                                    <option value="mensual">Mensual</option>
                                </Form.Select>
                            </Form.Group>
                            {Object.keys(prestamosPorPeriodo).length > 0 ? (
                                <Table striped bordered hover responsive>
                                    <thead>
                                        <tr>
                                            <th>Período</th>
                                            <th>Cantidad de Libros</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.entries(prestamosPorPeriodo).map(([periodo, cantidad]) => (
                                            <tr key={periodo}>
                                                <td>{periodo}</td>
                                                <td>{cantidad}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            ) : (
                                <Alert variant="info" className="text-center">
                                    No hay préstamos registrados para este período.
                                </Alert>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default ReportesDevoluciones;