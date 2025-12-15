import React, { useState } from 'react';
import { PostulanteCoordinador } from '@/hooks/useCoordinadores';

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
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Evaluación Técnica</h3>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-5 text-sm text-gray-700 border border-gray-100 space-y-2">
                    <p><strong className="text-gray-900">Carta:</strong> {postulante.descripcion_carta}</p>
                    <p><strong className="text-gray-900">Metodología:</strong> {postulante.metodologia}</p>
                </div>

                <div className="mb-5">
                    <label className="block font-semibold text-sm mb-2 text-gray-700">Rúbrica (Carta y Plan):</label>
                    <select 
                        className="w-full border border-gray-300 p-2.5 rounded-lg text-sm text-black focus:ring-2 focus:ring-blue-500"
                        value={rubrica}
                        onChange={(e) => setRubrica(Number(e.target.value))}
                    >
                        <option value={0}>Seleccione puntaje...</option>
                        <option value={5}>5 Pts - Excelente (Formal, completo)</option>
                        <option value={3}>3 Pts - Bueno (Estándar)</option>
                        <option value={2}>2 Pts - Regular (Incompleto)</option>
                        <option value={1}>1 Pt - Insuficiente</option>
                    </select>
                </div>

                <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
                    <div>
                        <span className="font-bold text-blue-800 text-sm flex items-center gap-2">
                            Postulante Preferencial
                        </span>
                        <p className="text-xs text-blue-600 mt-0.5">+5 puntos extra al total.</p>
                    </div>
                    <input 
                        type="checkbox" 
                        checked={esPreferencial} 
                        onChange={(e) => setEsPreferencial(e.target.checked)} 
                        className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500" 
                    />
                </div>

                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">Cancelar</button>
                    <button onClick={handleGuardar} disabled={rubrica === 0} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50">Guardar</button>
                </div>
            </div>
        </div>
    );
}
