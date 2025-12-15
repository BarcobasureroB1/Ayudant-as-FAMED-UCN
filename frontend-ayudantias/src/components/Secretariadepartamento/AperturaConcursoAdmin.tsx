"use client";

import React, { useMemo, useState } from "react";
import {
  useAbrirConcurso,
  useCerrarConcurso,
} from "@/hooks/useAsignaturas";
import {
  useCrearConcurso,
  useCancelarAficheConcurso, useBuscarDatosAfiche
} from "@/hooks/useConcursoPostulacion";
import api from "@/api/axios";
import {Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import dynamic from "next/dynamic";

const PDFViewerDynamic = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  {
    ssr: false,
    loading: () => (
      <p className="text-center text-black flex-1 pt-20">Cargando Visor...</p>
    )
  }
)

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
}

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

interface HorarioSeleccionado {
  dia: string;
  bloque: string;
}

const formatDate = (dateString: string) => {
  if (!dateString)
  {
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
}

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 30,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#003366",
    paddingBottom: 10,
  },
  headerText: {
    fontSize: 10,
    color: "#003366",
  },
  logo: {
    width: 100,
    height: "auto",
  },
  title: {
    fontSize: 16,
    textAlign: "center",
    marginVertical: 15,
    fontWeight: "bold",
    color: "#003366",
  },
  subtitle: {
    fontSize: 11,
    textAlign: "center",
    marginHorizontal: 40,
    marginBottom: 15,
  },
  table: {
    borderWidth: 1,
    borderColor: "#000",
  },
  tableRow: {
    flexDirection: "row",
  },
  tableCol: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#000",
    padding: 5,
  },
  tableColHalf: {
    flex: 0.5,
    borderWidth: 1,
    borderColor: "#000",
    padding: 5,
  },
  tableColSmall: {
    flex: 0.3,
    borderWidth: 1,
    borderColor: "#000",
    padding: 5,
  },
  tableColLarge: {
    flex: 0.7,
    borderWidth: 1,
    borderColor: "#000",
    padding: 5,
  },
  cellLabel: {
    fontSize: 10,
    fontWeight: "bold",
  },
  cellText: {
    fontSize: 10,
    paddingLeft: 4,
  },
  inLineRow:{
    flexDirection: 'row',
    alignItems: 'center'
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 5,
    color: "#003366",
  },
  listItem: {
    fontSize: 10,
    marginLeft: 10,
    marginBottom: 3,
  },
  footer: {
    marginTop: 30,
    textAlign: "center",
  },
  footerText: {
    fontSize: 11,
    fontWeight: "bold",
  },
  footerDate: {
    fontSize: 14,
    marginTop: 4,
    backgroundColor: "#FFFF00",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius:2,
    alignSelf: 'center'
  },
});

