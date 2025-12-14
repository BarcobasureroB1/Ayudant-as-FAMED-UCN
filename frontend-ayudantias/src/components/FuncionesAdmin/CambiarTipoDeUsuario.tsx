"use client";

import React, { useMemo, useState } from "react";
import api from "@/api/axios";
import { useCambiarTipoUsuario } from "@/hooks/useUsuarios";
import { useCrearAlumno } from "@/hooks/useAlumnoProfile";

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
        { value: "director_y_coordinador", label: "Director de departamento y Coordinador" },
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
        // si es alumno → verificar existencia sin hooks
        // -------------------------
        let alumnoExiste = null;
        try {
            const resp = await api.get(`/usuario/alumno/${pending.rut}`);
            alumnoExiste = resp.data;
        } catch (_) {
            alumnoExiste = null;
        }

        if (alumnoExiste) {
            // alumno ya existe → actualizar tipo directamente
            cambiarTipo.mutate({
                rut_usuario: pending.rut,
                nuevo_tipo: "alumno",
            });

            setSelectedTipos((prev) => ({ ...prev, [pending.rut]: "alumno" }));
            setPending(null);
            setShowConfirmPopup(false);
            return;
        }

        // -------------------------
        // NO existe → abrir formulario
        // -------------------------
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

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 relative">

            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Administración de Usuarios</h2>
                <button
                    onClick={onClose}
                    className="px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                    Cerrar
                </button>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                <input
                  type="text"
                  placeholder="Buscar asignatura..."
                  value={busqueda}
                  onChange={(e) => {
                    setBusqueda(e.target.value);
                    setPaginaActual(1);
                  }}
                  className="w-full sm:w-1/3 border border-gray-300 text-black rounded-md px-3 py-2 text-sm"
                />

                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700">Mostrar</label>
                  <input
                    type="number"
                    min={1}
                    value={isNaN(itemsPorPagina) ? "" : itemsPorPagina}
                    onChange={(e) => {
                      const n = Number(e.target.value);
                      if (n > 0) {
                        setItemsPorPagina(n);
                        setPaginaActual(1);
                      }
                    }}
                    className="w-20 border border-gray-300 text-black rounded-md px-2 py-1 text-sm text-center"
                  />
                  <span className="text-sm text-gray-700">usuarios</span>
                </div>

                {totalPaginasFiltradas > 1 && (
                  <div className="flex items-center gap-2 mt-2 sm:mt-0">
                    <button
                      onClick={() => setPaginaActual(paginaActual - 1)}
                      disabled={paginaActual === 1}
                      className={`px-3 py-1 rounded-md text-sm border ${
                        paginaActual === 1
                          ? "bg-gray-200 text-gray-400"
                          : "bg-blue-600 text-white"
                      }`}
                    >
                      ← Anterior
                    </button>

                    <span className="text-sm text-gray-700">
                      Página {paginaActual} de {totalPaginasFiltradas}
                    </span>

                    <button
                      onClick={() => setPaginaActual(paginaActual + 1)}
                      disabled={paginaActual === totalPaginasFiltradas}
                      className={`px-3 py-1 rounded-md text-sm border ${
                        paginaActual === totalPaginasFiltradas
                          ? "bg-gray-200 text-gray-400"
                          : "bg-blue-600 text-white"
                      }`}
                    >
                      Siguiente →
                    </button>
                  </div>
                )}
            </div>

            <div className="overflow-y-auto max-h-[60vh]">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b text-black">
                            <th className="p-2">RUT</th>
                            <th className="p-2">Nombre</th>
                            <th className="p-2">Tipo</th>
                            <th className="p-2">Cambiar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuariosPaginados.map((u) => (
                            <tr key={u.rut} className="border-b text-black">
                                <td className="p-2">{u.rut}</td>
                                <td className="p-2">{u.nombres} {u.apellidos}</td>
                                <td className="p-2">{u.tipo}</td>
                                <td className="p-2">
                                    <select
                                        className="border px-2 py-1 rounded"
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
                    </tbody>
                </table>
            </div>

            {/* POPUP CONFIRMACION */}
            {showConfirmPopup && pending && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center text-black">
                    <div className="bg-white p-6 rounded-xl w-[350px]">
                        <h3 className="text-lg font-semibold mb-3">Confirmar Cambio</h3>
                        <p className="mb-4">
                            ¿Seguro que deseas cambiar el tipo de  
                            <b> {pending.nombre} </b>  
                            a <b>{pending.nuevoTipo}</b>?
                        </p>

                        <div className="flex justify-between mt-4">
                            <button
                                onClick={cancelarCambio}
                                className="px-4 py-2 bg-gray-300 rounded"
                            >
                                Cancelar
                            </button>

                            <button
                                onClick={confirmarCambio}
                                className="px-4 py-2 bg-blue-500 text-white rounded"
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* POPUP FORM PARA CAMBIAR UN TIPO POR ALUMNO */}
            {showAlumnoPopup && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center text-black overflow-auto p-4">
                    <div className="bg-white p-6 rounded-xl w-[420px]">
                        <h3 className="text-lg font-semibold mb-4">Crear un perfil de alumno para el cambio:</h3>

                        <div className="flex flex-col gap-3 overflow-auto p-4 max-h-[60vh]">

                            <input className="border px-3 py-2 rounded" value={formAlumno.rut_alumno} readOnly />
                            <input className="border px-3 py-2 rounded" value={formAlumno.nombres} readOnly />
                            <input className="border px-3 py-2 rounded" value={formAlumno.apellidos} readOnly />

                            <p className="text-black">Correo electrónico</p>
                            <input
                                className="border px-3 py-2 rounded"
                                value={formAlumno.correo}
                                onChange={(e) => setFormAlumno({ ...formAlumno, correo: e.target.value })}
                                placeholder="Correo"
                            />

                            <p className="text-black">Fecha de admisión</p>
                            <input
                                className="border px-3 py-2 rounded"
                                type="date"
                                value={formAlumno.fecha_admision}
                                onChange={(e) => setFormAlumno({ ...formAlumno, fecha_admision: e.target.value })}
                            />

                            <p className="text-black">Nivel</p>
                            <input
                                className="border px-3 py-2 rounded"
                                type="number"
                                placeholder="Nivel"
                                value={formAlumno.nivel}
                                onChange={(e) => setFormAlumno({ ...formAlumno, nivel: e.target.value })}
                            />

                            <p className="text-black">Código de carrera</p>
                            <input
                                className="border px-3 py-2 rounded"
                                placeholder="Código de carrera"
                                value={formAlumno.codigo_carrera}
                                onChange={(e) => setFormAlumno({ ...formAlumno, codigo_carrera: e.target.value })}
                            />

                            <p className="text-black">Nombre de la carrera</p>
                            <input
                                className="border px-3 py-2 rounded"
                                placeholder="Nombre de la carrera"
                                value={formAlumno.nombre_carrera}
                                onChange={(e) => setFormAlumno({ ...formAlumno, nombre_carrera: e.target.value })}
                            />

                            <p className="text-black">Promedio de notas</p>
                            <input
                                className="border px-3 py-2 rounded"
                                type="number"
                                placeholder="Promedio"
                                value={formAlumno.promedio}
                                onChange={(e) => setFormAlumno({ ...formAlumno, promedio: e.target.value })}
                            />

                            <p className="text-black">Periodo actual (formato YYYYSemestre) (Ej: 202520)</p>
                            <input
                                className="border px-3 py-2 rounded"
                                type="number"
                                placeholder="Periodo"
                                value={formAlumno.periodo}
                                onChange={(e) => setFormAlumno({ ...formAlumno, periodo: e.target.value })}
                            />
                        </div>

                        <div className="flex justify-between mt-5">
                            <button
                                onClick={cancelarCambio}
                                className="px-4 py-2 bg-gray-300 rounded"
                            >
                                Cancelar
                            </button>

                            <button
                                onClick={crearAlumnoSubmit}
                                className="px-4 py-2 bg-green-500 text-white rounded"
                            >
                                Guardar Alumno
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
