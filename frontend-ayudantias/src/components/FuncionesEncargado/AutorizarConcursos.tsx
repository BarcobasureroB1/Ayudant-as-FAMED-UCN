"use client";

import React, { useMemo, useState } from "react";
import api from "@/api/axios";
import { useAutorizarConcurso, useDenegarConcurso } from "@/hooks/useAsignaturas";

interface Asignatura {
    id: number;
    nombre: string;
    estado: string;
    semestre: number;
    nrc: string;
    abierta_postulacion: boolean;
}

export default function AdministrarUsuarios({
    onClose,
    asignaturasConcursos,
}: {
    onClose: () => void;
    asignaturasConcursos: Asignatura[];
}) {
    const autorizarConcurso = useAutorizarConcurso();
    const denegarConcurso = useDenegarConcurso();

    // -------------------------
    // ESTADOS
    // -------------------------
    const [busqueda, setBusqueda] = useState("");
    const [paginaActual, setPaginaActual] = useState(1);
    const [itemsPorPagina, setItemsPorPagina] = useState(5);


    const [selectedTipos, setSelectedTipos] = useState<Record<string, string>>(() => {
        const m: Record<string, string> = {};
        asignaturasConcursos.forEach((u) => (m[u.id] = u.estado));
        return m;
    });

    const [pending, setPending] = useState<{
        id: number;
        nombre: string;
        nuevoEstado: string;
    } | null>(null);


    const [showConfirmPopup, setShowConfirmPopup] = useState(false);


    // -------------------------
    // FILTRO DE ASIGNATURAS
    // -------------------------
    const asignaturasFiltradas = useMemo(() => {
        const t = busqueda.toLowerCase();
        return asignaturasConcursos.filter((u) =>
            `${u.id} ${u.nombre} ${u.estado}`.toLowerCase().includes(t)
        );
    }, [busqueda, asignaturasConcursos]);

    const totalPaginasFiltradas = Math.ceil(
    asignaturasFiltradas.length / (itemsPorPagina || 1)
    );

    // -------------------------
    // PAGINACION
    // -------------------------

    const asignaturasPaginadas = useMemo(() => {
        const inicio = (paginaActual - 1) * itemsPorPagina;
        return asignaturasFiltradas.slice(inicio, inicio + itemsPorPagina);
    }, [paginaActual, itemsPorPagina, asignaturasFiltradas]);

    // -------------------------
    // CONFIRMAR CAMBIO
    // -------------------------
    const confirmarCambio = async () => {
        if (!pending) return;
        await autorizarConcurso.mutateAsync(pending.id);
        setShowConfirmPopup(false);
    };

    // -------------------------
    // CANCELAR CAMBIO
    // -------------------------
    const cancelarCambio = () => {
        if (pending) {
            const id = pending.id;
            const tipoReal = asignaturasConcursos.find((u) => u.id === id)!.estado;

            // restaurar selector
            setSelectedTipos((prev) => ({ ...prev, [id]: tipoReal }));
        }

        setPending(null);
        setShowConfirmPopup(false);
    };

    // -------------------------
    // RENDER
    // -------------------------
    return (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 relative">

            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Administración de Usuarios</h2>
                <button
                    onClick={onClose}
                    className="px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                    Cerrar
                </button>
            </div>

            {/* BUSQUEDA */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                <input
                  type="text"
                  placeholder="Buscar asignatura..."
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
                    className="w-20 border border-gray-300 text-black rounded-md px-2 py-1 text-sm text-center"
                  />
                  <span className="text-sm text-gray-700">asignaturas</span>
                </div>

                {totalPaginasFiltradas > 1 && (
                  <div className="flex items-center gap-2 mt-2 sm:mt-0">
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
                      Página {paginaActual} de {totalPaginasFiltradas}
                    </span>

                    <button
                      onClick={() => setPaginaActual(paginaActual + 1)}
                      disabled={paginaActual === totalPaginasFiltradas}
                      className={`px-3 py-1 rounded-md text-sm border ${
                        paginaActual === totalPaginasFiltradas
                          ? "bg-gray-200 text-gray-400"
                          : "bg-blue-600 text-white"
                      }`}
                    >
                      Siguiente →
                    </button>
                  </div>
                )}
            </div>

            {/* TABLA */}
            <div className="overflow-y-auto max-h-[60vh]">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b text-black">
                            <th className="p-2">Nombre</th>
                            <th className="p-2">Estado</th>
                            <th className="p-2">Cambiar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {asignaturasPaginadas.map((u) => (
                            <tr key={u.id} className="border-b text-black">
                                <td className="p-2">{u.nombre}</td>
                                <td className="p-2">{u.estado}</td>
                                <td className="p-2">
                                    <button
                                        onClick={() => setShowConfirmPopup(true)}
                                        className="px-4 py-2 bg-blue-500 text-white rounded"
                                    >
                                        Aprobar solicitud de apertura
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* POPUP CONFIRMACION */}
            {showConfirmPopup && pending && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center text-black">
                    <div className="bg-white p-6 rounded-xl w-[350px]">
                        <h3 className="text-lg font-semibold mb-3">Confirmar Cambio</h3>
                        <p className="mb-4">
                            ¿Seguro que deseas aprobar la solicitud para
                            <b> {pending.nombre} </b>?
                        </p>

                        <div className="flex justify-between mt-4">
                            <button
                                onClick={cancelarCambio}
                                className="px-4 py-2 bg-gray-300 rounded"
                            >
                                Cancelar
                            </button>

                            <button
                                onClick={confirmarCambio}
                                className="px-4 py-2 bg-blue-500 text-white rounded"
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
