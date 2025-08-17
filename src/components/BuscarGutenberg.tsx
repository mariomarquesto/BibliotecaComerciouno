import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Row, Col, Alert, Spinner, Card } from 'react-bootstrap';

// Define una interfaz para la estructura de un libro de Gutenberg desde Gutendex API
interface GutenbergBook {
  id: number;
  title: string;
  authors: { name: string; birth_year: number; death_year: number; }[];
  languages: string[];
  formats: { [key: string]: string }; // Los formatos incluyen URLs a diferentes versiones (incluyendo imágenes y PDF)
}

function BuscarGutenberg() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [language, setLanguage] = useState<string>('es');
  const [category, setCategory] = useState<string>('');
  const [results, setResults] = useState<GutenbergBook[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');

  // Opciones de categoría mapeadas a 'topic' de Gutendex (más flexibles y extensas)
  const categoryOptions = [
    { label: "Cualquier Categoría", value: "" },
    // Literatura y Ficción
    { label: "Literatura General", value: "Literature" },
    { label: "Ficción", value: "Fiction" },
    { label: "Novela", value: "Novel" },
    { label: "Cuento Corto", value: "Short Stories" },
    { label: "Poesía", value: "Poetry" },
    { label: "Drama y Teatro", value: "Drama" },
    { label: "Clásicos Literarios", value: "Classics" },
    { label: "Aventura", value: "Adventure" },
    { label: "Fantasía", value: "Fantasy" },
    { label: "Ciencia Ficción", value: "Science Fiction" },
    { label: "Misterio y Crimen", value: "Mystery" },
    { label: "Thriller", value: "Thriller" },
    { label: "Horror", value: "Horror" },
    { label: "Romance", value: "Romance" },
    { label: "Humor", value: "Humour" },
    { label: "Fábula y Folklore", value: "Folklore" },
    { label: "Literatura Juvenil", value: "Young Adult Fiction" },
    { label: "Literatura Infantil", value: "Children's Literature" },
    { label: "Ensayo", value: "Essay" },
    { label: "Autobiografía y Biografía", value: "Autobiography Biography" },
    { label: "Cartas y Diarios", value: "Letters Diaries" },
    { label: "Crítica Literaria", value: "Literary Criticism" },
    { label: "Mitología", value: "Mythology" },
    
    // Ciencia y Tecnología
    { label: "Ciencia General", value: "Science" },
    { label: "Astronomía", value: "Astronomy" },
    { label: "Biología", value: "Biology" },
    { label: "Química", value: "Chemistry" },
    { label: "Física", value: "Physics" },
    { label: "Matemáticas", value: "Mathematics" },
    { label: "Ingeniería", value: "Engineering" },
    { label: "Tecnología", value: "Technology" },
    { label: "Medicina y Salud", value: "Medicine Health" },
    { label: "Ecología y Medio Ambiente", value: "Ecology Environment" },
    { label: "Geología", value: "Geology" },
    { label: "Botánica", value: "Botany" },
    { label: "Zoología", value: "Zoology" },
    { label: "Informática", value: "Computer Science" },

    // Historia
    { label: "Historia General", value: "History" },
    { label: "Historia Antigua", value: "Ancient History" },
    { label: "Historia Medieval", value: "Medieval History" },
    { label: "Historia Moderna", value: "Modern History" },
    { label: "Historia Americana", value: "American History" },
    { label: "Historia Europea", value: "European History" },
    { label: "Historia Mundial", value: "World History" },
    { label: "Biografías Históricas", value: "Historical Biography" },
    { label: "Arqueología", value: "Archaeology" },
    { label: "Genealogía", value: "Genealogy" },
    { label: "Guerra y Conflicto", value: "War Conflict" },

    // Filosofía y Religión
    { label: "Filosofía General", value: "Philosophy" },
    { label: "Ética", value: "Ethics" },
    { label: "Lógica", value: "Logic" },
    { label: "Metafísica", value: "Metaphysics" },
    { label: "Estudios Religiosos", value: "Religion" },
    { label: "Cristianismo", value: "Christianity" },
    { label: "Judaísmo", value: "Judaism" },
    { label: "Islam", value: "Islam" },
    { label: "Budismo", value: "Buddhism" },
    { label: "Hinduismo", value: "Hinduism" },
    { label: "Teología", value: "Theology" },
    { label: "Mitología y Espiritualidad", value: "Spirituality" },

    // Ciencias Sociales y Humanidades
    { label: "Sociología", value: "Sociology" },
    { label: "Antropología", value: "Anthropology" },
    { label: "Psicología", value: "Psychology" },
    { label: "Educación", value: "Education" },
    { label: "Política y Gobierno", value: "Politics Government" },
    { label: "Economía", value: "Economics" },
    { label: "Derecho", value: "Law" },
    { label: "Criminología", value: "Criminology" },
    { label: "Geografía", value: "Geography" },
    { label: "Demografía", value: "Demography" },
    { label: "Estudios de Género", value: "Gender Studies" },
    { label: "Lingüística", value: "Linguistics" },
    { label: "Periodismo y Comunicación", value: "Journalism Communication" },
    { label: "Cultura y Sociedad", value: "Culture Society" },

    // Artes y Entretenimiento
    { label: "Arte General", value: "Art" },
    { label: "Arquitectura", value: "Architecture" },
    { label: "Música", value: "Music" },
    { label: "Fotografía", value: "Photography" },
    { label: "Diseño", value: "Design" },
    { label: "Moda", value: "Fashion" },
    { label: "Cine y Medios", value: "Film Media" },
    { label: "Danza", value: "Dance" },

    // Estilo de Vida y Hobbies
    { label: "Cocina y Gastronomía", value: "Cooking" },
    { label: "Jardinería", value: "Gardening" },
    { label: "Deportes", value: "Sports" },
    { label: "Viajes y Exploración", value: "Travel Exploration" },
    { label: "Desarrollo Personal", value: "Self-Improvement" },
    { label: "Manualidades y Hobbies", value: "Hobbies" },
    { label: "Cuidado de Animales", value: "Animal Care" },
    { label: "Nutrición y Dieta", value: "Nutrition Diet" },
    { label: "Fitness y Ejercicio", value: "Fitness Exercise" },
    
    // Referencia y Misceláneos
    { label: "Enciclopedias y Diccionarios", value: "Encyclopedia Dictionary" },
    { label: "Libros de Texto", value: "Textbook" },
    { label: "Guías y Manuales", value: "Guides Manuals" },
    { label: "Colecciones de Obras", value: "Collected Works" },
    { label: "Discursos y Oratoria", value: "Speeches Oratory" },
    { label: "Revistas y Publicaciones Periódicas", value: "Journals Periodicals" },
  ];

  // Función para obtener la URL de la imagen de portada
  const getBookCover = (formats: { [key: string]: string }): string => {
    const imageUrl = formats['image/jpeg'] || formats['image/png'] || formats['image/webp'];
    return imageUrl || 'https://placehold.co/128x192/E0E0E0/505050?text=No+Cover';
  };

  // Función para obtener la mejor opción de descarga o visualización
  const getDownloadOption = (formats: { [key: string]: string }): { url: string, label: string, type: 'download' | 'view' } | null => {
    if (formats['application/pdf']) {
      return { url: formats['application/pdf'], label: 'PDF', type: 'download' };
    }
    if (formats['application/epub+zip']) {
      return { url: formats['application/epub+zip'], label: 'EPUB', type: 'download' };
    }
    const plainTextUrl = Object.keys(formats).find(key => key.startsWith('text/plain') && formats[key]);
    if (plainTextUrl) {
      return { url: formats[plainTextUrl], label: 'Texto', type: 'download' };
    }
    if (formats['text/html']) {
      return { url: formats['text/html'], label: 'HTML', type: 'view' };
    }
    return null;
  };

  // useEffect para cargar libros por defecto al inicio (solo si no hay búsqueda activa)
  useEffect(() => {
    if (!searchTerm.trim() && !category && results.length === 0 && !loading && !error) {
      const fetchDefaultBooks = async () => {
        setLoading(true);
        setError(null);
        setMessage('');
        try {
          const response = await fetch(`https://gutendex.com/books/?sort=popular&languages=es&limit=50`); 
          if (!response.ok) {
            throw new Error(`Error al cargar libros por defecto: ${response.statusText}`);
          }
          const data = await response.json();
          if (data && data.results && data.results.length > 0) {
            setResults(data.results);
          } else {
            setMessage('No se pudieron cargar libros por defecto en español.');
          }
        } catch (err: any) {
          console.error("Error al cargar libros por defecto:", err);
          setError(`Hubo un error al cargar los libros iniciales: ${err.message}.`);
        } finally {
          setLoading(false);
        }
      };
      fetchDefaultBooks();
    }
  }, [searchTerm, language, category, results.length, loading, error]);


  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults([]);
    setMessage('');

    if (!searchTerm.trim() && !language && !category) {
      setMessage('Por favor, ingresa un término de búsqueda, selecciona un idioma o una categoría.');
      setLoading(false);
      return;
    }

    let apiUrl = `https://gutendex.com/books/?`;
    const params: string[] = [];

    if (searchTerm.trim()) {
      params.push(`search=${encodeURIComponent(searchTerm.trim())}`);
    }
    if (language) {
      params.push(`languages=${language}`);
    }
    // Usamos 'topic' para la búsqueda por categoría para mayor flexibilidad
    if (category) {
      params.push(`topic=${encodeURIComponent(category)}`); 
    }

    apiUrl += params.join('&');

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Error en la solicitud: ${response.statusText}`);
      }
      const data = await response.json();
      
      if (data && data.results && data.results.length > 0) {
        setResults(data.results);
        setMessage('');
      } else {
        setMessage(`No se encontraron resultados para tu búsqueda: "${searchTerm}" en idioma "${language}" y categoría "${category}".`);
      }

    } catch (err: any) {
      console.error("Error al buscar en Gutendex:", err);
      setError(`Hubo un error al realizar la búsqueda: ${err.message}. Por favor, intenta de nuevo más tarde.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="my-5">
      <h2 className="text-center mb-4">Buscar Libros en Project Gutenberg</h2>
      <Alert variant="info" className="text-center">
        **Nota:** Esta sección busca libros utilizando la API de <a href="https://gutendex.com/" target="_blank" rel="noopener noreferrer">Gutendex.com</a>.
        <br/>
        Las categorías ahora usan una búsqueda por **"tema" (topic)**, lo que puede devolver resultados más amplios y variados. Para búsquedas más específicas, usa el campo de "Término de Búsqueda".
        <br/>
        **Importante:** La conversión de archivos HTML de Gutendex a PDF directamente en el navegador no es posible de forma fiable. Se ofrecerá la mejor opción de descarga disponible (PDF, EPUB, Texto) o la lectura online del HTML.
      </Alert>

      <Form onSubmit={handleSearch} className="mb-4">
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="searchTerm">
              <Form.Label>Término de Búsqueda (Título o Autor)</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ej: Sherlock Holmes, Jane Austen"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group controlId="language">
              <Form.Label>Idioma</Form.Label>
              <Form.Select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="">Cualquier idioma</option>
                <option value="en">Inglés</option>
                <option value="es">Español</option>
                <option value="fr">Francés</option>
                <option value="de">Alemán</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group controlId="category">
              <Form.Label>Categoría</Form.Label>
              <Form.Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categoryOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              Buscando...
            </>
          ) : 'Buscar en Gutenberg'}
        </Button>
      </Form>

      {message && <Alert variant="info">{message}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      {results.length > 0 && (
        <>
          <h3 className="text-center mt-5 mb-3">Resultados de Búsqueda</h3>
          <Row>
            {results.map((book) => {
              const downloadOption = getDownloadOption(book.formats);
              return (
                <Col md={4} className="mb-4" key={book.id}>
                  <Card className="h-100 shadow-sm">
                    {/* Imagen de portada */}
                    <div className="text-center p-3">
                      <Card.Img 
                        variant="top" 
                        src={getBookCover(book.formats)} 
                        alt={`Portada de ${book.title}`} 
                        style={{ maxWidth: '150px', height: 'auto' }}
                        className="mb-3 rounded shadow-sm"
                      />
                    </div>
                    <Card.Body>
                      <Card.Title>{book.title}</Card.Title>
                      <Card.Subtitle className="mb-2 text-muted">
                        {book.authors && book.authors.length > 0 ? book.authors[0].name : 'Autor Desconocido'}
                      </Card.Subtitle>
                      <Card.Text>
                        Idioma(s): {book.languages ? book.languages.map(lang => lang.toUpperCase()).join(', ') : 'N/A'}
                      </Card.Text>
                      <div className="d-flex flex-wrap gap-2">
                          {downloadOption ? (
                              <Button
                                  variant={downloadOption.type === 'download' ? "success" : "outline-primary"}
                                  href={downloadOption.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  size="sm"
                                  className="me-2"
                                  // Aplicar el atributo 'download' solo si es de tipo 'download'
                                  {...(downloadOption.type === 'download' && { download: true })}
                              >
                                  {downloadOption.type === 'download' ? `Descargar ${downloadOption.label}` : `Leer ${downloadOption.label} Online`}
                              </Button>
                          ) : (
                              <Button variant="light" size="sm" disabled>No disponible</Button>
                          )}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </>
      )}
    </Container>
  );
}

export default BuscarGutenberg;
