"use client";

import React, { SyntheticEvent, useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import { useUserProfile, User } from '@/hooks/useUserProfile';
import { useAlumnoProfile, AlumnoData } from '@/hooks/useAlumnoProfile';
import { useComprobarCurriculum, useCrearCurriculum, useActividadesExtracurriculares, useActividadescientificas, useCursos_titulos_grados, useAyudantias, CurriculumResponse} from '@/hooks/useCurriculum';
import { useAuth } from '@/context/AuthContext';
import { useAyudantiasPorAlumno } from '@/hooks/useAyudantia';
import { usePostulacionesPorAlumno, useCancelarPostulacion, useCrearPostulacion } from '@/hooks/usePostulacion';
import { useAsignaturasDisponiblesPostulacion, useTodasAsignaturas } from '@/hooks/useAsignaturas';
import Cookies from 'js-cookie';
import Select from 'react-select';
import FormularioEditarCurriculum from "@/components/formularioEditarCurriculum";
import FormularioEditarPostulacion from '@/components/Postulacion/FormularioEditarPostulacion';

// IMPORTS DE ICONOS LUCIDE
import { 
    User as UserIcon, Calendar, MapPin, Phone, Mail, 
    GraduationCap, BookOpen, Award, FileText, Plus, 
    Trash2, ChevronRight, ChevronLeft, Save, Briefcase, Beaker, X, Check, 
    Clock, LayoutDashboard
} from 'lucide-react';

// --- COMPONENTES UI AUXILIARES ---

const InfoCard = ({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">{title}</h3>
        {children}
    </div>
);

const Badge = ({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "success" | "warning" | "error" }) => {
    const variants = {
        default: "bg-blue-100 text-blue-800",
        success: "bg-green-100 text-green-800",
        warning: "bg-yellow-100 text-yellow-800",
        error: "bg-red-100 text-red-800"
    };
    
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
            {children}
        </span>
    );
};

// --- COMPONENTE MONTH-YEAR PICKER (WEB VERSION) ---
interface MonthYearPickerProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (dateString: string) => void;
}

