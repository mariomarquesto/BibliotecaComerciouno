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

  // Opciones de categoría mapeadas a 'bookshelves' de Gutendex
  const categoryOptions = [
    { label: "Cualquier Categoría", value: "" },
    { label: "Literatura", value: "Literature" },
    { label: "Aventura", value: "Adventure" },
    { label: "Literatura Americana", value: "American_Literature" },
    { label: "Literatura Británica", value: "British_Literature" },
    { label: "Literatura Francesa", value: "French_Literature" },
    { label: "Literatura Alemana", value: "German_Literature" },
    { label: "Literatura Rusa", value: "Russian_Literature" },
    { label: "Clásicos de la Literatura", value: "Classics" },
    { label: "Biografías", value: "Biography" },
    { label: "Novelas", value: "Fiction" },
    { label: "Cuentos Cortos", value: "Short_Stories" },
    { label: "Poesía", value: "Poetry" },
    { label: "Obras de Teatro", value: "Drama" }, // Simplificado de "Plays/Films/Dramas"
    { label: "Romance", value: "Romance" },
    { label: "Ciencia Ficción y Fantasía", value: "Science_Fiction" },
    { label: "Crimen y Misterio", value: "Crime_and_Mystery" }, // Simplificado de "Crime, Thrillers & Mystery"
    { label: "Mitología y Folklore", value: "Mythology" }, // Simplificado de "Mythology, Legends & Folklore"
    { label: "Humor", value: "Humour" },
    { label: "Lectura Infantil y Juvenil", value: "Children_Literature" }, // Simplificado de "Children & Young Adult Reading"
    { label: "Literatura - Otros", value: "Literature_Other" },
    { label: "Ciencia y Tecnología", value: "Science_and_Technology" },
    { label: "Ingeniería y Tecnología", value: "Engineering" },
    { label: "Matemáticas", value: "Mathematics" },
    { label: "Ciencia - Física", value: "Physics" },
    { label: "Ciencia - Química/Bioquímica", value: "Chemistry" },
    { label: "Ciencia - Biología", value: "Biology" },
    { label: "Ciencia - Tierra/Agricultura/Farming", value: "Earth_Agricultural_Farming" }, // Combinado
    { label: "Métodos de Investigación/Estadística/Sistemas de Información", value: "Research_Methods_Statistics_Information_Sys" }, // Combinado
    { label: "Problemas Ambientales", value: "Environmental_Issues" },
    { label: "Historia", value: "History" },
    { label: "Historia - Americana", value: "American_History" },
    { label: "Historia - Británica", value: "British_History" },
    { label: "Historia - Europea", value: "European_History" },
    { label: "Historia - Antigua", value: "Ancient_History" },
    { label: "Historia - Medieval/Middle Ages", value: "Medieval_Middle_Ages" },
    { label: "Historia - Early Modern (c. 1450-1750)", value: "Early_Modern_1450_1750" },
    { label: "Historia - Moderna (1750+)", value: "Modern_1750_plus" },
    { label: "Historia - Religiosa", value: "Religious_History" },
    { label: "Historia - Realeza", value: "Royalty_History" },
    { label: "Historia - Guerra", value: "Warfare_History" },
    { label: "Historia - Escuelas y Universidades", value: "Schools_Universities_History" },
    { label: "Historia - Otros", value: "History_Other" },
    { label: "Arqueología y Antropología", value: "Archaeology_Anthropology" },
    { label: "Ciencias Sociales y Sociedad", value: "Social_Sciences_Society" },
    { label: "Negocios/Gestión", value: "Business_Management" },
    { label: "Economía", value: "Economics" },
    { label: "Derecho y Criminología", value: "Law_Criminology" },
    { label: "Estudios de Género y Sexualidad", value: "Gender_Sexuality_Studies" },
    { label: "Psiquiatría/Psicología", value: "Psychiatry_Psychology" },
    { label: "Sociología", value: "Sociology" },
    { label: "Política", value: "Politics" },
    { label: "Paternidad y Relaciones Familiares", value: "Parenthood_Family_Relations" },
    { label: "Vejez y Ancianos", value: "Old_Age_Elderly" },
    { label: "Artes y Cultura", value: "Arts_Culture" },
    { label: "Arte", value: "Art" },
    { label: "Arquitectura", value: "Architecture" },
    { label: "Música", value: "Music" },
    { label: "Moda", value: "Fashion" },
    { label: "Periodismo/Medios/Escritura", value: "Journalism_Media_Writing" },
    { label: "Lenguaje y Comunicación", value: "Language_Communication" },
    { label: "Ensayos, Cartas y Discursos", value: "Essays_Letters_Speeches" },
    { label: "Religión y Filosofía", value: "Religion_Philosophy" },
    { label: "Religión/Espiritualidad", value: "Religion_Spirituality" },
    { label: "Filosofía y Ética", value: "Philosophy_Ethics" },
    { label: "Estilo de Vida y Hobbies", value: "Lifestyle_Hobbies" },
    { label: "Cocina y Bebidas", value: "Cooking_Drinking" },
    { label: "Deportes/Hobbies", value: "Sports_Hobbies" },
    { label: "Cómo Hacer...", value: "How_To" },
    { label: "Escritura de Viajes", value: "Travel_Writing" },
    { label: "Naturaleza/Jardinería/Animales", value: "Nature_Gardening_Animals" },
    { label: "Sexualidad y Erótica", value: "Sexuality_Erotica" },
    { label: "Salud y Medicina", value: "Health_Medicine" },
    { label: "Drogas/Alcohol/Farmacología", value: "Drugs_Alcohol_Pharmacology" },
    { label: "Nutrición", value: "Nutrition" },
    { label: "Educación y Referencia", value: "Education_Reference" },
    { label: "Enciclopedias/Diccionarios/Referencia", value: "Encyclopedias_Dictionaries_Reference" },
    { label: "Enseñanza y Educación", value: "Teaching_Education" },
    { label: "Reportes y Actas de Conferencias", value: "Reports_Conference_Proceedings" },
    { label: "Revistas", value: "Journals" },
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
    // Prioriza formatos de texto que se puedan descargar antes de HTML
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
          // Carga los 50 libros más populares en español por defecto
          const response = await fetch(`https://gutendex.com/books/?sort=popular&languages=es&limit=50`); // CAMBIO AQUÍ: limit=50
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
    if (category) {
      params.push(`bookshelves=${encodeURIComponent(category)}`);
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