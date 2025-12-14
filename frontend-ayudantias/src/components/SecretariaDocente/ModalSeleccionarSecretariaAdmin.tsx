"use client";
import React, { useState, useMemo } from 'react';
import {UsuarioData} from '@/hooks/useUsuarios';
import { Search, Briefcase } from 'lucide-react';

interface Props {
    abierto: boolean;
    onClose: () => void;
    onSelect: (rut: string, nombreCompleto: string) => void;
    secretarias: UsuarioData[] | undefined;
    isLoading: boolean;
}

export const ModalSeleccionarSecretariaAdmin = ({ abierto, onClose, onSelect, secretarias, isLoading }: Props) => {
    const [busqueda, setBusqueda] = useState("");

    const filtrados = useMemo(() => {
        if (!secretarias || !Array.isArray(secretarias)) {
            console.warn("Datos de secretarias inválidos o no son un array:", secretarias);
            return [];
        }

        console.log(secretarias);

        return secretarias.filter(s =>
            `${s.nombres} ${s.apellidos}`.toLowerCase().includes(busqueda.toLowerCase()) ||
            s.rut.includes(busqueda)
        );
    }, [secretarias, busqueda]);

    if (!abierto) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                
                <div className="p-5 bg-indigo-50 border-b border-indigo-100">
                    <h3 className="text-lg font-bold text-indigo-900">Seleccionar Secretari@ Docente</h3>
                    <p className="text-xs text-indigo-600 mb-3">Elija el/la funcionario/a responsable.</p>
                    
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o RUT..."
                            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {isLoading ? (
                        <div className="p-8 text-center text-gray-500">Cargando lista...</div>
                    ) : filtrados.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">No se encontraron resultados.</div>
                    ) : (
                        filtrados.map((sec) => (
                            <button
                                key={sec.rut}
                                onClick={() => onSelect(sec.rut, `${sec.nombres} ${sec.apellidos}`)}
                                className="w-full flex items-center gap-3 p-3 hover:bg-indigo-50 rounded-lg transition-colors text-left group border border-transparent hover:border-indigo-100"
                            >
                                <div className="bg-indigo-100 p-2 rounded-full text-indigo-600 group-hover:bg-indigo-200">
                                    <Briefcase className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800 text-sm">
                                        {sec.nombres} {sec.apellidos}
                                    </p>
                                    <p className="text-xs text-gray-500">{sec.rut}</p>
                                </div>
                            </button>
                        ))
                    )}
                </div>

                <div className="p-3 border-t bg-gray-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};