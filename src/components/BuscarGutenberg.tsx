import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Row, Col, Alert, Spinner, Card } from 'react-bootstrap';

interface GutenbergBook {
  id: number;
  title: string;
  authors: { name: string; birth_year: number; death_year: number; }[];
  languages: string[];
  formats: { [key: string]: string };
}

function BuscarGutenberg() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [language, setLanguage] = useState<string>('es');
  const [category, setCategory] = useState<string>('');
  const [results, setResults] = useState<GutenbergBook[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');

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
    { label: "Obras de Teatro", value: "Drama" },
    { label: "Romance", value: "Romance" },
    { label: "Ciencia Ficción y Fantasía", value: "Science_Fiction" },
    { label: "Crimen y Misterio", value: "Crime_and_Mystery" },
    { label: "Mitología y Folklore", value: "Mythology" },
    { label: "Humor", value: "Humour" },
    { label: "Lectura Infantil", value: "Children_Literature" },
    { label: "Ciencia y Tecnología", value: "Science_and_Technology" },
    { label: "Historia", value: "History" },
    { label: "Arte y Cultura", value: "Arts_and_Culture" },
    { label: "Religión y Filosofía", value: "Religion_and_Philosophy" },
    { label: "Educación y Referencia", value: "Education_and_Reference" },
    { label: "Otros", value: "Other" },
  ];

  // Función para obtener portada
  const getBookCover = (formats: { [key: string]: string }): string => {
    const imageUrl = formats['image/jpeg'] || formats['image/png'] || formats['image/webp'];
    return imageUrl || 'https://placehold.co/128x192/E0E0E0/505050?text=No+Cover';
  };

  // Función para obtener mejor formato de descarga disponible
  const getDownloadUrl = (formats: { [key: string]: string }): { url: string, label: string } | null => {
    if (formats['application/pdf']) return { url: formats['application/pdf'], label: 'PDF' };
    if (formats['application/epub+zip']) return { url: formats['application/epub+zip'], label: 'EPUB' };
    if (formats['text/html']) return { url: formats['text/html'], label: 'HTML' };
    return null;
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults([]);
    setMessage('');

    let apiUrl = `https://gutendex.com/books/?`;
    const params: string[] = [];

    if (searchTerm.trim()) params.push(`search=${encodeURIComponent(searchTerm.trim())}`);
    if (language) params.push(`languages=${language}`);
    if (category) params.push(`bookshelves=${encodeURIComponent(category)}`);

    apiUrl += params.join('&');

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error(`Error en la solicitud: ${response.statusText}`);
      const data = await response.json();
      if (data && data.results && data.results.length > 0) setResults(data.results);
      else setMessage(`No se encontraron resultados para "${searchTerm}".`);
    } catch (err: any) {
      setError(`Error al buscar libros: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="my-5">
      <h2 className="text-center mb-4">Buscar Libros en Project Gutenberg</h2>
      <Form onSubmit={handleSearch} className="mb-4">
        <Row className="mb-3">
          <Col md={6}>
            <Form.Control
              type="text"
              placeholder="Título o Autor"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Col>
          <Col md={3}>
            <Form.Select value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="">Cualquier idioma</option>
              <option value="en">Inglés</option>
              <option value="es">Español</option>
              <option value="fr">Francés</option>
              <option value="de">Alemán</option>
            </Form.Select>
          </Col>
          <Col md={3}>
            <Form.Select value={category} onChange={(e) => setCategory(e.target.value)}>
              {categoryOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </Form.Select>
          </Col>
        </Row>
        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? <Spinner as="span" animation="border" size="sm" /> : 'Buscar'}
        </Button>
      </Form>

      {message && <Alert variant="info">{message}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        {results.map(book => {
          const download = getDownloadUrl(book.formats);
          return (
            <Col md={4} className="mb-4" key={book.id}>
              <Card className="h-100 shadow-sm">
                <div className="text-center p-3">
                  <Card.Img
                    src={getBookCover(book.formats)}
                    alt={book.title}
                    style={{ maxWidth: '150px', height: 'auto' }}
                    className="mb-3 rounded shadow-sm"
                  />
                </div>
                <Card.Body>
                  <Card.Title>{book.title}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    {book.authors && book.authors.length > 0 ? book.authors[0].name : 'Autor Desconocido'}
                  </Card.Subtitle>
                  <Card.Text>Idioma(s): {book.languages.map(l => l.toUpperCase()).join(', ')}</Card.Text>
                  {download ? (
                    <Button
                      variant="success"
                      href={download.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      size="sm"
                      className="me-2"
                    >
                      Descargar {download.label}
                    </Button>
                  ) : (
                    <Button variant="light" size="sm" disabled>Descargar (N/A)</Button>
                  )}
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    </Container>
  );
}

export default BuscarGutenberg;
