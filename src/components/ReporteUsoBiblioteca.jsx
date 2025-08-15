import React, { useState, useEffect } from 'react';
import { Container, Spinner, Alert, Card, Table, Form, Row, Col } from 'react-bootstrap';
import { db, collection, onSnapshot } from '../firebase/firebaseConfig';
import moment from 'moment';
import 'moment/locale/es';
import './ReportesBiblioteca.css';

moment.locale('es');





function ReporteUsoBiblioteca() {
    const [usoList, setUsoList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [usoPorMateria, setUsoPorMateria] = useState([]);
    const [usoPorProfesor, setUsoPorProfesor] = useState([]);
    const [usoPorTurno, setUsoPorTurno] = useState([]);
    const [usoPorPeriodo, setUsoPorPeriodo] = useState({});

    const [periodoFiltro, setPeriodoFiltro] = useState('diario');

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "usoBiblioteca"), (snapshot) => {
            const uso = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setUsoList(uso);
            setLoading(false);
        }, (err) => {
            console.error("Error al obtener los datos de uso de la biblioteca:", err);
            setError("Error al cargar los datos de uso de la biblioteca.");
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

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
                const fechaEntrada = moment(u.horaEntrada);
                let periodo;

                if (periodoFiltro === 'diario') {
                    if (fechaEntrada.isSame(hoy, 'day')) {
                        periodo = 'Hoy';
                    } else if (fechaEntrada.isSame(hoy.clone().subtract(1, 'day'), 'day')) {
                        periodo = 'Ayer';
                    } else {
                        periodo = fechaEntrada.format('LL');
                    }
                } else if (periodoFiltro === 'semanal') {
                    periodo = `Semana del ${fechaEntrada.startOf('week').format('D [de] MMM')} al ${fechaEntrada.endOf('week').format('D [de] MMM')}`;
                } else if (periodoFiltro === 'mensual') {
                    periodo = fechaEntrada.format('MMMM YYYY');
                }
                
                usoAgrupado[periodo] = (usoAgrupado[periodo] || 0) + 1;
            });
            setUsoPorPeriodo(usoAgrupado);
        };

        if (usoList.length > 0) {
            generarReportes();
        }
    }, [usoList, periodoFiltro]);

    if (loading) {
        return (
            <Container className="text-center my-5">
                <Spinner animation="border" />
                <p className="mt-3">Cargando datos de uso de la biblioteca...</p>
            </Container>
        );
    }

    if (error) {
        return <Alert variant="danger" className="my-5">{error}</Alert>;
    }

    return (
        <Container className="my-5">
            <h2 className="text-center mb-4  " >Reporte de Uso de la Biblioteca</h2>

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