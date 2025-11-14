"use client";

import React, { useState } from "react";
import Select from "react-select";
import { useAsignarCoordinador, useQuitarCoordinador, useCoordinadoresTodos } from "../../hooks/useCoordinadores";

interface CoordinadorData {
  id: number;
  rut: string;
  nombres: string;
  apellidos: string;
  actual: boolean;
}

interface AsignaturaCoordinadoresData {
  id: number;
  nombre: string;
  estado: string;
  semestre: string;
  nrc: string;
  abierta_postulacion: boolean;
  coordinadores: CoordinadorData[];
}

interface Props {
  asignaturas?: AsignaturaCoordinadoresData[];
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

export default function GestionCoordinadores({ asignaturas = [] }: Props) {
  const [itemsPorPagina, setItemsPorPagina] = useState(5);
  const [paginaActual, setPaginaActual] = useState(1);
  const [busqueda, setBusqueda] = useState("");

  
  const [asignaturaSeleccionada, setAsignaturaSeleccionada] =
    useState<AsignaturaCoordinadoresData | null>(null);

  
  const [confirmarQuitar, setConfirmarQuitar] = useState<{
    asignaturaId: number;
    rut: string;
  } | null>(null);

  
  const [nuevoCoordinador, setNuevoCoordinador] = useState<any>(null);

  
  const { data: coordinadoresTodos = [] } = useCoordinadoresTodos();
  const asignarCoordinador = useAsignarCoordinador();
  const quitarCoordinador = useQuitarCoordinador();

  
  const asignaturasFiltradas = asignaturas.filter((a) =>
    a.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const totalPaginasFiltradas = Math.ceil(
    asignaturasFiltradas.length / (itemsPorPagina || 1)
  );

  const indiceInicio = (paginaActual - 1) * (itemsPorPagina || 1);
  const asignaturasPaginadas = asignaturasFiltradas.slice(
    indiceInicio,
    indiceInicio + (itemsPorPagina || 1)
  );

  
  const obtenerCoordinadoresDisponibles = (asignatura: AsignaturaCoordinadoresData) => {
    const asignadosRut = new Set(asignatura.coordinadores.map((c) => c.rut));
    return coordinadoresTodos.filter((c: CoordinadorData) => !asignadosRut.has(c.rut));
  };

  
  const handleAgregar = () => {
    if (!nuevoCoordinador || !asignaturaSeleccionada) return;

    asignarCoordinador.mutate(
      {
        id_asignatura: asignaturaSeleccionada.id,
        rut_coordinador: nuevoCoordinador.value,
      },
      {
        onSuccess: () => {
          
          const coordinador = coordinadoresTodos.find(
            (c: CoordinadorData) => c.rut === nuevoCoordinador.value
          );

          
          if (coordinador) {
            setAsignaturaSeleccionada((prev) =>
              prev
                ? {
                    ...prev,
                    coordinadores: [...prev.coordinadores, coordinador],
                  }
                : prev
            );
          }

          setNuevoCoordinador(null);
        },
      }
    );
  };


  
  const handleConfirmarQuitar = () => {
    if (!confirmarQuitar) return;

    quitarCoordinador.mutate(
      {
        id_asignatura: String(confirmarQuitar.asignaturaId),
        rut_coordinador: confirmarQuitar.rut,
      },
      {
        onSuccess: () => {
          
          setAsignaturaSeleccionada((prev) =>
            prev
              ? {
                  ...prev,
                  coordinadores: prev.coordinadores.filter(
                    (c) => c.rut !== confirmarQuitar.rut
                  ),
                }
              : prev
          );

          setConfirmarQuitar(null);
        },
      }
    );
  };


  return (
    <div className="flex justify-center items-center w-full">
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-12">
        <InfoCard title="Gestión de Coordinadores por Asignatura" className="shadow-lg">
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

              
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full text-sm text-gray-700 bg-white">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-3 text-center">Asignatura</th>
                      <th className="p-3 text-center">Acción</th>
                    </tr>
                  </thead>

                  <tbody>
                    {asignaturasPaginadas.map((a) => (
                      <tr key={a.id} className="border-b hover:bg-gray-50 transition">
                        <td className="p-3 text-center">{a.nombre}</td>

                        <td className="p-3 text-center">
                          <button
                            onClick={() => setAsignaturaSeleccionada(a)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm"
                          >
                            Revisar coordinadores
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              
              {asignaturaSeleccionada && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                  <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg">
                    <h3 className="text-lg font-semibold mb-4 text-center text-black">
                      Coordinadores de {asignaturaSeleccionada.nombre}
                    </h3>

                    
                    {asignaturaSeleccionada.coordinadores.length > 0 ? (
                      <ul className="space-y-2">
                        {asignaturaSeleccionada.coordinadores.map((c) => (
                          <li
                            key={c.id}
                            className="border rounded-md p-3 bg-gray-50 flex justify-between"
                          >
                            <span className="text-black">
                              {c.nombres} {c.apellidos}
                            </span>

                            <button
                              className="text-sm text-white bg-red-600 px-3 py-1 rounded-md hover:bg-red-700"
                              onClick={() =>
                                setConfirmarQuitar({
                                  asignaturaId: asignaturaSeleccionada.id,
                                  rut: c.rut,
                                })
                              }
                            >
                              Quitar
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-black text-center">Sin coordinadores asignados.</p>
                    )}

                   
                    <div className="mt-6">
                      <h4 className="font-semibold text-black mb-2 text-center">
                        Agregar coordinador
                      </h4>

                      <Select
                        value={nuevoCoordinador}
                        onChange={setNuevoCoordinador}
                        options={obtenerCoordinadoresDisponibles(asignaturaSeleccionada).map(
                          (c: CoordinadorData) => ({
                            value: c.rut,
                            label: `${c.nombres} ${c.apellidos}`,
                          })
                        )}
                        placeholder="Seleccionar coordinador..."
                        isSearchable
                      />

                      <button
                        onClick={handleAgregar}
                        className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md text-sm"
                      >
                        Asignar coordinador
                      </button>
                    </div>

                    <div className="flex justify-end mt-6">
                      <button
                        onClick={() => setAsignaturaSeleccionada(null)}
                        className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-md text-sm text-black"
                      >
                        Cerrar
                      </button>
                    </div>
                  </div>
                </div>
              )}

              
              {confirmarQuitar && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                  <div className="bg-white p-6 rounded-lg w-full max-w-md text-center">
                    <p className="text-black mb-4">
                      ¿Seguro que desea quitar este coordinador?
                    </p>

                    <div className="flex justify-center gap-4">
                      <button
                        className="px-4 py-2 bg-green-600 text-white rounded-md"
                        onClick={handleConfirmarQuitar}
                      >
                        Confirmar
                      </button>

                      <button
                        className="px-4 py-2 bg-red-500 text-white rounded-md"
                        onClick={() => setConfirmarQuitar(null)}
                      >
                        Cancelar
                      </button>
                    </div>
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
