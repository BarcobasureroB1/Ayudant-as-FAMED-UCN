"use client";

import React, { useEffect, useState } from "react";
import Select from "react-select";
import { useDatosDepartamento } from "@/hooks/useDepartamento";
import { useUserProfile, User} from '@/hooks/useUserProfile';
import { useRouter } from "next/dist/client/components/navigation";


interface FormularioEditarPostulacionProps {
  datosUsuario: User;
}

const InfoCard = ({ title, children, className = "" }: { title: string; children?: React.ReactNode; className?: string }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">{title}</h3>
        {children}
    </div>
);

export default function AperturaConcursoSecreDepto({datosUsuario}: FormularioEditarPostulacionProps) {
  
    const { data: departamentoData, isLoading, isError } = useDatosDepartamento(datosUsuario.rut);
    
    const router = useRouter();

    useEffect(() => {
            if (isError || !departamentoData) {
                router.push("/login");
            }
        }, [isError, departamentoData, router]);
    
        if (isLoading) {
            return (
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Cargando...</p>
                    </div>
                </div>
            );
        }

        if (isError || !departamentoData) {
            return (
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Redirigiendo al login...</p>
                    </div>
                </div>
            );
        }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 max-w-3xl mx-auto">
      <InfoCard title={departamentoData.nombre}>
        
      </InfoCard>
    </div>
  );
}