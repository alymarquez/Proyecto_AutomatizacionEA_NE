import CalendarioAsistentes from "../components/CalendarioAsistentes";

function Home() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="bg-gradient-to-r from-green-700 to-green-600 text-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">
          ¡Hola, equipo de estudiantes asistentes!
        </h1>
        <p className="text-green-100 text-sm mt-1">
          Página organizativa para el acompañamiento de NE/CADU.
        </p>
      </div>

      <main className="py-4">
        <CalendarioAsistentes />
      </main>
    </div>
  );
}

export default Home;
