import React, { useState } from 'react';
import { PostulanteCoordinador } from '@/hooks/useCoordinadores';
import { Star, FileText, CheckCircle2, Award, X, PenTool } from 'lucide-react';

interface EvaluacionPostulanteProps {
    postulante: PostulanteCoordinador;
    onClose: () => void;
    onConfirm: (total: number) => void;
}

export const ModalEvaluacionPostulante = ({postulante, onClose, onConfirm}: EvaluacionPostulanteProps) => {
    const [rubrica, setRubrica ] = useState(0);
    const [esPreferencial, setEsPreferencial] = useState(false);

    const handleGuardar = () => {
        const total = rubrica + (esPreferencial ? 5:0);
        onConfirm(total);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                
                {/* 1. Header */}
                <div className="bg-white px-6 py-5 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 rounded-lg">
                            <Star className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Evaluación Técnica</h3>
                            <p className="text-xs text-gray-500">Califica la postulación del alumno.</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* 2. Contenido Scrollable */}
                <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar bg-gray-50/50">
                    
                    {/* Antecedentes del Alumno */}
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
                        <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-2">
                            <FileText className="w-4 h-4 text-gray-500" /> Antecedentes a Evaluar
                        </h4>
                        
                        <div className="space-y-3">
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <span className="text-xs font-bold text-indigo-600 uppercase block mb-1">Carta de Interés</span>
                                <p className="text-sm text-gray-700 leading-relaxed italic">
                                    &quot;{postulante.descripcion_carta}&quot;
                                </p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <span className="text-xs font-bold text-indigo-600 uppercase block mb-1">Metodología</span>
                                <p className="text-sm text-gray-700 leading-relaxed">
                                    {postulante.metodologia}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Formulario Evaluación */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                <PenTool className="w-4 h-4 text-gray-400"/> Rúbrica de Evaluación
                            </label>
                            <div className="relative">
                                <select 
                                    className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block p-3 outline-none transition-all shadow-sm cursor-pointer"
                                    value={rubrica}
                                    onChange={(e) => setRubrica(Number(e.target.value))}
                                >
                                    <option value={0}>Seleccionar puntaje...</option>
                                    <option value={5}>5 Pts - Excelente (Formal, completo)</option>
                                    <option value={3}>3 Pts - Bueno (Estándar)</option>
                                    <option value={2}>2 Pts - Regular (Incompleto)</option>
                                    <option value={1}>1 Pt - Insuficiente</option>
                                </select>
                            </div>
                        </div>

                        {/* Tarjeta Preferencial Interactiva */}
                        <div 
                            className={`flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer select-none ${esPreferencial ? 'bg-amber-50 border-amber-200 shadow-sm' : 'bg-white border-gray-200 hover:border-gray-300'}`}
                            onClick={() => setEsPreferencial(!esPreferencial)}
                        >
                            <div className={`mt-0.5 p-1 rounded-md border flex items-center justify-center transition-colors ${esPreferencial ? 'bg-amber-500 border-amber-500' : 'bg-white border-gray-300'}`}>
                                <CheckCircle2 className={`w-4 h-4 ${esPreferencial ? 'text-white' : 'text-transparent'}`} />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-center">
                                    <span className={`text-sm font-bold ${esPreferencial ? 'text-amber-800' : 'text-gray-700'}`}>
                                        Postulante Preferencial
                                    </span>
                                    {esPreferencial && <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">+5 pts</span>}
                                </div>
                                <p className={`text-xs mt-1 ${esPreferencial ? 'text-amber-700' : 'text-gray-500'}`}>
                                    Marca esta opción si el alumno cuenta con recomendación explícita o cumple criterios de prioridad.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Resumen de Puntaje Dinámico */}
                    {rubrica > 0 && (
                        <div className="flex items-center justify-between bg-indigo-600 p-4 rounded-xl shadow-lg animate-in fade-in slide-in-from-bottom-2">
                            <span className="text-white font-medium text-sm flex items-center gap-2">
                                <Award className="w-5 h-5 text-indigo-200" /> Resultado Final
                            </span>
                            <span className="text-2xl font-bold text-white">
                                {rubrica + (esPreferencial ? 5 : 0)} <span className="text-sm font-normal text-indigo-200">pts</span>
                            </span>
                        </div>
                    )}
                </div>

                {/* 3. Footer */}
                <div className="bg-white px-6 py-4 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 z-10">
                    <button 
                        onClick={onClose} 
                        className="px-5 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl text-sm transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleGuardar} 
                        disabled={rubrica === 0} 
                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
}