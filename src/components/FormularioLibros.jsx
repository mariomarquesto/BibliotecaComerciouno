import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert, Table, Spinner, Modal } from 'react-bootstrap';
// Importamos funciones de Firebase necesarias
import { db, collection, addDoc, onSnapshot, doc, deleteDoc, updateDoc } from '../firebase/firebaseConfig';

function FormularioLibros() {
  const [datosLibro, setDatosLibro] = useState({
    titulo: '',
    estante: '',
    fila: '',
    cantidad: 0,
  });
  const [mensaje, setMensaje] = useState(null);
  const [varianteMensaje, setVarianteMensaje] = useState('success');

  const [librosList, setLibrosList] = useState([]);
  const [loadingLibros, setLoadingLibros] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para la edición
  const [editingBookId, setEditingBookId] = useState(null); // ID del libro que se está editando
  // 'editingBookData' ha sido removido porque no se estaba usando.

  // Estados para el modal de confirmación de eliminación
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [bookToDeleteId, setBookToDeleteId] = useState(null);
  const [bookToDeleteTitle, setBookToDeleteTitle] = useState('');

  // Efecto para escuchar los cambios en la colección 'libros' en tiempo real
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "libros"), (snapshot) => {
      const libros = [];
      snapshot.forEach((doc) => {
        libros.push({ id: doc.id, ...doc.data() });
      });
      setLibrosList(libros);
      setLoadingLibros(false);
    }, (error) => {
      console.error("Error al obtener libros en tiempo real:", error);
      setMensaje('Error al cargar la lista de libros.');
      setVarianteMensaje('danger');
      setLoadingLibros(false);
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDatosLibro((prevDatos) => ({
      ...prevDatos,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje(null);

    try {
      if (editingBookId) {
        // Modo edición: Actualizar libro existente
        const bookRef = doc(db, "libros", editingBookId);
        await updateDoc(bookRef, {
          titulo: datosLibro.titulo,
          estante: parseInt(datosLibro.estante),
          fila: parseInt(datosLibro.fila),
          cantidad: parseInt(datosLibro.cantidad),
          fechaActualizacion: new Date() // Opcional: fecha de última actualización
        });
        setMensaje(`Libro "${datosLibro.titulo}" actualizado con éxito.`);
      } else {
        // Modo agregar: Añadir nuevo libro
        const docRef = await addDoc(collection(db, "libros"), {
          titulo: datosLibro.titulo,
          estante: parseInt(datosLibro.estante),
          fila: parseInt(datosLibro.fila),
          cantidad: parseInt(datosLibro.cantidad),
          fechaRegistro: new Date()
        });
        setMensaje(`Libro "${datosLibro.titulo}" guardado con éxito. ID: ${docRef.id}`);
      }
      setVarianteMensaje('success');
      
      // Limpiar formulario y salir de modo edición
      setDatosLibro({
        titulo: '',
        estante: '',
        fila: '',
        cantidad: 0,
      });
      setEditingBookId(null);
      // setEditingBookData(null); // Esto ya no es necesario
    } catch (e) {
      console.error("Error al procesar el libro: ", e);
      setMensaje(`Error al guardar/actualizar el libro: ${e.message}`);
      setVarianteMensaje('danger');
    }
  };

  // --- Funciones para Editar ---
  const handleEdit = (libro) => {
    setEditingBookId(libro.id);
    // setEditingBookData(libro); // Esto ya no es necesario
    setDatosLibro({
      titulo: libro.titulo,
      estante: String(libro.estante), // Convertir a string para el <select>
      fila: String(libro.fila),       // Convertir a string para el <select>
      cantidad: libro.cantidad,
    });
    setMensaje(null); // Limpiar cualquier mensaje anterior
    setVarianteMensaje('success');
  };

  const handleCancelEdit = () => {
    setEditingBookId(null);
    // setEditingBookData(null); // Esto ya no es necesario
    setDatosLibro({
      titulo: '',
      estante: '',
      fila: '',
      cantidad: 0,
    });
    setMensaje(null);
  };

  // --- Funciones para Eliminar ---
  const confirmDelete = (bookId, bookTitle) => {
    setBookToDeleteId(bookId);
    setBookToDeleteTitle(bookTitle);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    setShowDeleteConfirm(false); // Cierra el modal de confirmación
    setMensaje(null);

    try {
      await deleteDoc(doc(db, "libros", bookToDeleteId));
      setMensaje(`Libro "${bookToDeleteTitle}" eliminado con éxito.`);
      setVarianteMensaje('success');
    } catch (e) {
      console.error("Error al eliminar documento: ", e);
      setMensaje(`Error al eliminar el libro: ${e.message}`);
      setVarianteMensaje('danger');
    } finally {
      setBookToDeleteId(null);
      setBookToDeleteTitle('');
    }
  };

  // Función para filtrar los libros por el término de búsqueda (insensible a mayúsculas/minúsculas)
  const filteredLibros = librosList.filter(libro =>
    libro.titulo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container className="my-5">
      <h2 className="text-center mb-4">{editingBookId ? 'Editar Libro Existente' : 'Ingresar Nuevo Libro'}</h2>

      {mensaje && <Alert variant={varianteMensaje}>{mensaje}</Alert>} 

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label className='titulo-libro'>Título del Libro</Form.Label>
          <Form.Control
            type="text"
            name="titulo"
            value={datosLibro.titulo}
            onChange={handleChange}
            placeholder="Nobre, Autor y Editorial"
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Estante</Form.Label>
          <Form.Select name="estante" value={datosLibro.estante} onChange={handleChange} required>
            <option value="">Selecciona un estante</option>
            {Array.from({ length: 28 }, (_, i) => (
              <option key={i + 1} value={String(i + 1)}> {/* Asegúrate de que el value sea string */}
                Estante {i + 1}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Fila</Form.Label>
          <Form.Select name="fila" value={datosLibro.fila} onChange={handleChange} required>
            <option value="">Selecciona una fila</option>
            {Array.from({ length: 6 }, (_, i) => (
              <option key={i + 1} value={String(i + 1)}> {/* Asegúrate de que el value sea string */}
                Fila {i + 1}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Cantidad</Form.Label>
          <Form.Control
            type="number"
            name="cantidad"
            value={datosLibro.cantidad}
            onChange={handleChange}
            placeholder="0"
            min="0"
            required
          />
        </Form.Group>

        <div className="d-flex justify-content-between">
            <Button variant="primary" type="submit">
                {editingBookId ? 'Actualizar Libro' : 'Guardar Libro'}
            </Button>
            {editingBookId && (
                <Button variant="secondary" onClick={handleCancelEdit}>
                    Cancelar Edición
                </Button>
            )}
        </div>
      </Form>

      <hr className="my-5" />

      <h3 className="text-center mb-4">Inventario de Libros</h3>
      <Form.Group className="mb-4">
        <Form.Control
          type="text"
          placeholder="Buscar libro por título..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Form.Group>

      {loadingLibros ? (
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Cargando libros...</span>
          </Spinner>
          <p className="mt-2">Cargando libros desde la base de datos...</p>
        </div>
      ) : (
        filteredLibros.length === 0 ? (
          <Alert variant="info" className="text-center">
            {searchTerm ? `No se encontraron libros que contengan "${searchTerm}".` : "No hay libros registrados en la base de datos. ¡Ingresa uno nuevo!"}
          </Alert>
        ) : (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Título</th>
                <th>Estante</th>
                <th>Fila</th>
                <th>Cantidad</th>
                <th>Fecha de Registro</th>
                <th>Acciones</th> {/* Nueva columna para los botones */}
              </tr>
            </thead>
            <tbody>
              {filteredLibros.map((libro) => (
                <tr key={libro.id}>
                  <td>{libro.titulo}</td>
                  <td>{libro.estante}</td>
                  <td>{libro.fila}</td>
                  <td>{libro.cantidad}</td>
                  <td>{libro.fechaRegistro ? new Date(libro.fechaRegistro.seconds * 1000).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    <Button 
                        variant="warning" 
                        size="sm" 
                        className="me-2" 
                        onClick={() => handleEdit(libro)} // Función para editar
                    >
                        Editar
                    </Button>
                    <Button 
                        variant="danger" 
                        size="sm" 
                        onClick={() => confirmDelete(libro.id, libro.titulo)} // Abre el modal de confirmación
                    >
                        Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )
      )}

      {/* Modal de Confirmación de Eliminación */}
      <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro de que quieres eliminar el libro **"{bookToDeleteTitle}"**? Esta acción no se puede deshacer.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default FormularioLibros;
