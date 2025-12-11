"use client";

import { useState } from "react";
import { useDepartamentos } from "@/hooks/useDepartamento";
import { useCrearActa } from "@/hooks/useActas";

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

    const [form, setForm] = useState<FormActa>({
        departamento: "",
        fecha: "",
        hora_inicio: "",
        hora_fin: "",
        lugar: "",
        participantes: [{ nombre: "", cargo: "", correo: "" }],
        firmas: [{ nombre: "", cargo: "" }],
    });

    const actualizarCampo = (campo: keyof FormActa, valor: string) => {
        setForm(prev => ({ ...prev, [campo]: valor }));
    };

    const actualizarParticipante = (
        index: number,
        campo: keyof Participante,
        valor: string
    ) => {
        const copia = [...form.participantes];
        copia[index] = { ...copia[index], [campo]: valor };
        setForm(prev => ({ ...prev, participantes: copia }));
    };

    const actualizarFirma = (
        index: number,
        campo: keyof Firma,
        valor: string
    ) => {
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

    const agregarFirma = () => {
        setForm(prev => ({
            ...prev,
            firmas: [...prev.firmas, { nombre: "", cargo: "" }],
        }));
    };

    const enviar = () => {
        if (!rutSecretario) {
            alert("Error: no se pudo obtener el rut del secretario.");
            return;
        }

        crearActa.mutate({
            departamento: form.departamento,
            fecha: form.fecha,
            hora_inicio: form.hora_inicio,
            hora_fin: form.hora_fin,
            lugar: form.lugar,
            rut_secretario: rutSecretario,
            participantes: form.participantes,
            firmas: form.firmas,
        });
    };

    if (isLoading) return <p>Cargando departamentos...</p>;

    return (
        <div className="p-6 bg-white rounded-xl shadow-md border border-gray-200 w-full text-black">
            <h2 className="text-2xl font-semibold mb-6">Generar Acta</h2>

            <div className="mb-4">
                <label className="block mb-1 font-medium">Departamento</label>
                <select
                    className="border rounded-lg p-2 w-full"
                    value={form.departamento}
                    onChange={(e) => actualizarCampo("departamento", e.target.value)}
                >
                    <option value="">Seleccione...</option>

                    {(departamentos ?? []).map((dep, index) => (
                        <option
                            key={`${dep.id}-${index}`}
                            value={dep.id}
                        >
                            {dep.nombre}
                        </option>
                    ))}
                </select>
            </div>

            <div className="mb-4">
                <label className="block mb-1 font-medium">Fecha de la reunión</label>
                <input
                    type="date"
                    className="border rounded-lg p-2 w-full"
                    value={form.fecha}
                    onChange={(e) => actualizarCampo("fecha", e.target.value)}
                />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block mb-1 font-medium">Hora inicio</label>
                    <input
                        type="time"
                        className="border rounded-lg p-2 w-full"
                        value={form.hora_inicio}
                        onChange={(e) => actualizarCampo("hora_inicio", e.target.value)}
                    />
                </div>

                <div>
                    <label className="block mb-1 font-medium">Hora término</label>
                    <input
                        type="time"
                        className="border rounded-lg p-2 w-full"
                        value={form.hora_fin}
                        onChange={(e) => actualizarCampo("hora_fin", e.target.value)}
                    />
                </div>
            </div>

            <div className="mb-4">
                <label className="block mb-1 font-medium">Lugar de reunión</label>
                <input
                    type="text"
                    className="border rounded-lg p-2 w-full"
                    value={form.lugar}
                    onChange={(e) => actualizarCampo("lugar", e.target.value)}
                />
            </div>

            <div className="mb-4">
                <label className="block font-medium mb-2">Participantes</label>

                {form.participantes.map((p, i) => (
                    <div key={`p-${i}`} className="grid grid-cols-3 gap-3 mb-3">
                        <input
                            type="text"
                            placeholder="Nombre"
                            className="border p-2 rounded"
                            value={p.nombre}
                            onChange={(e) => actualizarParticipante(i, "nombre", e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Cargo"
                            className="border p-2 rounded"
                            value={p.cargo}
                            onChange={(e) => actualizarParticipante(i, "cargo", e.target.value)}
                        />
                        <input
                            type="email"
                            placeholder="Correo"
                            className="border p-2 rounded"
                            value={p.correo}
                            onChange={(e) => actualizarParticipante(i, "correo", e.target.value)}
                        />
                    </div>
                ))}

                <button
                    onClick={agregarParticipante}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                    + Añadir participante
                </button>
            </div>

            <div className="mb-4">
                <label className="block font-medium mb-2">Firmas</label>

                {form.firmas.map((f, i) => (
                    <div key={`f-${i}`} className="grid grid-cols-2 gap-3 mb-3">
                        <input
                            type="text"
                            placeholder="Nombre"
                            className="border p-2 rounded"
                            value={f.nombre}
                            onChange={(e) => actualizarFirma(i, "nombre", e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Cargo"
                            className="border p-2 rounded"
                            value={f.cargo}
                            onChange={(e) => actualizarFirma(i, "cargo", e.target.value)}
                        />
                    </div>
                ))}

                <button
                    onClick={agregarFirma}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                    + Añadir firma
                </button>
            </div>

            <button
                onClick={enviar}
                className="mt-6 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg"
            >
                Generar acta
            </button>
        </div>
    );
}

