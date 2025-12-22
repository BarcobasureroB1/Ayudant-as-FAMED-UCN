import { PostulanteCoordinador } from '@/hooks/useCoordinadores';
import React from 'react';
import { 
    BookOpen, User, FileText, CheckCircle2, 
    Briefcase, X 
} from 'lucide-react';

interface Props {
    postulante: PostulanteCoordinador;
    onClose: () => void;
}

export const ModalDetallePostulacion = ({ postulante, onClose }: Props) => {
    if (!postulante) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in" onClick={onClose}>
            <div 
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden border border-gray-100"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-white px-6 py-5 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Detalle de Postulación</h3>
                            <p className="text-xs text-gray-500">Revisa la información completa del postulante.</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Contenido Scrollable */}
                <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar bg-gray-50/50">
                    
                    {/* Información Principal (Grid) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Asignatura */}
                        <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm flex items-start gap-3">
                            <div className="p-2 bg-blue-50 rounded-lg shrink-0">
                                <BookOpen className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">Asignatura</span>
                                <p className="text-sm font-bold text-gray-900 mt-0.5">{postulante.nombre_asignatura || postulante.id_asignatura}</p>
                            </div>
                        </div>

                        {/* Alumno */}
                        <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm flex items-start gap-3">
                            <div className="p-2 bg-indigo-50 rounded-lg shrink-0">
                                <User className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide">Postulante</span>
                                <p className="text-sm font-bold text-gray-900 mt-0.5">{postulante.alumno?.nombres} {postulante.alumno?.apellidos}</p>
                                <p className="text-xs text-gray-500">{postulante.rut_alumno}</p>
                            </div>
                        </div>
                    </div>

                    {/* Carta de Intención */}
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                        <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-500" /> Carta de Intención
                        </h4>
                        <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border border-gray-100">
                            {postulante.descripcion_carta || <span className="italic text-gray-400">Sin descripción disponible.</span>}
                        </div>
                    </div>

                    {/* Plan de Trabajo (Grid) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Metodología */}
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                            <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Metodología
                            </h4>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                {postulante.metodologia || <span className="italic text-gray-400">No especificada.</span>}
                            </p>
                        </div>

                        {/* Actividades */}
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                            <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-orange-500" /> Actividades
                            </h4>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                {postulante.actividad || <span className="italic text-gray-400">No especificada.</span>}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-white px-6 py-4 border-t border-gray-100 flex justify-end sticky bottom-0 z-10">
                    <button 
                        onClick={onClose} 
                        className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors text-sm"
                    >
                        Cerrar Ventana
                    </button>
                </div>
            </div>
        </div>
    )
}