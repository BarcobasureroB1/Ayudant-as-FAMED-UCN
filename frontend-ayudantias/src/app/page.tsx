
export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex flex-col items-center justify-center p-4">

      <div className="w-full max-w-md mb-8 text-center">
        <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-lg">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l-9 5m9-5v6" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-800">Sistema de Ayudantías</h1>
        <p className="text-black font-semibold mt-1">FAMED</p>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
        <div className="h-2 bg-gradient-to-r from-green-500 to-blue-500"></div>
        
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Bienvenido al sistema</h2>
            <p className="text-gray-600">
              Porfavor accede o crea una cuenta para entrar al sistema.
            </p>
          </div>

          <div className="space-y-4">
            <a 
              href="/login" 
              className="block w-full bg-gradient-to-r from-gray-800 to-black text-white text-center py-3 px-4 rounded-lg font-medium transition-all duration-300 hover:from-gray-900 hover:to-black hover:shadow-md transform hover:-translate-y-0.5"
            >
              Iniciar Sesión
            </a>
            
            <a 
              href="/register" 
              className="block w-full bg-white border border-gray-300 text-gray-700 text-center py-3 px-4 rounded-lg font-medium transition-all duration-300 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md transform hover:-translate-y-0.5"
            >
              Crear Cuenta
            </a>
          </div>

        </div>
      </div>

      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>Sistema de Ayudantías FAMED © {new Date().getFullYear()}</p>
      </div>
    </div>
  
  );
}
