"use client";
import React, { useState} from 'react';
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
import { useRouter } from 'next/navigation';


export const CoordinadorAdmin = ({adminUser}:{adminUser:User}) => {
    const {data: coordinadores, isLoading: cargaCoordinadores} = useCoordinadoresTodos();
    const [rutSeleccionado, setRutSeleccionado] = useState<string>("");
    const [modalAbierto, setModalAbierto] = useState(true);
    const router = useRouter();
    
    const { data: postulantes, isLoading: cargaPostulantes } = usePostulantesCoordinador(rutSeleccionado || undefined);
    const { data: ayudantes, isLoading: cargaAyudantes } = useAyudantesActivos(rutSeleccionado || undefined);

    const coordinadorActual = coordinadores?.find((c: CoordinadorData) => c.rut === rutSeleccionado);

    const handleSeleccionar = (rut: string) => {
        setRutSeleccionado(rut);
        setModalAbierto(false);
    };

    const handleCerrarModal = () => {
        if (rutSeleccionado)
        {
            setModalAbierto(false);
        } else {
            router.push('/adminDashboard');
        }
    }

    const adminBarra = (
        rutSeleccionado && coordinadorActual ? (
            <div className="bg-blue-100 border border-blue-100 rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                        <Users className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs text-blue-600 font-bold uppercase">Modo Supervisión: Coordinador</p>
                        <p className="text-sm font-bold text-gray-800">
                            {coordinadorActual.nombres} {coordinadorActual.apellidos}
                            <span className="text-gray-500 font-normal ml-1">
                                (Rut: {coordinadorActual.rut})
                            </span>
                        </p>
                    </div>
                </div>
                
                <button 
                    onClick={() => setModalAbierto(true)}
                    className="flex items-center gap-2 bg-white text-blue-600 px-3 py-1.5 rounded-md text-xs font-medium border border-blue-200 hover:bg-blue-50 transition"
                >
                    <RefreshCw className="w-4 h-4" />
                    Cambiar
                </button>
            </div>
        ) : null
    );

    return (
        <>
            <ModalSeleccionarCoordinadorAdmin 
                abierto={modalAbierto}
                onClose={handleCerrarModal}
                onSelect={handleSeleccionar}
                coordinadores={coordinadores as CoordinadorData[]}
                isLoading={cargaCoordinadores}
            />

            <div className="space-y-6">
                {rutSeleccionado ? (
                    <div className="animate-in fade-in duration-500">
                        <CoordinadorDashboard 
                            user={adminUser} 
                            postulantes={postulantes} 
                            ayudantes={ayudantes} 
                            loading={cargaPostulantes || cargaAyudantes} 
                            adminBar={adminBarra}
                        />
                    </div>
                ) : (
                    !modalAbierto && (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                            <Users className="w-12 h-12 mb-4 text-gray-300" />
                            <p className="text-lg font-medium">No se ha seleccionado ningún coordinador</p>
                            
                            <div className="flex gap-4 mt-4"> 
                                <button 
                                    onClick={() => router.push('/adminDashboard')}
                                    className="text-gray-500 hover:text-gray-700 hover:underline px-4 py-2"
                                >
                                    Volver al Panel
                                </button>

                                <button 
                                    onClick={() => setModalAbierto(true)}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Abrir selector
                                </button>
                            </div>
                        </div>
                    )
                )}
            </div>
        </>
    )

}