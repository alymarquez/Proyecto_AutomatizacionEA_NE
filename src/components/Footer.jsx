import logo from "../assets/logone.png";

function Footer() {
  return (
    <footer className="bg-green-700 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Parte superior */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-8">

          {/* Logo + texto */}
          <div className="flex items-center gap-4 justify-center md:justify-start">
            <img
              src={logo}
              alt="Logo NE"
              className="w-16 h-16 object-contain"
            />

            <div className="text-center md:text-left">
              <h2 className="text-2xl font-bold">
                NE Estudiantes Asistentes
              </h2>

              <p className="text-sm text-green-100">
                UNAHUR - Nuevos Entornos
              </p>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-col items-center md:items-end text-center md:text-right gap-4">

            <a
              href="https://unahur.edu.ar/calendario-academico/"
              target="_blank"
              rel="noopener noreferrer"
              className="transition duration-300 hover:text-cyan-300"
            >
              Calendario Académico
            </a>

            <a
              href="https://campusvirtual.unahur.edu.ar/"
              target="_blank"
              rel="noopener noreferrer"
              className="transition duration-300 hover:text-cyan-300"
            >
              Docentes web UNAHUR
            </a>

            <a
              href="https://nativo.unahur.edu.ar/"
              target="_blank"
              rel="noopener noreferrer"
              className="transition duration-300 hover:text-cyan-300"
            >
              Nativo
            </a>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="border-t border-green-500 my-6"></div>

        {/* Copyright */}
        <div className="text-center text-sm text-green-100">
          © 2026 NE Estudiantes Asistentes - UNAHUR
        </div>
      </div>
    </footer>
  );
}

export default Footer;