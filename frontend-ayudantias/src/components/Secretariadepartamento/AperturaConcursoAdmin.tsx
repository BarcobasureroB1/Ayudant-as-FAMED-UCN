"use client";

import React, { useState } from "react";
import { useAbrirConcurso, useCerrarConcurso } from "@/hooks/useAsignaturas";

interface AsignaturaData {
  id: number;
  nombre: string;
  estado: string;
  semestre: string;
  nrc: string;
  abierta_postulacion: boolean;
}

interface Props {
  asignaturas?: AsignaturaData[];
}

const InfoCard = ({
  title,
  children,
  className = "",
}: {
  title: string;
  children?: React.ReactNode;
  className?: string;
}) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
    <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100 text-center">
      {title}
    </h3>
    {children}
  </div>
);

export default function AperturaConcursoAdmin({ asignaturas = [] }: Props) {
  const [itemsPorPagina, setItemsPorPagina] = useState(5);
  const [paginaActual, setPaginaActual] = useState(1);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarPopup, setMostrarPopup] = useState(false);
  const [mensajePopup, setMensajePopup] = useState("");
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [idAConfirmar, setIdAConfirmar] = useState<string | null>(null);

  const { mutate: abrirConcurso } = useAbrirConcurso();
  const { mutate: cerrarConcurso } = useCerrarConcurso();

  const handleAbrirConcurso = (id: string) => {
    abrirConcurso(id, {
      onSuccess: () => {
        setMensajePopup("Solicitud de apertura de concurso enviada, espere a que se apruebe su solicitud. Una vez aprobada, aparecerá la opción para abrir la postulación.");
        setMostrarPopup(true);
      },
      onError: () => {
        setMensajePopup("Error al enviar la solicitud. Intente nuevamente.");
        setMostrarPopup(true);
      },
    });
  };

  const handleCerrarConcurso = (id: string) => {
    cerrarConcurso(id, {
      onSuccess: () => {
        setMensajePopup("Concurso cerrado exitosamente.");
        setMostrarPopup(true);
      },
      onError: () => {
        setMensajePopup("Error al cerrar el concurso. Intente nuevamente.");
        setMostrarPopup(true);
      },
    });
  };

  const confirmarCierre = (id: string) => {
    setIdAConfirmar(id);
    setMostrarConfirmacion(true);
  };

  const ejecutarCierreConfirmado = () => {
    if (idAConfirmar) {
      handleCerrarConcurso(idAConfirmar);
    }
    setMostrarConfirmacion(false);
    setIdAConfirmar(null);
  };

  const asignaturasFiltradas = asignaturas.filter((a) =>
    a.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const totalPaginasFiltradas = Math.ceil(asignaturasFiltradas.length / (itemsPorPagina || 1));
  const indiceInicio = (paginaActual - 1) * (itemsPorPagina || 1);
  const indiceFin = indiceInicio + (itemsPorPagina || 1);
  const asignaturasPaginadas = asignaturasFiltradas.slice(indiceInicio, indiceFin);

  const handleChangeItemsPorPagina = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    if (valor === "") {
      setItemsPorPagina(NaN);
      return;
    }
    const numero = Number(valor);
    if (numero > 0) {
      setItemsPorPagina(numero);
      setPaginaActual(1);
    }
  };

  const handlePaginaChange = (nuevaPagina: number) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginasFiltradas) {
      setPaginaActual(nuevaPagina);
    }
  };

  return (
    <div className="flex justify-center items-center w-full">
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-12">
        <InfoCard title="Todas las Asignaturas" className="shadow-lg">
          {asignaturas.length > 0 ? (
            <>
              <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                <input
                  type="text"
                  placeholder="Buscar asignatura..."
                  value={busqueda}
                  onChange={(e) => {
                    setBusqueda(e.target.value);
                    setPaginaActual(1);
                  }}
                  className="w-full sm:w-1/3 border border-gray-300 text-black rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex items-center gap-2">
                  <label htmlFor="itemsPorPagina" className="text-sm text-gray-700">
                    Mostrar
                  </label>
                  <input
                    id="itemsPorPagina"
                    type="number"
                    value={isNaN(itemsPorPagina) ? "" : itemsPorPagina}
                    onChange={handleChangeItemsPorPagina}
                    className="w-20 border border-gray-300 text-black rounded-md px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min={1}
                  />
                  <span className="text-sm text-gray-700">asignaturas</span>
                </div>
                {totalPaginasFiltradas > 1 && (
                  <div className="flex items-center gap-2 mt-2 sm:mt-0">
                    <button
                      onClick={() => handlePaginaChange(paginaActual - 1)}
                      disabled={paginaActual === 1}
                      className={`px-3 py-1 rounded-md text-sm font-medium border ${
                        paginaActual === 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      ← Anterior
                    </button>
                    <span className="text-sm text-gray-700">
                      Página {paginaActual} de {totalPaginasFiltradas}
                    </span>
                    <button
                      onClick={() => handlePaginaChange(paginaActual + 1)}
                      disabled={paginaActual === totalPaginasFiltradas}
                      className={`px-3 py-1 rounded-md text-sm font-medium border ${
                        paginaActual === totalPaginasFiltradas
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      Siguiente →
                    </button>
                  </div>
                )}
              </div>

              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full text-sm text-gray-700 bg-white">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-3 font-semibold text-center">Asignatura</th>
                      <th className="p-3 font-semibold text-center">Estado del concurso</th>
                      <th className="p-3 font-semibold text-center">Abrir/Cerrar concurso</th>
                    </tr>
                  </thead>
                  <tbody>
                    {asignaturasPaginadas.map((a) => (
                      <tr key={a.id} className="border-b hover:bg-gray-50 transition">
                        <td className="p-3 text-center">{a.nombre}</td>
                        <td className="p-3 text-center">{a.estado}</td>
                        <td className="p-3 text-center">
                          {(a.estado.trim().toLowerCase() === "cerrado" && !a.abierta_postulacion) && (
                            <button
                              onClick={() => handleAbrirConcurso(a.id.toString())}
                              className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition"
                            >
                              Abrir concurso
                            </button>
                          )}
                          {(a.estado.trim().toLowerCase() === "pendiente" && a.abierta_postulacion) && (
                            <button
                              onClick={() => {
                                alert(`Placeholder: abrir postulación para asignatura ID ${a.id}`);
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition"
                            >
                              Abrir concurso de postulación
                            </button>
                          )}
                          {["pendiente", "abierto"].includes(a.estado.trim().toLowerCase()) && (
                            <button
                              onClick={() => confirmarCierre(a.id.toString())}
                              className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition"
                            >
                              Cerrar/Cancelar concurso
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {mostrarConfirmacion && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                  <div className="bg-white rounded-lg shadow-lg p-6 w-11/12 sm:w-96 text-center">
                    <p className="text-gray-800 mb-4">
                      Para volver a abrir el concurso de postulación deberá aceptarse su solicitud, esto puede llevar un poco de tiempo.<br/><br/>
                      ¿Está seguro/a de cancelar/cerrar este concurso?
                    </p>
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={ejecutarCierreConfirmado}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
                      >
                        Sí, cancelar concurso
                      </button>
                      <button
                        onClick={() => setMostrarConfirmacion(false)}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md"
                      >
                        No, volver
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {mostrarPopup && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                  <div className="bg-white rounded-lg shadow-lg p-6 w-11/12 sm:w-96 text-center">
                    <p className="text-gray-800 mb-4">{mensajePopup}</p>
                    <button
                      onClick={() => setMostrarPopup(false)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-600 text-center">No hay asignaturas disponibles.</p>
          )}
        </InfoCard>
      </div>
    </div>
  );
}
