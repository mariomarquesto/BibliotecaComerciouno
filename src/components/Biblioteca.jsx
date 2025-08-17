import React from 'react';
import { Container, Card, Button, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function Biblioteca() {
  return (
    <Container className="my-5 text-center">
      {/* El fondo ya viene de App.css */}
      <Card className="p-5 homepage-card"> {/* Reutilizamos la clase homepage-card para el estilo */}
        <h1 className="display-4 mb-4">📚 Nuestro Centro de Libros</h1>
        
        {/* Reseña Histórica de la Escuela */}
        <div className="history-text text-start"> {/* Alinea el texto de la reseña a la izquierda */}
          <p>
            La Escuela de Comercio N° 1 "Gral. Manuel Belgrano" de Tucumán, fundada el <strong>4 de julio de 1910</strong> como Escuela Superior de Comercio de la Nación, es un verdadero símbolo provincial con más de un siglo de rica historia. Su trayectoria ha sido fundamental en la formación de profesionales y en la posterior creación de la <strong>Facultad de Ciencias Económicas de la Universidad Nacional de Tucumán</strong>, consolidándose como un pilar de la educación y la cultura en la región.
          </p>

          <h3>Orígenes y Primeros Años</h3>
          <p>
            La institución inició sus clases el 4 de julio de 1910, un hito en la educación de Tucumán. Nació gracias a la propuesta de un congresista, buscando replicar el éxito de escuelas de comercio en Rosario y La Plata. A pesar de las dificultades iniciales —sin edificio propio ni personal docente—, desde sus comienzos honró el nombre del General Manuel Belgrano.
          </p>

          <h3>Un Edificio Emblema</h3>
          <p>
            Durante más de tres décadas, la escuela se trasladó por diversas sedes. Sin embargo, en 1946, se iniciaron las obras de su hogar definitivo en la emblemática <strong>Avenida Sarmiento y Laprida</strong>. Inaugurado en 1949, este edificio Art Déco se convirtió en un ícono, compartido también con la Escuela de Administración, y es parte inseparable de su identidad desde que incorporó oficialmente el nombre de Manuel Belgrano en 1946.
          </p>

          <h3>Legado y Compromiso con la Región</h3>
          <p>
            La Escuela de Comercio N° 1 ha sido cuna de incontables generaciones de tucumanos, formando hombres y mujeres con gran capacidad profesional y humana. Los valores inculcados —<strong>esfuerzo, estudio y solidaridad</strong>—, junto con su rol como antecedente directo de la Facultad de Ciencias Económicas, subrayan su inmensa importancia como institución emblemática para toda la provincia y la región.
          </p>
        </div>
        
        <hr className="my-4" />

        {/* Instrucción de navegación */}
        <p className="lead mb-4">
          Usa la barra de navegación para **"Buscar en Gutenberg"** .
        </p>

        <Row className="justify-content-center">
         
          <Col md={5} className="mb-3">
            <Button 
              as={Link} 
              to="/buscar-gutenberg" 
              variant="outline-secondary" 
              size="lg" 
              className="w-100 shadow"
            >
              Buscar en Project Gutenberg
            </Button>
            <p className="mt-2 text-muted">Accede a una vasta colección de libros de dominio público.</p>
          </Col>
        </Row>
      </Card>
    </Container>
  );
}

export default Biblioteca;