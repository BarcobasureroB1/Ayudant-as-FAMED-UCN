"use client";

import React, { useState } from "react";
import { useAyudantiasPorAlumno, AyudantiasAnteriores } from "@/hooks/useAyudantia";
import dynamic from "next/dynamic";
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';

const PDFViewerDynamic = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  {
    ssr: false,
    loading: () => (
      <p className="text-center text-black flex-1 pt-20">Cargando previsualización....</p>
    ),
  }
);

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: "2.5cm",
    fontFamily: "Times-Roman",
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: "auto",
  },
  headerTextContainer: {
    flexDirection: "column",
    marginLeft: 15,
  },
  headerTextMain: {
    fontSize: 13,
    fontFamily: "Times-Bold",
    color: "#333",
    textDecoration: "underline"
  },
  headerTextSecondary: {
    fontSize: 11,
    color: "#333",
    marginTop: 2,
  },
  /*headerText: {
    fontSize: 20,
    textAlign: "left",
    color: "#333",
  }*/
  title: {
    fontSize: 12,
    textAlign: "center",
    fontFamily: "Times-Bold",
    marginBottom: 10,
  },
  body: {
    fontSize: 13,
    textAlign: "justify",
    lineHeight: 1.5,
    marginBottom: 10,
    //paddingHorizontal: "2.5cm",
    //textIndent: 30,
  },
  bold: {
    fontFamily: "Times-Bold",
  },
  signatureLine: {
    position: "absolute",
    bottom: 130,
    left: "2.5cm",
    right: "2.5cm",
    borderTopWidth: 1,
    borderTopColor: "#000",
  },
  footer: {
    position: "absolute",
    bottom: 190, 
    left: "2.5cm",
    right: "2.5cm",
    flexDirection: "row",
    justifyContent: "space-around",
    //paddingTop: 40,
    //borderTopWidth: 1,
    //borderTopColor: "#000",
  },
  footerLine: {
    position: "absolute",
    bottom: 100, 
    left: "2.5cm",
    right: "2.5cm",
    borderTopWidth: 1,
    borderTopColor: "#000",
  },
  signature: {
    fontSize: 10,
    textAlign: "center",
    flexDirection: "column",
    alignItems: "center",     
    width: "45%",
  },
  dateFooter: {
    position: "absolute",
    bottom: 80,
    left: 0,
    right: "2.5cm",
    textAlign: "right",
    fontSize: 11,
  },
});

