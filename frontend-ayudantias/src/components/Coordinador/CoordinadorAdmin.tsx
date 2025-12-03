"use client";
import React, { useState, useMemo } from 'react';
import {
    useCoordinadoresTodos,
    CoordinadorData,
    usePostulantesCoordinador,
    useAyudantesActivos, PostulanteCoordinadorData, AyudanteActivoData
} from '@/hooks/useCoordinadores';
import { CoordinadorDashboard } from '@/app/coordinador/page';
import { User } from '@/hooks/useUserProfile';
import { ModalSeleccionarCoordinadorAdmin } from './ModalSeleccionarCoordinadorAdmin';
import { Users, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';


const MOCK_POSTULANTES: PostulanteCoordinadorData[] = [
  {
    id: 101,
    rut_alumno: "19.123.456-7",
    alumno: {
      nombres: "Juan Pablo",
      apellidos: "Pérez Soto",
      nombre_carrera: "Ingeniería Civil Informática"
    },
    id_asignatura: 1, 
    //periodo: "2025-1",
    descripcion_carta: "Tengo mucha motivación por ser ayudante de esta asignatura ya que obtuve un promedio de 6.8 cuando la cursé. Me gusta enseñar y tengo paciencia con mis compañeros.",
    metodologia: "Planeo realizar repasos semanales antes de las evaluaciones y mantener un canal de Discord activo para resolver dudas rápidas fuera del horario de ayudantía.",
    puntuacion_etapa1: 95, 
    puntuacion_etapa2: null,
    motivo_descarte: null,
    fecha_descarte: null,
    rechazada_por_jefatura: false
  },
  {
    id: 102,
    rut_alumno: "20.555.666-K",
    alumno: {
      nombres: "María Fernanda",
      apellidos: "González Tapia",
      nombre_carrera: "Ingeniería Civil Industrial"
    },
    id_asignatura: 2, 
    descripcion_carta: "He sido ayudante anteriormente en asignaturas de gestión y me gustaría ampliar mi experiencia al área técnica. Manejo SQL a nivel avanzado.",
    metodologia: "Mi enfoque será 100% práctico, resolviendo guías de ejercicios tipo prueba en cada sesión para asegurar que suelten la mano con el código.",
    puntuacion_etapa1: 88,
    puntuacion_etapa2: 100, 
    motivo_descarte: null,
    fecha_descarte: null,
    rechazada_por_jefatura: false
  },
  {
    id: 103,
    rut_alumno: "18.999.000-1",
    alumno: {
      nombres: "Carlos Andrés",
      apellidos: "Díaz Muñoz",
      nombre_carrera: "Ingeniería en Computación e Informática"
    },
    id_asignatura: 1,
    descripcion_carta: "Necesito los créditos de libre elección y me fue bien en el ramo.",
    metodologia: "Hacer las guías que mande el profe.",
    puntuacion_etapa1: 65,
    puntuacion_etapa2: null,
    motivo_descarte: "Carta de motivación insuficiente y baja proactividad en metodología.", 
    fecha_descarte: "2024-11-20",
    rechazada_por_jefatura: false
  },
  {
    id: 104,
    rut_alumno: "21.000.111-9",
    alumno: {
      nombres: "Ana Belén",
      apellidos: "Rojas Lira",
      nombre_carrera: "Ingeniería Civil Informática"
    },
    id_asignatura: 2,
    descripcion_carta: "Me apasionan los algoritmos y creo que puedo aportar mucho explicando conceptos complejos como árboles y grafos de manera sencilla.",
    metodologia: "Utilizaré visualizadores gráficos de algoritmos y herramientas interactivas web para que los alumnos 'vean' cómo se mueve la data.",
    puntuacion_etapa1: 82,
    puntuacion_etapa2: null, 
    motivo_descarte: null,
    fecha_descarte: null,
    rechazada_por_jefatura: false
  },
  {
    id: 105,
    rut_alumno: "17.888.999-3",
    alumno: {
      nombres: "Roberto",
      apellidos: "Lagos M.",
      nombre_carrera: "Ingeniería Civil Informática"
    },
    id_asignatura: 2,
    descripcion_carta: "Soy repitente del ramo pero lo pasé a la segunda con buena nota. Creo que entiendo dónde se equivocan los que reprueban.",
    metodologia: "Clases expositivas.",
    puntuacion_etapa1: 70,
    puntuacion_etapa2: null,
    motivo_descarte: "Historial académico no cumple requisitos mínimos.",
    fecha_descarte: "2024-11-15",
    rechazada_por_jefatura: true 
  }
];

const MOCK_AYUDANTES: AyudanteActivoData[] = [
  {
    id: 201,
    rut_alumno: "19.555.444-3",
    alumno: { nombres: "Felipe", apellidos: "Arancibia" },
    asignatura: "Urologia II",
    periodo: "2024-2", 
    evaluacion: null 
  },
  {
    id: 202,
    rut_alumno: "18.111.222-1",
    alumno: { nombres: "Sofía", apellidos: "Vergara" },
    asignatura: "Urologia",
    periodo: "2024-2", 
    evaluacion: 65 
  },
  {
    id: 203,
    rut_alumno: "21.000.111-9",
    alumno: { nombres: "Pedro", apellidos: "Pascal" },
    asignatura: "Urologia II",
    periodo: "2024-2",
    evaluacion: 70
  }
];



export const CoordinadorAdmin = ({adminUser}:{adminUser:User}) => {
    const {data: coordinadores, isLoading: cargaCoordinadores} = useCoordinadoresTodos();
    const [rutSeleccionado, setRutSeleccionado] = useState<string>("");
    const [modalAbierto, setModalAbierto] = useState(true);
    const router = useRouter();
    
    /*const [busquedaCoordinador, setBusquedaCoordinador] = useState("");

    const coordinadoresFiltrados = useMemo(() => {
        if (!coordinadores) return [];
        return (coordinadores as CoordinadorData[]).filter(c => 
            `${c.nombres} ${c.apellidos}`.toLowerCase().includes(busquedaCoordinador.toLowerCase()) ||
            c.rut.includes(busquedaCoordinador)
        );
    }, [coordinadores, busquedaCoordinador]);*/

    const { data: postulantes, isLoading: cargaPostulantes } = usePostulantesCoordinador(rutSeleccionado || undefined);
    const { data: ayudantes, isLoading: cargaAyudantes } = useAyudantesActivos(rutSeleccionado || undefined);

    const coordinadorActual = coordinadores?.find((c: CoordinadorData) => c.rut === rutSeleccionado);

    const handleSeleccionar = (rut: string) => {
        setRutSeleccionado(rut);
        setModalAbierto(false);
    };

    const handleCerrarModal = () => {
        if (rutSeleccionado)
        {
            setModalAbierto(false);
        } else {
            router.push('/adminDashboard');
        }
    }

    return (
        <>
            <ModalSeleccionarCoordinadorAdmin 
                abierto={modalAbierto}
                onClose={handleCerrarModal}
                onSelect={handleSeleccionar}
                coordinadores={coordinadores as CoordinadorData[]}
                isLoading={cargaCoordinadores}
            />

            <div className="space-y-6">
                {rutSeleccionado && coordinadorActual && (
                    <div className="bg-blue-600 text-white p-4 rounded-xl shadow-md flex flex-col sm:flex-row justify-between items-center gap-4 animate-in slide-in-from-top-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-lg">
                                <Users className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-xs text-blue-100 uppercase font-semibold tracking-wider">Modo Supervisión</p>
                                <h2 className="text-lg font-bold leading-none">
                                    {coordinadorActual.nombres} {coordinadorActual.apellidos}
                                </h2>
                            </div>
                        </div>
                        
                        <button 
                            onClick={() => setModalAbierto(true)}
                            className="flex items-center gap-2 bg-white text-blue-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors shadow-sm"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Cambiar Coordinador
                        </button>
                    </div>
                )}

                {rutSeleccionado ? (
                    <div className="animate-in fade-in duration-500">
                        <CoordinadorDashboard 
                            user={adminUser} 
                            postulantes={MOCK_POSTULANTES} 
                            ayudantes={MOCK_AYUDANTES} 
                            loading={cargaPostulantes || cargaAyudantes} 
                        />
                    </div>
                ) : (
                    !modalAbierto && (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                            <Users className="w-12 h-12 mb-4 text-gray-300" />
                            <p className="text-lg font-medium">No se ha seleccionado ningún coordinador</p>
                            
                            <div className="flex gap-4 mt-4"> 
                                <button 
                                    onClick={() => router.push('/adminDashboard')}
                                    className="text-gray-500 hover:text-gray-700 hover:underline px-4 py-2"
                                >
                                    Volver al Panel
                                </button>

                                <button 
                                    onClick={() => setModalAbierto(true)}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Abrir selector
                                </button>
                            </div>
                        </div>
                    )
                )}
            </div>
        </>
    )

}