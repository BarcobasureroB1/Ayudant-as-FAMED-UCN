"use client";

import React, { useState } from "react";
import { useAyudantiasPorAlumno, AyudantiasAnteriores } from "@/hooks/useAyudantia";
import dynamic from "next/dynamic";
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { 
    Search, 
    ChevronLeft, 
    ChevronRight, 
    FileText, 
    X, 
    Download, 
    Printer,
    User,
    GraduationCap,
    Calendar,
    Briefcase
} from "lucide-react";

// --- CARGA DINÁMICA PDF ---
const PDFViewerDynamic = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center h-full text-slate-500">
         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
         <p className="text-sm font-medium">Preparando documento...</p>
      </div>
    ),
  }
);

// --- ESTILOS PDF (Sin cambios lógicos) ---
const styles = StyleSheet.create({
  page: { flexDirection: "column", backgroundColor: "#FFFFFF", padding: "2.5cm", fontFamily: "Helvetica" }, 
  header: { flexDirection: "row", justifyContent: "flex-start", alignItems: "center", marginBottom: 20 },
  logo: { width: 80, height: "auto" },
  headerTextContainer: { flexDirection: "column", marginLeft: 15 },
  headerTextMain: { fontSize: 13, fontFamily: "Helvetica-Bold", color: "#333", textDecoration: "underline" },
  headerTextSecondary: { fontSize: 11, color: "#333", marginTop: 2 },
  title: { fontSize: 12, textAlign: "center", fontFamily: "Helvetica-Bold", marginBottom: 10 },
  body: { fontSize: 11, textAlign: "justify", lineHeight: 1.5, marginBottom: 10 },
  bold: { fontFamily: "Helvetica-Bold" },
  footerLine: { position: "absolute", bottom: 100, left: "2.5cm", right: "2.5cm", borderTopWidth: 1, borderTopColor: "#000" },
  dateFooter: { position: "absolute", bottom: 80, left: 0, right: "2.5cm", textAlign: "right", fontSize: 11 },
});

