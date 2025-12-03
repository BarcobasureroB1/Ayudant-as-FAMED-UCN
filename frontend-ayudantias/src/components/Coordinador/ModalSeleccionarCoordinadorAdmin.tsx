import React, { useState, useMemo } from 'react';
import { CoordinadorData } from '@/hooks/useCoordinadores';
import { Search, User } from 'lucide-react';
 
interface Props {
    abierto: boolean;
    onClose: () => void;
    onSelect: (rut: string) => void;
    coordinadores: CoordinadorData[] | undefined;
    isLoading: boolean;
}

export const ModalSeleccionarCoordinadorAdmin = ({abierto, onClose, onSelect, coordinadores, isLoading }: Props) => {
    const [busqueda, setBusqueda] = useState("");

    const filtrados = useMemo(() => {
        if (!coordinadores)
        {
            return [];
        }

        return coordinadores.filter(c => 
            `${c.nombres} ${c.apellidos}`.toLowerCase().includes(busqueda.toLowerCase()) ||
             c.rut.includes(busqueda)
        );
    }, [coordinadores, busqueda]);

    if(!abierto)
    {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-200">
                
                <div className="p-5 bg-gray-50 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800">Seleccionar Coordinador</h3>
                    <p className="text-sm text-gray-500">Elige un coordinador para visualizar y gestionar sus postulantes.</p>
                    
                    <div className="mt-4 relative">
                        <Search className="absolute left-3 top-2.5 text-gray-800 w-4 h-4" />
                        <input 
                            type="text"
                            placeholder="Buscar por nombre o RUT..."
                            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 outline-none"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {isLoading ? (
                        <div className="p-8 text-center text-gray-500">Cargando coordinadores...</div>
                    ) : filtrados.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">No se encontraron resultados.</div>
                    ) : (
                        filtrados.map((coord) => (
                            <button
                                key={coord.rut}
                                onClick={() => onSelect(coord.rut)}
                                className="w-full flex items-center gap-3 p-3 hover:bg-blue-50 rounded-lg transition-colors text-left group"
                            >
                                <div className="bg-blue-100 p-2 rounded-full text-blue-600 group-hover:bg-blue-200">
                                    <User className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800 text-sm">
                                        {coord.nombres} {coord.apellidos}
                                    </p>
                                    <p className="text-xs text-gray-500">{coord.rut}</p>
                                </div>
                            </button>
                        ))
                    )}
                </div>

                <div className="p-3 border-t border-gray-100 bg-gray-50 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};