const formatSimpleDate = (dateString: string) => {
  if (!dateString) {
    return "No definida";
  }
  try {
    const date = new Date(dateString);
    const userTimezone = date.getTimezoneOffset() * 60000;
    const correctedDate = new Date(date.getTime() + userTimezone);
    return correctedDate.toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch (e) {
    return "Fecha invalida";
  }
};

const stringPeriodo = (periodo: string) => {
  if(!periodo)
  {
    return { inicio: null, fin: null, semestre: "No definidi"};
  }

  try{

    const partes = periodo.split("-");
    if(partes.length < 3)
    {
      return {inicio: null, fin: null, semestre: periodo};
    }

    const [fechaInicio, fechaFin, codigoSem] = partes;

    const anio = fechaInicio.split("/")[0];
    const numSemestre = parseInt(codigoSem, 10);
    const textSemestre = `${anio}-${numSemestre}`;

    return {
      inicio: fechaInicio,
      fin: fechaFin,
      semestre: textSemestre
    };
  } catch (error) {
    console.log("error al extraer los datos del string", error);
    return { inicio: null, fin: null, semestre: "error formato"};
  }
};

const ConstanciaPDFDocument = ({
  ayudantia,
}: {
  ayudantia: AyudantiasAnteriores;
}) => {
  const getFechaActual = () => {
    const fecha = new Date();
    return `Coquimbo, ${fecha.toLocaleDateString("es-CL", {
      day: "numeric",
      month:"long",
      year:"numeric",
    })}`;
  };

  const { inicio, fin, semestre } = stringPeriodo(ayudantia.periodo);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Image style={styles.logo} src="/logo-ucn.png" />
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTextMain}>Universidad Católica del Norte</Text>
            <Text style={styles.headerTextSecondary}>Facultad de Medicina</Text>
          </View>
        </View>

        <Text style={[styles.title, {fontSize: 13}]}>Constancia</Text>
        <Text style={[styles.title, {fontSize: 13}]}>A</Text>
        <Text style={[styles.title, {marginBottom: 30}, {fontSize: 14}]}>
          {ayudantia.alumno.nombres.toUpperCase()}{" "}
          {ayudantia.alumno.apellidos.toUpperCase()}
        </Text>

        <Text style={[styles.body, {fontSize: 13}]} hyphenationCallback={(word) => [word]}>
          Ha realizado{" "}<Text style={styles.bold}>{ayudantia.tipo_ayudantia}</Text>{" "}
          para la asignatura de{" "}
          <Text style={styles.bold}>{ayudantia.asignatura.nombre}</Text>,
          estudiante de la carrera de{" "}
          <Text style={styles.bold}>{ayudantia.alumno.nombre_carrera}</Text>{" "},
          de la Facultad de Medicina de la Universidad Católica del Norte,
          durante el semestre <Text style={styles.bold}>{semestre}</Text>
          , desde el{" "}
          <Text style={styles.bold}>
            {formatSimpleDate(inicio || "")}
          </Text>{" "}
          hasta el{" "}
          <Text style={styles.bold}>
            {formatSimpleDate(fin || "")}.
          </Text>
        </Text>

        <Text style={styles.body}>
          Esta ayudantia es{" "}
          <Text style={styles.bold}>{ayudantia.remunerada}</Text>
        </Text>

        
        <Text style={styles.body}>
          Se le concede la presente Constancia de participación.
        </Text>


        <View style={styles.footerLine}/>
        <Text style={styles.dateFooter}>{getFechaActual()}</Text>
      </Page>
    </Document>
  );
};

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
  const [ayudantiaParaPDF, setAyudantiaParaPDF] = useState<AyudantiasAnteriores | null>(null);


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
    setAyudantiaParaPDF(ayudantia);
  };

  return (
    <div className="flex justify-center items-center w-full">
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-12">
        <InfoCard title="Todos los Alumnos" className="shadow-lg">
          {alumnos.length > 0 ? (
            <>
              {/* BUSCADOR + ITEMS POR PÁGINA + PAGINACIÓN */}
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

              {/* TABLA ALUMNOS */}
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
              {/* POPUP */}
              {rutSeleccionado && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                  <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-5xl relative">

                    {/* TÍTULO – AHORA CON NOMBRE COMPLETO */}
                    {(() => {
                      const alumnoSeleccionado = alumnos.find(
                        (a) => a.rut_alumno === rutSeleccionado
                      );
                      const nombreCompleto = alumnoSeleccionado
                        ? `${alumnoSeleccionado.nombres} ${alumnoSeleccionado.apellidos}`
                        : rutSeleccionado;

                      return (
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                          Ayudantías de {nombreCompleto}
                        </h2>
                      );
                    })()}

                    {isLoading ? (
                      <p className="text-center text-gray-600">Cargando...</p>
                    ) : isError ? (
                      <p className="text-center text-red-600">
                        Error al cargar ayudantías.
                      </p>
                    ) : ayudantias &&
                      Array.isArray(ayudantias) &&
                      ayudantias.length > 0 ? (
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
                                <td className="p-2 text-center">
                                  {ay.alumno.nombres} {ay.alumno.apellidos}
                                </td>
                                <td className="p-2 text-center">{ay.alumno.nombre_carrera}</td>
                                <td className="p-2 text-center">{ay.periodo}</td>
                                <td className="p-2 text-center">{ay.asignatura.nombre}</td>
                                <td className="p-2 text-center">{ay.remunerada}</td>
                                <td className="p-3 text-center">
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

              {ayudantiaParaPDF && (
                <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-10 bg-black bg-opacity-60 z-[60]">
                  <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-4xl h-full max-h-[90vh] flex flex-col">
                    <h3 className="text-lg font-semibold mb-3 text-center text-black flex-shrink-0">
                      Certificado de Ayudantía -{" "}
                      {ayudantiaParaPDF.alumno.nombres}
                    </h3>
                    <div className="flex-1 w-full h-full overflow-hidden">
                      <PDFViewerDynamic width="100%" height="100%">
                        <ConstanciaPDFDocument ayudantia={ayudantiaParaPDF}/>
                      </PDFViewerDynamic>
                    </div>
                    <div className="flex justify-end gap-2 mt-4 flex-shrink-0">
                      <button
                        onClick={() => setAyudantiaParaPDF(null)}
                        className="px-3 py-2 bg-gray-400 rounded text-black"
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

