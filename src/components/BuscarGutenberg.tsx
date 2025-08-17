import React, { useState, useEffect, FormEvent } from 'react';
import { Container, Form, Button, Row, Col, Alert, Spinner, Card } from 'react-bootstrap';

// Define una interfaz explícita para el autor del libro (compatible con la normalización de todas las APIs)
interface BookAuthor {
  name: string;
  birth_year: number | null;
  death_year: number | null;
}

// Define una interfaz unificada para la estructura de un libro, compatible con todas las APIs
interface BookResult {
  id: string; // Puede ser de Gutendex, Google Books o Open Library
  title: string;
  authors: BookAuthor[];
  languages: string[];
  formats: { [key: string]: string }; // URLs para diferentes formatos (pdf, html, epub, imagen)
  source: 'Gutenberg' | 'Google Books' | 'Open Library'; // Para saber de dónde viene el libro
}

// Define la interfaz para las opciones de categoría
interface CategoryOption {
  label: string;
  value: string;
}

// Define la interfaz para la opción de descarga/vista
interface DownloadOption {
  url: string;
  label: string;
  type: 'download' | 'view'; // Tipo literal de cadena 'download' o 'view'
}

function BuscarGutenberg() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [language, setLanguage] = useState<string>('es');
  const [category, setCategory] = useState<string>('');
  const [results, setResults] = useState<BookResult[]>([]); 
  const [loading, setLoading] = useState<boolean>(false);   
  const [error, setError] = useState<string | null>(null); 
  const [message, setMessage] = useState<string>('');      

  // ¡CLAVE API DE GOOGLE BOOKS INSERTADA AQUÍ!
  // Asegúrate de que esta clave sea válida y esté restringida correctamente en la consola de Google Cloud.
  const GOOGLE_BOOKS_API_KEY = 'AIzaSyCy6G1p4Lpks2yXKbA0GY67fPv9jWH0vmI'; 

  // Opciones de categoría mapeadas a 'topic' de Gutendex, usadas en Google Books, y adaptadas para Open Library.
  const categoryOptions: CategoryOption[] = [
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
    { label: "Metafísica", value: "Metafísica" }, 
    { label: "Estudios Religiosos", value: "Religion" },
    { label: "Cristianismo", value: "Christianity" },
    { label: "Judaísmo", value: "Judaism" },
    { label: "Islam", value: "Islam" },
    { label: "Budismo", value: "Buddhism" },
    { label: "Hinduismo", value: "Hinduismo" },
    { label: "Teología", value: "Teología" }, 
    { label: "Mitología y Espiritualidad", value: "Spirituality" },

    // Ciencias Sociales y Humanidades
    { label: "Sociología", value: "Sociology" },
    { label: "Antropología", value: "Antropología" }, 
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
    { label: "Danza", value: "Danza" }, 

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

  // Función auxiliar para obtener la URL de la imagen de portada
  const getBookCover = (formats: { [key: string]: string }): string => {
    const imageUrl = formats['image/jpeg'] || formats['image/png'] || formats['image/webp'];
    return imageUrl || 'https://placehold.co/128x192/E0E0E0/505050?text=No+Cover'; // Imagen de placeholder si no hay portada
  };

  // Función para obtener la mejor opción de descarga o visualización
  // Prioridad: PDF > EPUB > Texto Plano > HTML (para ver online)
  const getDownloadOption = (formats: { [key: string]: string }): DownloadOption | null => {
    if (formats['application/pdf']) {
      return { url: formats['application/pdf'], label: 'PDF', type: 'download' };
    }
    if (formats['application/epub+zip']) {
      return { url: formats['application/epub+zip'], label: 'EPUB', type: 'download' };
    }
    const plainTextUrl = Object.keys(formats).find((key: string) => key.startsWith('text/plain') && formats[key]);
    if (plainTextUrl) {
      return { url: formats[plainTextUrl], label: 'Texto', type: 'download' };
    }
    if (formats['text/html']) {
      return { url: formats['text/html'], label: 'HTML', type: 'view' };
    }
    return null;
  };

  // Función para buscar en Gutendex
  const fetchFromGutendex = async (searchTerm: string, language: string, category: string): Promise<BookResult[]> => {
    let gutendexApiUrl = `https://gutendex.com/books/?`;
    const gutendexParams: string[] = [];

    if (searchTerm.trim()) {
      gutendexParams.push(`search=${encodeURIComponent(searchTerm.trim())}`);
    }
    if (language) {
      gutendexParams.push(`languages=${language}`);
    }
    if (category) {
      // Gutendex usa 'topic' para categorías amplias.
      // La disponibilidad de contenido académico/científico en español en el dominio público de Gutendex puede ser limitada.
      gutendexParams.push(`topic=${encodeURIComponent(category)}`); 
    }
    gutendexApiUrl += gutendexParams.join('&');

    try {
      const response = await fetch(gutendexApiUrl);
      if (!response.ok) {
        throw new Error(`Error en la solicitud a Gutendex: ${response.statusText}`);
      }
      const data = await response.json();
      
      if (data && data.results && data.results.length > 0) {
        // Normalizar los resultados de Gutendex a la interfaz BookResult
        return data.results.map((book: any) => ({
          id: `gutendex-${String(book.id)}`, // ID único para Gutendex
          title: book.title || 'Título Desconocido',
          authors: book.authors.map((author: any) => ({ name: author.name, birth_year: author.birth_year, death_year: author.death_year })),
          languages: book.languages || [],
          formats: book.formats || {},
          source: 'Gutenberg'
        })) as BookResult[];
      }
      return [];
    } catch (err: any) {
      console.error("Error al buscar en Gutendex:", err);
      return []; 
    }
  };

  // Función para buscar en Google Books API
  const fetchFromGoogleBooks = async (searchTerm: string, language: string, category: string): Promise<BookResult[]> => {
    if (!GOOGLE_BOOKS_API_KEY || GOOGLE_BOOKS_API_KEY === 'AIzaSyCy6G1p4Lpks2yXKbA0GY67fPv9jWH0vmI') {
      console.warn("ADVERTENCIA CRÍTICA: GOOGLE_BOOKS_API_KEY no configurada o es el placeholder. La búsqueda de Google Books no funcionará. Por favor, reemplaza 'AIzaSyCy6G1p4Lpks2yXKbA0GY67fPv9jWH0vmI' con tu clave real válida.");
      return [];
    }

    let finalGoogleQuery = '';
    const trimmedSearchTerm = searchTerm.trim();
    const encodedCategory = encodeURIComponent(category); 

    if (trimmedSearchTerm) {
      finalGoogleQuery += `"${encodeURIComponent(trimmedSearchTerm)}"`; // Busca la frase exacta
    }
    if (category) {
      if (finalGoogleQuery) {
        finalGoogleQuery += ` AND `; // Operador AND si ambos están presentes
      }
      finalGoogleQuery += `"${encodedCategory}"`; // Busca la categoría como frase exacta
    }

    if (!finalGoogleQuery) { 
      return []; 
    }

    const googleBooksApiUrl = `https://www.googleapis.com/books/v1/volumes?q=${finalGoogleQuery}&langRestrict=${encodeURIComponent(language)}&key=${GOOGLE_BOOKS_API_KEY}&maxResults=20`;

    try {
      const response = await fetch(googleBooksApiUrl);
      if (!response.ok) {
        const errorText = await response.text(); 
        console.error(`Error en la solicitud a Google Books: ${response.statusText}. Respuesta:`, errorText);
        throw new Error(`Error en la solicitud a Google Books: ${response.statusText}. Detalles: ${errorText.substring(0, 100)}...`); 
      }
      const data = await response.json();

      if (data && data.items && data.items.length > 0) {
        // Normalizar los resultados de Google Books a la interfaz BookResult
        return data.items.map((item: any) => {
            const volumeInfo = item.volumeInfo || {};
            const accessInfo = item.accessInfo || {};
            
            const authors = volumeInfo.authors 
                ? volumeInfo.authors.map((authorName: string) => ({ name: authorName, birth_year: null, death_year: null })) 
                : [{ name: 'Autor Desconocido', birth_year: null, death_year: null }];

            const languages = volumeInfo.language ? [volumeInfo.language] : [];

            const formats: { [key: string]: string } = {};
            // Intenta obtener un PDF si está disponible y es embebible/descargable
            if (accessInfo.pdf && accessInfo.pdf.isAvailable && accessInfo.pdf.downloadLink) {
              formats['application/pdf'] = accessInfo.pdf.downloadLink;
            } else if (accessInfo.epub && accessInfo.epub.isAvailable && accessInfo.epub.downloadLink) {
              formats['application/epub+zip'] = accessInfo.epub.downloadLink;
            } else if (accessInfo.webReaderLink) { // Priorizar lector web si no hay descargas directas
                formats['text/html'] = accessInfo.webReaderLink; 
            } else if (volumeInfo.previewLink) { // Usar previewLink como fallback HTML
                formats['text/html'] = volumeInfo.previewLink;
            }
            
            // También la imagen de portada (usar smallThumbnail si thumbnail no está)
            if (volumeInfo.imageLinks) {
                formats['image/jpeg'] = volumeInfo.imageLinks.thumbnail || volumeInfo.imageLinks.smallThumbnail;
            }

            return {
                id: `google-${item.id || Math.random().toString(36).substring(7)}`, // ID único para Google Books
                title: volumeInfo.title || 'Título Desconocido',
                authors: authors,
                languages: languages,
                formats: formats,
                source: 'Google Books'
            } as BookResult;
        });
      }
      return [];
    } catch (err: any) {
      console.error("Error al buscar en Google Books:", err);
      return []; 
    }
  };

  // Función para buscar en Open Library API
  const fetchFromOpenLibrary = async (searchTerm: string, language: string, category: string): Promise<BookResult[]> => {
    let openLibraryApiUrl = `https://openlibrary.org/search.json?`;
    const olParams: string[] = [];

    // Open Library no tiene un parámetro 'langRestrict' tan granular como Google Books
    // para todas las búsquedas. Se puede filtrar post-consulta o confiar en el query.
    // Su parámetro de idioma es 'language' para la interfaz, no para la búsqueda.
    // Usaremos 'q' para el término de búsqueda y combinaremos con la categoría.
    let olQuery = searchTerm.trim();
    if (category) {
        if (olQuery) {
            olQuery += ` `; // Espacio si ya hay un término
        }
        olQuery += category; // Añadir categoría al query
    }

    if (!olQuery) {
        return [];
    }

    olParams.push(`q=${encodeURIComponent(olQuery)}`);
    // Puedes intentar añadir filtro de idioma si OL lo soporta mejor en futuras actualizaciones
    // olParams.push(`language=${language}`); // Esto es más para la interfaz de OL

    openLibraryApiUrl += olParams.join('&');

    try {
      const response = await fetch(openLibraryApiUrl);
      if (!response.ok) {
        throw new Error(`Error en la solicitud a Open Library: ${response.statusText}`);
      }
      const data = await response.json();

      if (data && data.docs && data.docs.length > 0) {
        // Normalizar los resultados de Open Library a la interfaz BookResult
        return data.docs.map((item: any) => {
            const authors = item.author_name 
                ? item.author_name.map((name: string) => ({ name: name, birth_year: null, death_year: null })) 
                : [{ name: 'Autor Desconocido', birth_year: null, death_year: null }];
            
            const languages = item.language ? item.language : []; // OL devuelve array de códigos

            const formats: { [key: string]: string } = {};
            if (item.cover_i) { // ID de portada para construir la URL
                formats['image/jpeg'] = `https://covers.openlibrary.org/b/id/${item.cover_i}-M.jpg`;
            }
            // Open Library a menudo enlaza a Internet Archive para descargas.
            // Para descargas directas, necesitaríamos una llamada a Internet Archive.
            // Por simplicidad, aquí solo se incluirá la portada y quizás un enlace de vista.
            if (item.edition_key && item.edition_key.length > 0) {
                // Enlace a la página del libro en Open Library
                formats['text/html'] = `https://openlibrary.org/books/${item.edition_key[0]}`;
            }

            return {
                id: `ol-${item.key || Math.random().toString(36).substring(7)}`, // ID único para Open Library (usa 'key' o genera)
                title: item.title || 'Título Desconocido',
                authors: authors,
                languages: languages,
                formats: formats,
                source: 'Open Library'
            } as BookResult;
        }).filter((book: BookResult) => book.languages.includes(language)); // Filtrar por idioma después de la normalización
      }
      return [];
    } catch (err: any) {
      console.error("Error al buscar en Open Library:", err);
      return []; 
    }
  };


  // Función para deduplicar libros (básica por título y primer autor)
  const deduplicateBooks = (books: BookResult[]): BookResult[] => {
    const seen = new Set<string>();
    const uniqueBooks: BookResult[] = [];

    for (const book of books) {
      const identifier = `${book.title.toLowerCase()}-${book.authors[0]?.name?.toLowerCase() || ''}`;
      if (!seen.has(identifier)) {
        seen.add(identifier);
        uniqueBooks.push(book);
      }
    }
    return uniqueBooks;
  };


  // useEffect para cargar libros por defecto al inicio (solo una vez)
  useEffect(() => {
    const fetchInitialDefaultBooks = async () => {
      setLoading(true);
      setError(null);
      setMessage('');
      try {
        // Realizar búsquedas concurrentes para la carga inicial
        const [gutendexResponse, googleBooksResponse, openLibraryResponse] = await Promise.allSettled([
          fetchFromGutendex('', 'es', 'Literature'), 
          fetchFromGoogleBooks('', 'es', 'Literature'),
          fetchFromOpenLibrary('', 'es', 'Literature')
        ]);

        let combinedBooks: BookResult[] = [];

        if (gutendexResponse.status === 'fulfilled') {
          combinedBooks.push(...gutendexResponse.value);
        }
        if (googleBooksResponse.status === 'fulfilled') {
          combinedBooks.push(...googleBooksResponse.value);
        }
        if (openLibraryResponse.status === 'fulfilled') {
          combinedBooks.push(...openLibraryResponse.value);
        }
        
        const finalResults = deduplicateBooks(combinedBooks);
        setResults(finalResults.slice(0, 50)); // Mostrar hasta 50 libros iniciales
        setMessage(`Mostrando ${finalResults.length} libros populares. (Combinado de Gutendex, Google Books y Open Library)`);

      } catch (err: any) { 
        console.error("Error al cargar libros iniciales:", err);
        setError(`Hubo un error al cargar los libros iniciales: ${err.message}.`);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialDefaultBooks();
  }, []); 


  const handleSearch = async (e: FormEvent) => {
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

    let allResults: BookResult[] = [];
    
    try {
      // Realizar búsquedas concurrentes en todas las APIs
      const [gutendexResponse, googleBooksResponse, openLibraryResponse] = await Promise.allSettled([
        fetchFromGutendex(searchTerm, language, category),
        fetchFromGoogleBooks(searchTerm, language, category),
        fetchFromOpenLibrary(searchTerm, language, category)
      ]);

      let gutendexBooks: BookResult[] = [];
      let googleBooks: BookResult[] = [];
      let openLibraryBooks: BookResult[] = [];

      if (gutendexResponse.status === 'fulfilled') {
        gutendexBooks = gutendexResponse.value;
      } else {
        console.error("Falló la búsqueda en Gutendex:", gutendexResponse.reason);
      }

      if (googleBooksResponse.status === 'fulfilled') {
        googleBooks = googleBooksResponse.value;
      } else {
        console.error("Falló la búsqueda en Google Books:", googleBooksResponse.reason);
      }

      if (openLibraryResponse.status === 'fulfilled') {
        openLibraryBooks = openLibraryResponse.value;
      } else {
        console.error("Falló la búsqueda en Open Library:", openLibraryResponse.reason);
      }

      // Combinar y deduplicar resultados de todas las fuentes
      allResults = deduplicateBooks([...gutendexBooks, ...googleBooks, ...openLibraryBooks]);

      if (allResults.length > 0) {
        setResults(allResults);
        setMessage(`Se encontraron ${allResults.length} resultados (combinado de Gutendex, Google Books y Open Library).`);
      } else {
        setMessage(`No se encontraron resultados para tu búsqueda: "${searchTerm}" en idioma "${language}" y categoría "${category}" en ninguna fuente disponible.`);
      }

    } catch (err: any) {
      console.error("Error en la búsqueda multi-API:", err);
      setError(`Hubo un error al realizar la búsqueda: ${err.message}. Por favor, intenta de nuevo más tarde.`);
      setMessage(''); // Limpiar mensaje si hay error crítico
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="my-5">
      <h2 className="text-center mb-4">Buscar Libros en la Biblioteca Extendida</h2>
      <Alert className="text-center text-white bg-transparent border-0"> {/* CAMBIO AQUÍ: Eliminado variant="primary", añadido bg-transparent y border-0 */}
        **Nota:** Esta sección busca libros utilizando la API de <a href="https://gutendex.com/" target="_blank" rel="noopener noreferrer" className="text-white-50">Gutendex.com</a> (dominio público), la **Google Books API** (amplia gama, incluyendo académicos) y la **Open Library API** (amplia colección digitalizada, a menudo con enlaces de Internet Archive).
        
       
      </Alert>

      <Form onSubmit={handleSearch} className="mb-4">
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="searchTerm">
              <Form.Label>Término de Búsqueda (Título o Autor)</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ej: Sherlock Holmes, Física Cuántica, Historia Argentina"
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

        <Button variant="success" type="submit" disabled={loading}> {/* CAMBIO AQUÍ: variant="success" */}
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
          ) : 'Buscar en Bibliotecas'}
        </Button>
      </Form>

      {message && <Alert className="text-center text-white bg-transparent border-0">{message}</Alert>} {/* CORREGIDO AQUÍ */}
      {error && <Alert variant="danger">{error}</Alert>} {/* Dejamos variant="danger" para errores graves */}

      {results.length > 0 && (
        <>
          <h3 className="text-center mt-5 mb-3">Resultados de Búsqueda</h3>
          <Row>
            {results.map((book) => {
              const downloadOption = getDownloadOption(book.formats);
              return (
                <Col md={4} className="mb-4" key={book.id}>
                  <Card className="h-100 shadow-sm book-card-animated"> {/* AÑADIDA CLASE DE ANIMACIÓN */}
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
                      <Card.Text className="small text-end fst-italic">
                        Fuente: {book.source}
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
