import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { db, collection, addDoc } from '../firebase/firebaseConfig'; // Asegúrate de que db, collection, addDoc estén exportados

function PageViewTracker({ user, isAdmin }) {
  const location = useLocation(); // Correcto: useLocation se llama dentro de un componente que estará en <Router>

  useEffect(() => {
    // AÑADIDO PARA DEBUGGING: Muestra cuándo se ejecuta el efecto y la ruta actual
    console.log("PageViewTracker useEffect ejecutado para la ruta:", location.pathname);

    // Genera un ID de sesión para usuarios no autenticados o usa el UID del usuario
    let visitorId = user?.uid;
    if (!visitorId) {
      // Si el usuario no está autenticado, intenta obtener un ID de localStorage
      visitorId = localStorage.getItem('anonymousVisitorId');
      if (!visitorId) {
        // Si no hay ID, genera uno nuevo y guárdalo en localStorage
        visitorId = 'anon_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('anonymousVisitorId', visitorId);
      }
    }

    // Registra la visita en Firestore
    const logVisit = async () => {
      try {
        await addDoc(collection(db, "page_visits"), {
          path: location.pathname, // Ruta de la página visitada
          timestamp: new Date(),   // Marca de tiempo de la visita
          userId: user ? user.uid : visitorId, // UID si está autenticado, o ID anónimo
          userEmail: user ? user.email : 'anonymous', // Email si está autenticado
          isAdminVisit: isAdmin, // Si la visita la realizó un administrador
        });
        // console.log("Visita registrada con éxito:", location.pathname); // Puedes descomentar para depurar
      } catch (e) {
        console.error("Error CRÍTICO al registrar la visita en Firestore:", e);
        // Puedes agregar un mensaje al usuario aquí si quieres, aunque para el tracking es opcional
      }
    };

    logVisit();
  }, [location.pathname, user, isAdmin]); // Se ejecuta cada vez que la ruta cambia, o el usuario/isAdmin cambia

  return null; // Este componente no renderiza nada visualmente, solo maneja lógica.
}

export default PageViewTracker;
