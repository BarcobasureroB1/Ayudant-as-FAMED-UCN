"use client";

import React, { useState } from "react";
import Select from "react-select";
import { EditarPostulacion, useEditarPostulacion } from "@/hooks/usePostulacion";
import { 
    Save, BookOpen, FileText, Mail, 
    Calendar, Clock, PenTool, CheckCircle2
} from 'lucide-react';

interface FormularioEditarPostulacionProps {
  postulacion: EditarPostulacion;
  opcionesAsignaturas: { value: string; label: string }[];
  onClose: () => void;
}

export default function FormularioEditarPostulacion({
  postulacion,
  opcionesAsignaturas,
  onClose,
}: FormularioEditarPostulacionProps) {
  const [formPostulacion, setFormPostulacion] = useState<EditarPostulacion>(postulacion);
  const [incluirCorreo, setIncluirCorreo] = useState(
    !!postulacion.correo_profe && postulacion.correo_profe.trim() !== ""
  );

  const { mutate: editarPostulacionMutation, isPending } = useEditarPostulacion();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const datosAEnviar = {
      ...formPostulacion,
      correo_profe: incluirCorreo ? formPostulacion.correo_profe : null
    };

    editarPostulacionMutation(datosAEnviar, {
      onSuccess: () => {
        onClose();
      },
      onError: (error) => {
        console.error("Error al editar:", error);
      },
    });
  };

  // --- ESTILOS REUTILIZABLES ---
  const inputClass = "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-sm text-gray-900 placeholder:text-gray-400";
  const labelClass = "text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block";
  const sectionTitleClass = "text-sm font-bold text-gray-800 flex items-center gap-2 mb-4 pb-2 border-b border-gray-100";

  // Estilos personalizados para React Select para que coincida con el tema
  const customSelectStyles = {
    control: (base: any, state: any) => ({
      ...base,
      borderColor: state.isFocused ? '#3b82f6' : '#e5e7eb',
      backgroundColor: '#f9fafb', // bg-gray-50
      borderRadius: '0.5rem',
      padding: '2px',
      boxShadow: 'none',
      '&:hover': { borderColor: '#3b82f6' }
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected ? '#eff6ff' : state.isFocused ? '#f3f4f6' : 'white',
      color: state.isSelected ? '#1d4ed8' : '#374151',
      fontSize: '0.875rem',
      cursor: 'pointer'
    }),
    input: (base: any) => ({ ...base, color: '#111827' }),
    singleValue: (base: any) => ({ ...base, color: '#111827' }),
    placeholder: (base: any) => ({ ...base, color: '#9ca3af', fontSize: '0.875rem' }),
  };

  return (
    <div className="flex flex-col h-full text-black">
        
        {/* Header */}
        <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-yellow-50 rounded-xl border border-yellow-100">
                    <PenTool className="w-6 h-6 text-yellow-600" />
                </div>
                Editar Postulación
            </h2>
            <p className="text-gray-500 text-sm mt-1 ml-14">Modifica los detalles de tu solicitud actual.</p>
        </div>

        <form id="edit-postulacion-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* 1. SECCIÓN ASIGNATURA */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className={sectionTitleClass}>
                    <BookOpen className="w-4 h-4 text-blue-500"/> Información Académica
                </h3>
                <div className="space-y-1">
                    <label className={labelClass}>Asignatura a Ayudar</label>
                    {opcionesAsignaturas.length > 0 ? (
                        <Select
                            options={opcionesAsignaturas}
                            value={opcionesAsignaturas.find(opt => opt.value === String(formPostulacion.id_asignatura))}
                            onChange={(opt) => opt && setFormPostulacion({ ...formPostulacion, id_asignatura: opt.value, nombre_asignatura: opt.label })}
                            placeholder="Buscar asignatura..."
                            styles={customSelectStyles}
                            className="text-sm"
                        />
                    ) : (
                        <p className="text-sm text-gray-500 italic p-2 bg-gray-50 rounded-lg border border-dashed border-gray-300">No hay asignaturas disponibles.</p>
                    )}
                </div>
            </div>

            {/* 2. CARTA Y RECOMENDACIÓN */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className={sectionTitleClass}>
                    <FileText className="w-4 h-4 text-blue-500"/> Carta de Presentación
                </h3>
                
                <div className="space-y-4">
                    <div>
                        {/* HEADER DEL TEXTAREA CON CONTADOR DE CARACTERES */}
                        <div className="flex items-center justify-between">
                            <label className={labelClass}>Carta de Interés</label>
                            <span className={`text-xs font-bold px-2 py-1 rounded ${formPostulacion.descripcion_carta.length >= 700 ? 'bg-red-100 text-red-600' : 'bg-white border border-gray-200 text-gray-600'}`}>
                                {formPostulacion.descripcion_carta.length} / 700
                            </span>
                        </div>
                        <textarea 
                            name="descripcion_carta"
                            value={formPostulacion.descripcion_carta}
                            onChange={(e) => setFormPostulacion({...formPostulacion, descripcion_carta: e.target.value})}
                            className={`${inputClass} h-32 resize-none`}
                            placeholder="Explica brevemente tu motivación para ser ayudante..."
                            required
                            maxLength={700} // LÍMITE DE CARACTERES
                        />
                    </div>

                    {/* Checkbox Recomendación estilizado */}
                    <div className={`p-4 rounded-xl border transition-all ${incluirCorreo ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="flex items-center gap-3 mb-2">
                            <input 
                                type="checkbox" 
                                id="check_correo_edit" 
                                checked={incluirCorreo} 
                                onChange={(e) => {
                                    setIncluirCorreo(e.target.checked);
                                    if (!e.target.checked) setFormPostulacion(prev => ({ ...prev, correo_profe: "" }));
                                }}
                                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                            />
                            <label htmlFor="check_correo_edit" className="text-sm font-bold text-gray-800 cursor-pointer select-none flex items-center gap-2">
                                <Mail className={`w-4 h-4 ${incluirCorreo ? 'text-blue-600' : 'text-gray-400'}`} /> 
                                ¿Tienes recomendación de un profesor?
                            </label>
                        </div>
                        
                        {incluirCorreo && (
                            <div className="animate-fadeIn pl-8 mt-2">
                                <input 
                                    type="email" 
                                    value={formPostulacion.correo_profe || ""} 
                                    onChange={(e) => setFormPostulacion({...formPostulacion, correo_profe: e.target.value})}
                                    className={`${inputClass} bg-white border-blue-200 focus:border-blue-500`}
                                    placeholder="correo.profesor@ucn.cl"
                                    required
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 3. PLAN Y HORARIO (GRID) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Plan de Trabajo */}
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm md:col-span-2">
                    <h3 className={sectionTitleClass}>
                        <CheckCircle2 className="w-4 h-4 text-green-600"/> Plan de Trabajo
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Actividad Propuesta</label>
                            <input 
                                name="actividad" 
                                value={formPostulacion.actividad} 
                                onChange={(e) => setFormPostulacion({...formPostulacion, actividad: e.target.value})}
                                className={inputClass}
                                placeholder="Ej: Talleres prácticos"
                                required
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Metodología</label>
                            <input 
                                name="metodologia" 
                                value={formPostulacion.metodologia} 
                                onChange={(e) => setFormPostulacion({...formPostulacion, metodologia: e.target.value})}
                                className={inputClass}
                                placeholder="Ej: Trabajo grupal"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Disponibilidad */}
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm md:col-span-2">
                    <h3 className={sectionTitleClass}>
                        <Clock className="w-4 h-4 text-orange-500"/> Disponibilidad Horaria
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}><Calendar className="inline w-3 h-3 mr-1 mb-0.5"/> Día Preferente</label>
                            <select 
                                value={formPostulacion.dia} 
                                onChange={(e) => setFormPostulacion({...formPostulacion, dia: e.target.value})}
                                className={`${inputClass} cursor-pointer appearance-none`}
                                required
                            >
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
                            <label className={labelClass}><Clock className="inline w-3 h-3 mr-1 mb-0.5"/> Bloque Horario</label>
                            <select 
                                value={formPostulacion.bloque} 
                                onChange={(e) => setFormPostulacion({...formPostulacion, bloque: e.target.value})}
                                className={`${inputClass} cursor-pointer appearance-none`}
                                required
                            >
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
                </div>
            </div>

            {/* Footer Botones */}
            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button 
                    type="button" 
                    onClick={onClose} 
                    className="px-6 py-3 rounded-xl text-gray-700 font-semibold hover:bg-gray-100 transition-colors border border-transparent"
                >
                    Cancelar
                </button>
                <button 
                    type="submit" 
                    disabled={isPending} 
                    className="px-8 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-white font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isPending ? <span className="animate-pulse">Guardando...</span> : <><Save className="w-5 h-5" /> Guardar Cambios</>}
                </button>
            </div>

        </form>
    </div>
  );
}