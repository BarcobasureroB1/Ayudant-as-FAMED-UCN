"use client";

import { useState, useMemo } from "react";
import { useDepartamentos } from "@/hooks/useDepartamento";
import { useCrearActa } from "@/hooks/useActas";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { ActaPDF } from "./ActaPDF"; 
import { 
    FileDown, 
    Loader2, 
    Save, 
    AlertCircle, 
    CheckCircle2, 
    Trash2, 
    Calendar as CalendarIcon,
    Clock, 
    MapPin,
    Building2,
    Users,
    PenTool
} from "lucide-react"; 

interface Participante {
    nombre: string;
    cargo: string;
    correo: string;
}

interface Firma {
    nombre: string;
    cargo: string;
}

interface FormActa {
    departamento: string;
    fecha: string;
    hora_inicio: string;
    hora_fin: string;
    lugar: string;
    participantes: Participante[];
    firmas: Firma[];
}

export default function GenerarActa({ rutSecretario }: { rutSecretario: string }) {
    const { data: departamentos, isLoading } = useDepartamentos();
    const crearActa = useCrearActa();

    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const [form, setForm] = useState<FormActa>({
        departamento: "",
        fecha: "",
        hora_inicio: "",
        hora_fin: "",
        lugar: "",
        participantes: [{ nombre: "", cargo: "", correo: "" }],
        firmas: [{ nombre: "", cargo: "" }],
    });

    const formCompleto = useMemo(() => {
        const datosBasicos = form.departamento && form.fecha && form.hora_inicio && form.hora_fin && form.lugar;
        const tieneParticipantes = form.participantes.length > 0;
        const participantesValidos = form.participantes.every(p => p.nombre.trim() !== "" && p.cargo.trim() !== "");
        const tieneFirmas = form.firmas.length > 0;
        const firmasValidas = form.firmas.every(f => f.nombre.trim() !== "" && f.cargo.trim() !== "");

        return datosBasicos && tieneParticipantes && participantesValidos && tieneFirmas && firmasValidas;
    }, [form]);

    const validarParaGuardar = (): boolean => {
        if (!form.departamento) { setErrorMessage("Falta seleccionar el Departamento."); return false; }
        if (!form.fecha) { setErrorMessage("Falta ingresar la Fecha."); return false; }
        if (!form.hora_inicio || !form.hora_fin) { setErrorMessage("Faltan las horas de inicio o término."); return false; }
        if (!form.lugar) { setErrorMessage("Falta ingresar el Lugar."); return false; }
        if (form.participantes.length === 0) { setErrorMessage("Debe haber al menos un participante."); return false; }
        if (form.participantes.some(p => !p.nombre || !p.cargo)) { setErrorMessage("Complete nombre y cargo de todos los participantes."); return false; }
        if (form.firmas.length === 0) { setErrorMessage("Debe haber al menos una firma."); return false; }
        if (form.firmas.some(f => !f.nombre || !f.cargo)) { setErrorMessage("Complete nombre y cargo de todos los firmantes."); return false; }
        return true;
    };

    const getNombreDepartamento = () => {
        const dep = departamentos?.find(d => d.id.toString() === form.departamento);
        return dep ? dep.nombre : "";
    };

    const actualizarCampo = (campo: keyof FormActa, valor: string) => {
        setForm(prev => ({ ...prev, [campo]: valor }));
    };

    const actualizarParticipante = (index: number, campo: keyof Participante, valor: string) => {
        const copia = [...form.participantes];
        copia[index] = { ...copia[index], [campo]: valor };
        setForm(prev => ({ ...prev, participantes: copia }));
    };

    const actualizarFirma = (index: number, campo: keyof Firma, valor: string) => {
        const copia = [...form.firmas];
        copia[index] = { ...copia[index], [campo]: valor };
        setForm(prev => ({ ...prev, firmas: copia }));
    };

    const agregarParticipante = () => {
        setForm(prev => ({
            ...prev,
            participantes: [...prev.participantes, { nombre: "", cargo: "", correo: "" }],
        }));
    };

    const eliminarParticipante = (index: number) => {
        setForm(prev => ({
            ...prev,
            participantes: prev.participantes.filter((_, i) => i !== index)
        }));
    };

    const agregarFirma = () => {
        setForm(prev => ({
            ...prev,
            firmas: [...prev.firmas, { nombre: "", cargo: "" }],
        }));
    };

    const eliminarFirma = (index: number) => {
        setForm(prev => ({
            ...prev,
            firmas: prev.firmas.filter((_, i) => i !== index)
        }));
    };

    const enviar = () => {
        setErrorMessage("");
        if (!rutSecretario) {
            setErrorMessage("Error interno: Rut de secretario no encontrado.");
            setShowError(true);
            return;
        }
        if (!validarParaGuardar()) {
            setShowError(true);
            return;
        }

        crearActa.mutate({
            departamento: form.departamento,
            fecha: form.fecha,
            hora_inicio: form.hora_inicio,
            hora_fin: form.hora_fin,
            lugar: form.lugar,
            rut_secretaria: rutSecretario,
            participantes: form.participantes,
            firmas: form.firmas,
        }, {
            onSuccess: () => setShowSuccess(true),
            onError: () => {
                setErrorMessage("Error de conexión al guardar.");
                setShowError(true);
            },
        });
    };

    const datosPDF = { ...form, departamento: getNombreDepartamento() };

    if (isLoading) return (
        <div className="flex items-center justify-center h-64">
            <Loader2 className="animate-spin mr-2 text-blue-600" /> Cargando datos...
        </div>
    );

    return (
        <>
            {showSuccess && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl w-[400px] text-center transform scale-100 transition-all">
                        <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">¡Éxito!</h3>
                        <p className="text-gray-600 mb-6">El acta ha sido guardada correctamente en el sistema.</p>
                        <button onClick={() => setShowSuccess(false)} className="bg-gray-900 hover:bg-black text-white px-8 py-3 rounded-xl font-medium w-full transition-colors">
                            Entendido
                        </button>
                    </div>
                </div>
            )}

            {showError && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl w-[400px] text-center">
                        <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-8 h-8 text-red-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Faltan Datos</h3>
                        <p className="text-gray-600 mb-6">{errorMessage || "Por favor complete los campos obligatorios."}</p>
                        <button onClick={() => setShowError(false)} className="bg-gray-900 hover:bg-black text-white px-8 py-3 rounded-xl font-medium w-full transition-colors">
                            Volver y Corregir
                        </button>
                    </div>
                </div>
            )}

            <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden text-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                <div className="bg-slate-50 border-b border-gray-200 p-8">
                    <h2 className="text-3xl font-bold text-slate-800">Nueva Acta de Reunión</h2>
                    <p className="text-slate-500 mt-2">Complete la información oficial de la sesión.</p>
                </div>

                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-8">
                        
                        <div className="col-span-1 md:col-span-2">
                            <label className="block mb-2 text-sm font-semibold text-slate-700">Departamento o Unidad</label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                                <select
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer hover:border-gray-300"
                                    value={form.departamento}
                                    onChange={(e) => actualizarCampo("departamento", e.target.value)}
                                >
                                    <option value="">Seleccione Departamento...</option>
                                    {(departamentos ?? []).map((dep, index) => (
                                        <option key={`${dep.id}-${index}`} value={dep.id}>{dep.nombre}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-semibold text-slate-700">Fecha de Reunión</label>
                            <div className="relative group">
                                <div className="absolute left-3 top-3 pointer-events-none">
                                    <CalendarIcon className="w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                </div>
                                <input
                                    type="date"
                                    onClick={(e) => e.currentTarget.showPicker()} 
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all cursor-pointer hover:border-gray-300 text-slate-700"
                                    value={form.fecha}
                                    onChange={(e) => actualizarCampo("fecha", e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-semibold text-slate-700">Lugar</label>
                            <div className="relative group">
                                <div className="absolute left-3 top-3 pointer-events-none">
                                    <MapPin className="w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Ej: Sala de Consejo"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all hover:border-gray-300"
                                    value={form.lugar}
                                    onChange={(e) => actualizarCampo("lugar", e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-semibold text-slate-700">Hora Inicio</label>
                            <div className="relative group">
                                <div className="absolute left-3 top-3 pointer-events-none">
                                    <Clock className="w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                </div>
                                <input
                                    type="time"
                                    onClick={(e) => e.currentTarget.showPicker()}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all cursor-pointer hover:border-gray-300 text-slate-700"
                                    value={form.hora_inicio}
                                    onChange={(e) => actualizarCampo("hora_inicio", e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-semibold text-slate-700">Hora Término</label>
                            <div className="relative group">
                                <div className="absolute left-3 top-3 pointer-events-none">
                                    <Clock className="w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                </div>
                                <input
                                    type="time"
                                    onClick={(e) => e.currentTarget.showPicker()}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all cursor-pointer hover:border-gray-300 text-slate-700"
                                    value={form.hora_fin}
                                    onChange={(e) => actualizarCampo("hora_fin", e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 my-8"></div>

                    <div className="mb-10">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-2">
                                <div className="bg-blue-100 p-2 rounded-lg">
                                    <Users className="w-5 h-5 text-blue-600" />
                                </div>
                                <h3 className="font-bold text-lg text-slate-800">Participantes</h3>
                            </div>
                            <button
                                onClick={agregarParticipante}
                                className="text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:shadow-sm"
                            >
                                + Agregar Participante
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            {form.participantes.map((p, i) => (
                                <div key={`p-${i}`} className="group flex items-start gap-3 animate-in slide-in-from-left-2 duration-300">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 bg-slate-50 p-4 rounded-xl border border-transparent group-hover:border-blue-200 transition-colors">
                                        <input
                                            type="text"
                                            placeholder="Nombre completo"
                                            className="bg-white border border-gray-200 px-3 py-2 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none w-full"
                                            value={p.nombre}
                                            onChange={(e) => actualizarParticipante(i, "nombre", e.target.value)}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Cargo"
                                            className="bg-white border border-gray-200 px-3 py-2 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none w-full"
                                            value={p.cargo}
                                            onChange={(e) => actualizarParticipante(i, "cargo", e.target.value)}
                                        />
                                        <input
                                            type="email"
                                            placeholder="Correo electrónico"
                                            className="bg-white border border-gray-200 px-3 py-2 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none w-full"
                                            value={p.correo}
                                            onChange={(e) => actualizarParticipante(i, "correo", e.target.value)}
                                        />
                                    </div>
                                    <button
                                        onClick={() => eliminarParticipante(i)}
                                        className="mt-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Eliminar fila"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                            {form.participantes.length === 0 && (
                                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl bg-slate-50">
                                    <p className="text-gray-400 text-sm">No hay participantes registrados.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-2">
                                <div className="bg-purple-100 p-2 rounded-lg">
                                    <PenTool className="w-5 h-5 text-purple-600" />
                                </div>
                                <h3 className="font-bold text-lg text-slate-800">Firmas Requeridas</h3>
                            </div>
                            <button
                                onClick={agregarFirma}
                                className="text-purple-600 bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:shadow-sm"
                            >
                                + Agregar Firma
                            </button>
                        </div>

                        <div className="space-y-4">
                            {form.firmas.map((f, i) => (
                                <div key={`f-${i}`} className="group flex items-start gap-3 animate-in slide-in-from-left-2 duration-300">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 bg-slate-50 p-4 rounded-xl border border-transparent group-hover:border-purple-200 transition-colors">
                                        <input
                                            type="text"
                                            placeholder="Nombre del Firmante"
                                            className="bg-white border border-gray-200 px-3 py-2 rounded-lg focus:ring-1 focus:ring-purple-500 outline-none w-full"
                                            value={f.nombre}
                                            onChange={(e) => actualizarFirma(i, "nombre", e.target.value)}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Cargo del Firmante"
                                            className="bg-white border border-gray-200 px-3 py-2 rounded-lg focus:ring-1 focus:ring-purple-500 outline-none w-full"
                                            value={f.cargo}
                                            onChange={(e) => actualizarFirma(i, "cargo", e.target.value)}
                                        />
                                    </div>
                                    <button
                                        onClick={() => eliminarFirma(i)}
                                        className="mt-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Eliminar fila"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                            {form.firmas.length === 0 && (
                                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl bg-slate-50">
                                    <p className="text-gray-400 text-sm">No hay firmantes registrados.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 flex flex-col sm:flex-row justify-end items-center gap-4">
                    
                   {formCompleto ? (
                        <div className="animate-in fade-in zoom-in duration-300">
                            <PDFDownloadLink
                                document={<ActaPDF data={datosPDF} />}
                                fileName={`acta_${form.fecha || 'reunion'}.pdf`}
                                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-medium shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
                            >
                                {({ loading }) =>
                                    loading ? (
                                        <>
                                            <Loader2 className="animate-spin h-5 w-5" /> Generando...
                                        </>
                                    ) : (
                                        <>
                                            <FileDown className="h-5 w-5" /> Descargar PDF
                                        </>
                                    )
                                }
                            </PDFDownloadLink>
                        </div>
                    ) : (
                        <div className="text-sm text-gray-400 italic font-medium px-4">
                            Complete el formulario para descargar
                        </div>
                    )}

                    <button
                        onClick={enviar}
                        disabled={crearActa.isPending}
                        className={`flex items-center gap-2 py-3 px-8 rounded-xl font-bold shadow-md transition-all
                            ${crearActa.isPending 
                                ? "bg-slate-300 cursor-not-allowed text-slate-500" 
                                : "bg-slate-900 hover:bg-black text-white hover:scale-[1.02] hover:shadow-lg"
                            }`}
                    >
                        {crearActa.isPending ? <Loader2 className="animate-spin h-5 w-5"/> : <Save className="h-5 w-5"/>}
                        {crearActa.isPending ? "Procesando..." : "Guardar Acta"}
                    </button>
                </div>
            </div>
        </>
    );
}