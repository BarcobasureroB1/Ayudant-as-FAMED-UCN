"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  useAbrirConcurso,
  useCerrarConcurso,
  useAsignaturasCoordinadores
} from "@/hooks/useAsignaturas";
import {
  useCrearConcurso,
  useCancelarAficheConcurso,
  useBuscarDatosAfiche
} from "@/hooks/useConcursoPostulacion";
import api from "@/api/axios";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import dynamic from "next/dynamic";
import { 
    Search, 
    Plus, 
    Eye, 
    XCircle, 
    AlertTriangle, 
    CheckCircle2, 
    ChevronLeft, 
    ChevronRight, 
    FileText, 
    Calendar,
    Clock,
    Users,
    Trash2,
    Briefcase,
    AlignLeft,
    CalendarDays,
    BookOpen // Nuevo icono importado
} from "lucide-react";

// --- CARGA DINÁMICA DEL VISOR PDF ---
const PDFViewerDynamic = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full bg-slate-50 rounded-lg border border-slate-200">
          <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
              <p className="text-slate-500 font-medium text-sm">Preparando documento...</p>
          </div>
      </div>
    )
  }
);

// --- INTERFACES ---
interface AsignaturaData {
  id: number;
  nombre: string;
  estado: string;
  semestre: string;
  nrc: string;
  abierta_postulacion: boolean;
  coordinadores?: { rut: string; nombres: string; apellidos: string}[];
}

interface Props {
  asignaturas?: AsignaturaData[];
  rutSecretaria: string; 
  asignaturasConCoordinadores?: any[];
}

interface HorarioSeleccionado {
  dia: string;
  bloque: string;
}

// --- CONSTANTES ---
const opcionesDias = [
  { label: 'Lunes', value: 'Lunes' },
  { label: 'Martes', value: 'Martes' },
  { label: 'Miércoles', value: 'Miércoles' },
  { label: 'Jueves', value: 'Jueves' },
  { label: 'Viernes', value: 'Viernes' },
  { label: 'Sábado', value: 'Sábado' },
];

const opcionesBloques = [
  { label: 'A (08:10 - 09:30)', value: 'A' },
  { label: 'B (09:55 - 11:20)', value: 'B' },
  { label: 'C (11:40 - 13:10)', value: 'C' },
  { label: 'C2 (13:10 - 14:30)', value: 'C2' },
  { label: 'D (14:30 - 16:00)', value: 'D' },
  { label: 'E (16:15 - 17:47)', value: 'E' },
  { label: 'F (18:00 - 19:30)', value: 'F' },
];

