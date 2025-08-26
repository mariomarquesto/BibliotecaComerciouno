import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Spinner,
  Alert,
  ListGroup,
  Row,
  Col,
} from "react-bootstrap";
import { db } from "../firebase/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

// Importamos Recharts
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

function Reportes() {
  const [totalLibros, setTotalLibros] = useState(0);
  const [librosPorEstante, setLibrosPorEstante] = useState({});
  const [librosPorFila, setLibrosPorFila] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Colores para gráficos
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#A28BFF",
    "#FF6699",
    "#33CCFF",
    "#66FF66",
    "#FF9933",
  ];

  useEffect(() => {
    const fetchReportsData = async () => {
      setLoading(true);
      setError(null);
      try {
        const querySnapshot = await getDocs(collection(db, "libros"));
        let count = 0;
        const estantesCount = {};
        const filasCount = {};

        querySnapshot.forEach((doc) => {
          const libro = doc.data();
          const cantidad = libro.cantidad || 0;
          const estante = parseInt(libro.estante) || null;
          const fila = parseInt(libro.fila) || null;

          count += cantidad;

          if (estante !== null) {
            estantesCount[estante] = (estantesCount[estante] || 0) + cantidad;
          }

          if (estante !== null && fila !== null) {
            const key = `Estante ${estante}, Fila ${fila}`;
            filasCount[key] = (filasCount[key] || 0) + cantidad;
          }
        });

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
  }, []);

  // Transformar objetos en arrays para Recharts
  const dataEstantes = Object.keys(librosPorEstante).map((estante) => ({
    estante: `Estante ${estante}`,
    cantidad: librosPorEstante[estante],
  }));

  const dataFilas = Object.keys(librosPorFila).map((key) => ({
    name: key,
    value: librosPorFila[key],
  }));

  return (
    <Container className="my-5">
      <h2 className="text-center mb-4">Reportes de la Biblioteca</h2>

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" role="status" />
          <p className="mt-2">Generando reportes de la base de datos...</p>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <Row>
          {/* Total de Libros */}
          <Col md={6} className="mb-4">
            <Card className="text-center shadow-sm">
              <Card.Header as="h5">Total de Libros en Inventario</Card.Header>
              <Card.Body>
                <Card.Title className="display-4 text-primary">
                  {totalLibros}
                </Card.Title>
                <Card.Text>
                  Cantidad total de ejemplares disponibles en la biblioteca.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          {/* Libros por Estante */}
          <Col md={6} className="mb-4">
            <Card className="shadow-sm">
              <Card.Header as="h5">Libros por Estante</Card.Header>
              <ListGroup variant="flush">
                {Object.keys(librosPorEstante)
                  .sort((a, b) => a - b)
                  .map((estante) => (
                    <ListGroup.Item
                      key={estante}
                      className="d-flex justify-content-between align-items-center"
                    >
                      Estante {estante}
                      <span className="badge bg-secondary rounded-pill">
                        {librosPorEstante[estante]} libros
                      </span>
                    </ListGroup.Item>
                  ))}
                {Object.keys(librosPorEstante).length === 0 && (
                  <ListGroup.Item className="text-center text-muted">
                    No hay libros registrados en estantes.
                  </ListGroup.Item>
                )}
              </ListGroup>
            </Card>
          </Col>

          {/* Gráfico de barras */}
          <Col md={12} className="mb-4">
            <Card className="shadow-sm p-3">
              <h5 className="text-center mb-3">Distribución por Estantes</h5>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dataEstantes}>
                  <XAxis dataKey="estante" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="cantidad" fill="#007BFF" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          {/* Libros por Estante y Fila */}
          <Col md={12} className="mb-4">
            <Card className="shadow-sm">
              <Card.Header as="h5">Libros por Estante y Fila</Card.Header>
              <ListGroup variant="flush">
                {Object.keys(librosPorFila)
                  .sort((a, b) => {
                    const [estanteA, filaA] = a
                      .replace("Estante ", "")
                      .split(", Fila ")
                      .map(Number);
                    const [estanteB, filaB] = b
                      .replace("Estante ", "")
                      .split(", Fila ")
                      .map(Number);
                    return estanteA !== estanteB
                      ? estanteA - estanteB
                      : filaA - filaB;
                  })
                  .map((key) => (
                    <ListGroup.Item
                      key={key}
                      className="d-flex justify-content-between align-items-center"
                    >
                      {key}
                      <span className="badge bg-secondary rounded-pill">
                        {librosPorFila[key]} libros
                      </span>
                    </ListGroup.Item>
                  ))}
                {Object.keys(librosPorFila).length === 0 && (
                  <ListGroup.Item className="text-center text-muted">
                    No hay libros registrados con estante y fila.
                  </ListGroup.Item>
                )}
              </ListGroup>
            </Card>
          </Col>

          {/* Gráfico Pie */}
          <Col md={12} className="mb-4">
            <Card className="shadow-sm p-3">
              <h5 className="text-center mb-3">Distribución por Estante y Fila</h5>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={dataFilas}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    dataKey="value"
                    label={false}
                  >
                    {dataFilas.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend layout="horizontal" align="center" verticalAlign="bottom" />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
}

export default Reportes;
