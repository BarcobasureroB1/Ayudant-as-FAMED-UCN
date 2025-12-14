import React, { useState } from 'react';
import { AyudanteActivoData } from '@/hooks/useCoordinadores';

interface EvaluacionAyudanteProps {
    ayudante: AyudanteActivoData;
    onClose: () => void;
    onConfirm: (nota: number) => void;
}

export const ModalEvaluacionAyudante = ({ayudante, onClose, onConfirm}: EvaluacionAyudanteProps) => {
    const [nota, setNota] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm(Number(nota) * 10);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 p-4">
             <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Evaluación Final de Desempeño</h3>
                <p className="text-sm text-gray-600 mb-4">Ayudante: {ayudante.alumno.nombres} {ayudante.alumno.apellidos}</p>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block font-semibold text-xs uppercase text-gray-500 mb-1">¿Como califica la nota del estudiante? (1.0 - 5.0)</label>
                        <input 
                            type="number" min="1" max="5" step="0.1" 
                            className="w-24 border border-gray-300 p-2 rounded-lg text-sm text-black"
                            value={nota}
                            onChange={(e) => setNota(e.target.value)}
                            required  
                        />
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">Finalizar</button>
                    </div>
                </form>
             </div>
        </div>
    );
};
