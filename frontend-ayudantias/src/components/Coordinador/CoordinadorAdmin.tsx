"use client";
import React, { useState, useMemo } from 'react';
import {
    useCoordinadoresTodos,
    CoordinadorData,
    usePostulantesCoordinador,
    useAyudantesActivos
} from '@/hooks/useCoordinadores';
import { CoordinadorDashboard } from '@/app/coordinador/page';
import { User } from '@/hooks/useUserProfile';
import { ModalSeleccionarCoordinadorAdmin } from './ModalSeleccionarCoordinadorAdmin';
import { Users, RefreshCw } from 'lucide-react';

export const CoordinadorAdmin = ({adminUser}:{adminUser:User}) => {
    const {data: coordinadores, isLoading: cargaCoordinadores} = useCoordinadoresTodos();
    const [rutSeleccionado, setRutSeleccionado] = useState<string>("");
    const [modalAbierto, setModalAbierto] = useState(true);
    
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

    return (
        <>
            <ModalSeleccionarCoordinadorAdmin 
                abierto={modalAbierto}
                onClose={() => {
                    if (rutSeleccionado) setModalAbierto(false);
                }}
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
                            postulantes={postulantes} 
                            ayudantes={ayudantes} 
                            loading={cargaPostulantes || cargaAyudantes} 
                        />
                    </div>
                ) : (
                    !modalAbierto && (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                            <Users className="w-12 h-12 mb-4 text-gray-300" />
                            <p className="text-lg font-medium">No se ha seleccionado ningún coordinador</p>
                            <button 
                                onClick={() => setModalAbierto(true)}
                                className="mt-4 text-blue-600 hover:underline"
                            >
                                Abrir selector
                            </button>
                        </div>
                    )
                )}
            </div>
        </>
    )

}