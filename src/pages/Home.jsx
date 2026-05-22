import logo from '../assets/logo.png'

export default function Home() {
  return (
    <div className="max-w-2xl mx-auto">

      <div className="flex justify-center mb-8">
        <img src={logo} alt="GigaGym" className="h-24 rounded-2xl shadow-md" />
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-4">
        <h2 className="text-lg font-bold text-red-500 mb-2">💪🏽 Bienvenido/a a GIGAGYM Gestión</h2>
        <p className="text-gray-400 text-sm leading-relaxed">
          Este es el espacio donde vas a poder cargar tus horas trabajadas, clases realizadas y mantener organizada toda tu actividad dentro del gym de forma rápida, cómoda y sencilla 🚀
        </p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-4">
        <h2 className="text-lg font-bold text-white mb-3">📌 ¿Cómo cargar tus horas o clases?</h2>
        <ol className="space-y-2 text-sm text-gray-400">
          <li className="flex gap-2"><span>1️⃣</span> Ingresá al apartado <strong className="text-white">"Mis horas"</strong> o <strong className="text-white">"Mis clases"</strong> ubicado arriba a la derecha.</li>
          <li className="flex gap-2"><span>2️⃣</span> Completá los datos correspondientes 🕒</li>
          <li className="flex gap-2"><span>3️⃣</span> Revisá que la fecha, horarios y cantidad de alumnos sean correctos ✅</li>
          <li className="flex gap-2"><span>4️⃣</span> Guardá la información y listo 🚀</li>
        </ol>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-4">
        <h2 className="text-lg font-bold text-white mb-3">📱 ¿Cómo agregar la web a la pantalla de inicio?</h2>
        <ol className="space-y-2 text-sm text-gray-400">
          <li className="flex gap-2"><span>1️⃣</span> Abrí la página desde tu celular.</li>
          <li className="flex gap-2"><span>2️⃣</span> Tocá los tres puntitos del navegador.</li>
          <li className="flex gap-2"><span>3️⃣</span> Seleccioná <strong className="text-white">"Agregar a pantalla de inicio"</strong> o <strong className="text-white">"Instalar aplicación"</strong>.</li>
          <li className="flex gap-2"><span>4️⃣</span> Accedé más rápido desde tu pantalla principal, como si fuera una app ⚡</li>
        </ol>
      </div>

      <div className="bg-gradient-to-r from-red-900 to-red-800 rounded-2xl p-6 text-white text-center">
        <p className="text-sm leading-relaxed">
          🙌 Gracias por formar parte de <strong>GIGAGYM</strong>. Cada clase, cada hora y cada esfuerzo ayudan a seguir creciendo juntos 🔥
        </p>
        <p className="text-sm mt-2">
          Esperamos que tengas una excelente jornada y disfrutes ser parte del equipo 💙
        </p>
      </div>

    </div>
  )
}
