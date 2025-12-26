"use client";

import React, { useMemo, useState } from "react";
import api from "@/api/axios";
import { useCambiarTipoUsuario } from "@/hooks/useUsuarios";
import { useCrearAlumno } from "@/hooks/useAlumnoProfile";
import { 
  UserCog, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  X,  
  Save,
  Mail,
  Calendar,
  GraduationCap,
  BookOpen,
  Hash
} from "lucide-react";

interface Usuario {
    rut: string;
    nombres: string;
    apellidos: string;
    tipo: string;
}

export default function AdministrarUsuarios({
    onClose,
    usuarios,
}: {
    onClose: () => void;
    usuarios: Usuario[];
}) {
    const cambiarTipo = useCambiarTipoUsuario();
    const crearAlumno = useCrearAlumno();

    // -------------------------
    // ESTADOS
    // -------------------------
    const [busqueda, setBusqueda] = useState("");
    const [paginaActual, setPaginaActual] = useState(1);
    const [itemsPorPagina, setItemsPorPagina] = useState(5);


    const [selectedTipos, setSelectedTipos] = useState<Record<string, string>>(() => {
        const m: Record<string, string> = {};
        usuarios.forEach((u) => (m[u.rut] = u.tipo));
        return m;
    });

    const [pending, setPending] = useState<{
        rut: string;
        nombre: string;
        nuevoTipo: string;
    } | null>(null);

    // formulario para alumno
    const [formAlumno, setFormAlumno] = useState({
        rut_alumno: "",
        nombres: "",
        apellidos: "",
        correo: "",
        fecha_admision: "",
        nivel: "",
        codigo_carrera: "",
        nombre_carrera: "",
        promedio: "",
        periodo: "",
    });

    const [showConfirmPopup, setShowConfirmPopup] = useState(false);
    const [showAlumnoPopup, setShowAlumnoPopup] = useState(false);

    const opciones = [
        { value: "admin", label: "Administrador" },
        { value: "secretaria_depto", label: "Secretaría de Departamento" },
        { value: "coordinador", label: "Coordinador" },
        { value: "alumno", label: "Alumno" },
        { value: "encargado_ayudantias", label: "Encargado de ayudantías" }, 
        { value: "director_depto", label: "Director de departamento" },
        { value: "secretaria_docente", label: "Secretaría docente" },
        { value: "coordinador_secretariaDocente", label: "Secretaría docente y Coordinador" },
        { value: "coordinador_directorDepto", label: "Coordinador y Director de departamento" },
    ];

    // -------------------------
    // FILTRO DE USUARIOS
    // -------------------------
    const usuariosFiltrados = useMemo(() => {
        const t = busqueda.toLowerCase();
        return usuarios.filter((u) =>
            `${u.rut} ${u.nombres} ${u.apellidos}`.toLowerCase().includes(t)
        );
    }, [busqueda, usuarios]);

    const totalPaginasFiltradas = Math.ceil(
    usuariosFiltrados.length / (itemsPorPagina || 1)
    );

    const usuariosPaginados = useMemo(() => {
        const inicio = (paginaActual - 1) * itemsPorPagina;
        return usuariosFiltrados.slice(inicio, inicio + itemsPorPagina);
    }, [paginaActual, itemsPorPagina, usuariosFiltrados]);

    // -------------------------
    // CAMBIO DE SELECTOR
    // -------------------------
    const handleSelectChange = (rut: string, nuevoTipo: string) => {
        const usuario = usuarios.find((u) => u.rut === rut);
        if (!usuario) return;

        setPending({
            rut,
            nombre: `${usuario.nombres} ${usuario.apellidos}`,
            nuevoTipo,
        });

        setShowConfirmPopup(true);
    };

    // -------------------------
    // CONFIRMAR CAMBIO
    // -------------------------
    const confirmarCambio = async () => {
        if (!pending) return;

        // CORRECCIÓN: Si NO es alumno, actualizamos directo (incluye admin, encargado, etc.)
        if (pending.nuevoTipo !== "alumno") {
            cambiarTipo.mutate({
                rut_usuario: pending.rut,
                nuevo_tipo: pending.nuevoTipo,
            });

            setSelectedTipos((prev) => ({ ...prev, [pending.rut]: pending.nuevoTipo }));
            setPending(null);
            setShowConfirmPopup(false);
            return;
        }

        // -------------------------
        // Lógica exclusiva para cuando se cambia a "alumno"
        // -------------------------
        let alumnoExiste = null;
        try {
            const resp = await api.get(`/usuario/alumno/${pending.rut}`);
            alumnoExiste = resp.data;
        } catch (_) {
            alumnoExiste = null;
        }

        if (alumnoExiste) {
            // El perfil ya existe, asignamos el rol
            cambiarTipo.mutate({
                rut_usuario: pending.rut,
                nuevo_tipo: "alumno",
            });

            setSelectedTipos((prev) => ({ ...prev, [pending.rut]: "alumno" }));
            setPending(null);
            setShowConfirmPopup(false);
            return;
        }

        // NO existe el perfil → abrir formulario de creación
        const partes = pending.nombre.split(" ");
        const nombres = partes[0] || "";
        const apellidos = partes.slice(1).join(" ") || "";

        setFormAlumno({
            rut_alumno: pending.rut,
            nombres,
            apellidos,
            correo: "",
            fecha_admision: "",
            nivel: "",
            codigo_carrera: "",
            nombre_carrera: "",
            promedio: "",
            periodo: "",
        });

        setShowConfirmPopup(false);
        setShowAlumnoPopup(true);
    };

    // -------------------------
    // CANCELAR CAMBIO
    // -------------------------
    const cancelarCambio = () => {
        if (pending) {
            const rut = pending.rut;
            const tipoReal = usuarios.find((u) => u.rut === rut)!.tipo;

            setSelectedTipos((prev) => ({ ...prev, [rut]: tipoReal }));
        }

        setPending(null);
        setShowConfirmPopup(false);
        setShowAlumnoPopup(false);
    };

    // -------------------------
    // SUBMIT FORM ALUMNO
    // -------------------------
    const crearAlumnoSubmit = async () => {
        if (!pending) return;

        const campos = [
            "correo",
            "fecha_admision",
            "nivel",
            "codigo_carrera",
            "nombre_carrera",
            "promedio",
            "periodo",
        ];

        for (const c of campos) {
            // @ts-ignore
            if (!formAlumno[c]) {
                alert("Todos los campos son obligatorios.");
                return;
            }
        }

        await crearAlumno.mutateAsync({
            rut_alumno: formAlumno.rut_alumno,
            nombres: formAlumno.nombres,
            apellidos: formAlumno.apellidos,
            correo: formAlumno.correo,
            fecha_admision: formAlumno.fecha_admision,
            nivel: Number(formAlumno.nivel),
            codigo_carrera: formAlumno.codigo_carrera,
            nombre_carrera: formAlumno.nombre_carrera,
            promedio: Number(formAlumno.promedio),
            periodo: formAlumno.periodo,
        });

        cambiarTipo.mutate({
            rut_usuario: pending.rut,
            nuevo_tipo: "alumno",
        });

        setSelectedTipos((prev) => ({ ...prev, [pending.rut]: "alumno" }));
        setShowAlumnoPopup(false);
        setPending(null);
    };

    // Helper para inputs del formulario
    const InputField = ({ label, icon: Icon, value, onChange, type = "text", placeholder, readOnly = false }: any) => (
        <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                {Icon && <Icon className="w-3.5 h-3.5 text-indigo-500" />}
                {label}
            </label>
            <input
                type={type}
                value={value}
                onChange={onChange}
                readOnly={readOnly}
                placeholder={placeholder}
                className={`block w-full rounded-lg border py-2 px-3 text-sm transition-all shadow-sm ${
                    readOnly 
                    ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed font-medium" 
                    : "bg-white text-slate-900 border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 placeholder:text-slate-400"
                }`}
            />
        </div>
    );

    return (
        <div className="w-full">
            
            {/* CONTAINER PRINCIPAL */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                
                {/* HEADER */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                            <UserCog className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Administración de Usuarios</h2>
                            <p className="text-sm text-slate-500">Gestión de roles y permisos</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                        title="Cerrar vista"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    {/* BARRA DE CONTROLES */}
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                        <div className="relative w-full sm:w-96">
                            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar usuario por nombre o RUT..."
                                value={busqueda}
                                onChange={(e) => {
                                    setBusqueda(e.target.value);
                                    setPaginaActual(1);
                                }}
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
                                    onChange={(e) => {
                                        const n = Number(e.target.value);
                                        if (n > 0) {
                                            setItemsPorPagina(n);
                                            setPaginaActual(1);
                                        }
                                    }}
                                    className="w-12 text-center text-sm border-gray-100 text-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 py-1"
                                />
                            </div>

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

                    {/* TABLA DE USUARIOS */}
                    <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm bg-white">
                        <table className="min-w-full divide-y divide-gray-200 table-fixed">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="w-[20%] px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">RUT</th>
                                    <th className="w-[30%] px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre</th>
                                    <th className="w-[20%] px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Tipo Actual</th>
                                    <th className="w-[30%] px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Acción (Cambiar)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {usuariosPaginados.map((u) => (
                                    <tr key={u.rut} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-500">{u.rut}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">{u.nombres} {u.apellidos}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                                {opciones.find(o => o.value === u.tipo)?.label || u.tipo}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <select
                                                className="block w-full max-w-[240px] rounded-lg border-slate-300 py-1.5 px-3 text-sm focus:border-indigo-500 focus:ring-indigo-500 shadow-sm bg-white text-slate-700 cursor-pointer"
                                                value={selectedTipos[u.rut]}
                                                onChange={(e) => handleSelectChange(u.rut, e.target.value)}
                                            >
                                                {opciones.map((o) => (
                                                    <option key={o.value} value={o.value}>
                                                        {o.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                                {usuariosPaginados.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-slate-500 text-sm">
                                            No se encontraron usuarios.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* POPUP CONFIRMACION */}
            {showConfirmPopup && pending && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center border border-slate-100 transform scale-100">
                        <div className="mx-auto bg-indigo-50 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                            <UserCog className="w-7 h-7 text-indigo-600" />
                        </div>
                        
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Confirmar Cambio de Rol</h3>
                        
                        <p className="text-slate-600 text-sm leading-relaxed mb-6">
                            ¿Seguro que deseas cambiar el rol de <br/>
                            <span className="font-semibold text-slate-800">{pending.nombre}</span> <br/>
                            a <span className="font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{opciones.find(o => o.value === pending.nuevoTipo)?.label}</span>?
                        </p>

                        <div className="flex justify-center gap-3">
                            <button
                                onClick={cancelarCambio}
                                className="flex-1 px-4 py-2.5 text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors"
                            >
                                Cancelar
                            </button>

                            <button
                                onClick={confirmarCambio}
                                className="flex-1 px-4 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg shadow-sm text-sm font-medium transition-colors"
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* POPUP FORM PARA CAMBIAR A ALUMNO */}
            {showAlumnoPopup && (
                <div className="fixed inset-0 z-[100] overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={cancelarCambio} />
                        
                        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 w-full max-w-2xl border border-slate-100">
                            {/* Header Formulario */}
                            <div className="bg-white px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        <GraduationCap className="w-5 h-5 text-indigo-600"/> Crear Perfil de Alumno
                                    </h3>
                                    <p className="text-sm text-slate-500 mt-1">Es necesario completar estos datos para el rol de Alumno.</p>
                                </div>
                                <button onClick={cancelarCambio} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-50 transition-colors">
                                    <X className="w-6 h-6"/>
                                </button>
                            </div>

                            <div className="p-6 bg-slate-50/30 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                <div className="space-y-6">
                                    {/* Sección Datos Básicos (Read Only) */}
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Datos de Usuario (No Editables)</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <InputField label="RUT" value={formAlumno.rut_alumno} readOnly />
                                            <InputField label="Nombres" value={formAlumno.nombres} readOnly />
                                            <InputField label="Apellidos" value={formAlumno.apellidos} readOnly />
                                        </div>
                                    </div>

                                    {/* Sección Datos Académicos */}
                                    <div>
                                        <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wide mb-3 flex items-center gap-2">
                                            <BookOpen className="w-4 h-4"/> Información Académica
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                                            <InputField 
                                                label="Correo Institucional" icon={Mail}
                                                value={formAlumno.correo} 
                                                onChange={(e: any) => setFormAlumno({ ...formAlumno, correo: e.target.value })}
                                                placeholder="ejemplo@alumnos.ucn.cl"
                                            />
                                            <InputField 
                                                label="Fecha de Admisión" icon={Calendar} type="date"
                                                value={formAlumno.fecha_admision} 
                                                onChange={(e: any) => setFormAlumno({ ...formAlumno, fecha_admision: e.target.value })}
                                            />
                                            <InputField 
                                                label="Nivel (Semestre)" icon={Hash} type="number"
                                                value={formAlumno.nivel} 
                                                onChange={(e: any) => setFormAlumno({ ...formAlumno, nivel: e.target.value })}
                                                placeholder="Ej: 5"
                                            />
                                            <InputField 
                                                label="Código Carrera" icon={Hash}
                                                value={formAlumno.codigo_carrera} 
                                                onChange={(e: any) => setFormAlumno({ ...formAlumno, codigo_carrera: e.target.value })}
                                                placeholder="Ej: 1205"
                                            />
                                            <InputField 
                                                label="Nombre Carrera" 
                                                value={formAlumno.nombre_carrera} 
                                                onChange={(e: any) => setFormAlumno({ ...formAlumno, nombre_carrera: e.target.value })}
                                                placeholder="Ej: Medicina"
                                            />
                                            <InputField 
                                                label="Promedio General" type="number"
                                                value={formAlumno.promedio} 
                                                onChange={(e: any) => setFormAlumno({ ...formAlumno, promedio: e.target.value })}
                                                placeholder="Ej: 5.8"
                                            />
                                            <InputField 
                                                label="Periodo Actual" placeholder="Ej: 202520"
                                                value={formAlumno.periodo} 
                                                onChange={(e: any) => setFormAlumno({ ...formAlumno, periodo: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-4 bg-white border-t border-slate-100 flex justify-end gap-3">
                                <button
                                    onClick={cancelarCambio}
                                    className="px-4 py-2.5 text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={crearAlumnoSubmit}
                                    className="px-4 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg shadow-sm text-sm font-medium transition-colors flex items-center gap-2"
                                >
                                    <Save className="w-4 h-4" /> Guardar y Asignar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}