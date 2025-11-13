"use client";

import React, { useState } from "react";
import { useAyudantiasPorAlumno, AyudantiasAnteriores } from "@/hooks/useAyudantia"; 

interface AlumnosData {
  rut_alumno: string;
  nombres: string;
  apellidos: string;
}

interface Props {
  alumnos?: AlumnosData[];
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
  <div
    className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}
  >
    <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100 text-center">
      {title}
    </h3>
    {children}
  </div>
);

export default function GenerarConstanciaAdmin({ alumnos = [] }: Props) {
  const [itemsPorPagina, setItemsPorPagina] = useState(5);
  const [paginaActual, setPaginaActual] = useState(1);
  const [busqueda, setBusqueda] = useState("");
  const [rutSeleccionado, setRutSeleccionado] = useState<string | null>(null);

  const { data: ayudantias, isLoading, isError } = useAyudantiasPorAlumno(
    rutSeleccionado ?? undefined
  );

  const alumnosFiltrados = alumnos.filter((a) =>
    a.nombres.toLowerCase().includes(busqueda.toLowerCase())
  );

  const totalPaginasFiltradas = Math.ceil(
    alumnosFiltrados.length / (itemsPorPagina || 1)
  );
  const indiceInicio = (paginaActual - 1) * (itemsPorPagina || 1);
  const indiceFin = indiceInicio + (itemsPorPagina || 1);
  const alumnosPaginados = alumnosFiltrados.slice(indiceInicio, indiceFin);

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

  const handleGenerarPDF = (ayudantia: AyudantiasAnteriores) => {
    console.log("Generar PDF para ayudantía:", ayudantia);
    
  };

  return (
    <div className="flex justify-center items-center w-full">
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-12">
        <InfoCard title="Todos los Alumnos" className="shadow-lg">
          {alumnos.length > 0 ? (
            <>
              
              <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                <input
                  type="text"
                  placeholder="Buscar Alumno..."
                  value={busqueda}
                  onChange={(e) => {
                    setBusqueda(e.target.value);
                    setPaginaActual(1);
                  }}
                  className="w-full sm:w-1/3 border border-gray-300 text-black rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="itemsPorPagina"
                    className="text-sm text-gray-700"
                  >
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
                  <span className="text-sm text-gray-700">Estudiantes</span>
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
                      <th className="p-3 font-semibold text-center">Rut</th>
                      <th className="p-3 font-semibold text-center">Nombre</th>
                      <th className="p-3 font-semibold text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alumnosPaginados.map((a) => (
                      <tr
                        key={a.rut_alumno}
                        className="border-b hover:bg-gray-50 transition"
                      >
                        <td className="p-3 text-center">{a.rut_alumno}</td>
                        <td className="p-3 text-center">
                          {a.nombres} {a.apellidos}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => setRutSeleccionado(a.rut_alumno)}
                            className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700"
                          >
                            Generar constancia
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              
              {rutSeleccionado && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                  <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-5xl relative">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                      Ayudantías de {rutSeleccionado}
                    </h2>

                    {isLoading ? (
                      <p className="text-center text-gray-600">Cargando...</p>
                    ) : isError ? (
                      <p className="text-center text-red-600">
                        Error al cargar ayudantías.
                      </p>
                    ) : ayudantias && Array.isArray(ayudantias) && ayudantias.length > 0 ? (
                      <div className="overflow-x-auto border rounded-lg">
                        <table className="min-w-full text-sm text-gray-700 bg-white">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="p-2 text-center">Tipo</th>
                              <th className="p-2 text-center">Nombre alumno</th>
                              <th className="p-2 text-center">Carrera</th>
                              <th className="p-2 text-center">Periodo</th>
                              <th className="p-2 text-center">Asignatura</th>
                              <th className="p-2 text-center">Remunerada</th>
                              <th className="p-2 text-center">Acción</th>
                            </tr>
                          </thead>
                          <tbody>
                            {ayudantias.map((ay: AyudantiasAnteriores) => (
                              <tr key={ay.id} className="border-b hover:bg-gray-50">
                                <td className="p-2 text-center">{ay.tipo_ayudantia}</td>
                                <td className="p-2 text-center">{ay.alumno.nombres} {ay.alumno.apellidos}</td>
                                <td className="p-2 text-center">{ay.alumno.nombre_carrera}</td>
                                <td className="p-2 text-center">{ay.periodo}</td>
                                <td className="p-2 text-center">{ay.asignatura.nombre}</td>
                                <td className="p-2 text-center">{ay.remunerada}</td>
                                <td className="p-2 text-center">
                                  <button
                                    onClick={() => handleGenerarPDF(ay)}
                                    className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700"
                                  >
                                    Generar PDF
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-center text-gray-600">
                        No hay ayudantías registradas para este alumno.
                      </p>
                    )}

                    <div className="flex justify-center mt-6">
                      <button
                        onClick={() => setRutSeleccionado(null)}
                        className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                      >
                        Cerrar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-600 text-center">
              No hay alumnos disponibles.
            </p>
          )}
        </InfoCard>
      </div>
    </div>
  );
}