const MonthYearPickerWeb = ({ isOpen, onClose, onConfirm }: MonthYearPickerProps) => {
    const months = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 30 }, (_, i) => currentYear - i); // Últimos 30 años

    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(currentYear);

    if (!isOpen) return null;

    const handleConfirm = () => {
        // Formato MM/AAAA
        const monthStr = (selectedMonth + 1).toString().padStart(2, '0');
        onConfirm(`${monthStr}/${selectedYear}`);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-600"/> Seleccionar Periodo
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 flex flex-col md:flex-row gap-6 h-80">
                    {/* Columna Meses */}
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Mes</h4>
                        <div className="grid grid-cols-1 gap-2">
                            {months.map((m, i) => (
                                <button 
                                    key={m}
                                    type="button"
                                    onClick={() => setSelectedMonth(i)}
                                    className={`px-4 py-2 rounded-lg text-left text-sm font-medium transition-all ${
                                        selectedMonth === i 
                                        ? 'bg-blue-600 text-white shadow-md' 
                                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Columna Años */}
                    <div className="w-1/3 overflow-y-auto pl-2 border-l border-gray-100 custom-scrollbar">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Año</h4>
                        <div className="flex flex-col gap-2">
                            {years.map((y) => (
                                <button 
                                    key={y}
                                    type="button"
                                    onClick={() => setSelectedYear(y)}
                                    className={`px-4 py-2 rounded-lg text-center text-sm font-medium transition-all ${
                                        selectedYear === y 
                                        ? 'bg-blue-600 text-white shadow-md' 
                                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    {y}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                    <button 
                        onClick={onClose} 
                        type="button"
                        className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleConfirm} 
                        type="button"
                        className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <Check className="w-4 h-4" /> Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- INTERFACES ---

interface UserProps {
    user: User;
    alumno?: AlumnoData;
    curriculum?: CurriculumResponse;
    actividadesExtracurriculares?: any;
    actividadesCientificas?: any;
    cursosTitulosGrados?: any;
    ayudantias?: any;
    ayudantiasAnteriores?: any;
    postulaciones?: any;
    cancelarPostulacion?: any;
    asignaturasDisponibles?: any;
    asignaturasTodas?: any;
}

interface OptionType {
  value: string;
  label: string;
}

// --- VISTA PRINCIPAL DEL POSTULANTE ---

export const PostulanteVista = ({user, alumno, curriculum, actividadesExtracurriculares, actividadesCientificas, cursosTitulosGrados, ayudantias, ayudantiasAnteriores, postulaciones, cancelarPostulacion, asignaturasDisponibles, asignaturasTodas}: UserProps) => {
    const crearCurriculum = useCrearCurriculum();
    const crearPostulacion = useCrearPostulacion();
    const router = useRouter();
    const { setToken, setUsertipo } = useAuth();
    
    // Configuración de vista inicial
    type Vista = 'perfil' | 'postular';
    const [vista, setVista] = useState<Vista>('perfil');
    const isPerfil = vista === 'perfil';
    const isPostular = vista === 'postular';

    const [paso, setPaso] = useState<number>(1);
    const [mostrarPopup, setMostrarPopup] = useState<boolean>(false);
    const [mostrarPopupPostulaciones, setMostrarPopupPostulaciones] = useState<boolean>(false);
    const [postulacionSeleccionada, setPostulacionSeleccionada] = useState<any>(null);
    const [incluirCorreoProfe, setIncluirCorreoProfe] = useState<boolean>(false);
    const [mostrarPopupEditarPostulacion, setMostrarPopupEditarPostulacion] = useState(false);
    const [modoEdicion, setModoEdicion] = useState<boolean>(false);
    
    // Estados para DatePicker
    const [showMonthPicker, setShowMonthPicker] = useState(false);
    const [pickerTarget, setPickerTarget] = useState<{ section: 'cientifica' | 'extra', index: number } | null>(null);

    // Helpers para identificar rol
    const isAdminOrEncargado = user.tipo === 'admin' || user.tipo === 'encargado_ayudantias';

    const [form, setForm] = useState({
        rut_alumno: user.rut || "",
        nombres: user.nombres || "",
        apellidos: user.apellidos || "",
        fecha_nacimiento: "",
        comuna: "",
        ciudad: "",
        num_celular: "",
        correo: user.correo || "",
        carrera: "",
        otros: "",
        ayudantias: [{ nombre_asig: "", nombre_coordinador: "", evaluacion_obtenida: "" }],
        cursos_titulos_grados: [{ nombre_asig: "", n_coordinador: "", evaluacion: "" }],
        actividades_cientificas: [{ nombre: "", descripcion: "", periodo_participacion: "" }],
        actividades_extracurriculares: [{ nombre: "", docente: "", descripcion: "", periodo_participacion: "" }],
    });

    const [formPostulacion, setFormPostulacion] = useState({
        rut_alumno: "",
        id_asignatura: "",
        nombre_asignatura: "",
        descripcion_carta: "",
        correo_profe: "",
        actividad: "",
        metodologia: "",
        dia: "",
        bloque: "",
    });

    const logout = () => {
        setToken(null);
        setUsertipo(null);
        Cookies.remove('token');
        Cookies.remove('tipoUser');
        router.push('/login');
        router.refresh();
    }

    const handleBackToAdmin = () => {
        router.push('/adminDashboard'); // Ajusta esta ruta a tu panel real
    };

    // --- MANEJADORES ---
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleArrayChange = (e: React.ChangeEvent<HTMLInputElement>, key: string, index: number) => {
        const newArray = [...(form as any)[key]];
        newArray[index][e.target.name] = e.target.value;
        setForm({ ...form, [key]: newArray });
    };

    const handleDateConfirm = (dateString: string) => {
        if (!pickerTarget) return;
        const { section, index } = pickerTarget;
        const key = section === 'cientifica' ? 'actividades_cientificas' : 'actividades_extracurriculares';
        const newArray = [...(form as any)[key]];
        newArray[index]['periodo_participacion'] = dateString;
        setForm({ ...form, [key]: newArray });
    };

    const openPicker = (section: 'cientifica' | 'extra', index: number) => {
        setPickerTarget({ section, index });
        setShowMonthPicker(true);
    }

    const addItem = (key: string, emptyItem: any) => {
        const newArray = [...(form as any)[key], emptyItem];
        setForm({ ...form, [key]: newArray });
    };

    const removeItem = (key: string, index: number) => {
        const newArray = (form as any)[key].filter((_: any, i: number) => i !== index);
        setForm({ ...form, [key]: newArray });
    };

    const handleSubmit = (e: SyntheticEvent) => {
        e.preventDefault();
        crearCurriculum.mutate(form);
    };

    const handleSubmitPostulacion = (e: SyntheticEvent) => {
        e.preventDefault();
        const datosAEnviar = {
            ...formPostulacion,
            rut_alumno: user.rut,
            correo_profe: incluirCorreoProfe ? formPostulacion.correo_profe : null
        };
        crearPostulacion.mutate(datosAEnviar);
        setFormPostulacion({
            rut_alumno: "",
            id_asignatura: "",
            nombre_asignatura: "",
            descripcion_carta: "",
            correo_profe: "",
            actividad: "",
            metodologia: "",
            dia: "",
            bloque: "",
        });
        setIncluirCorreoProfe(false);
    };

    // --- RENDERIZADO DE CONTENIDO (POPUPS) ---
    const mostrarCurriculum = () => {
        return (
            <div className="text-gray-800 font-sans">
                {/* 1. HEADER TIPO PERFIL */}
                <div className="flex flex-col md:flex-row gap-6 items-center md:items-start border-b border-gray-100 pb-8 mb-8">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-blue-200">
                        {curriculum?.nombres?.charAt(0)}{curriculum?.apellidos?.charAt(0)}
                    </div>
                    <div className="flex-1 text-center md:text-left space-y-2">
                        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{curriculum?.nombres} {curriculum?.apellidos}</h2>
                        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold border border-blue-100">
                                <GraduationCap className="w-4 h-4"/> {curriculum?.carrera}
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-sm font-medium border border-gray-200">
                                <FileText className="w-4 h-4"/> RUT: {curriculum?.usuario.rut}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* 2. SIDEBAR (IZQUIERDA) - INFO PERSONAL */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <UserIcon className="w-4 h-4"/> Contacto
                            </h3>
                            <div className="space-y-4">
                                <div className="group">
                                    <p className="text-xs font-semibold text-gray-500 mb-0.5">Correo Electrónico</p>
                                    <div className="flex items-center gap-2 text-gray-900 font-medium break-all">
                                        <Mail className="w-4 h-4 text-blue-500" />
                                        {curriculum?.correo}
                                    </div>
                                </div>
                                <div className="group">
                                    <p className="text-xs font-semibold text-gray-500 mb-0.5">Teléfono</p>
                                    <div className="flex items-center gap-2 text-gray-900 font-medium">
                                        <Phone className="w-4 h-4 text-blue-500" />
                                        {curriculum?.Num_Celular || "No indicado"}
                                    </div>
                                </div>
                                <div className="group">
                                    <p className="text-xs font-semibold text-gray-500 mb-0.5">Ubicación</p>
                                    <div className="flex items-center gap-2 text-gray-900 font-medium">
                                        <MapPin className="w-4 h-4 text-blue-500" />
                                        {curriculum?.ciudad}, {curriculum?.comuna}
                                    </div>
                                </div>
                                <div className="group">
                                    <p className="text-xs font-semibold text-gray-500 mb-0.5">Nacimiento</p>
                                    <div className="flex items-center gap-2 text-gray-900 font-medium">
                                        <Calendar className="w-4 h-4 text-blue-500" />
                                        {curriculum?.fecha_nacimiento}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {curriculum?.otros && (
                            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <LayoutDashboard className="w-4 h-4 text-gray-500"/> Resumen / Otros
                                </h3>
                                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                                    {curriculum.otros}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* 3. CONTENIDO PRINCIPAL (DERECHA) - TRAYECTORIA */}
                    <div className="lg:col-span-8 space-y-8">
                        
                        {/* Sección Ayudantías */}
                        {(ayudantias?.length > 0 || ayudantiasAnteriores?.length > 0) && (
                            <section>
                                <div className="flex items-center gap-3 mb-4 pb-2 border-b border-gray-100">
                                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                        <BookOpen className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">Historial de Ayudantías</h3>
                                </div>
                                
                                <div className="space-y-4">
                                    {/* Ayudantías CV (Manuales) */}
                                    {ayudantias?.map((a: any, i: number) => (
                                        <div key={`curr-${i}`} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex gap-4">
                                            <div className="w-1.5 bg-blue-500 rounded-full my-1"></div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-bold text-gray-900 text-lg">{a.nombre_asig}</h4>
                                                    <Badge variant="default">Nota: {a.evaluacion}</Badge>
                                                </div>
                                                <p className="text-gray-600 text-sm mt-1">Coordinador: <span className="font-medium">{a.nombre_coordinador}</span></p>
                                            </div>
                                        </div>
                                    ))}
                                    
                                    {/* Ayudantías Anteriores (Sistema) */}
                                    {ayudantiasAnteriores?.map((a: any, i: number) => (
                                        <div key={`ant-${i}`} className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex gap-4 opacity-80 hover:opacity-100 transition-opacity">
                                            <div className="w-1.5 bg-gray-400 rounded-full my-1"></div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-bold text-gray-700 text-lg">{a.asignatura.nombre}</h4>
                                                    <span className="text-xs font-bold px-2 py-1 bg-gray-200 text-gray-600 rounded-md">Histórico</span>
                                                </div>
                                                <p className="text-gray-500 text-sm mt-1">Coordinador: {a.coordinador.nombres} {a.coordinador.apellidos}</p>
                                                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                                    <Check className="w-3 h-3"/> Aprobado con nota {a.evaluacion}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Sección Cursos y Títulos */}
                        {cursosTitulosGrados?.length > 0 && (
                            <section>
                                <div className="flex items-center gap-3 mb-4 pb-2 border-b border-gray-100">
                                    <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                                        <Award className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">Cursos y Títulos</h3>
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                    {cursosTitulosGrados.map((c: any, i: number) => (
                                        <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                                            <div>
                                                <h4 className="font-bold text-gray-900">{c.nombre_asig}</h4>
                                                <p className="text-sm text-gray-600">{c.n_coordinador}</p>
                                            </div>
                                            <div className="mt-2 sm:mt-0 flex items-center gap-2 text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-lg">
                                                <Calendar className="w-3 h-3"/> {c.evaluacion}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Sección Actividades */}
                        {(actividadesCientificas?.length > 0 || actividadesExtracurriculares?.length > 0) && (
                            <section>
                                <div className="flex items-center gap-3 mb-4 pb-2 border-b border-gray-100">
                                    <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                                        <Beaker className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">Actividades Extra-académicas</h3>
                                </div>
                                
                                <div className="relative border-l-2 border-gray-100 ml-3 space-y-6">
                                    {/* Científicas */}
                                    {actividadesCientificas?.map((a: any, i: number) => (
                                        <div key={`ci-${i}`} className="ml-6 relative">
                                            <span className="absolute -left-[31px] top-1 w-4 h-4 bg-white border-2 border-purple-500 rounded-full"></span>
                                            <h4 className="font-bold text-gray-900 text-lg">{a.nombre}</h4>
                                            <p className="text-sm text-purple-600 font-medium mb-1">{a.periodo_participacion}</p>
                                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">{a.descripcion}</p>
                                        </div>
                                    ))}
                                    
                                    {/* Extracurriculares */}
                                    {actividadesExtracurriculares?.map((a: any, i: number) => (
                                        <div key={`ex-${i}`} className="ml-6 relative">
                                            <span className="absolute -left-[31px] top-1 w-4 h-4 bg-white border-2 border-orange-500 rounded-full"></span>
                                            <h4 className="font-bold text-gray-900 text-lg">{a.nombre}</h4>
                                            <p className="text-sm text-orange-600 font-medium mb-1">{a.periodo_participacion} • {a.docente}</p>
                                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">{a.descripcion}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    const mostrarPostulacion = () => {
        if (!postulacionSeleccionada) return null;
        return (
            <div className="flex flex-col h-full text-gray-800 font-sans">
                {/* 1. Header del Modal */}
                <div className="flex items-center gap-4 border-b border-gray-100 pb-6 mb-6">
                    <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100">
                        <FileText className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Detalles de Postulación</h2>
                        <p className="text-sm text-gray-500 mt-1">Revisa la información enviada para esta ayudantía.</p>
                    </div>
                    <div className="ml-auto">
                        <Badge variant="default">Postulación Enviada</Badge>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* 2. Información Académica */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-blue-500"/> Información Académica
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 mb-1">Asignatura</p>
                                <p className="font-bold text-gray-900 text-lg">{postulacionSeleccionada.nombre_asignatura}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 mb-1">Correo Profesor / Recomendación</p>
                                <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    <p className="font-medium text-gray-900">
                                        {postulacionSeleccionada.correo_profe || <span className="text-gray-400 italic">No especificado</span>}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. Propuesta y Horario (Grid) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Propuesta */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Check className="w-4 h-4 text-green-600"/> Propuesta
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 mb-1">Actividad Propuesta</p>
                                    <p className="font-medium text-gray-900">{postulacionSeleccionada.actividad}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 mb-1">Metodología</p>
                                    <p className="font-medium text-gray-900">{postulacionSeleccionada.metodologia}</p>
                                </div>
                            </div>
                        </div>

                        {/* Disponibilidad */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-orange-500"/> Disponibilidad
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-xl border border-orange-100">
                                    <span className="text-sm font-semibold text-orange-700 flex items-center gap-2"><Calendar className="w-3 h-3"/> Día Preferente</span>
                                    <span className="font-bold text-orange-900">{postulacionSeleccionada.dia}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-xl border border-orange-100">
                                    <span className="text-sm font-semibold text-orange-700 flex items-center gap-2"><Clock className="w-3 h-3"/> Bloque</span>
                                    <span className="font-bold text-orange-900">{postulacionSeleccionada.bloque}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 4. Carta de Interés */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-500"/> Carta de Interés
                        </h3>
                        <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 text-gray-700 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                            {postulacionSeleccionada.descripcion_carta}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Variables UI
    const opcionesAsignaturasDisponibles: OptionType[] = asignaturasDisponibles?.map((a: any) => ({ value: String(a.id), label: a.nombre, })) || [];
    const opcionesAsignaturas: OptionType[] = asignaturasTodas?.map((a: any) => ({ value: String(a.id), label: a.nombre, })) || []; 
    const inputClass = "w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 placeholder:text-gray-500 shadow-sm";
    const labelClass = "text-xs font-bold text-gray-600 uppercase tracking-wide mb-1 block";

    // --- POPUPS ---
    const popupCurriculum = mostrarPopup ? (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50" onClick={() => setMostrarPopup(false)}>
            <div className="bg-white p-8 rounded-3xl shadow-2xl w-[95%] max-w-[1000px] relative animate-fadeIn max-h-[90vh] overflow-y-auto custom-scrollbar" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => setMostrarPopup(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-800 text-2xl transition-colors font-bold z-10">✕</button>
                {mostrarCurriculum()}
            </div>
        </div>
    ) : null;

    const popupEditarCurriculum = modoEdicion && curriculum ? (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50" onClick={() => setModoEdicion(false)}>
            <div className="bg-white p-6 rounded-2xl shadow-2xl w-[90%] max-w-[800px] relative animate-fadeIn max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => setModoEdicion(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl">✕</button>
                <FormularioEditarCurriculum datosIniciales={curriculum} onCancel={() => setModoEdicion(false)} />
            </div>
        </div>
    ) : null;

    const popupPostulacion = (mostrarPopupPostulaciones && postulacionSeleccionada) ? (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50" onClick={() => { setMostrarPopupPostulaciones(false); setPostulacionSeleccionada(null); }}>
            <div className="bg-white p-6 rounded-2xl shadow-2xl w-[90%] max-w-[700px] relative animate-fadeIn max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => { setMostrarPopupPostulaciones(false); setPostulacionSeleccionada(null); }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl">✕</button>
                {mostrarPostulacion()}
            </div>
        </div>
    ) : null;


    // ----------------------------------------------------------------------------------
    // CASO 1: USUARIO DESHABILITADO
    // ----------------------------------------------------------------------------------
    if (user.deshabilitado === true) {
        return (
            <div className="min-h-screen bg-slate-50 p-4 md:p-6 text-black flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="mx-auto bg-red-100 p-4 rounded-full w-20 h-20 flex items-center justify-center">
                        <UserIcon className="w-10 h-10 text-red-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Cuenta Deshabilitada</h1>
                    <button onClick={logout} className="mt-4 bg-gray-900 text-white font-semibold py-2 px-6 rounded-lg">Cerrar Sesión</button>
                </div>
            </div>
        );
    }

    // ----------------------------------------------------------------------------------
    // CASO 2: VISTA PRINCIPAL (ALUMNO O ADMIN/ENCARGADO)
    // ----------------------------------------------------------------------------------
    // Aquí fusionamos a los administradores y encargados para que vean el mismo dashboard
    else if (curriculum && (user.tipo === 'alumno' || user.tipo === 'admin' || user.tipo === 'encargado_ayudantias')) {
        return (
            <div className="min-h-screen bg-slate-50 font-sans pb-12">
                
                {/* Navbar Superior */}
                <nav className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16 items-center">
                            <div className="flex items-center gap-3">
                                <div className={`${isAdminOrEncargado ? 'bg-gray-800' : 'bg-blue-600'} p-2 rounded-lg`}>
                                    <GraduationCap className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-xl font-bold text-gray-900 tracking-tight hidden md:block">
                                    {isAdminOrEncargado ? 'Portal Postulaciones (Modo Admin)' : 'Portal Postulaciones'}
                                </span>
                            </div>
                            <div className="flex items-center gap-4">
                                {/* BOTÓN CRÍTICO: SOLO PARA ADMINS PARA PODER SALIR */}
                                {isAdminOrEncargado && (
                                    <button 
                                        onClick={handleBackToAdmin}
                                        className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold transition-colors border border-gray-300"
                                    >
                                        <ChevronLeft className="w-4 h-4" /> Volver al Panel
                                    </button>
                                )}

                                <div className="text-right hidden md:block">
                                    <p className="text-sm font-bold text-gray-900">{user.nombres.split(' ')[0]} {user.apellidos.split(' ')[0]}</p>
                                    <p className="text-xs text-gray-500 uppercase font-semibold">
                                        {user.tipo === 'alumno' ? 'Estudiante' : user.tipo.replace('_', ' ')}
                                    </p>
                                </div>
                                <button onClick={logout} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Cerrar Sesión">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </nav>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    
                    {/* Header y Tabs */}
                    <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Hola, {user.nombres.split(' ')[0]} 👋</h1>
                            <p className="text-gray-500 mt-1 text-lg">
                                {isAdminOrEncargado 
                                    ? "Estás visualizando la interfaz como un alumno." 
                                    : "Gestiona tu perfil académico y tus postulaciones activas."}
                            </p>
                        </div>

                        <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 inline-flex">
                            <button onClick={() => setVista('perfil')} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${isPerfil ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
                                <UserIcon className="w-4 h-4" /> Mi Perfil
                            </button>
                            <button onClick={() => setVista('postular')} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${isPostular ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
                                <Plus className="w-4 h-4" /> Nueva Postulación
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        
                        {/* Columna Izquierda: Tarjeta de Perfil */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden sticky top-24">
                                <div className={`h-24 bg-gradient-to-r ${isAdminOrEncargado ? 'from-gray-700 to-slate-900' : 'from-blue-600 to-indigo-600'}`}></div>
                                <div className="px-6 pb-6">
                                    <div className="relative flex justify-between items-end -mt-10 mb-4">
                                        <div className="w-20 h-20 bg-white p-1 rounded-2xl shadow-lg">
                                            <div className="w-full h-full bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold text-2xl">
                                                {user.nombres.charAt(0)}{user.apellidos.charAt(0)}
                                            </div>
                                        </div>
                                        <Badge variant={isAdminOrEncargado ? "warning" : "success"}>
                                            {isAdminOrEncargado ? "Modo Admin" : "Alumno Regular"}
                                        </Badge>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">{user.nombres} {user.apellidos}</h3>
                                            <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                                                <Mail className="w-3 h-3" /> {user.correo}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 py-4 border-t border-gray-100">
                                            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
                                                <p className="text-xs text-emerald-600 uppercase font-bold tracking-wider">Ingreso</p>
                                                <p className="font-semibold text-emerald-900">{alumno?.fecha_admision || "N/A"}</p>
                                            </div>
                                            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-center">
                                                <p className="text-xs text-blue-600 uppercase font-bold tracking-wider">RUT</p>
                                                <p className="font-semibold text-blue-900">{user.rut}</p>
                                            </div>
                                            <div className="p-3 bg-violet-50 border border-violet-100 rounded-xl col-span-2 flex items-center justify-between">
                                                <div className="flex-1 text-center"> 
                                                    <p className="text-xs text-violet-600 uppercase font-bold tracking-wider mb-1">Semestre Actual</p>
                                                    <p className="font-bold text-lg text-violet-900 decoration-2 underline-offset-4">
                                                        {alumno?.nivel || "N/A"}
                                                    </p>
                                                </div>

                                                {/* Icono decorativo a la derecha */}
                                                <div className="bg-violet-100 p-1.5 rounded-lg">
                                                    <GraduationCap className="w-4 h-4 text-violet-600" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 pt-2">
                                            <button onClick={() => setMostrarPopup(true)} className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all text-sm shadow-sm">
                                                <FileText className="w-4 h-4 text-blue-500" /> Ver CV
                                            </button>
                                            <button onClick={() => setModoEdicion(true)} className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all text-sm shadow-sm">
                                                <span className="text-yellow-500">✏️</span> Editar CV
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Columna Derecha: Contenido Principal */}
                        <div className="lg:col-span-8">
                            {vista === 'perfil' ? (
                                <div className="space-y-6 animate-fadeIn">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                            <Briefcase className="w-5 h-5 text-gray-500" />
                                            Postulaciones Activas
                                        </h3>
                                        <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                                            {postulaciones ? postulaciones.length : 0} Total
                                        </span>
                                    </div>

                                    {postulaciones && postulaciones.length > 0 ? (
                                        <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                                            {postulaciones.map((p: any) => (
                                                <div key={p.id} className="group bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all hover:border-blue-300 relative overflow-hidden">
                                                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 group-hover:bg-blue-600 transition-colors"></div>
                                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pl-3">
                                                        <div>
                                                            <h4 className="text-lg font-bold text-gray-900">{p.nombre_asignatura}</h4>
                                                            <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                                                                <Calendar className="w-4 h-4" /> Postulación enviada
                                                            </p>
                                                        </div>
                                                        
                                                        {/* BOTONES DE ACCIÓN CON TEXTO */}
                                                        <div className="flex items-center gap-3">
                                                            <button 
                                                                onClick={() => { setPostulacionSeleccionada(p); setMostrarPopupPostulaciones(true); }} 
                                                                className="flex flex-col items-center gap-1 p-2 text-blue-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors min-w-[60px]" 
                                                                title="Ver Detalles"
                                                            >
                                                                <FileText className="w-5 h-5" />
                                                                <span className="text-[10px] font-bold">Ver</span>
                                                            </button>

                                                            <button 
                                                                onClick={() => { setPostulacionSeleccionada(p); setMostrarPopupEditarPostulacion(true); }} 
                                                                className="flex flex-col items-center gap-1 p-2 text-yellow-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors min-w-[60px]" 
                                                                title="Editar Postulación"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                                                                <span className="text-[10px] font-bold">Editar</span>
                                                            </button>

                                                            <div className="h-8 w-px bg-gray-200 mx-1"></div>

                                                            <button 
                                                                onClick={() => cancelarPostulacion.mutate({id: p.id})} 
                                                                className="flex flex-col items-center gap-1 p-2 text-red-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors min-w-[60px]" 
                                                                title="Cancelar Postulación"
                                                            >
                                                                <Trash2 className="w-5 h-5" />
                                                                <span className="text-[10px] font-bold">Cancelar</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <FileText className="w-8 h-8 text-gray-400" />
                                            </div>
                                            <h3 className="text-lg font-medium text-gray-900">No tienes postulaciones activas</h3>
                                            <p className="text-gray-500 mt-1 mb-6">Comienza tu proceso postulando a una asignatura disponible.</p>
                                            <button onClick={() => setVista('postular')} className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200">
                                                <Plus className="w-5 h-5" /> Crear Postulación
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 animate-fadeIn">
                                    <div className="border-b border-gray-100 pb-6 mb-6">
                                        <h3 className="text-xl font-bold text-gray-900">Nueva Postulación</h3>
                                        <p className="text-gray-500 mt-1">Completa los datos para postular a una ayudantía.</p>
                                    </div>
                                    
                                    <form onSubmit={handleSubmitPostulacion} className="space-y-6">
                                        {/* Select Asignatura */}
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Asignatura</label>
                                            {opcionesAsignaturasDisponibles.length > 0 ? (
                                                <Select
                                                    options={opcionesAsignaturasDisponibles}
                                                    value={opcionesAsignaturasDisponibles.find((opt) => opt.value === String(formPostulacion.id_asignatura)) || null}
                                                    onChange={(selectedOption) => {
                                                        if (!selectedOption) return;
                                                        setFormPostulacion({ ...formPostulacion, id_asignatura: selectedOption.value, nombre_asignatura: selectedOption.label, });
                                                    }}
                                                    placeholder="Buscar asignatura..."
                                                    isSearchable
                                                    className="react-select-container"
                                                    classNamePrefix="react-select"
                                                    styles={{ 
                                                        control: (base) => ({ ...base, borderColor: '#e5e7eb', borderRadius: '0.75rem', padding: '2px', boxShadow: 'none', '&:hover': { borderColor: '#3b82f6' } }),
                                                        menu: (base) => ({ ...base, borderRadius: '0.75rem', overflow: 'hidden', marginTop: '8px' }),
                                                        option: (base, state) => ({ ...base, backgroundColor: state.isSelected ? '#eff6ff' : state.isFocused ? '#f9fafb' : 'white', color: state.isSelected ? '#1d4ed8' : '#374151' })
                                                    }}
                                                />
                                            ) : ( 
                                                <div className="p-4 bg-yellow-50 text-yellow-800 rounded-xl border border-yellow-200 text-sm flex items-center gap-2">
                                                    <span className="text-xl">⚠️</span> No hay asignaturas disponibles actualmente.
                                                </div> 
                                            )}
                                        </div>

                                        {/* Carta */}
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Carta de Interés</label>
                                            <textarea 
                                                name="descripcion_carta" 
                                                value={formPostulacion.descripcion_carta} 
                                                onChange={(e) => setFormPostulacion({ ...formPostulacion, [e.target.name]: e.target.value })} 
                                                maxLength={700}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all h-32 resize-none text-gray-900 placeholder:text-gray-400"
                                                placeholder="Explica brevemente tu motivación y experiencia..."
                                                required
                                            />
                                            <p className="text-xs text-right text-gray-400 mt-1">{formPostulacion.descripcion_carta.length}/700</p>
                                        </div>

                                        {/* Grid de campos */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <input type="checkbox" id="check_correo" checked={incluirCorreoProfe} onChange={(e) => { setIncluirCorreoProfe(e.target.checked); if (!e.target.checked) { setFormPostulacion({ ...formPostulacion, correo_profe: ""}); } }} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer" />
                                                    <label htmlFor="check_correo" className="text-sm font-bold text-gray-700 cursor-pointer select-none">¿Tienes recomendación?</label>
                                                </div>
                                                {incluirCorreoProfe && (
                                                    <input name="correo_profe" type="email" value={formPostulacion.correo_profe} onChange={(e) => setFormPostulacion({ ...formPostulacion, [e.target.name]: e.target.value})} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors text-black text-sm animate-fadeIn" placeholder="correo.profesor@ucn.cl" required={incluirCorreoProfe} />
                                                )}
                                            </div>

                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Actividad Propuesta</label>
                                                    <input name="actividad" value={formPostulacion.actividad} onChange={(e) => setFormPostulacion({ ...formPostulacion, [e.target.name]: e.target.value })} maxLength={700} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors text-gray-900" placeholder="Ej: Talleres prácticos" required />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Metodología</label>
                                                    <input name="metodologia" value={formPostulacion.metodologia} onChange={(e) => setFormPostulacion({ ...formPostulacion, [e.target.name]: e.target.value })} maxLength={700} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors text-gray-900" placeholder="Ej: Trabajo grupal" required />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Día Preferente</label>
                                                <select name="dia" value={formPostulacion.dia} onChange={(e) => setFormPostulacion({ ...formPostulacion, [e.target.name]: e.target.value })} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900" required>
                                                    <option value="">Seleccionar...</option>
                                                    <option value="Lunes">Lunes</option>
                                                    <option value="Martes">Martes</option>
                                                    <option value="Miércoles">Miércoles</option>
                                                    <option value="Jueves">Jueves</option>
                                                    <option value="Viernes">Viernes</option>
                                                    <option value="Sábado">Sábado</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Bloque Horario</label>
                                                <select name="bloque" value={formPostulacion.bloque} onChange={(e) => setFormPostulacion({ ...formPostulacion, [e.target.name]: e.target.value })} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900" required>
                                                    <option value="">Seleccionar...</option>
                                                    <option value="A">A (08:10 - 09:30)</option>
                                                    <option value="B">B (09:55 - 11:20)</option>
                                                    <option value="C">C (11:40 - 13:10)</option>
                                                    <option value="C2">C2 (13:10 - 14:30)</option>
                                                    <option value="D">D (14:30 - 16:00)</option>
                                                    <option value="E">E (16:15 - 17:47)</option>
                                                    <option value="F">F (18:00 - 19:30)</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="flex gap-4 pt-4 border-t border-gray-100">
                                            <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-blue-200 flex items-center justify-center gap-2">
                                                <span>🚀</span> Enviar Postulación
                                            </button>
                                            <button type="button" onClick={() => setFormPostulacion({ rut_alumno: '', id_asignatura: '', nombre_asignatura: '', descripcion_carta: '', correo_profe: '', actividad: '', metodologia: '', dia: '', bloque: '' })} className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors">
                                                Limpiar
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {popupCurriculum}
                {popupEditarCurriculum}
                {popupPostulacion}
                {mostrarPopupEditarPostulacion && postulacionSeleccionada && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4" onClick={() => setMostrarPopupEditarPostulacion(false)}>
                        <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-4xl max-h-[calc(100vh-4rem)] overflow-auto relative animate-fadeIn" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => setMostrarPopupEditarPostulacion(false)} className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl font-bold" aria-label="Cerrar">✖</button>
                            <FormularioEditarPostulacion postulacion={postulacionSeleccionada} opcionesAsignaturas={opcionesAsignaturas} onClose={() => setMostrarPopupEditarPostulacion(false)} />
                        </div>
                    </div>
                )}
            </div>
        );
    }
    
    // =====================================================================
    // 4. CREAR CURRICULUM (NUEVA INTERFAZ MODERNA CON ICONOS LUCIDE)
    // =====================================================================
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-5xl mx-auto">
                
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 flex flex-col md:flex-row justify-between items-center border border-gray-100">
                    <div>
                        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                            <FileText className="w-8 h-8 text-blue-600" />
                            Crear Currículum
                        </h2>
                        <p className="text-gray-500 mt-2 text-lg">Completa tu perfil profesional para postular a ayudantías.</p>
                    </div>
                    <button 
                        onClick={logout} 
                        className="mt-4 md:mt-0 bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                    >
                        <span>Cerrar Sesión</span>
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-3 px-2">
                        <span className={`text-sm font-bold tracking-wide uppercase ${paso === 1 ? 'text-blue-600' : 'text-gray-400'}`}>1. Datos Personales</span>
                        <span className={`text-sm font-bold tracking-wide uppercase ${paso === 2 ? 'text-blue-600' : 'text-gray-400'}`}>2. Información Académica</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 shadow-inner">
                        <div 
                            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out shadow-md" 
                            style={{ width: `${(paso / 2) * 100}%` }}
                        ></div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
                    
                    {/* PASO 1: DATOS PERSONALES */}
                    {paso === 1 && (
                        <form className="p-8 md:p-12 space-y-8" onSubmit={(e) => { e.preventDefault(); setPaso(2); }}>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* RUT (Lectura con !bg-gray-100 para forzar el gris) */}
                                <div className="space-y-2 group">
                                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-blue-500" /> RUT
                                    </label>
                                    <input 
                                        name="rut_alumno" 
                                        value={form.rut_alumno} 
                                        readOnly
                                        className={`${inputClass} !bg-gray-100 !text-gray-500 cursor-not-allowed focus:!ring-0`}
                                    />
                                </div>

                                {/* Nombres (Lectura forzada) */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <UserIcon className="w-4 h-4 text-blue-500" /> Nombres
                                    </label>
                                    <input 
                                        name="nombres" 
                                        value={form.nombres} 
                                        readOnly
                                        className={`${inputClass} !bg-gray-100 !text-gray-500 cursor-not-allowed focus:!ring-0`}
                                    />
                                </div>

                                {/* Apellidos (Lectura forzada) */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <UserIcon className="w-4 h-4 text-blue-500" /> Apellidos
                                    </label>
                                    <input 
                                        name="apellidos" 
                                        value={form.apellidos} 
                                        readOnly
                                        className={`${inputClass} !bg-gray-100 !text-gray-500 cursor-not-allowed focus:!ring-0`}
                                    />
                                </div>

                                {/* Fecha Nacimiento (Sigue Editable - Sin cambios) */}
                                <div className="space-y-2 relative">
                                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-blue-500" /> Fecha de Nacimiento
                                    </label>
                                    <div className="relative group cursor-pointer">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Calendar className="h-5 w-5 text-gray-500 group-hover:text-blue-500 transition-colors" />
                                        </div>
                                        <input 
                                            name="fecha_nacimiento" 
                                            type="date" 
                                            value={form.fecha_nacimiento} 
                                            onChange={handleChange} 
                                            required 
                                            onClick={(e) => (e.target as HTMLInputElement).showPicker()}
                                            className={`${inputClass} pl-12 cursor-pointer`}
                                        />
                                    </div>
                                </div>

                                {/* Comuna (Sigue Editable - Sin cambios) */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-blue-500" /> Comuna
                                    </label>
                                    <input 
                                        name="comuna" 
                                        value={form.comuna} 
                                        onChange={handleChange} 
                                        required 
                                        className={inputClass}
                                        placeholder="Ej: Providencia"
                                    />
                                </div>

                                {/* Ciudad (Sigue Editable - Sin cambios) */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-blue-500" /> Ciudad
                                    </label>
                                    <input 
                                        name="ciudad" 
                                        value={form.ciudad} 
                                        onChange={handleChange} 
                                        required 
                                        className={inputClass}
                                        placeholder="Ej: Santiago"
                                    />
                                </div>

                                {/* Celular (Sigue Editable - Sin cambios) */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-blue-500" /> Número de celular
                                    </label>
                                    <input 
                                        name="num_celular" 
                                        type="number"
                                        value={form.num_celular} 
                                        onChange={handleChange} 
                                        required 
                                        className={inputClass}
                                        placeholder="Ej: 912345678"
                                    />
                                </div>

                                {/* Email (Lectura forzada) */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-blue-500" /> Correo electrónico
                                    </label>
                                    <input 
                                        type="email" 
                                        name="correo" 
                                        value={form.correo} 
                                        readOnly
                                        className={`${inputClass} !bg-gray-100 !text-gray-500 cursor-not-allowed focus:!ring-0`}
                                    />
                                </div>

                                {/* Carrera (Sigue Editable - Sin cambios) */}
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <GraduationCap className="w-4 h-4 text-blue-500" /> Carrera
                                    </label>
                                    <input 
                                        name="carrera" 
                                        value={form.carrera} 
                                        onChange={handleChange} 
                                        required 
                                        className={inputClass}
                                        placeholder="Ej: Medicina, Kinesiología, etc."
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-6 border-t border-gray-100">
                                <button 
                                    type="submit" 
                                    className="group relative bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg hover:shadow-blue-200 flex items-center gap-3 overflow-hidden"
                                >
                                    <span className="relative z-10">Siguiente Paso</span>
                                    <ChevronRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </form>
                    )}

                    {/* PASO 2: INFORMACIÓN ACADÉMICA (REORDENADA Y LIMPIA) */}
                    {paso === 2 && (
                        <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-12">
                            {/* 1. AYUDANTÍAS */}
                            <div className="bg-white rounded-xl p-0 border border-gray-200 shadow-sm overflow-hidden">
                                <div className="bg-white p-6 border-b border-gray-100 flex items-center justify-between border-l-4 border-l-blue-600">
                                    <h4 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                                        <div className="p-2 bg-blue-50 rounded-lg">
                                            <BookOpen className="w-6 h-6 text-blue-600" />
                                        </div>
                                        Ayudantías Previas
                                    </h4>
                                    <button type="button" onClick={() => addItem("ayudantias", { nombre_asig: "", nombre_coordinador: "", evaluacion_obtenida: "" })} className="text-blue-600 hover:bg-blue-50 hover:text-blue-700 font-semibold py-2 px-4 rounded-lg text-sm transition-all flex items-center gap-2 border border-blue-200">
                                        <Plus className="w-4 h-4" /> Agregar
                                    </button>
                                </div>

                                {/* SCROLL CONTAINER */}
                                <div className="p-6 bg-gray-50/30 max-h-[500px] overflow-y-auto custom-scrollbar">
                                    {form.ayudantias.map((a, i) => (
                                        <div key={`ayudantia-${i}`} className="bg-white p-5 rounded-xl border border-gray-200 mb-4 shadow-sm hover:shadow-md transition-shadow relative pr-14">
                                            
                                            {/* BOTÓN BORRAR ABSOLUTO */}
                                            <button 
                                                type="button" 
                                                onClick={() => removeItem("ayudantias", i)} 
                                                className="absolute top-3 right-3 p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 hover:text-red-600 transition-colors z-10"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>

                                            <div className="grid grid-cols-1 gap-4">
                                                <div className="space-y-1">
                                                    <label className={labelClass}>Asignatura</label>
                                                    <input placeholder="Ej: Biofísica" name="nombre_asig" value={a.nombre_asig} onChange={(e) => handleArrayChange(e, "ayudantias", i)} className={inputClass} />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className={labelClass}>Coordinador</label>
                                                    <input placeholder="Nombre del Profesor" name="nombre_coordinador" value={a.nombre_coordinador} onChange={(e) => handleArrayChange(e, "ayudantias", i)} className={inputClass} />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className={labelClass}>Nota</label>
                                                    <input
                                                        placeholder="Ej: 4.0" 
                                                        name="evaluacion_obtenida"
                                                        type="number"
                                                        min="1.0"
                                                        max="5.0"
                                                        step="0.1"
                                                        value={a.evaluacion_obtenida}
                                                        onChange={(e) => handleArrayChange(e, "ayudantias", i)}
                                                        className={`${inputClass} ${
                                                        a.evaluacion_obtenida !== "" && (parseFloat(a.evaluacion_obtenida) < 1.0 || parseFloat(a.evaluacion_obtenida) > 5.0)
                                                            ? "border-red-500 focus:ring-red-500"
                                                            : ""
                                                        }`}
                                                    />

                                                    {a.evaluacion_obtenida !== "" &&
                                                        (parseFloat(a.evaluacion_obtenida) < 1.0 || parseFloat(a.evaluacion_obtenida) > 5.0) && (
                                                        <p className="text-red-500 text-xs mt-1">
                                                            Ingrese una nota entre 1.0 y 5.0
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 2. CURSOS Y TÍTULOS */}
                            <div className="bg-white rounded-xl p-0 border border-gray-200 shadow-sm overflow-hidden">
                                <div className="bg-white p-6 border-b border-gray-100 flex items-center justify-between border-l-4 border-l-green-600">
                                    <h4 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                                        <div className="p-2 bg-green-50 rounded-lg">
                                            <Award className="w-6 h-6 text-green-600" /> 
                                        </div>
                                        Cursos, Títulos y Grados
                                    </h4>
                                    <button type="button" onClick={() => addItem("cursos_titulos_grados", { nombre_asig: "", n_coordinador: "", evaluacion: "" })} className="text-green-600 hover:bg-green-50 hover:text-green-700 font-semibold py-2 px-4 rounded-lg text-sm transition-all flex items-center gap-2 border border-green-200">
                                        <Plus className="w-4 h-4" /> Agregar
                                    </button>
                                </div>
                                
                                {/* AQUI AGREGAMOS EL SCROLL (max-h y overflow) */}
                                <div className="p-6 bg-gray-50/30 max-h-[500px] overflow-y-auto custom-scrollbar">
                                    {form.cursos_titulos_grados.map((c, i) => (
                                        <div key={`curso-${i}`} className="bg-white p-5 rounded-xl border border-gray-200 mb-4 shadow-sm hover:shadow-md transition-shadow relative pr-14">
                                            
                                            {/* BOTÓN DE BORRAR ABSOLUTO SUPERIOR DERECHA */}
                                            <button 
                                                type="button" 
                                                onClick={() => removeItem("cursos_titulos_grados", i)} 
                                                className="absolute top-3 right-3 p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 hover:text-red-600 transition-colors z-10"
                                                title="Eliminar elemento"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>

                                            <div className="grid grid-cols-1 gap-4">
                                                <div className="space-y-1">
                                                    <label className={labelClass}>Título/Curso</label>
                                                    <input name="nombre_asig" value={c.nombre_asig} onChange={(e) => handleArrayChange(e, "cursos_titulos_grados", i)} className={inputClass} placeholder="Ej: Diplomado en..." />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className={labelClass}>Institución</label>
                                                    <input name="n_coordinador" value={c.n_coordinador} onChange={(e) => handleArrayChange(e, "cursos_titulos_grados", i)} className={inputClass} placeholder="Universidad..." />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className={labelClass}>Fecha</label>
                                                    {/* Se eliminó el botón de aquí y se dejó solo el input full width */}
                                                    <input type="date" name="evaluacion" value={c.evaluacion} onChange={(e) => handleArrayChange(e, "cursos_titulos_grados", i)} className={`${inputClass} cursor-pointer w-full`} onClick={(e) => (e.target as HTMLInputElement).showPicker()} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 3. ACTIVIDADES CIENTÍFICAS */}
                            <div className="bg-white rounded-xl p-0 border border-gray-200 shadow-sm overflow-hidden">
                                <div className="bg-white p-6 border-b border-gray-100 flex items-center justify-between border-l-4 border-l-purple-600">
                                    <h4 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                                        <div className="p-2 bg-purple-50 rounded-lg">
                                            <Beaker className="w-6 h-6 text-purple-600" /> 
                                        </div>
                                        Actividades Científicas
                                    </h4>
                                    <button type="button" onClick={() => addItem("actividades_cientificas", { nombre: "", descripcion: "", periodo_participacion: "" })} className="text-purple-600 hover:bg-purple-50 hover:text-purple-700 font-semibold py-2 px-4 rounded-lg text-sm transition-all flex items-center gap-2 border border-purple-200">
                                        <Plus className="w-4 h-4" /> Agregar
                                    </button>
                                </div>

                                {/* SCROLL CONTAINER */}
                                <div className="p-6 bg-gray-50/30 max-h-[500px] overflow-y-auto custom-scrollbar">
                                    {form.actividades_cientificas.map((a, i) => (
                                        <div key={`cientifica-${i}`} className="bg-white p-5 rounded-xl border border-gray-200 mb-4 shadow-sm hover:shadow-md transition-shadow relative pr-14">
                                            
                                            {/* BOTÓN BORRAR CORREGIDO */}
                                            <button 
                                                type="button" 
                                                onClick={() => removeItem("actividades_cientificas", i)} 
                                                className="absolute top-3 right-3 p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 hover:text-red-600 transition-colors z-10"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>

                                            <div className="grid grid-cols-1 gap-4">
                                                <div className="space-y-1">
                                                    <label className={labelClass}>Nombre Actividad</label>
                                                    <input name="nombre" value={a.nombre} onChange={(e) => handleArrayChange(e, "actividades_cientificas", i)} className={inputClass} placeholder="Nombre del proyecto" />
                                                </div>
                                                
                                                <div className="space-y-1 relative" onClick={() => openPicker('cientifica', i)}>
                                                    <label className={labelClass}>Periodo (MM/AAAA)</label>
                                                    <div className="relative cursor-pointer">
                                                        <input 
                                                            name="periodo_participacion" 
                                                            value={a.periodo_participacion} 
                                                            readOnly 
                                                            className={`${inputClass} cursor-pointer bg-gray-50`} 
                                                            placeholder="Seleccionar..." 
                                                        />
                                                        <Calendar className="w-4 h-4 text-gray-500 absolute right-4 top-3.5 pointer-events-none" />
                                                    </div>
                                                </div>

                                                <div className="space-y-1">
                                                    <label className={labelClass}>Descripción</label>
                                                    <input name="descripcion" value={a.descripcion} onChange={(e) => handleArrayChange(e, "actividades_cientificas", i)} className={inputClass} placeholder="Breve descripción de tu rol" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 4. EXTRACURRICULARES */}
                            <div className="bg-white rounded-xl p-0 border border-gray-200 shadow-sm overflow-hidden">
                                <div className="bg-white p-6 border-b border-gray-100 flex items-center justify-between border-l-4 border-l-orange-500">
                                    <h4 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                                        <div className="p-2 bg-orange-50 rounded-lg">
                                            <Briefcase className="w-6 h-6 text-orange-500" />
                                        </div>
                                        Actividades Extracurriculares
                                    </h4>
                                    <button type="button" onClick={() => addItem("actividades_extracurriculares", { nombre: "", docente: "", descripcion: "", periodo_participacion: "" })} className="text-orange-600 hover:bg-orange-50 hover:text-orange-700 font-semibold py-2 px-4 rounded-lg text-sm transition-all flex items-center gap-2 border border-orange-200">
                                        <Plus className="w-4 h-4" /> Agregar
                                    </button>
                                </div>

                                {/* SCROLL CONTAINER */}
                                <div className="p-6 bg-gray-50/30 max-h-[500px] overflow-y-auto custom-scrollbar">
                                    {form.actividades_extracurriculares.map((a, i) => (
                                        <div key={`extra-${i}`} className="bg-white p-5 rounded-xl border border-gray-200 mb-4 shadow-sm hover:shadow-md transition-shadow relative pr-14">
                                            
                                            {/* BOTÓN BORRAR CORREGIDO */}
                                            <button 
                                                type="button" 
                                                onClick={() => removeItem("actividades_extracurriculares", i)} 
                                                className="absolute top-3 right-3 p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 hover:text-red-600 transition-colors z-10"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>

                                            <div className="grid grid-cols-1 gap-4">
                                                <div className="space-y-1">
                                                    <label className={labelClass}>Actividad</label>
                                                    <input name="nombre" value={a.nombre} onChange={(e) => handleArrayChange(e, "actividades_extracurriculares", i)} className={inputClass} placeholder="Nombre actividad" />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className={labelClass}>Docente / Institución</label>
                                                    <input name="docente" value={a.docente} onChange={(e) => handleArrayChange(e, "actividades_extracurriculares", i)} className={inputClass} placeholder="Institución responsable" />
                                                </div>
                                                
                                                <div className="space-y-1 relative" onClick={() => openPicker('extra', i)}>
                                                    <label className={labelClass}>Periodo (MM/AAAA)</label>
                                                    <div className="relative cursor-pointer">
                                                        <input 
                                                            name="periodo_participacion" 
                                                            value={a.periodo_participacion} 
                                                            readOnly 
                                                            className={`${inputClass} cursor-pointer bg-gray-50`} 
                                                            placeholder="Seleccionar..." 
                                                        />
                                                        <Calendar className="w-4 h-4 text-gray-500 absolute right-4 top-3.5 pointer-events-none" />
                                                    </div>
                                                </div>

                                                <div className="space-y-1">
                                                    <label className={labelClass}>Descripción</label>
                                                    <input name="descripcion" value={a.descripcion} onChange={(e) => handleArrayChange(e, "actividades_extracurriculares", i)} className={inputClass} placeholder="Detalles relevantes" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                             {/* 5. OTROS */}
                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-gray-500" /> Información Adicional
                                    </h4>
                                    <span className={`text-xs font-bold px-2 py-1 rounded ${form.otros.length >= 700 ? 'bg-red-100 text-red-600' : 'bg-white border border-gray-200 text-gray-600'}`}>
                                        {form.otros.length} / 700
                                    </span>
                                </div>
                                <textarea 
                                    name="otros" 
                                    value={form.otros} 
                                    onChange={handleChange} 
                                    maxLength={700}
                                    placeholder="Describe logros, habilidades blandas, o proyectos relevantes que no encajen en las otras categorías..." 
                                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all h-32 resize-none outline-none text-gray-900 placeholder:text-gray-500"
                                />
                            </div>

                             <div className="flex justify-between pt-6 border-t border-gray-100">
                                <button type="button" onClick={() => setPaso(1)} className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors flex items-center gap-2"><ChevronLeft className="w-5 h-5" /> Anterior</button>
                                <button type="submit" className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center gap-2"><Save className="w-5 h-5" /> Guardar Curriculum</button>
                            </div>
                        </form>
                       )}
                </div>
                 <MonthYearPickerWeb isOpen={showMonthPicker} onClose={() => setShowMonthPicker(false)} onConfirm={handleDateConfirm}/>
             </div>
        </div>
    );
}

// --- EXPORT DEFAULT (WRAPPER DE CARGA) ---

export default function PostulantePage() {
    const { data: user, isLoading: cargauser, isError } = useUserProfile();
    const { data: alumno, isLoading: cargaAlumno} = useAlumnoProfile(user?.rut);
    const { data: curriculum , isLoading: cargaCurriculum } = useComprobarCurriculum(user?.rut);

    const { data: actividadesExtracurriculares } = useActividadesExtracurriculares(user?.rut);
    const { data: actividadesCientificas } = useActividadescientificas(user?.rut);
    const { data: cursosTitulosGrados } = useCursos_titulos_grados(user?.rut);
    const { data: ayudantias } = useAyudantias(user?.rut);

    const { data: ayudantiasAnteriores } = useAyudantiasPorAlumno(user?.rut);

    const { data: postulaciones } = usePostulacionesPorAlumno(user?.rut);

    const { data: asignaturasDisponibles } = useAsignaturasDisponiblesPostulacion(user?.rut);
    const { data: asignaturasTodas } = useTodasAsignaturas();

    const cancelarPostulacion = useCancelarPostulacion();

    const router = useRouter();

    useEffect(() => {
        if (isError || !user) {
            router.push("/login");
        }
    }, [isError, user, router]);

    if (cargauser || cargaCurriculum || cargaAlumno) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando...</p>
                </div>
            </div>
        );
    }

    if (isError || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Redirigiendo al login...</p>
                </div>
            </div>
        );
    }

    return <PostulanteVista user={user} alumno={alumno} curriculum={curriculum} actividadesExtracurriculares={actividadesExtracurriculares} actividadesCientificas={actividadesCientificas} cursosTitulosGrados={cursosTitulosGrados} ayudantias={ayudantias} ayudantiasAnteriores={ayudantiasAnteriores} postulaciones={postulaciones} cancelarPostulacion={cancelarPostulacion} asignaturasDisponibles={asignaturasDisponibles} asignaturasTodas={asignaturasTodas} />;
}