import React from 'react';
import { useComprobarCurriculum } from '@/hooks/useCurriculum';
import { 
    User, Mail, Phone, MapPin, Calendar, GraduationCap, 
    BookOpen, Award, Beaker, Briefcase, FileText, Check, LayoutDashboard 
} from 'lucide-react';

interface ModalVerCurriculumProps {
    rut: string;
    onClose: () => void;
}

// Badge Component simple
const Badge = ({ children, color = "blue" }: { children: React.ReactNode, color?: string }) => {
    const colorClasses: {[key: string]: string} = {
        blue: "bg-blue-50 text-blue-700 border-blue-100",
        purple: "bg-purple-50 text-purple-700 border-purple-100",
        orange: "bg-orange-50 text-orange-700 border-orange-100",
        green: "bg-emerald-50 text-emerald-700 border-emerald-100",
        gray: "bg-gray-100 text-gray-700 border-gray-200"
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClasses[color] || colorClasses.blue}`}>
            {children}
        </span>
    );
};

export const ModalVerCurriculum = ({ rut, onClose}: ModalVerCurriculumProps) => {
    const { data: curriculum, isLoading } = useComprobarCurriculum(rut);

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4" onClick={onClose}>
            <div 
                className="bg-white rounded-3xl shadow-2xl w-full max-w-[1000px] flex flex-col max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 1. Header con botón cerrar */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-white sticky top-0 z-10">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        Curriculum Vitae
                    </h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                        ✕
                    </button>
                </div>

                {/* 2. Contenido Scrollable */}
                <div className="overflow-y-auto p-0 flex-1 custom-scrollbar bg-gray-50/50">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
                            <p className="text-gray-500 font-medium">Cargando perfil...</p>
                        </div>
                    ) : !curriculum ? (
                        <div className="flex flex-col items-center justify-center h-64 text-center p-8">
                            <div className="bg-gray-100 p-4 rounded-full mb-3">
                                <User className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Sin Información</h3>
                            <p className="text-gray-500">El estudiante no ha completado su currículum aún.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col lg:flex-row">
                            
                            {/* COLUMNA IZQUIERDA (Sidebar - Datos Personales) */}
                            <div className="w-full lg:w-80 bg-white border-r border-gray-100 p-6 lg:p-8 space-y-6">
                                {/* Avatar e Identidad */}
                                <div className="text-center">
                                    <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl mx-auto flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-200 mb-4">
                                        {curriculum.nombres?.charAt(0)}{curriculum.apellidos?.charAt(0)}
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 leading-tight">
                                        {curriculum.nombres} {curriculum.apellidos}
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1 font-medium">{curriculum.usuario.rut}</p>
                                    <div className="mt-3 flex justify-center">
                                        <Badge color="blue">{curriculum.carrera}</Badge>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 my-4"></div>

                                {/* Contacto */}
                                <div className="space-y-4 text-sm">
                                    <div className="flex items-start gap-3">
                                        <Mail className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 uppercase">Correo</p>
                                            <p className="text-gray-900 break-all font-medium">{curriculum.correo}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Phone className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 uppercase">Celular</p>
                                            <p className="text-gray-900 font-medium">{curriculum.Num_Celular || "No indicado"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 uppercase">Ubicación</p>
                                            <p className="text-gray-900 font-medium">{curriculum.ciudad}, {curriculum.comuna}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Calendar className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 uppercase">Nacimiento</p>
                                            <p className="text-gray-900 font-medium">{curriculum.fecha_nacimiento}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Resumen / Otros */}
                                {curriculum.otros && (
                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mt-6">
                                        <h4 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1 mb-2">
                                            <LayoutDashboard className="w-3 h-3" /> Resumen
                                        </h4>
                                        <p className="text-sm text-gray-700 leading-relaxed italic">
                                            &quot;{curriculum.otros}&quot;
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* COLUMNA DERECHA (Contenido Principal) */}
                            <div className="flex-1 p-6 lg:p-8 space-y-8 bg-white lg:bg-transparent">
                                
                                {/* 1. AYUDANTÍAS */}
                                {(curriculum.usuario.ayudantias?.length > 0) && (
                                    <section>
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                                <BookOpen className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <h4 className="text-lg font-bold text-gray-900">Historial de Ayudantías</h4>
                                        </div>
                                        <div className="grid gap-3">
                                            {curriculum.usuario.ayudantias.map((ayu: any) => (
                                                <div key={ayu.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-blue-300 transition-colors group">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h5 className="font-bold text-gray-900">{ayu.nombre_asig}</h5>
                                                            <p className="text-sm text-gray-500 mt-0.5">Coordinador: {ayu.nombre_coordinador}</p>
                                                        </div>
                                                        {ayu.evaluacion && (
                                                            <Badge color="blue">Nota: {ayu.evaluacion}</Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* 2. CURSOS Y TÍTULOS */}
                                {(curriculum.usuario.titulos?.length > 0) && (
                                    <section>
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                                                <Award className="w-4 h-4 text-purple-600" />
                                            </div>
                                            <h4 className="text-lg font-bold text-gray-900">Cursos y Títulos</h4>
                                        </div>
                                        <div className="grid gap-3">
                                            {curriculum.usuario.titulos.map((titulo: any) => (
                                                <div key={titulo.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-purple-300 transition-colors">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h5 className="font-bold text-gray-900">{titulo.nombre_asig}</h5>
                                                            <p className="text-sm text-gray-500 mt-0.5">{titulo.n_coordinador}</p>
                                                        </div>
                                                        {titulo.evaluacion && (
                                                            <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded-md">{titulo.evaluacion}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* 3. ACTIVIDADES (CIENTÍFICAS Y EXTRA) */}
                                {(curriculum.usuario.actividades_cientificas?.length > 0 || curriculum.usuario.actividades_extracurriculares?.length > 0) && (
                                    <section>
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                                                <Beaker className="w-4 h-4 text-orange-600" />
                                            </div>
                                            <h4 className="text-lg font-bold text-gray-900">Actividades Extra-académicas</h4>
                                        </div>
                                        <div className="space-y-4 pl-2 border-l-2 border-gray-100 ml-3">
                                            
                                            {/* Científicas */}
                                            {curriculum.usuario.actividades_cientificas?.map((act: any) => (
                                                <div key={act.id} className="relative pl-6">
                                                    <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-orange-400"></div>
                                                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                                        <h5 className="font-bold text-gray-900">{act.nombre}</h5>
                                                        <p className="text-xs font-bold text-orange-600 uppercase mb-2">{act.periodo_participacion}</p>
                                                        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100">{act.descripcion}</p>
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Extracurriculares */}
                                            {curriculum.usuario.actividades_extracurriculares?.map((extra: any) => (
                                                <div key={extra.id} className="relative pl-6">
                                                    <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-green-500"></div>
                                                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                                        <h5 className="font-bold text-gray-900">{extra.nombre}</h5>
                                                        <div className="flex justify-between items-center mb-2">
                                                            <p className="text-sm text-gray-500">{extra.docente}</p>
                                                            <p className="text-xs font-bold text-green-600 uppercase">{extra.periodo_participacion}</p>
                                                        </div>
                                                        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100">{extra.descripcion}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};