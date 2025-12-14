import { PostulanteCoordinadorData } from '@/hooks/useCoordinadores';
import React from 'react';

interface Props {
    postulante: PostulanteCoordinadorData;
    onClose: () => void;
}

export const ModalDetallePostulacion = ({ postulante, onClose }: Props) => {
    if (!postulante)
    {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-800">Detalle Postulación</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">✕</button>
                </div>
                <div className="p-6 overflow-y-auto space-y-4 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-3 rounded-lg">
                            <span className="text-xs font-bold text-blue-600 uppercase block mb-1">Asignatura</span>
                            <p className="text-sm font-semibold text-gray-800">{postulante.nombre_asignatura || postulante.id_asignatura}</p>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg">
                            <span className="text-xs font-bold text-purple-600 uppercase block mb-1">Alumno</span>
                            <p className="text-sm font-semibold text-gray-800">{postulante.alumno?.nombres} {postulante.alumno?.apellidos}</p>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-bold text-gray-700 mb-2 border-b border-gray-100 pb-1">Carta de Intención / Descripción</h4>
                        <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                            {postulante.descripcion_carta || "Sin descripción."}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-bold text-gray-700 mb-2 border-b border-gray-100 pb-1">Metodología Propuesta</h4>
                        <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                            {postulante.metodologia || "No especificada."}
                        </div>
                    </div>
                     <div>
                        <h4 className="text-sm font-bold text-gray-700 mb-2 border-b border-gray-100 pb-1">Actividades</h4>
                        <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                            {postulante.actividad || "No especificada."}
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    )
}