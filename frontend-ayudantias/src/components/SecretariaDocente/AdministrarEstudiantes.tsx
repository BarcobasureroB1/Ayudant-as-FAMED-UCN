"use client";

import React, { useState, useMemo } from "react";
import { useAlumnos } from "@/hooks/useAlumnoProfile";
import { useDeshabilitarUsuario, useHabilitarUsuario } from "@/hooks/useUsuarios";

export default function AdministrarEstudiantes() {
    const { data: alumnos, isLoading, isError } = useAlumnos();
    const deshabilitar = useDeshabilitarUsuario();
    const habilitar = useHabilitarUsuario();

    const [busqueda, setBusqueda] = useState("");
    const [paginaActual, setPaginaActual] = useState(1);
    const [itemsPorPagina, setItemsPorPagina] = useState(5);

    const alumnosFiltrados = useMemo(() => {
        const t = busqueda.toLowerCase();

        return (alumnos || []).filter((u: any) =>
            `${u.rut} ${u.nombres} ${u.apellidos}`
                .toLowerCase()
                .includes(t)
        );
    }, [busqueda, alumnos]);

    const totalPaginas = Math.max(
        1,
        Math.ceil(alumnosFiltrados.length / itemsPorPagina)
    );

    const alumnosPaginados = useMemo(() => {
        const inicio = (paginaActual - 1) * itemsPorPagina;
        return alumnosFiltrados.slice(inicio, inicio + itemsPorPagina);
    }, [paginaActual, itemsPorPagina, alumnosFiltrados]);

    if (isLoading) {
        return <div className="text-center text-gray-600">Cargando estudiantes...</div>;
    }

    if (isError) {
        return <div className="text-center text-red-600">Error al cargar los estudiantes.</div>;
    }

    if (!alumnos || alumnos.length === 0) {
        return (
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 max-w-3xl mx-auto text-center text-gray-700">
                <h2 className="text-2xl font-semibold mb-3">Administrar Estudiantes</h2>
                <p className="text-lg">No hay estudiantes registrados todavía.</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 max-w-5xl mx-auto">

            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Administrar Estudiantes</h2>

            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">

                <input
                    type="text"
                    placeholder="Buscar por RUT o nombre..."
                    value={busqueda}
                    onChange={(e) => {
                        setBusqueda(e.target.value);
                        setPaginaActual(1);
                    }}
                    className="w-full sm:w-1/3 border border-gray-300 text-black rounded-md px-3 py-2 text-sm"
                />

                <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-700">Mostrar</label>
                    <input
                        type="number"
                        min={1}
                        value={isNaN(itemsPorPagina) ? "" : itemsPorPagina}
                        onChange={(e) => {
                            const n = Number(e.target.value);
                            if (n > 0) {
                                setItemsPorPagina(n);
                                setPaginaActual(1);
                            }
                        }}
                        className="w-20 border border-gray-300 rounded-md px-2 py-1 text-sm text-center text-black"
                    />
                    <span className="text-sm text-gray-700">estudiantes</span>
                </div>

                {alumnosFiltrados.length > 0 && totalPaginas > 1 && (
                    <div className="flex items-center gap-2">

                        <button
                            onClick={() => setPaginaActual(paginaActual - 1)}
                            disabled={paginaActual === 1}
                            className={`px-3 py-1 rounded-md text-sm border ${
                                paginaActual === 1
                                    ? "bg-gray-200 text-gray-400"
                                    : "bg-blue-600 text-white"
                            }`}
                        >
                            ← Anterior
                        </button>

                        <span className="text-sm text-gray-700">
                            Página {paginaActual} de {totalPaginas}
                        </span>

                        <button
                            onClick={() => setPaginaActual(paginaActual + 1)}
                            disabled={paginaActual === totalPaginas}
                            className={`px-3 py-1 rounded-md text-sm border ${
                                paginaActual === totalPaginas
                                    ? "bg-gray-200 text-gray-400"
                                    : "bg-blue-600 text-white"
                            }`}
                        >
                            Siguiente →
                        </button>
                    </div>
                )}
            </div>

            {alumnosFiltrados.length === 0 ? (
                <p className="text-center text-gray-600 py-6 text-lg">
                    No se encontraron estudiantes que coincidan con la búsqueda.
                </p>
            ) : (
                <table className="w-full border-collapse text-black">
                    <thead>
                        <tr className="bg-gray-100 text-left">
                            <th className="py-3 px-4 font-semibold text-gray-700 w-1/4">RUT</th>
                            <th className="py-3 px-4 font-semibold text-gray-700 w-2/4">Nombre</th>
                            <th className="py-3 px-4 font-semibold text-gray-700 text-center w-1/4">Acción</th>
                        </tr>
                    </thead>

                    <tbody>
                        {alumnosPaginados.map((est: any, index: number) => (
                            <tr
                                key={`${est.rut_alumno || "sin-rut"}-${index}`}
                                className="border-b hover:bg-gray-50 transition"
                            >
                                <td className="py-3 px-4">{est.rut_alumno}</td>
                                <td className="py-3 px-4">
                                    {est.nombres} {est.apellidos}
                                </td>

                                <td className="py-3 px-4 text-center">
                                    {!est.deshabilitado ? (
                                        <button
                                            onClick={() => deshabilitar.mutate(est.rut_alumno)}
                                            className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition"
                                        >
                                            Deshabilitar
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => habilitar.mutate(est.rut_alumno)}
                                            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition"
                                        >
                                            Habilitar
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

        </div>
    );
}

