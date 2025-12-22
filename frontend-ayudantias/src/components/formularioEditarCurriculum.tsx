"use client";

import React, { useState, useEffect } from "react";
import { useEditarCurriculum } from "@/hooks/useCurriculum";
import { CurriculumResponse } from "@/hooks/useCurriculum";
import { 
    User, Mail, Phone, MapPin, Calendar, GraduationCap, 
    BookOpen, Award, Beaker, Briefcase, Plus, Trash2, 
    Save, LayoutDashboard, FileText, Check, X
} from 'lucide-react';

// --- COMPONENTE PICKER FECHA ---
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
    const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(currentYear);

    if (!isOpen) return null;

    const handleConfirm = () => {
        const monthStr = (selectedMonth + 1).toString().padStart(2, '0');
        onConfirm(`${monthStr}/${selectedYear}`);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-600"/> Seleccionar Periodo
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 flex flex-col md:flex-row gap-6 h-80">
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Mes</h4>
                        <div className="grid grid-cols-1 gap-2">
                            {months.map((m, i) => (
                                <button key={m} type="button" onClick={() => setSelectedMonth(i)} className={`px-4 py-2 rounded-lg text-left text-sm font-medium transition-all ${selectedMonth === i ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}>{m}</button>
                            ))}
                        </div>
                    </div>
                    <div className="w-1/3 overflow-y-auto pl-2 border-l border-gray-100 custom-scrollbar">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Año</h4>
                        <div className="flex flex-col gap-2">
                            {years.map((y) => (
                                <button key={y} type="button" onClick={() => setSelectedYear(y)} className={`px-4 py-2 rounded-lg text-center text-sm font-medium transition-all ${selectedYear === y ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}>{y}</button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                    <button onClick={onClose} type="button" className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors">Cancelar</button>
                    <button onClick={handleConfirm} type="button" className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition-colors flex items-center gap-2"><Check className="w-4 h-4" /> Confirmar</button>
                </div>
            </div>
        </div>
    );
};

// --- INTERFACES ---
export interface CurriculumDataEditar {
  id: number;
  rut_alumno?: string;
  nombres?: string;
  apellidos?: string;
  fecha_nacimiento?: string;
  comuna?: string;
  ciudad?: string;
  num_celular?: string;
  correo?: string;
  carrera?: string;
  otros?: string;

  ayudantias?: Ayudantia[];
  cursos_titulos_grados?: CursoTituloGrado[];
  actividades_cientificas?: ActividadCientifica[];
  actividades_extracurriculares?: ActividadExtracurricular[];
}

interface Ayudantia {
  nombre_asig: string;
  nombre_coordinador: string;
  evaluacion_obtenida: string;
}

interface CursoTituloGrado {
  nombre_asig: string;
  n_coordinador: string;
  evaluacion: string;
}

interface ActividadCientifica {
  nombre: string;
  descripcion: string;
  periodo_participacion: string;
}

interface ActividadExtracurricular {
  nombre: string;
  docente: string;
  descripcion: string;
  periodo_participacion: string;
}

interface Props {
  datosIniciales: CurriculumDataEditar | CurriculumResponse;
  onCancel: () => void;
}

export default function FormularioEditarCurriculum({ datosIniciales, onCancel }: Props) {
    const { mutate: editarCurriculum, isPending } = useEditarCurriculum();
    const [activeTab, setActiveTab] = useState<'personal' | 'academico' | 'extra'>('personal');

    // Estado para el Picker de fechas
    const [showMonthPicker, setShowMonthPicker] = useState(false);
    const [pickerTarget, setPickerTarget] = useState<{ section: 'cientifica' | 'extra', index: number } | null>(null);

    // --- ESTADO INICIAL ---
    const [formData, setFormData] = useState<CurriculumDataEditar>({
        id: 0,
        nombres: "",
        apellidos: "",
        correo: "",
        comuna: "",
        ciudad: "",
        fecha_nacimiento: "",
        num_celular: "",
        carrera: "",
        otros: "",
        ayudantias: [],
        cursos_titulos_grados: [],
        actividades_cientificas: [],
        actividades_extracurriculares: [],
    });

    // --- CARGA DE DATOS ---
    useEffect(() => {
        if (datosIniciales) {
            const d = datosIniciales as any; 
            setFormData({
                id: d.id || 0,
                nombres: d.nombres || "",
                apellidos: d.apellidos || "",
                correo: d.correo || "",
                comuna: d.comuna || "",
                ciudad: d.ciudad || "",
                fecha_nacimiento: d.fecha_nacimiento || "",
                num_celular: d.Num_Celular || d.num_celular || "",
                carrera: d.carrera || "",
                otros: d.otros || "",
                ayudantias: (d.usuario?.ayudantias || d.ayudantias || []).map((a: any) => ({
                    nombre_asig: a.nombre_asig || "",
                    nombre_coordinador: a.nombre_coordinador || "",
                    evaluacion_obtenida: a.evaluacion || a.evaluacion_obtenida || "",
                })),
                cursos_titulos_grados: (d.usuario?.titulos || d.cursos_titulos_grados || []).map((t: any) => ({
                    nombre_asig: t.nombre_asig || "",
                    n_coordinador: t.n_coordinador || "",
                    evaluacion: t.evaluacion || "",
                })),
                actividades_cientificas: (d.usuario?.actividades_cientificas || d.actividades_cientificas || []).map((c: any) => ({
                    nombre: c.nombre || "",
                    descripcion: c.descripcion || "",
                    periodo_participacion: c.periodo_participacion || "",
                })),
                actividades_extracurriculares: (d.usuario?.actividades_extracurriculares || d.actividades_extracurriculares || []).map((e: any) => ({
                    nombre: e.nombre || "",
                    docente: e.docente || "",
                    descripcion: e.descripcion || "",
                    periodo_participacion: e.periodo_participacion || "",
                })),
            });
        }
    }, [datosIniciales]);

    // --- HANDLERS ---
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddArrayItem = (key: keyof CurriculumDataEditar, newItem: any) => {
        setFormData((prev) => ({
            ...prev,
            [key]: Array.isArray(prev[key]) ? [...(prev[key] as any[]), newItem] : [newItem],
        }));
    };

    const handleArrayChange = (key: keyof CurriculumDataEditar, index: number, field: string, value: string) => {
        setFormData((prev) => {
            const current = prev[key];
            if (Array.isArray(current)) {
                const updated = current.map((item, i) => i === index ? { ...item, [field]: value } : item);
                return { ...prev, [key]: updated };
            }
            return prev;
        });
    };

    const handleRemoveArrayItem = (key: keyof CurriculumDataEditar, index: number) => {
        setFormData((prev) => {
            const current = prev[key];
            if (Array.isArray(current)) {
                const updated = current.filter((_, i) => i !== index);
                return { ...prev, [key]: updated };
            }
            return prev;
        });
    };

    // Handlers para el Picker de Fechas
    const openPicker = (section: 'cientifica' | 'extra', index: number) => {
        setPickerTarget({ section, index });
        setShowMonthPicker(true);
    };

    const handleDateConfirm = (dateString: string) => {
        if (!pickerTarget) return;
        const { section, index } = pickerTarget;
        const key = section === 'cientifica' ? 'actividades_cientificas' : 'actividades_extracurriculares';
        
        handleArrayChange(key, index, 'periodo_participacion', dateString);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        editarCurriculum(formData, {
            onSuccess: () => {
                onCancel();
            }
        });
    };

    // --- ESTILOS VISUALES ---
    const inputClass = "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-sm text-gray-900 placeholder:text-gray-400";
    const labelClass = "text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block";
    const cardClass = "bg-white p-4 rounded-xl border border-gray-200 shadow-sm relative pr-12 mb-4 hover:border-blue-300 transition-colors group";
    const deleteBtnClass = "absolute top-3 right-3 text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100";
    const scrollContainerClass = "max-h-[400px] overflow-y-auto pr-2 custom-scrollbar space-y-4";

    // --- RENDERIZADO DE CONTENIDO POR PESTAÑA ---

    const renderPersonal = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn mt-6">
            <div className="md:col-span-2 flex items-center gap-2 pb-2 border-b border-gray-100 mb-2">
                <User className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-800">Datos Personales</h3>
            </div>

            <div className="space-y-1">
                <label className={labelClass}>Correo (Solo lectura)</label>
                <input value={formData.correo || ""} readOnly className={`${inputClass} !bg-gray-100 text-gray-500 cursor-not-allowed`} />
            </div>
            <div className="space-y-1">
                <label className={labelClass}>Celular</label>
                <input name="num_celular" value={formData.num_celular || ""} onChange={handleChange} className={inputClass} placeholder="Ej: 912345678" />
            </div>

            <div className="space-y-1">
                <label className={labelClass}>Nombres</label>
                <input name="nombres" value={formData.nombres || ""} onChange={handleChange} className={inputClass} placeholder="Ej: Juan Andrés" />
            </div>
            <div className="space-y-1">
                <label className={labelClass}>Apellidos</label>
                <input name="apellidos" value={formData.apellidos || ""} onChange={handleChange} className={inputClass} placeholder="Ej: Pérez Soto" />
            </div>

            <div className="space-y-1">
                <label className={labelClass}>Fecha Nacimiento</label>
                <input 
                    type="date" 
                    name="fecha_nacimiento" 
                    value={formData.fecha_nacimiento || ""} 
                    onChange={handleChange} 
                    className={`${inputClass} cursor-pointer`}
                    onClick={(e) => (e.target as HTMLInputElement).showPicker()}
                />
            </div>
            <div className="space-y-1">
                <label className={labelClass}>Carrera</label>
                <input name="carrera" value={formData.carrera || ""} onChange={handleChange} className={inputClass} placeholder="Ej: Medicina / Kinesiología" />
            </div>

            <div className="space-y-1">
                <label className={labelClass}>Ciudad</label>
                <input name="ciudad" value={formData.ciudad || ""} onChange={handleChange} className={inputClass} placeholder="Ej: Viña del Mar" />
            </div>
            <div className="space-y-1">
                <label className={labelClass}>Comuna</label>
                <input name="comuna" value={formData.comuna || ""} onChange={handleChange} className={inputClass} placeholder="Ej: Centro" />
            </div>
        </div>
    );

    const renderAcademico = () => (
        <div className="space-y-8 animate-fadeIn mt-6">
            {/* Ayudantías */}
            <div>
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-blue-600" /> Ayudantías Previas
                    </h3>
                    <button type="button" onClick={() => handleAddArrayItem("ayudantias", { nombre_asig: "", nombre_coordinador: "", evaluacion_obtenida: "" })} className="text-xs flex items-center gap-1 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 font-bold transition-colors">
                        <Plus className="w-4 h-4" /> Agregar
                    </button>
                </div>
                <div className={scrollContainerClass}>
                    {formData.ayudantias?.map((item, i) => (
                        <div key={`ayu-${i}`} className={cardClass}>
                            <button type="button" onClick={() => handleRemoveArrayItem("ayudantias", i)} className={deleteBtnClass} title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div><label className={labelClass}>Asignatura</label><input value={item.nombre_asig || ""} onChange={(e) => handleArrayChange("ayudantias", i, "nombre_asig", e.target.value)} className={inputClass} placeholder="Ej: Anatomía General / Fisiología" /></div>
                                <div><label className={labelClass}>Coordinador</label><input value={item.nombre_coordinador || ""} onChange={(e) => handleArrayChange("ayudantias", i, "nombre_coordinador", e.target.value)} className={inputClass} placeholder="Ej: Dr. Roberto González" /></div>
                                <div className="md:col-span-2"><label className={labelClass}>Nota</label><input type="number" value={item.evaluacion_obtenida || ""} onChange={(e) => handleArrayChange("ayudantias", i, "evaluacion_obtenida", e.target.value)} className={inputClass} placeholder="Ej: 6.8" /></div>
                            </div>
                        </div>
                    ))}
                    {(!formData.ayudantias || formData.ayudantias.length === 0) && <p className="text-sm text-gray-400 italic text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">No hay ayudantías registradas.</p>}
                </div>
            </div>

            {/* Cursos */}
            <div>
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <Award className="w-5 h-5 text-green-600" /> Cursos y Títulos
                    </h3>
                    <button type="button" onClick={() => handleAddArrayItem("cursos_titulos_grados", { nombre_asig: "", n_coordinador: "", evaluacion: "" })} className="text-xs flex items-center gap-1 bg-green-50 text-green-600 px-3 py-1.5 rounded-lg hover:bg-green-100 font-bold transition-colors">
                        <Plus className="w-4 h-4" /> Agregar
                    </button>
                </div>
                <div className={scrollContainerClass}>
                    {formData.cursos_titulos_grados?.map((item, i) => (
                        <div key={`cur-${i}`} className={cardClass}>
                            <button type="button" onClick={() => handleRemoveArrayItem("cursos_titulos_grados", i)} className={deleteBtnClass} title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                            <div className="grid grid-cols-1 gap-3">
                                <div><label className={labelClass}>Título/Curso</label><input value={item.nombre_asig || ""} onChange={(e) => handleArrayChange("cursos_titulos_grados", i, "nombre_asig", e.target.value)} className={inputClass} placeholder="Ej: Curso RCP Básico / ACLS" /></div>
                                <div><label className={labelClass}>Institución</label><input value={item.n_coordinador || ""} onChange={(e) => handleArrayChange("cursos_titulos_grados", i, "n_coordinador", e.target.value)} className={inputClass} placeholder="Ej: American Heart Association (AHA)" /></div>
                                <div>
                                    <label className={labelClass}>Fecha</label>
                                    <input 
                                        type="date" 
                                        value={item.evaluacion || ""} 
                                        onChange={(e) => handleArrayChange("cursos_titulos_grados", i, "evaluacion", e.target.value)} 
                                        className={`${inputClass} cursor-pointer`} 
                                        onClick={(e) => (e.target as HTMLInputElement).showPicker()}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderExtra = () => (
        <div className="space-y-8 animate-fadeIn mt-6">
            {/* Científicas */}
            <div>
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <Beaker className="w-5 h-5 text-purple-600" /> Actividades Científicas
                    </h3>
                    <button type="button" onClick={() => handleAddArrayItem("actividades_cientificas", { nombre: "", descripcion: "", periodo_participacion: "" })} className="text-xs flex items-center gap-1 bg-purple-50 text-purple-600 px-3 py-1.5 rounded-lg hover:bg-purple-100 font-bold transition-colors">
                        <Plus className="w-4 h-4" /> Agregar
                    </button>
                </div>
                <div className={scrollContainerClass}>
                    {formData.actividades_cientificas?.map((item, i) => (
                        <div key={`cie-${i}`} className={cardClass}>
                            <button type="button" onClick={() => handleRemoveArrayItem("actividades_cientificas", i)} className={deleteBtnClass} title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                            <div className="grid grid-cols-1 gap-3">
                                <div><label className={labelClass}>Nombre Actividad</label><input value={item.nombre || ""} onChange={(e) => handleArrayChange("actividades_cientificas", i, "nombre", e.target.value)} className={inputClass} placeholder="Ej: Publicación Case Report: Síndrome X" /></div>
                                
                                {/* Input Periodo con Picker */}
                                <div className="space-y-1 relative" onClick={() => openPicker('cientifica', i)}>
                                    <label className={labelClass}>Periodo (MM/AAAA)</label>
                                    <div className="relative cursor-pointer">
                                        <input 
                                            value={item.periodo_participacion || ""} 
                                            readOnly 
                                            className={`${inputClass} cursor-pointer bg-gray-50`} 
                                            placeholder="Ej: 05/2023" 
                                        />
                                        <Calendar className="w-4 h-4 text-gray-500 absolute right-4 top-3.5 pointer-events-none" />
                                    </div>
                                </div>

                                <div><label className={labelClass}>Descripción</label><input value={item.descripcion || ""} onChange={(e) => handleArrayChange("actividades_cientificas", i, "descripcion", e.target.value)} className={inputClass} placeholder="Ej: Presentación de póster en congreso, co-autoría..." /></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Extracurriculares */}
            <div>
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-orange-500" /> Extracurriculares
                    </h3>
                    <button type="button" onClick={() => handleAddArrayItem("actividades_extracurriculares", { nombre: "", docente: "", descripcion: "", periodo_participacion: "" })} className="text-xs flex items-center gap-1 bg-orange-50 text-orange-600 px-3 py-1.5 rounded-lg hover:bg-orange-100 font-bold transition-colors">
                        <Plus className="w-4 h-4" /> Agregar
                    </button>
                </div>
                <div className={scrollContainerClass}>
                    {formData.actividades_extracurriculares?.map((item, i) => (
                        <div key={`ext-${i}`} className={cardClass}>
                            <button type="button" onClick={() => handleRemoveArrayItem("actividades_extracurriculares", i)} className={deleteBtnClass} title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                            <div className="grid grid-cols-1 gap-3">
                                <div><label className={labelClass}>Actividad</label><input value={item.nombre || ""} onChange={(e) => handleArrayChange("actividades_extracurriculares", i, "nombre", e.target.value)} className={inputClass} placeholder="Ej: Operativo de Salud Rural / IFMSA" /></div>
                                <div><label className={labelClass}>Docente / Inst.</label><input value={item.docente || ""} onChange={(e) => handleArrayChange("actividades_extracurriculares", i, "docente", e.target.value)} className={inputClass} placeholder="Ej: Dra. María Soto" /></div>
                                
                                {/* Input Periodo con Picker */}
                                <div className="space-y-1 relative" onClick={() => openPicker('extra', i)}>
                                    <label className={labelClass}>Periodo (MM/AAAA)</label>
                                    <div className="relative cursor-pointer">
                                        <input 
                                            value={item.periodo_participacion || ""} 
                                            readOnly 
                                            className={`${inputClass} cursor-pointer bg-gray-50`} 
                                            placeholder="Ej: 05/2023" 
                                        />
                                        <Calendar className="w-4 h-4 text-gray-500 absolute right-4 top-3.5 pointer-events-none" />
                                    </div>
                                </div>

                                <div><label className={labelClass}>Descripción</label><input value={item.descripcion || ""} onChange={(e) => handleArrayChange("actividades_extracurriculares", i, "descripcion", e.target.value)} className={inputClass} placeholder="Ej: Atención primaria supervisada en zona rural..." /></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Otros */}
            <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-gray-500" /> Información Adicional
                    </h3>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${formData.otros ? formData.otros.length : 0 >= 700 ? 'bg-red-100 text-red-600' : 'bg-white border border-gray-200 text-gray-600'}`}>
                        {formData.otros ? formData.otros.length : 0} / 700
                    </span>
                </div>
                <textarea 
                    name="otros" 
                    value={formData.otros || ""} 
                    onChange={handleChange} 
                    maxLength={700}
                    className={`${inputClass} h-32 resize-none`}
                    placeholder="Ej: Nivel de Inglés C1, Manejo de Excel Avanzado, Delegado de Generación 2023. Interés en área de investigación clínica."
                />
            </div>
        </div>
    );

    // --- RENDER PRINCIPAL ---
    return (
        <div className="flex flex-col h-full bg-white text-black">
            
            {/* 1. Header (Normal flow, no sticky) */}
            <div className="flex items-center justify-between border-b border-gray-100 bg-white pb-4 mb-4 pr-8">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <LayoutDashboard className="w-6 h-6 text-blue-600" />
                        Editar Currículum
                    </h2>
                    <p className="text-sm text-gray-500 mt-0.5">Actualiza tu información profesional.</p>
                </div>
            </div>

            {/* 2. Navegación Tabs (Normal flow) */}
            <div className="flex border-b border-gray-100">
                <button onClick={() => setActiveTab('personal')} className={`px-4 py-3 text-sm font-semibold border-b-2 transition-all ${activeTab === 'personal' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Datos Personales</button>
                <button onClick={() => setActiveTab('academico')} className={`px-4 py-3 text-sm font-semibold border-b-2 transition-all ${activeTab === 'academico' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Académico</button>
                <button onClick={() => setActiveTab('extra')} className={`px-4 py-3 text-sm font-semibold border-b-2 transition-all ${activeTab === 'extra' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Extra y Otros</button>
            </div>

            {/* 3. Área de Contenido (Normal flow) */}
            <form id="edit-cv-form" onSubmit={handleSubmit} className="flex-1">
                {activeTab === 'personal' && renderPersonal()}
                {activeTab === 'academico' && renderAcademico()}
                {activeTab === 'extra' && renderExtra()}
                
                {/* 4. Footer (Dentro del flujo del formulario) */}
                <div className="pt-8 mt-4 border-t border-gray-100 flex justify-end gap-3">
                    <button type="button" onClick={onCancel} className="px-6 py-2.5 rounded-xl text-gray-700 font-semibold hover:bg-gray-100 transition-colors border border-transparent">
                        Cancelar
                    </button>
                    <button type="submit" disabled={isPending} className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                        {isPending ? <span className="animate-pulse">Guardando...</span> : <><Save className="w-4 h-4" /> Guardar Cambios</>}
                    </button>
                </div>
            </form>

            <MonthYearPickerWeb isOpen={showMonthPicker} onClose={() => setShowMonthPicker(false)} onConfirm={handleDateConfirm}/>
        </div>
    );
}