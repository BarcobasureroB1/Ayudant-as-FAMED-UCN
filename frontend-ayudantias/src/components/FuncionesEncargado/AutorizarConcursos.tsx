"use client";

import React, { useMemo, useState } from "react";
import { useAutorizarConcurso, useDenegarConcurso } from "@/hooks/useAsignaturas";

interface Asignatura {
  id: number;
  nombre: string;
  estado: string;
  semestre: number;
  nrc: string;
  abierta_postulacion: boolean;
}

export default function AdministrarAsignaturas({
  onClose,
  asignaturasConcursos,
  mostrar,
}: {
  onClose: () => void;
  asignaturasConcursos: Asignatura[];
  mostrar: boolean;
}) {
  const autorizarConcurso = useAutorizarConcurso();
  const denegarConcurso = useDenegarConcurso();

  // -------------------------
  // ESTADOS
  // -------------------------
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina, setItemsPorPagina] = useState(5);

  const [pending, setPending] = useState<{
    id: number;
    nombre: string;
    accion: "aprobar" | "denegar";
  } | null>(null);

  const [showConfirmPopup, setShowConfirmPopup] = useState(false);

  // -------------------------
  // FILTRADO
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
  // PAGINACIÓN
  // -------------------------
  const asignaturasPaginadas = useMemo(() => {
    const inicio = (paginaActual - 1) * itemsPorPagina;
    return asignaturasFiltradas.slice(inicio, inicio + itemsPorPagina);
  }, [paginaActual, itemsPorPagina, asignaturasFiltradas]);

  // -------------------------
  // CONFIRMAR ACCIÓN
  // -------------------------
  const confirmarCambio = async () => {
    if (!pending) return;

    if (pending.accion === "aprobar") {
      await autorizarConcurso.mutateAsync(pending.id);
    } else {
      await denegarConcurso.mutateAsync(pending.id);
    }

    setShowConfirmPopup(false);
    setPending(null);
  };

  const cancelarCambio = () => {
    setPending(null);
    setShowConfirmPopup(false);
  };

  const anyLoading =
    autorizarConcurso.isPending || denegarConcurso.isPending;

  // -------------------------
  // RENDER
  // -------------------------
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 relative">

      
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Administración de Asignaturas
        </h2>
        {mostrar && (
        <button
          onClick={onClose}
          className="px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600"
        >
          Cerrar
        </button>
        )}
      </div>

      {/* BUSQUEDA + CONTROLES */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">

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
            className="w-20 border border-gray-300 rounded-md px-2 py-1 text-sm text-center text-black"
          />
          <span className="text-sm text-gray-700">asignaturas</span>
        </div>

        {/* PAGINACION */}
        {totalPaginasFiltradas > 1 && (
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
      <div className="overflow-y-auto max-h-[60vh] flex justify-center">
        <table className="w-full max-w-[900px] mx-auto text-left">
          <thead>
            <tr className="border-b text-black">
              <th className="p-2">Nombre</th>
              <th className="p-2">Estado</th>
              <th className="p-2 text-center">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {asignaturasPaginadas.map((u) => (
              <tr key={u.id} className="border-b text-black">
                <td className="p-2">{u.nombre}</td>
                <td className="p-2">{u.estado}</td>

                <td className="p-2 flex justify-center gap-3">

                  <button
                    disabled={anyLoading}
                    onClick={() => {
                      setPending({
                        id: u.id,
                        nombre: u.nombre,
                        accion: "aprobar",
                      });
                      setShowConfirmPopup(true);
                    }}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300"
                  >
                    Aprobar
                  </button>

                  <button
                    disabled={anyLoading}
                    onClick={() => {
                      setPending({
                        id: u.id,
                        nombre: u.nombre,
                        accion: "denegar",
                      });
                      setShowConfirmPopup(true);
                    }}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-300"
                  >
                    Denegar
                  </button>

                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* POPUP CONFIRMACION */}
      {showConfirmPopup && pending && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center text-black z-50">
          <div className="bg-white p-6 rounded-xl w-[350px] shadow-xl">

            <h3 className="text-lg font-semibold mb-3">
              Confirmar acción
            </h3>

            <p className="mb-4">
              ¿Seguro que deseas{" "}
              <b>
                {pending.accion === "aprobar" ? "aprobar" : "denegar"}
              </b>{" "}
              la solicitud para <b>{pending.nombre}</b>?
            </p>

            <div className="flex justify-between mt-4">
              <button
                onClick={cancelarCambio}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>

              <button
                onClick={confirmarCambio}
                disabled={anyLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300"
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