const AfichePDFDocument = ({ datos }: { datos: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View style={{ flexDirection: "column" }}>
          <Text style={styles.headerText}>FACULTAD DE MEDICINA</Text>
          <Text style={styles.headerText}>SECRETARÍA DOCENTE</Text>
        </View>
        <Image
          style={styles.logo}
          src="/logo-ucn.png"
        />
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
  const [cantAyudantes, setCantAyudantes] = useState<number | "">("");
  const [descripciones, setDescripciones] = useState<string[]>([""]);


  const [horarioFijo, setHorarioFijo] = useState(false);
  const [horarios, setHorarios] = useState<HorarioSeleccionado[]>([]);
  const [diaActual, setDiaActual] = useState(opcionesDias[0].value);
  const [bloqueActual, setBloqueActual] = useState(opcionesBloques[0].value);

  const [asignaturaParaVerAfiche, setAsignaturaParaVerAfiche] = useState<AsignaturaData | null>(null);
  const [datosAficheLocal, setDatosAficheLocal] = useState<any>(null);
  const [buscandoAficheLocal, setBuscandoAficheLocal] = useState(false);


  const [aficheExists, setAficheExists] = useState<Record<number, boolean | undefined>>({});

  const { data: afiche, isLoading, isError } = useBuscarDatosAfiche( Number(idAConfirmar) ?? undefined );

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


  const abrirModalCrear = async (a: AsignaturaData) => {
    console.log("datos de la asignatura", a);
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
    setHorarios([]);
    setDiaActual(opcionesDias[0].value);
    setBloqueActual(opcionesBloques[0].value);
    setCantAyudantes("");
    setMostrarModalCrear(true);

    try{
      const resp = await api.get('/asignatura/coordinadores/sinfiltro/dif');
      const listaAsig = resp.data;

      if (Array.isArray(listaAsig))
      {
        const asignaturaCoord = listaAsig.find((item: any) => item.id === a.id);
        if (asignaturaCoord && asignaturaCoord.coordinadores)
        {
          console.log("coordinadores:", asignaturaCoord.coordinadores);
          setAsignaturaParaCrear((prev) => 
          prev && prev.id === a.id
            ? {...prev, coordinadores: asignaturaCoord.coordinadores}
            : prev
          );
        } 
      }
    } catch (error) {
      console.error("error al cargar los coordinadores", error);
    }
  };

  const agregarDescripcion = () => setDescripciones((d) => [...d, ""]);
  const quitarDescripcion = (idx: number) => setDescripciones((d) => d.filter((_, i) => i !== idx));
  const cambiarDescripcion = (idx: number, value: string) =>
    setDescripciones((d) => d.map((x, i) => (i === idx ? value : x)));


  const handleAgregarHorario = () => {
    if (!diaActual || !bloqueActual)
    {
      setMensajePopup("Selecciona un dia y un bloque");
      setMostrarPopup(true);
      return;      
    }
    const existe = horarios.find(h => h.dia === diaActual && h.bloque === bloqueActual);
    if (existe)
    {
      setMensajePopup("Ese horario ya fue añadido");
      setMostrarPopup(true);
      return;
    }

    setHorarios(prev => [...prev, {dia: diaActual, bloque: bloqueActual}]);
  };

  const handleQuitarHorario = (index: number) => {
    setHorarios(prev => prev.filter((_, i) => i !== index));
  }

  const handleSubmitCrear = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!asignaturaParaCrear) return;

    if(!asignaturaParaCrear.coordinadores || asignaturaParaCrear.coordinadores.length === 0)
    {
      setMensajePopup("Esta asignatura no tiene coordinadores asignados, Porfavor vaya a la seccion 'Gestionar Coordinadores' y asignelos antes de crear el afiche.");
      setMostrarPopup(true);
      return;
    }

    if (!fechaInicio || !fechaTermino || !tipoAyudantia || !tipoRemuneracion || descripciones.length === 0 || descripciones.some(d => d.trim() === "")) {
      setMensajePopup("Completa: fecha inicio, fecha término, tipo ayudantía, tipo remuneración y al menos una descripción válida.");
      setMostrarPopup(true);
      return;
    }

    if (horarioFijo && horarios.length === 0)
    {
      setMensajePopup("Si seleccionas 'Horario fijo', se debe añadir al menos un bloque horario");
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
      horarios: horarioFijo ? horarios: [],
      cant_ayudantes: Number(cantAyudantes) || 0,
      estado: "abierto",
      rut_secretaria: String(rutSecretaria), 
      descripcion: descripciones,
      coordinadores: asignaturaParaCrear.coordinadores.map(c => c.rut),
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
      let datosConcurso = null;
      if (Array.isArray(data) && data.length > 0) {
        datosConcurso = data[0];
      }else if (data && typeof data === 'object' && !Array.isArray(data) && data.id)
      {
        datosConcurso = data;
      }

      if (datosConcurso)
      {
        const coordinadoresNombres = (
          datosConcurso.coordinadores || []
        ).map((i: any) => {
          if (typeof i === 'object' && i !== null && i.nombres)
            {
              return {
                rut: i.rut,
                nombreCompleto: `${i.nombres} ${i.apellidos}`
              }
            }

          const rutString = String(i);
          const coord = (a.coordinadores || []).find((c) => c.rut === rutString);

          return {
            rut: rutString,
            nombreCompleto: coord
              ? `${coord.nombres} ${coord.apellidos}`
              : rutString,
          };
        });

        setDatosAficheLocal({
          ...datosConcurso,
          asignatura: {nombre: a.nombre},
          coordinadores: coordinadoresNombres,
        });
        setAficheExists((prev) => ({ ...prev, [a.id]: true}));
      } else {
        setDatosAficheLocal(null);
        setAficheExists((prev) => ({ ...prev, [a.id]: false}));
      }
    } catch (err) {
      console.error(err);
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
        
        let id_concurso: number | null = null;

        try {
          const resp = await api.get(`llamado-postulacion/${idAConfirmar}`);
          const data = resp.data;
          if (Array.isArray(data) && data.length > 0) id_concurso = data[0].id ?? null;
          else if (data && typeof data === "object" && data.id) id_concurso = data.id;
          
        } catch (err) {
          console.error(err);
          setMensajePopup("Concurso cerrado, pero ocurrió un error al buscar el afiche.");
          setMostrarPopup(true);
          return;
        }

        if(id_concurso){
          cancelarAfiche.mutate(id_concurso, {
            onSuccess: () => {
              setMensajePopup("Concurso cerrado y afiche cancelado correctamente.");
              setMostrarPopup(true);
              setAficheExists((prev) => ({ ...prev, [Number(idAConfirmar)]: false }));
            },
            onError: () => {
              setMensajePopup("Concurso cerrado pero error al cancelar afiche (intenta manualmente).");
              setMostrarPopup(true);
            },
          });
        } else {
            setMensajePopup("Concurso cerrado, no se encontró un afiche activo para cancelar.");
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
                          <input value={entregaAntecedentes} onChange={(e) => setEntregaAntecedentes(e.target.value)} type="date" className="w-full mt-1 border rounded text-black px-2 py-1 cursor-pointer" onClick={(e) => e.currentTarget.showPicker()} />
                        </label>

                        <label className="text-sm text-black ">
                          Fecha inicio
                          <input value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} type="date" className="w-full mt-1 border rounded text-black px-2 py-1 cursor-pointer" onClick={(e) => e.currentTarget.showPicker()}/>
                        </label>

                        <label className="text-sm  text-black ">
                          Fecha término
                          <input value={fechaTermino} onChange={(e) => setFechaTermino(e.target.value)} type="date" className="w-full mt-1 border rounded text-black px-2 py-1 cursor-pointer" onClick={(e) => e.currentTarget.showPicker()}/>
                        </label>

                        <label className="text-sm text-black ">
                          Tipo ayudantía
                          <select value={tipoAyudantia} onChange={(e) => setTipoAyudantia(e.target.value)} className="w-full mt-1 border rounded text-black px-2 py-1 bg-white">
                            <option value="">Seleccione el tipo</option>
                            <option value="Docente">Docente</option>
                            <option value="Investigacion">Investigación</option>
                          </select>
                        </label>

                        <label className="text-sm text-black ">
                          Tipo remuneración
                          <select value={tipoRemuneracion} onChange={(e) => setTipoRemuneracion(e.target.value)} className="w-full mt-1 border rounded text-black px-2 py-1 bg-white">
                            <option value="">Seleccione el tipo</option>
                            <option value="Ad Honorem">Ad Honorem</option>
                            <option value="Remunerada">Remunerada</option>
                          </select>
                        </label>

                        <label className="text-sm text-black ">
                          Horas mensuales
                          <input value={horasMensuales} onChange={(e) => setHorasMensuales(e.target.value ? Number(e.target.value) : "")} type="number" min={0} className="w-full mt-1 border rounded text-black px-2 py-1" />
                        </label>
                        
                        <label className="text-sm text-black ">
                          Cant. ayudantes
                          <input value={cantAyudantes} onChange={(e) => setCantAyudantes(e.target.value ? Number(e.target.value) : "")} type="number" min={0} className="w-full mt-1 border rounded text-black px-2 py-1"/>
                        </label>

                        <div className="sm:col-span-2">
                          <label className="text-sm text-black">
                            Coordinador(es) asignado(s) a esta asignatura:
                          </label>
                            
                            <div className="w-full mt-1 border rounded text-black px-3 py-2 bg-gray-50 max-h-32 overflow-y-auto">
                              {asignaturaParaCrear.coordinadores && asignaturaParaCrear.coordinadores.length > 0 ? (
                                <ul className="space-y-1">
                                  {asignaturaParaCrear.coordinadores.map((coord) => (
                                    <li key={coord.rut} className="flex items-center gap-2 text-sm">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                      </svg>
                                      <span>Nombres: {coord.nombres} {coord.apellidos} - Rut: {coord.rut}</span>
                                    </li>
                                  )
                                )}
                                </ul>
                              ):(
                                <div className="text-red-600 text-sm font-medium flex items-center gap-2 bg-red-50 p-2 rounded">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                  No hay coordinadores asignados previamente.
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              *Estos son los coordinadores que aparecerán automáticamente en el afiche. Si necesita cambiarlos, vaya a Gestionar Coordinadores.
                            </p>
                        </div>



                        <div className="sm:col-span-1">
                          <label className="text-sm flex items-center gap-2 text-black">
                            <input type="checkbox" checked={horarioFijo} onChange={(e) => setHorarioFijo(e.target.checked)}/>
                            Horario fijo
                          </label>

                          {horarioFijo && (
                            <div className="mt-2 p-3 border rounded-lg bg-gray-50 space-y-3 shadow-inner">
                              <h5 className="text-sm font-medium text-black">Añadir Horario</h5>
                              <div className="flex flex-col sm:flex-row gap-2 items-end">
                                <label className="flex-1 text-sm text-black w-full">
                                  Día
                                  <select value={diaActual} onChange={(e) => setDiaActual(e.target.value)} className="w-full mt-1 border rounded text-black px-2 py-1 bg-white">
                                    {opcionesDias.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                                  </select>
                                </label>
                                <label className="flex-1 text-sm text-black w-full">
                                  Bloque
                                  <select value={bloqueActual} onChange={(e) => setBloqueActual(e.target.value)} className="w-full mt-1 border rounded text-black px-2 py-1 bg-white">
                                    {opcionesBloques.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                                  </select>
                                </label>
                                <button
                                  type="button"
                                  onClick={handleAgregarHorario}
                                  className="px-3 py-1 bg-green-600 text-white rounded w-full sm:w-auto mt-2 sm:mt-0 hover:bg-green-700"
                                >
                                  Añadir
                                </button>
                              </div>

                              <div className="mt-3">
                                <h5 className="text-sm font-medium text-black">Horarios añadidos:</h5>
                                {horarios.length === 0 ? (
                                  <p className="text-xs text-gray-500 italic mt-1">No hay horarios fijos añadidos</p>
                                ):(
                                  <ul className="list-none space-y-1 mt-1 max-h-24 overflow-y-auto pr-1">
                                    {horarios.map((h, index) => (
                                      <li key={index} className="flex justify-between items-center bg-white p-1.5 rounded border text-sm shadow-sm">
                                        <span className="text-black">{h.dia} - {h.bloque}</span>
                                        <button
                                          type="button"
                                          onClick={() => handleQuitarHorario(index)}
                                          className="px-2 py-0.5 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                                        >
                                          Quitar
                                        </button>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        
              
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
                <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-10 bg-black bg-opacity-40 z-50">
                  <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-4xl h-full max-h-[90vh] flex flex-col">
                    <h3 className="text-lg font-semibold mb-3 text-center text-black flex-shrink-0">Afiche / Llamado - {asignaturaParaVerAfiche.nombre}</h3>

                    {buscandoAficheLocal ? (
                      <p className="text-center text-black flex-1">Buscando datos...</p>
                    ) : datosAficheLocal ? (
                      <div className="flex-1 w-full h-full overflow-hidden">
                        <PDFViewerDynamic width="100%" height="100%">
                          <AfichePDFDocument datos={datosAficheLocal}/>
                        </PDFViewerDynamic>
                      </div>
                    ) : (
                      <div className="space-y-3 flex-1 flex items-center justify-center">
                        <p className="text-center text-gray-600">
                          No se encontraron datos de afiche para esta asignatura.
                        </p>
                      </div>

                    )}
                      <div className="flex justify-end gap-2 mt-4 flex-shrink-0">
                        <button
                          onClick={() => {
                            setAsignaturaParaVerAfiche(null);
                            setDatosAficheLocal(null);
                          }}
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
            <p className="text-gray-600 text-center">No hay asignaturas disponibles.</p>
          )}
        </InfoCard>
      </div>
    </div>
  );
}