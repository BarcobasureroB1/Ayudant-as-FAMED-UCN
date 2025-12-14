import React, { useState } from 'react';
import { PostulanteCoordinadorData, AyudanteActivoData } from '@/hooks/useCoordinadores';

interface DescarteProps {
    onClose: () => void;
    onConfirm: (motivo: string) => void;
}


export const ModalDescarte = ({onClose, onConfirm}: DescarteProps) => {
    const [motivo, setMotivo] = useState("");

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4 text-red-600">
                    Descartar Postulante
                </h3>
                <p className="mb-4 text-sm text-gray-600">
                    Esta acción eliminará al postulante del proceso. Se registrará la fecha actual.
                </p>
                <textarea 
                    className="w-full border border-gray-300 p-3 rounded-lg mb-4 h-24 resize-none text-sm text-black"
                    placeholder="Motivo obligatorio (Ej: Disponibilidad horaria...)"
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                />
                <div className="flex justify-end gap-3">
                    <button 
                        onClick={onClose} 
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={() => onConfirm(motivo)} 
                        disabled={!motivo.trim()}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm disabled:opacity-50"
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
};