import React, { useState } from 'react';
import { Container, Form, Button, Alert, Card, Row, Col } from 'react-bootstrap';
import { db, collection, addDoc } from '../firebase/firebaseConfig';
import moment from 'moment';

function FormularioUsoBiblioteca() {
    const [nombreEvento, setNombreEvento] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [fecha, setFecha] = useState('');
    const [horaInicio, setHoraInicio] = useState('');
    const [horaFin, setHoraFin] = useState('');
    const [materia, setMateria] = useState('');
    const [profesor, setProfesor] = useState('');
    const [turno, setTurno] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [variante, setVariante] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensaje('');
        setVariante('');

        if (!nombreEvento || !fecha || !horaInicio || !horaFin) {
            setMensaje("Por favor, complete todos los campos obligatorios.");
            setVariante('danger');
            return;
        }

        const nuevoUso = {
            nombreEvento,
            descripcion,
            fecha,
            horaInicio,
            horaFin,
            materia,
            profesor,
            turno,
            timestamp: moment().format(),
            horaEntrada: moment(`${fecha} ${horaInicio}`).format(),
            horaSalida: moment(`${fecha} ${horaFin}`).format(),
        };

        try {
            await addDoc(collection(db, "usoBiblioteca"), nuevoUso);
            setMensaje('Evento registrado con éxito.');
            setVariante('success');
            setNombreEvento('');
            setDescripcion('');
            setFecha('');
            setHoraInicio('');
            setHoraFin('');
            setMateria('');
            setProfesor('');
            setTurno('');
        } catch (error) {
            console.error("Error al registrar el evento: ", error);
            setMensaje('Error al registrar el evento. Intente de nuevo.');
            setVariante('danger');
        }
    };

    return (
        <Container className="my-5">
            <h2 className="text-center mb-4">Registrar Uso de la Biblioteca</h2>
            <Card className="p-4 shadow">
                {mensaje && <Alert variant={variante}>{mensaje}</Alert>}
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Nombre del Evento</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Ej: Reunión de Padres, Taller de Lectura"
                            value={nombreEvento}
                            onChange={(e) => setNombreEvento(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Descripción (Opcional)</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Detalles sobre el evento..."
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                        />
                    </Form.Group>
                    <Row>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Materia</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Ej: Matemáticas, Historia"
                                    value={materia}
                                    onChange={(e) => setMateria(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Profesor</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Ej: Juan Pérez"
                                    value={profesor}
                                    onChange={(e) => setProfesor(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Turno</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Ej: Matutino, Vespertino"
                                    value={turno}
                                    onChange={(e) => setTurno(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Form.Group className="mb-3">
                        <Form.Label>Fecha</Form.Label>
                        <Form.Control
                            type="date"
                            value={fecha}
                            onChange={(e) => setFecha(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Row>
                        <Col>
                            <Form.Group className="mb-3">
                                <Form.Label>Hora de Inicio</Form.Label>
                                <Form.Control
                                    type="time"
                                    value={horaInicio}
                                    onChange={(e) => setHoraInicio(e.target.value)}
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group className="mb-3">
                                <Form.Label>Hora de Fin</Form.Label>
                                <Form.Control
                                    type="time"
                                    value={horaFin}
                                    onChange={(e) => setHoraFin(e.target.value)}
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Button variant="primary" type="submit" className="w-100 mt-3">
                        Registrar Evento
                    </Button>
                </Form>
            </Card>
        </Container>
    );
}

export default FormularioUsoBiblioteca;