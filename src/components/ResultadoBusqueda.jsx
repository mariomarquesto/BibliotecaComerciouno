import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Table, Alert, Spinner } from 'react-bootstrap'; // Importa Spinner para loading
import { db, collection, query, where, getDocs } from '../firebase/firebaseConfig';

function ResultadoBusqueda() {
  const location = useLocation();
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');

  // Obtener el término de búsqueda de la URL
  const searchTerm = new URLSearchParams(location.search).get('query');

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      setError(null);
      setMessage('');
      setSearchResults([]); // Limpia resultados anteriores

      if (!searchTerm) {
        setMessage('Por favor, ingresa un término de búsqueda.');
        setLoading(false);
        return;
      }

      try {
        // Convierte el término de búsqueda a minúsculas para una búsqueda insensible a mayúsculas/minúsculas
        // Nota: Firestore no soporta búsquedas de subcadenas completas o regex directamente.
        // Para una búsqueda parcial avanzada, necesitarías un servicio de búsqueda como Algolia o ElasticSearch,
        // o precargar los títulos y filtrarlos en el cliente (no recomendado para grandes datasets).
        // Por ahora, buscaremos títulos que *comienzan con* el término o coincidencia exacta.
        // Si necesitas una búsqueda "contiene", es más complejo con Firestore directo.
        
        // Búsqueda por coincidencia exacta (o sensible a mayúsculas/minúsculas)
        const q = query(collection(db, "libros"), where("titulo", "==", searchTerm));
        
        // Opcional: Para una búsqueda que 'empieza con', es un poco más avanzado en Firestore
        // const q = query(collection(db, "libros"),
        //   where("titulo", ">=", searchTerm),
        //   where("titulo", "<=", searchTerm + '\uf8ff')
        // );

        const querySnapshot = await getDocs(q);
        const books = [];
        querySnapshot.forEach((doc) => {
          books.push({ id: doc.id, ...doc.data() });
        });

        setSearchResults(books);
        if (books.length === 0) {
          setMessage(`No se encontraron libros con el título "${searchTerm}".`);
        }

      } catch (err) {
        console.error("Error al buscar libros:", err);
        setError("Hubo un error al buscar los libros. Intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [searchTerm]); // Vuelve a ejecutar la búsqueda si el término cambia

  return (
    <Container className="my-5">
      <h2 className="text-center mb-4">Resultados de Búsqueda para: "{searchTerm}"</h2>

      {loading && (
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </Spinner>
          <p className="mt-2">Buscando libros...</p>
        </div>
      )}

      {error && <Alert variant="danger">{error}</Alert>}
      {message && !loading && <Alert variant="info">{message}</Alert>}

      {!loading && searchResults.length > 0 && (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Título</th>
              <th>Estante</th>
              <th>Fila</th>
              <th>Cantidad</th>
            </tr>
          </thead>
          <tbody>
            {searchResults.map((book) => (
              <tr key={book.id}>
                <td>{book.titulo}</td>
                <td>{book.estante}</td>
                <td>{book.fila}</td>
                <td>{book.cantidad}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {!loading && !error && searchResults.length === 0 && !message && searchTerm && (
         <Alert variant="info">No se encontraron libros para "{searchTerm}".</Alert>
      )}
    </Container>
  );
}

export default ResultadoBusqueda;