"use client";

import React, { useMemo, useState } from "react";
import {
  useAbrirConcurso,
  useCerrarConcurso,
} from "@/hooks/useAsignaturas";
import {
  useCrearConcurso,
  useCancelarAficheConcurso,
} from "@/hooks/useConcursoPostulacion";
import api from "@/api/axios";

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
  rutSecretaria: string; 
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

export default function AperturaConcursoAdmin({ asignaturas = [], rutSecretaria }: Props) {
  const [itemsPorPagina, setItemsPorPagina] = useState(5);
  const [paginaActual, setPaginaActual] = useState(1);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarPopup, setMostrarPopup] = useState(false);
  const [mensajePopup, setMensajePopup] = useState("");
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [idAConfirmar, setIdAConfirmar] = useState<string | null>(null);

  const { mutate: abrirConcurso } = useAbrirConcurso();
  const { mutate: cerrarConcurso } = useCerrarConcurso();
  const crearConcurso = useCrearConcurso();
  const cancelarAfiche = useCancelarAficheConcurso();

  const [mostrarModalCrear, setMostrarModalCrear] = useState(false);
  const [asignaturaParaCrear, setAsignaturaParaCrear] = useState<AsignaturaData | null>(null);

  const [semestre, setSemestre] = useState("");
  const [entregaAntecedentes, setEntregaAntecedentes] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaTermino, setFechaTermino] = useState("");
  const [tipoAyudantia, setTipoAyudantia] = useState("");
  const [tipoRemuneracion, setTipoRemuneracion] = useState("");
  const [horasMensuales, setHorasMensuales] = useState<number | "">("");
  const [horarioFijo, setHorarioFijo] = useState(false);
  const [cantAyudantes, setCantAyudantes] = useState<number | "">("");
  const [descripciones, setDescripciones] = useState<string[]>([""]);

  const [asignaturaParaVerAfiche, setAsignaturaParaVerAfiche] = useState<AsignaturaData | null>(null);
  const [datosAficheLocal, setDatosAficheLocal] = useState<any>(null);
  const [buscandoAficheLocal, setBuscandoAficheLocal] = useState(false);


  const [aficheExists, setAficheExists] = useState<Record<number, boolean | undefined>>({});


  const asignaturasFiltradas = useMemo(
    () => asignaturas.filter((a) => a.nombre.toLowerCase().includes(busqueda.toLowerCase())),
    [asignaturas, busqueda]
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


  const handleAbrirConcurso = (id: string) => {
    abrirConcurso(id, {
      onSuccess: () => {
        setMensajePopup(
          "Solicitud de apertura enviada. Cuando se apruebe, aparecerá la opción para crear el afiche/postulación."
        );
        setMostrarPopup(true);
      },
      onError: () => {
        setMensajePopup("Error al solicitar apertura. Intenta de nuevo.");
        setMostrarPopup(true);
      },
    });
  };


  const abrirModalCrear = (a: AsignaturaData) => {
    setAsignaturaParaCrear(a);
    setSemestre(a.semestre ?? "");
    setDescripciones([""]);
    setEntregaAntecedentes("");
    setFechaInicio("");
    setFechaTermino("");
    setTipoAyudantia("");
    setTipoRemuneracion("");
    setHorasMensuales("");
    setHorarioFijo(false);
    setCantAyudantes("");
    setMostrarModalCrear(true);
  };

  const agregarDescripcion = () => setDescripciones((d) => [...d, ""]);
  const quitarDescripcion = (idx: number) => setDescripciones((d) => d.filter((_, i) => i !== idx));
  const cambiarDescripcion = (idx: number, value: string) =>
    setDescripciones((d) => d.map((x, i) => (i === idx ? value : x)));

  const handleSubmitCrear = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!asignaturaParaCrear) return;


    if (!fechaInicio || !fechaTermino || !tipoAyudantia || !tipoRemuneracion || descripciones.length === 0 || descripciones.some(d => d.trim() === "")) {
      setMensajePopup("Completa: fecha inicio, fecha término, tipo ayudantía, tipo remuneración y al menos una descripción válida.");
      setMostrarPopup(true);
      return;
    }

    const payload = {
      id_asignatura: asignaturaParaCrear.id,
      semestre: semestre,
      entrega_antecedentes: new Date(entregaAntecedentes),
      fecha_inicio: new Date(fechaInicio),
      fecha_termino: new Date(fechaTermino),
      tipo_ayudantia: tipoAyudantia,
      tipo_remuneracion: tipoRemuneracion,
      horas_mensuales: Number(horasMensuales) || 0,
      horario_fijo: Boolean(horarioFijo),
      cant_ayudantes: Number(cantAyudantes) || 0,
      estado: "abierto",
      rut_secretaria: String(rutSecretaria), 
      descripcion: descripciones,
    };

    crearConcurso.mutate(payload, {
      onSuccess: (data: any) => {
        setAficheExists((prev) => ({ ...prev, [asignaturaParaCrear.id]: true }));

        setMensajePopup("Afiche / llamado creado correctamente.");
        setMostrarPopup(true);
        setMostrarModalCrear(false);
        setAsignaturaParaCrear(null);
      },
      onError: () => {
        setMensajePopup("Error al crear el afiche. Intenta nuevamente.");
        setMostrarPopup(true);
      },
    });
  };


  const abrirModalVerAfiche = async (a: AsignaturaData) => {
    setAsignaturaParaVerAfiche(a);
    setDatosAficheLocal(null);
    setBuscandoAficheLocal(true);

    try {
      const resp = await api.get(`llamado-postulacion/${a.id}`);
      const data = resp.data;
      if (Array.isArray(data) && data.length > 0) {
        setDatosAficheLocal(data);
        setAficheExists((prev) => ({ ...prev, [a.id]: true }));
      } else {
        setDatosAficheLocal(null);
        setAficheExists((prev) => ({ ...prev, [a.id]: false }));
      }
    } catch (err) {
      setMensajePopup("Error al consultar el afiche. Intenta nuevamente.");
      setMostrarPopup(true);
      setDatosAficheLocal(null);
      setAficheExists((prev) => ({ ...prev, [a.id]: false }));
    } finally {
      setBuscandoAficheLocal(false);
    }
  };

  const ejecutarCierreConfirmado = async () => {
    if (!idAConfirmar) {
      setMostrarConfirmacion(false);
      return;
    }


    cerrarConcurso(idAConfirmar, {
      onSuccess: async () => {
        try {
          const resp = await api.get(`llamado-postulacion/${idAConfirmar}`);
          const data = resp.data;
          let id_concurso: number | null = null;
          if (Array.isArray(data) && data.length > 0) id_concurso = data[0].id ?? null;
          else if (data && typeof data === "object" && data.id) id_concurso = data.id;

          if (id_concurso) {
            cancelarAfiche.mutate(id_concurso as any, {
              onSuccess: () => {
                setMensajePopup("Concurso y afiche cancelados correctamente.");
                setMostrarPopup(true);
                setAficheExists((prev) => ({ ...prev, [Number(idAConfirmar)]: false }));
              },
              onError: () => {
                setMensajePopup("Concurso cerrado pero error al cancelar afiche (intenta manualmente).");
                setMostrarPopup(true);
              },
            });
          } else {
            setMensajePopup("Concurso cerrado (no se encontró afiche asociado).");
            setMostrarPopup(true);
            setAficheExists((prev) => ({ ...prev, [Number(idAConfirmar)]: false }));
          }
        } catch (err) {
          setMensajePopup("Concurso cerrado, pero ocurrió un error al buscar el afiche.");
          setMostrarPopup(true);
        }
      },
      onError: () => {
        setMensajePopup("Error al cerrar el concurso. Intenta nuevamente.");
        setMostrarPopup(true);
      },
    });

    setMostrarConfirmacion(false);
    setIdAConfirmar(null);
  };


  const confirmarCierre = (id: string) => {
    setIdAConfirmar(id);
    setMostrarConfirmacion(true);
  };


  async function handleCancelarAfiche() {
    if (!asignaturaParaVerAfiche) return;

    try {
      const resp = await api.get(`llamado-postulacion/${asignaturaParaVerAfiche.id}`);
      const data = resp.data;
      let id_concurso: number | null = null;
      if (Array.isArray(data) && data.length > 0) id_concurso = data[0].id ?? null;
      else if (data && typeof data === "object" && data.id) id_concurso = data.id;

      if (!id_concurso) {
        setMensajePopup("No se encontró ID del concurso a cancelar.");
        setMostrarPopup(true);
        return;
      }

      cerrarConcurso(String(asignaturaParaVerAfiche.id), {
        onSuccess: () => {
          cancelarAfiche.mutate(id_concurso as any, {
            onSuccess: () => {
              setMensajePopup("Afiche / concurso cancelado correctamente.");
              setMostrarPopup(true);
              setAsignaturaParaVerAfiche(null);
              setDatosAficheLocal(null);
              setAficheExists((prev) => ({ ...prev, [asignaturaParaVerAfiche.id]: false }));
            },
            onError: () => {
              setMensajePopup("Error al cancelar el afiche. Intenta nuevamente.");
              setMostrarPopup(true);
            },
          });
        },
        onError: () => {
          setMensajePopup("Error al cerrar la asignatura. Intenta nuevamente.");
          setMostrarPopup(true);
        },
      });
    } catch (err) {
      setMensajePopup("Error al consultar el afiche. Intenta nuevamente.");
      setMostrarPopup(true);
    }
  }

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
                  onChange={(e) => { setBusqueda(e.target.value); setPaginaActual(1); }}
                  className="w-full sm:w-1/3 border border-gray-300 text-black rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex items-center gap-2">
                  <label htmlFor="itemsPorPagina" className="text-sm text-gray-700">Mostrar</label>
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
                      className={`px-3 py-1 rounded-md text-sm font-medium border ${paginaActual === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                    >
                      ← Anterior
                    </button>
                    <span className="text-sm text-gray-700">Página {paginaActual} de {totalPaginasFiltradas}</span>
                    <button
                      onClick={() => handlePaginaChange(paginaActual + 1)}
                      disabled={paginaActual === totalPaginasFiltradas}
                      className={`px-3 py-1 rounded-md text-sm font-medium border ${paginaActual === totalPaginasFiltradas ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"}`}
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
                      <th className="p-3 font-semibold text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {asignaturasPaginadas.map((a) => {
                      const estadoLower = a.estado?.trim().toLowerCase();
                      const puedeGestionarAfiche = estadoLower === "abierto" && a.abierta_postulacion === true;
                      const tieneAfiche = aficheExists[a.id];

                      return (
                        <tr key={a.id} className="border-b hover:bg-gray-50 transition">
                          <td className="p-3 text-center">{a.nombre}</td>
                          <td className="p-3 text-center">{a.estado}</td>
                          <td className="p-3 text-center space-x-2">
                            {estadoLower === "cerrado" && !a.abierta_postulacion && (
                              <button
                                onClick={() => handleAbrirConcurso(a.id.toString())}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition"
                              >
                                Solicitar apertura
                              </button>
                            )}

                            {estadoLower === "pendiente" && a.abierta_postulacion && (
                              <button
                                onClick={() => abrirModalCrear(a)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition"
                              >
                                Abrir concurso de postulación
                              </button>
                            )}

                            {estadoLower === "pendiente" && !a.abierta_postulacion && (
                              <button
                                onClick={() => confirmarCierre(a.id.toString())}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition"
                              >
                                Cerrar/Cancelar concurso
                              </button>
                            )}

                            {estadoLower === "abierto" && (
                              <>
                                <button
                                  onClick={() => abrirModalVerAfiche(a)}
                                  className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition"
                                >
                                  Ver afiche
                                </button>

                                <button
                                  onClick={() => confirmarCierre(a.id.toString())}
                                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition"
                                >
                                  Cerrar/Cancelar concurso
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {mostrarConfirmacion && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 p-4">
                  <div
                    className="
                      bg-white rounded shadow-lg w-full max-w-xl 
                      max-h-[90vh] overflow-y-auto p-6
                    "
                  >
                    <p className="text-gray-800 mb-4">
                      Para volver a abrir la postulación deberá aceptarse la solicitud. ¿Está seguro/a de cancelar/cerrar este concurso?
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

              {mostrarModalCrear && asignaturaParaCrear && (
                <div className="fixed inset-0 flex items-start justify-center pt-16 bg-black bg-opacity-40 z-50 overflow-y-auto">
                  <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl">
                    <h3 className="text-lg font-semibold mb-4 text-center text-black ">
                      Crear llamado / afiche - {asignaturaParaCrear.nombre}
                    </h3>

                    <form onSubmit={handleSubmitCrear} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label className="text-sm  text-black ">
                          Semestre
                          <input value={semestre} onChange={(e) => setSemestre(e.target.value)} className="w-full mt-1 border rounded text-black px-2 py-1" />
                        </label>

                        <label className="text-sm text-black ">
                          Entrega antecedentes (fecha)
                          <input value={entregaAntecedentes} onChange={(e) => setEntregaAntecedentes(e.target.value)} type="date" className="w-full mt-1 border rounded text-black px-2 py-1" />
                        </label>

                        <label className="text-sm text-black ">
                          Fecha inicio
                          <input value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} type="date" className="w-full mt-1 border rounded text-black px-2 py-1" />
                        </label>

                        <label className="text-sm  text-black ">
                          Fecha término
                          <input value={fechaTermino} onChange={(e) => setFechaTermino(e.target.value)} type="date" className="w-full mt-1 border rounded text-black px-2 py-1" />
                        </label>

                        <label className="text-sm text-black ">
                          Tipo ayudantía
                          <input value={tipoAyudantia} onChange={(e) => setTipoAyudantia(e.target.value)} className="w-full mt-1 border rounded text-black px-2 py-1" />
                        </label>

                        <label className="text-sm text-black ">
                          Tipo remuneración
                          <input value={tipoRemuneracion} onChange={(e) => setTipoRemuneracion(e.target.value)} className="w-full mt-1 border rounded text-black px-2 py-1" />
                        </label>

                        <label className="text-sm text-black ">
                          Horas mensuales
                          <input value={horasMensuales} onChange={(e) => setHorasMensuales(e.target.value ? Number(e.target.value) : "")} type="number" min={0} className="w-full mt-1 border rounded text-black px-2 py-1" />
                        </label>

                        <label className="text-sm flex items-center gap-2  text-black ">
                          <input type="checkbox" checked={horarioFijo} onChange={(e) => setHorarioFijo(e.target.checked)} />
                          Horario fijo
                        </label>

                        <label className="text-sm text-black ">
                          Cant. ayudantes
                          <input value={cantAyudantes} onChange={(e) => setCantAyudantes(e.target.value ? Number(e.target.value) : "")} type="number" min={0} className="w-full mt-1 border rounded text-black px-2 py-1" />
                        </label>
                      </div>

                      <div>
                        <h4 className="font-medium text-black">Descripción de requerimientos específicos</h4>

                        <div className="space-y-2 text-black max-h-56 overflow-y-auto pr-2 border rounded p-2">
                          {descripciones.map((d, idx) => (
                            <div key={idx} className="flex gap-2">
                              <input
                                className="flex-1 border rounded px-2 py-1"
                                value={d}
                                onChange={(e) => cambiarDescripcion(idx, e.target.value)}
                                placeholder={`Descripción ${idx + 1}`}
                              />
                              <button
                                type="button"
                                onClick={() => quitarDescripcion(idx)}
                                className="px-3 py-1 bg-red-500 text-white rounded"
                              >
                                Eliminar
                              </button>
                            </div>
                          ))}
                        </div>

                        
                        <button
                          type="button"
                          onClick={agregarDescripcion}
                          className="mt-2 px-3 py-2 bg-green-600 text-white rounded"
                        >
                          Añadir descripción
                        </button>
                      </div>

                      <div className="flex justify-end gap-2 mt-4">
                        <button type="button" onClick={() => { setMostrarModalCrear(false); setAsignaturaParaCrear(null); }} className="px-4 py-2 bg-gray-500 rounded">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Crear afiche</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {asignaturaParaVerAfiche && (
                <div className="fixed inset-0 flex items-start justify-center pt-16 bg-black bg-opacity-40 z-50">
                  <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl">
                    <h3 className="text-lg font-semibold mb-3 text-center text-black">Afiche / Llamado - {asignaturaParaVerAfiche.nombre}</h3>

                    {buscandoAficheLocal ? (
                      <p className="text-center text-black">Buscando datos...</p>
                    ) : datosAficheLocal && Array.isArray(datosAficheLocal) && datosAficheLocal.length > 0 ? (
                      <div className="space-y-3 text-black ">
                        <pre className="bg-gray-50 p-3 rounded overflow-auto text-xs">{JSON.stringify(datosAficheLocal, null, 2)}</pre>
                        <div className="flex justify-end gap-2">
                          <button onClick={() => { setAsignaturaParaVerAfiche(null); setDatosAficheLocal(null); }} className="px-3 py-2 bg-gray-400 rounded text-black">Cerrar</button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-center text-gray-600">No se encontraron datos de afiche para esta asignatura.</p>
                        <div className="flex justify-end gap-2">
                          <button onClick={() => { setAsignaturaParaVerAfiche(null); setDatosAficheLocal(null); }} className="px-3 py-2 bg-gray-300 rounded">Cerrar</button>
                        </div>
                      </div>
                    )}
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