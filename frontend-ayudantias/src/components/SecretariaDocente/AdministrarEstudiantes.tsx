"use client";

import React, { useState, useMemo } from "react";
import { useAlumnos } from "@/hooks/useAlumnoProfile";
import { useDeshabilitarUsuario, useHabilitarUsuario } from "@/hooks/useUsuarios";
import { Search, ChevronLeft, UserX, UserCheck, Users } from 'lucide-react';

export default function AdministrarEstudiantes() {
    const { data: alumnos, isLoading, isError } = useAlumnos();
    const deshabilitar = useDeshabilitarUsuario();
    const habilitar = useHabilitarUsuario();

    const [busqueda, setBusqueda] = useState("");
    const [paginaActual, setPaginaActual] = useState(1);
    const [itemsPorPagina, setItemsPorPagina] = useState(10);

    const alumnosFiltrados = useMemo(() => {
        const t = busqueda.toLowerCase();
        return (alumnos || []).filter((u: any) =>
            `${u.rut} ${u.nombres} ${u.apellidos}`.toLowerCase().includes(t)
        );
    }, [busqueda, alumnos]);

    const totalPaginas = Math.max(1, Math.ceil(alumnosFiltrados.length / itemsPorPagina));
    const alumnosPaginados = useMemo(() => {
        const inicio = (paginaActual - 1) * itemsPorPagina;
        return alumnosFiltrados.slice(inicio, inicio + itemsPorPagina);
    }, [paginaActual, itemsPorPagina, alumnosFiltrados]);

    const BadgeStatus = ({ activo }: { activo: boolean }) => (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${activo ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
            {activo ? 'Habilitado' : 'Deshabilitado'}
        </span>
    );

    if (isLoading) return <div className="text-center py-10 text-gray-500">Cargando estudiantes...</div>;
    if (isError) return <div className="text-center py-10 text-red-500">Error al cargar los estudiantes.</div>;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 max-w-6xl mx-auto animate-in fade-in duration-500">

            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                    <Users className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Administrar Estudiantes</h2>
                    <p className="text-sm text-gray-500">Gestión de acceso y estado de alumnos.</p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Buscar por RUT o nombre..."
                        value={busqueda}
                        onChange={(e) => { setBusqueda(e.target.value); setPaginaActual(1); }}
                        className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                    />
                </div>

                <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-lg border border-gray-100">
                    <input
                        type="number"
                        min={1}
                        value={itemsPorPagina}
                        onChange={(e) => {
                            const n = Number(e.target.value);
                            if (n > 0) { setItemsPorPagina(n); setPaginaActual(1); }
                        }}
                        className="w-12 bg-white border border-gray-200 rounded text-sm font-semibold text-gray-700 text-center focus:ring-1 focus:ring-blue-500 outline-none py-1"
                    />
                    <span className="text-xs font-medium text-gray-500 pr-2">filas</span>
                    
                    <button
                        onClick={() => setPaginaActual(paginaActual - 1)}
                        disabled={paginaActual === 1}
                        className="p-2 rounded hover:bg-white hover:shadow-sm disabled:opacity-30 text-gray-600 transition-all"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-semibold text-gray-700 w-16 text-center">
                        {paginaActual} / {totalPaginas}
                    </span>
                    <button
                        onClick={() => setPaginaActual(paginaActual + 1)}
                        disabled={paginaActual === totalPaginas}
                        className="p-2 rounded hover:bg-white hover:shadow-sm disabled:opacity-30 text-gray-600 transition-all"
                    >
                        <ChevronLeft className="w-4 h-4 rotate-180" />
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-100">
                <table className="min-w-full text-left">
                    <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200 text-sm">
                        <tr>
                            <th className="py-4 px-5 w-1/4">RUT</th>
                            <th className="py-4 px-5 w-2/4">Nombre Completo</th>
                            <th className="py-4 px-5 text-center">Estado</th>
                            <th className="py-4 px-5 text-center w-1/4">Acción</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100 bg-white text-sm">
                        {alumnosPaginados.map((est: any, index: number) => (
                            <tr key={`${est.rut_alumno}-${index}`} className="hover:bg-blue-50/20 transition-colors">
                                <td className="py-4 px-5 font-semibold text-gray-900 text-base">{est.rut_alumno}</td>
                                <td className="py-4 px-5 text-gray-800 font-medium text-base">
                                    {est.nombres} {est.apellidos}
                                </td>
                                <td className="py-4 px-5 text-center">
                                    <BadgeStatus activo={!est.deshabilitado} />
                                </td>
                                <td className="py-4 px-5 text-center">
                                    {!est.deshabilitado ? (
                                        <button
                                            onClick={() => deshabilitar.mutate(est.rut_alumno)}
                                            className="flex items-center justify-center gap-2 w-full max-w-[140px] mx-auto bg-white border border-red-200 text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                                        >
                                            <UserX className="w-4 h-4" /> Deshabilitar
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => habilitar.mutate(est.rut_alumno)}
                                            className="flex items-center justify-center gap-2 w-full max-w-[140px] mx-auto bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                                        >
                                            <UserCheck className="w-4 h-4" /> Habilitar
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {alumnosPaginados.length === 0 && (
                            <tr>
                                <td colSpan={4} className="py-12 text-center text-gray-400 text-sm">
                                    No se encontraron estudiantes.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}