// --- UTILIDADES ---
const formatDate = (dateString: string) => {
  if (!dateString) return "No definida";
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

// --- ESTILOS PDF ---
const styles = StyleSheet.create({
  page: { flexDirection: "column", backgroundColor: "#FFFFFF", padding: 30, fontFamily: "Helvetica" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 2, borderBottomColor: "#003366", paddingBottom: 10 },
  headerText: { fontSize: 10, color: "#003366" },
  logo: { width: 100, height: "auto" },
  title: { fontSize: 16, textAlign: "center", marginVertical: 15, fontWeight: "bold", color: "#003366" },
  subtitle: { fontSize: 11, textAlign: "center", marginHorizontal: 40, marginBottom: 15 },
  table: { borderWidth: 1, borderColor: "#000" },
  tableRow: { flexDirection: "row" },
  tableCol: { flex: 1, borderWidth: 1, borderColor: "#000", padding: 5 },
  tableColHalf: { flex: 0.5, borderWidth: 1, borderColor: "#000", padding: 5 },
  tableColSmall: { flex: 0.3, borderWidth: 1, borderColor: "#000", padding: 5 },
  tableColLarge: { flex: 0.7, borderWidth: 1, borderColor: "#000", padding: 5 },
  cellLabel: { fontSize: 10, fontWeight: "bold" },
  cellText: { fontSize: 10, paddingLeft: 4 },
  inLineRow:{ flexDirection: 'row', alignItems: 'center' },
  sectionTitle: { fontSize: 12, fontWeight: "bold", marginTop: 15, marginBottom: 5, color: "#003366" },
  listItem: { fontSize: 10, marginLeft: 10, marginBottom: 3 },
  footer: { marginTop: 30, textAlign: "center" },
  footerText: { fontSize: 11, fontWeight: "bold" },
  footerDate: { fontSize: 14, marginTop: 4, backgroundColor: "#FFFF00", paddingVertical: 3, paddingHorizontal: 8, borderRadius:2, alignSelf: 'center' },
});

// --- DOCUMENTO PDF ---
const AfichePDFDocument = ({ datos }: { datos: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View style={{ flexDirection: "column" }}>
          <Text style={styles.headerText}>FACULTAD DE MEDICINA</Text>
          <Text style={styles.headerText}>SECRETARÍA DOCENTE</Text>
        </View>
        <Image style={styles.logo} src="/logo-ucn.png" />
      </View>

      <Text style={styles.title}>LLAMADO A CONCURSO AYUDANTÍA</Text>
      <Text style={styles.subtitle}>
        SE INVITA A LOS ALUMNOS DE LAS CARRERAS DE ENFERMERÍA, KINESIOLOGÍA,
        MEDICINA Y NUTRICIÓN & DIETÉTICA A PARTICIPAR DEL LLAMADO A CONCURSO
      </Text>

      <View style={styles.table}>
        <View style={styles.tableRow}>
          <View style={styles.tableColHalf}>
            <Text style={styles.cellLabel}>Asignatura:</Text>
            <Text style={styles.cellText}>{datos.asignatura?.nombre || "Cargando..."}</Text> 
          </View>
        <View style={styles.tableColHalf}>
            <Text style={styles.cellLabel}>-------------------------------------------</Text>
          </View>
        </View>

        <View style={styles.tableRow}>
          <View style={styles.tableColHalf}>
            <Text style={styles.cellLabel}>Semestre:</Text>
            <Text style={styles.cellText}>{datos.semestre}</Text>
          </View>
          <View style={styles.tableColHalf}>
            <Text style={styles.cellLabel}>Fecha de inicio de Ayudantía:</Text>
            <Text style={styles.cellText}>{formatDate(datos.fecha_inicio)}</Text>
            <Text style={styles.cellLabel}>Fecha de Término de Ayudantía:</Text>
            <Text style={styles.cellText}>{formatDate(datos.fecha_termino)}</Text>
          </View>
        </View>

        <View style={styles.tableRow}>
          <View style={styles.tableColHalf}>
            <View style={styles.inLineRow}>
              <Text style={styles.cellLabel}>Ayudantía Docente:</Text>
              <Text style={styles.cellText}>
                {datos.tipo_ayudantia === "Docente" ? "X" : ""}
              </Text>
            </View>
            <View style={styles.inLineRow}>
              <Text style={styles.cellLabel}>Ayudantía en Investigación:</Text>
              <Text style={styles.cellText}>
                {datos.tipo_ayudantia === "Investigacion" ? "X" : ""}
              </Text>
            </View>
          </View>
          <View style={styles.tableColHalf}>
            <View style={styles.inLineRow}>
              <Text style={styles.cellLabel}>Ayudantía Ad Honorem:</Text>
              <Text style={styles.cellText}>
                {datos.tipo_remuneracion === "Ad Honorem" ? "X" : ""}
              </Text>
            </View>
            <View style={styles.inLineRow}>
              <Text style={styles.cellLabel}>Ayudantía Remunerada:</Text>
              <Text style={styles.cellText}>
                {datos.tipo_remuneracion === "Remunerada" ? "X" : ""}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.tableRow}>
          <View style={styles.tableColHalf}>
            <Text style={styles.cellLabel}>Coordinador(es):</Text>
            {datos.coordinadores && datos.coordinadores.length > 0 ? (
              datos.coordinadores.map(
                (coord: {nombreCompleto: string}, index: number) => (
                  <Text key={index} style={styles.cellText}>
                    - {coord.nombreCompleto}
                  </Text>
                )
              )
            ): (
              <Text style={styles.cellText}>No asignado</Text>
            )}
          </View>
          <View style={styles.tableColHalf}>
            <Text style={styles.cellLabel}>N° de horas semanales/mensuales:</Text>
            <Text style={styles.cellText}>{datos.horas_mensuales} horas/mensuales</Text>
          </View>
        </View>

        <View style={styles.tableRow}>
          <View style={styles.tableColSmall}>
            <Text style={styles.cellLabel}>Requiere Horario fijo:</Text>
            <View style={styles.inLineRow}>
              <Text style={styles.cellLabel}>Si:</Text>
              <Text style={styles.cellText}>{datos.horario_fijo ? "X" : ""}</Text>
            </View>
            <View style={styles.inLineRow}>
              <Text style={styles.cellLabel}>No:</Text>
              <Text style={styles.cellText}>{datos.horario_fijo ? "" : "X"}</Text>
            </View>
          </View>
          <View style={styles.tableColLarge}>
            <Text style={styles.cellLabel}>Horario:</Text>
            {datos.horario_fijo && datos.horarios && datos.horarios.length > 0 ? (
              datos.horarios.map((h: HorarioSeleccionado, index: number) => (
                <Text key={index} style={styles.cellText}>
                  {h.dia} - Bloque {h.bloque}
                </Text>
              ))
            ) : (
              <Text style={styles.cellText}>A consensuar</Text>
            )}
          </View>
        </View>
        
        <View style={styles.tableRow}>
          <View style={styles.tableCol}>
            <Text style={styles.cellLabel}>Nº ayudantes requeridos:</Text>
            <Text style={styles.cellText}>{datos.cant_ayudantes}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Requisitos Generales de Postulación:</Text>
      <Text style={styles.listItem}>
        • Ser alumno regular de la UCN, estar matriculado, en el semestre
        académico en que efectúa la postulación.
      </Text>
      <Text style={styles.listItem}>
        • Contar con una hoja académica intachable, sin amonestaciones, que no
        haya sido ni estén sometidos a sanciones disciplinares ni académicas.
      </Text>
      <Text style={styles.listItem}>
        • Haber aprobado las asignaturas en que se desarrollan las funciones de
        ayudantía.
      </Text>
      <Text style={styles.listItem}>
        • Haber aprobado no menos de dos semestres completos del Plan de estudios
        de la Carrera a la cual se encuentra adscrito(a).
      </Text>
      <Text style={styles.listItem}>
        • Cumplir con los siguientes requisitos:
      </Text>
      
      <Text style={styles.sectionTitle}>Requisitos Específicos Alumno Ayudante:</Text>
      {datos.descripcion && datos.descripcion.length > 0 ? (
        datos.descripcion.map((req: string, index: number) => (
          <Text key={index} style={styles.listItem}>
            • {req}
          </Text>
        ))
      ) : (
        <Text style={styles.listItem}>No hay requisitos específicos definidos.</Text>
      )}
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>PLAZO DE ENTREGA ANTECEDENTES</Text>
        <View>
          <Text style={styles.footerDate}>{formatDate(datos.entrega_antecedentes)}</Text>
        </View>
      </View>

    </Page>
  </Document>
);

// --- COMPONENTE PRINCIPAL ---
export default function AperturaConcursoAdmin({ asignaturas = [], rutSecretaria, asignaturasConCoordinadores = [] }: Props) {
  // --- Estados ---
  const [itemsPorPagina, setItemsPorPagina] = useState(10);
  const [paginaActual, setPaginaActual] = useState(1);
  const [busqueda, setBusqueda] = useState("");

  const [mostrarPopup, setMostrarPopup] = useState(false);
  const [mensajePopup, setMensajePopup] = useState("");
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [idAConfirmar, setIdAConfirmar] = useState<string | null>(null);
  
  const [mostrarModalCrear, setMostrarModalCrear] = useState(false);
  const [asignaturaParaCrear, setAsignaturaParaCrear] = useState<AsignaturaData | null>(null);
  const [loadingCoordinadores, setLoadingCoordinadores] = useState(false);
  
  const [asignaturaParaVerAfiche, setAsignaturaParaVerAfiche] = useState<AsignaturaData | null>(null);
  const [datosAficheLocal, setDatosAficheLocal] = useState<any>(null);
  const [buscandoAficheLocal, setBuscandoAficheLocal] = useState(false);

  // Estados Formulario - SEMESTRE
  const [semestreAnio, setSemestreAnio] = useState(new Date().getFullYear().toString());
  const [semestrePeriodo, setSemestrePeriodo] = useState("1");
  const [semestreFinal, setSemestreFinal] = useState("");

  // Estados Formulario - FECHAS
  const [entregaAntecedentes, setEntregaAntecedentes] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaTermino, setFechaTermino] = useState("");
  
  // Estados Formulario - OTROS
  const [tipoAyudantia, setTipoAyudantia] = useState("");
  const [tipoRemuneracion, setTipoRemuneracion] = useState("");
  const [horasMensuales, setHorasMensuales] = useState<number | "">("");
  const [cantAyudantes, setCantAyudantes] = useState<number | "">("");
  const [descripciones, setDescripciones] = useState<string[]>([""]);
  const [horarioFijo, setHorarioFijo] = useState(false);
  const [horarios, setHorarios] = useState<HorarioSeleccionado[]>([]);
  const [diaActual, setDiaActual] = useState(opcionesDias[0].value);
  const [bloqueActual, setBloqueActual] = useState(opcionesBloques[0].value);

  // --- NUEVO: ESTADO DE ERRORES DE VALIDACIÓN ---
  const [errores, setErrores] = useState<Record<string, string>>({});

  const { mutate: abrirConcurso } = useAbrirConcurso();
  const { mutate: cerrarConcurso } = useCerrarConcurso();
  const crearConcurso = useCrearConcurso();

  // --- Efecto para actualizar el string final del semestre ---
  useEffect(() => {
    setSemestreFinal(`${semestreAnio}-${semestrePeriodo}`);
  }, [semestreAnio, semestrePeriodo]);

  // --- Lógica de Filtrado ---
  const asignaturasFiltradas = useMemo(
    () => asignaturas.filter((a) => a.nombre.toLowerCase().includes(busqueda.toLowerCase())),
    [asignaturas, busqueda]
  );

  const totalPaginasFiltradas = Math.ceil(asignaturasFiltradas.length / (itemsPorPagina || 1));
  const indiceInicio = (paginaActual - 1) * (itemsPorPagina || 1);
  const indiceFin = (paginaActual - 1) * (itemsPorPagina || 1) + (itemsPorPagina || 1);
  const asignaturasPaginadas = asignaturasFiltradas.slice(indiceInicio, indiceFin);

  // --- Handlers ---
  const handleAbrirConcurso = (id: string) => {
    abrirConcurso(id, {
      onSuccess: () => {
        setMensajePopup("Solicitud de apertura enviada. Podrá crear el afiche una vez aprobada.");
        setMostrarPopup(true);
      },
      onError: () => {
        setMensajePopup("Error al solicitar apertura.");
        setMostrarPopup(true);
      },
    });
  };

  const abrirModalCrear = (a: AsignaturaData) => {
    const asigFull = asignaturasConCoordinadores.find(item => item.id === a.id);
    
    setAsignaturaParaCrear({
        ...a,
        coordinadores: asigFull?.coordinadores || []
    });
    
    const semestreStr = String(a.semestre || "");
    if (semestreStr && semestreStr.includes("-")) {
        const parts = semestreStr.split("-");
        setSemestreAnio(parts[0]);
        setSemestrePeriodo(parts[1]);
    } else {
        setSemestreAnio(new Date().getFullYear().toString());
        setSemestrePeriodo("1");
    }

    setDescripciones([""]);
    setEntregaAntecedentes("");
    setFechaInicio("");
    setFechaTermino("");
    setTipoAyudantia("");
    setTipoRemuneracion("");
    setHorasMensuales("");
    setHorarioFijo(false);
    setHorarios([]);
    setDiaActual(opcionesDias[0].value);
    setBloqueActual(opcionesBloques[0].value);
    setCantAyudantes("");
    setErrores({}); // Limpiar errores
    setMostrarModalCrear(true);
  };

  const agregarDescripcion = () => setDescripciones((d) => [...d, ""]);
  const quitarDescripcion = (idx: number) => setDescripciones((d) => d.filter((_, i) => i !== idx));
  const cambiarDescripcion = (idx: number, value: string) => setDescripciones((d) => d.map((x, i) => (i === idx ? value : x)));

  const handleAgregarHorario = () => {
    if (!diaActual || !bloqueActual) return;
    const existe = horarios.find(h => h.dia === diaActual && h.bloque === bloqueActual);
    if (existe) {
      setMensajePopup("Horario ya añadido");
      setMostrarPopup(true);
      return;
    }
    setHorarios(prev => [...prev, {dia: diaActual, bloque: bloqueActual}]);
  };

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

  const handleSubmitCrear = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!asignaturaParaCrear) return;

    // --- LÓGICA DE VALIDACIÓN CON ALERTAS ---
    const nuevosErrores: Record<string, string> = {};
    if (!entregaAntecedentes) nuevosErrores.entrega = "Obligatorio";
    if (!fechaInicio) nuevosErrores.inicio = "Obligatorio";
    if (!fechaTermino) nuevosErrores.termino = "Obligatorio";
    if (!tipoAyudantia) nuevosErrores.tipo = "Seleccione";
    if (!tipoRemuneracion) nuevosErrores.pago = "Seleccione";
    if (!horasMensuales || Number(horasMensuales) <= 0) nuevosErrores.horas = "Inválido";
    if (!cantAyudantes || Number(cantAyudantes) <= 0) nuevosErrores.vacantes = "Mínimo 1";
    if (descripciones.some(d => !d.trim())) nuevosErrores.desc = "Requerido";

    if(!asignaturaParaCrear.coordinadores || asignaturaParaCrear.coordinadores.length === 0) {
      setMensajePopup("Asignatura sin coordinadores asignados.");
      setMostrarPopup(true);
      return;
    }

    // --- RESTRICCIONES DE FECHA ---
    const dateEntrega = new Date(entregaAntecedentes);
    const dateInicio = new Date(fechaInicio);
    const dateTermino = new Date(fechaTermino);

    // 1. La ayudantía no puede empezar antes de cerrar la entrega
    if (dateInicio <= dateEntrega) {
      nuevosErrores.inicio = "Posterior a entrega";
    }

    // 2. La fecha de fin no puede ser antes del inicio
    if (dateTermino <= dateInicio) {
      nuevosErrores.termino = "Posterior a inicio";
    }

    if (Object.keys(nuevosErrores).length > 0) {
        setErrores(nuevosErrores);
        return;
    }

    const payload = {
      id_asignatura: asignaturaParaCrear.id,
      semestre: semestreFinal, 
      entrega_antecedentes: new Date(entregaAntecedentes),
      fecha_inicio: new Date(fechaInicio),
      fecha_termino: new Date(fechaTermino),
      tipo_ayudantia: tipoAyudantia,
      tipo_remuneracion: tipoRemuneracion,
      horas_mensuales: Number(horasMensuales) || 0,
      horario_fijo: Boolean(horarioFijo),
      horarios: horarioFijo ? horarios: [],
      cant_ayudantes: Number(cantAyudantes) || 0,
      estado: "abierto",
      rut_secretaria: String(rutSecretaria), 
      descripcion: descripciones,
      coordinadores: asignaturaParaCrear.coordinadores.map(c => c.rut),
    };

    crearConcurso.mutate(payload, {
      onSuccess: () => {
        setMostrarPopup(true);
        setMensajePopup("Concurso y afiche creados exitosamente.");
        setMostrarModalCrear(false);
      },
      onError: () => {
        setMensajePopup("Error al crear el afiche.");
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
      let datosConcurso = Array.isArray(data) && data.length > 0 ? data[0] : (data && data.id ? data : null);

      if (datosConcurso) {
        const asigFull = asignaturasConCoordinadores.find(item => item.id === a.id);
        const coordinadoresNombres = (datosConcurso.coordinadores || []).map((i: any) => {
          if (typeof i === 'object' && i.nombres) return { rut: i.rut, nombreCompleto: `${i.nombres} ${i.apellidos}` };
          const coord = (asigFull?.coordinadores || []).find((c: any) => c.rut === String(i));
          return { rut: String(i), nombreCompleto: coord ? `${coord.nombres} ${coord.apellidos}` : String(i) };
        });
        setDatosAficheLocal({ ...datosConcurso, asignatura: {nombre: a.nombre}, coordinadores: coordinadoresNombres });
      }
    } catch (err) {
      console.error(err);
      setMensajePopup("Error consultando el afiche.");
      setMostrarPopup(true);
    } finally {
      setBuscandoAficheLocal(false);
    }
  };

  const confirmarCierre = (id: string) => { setIdAConfirmar(id); setMostrarConfirmacion(true); };
  const ejecutarCierreConfirmado = async () => { if (idAConfirmar) cerrarConcurso(idAConfirmar); setMostrarConfirmacion(false); setIdAConfirmar(null); };

  const handleDateClick = (e: React.MouseEvent<HTMLInputElement>) => {
    e.currentTarget.showPicker();
  };

  // --- HELPER PARA CLASES DE CAMPO CON ERROR ---
  const getFieldClass = (errKey: string) => 
    `block w-full rounded-lg border py-2.5 px-3 shadow-sm focus:ring-2 focus:ring-inset sm:text-sm transition-all duration-200 cursor-pointer ${
        errores[errKey] 
        ? 'border-red-500 ring-red-100 focus:ring-red-500 bg-red-50 text-red-900 placeholder:text-red-300' 
        : 'border-slate-300 focus:ring-indigo-600 focus:border-indigo-600 bg-white text-slate-900 placeholder:text-slate-400 font-medium'
    }`;

  return (
    <div className="w-full">
        
        {/* TÍTULO DE LA SECCIÓN (Agregado) */}
        <div className="mb-5 flex items-center gap-2 border-b border-gray-100 pb-4">
            <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
                <BookOpen className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">
                Todas las Asignaturas
            </h2>
        </div>

        {/* FILTROS Y PAGINACIÓN */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Buscar asignatura..."
                    value={busqueda}
                    onChange={(e) => { setBusqueda(e.target.value); setPaginaActual(1); }}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all text-sm"
                />
            </div>
            
            {/* CONTENEDOR DE FILAS Y NAVEGACIÓN */}
            <div className="flex items-center gap-3 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
                {/* Input de Cantidad de Filas */}
                <div className="flex items-center gap-2 pl-3 border-r border-gray-100 pr-3">
                    <span className="text-xs text-gray-600 font-medium">Filas:</span>
                    <input
                        type="number"
                        min="1"
                        max="100"
                        value={isNaN(itemsPorPagina) ? "" : itemsPorPagina}
                        onChange={handleChangeItemsPorPagina}
                        className="w-12 text-center text-sm border-gray-100 text-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 py-1"
                    />
                </div>

                {/* Botones de Navegación */}
                <div className="flex items-center gap-1 pr-1">
                    <button 
                        onClick={() => setPaginaActual(p => Math.max(1, p - 1))} 
                        disabled={paginaActual === 1} 
                        className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-30 text-gray-600 transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-medium text-gray-700 min-w-[60px] text-center">
                        {paginaActual} / {totalPaginasFiltradas || 1}
                    </span>
                    <button 
                        onClick={() => setPaginaActual(p => Math.min(totalPaginasFiltradas, p + 1))} 
                        disabled={paginaActual === totalPaginasFiltradas} 
                        className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-30 text-gray-600 transition-colors"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>

        {/* TABLA PRINCIPAL */}
        <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm bg-white">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-slate-50">
                    <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Asignatura</th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado Actual</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Gestión</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {asignaturasPaginadas.length > 0 ? (
                        asignaturasPaginadas.map((a) => {
                            const estadoLower = a.estado?.trim().toLowerCase();
                            return (
                                <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{a.nombre}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                                            estadoLower === 'abierto' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                            estadoLower === 'cerrado' ? 'bg-red-50 text-red-700 border-red-200' :
                                            'bg-amber-50 text-amber-700 border-amber-200'
                                        }`}>
                                            {a.estado}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="flex justify-end gap-3">
                                            {estadoLower === "cerrado" && !a.abierta_postulacion && (
                                                <button onClick={() => handleAbrirConcurso(a.id.toString())} className="text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors text-xs font-semibold border border-indigo-100">
                                                    Solicitar Apertura
                                                </button>
                                            )}
                                            {estadoLower === "pendiente" && a.abierta_postulacion && (
                                                <button onClick={() => abrirModalCrear(a)} className="flex items-center gap-1.5 text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-1.5 rounded-lg transition-all text-xs font-semibold shadow-sm hover:shadow">
                                                    <Plus className="w-3.5 h-3.5" /> Crear Afiche
                                                </button>
                                            )}
                                            {estadoLower === "pendiente" && !a.abierta_postulacion && (
                                                <button onClick={() => confirmarCierre(a.id.toString())} className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors text-xs font-semibold border border-red-100">
                                                    Cancelar
                                                </button>
                                            )}
                                            {estadoLower === "abierto" && (
                                                <>
                                                    <button onClick={() => abrirModalVerAfiche(a)} className="flex items-center gap-1.5 text-slate-600 hover:text-slate-800 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-colors text-xs font-semibold shadow-sm">
                                                        <Eye className="w-3.5 h-3.5" /> Ver
                                                    </button>
                                                    <button onClick={() => confirmarCierre(a.id.toString())} className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors text-xs font-semibold border border-red-100">
                                                        Cerrar
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan={3} className="px-6 py-16 text-center text-gray-500">
                                <div className="flex flex-col items-center justify-center">
                                    <div className="bg-slate-50 p-4 rounded-full mb-3 border border-slate-100">
                                        <Search className="w-6 h-6 text-slate-400" />
                                    </div>
                                    <p className="text-sm font-medium">No se encontraron asignaturas.</p>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>

        {/* --- MODAL CREAR AFICHE --- */}
        {mostrarModalCrear && asignaturaParaCrear && (
             <div className="fixed inset-0 z-[100] overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => { setMostrarModalCrear(false); setAsignaturaParaCrear(null); }} />

                    <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 w-full max-w-4xl border border-slate-100">
                        {/* Header */}
                        <div className="bg-white px-6 py-5 border-b border-slate-100 flex justify-between items-center sticky top-0 z-10">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Crear Llamado a Concurso</h3>
                                <p className="text-sm text-indigo-600 font-medium mt-0.5">{asignaturaParaCrear.nombre}</p>
                            </div>
                            <button onClick={() => { setMostrarModalCrear(false); setAsignaturaParaCrear(null); }} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-50 transition-colors">
                                <XCircle className="w-6 h-6"/>
                            </button>
                        </div>
                        
                        <div className="px-6 py-6 sm:p-8 max-h-[75vh] overflow-y-auto bg-white custom-scrollbar">
                            <form onSubmit={handleSubmitCrear} className="space-y-8">
                                
                                <div className="bg-slate-50/50 p-6 rounded-xl border border-slate-100 shadow-sm">
                                    <h4 className="text-sm font-semibold text-indigo-900 mb-5 flex items-center gap-2">
                                        <CalendarDays className="w-5 h-5 text-indigo-500"/> Definición de Plazos
                                    </h4>
                                    
                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="w-full max-w-md">
                                            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">Semestre Académico</label>
                                            <div className="flex gap-2">
                                                <div className="relative flex-1">
                                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                        <Calendar className="h-4 w-4 text-slate-400" />
                                                    </div>
                                                    <select 
                                                        value={semestreAnio} 
                                                        onChange={(e) => setSemestreAnio(e.target.value)} 
                                                        className="block w-full rounded-lg border-slate-200 pl-10 py-2.5 text-slate-900 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-medium cursor-pointer"
                                                    >
                                                        {Array.from({length: 6}, (_, i) => new Date().getFullYear() + i - 1).map(year => (
                                                            <option key={year} value={year}>{year}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <select 
                                                    value={semestrePeriodo} 
                                                    onChange={(e) => setSemestrePeriodo(e.target.value)}
                                                    className="block w-32 rounded-lg border-slate-200 py-2.5 text-slate-900 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-medium cursor-pointer"
                                                >
                                                    <option value="1">1° Semestre</option>
                                                    <option value="2">2° Semestre</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">Límite Antecedentes</label>
                                                <input type="date" value={entregaAntecedentes} onChange={(e) => {setEntregaAntecedentes(e.target.value); setErrores(p => ({...p, entrega: ''}));}} onClick={handleDateClick} className={getFieldClass('entrega')} />
                                                {errores.entrega && <p className="text-[10px] text-red-600 font-bold mt-1 uppercase tracking-tighter">{errores.entrega}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">Inicio Ayudantía</label>
                                                <input type="date" value={fechaInicio} onChange={(e) => {setFechaInicio(e.target.value); setErrores(p => ({...p, inicio: ''}));}} onClick={handleDateClick} className={getFieldClass('inicio')} />
                                                {errores.inicio && <p className="text-[10px] text-red-600 font-bold mt-1 uppercase tracking-tighter">{errores.inicio}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">Término Ayudantía</label>
                                                <input type="date" value={fechaTermino} onChange={(e) => {setFechaTermino(e.target.value); setErrores(p => ({...p, termino: ''}));}} onClick={handleDateClick} className={getFieldClass('termino')} />
                                                {errores.termino && <p className="text-[10px] text-red-600 font-bold mt-1 uppercase tracking-tighter">{errores.termino}</p>}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-5">
                                        <h4 className="text-sm font-semibold text-indigo-900 flex items-center gap-2">
                                            <Briefcase className="w-4 h-4 text-indigo-500"/> Configuración del Cargo
                                        </h4>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-medium text-slate-700 mb-1.5">Tipo de Ayudantía</label>
                                                <select value={tipoAyudantia} onChange={(e) => {setTipoAyudantia(e.target.value); setErrores(p => ({...p, tipo: ''}));}} className={getFieldClass('tipo')}>
                                                    <option value="">Seleccionar...</option>
                                                    <option value="Docente">Docente</option>
                                                    <option value="Investigacion">Investigación</option>
                                                </select>
                                                {errores.tipo && <p className="text-[10px] text-red-600 font-bold mt-1 uppercase tracking-tighter">{errores.tipo}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-700 mb-1.5">Remuneración</label>
                                                <select value={tipoRemuneracion} onChange={(e) => {setTipoRemuneracion(e.target.value); setErrores(p => ({...p, pago: ''}));}} className={getFieldClass('pago')}>
                                                    <option value="">Seleccionar...</option>
                                                    <option value="Ad Honorem">Ad Honorem</option>
                                                    <option value="Remunerada">Remunerada</option>
                                                </select>
                                                {errores.pago && <p className="text-[10px] text-red-600 font-bold mt-1 uppercase tracking-tighter">{errores.pago}</p>}
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-700 mb-1.5">Horas Mensuales</label>
                                                    <input type="number" min="0" value={horasMensuales} placeholder={"Ej: 22"} onChange={(e) => {setHorasMensuales(Number(e.target.value)); setErrores(p => ({...p, horas: ''}));}} className={getFieldClass('horas')} />
                                                    {errores.horas && <p className="text-[10px] text-red-600 font-bold mt-1 uppercase tracking-tighter">{errores.horas}</p>}
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-700 mb-1.5">Cantidad de Ayudantes</label>
                                                    <input type="number" min="0" value={cantAyudantes} placeholder={"Ej: 3"} onChange={(e) => {setCantAyudantes(Number(e.target.value)); setErrores(p => ({...p, vacantes: ''}));}} className={getFieldClass('vacantes')} />
                                                    {errores.vacantes && <p className="text-[10px] text-red-600 font-bold mt-1 uppercase tracking-tighter">{errores.vacantes}</p>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-5">
                                        <h4 className="text-sm font-semibold text-indigo-900 flex items-center gap-2">
                                            <Users className="w-4 h-4 text-indigo-500"/> Equipo Responsable
                                        </h4>
                                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 max-h-[240px] overflow-y-auto min-h-[120px] flex flex-col">
                                            {loadingCoordinadores ? (
                                                <div className="flex-1 flex flex-col items-center justify-center space-y-2 animate-pulse">
                                                    <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                                                    <p className="text-xs text-slate-400 font-medium">Cargando equipo...</p>
                                                </div>
                                            ) : asignaturaParaCrear.coordinadores?.length ? (
                                                <ul className="space-y-2">
                                                    {asignaturaParaCrear.coordinadores.map(c => (
                                                        <li key={c.rut} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                                                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs shrink-0">
                                                                {c.nombres.charAt(0)}{c.apellidos.charAt(0)}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-semibold text-slate-800 truncate">{c.nombres} {c.apellidos}</p>
                                                                <p className="text-xs text-slate-500">{c.rut}</p>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <div className="text-center py-8">
                                                    <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2"/>
                                                    <p className="text-sm text-slate-500">Sin coordinadores asignados.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-indigo-50/40 p-5 rounded-xl border border-indigo-100">
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-6 items-center">
                                            <input type="checkbox" checked={horarioFijo} onChange={(e) => setHorarioFijo(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer" />
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-sm font-medium text-slate-900">Requiere Horario Fijo</label>
                                            <p className="text-xs text-slate-500">Active esta opción si el ayudante debe cumplir horas en bloques específicos.</p>
                                            
                                            {horarioFijo && (
                                                <div className="mt-4 animate-in fade-in slide-in-from-top-1">
                                                    <div className="flex flex-col sm:flex-row gap-3 items-end bg-white p-3 rounded-lg border border-indigo-100 shadow-sm">
                                                        <div className="w-full">
                                                            <label className="text-xs font-medium text-slate-500 mb-1 block">Día</label>
                                                            <select value={diaActual} onChange={(e) => setDiaActual(e.target.value)} className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-xs sm:leading-6">
                                                                {opcionesDias.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                                                            </select>
                                                        </div>
                                                        <div className="w-full">
                                                            <label className="text-xs font-medium text-slate-500 mb-1 block">Bloque</label>
                                                            <select value={bloqueActual} onChange={(e) => setBloqueActual(e.target.value)} className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-xs sm:leading-6">
                                                                {opcionesBloques.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                                                            </select>
                                                        </div>
                                                        <button type="button" onClick={handleAgregarHorario} className="bg-indigo-600 text-white px-4 py-2 rounded-md text-xs font-semibold shadow-sm hover:bg-indigo-500 w-full sm:w-auto">
                                                            Agregar
                                                        </button>
                                                    </div>
                                                    
                                                    <div className="flex flex-wrap gap-2 mt-3">
                                                        {horarios.map((h, idx) => (
                                                            <span key={idx} className="inline-flex items-center gap-1.5 bg-white border border-indigo-200 px-2.5 py-1 rounded-md text-xs font-medium text-indigo-700 shadow-sm">
                                                                {h.dia} - {h.bloque}
                                                                <button type="button" onClick={() => setHorarios(prev => prev.filter((_, i) => i !== idx))} className="text-indigo-400 hover:text-indigo-600">
                                                                    <XCircle className="w-3.5 h-3.5"/>
                                                                </button>
                                                            </span>
                                                        ))}
                                                        {horarios.length === 0 && <span className="text-xs text-slate-400 italic py-1">Sin horarios añadidos.</span>}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className={`p-5 rounded-xl border transition-all ${errores.desc ? 'bg-red-50 border-red-200' : 'bg-white border-slate-100 shadow-sm'}`}>
                                    <label className="text-sm font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                                        <AlignLeft className="w-4 h-4 text-indigo-500"/> Requisitos Específicos
                                    </label>
                                    <div className="space-y-3">
                                        {descripciones.map((desc, idx) => (
                                            <div key={idx} className="flex gap-2">
                                                <div className="flex-1 relative rounded-md shadow-sm">
                                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                        <span className="text-slate-400 sm:text-sm font-semibold">{idx + 1}.</span>
                                                    </div>
                                                    <input value={desc} onChange={(e) => {cambiarDescripcion(idx, e.target.value); setErrores(p => ({...p, desc: ''}));}} placeholder="Describa un requisito para postular..." className={`${getFieldClass('desc')} pl-8 ${errores.desc && !desc.trim() ? 'border-red-500' : ''}`} />
                                                </div>
                                                <button type="button" onClick={() => quitarDescripcion(idx)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors">
                                                    <Trash2 className="w-5 h-5"/>
                                                </button>
                                            </div>
                                        ))}
                                        <button type="button" onClick={agregarDescripcion} className="text-sm text-indigo-600 font-semibold hover:text-indigo-800 flex items-center gap-1.5 mt-2 px-1">
                                            <Plus className="w-4 h-4"/> Añadir otro requisito
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                        
                        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 z-10">
                            <button type="button" onClick={() => { setMostrarModalCrear(false); setAsignaturaParaCrear(null); }} className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50">
                                Cancelar
                            </button>
                            <button onClick={handleSubmitCrear} className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4"/> Generar Afiche
                            </button>
                        </div>
                    </div>
                </div>
             </div>
        )}

        {/* --- MODALES RESTANTES (SIN CAMBIOS) --- */}
        {mostrarConfirmacion && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 transform scale-100 border border-slate-100">
                    <div className="flex items-center gap-4 text-red-600 mb-4">
                        <div className="bg-red-50 p-3 rounded-full"><AlertTriangle className="w-6 h-6" /></div>
                        <h3 className="text-lg font-bold text-slate-900">¿Cerrar concurso?</h3>
                    </div>
                    <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                        Esta acción cerrará el proceso de postulación actual. Tendrás que solicitar la apertura nuevamente si deseas reactivarlo.
                    </p>
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setMostrarConfirmacion(false)} className="px-4 py-2 text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors">Cancelar</button>
                        <button onClick={ejecutarCierreConfirmado} className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg shadow-sm text-sm font-medium transition-colors">Sí, cerrar</button>
                    </div>
                </div>
            </div>
        )}

        {asignaturaParaVerAfiche && (
             <div className="fixed inset-0 z-[100] overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => { setAsignaturaParaVerAfiche(null); setDatosAficheLocal(null); }} />
                    
                    <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 w-full max-w-5xl h-[85vh] flex flex-col">
                        <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-white">
                            <div>
                                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-indigo-600"/>
                                    Vista Previa del Afiche
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">{asignaturaParaVerAfiche.nombre}</p>
                            </div>
                            <button onClick={() => { setAsignaturaParaVerAfiche(null); setDatosAficheLocal(null); }} className="text-slate-400 hover:text-slate-600 transition-colors"><XCircle className="w-8 h-8"/></button>
                        </div>
                        <div className="flex-1 bg-slate-50 p-4 sm:p-8 overflow-hidden flex flex-col">
                             {buscandoAficheLocal ? (
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-3"></div>
                                        <p className="text-slate-500 font-medium">Generando vista previa...</p>
                                    </div>
                                </div>
                            ) : datosAficheLocal ? (
                                <div className="flex-1 shadow-lg rounded-lg overflow-hidden bg-white border border-slate-200">
                                    <PDFViewerDynamic width="100%" height="100%">
                                        <AfichePDFDocument datos={datosAficheLocal}/>
                                    </PDFViewerDynamic>
                                </div>
                            ) : (
                                <div className="flex h-full items-center justify-center flex-col text-gray-500">
                                    <div className="bg-slate-200 p-4 rounded-full mb-3">
                                        <AlertTriangle className="w-8 h-8 text-slate-400"/>
                                    </div>
                                    <p className="font-medium">No se encontraron datos del afiche.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
             </div>
        )}

        {mostrarPopup && (
             <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center border border-slate-100">
                    <div className="mx-auto bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mb-4 ring-8 ring-indigo-50/50">
                        <CheckCircle2 className="w-8 h-8 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Notificación</h3>
                    <p className="text-slate-600 font-medium mb-6 text-sm">{mensajePopup}</p>
                    <button onClick={() => setMostrarPopup(false)} className="w-full py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-semibold transition-all shadow-sm">Entendido</button>
                </div>
            </div>
        )}
    </div>
  );
}