// --- UTILIDADES DE FECHA ---
const formatSimpleDate = (dateString: string) => {
  if (!dateString) return "No definida";
  try {
    const date = new Date(dateString);
    const userTimezone = date.getTimezoneOffset() * 60000;
    const correctedDate = new Date(date.getTime() + userTimezone);
    return correctedDate.toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch (e) { return "Fecha invalida"; }
};

const stringPeriodo = (periodo: string) => {
  if(!periodo) return { inicio: null, fin: null, semestre: "No definido"};
  try{
    const partes = periodo.split("-");
    if(partes.length < 3) return {inicio: null, fin: null, semestre: periodo};
    const [fechaInicio, fechaFin, codigoSem] = partes;
    const anio = fechaInicio.split("/")[0];
    const numSemestre = parseInt(codigoSem, 10);
    return { inicio: fechaInicio, fin: fechaFin, semestre: `${anio}-${numSemestre}` };
  } catch (error) { return { inicio: null, fin: null, semestre: "error formato"}; }
};

// --- DOCUMENTO PDF ---
const ConstanciaPDFDocument = ({ ayudantia }: { ayudantia: AyudantiasAnteriores }) => {
  const getFechaActual = () => {
    const fecha = new Date();
    return `Coquimbo, ${fecha.toLocaleDateString("es-CL", { day: "numeric", month:"long", year:"numeric" })}`;
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
          {ayudantia.alumno.nombres.toUpperCase()} {ayudantia.alumno.apellidos.toUpperCase()}
        </Text>

        <Text style={[styles.body, {fontSize: 12}]}>
          Ha realizado <Text style={styles.bold}>{ayudantia.tipo_ayudantia}</Text> para la asignatura de <Text style={styles.bold}>{ayudantia.asignatura.nombre}</Text>,
          estudiante de la carrera de <Text style={styles.bold}>{ayudantia.alumno.nombre_carrera}</Text>, de la Facultad de Medicina de la Universidad Católica del Norte,
          durante el semestre <Text style={styles.bold}>{semestre}</Text>, desde el <Text style={styles.bold}>{formatSimpleDate(inicio || "")}</Text> hasta el <Text style={styles.bold}>{formatSimpleDate(fin || "")}.</Text>
        </Text>

        <Text style={styles.body}>Esta ayudantia es <Text style={styles.bold}>{ayudantia.remunerada}</Text></Text>
        <Text style={styles.body}>Se le concede la presente Constancia de participación.</Text>

        <View style={styles.footerLine}/>
        <Text style={styles.dateFooter}>{getFechaActual()}</Text>
      </Page>
    </Document>
  );
};

// --- INTERFACES ---
interface AlumnosData {
  rut_alumno: string;
  nombres: string;
  apellidos: string;
}

interface Props {
  alumnos?: AlumnosData[];
}

// --- COMPONENTE PRINCIPAL ---
export default function GenerarConstanciaAdmin({ alumnos = [] }: Props) {
  // Estados
  const [itemsPorPagina, setItemsPorPagina] = useState(8);
  const [paginaActual, setPaginaActual] = useState(1);
  const [busqueda, setBusqueda] = useState("");
  const [rutSeleccionado, setRutSeleccionado] = useState<string | null>(null);
  const [ayudantiaParaPDF, setAyudantiaParaPDF] = useState<AyudantiasAnteriores | null>(null);

  // Queries
  const { data: ayudantias, isLoading, isError } = useAyudantiasPorAlumno(rutSeleccionado ?? undefined);

  // Lógica Filtrado
  const alumnosFiltrados = alumnos.filter((a) =>
    a.nombres.toLowerCase().includes(busqueda.toLowerCase()) || 
    a.apellidos.toLowerCase().includes(busqueda.toLowerCase()) ||
    a.rut_alumno.includes(busqueda)
  );

  const totalPaginasFiltradas = Math.ceil(alumnosFiltrados.length / (itemsPorPagina || 1));
  const indiceInicio = (paginaActual - 1) * (itemsPorPagina || 1);
  const indiceFin = indiceInicio + (itemsPorPagina || 1);
  const alumnosPaginados = alumnosFiltrados.slice(indiceInicio, indiceFin);

  // Handlers
  const handleChangeItemsPorPagina = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    if (valor === "") { setItemsPorPagina(NaN); return; }
    const numero = Number(valor);
    if (numero > 0) { setItemsPorPagina(numero); setPaginaActual(1); }
  };

  const handlePaginaChange = (nuevaPagina: number) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginasFiltradas) setPaginaActual(nuevaPagina);
  };

  return (
    <div className="w-full">
      
      {/* TÍTULO DE LA SECCIÓN (Agregado) */}
      <div className="mb-5 flex items-center gap-2 border-b border-gray-100 pb-4">
        <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
            <GraduationCap className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">
            Todos los Alumnos
        </h2>
      </div>

      {/* --- ENCABEZADO Y CONTROLES --- */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                  type="text"
                  placeholder="Buscar por nombre o RUT..."
                  value={busqueda}
                  onChange={(e) => { setBusqueda(e.target.value); setPaginaActual(1); }}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all text-sm"
              />
          </div>
          
          <div className="flex items-center gap-3 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 pl-3 border-r border-gray-100 pr-3">
                  <span className="text-xs text-gray-600 font-medium">Filas:</span>
                  <input
                      type="number"
                      min="1"
                      value={isNaN(itemsPorPagina) ? "" : itemsPorPagina}
                      onChange={handleChangeItemsPorPagina}
                      className="w-12 text-center text-sm border-gray-100 text-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 py-1"
                  />
              </div>

              <div className="flex items-center gap-1 pr-1">
                  <button 
                      onClick={() => handlePaginaChange(paginaActual - 1)} 
                      disabled={paginaActual === 1} 
                      className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-30 text-gray-600 transition-colors"
                  >
                      <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-medium text-gray-700 min-w-[60px] text-center">
                      {paginaActual} / {totalPaginasFiltradas || 1}
                  </span>
                  <button 
                      onClick={() => handlePaginaChange(paginaActual + 1)} 
                      disabled={paginaActual === totalPaginasFiltradas} 
                      className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-30 text-gray-600 transition-colors"
                  >
                      <ChevronRight className="w-4 h-4" />
                  </button>
              </div>
          </div>
      </div>

      {/* --- TABLA PRINCIPAL --- */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {alumnos.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Estudiante</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">RUT</th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Gestión</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {alumnosPaginados.map((a) => (
                <tr key={a.rut_alumno} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-50 p-2 rounded-full text-indigo-600">
                            <User className="w-4 h-4" />
                        </div>
                        <div className="text-sm font-medium text-slate-900">{a.nombres} {a.apellidos}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">
                    {a.rut_alumno}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => setRutSeleccionado(a.rut_alumno)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800 rounded-lg text-xs font-semibold transition-all shadow-sm"
                    >
                      <FileText className="w-3.5 h-3.5" /> Generar Constancia
                    </button>
                  </td>
                </tr>
              ))}
              {alumnosPaginados.length === 0 && (
                 <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-slate-500 text-sm">
                        No se encontraron alumnos con ese criterio.
                    </td>
                 </tr>
              )}
            </tbody>
          </table>
        ) : (
            <div className="p-12 text-center">
                <p className="text-slate-500 text-sm">No hay base de datos de alumnos disponible.</p>
            </div>
        )}
      </div>

      {/* --- MODAL 1: LISTADO AYUDANTÍAS --- */}
      {rutSeleccionado && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center sm:items-center p-4 text-center sm:p-0">
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setRutSeleccionado(null)} />
                
                <div className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-2xl transition-all sm:my-8 w-full max-w-5xl border border-slate-100">
                    {/* Header Modal */}
                    <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-white">
                        <div className="flex items-center gap-3">
                            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                                <GraduationCap className="w-5 h-5"/>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 leading-none">Historial de Ayudantías</h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    {alumnos.find(a => a.rut_alumno === rutSeleccionado)?.nombres} {alumnos.find(a => a.rut_alumno === rutSeleccionado)?.apellidos}
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setRutSeleccionado(null)} className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-100 rounded-full">
                            <X className="w-6 h-6"/>
                        </button>
                    </div>

                    {/* Body Modal */}
                    <div className="px-6 py-6 bg-slate-50/50 max-h-[60vh] overflow-y-auto">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
                                <p className="text-sm">Buscando registros...</p>
                            </div>
                        ) : isError ? (
                            <div className="bg-red-50 text-red-700 p-4 rounded-lg text-center text-sm font-medium">
                                Error al cargar el historial del alumno.
                            </div>
                        ) : ayudantias && ayudantias.length > 0 ? (
                            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg bg-white">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Periodo</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Asignatura</th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Tipo</th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Pago</th>
                                            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Documento</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {ayudantias.map((ay: AyudantiasAnteriores) => (
                                            <tr key={ay.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="w-3.5 h-3.5 text-slate-400"/>
                                                        {ay.periodo || "S/I"}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm font-medium text-slate-800">
                                                    {ay.asignatura.nombre}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-center">
                                                     <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                        {ay.tipo_ayudantia}
                                                     </span>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-center text-xs text-slate-500">
                                                    {ay.remunerada}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-right">
                                                    <button
                                                        onClick={() => setAyudantiaParaPDF(ay)}
                                                        className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 rounded-lg font-medium shadow-sm transition-all"
                                                    >
                                                        <Printer className="w-3.5 h-3.5"/> Generar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-10 bg-white rounded-lg border border-dashed border-slate-300">
                                <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2"/>
                                <p className="text-slate-500 font-medium text-sm">Este alumno no registra ayudantías previas.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* --- MODAL 2: VISTA PREVIA PDF --- */}
      {ayudantiaParaPDF && (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
             <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" onClick={() => setAyudantiaParaPDF(null)} />

                <div className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-2xl transition-all sm:my-8 w-full max-w-5xl h-[90vh] flex flex-col">
                    {/* Header PDF */}
                    <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-white flex-shrink-0">
                         <div>
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-red-500"/>
                                Vista Previa de Constancia
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {ayudantiaParaPDF.alumno.nombres} {ayudantiaParaPDF.alumno.apellidos} - {ayudantiaParaPDF.asignatura.nombre}
                            </p>
                        </div>
                        <button onClick={() => setAyudantiaParaPDF(null)} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <X className="w-6 h-6"/>
                        </button>
                    </div>

                    {/* Viewer */}
                    <div className="flex-1 bg-slate-100 p-4 sm:p-8 overflow-hidden">
                        <div className="w-full h-full shadow-lg rounded-lg overflow-hidden bg-white">
                             <PDFViewerDynamic width="100%" height="100%">
                                <ConstanciaPDFDocument ayudantia={ayudantiaParaPDF}/>
                            </PDFViewerDynamic>
                        </div>
                    </div>
                </div>
             </div>
        </div>
      )}
    </div>
  );
}