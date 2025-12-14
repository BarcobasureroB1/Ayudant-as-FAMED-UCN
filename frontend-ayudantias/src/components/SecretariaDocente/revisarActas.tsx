"use client";

import { useState } from "react";

interface Participante {
    nombre: string;
    cargo: string;
    correo: string;
}

interface Firma {
    nombre: string;
    cargo: string;
}

interface Acta {
    id: number;
    departamento: string;
    fecha: string;
    hora_inicio: string;
    hora_fin: string;
    lugar: string;
    participantes: Participante[];
    firmas: Firma[];
}

interface Props {
    actas: Acta[] | undefined;
}

export default function VerActas({ actas }: Props) {
    const [actaSeleccionada, setActaSeleccionada] = useState<Acta | null>(null);

    if (!actas || actas.length === 0) {
        return (
            <div className="bg-white p-6 rounded-lg shadow border text-center text-gray-600">
                No hay actas registradas.
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow border text-black w-full">

            <h2 className="text-2xl font-semibold mb-6">Actas Generadas</h2>

            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-gray-100 text-left">
                        <th className="p-3">Fecha</th>
                        <th className="p-3">Departamento</th>
                        <th className="p-3 text-center">Acción</th>
                    </tr>
                </thead>

                <tbody>
                    {actas.map((acta) => (
                        <tr
                            key={acta.id}
                            className="border-b hover:bg-gray-50 transition"
                        >
                            <td className="p-3">{acta.fecha}</td>
                            <td className="p-3">{acta.departamento}</td>
                            <td className="p-3 text-center">
                                <button
                                    onClick={() => setActaSeleccionada(acta)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                                >
                                    Ver detalle
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {actaSeleccionada && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl relative">

                        <button
                            onClick={() => setActaSeleccionada(null)}
                            className="absolute top-3 right-3 text-gray-500 hover:text-black"
                        >
                            ✕
                        </button>

                        <h3 className="text-xl font-semibold mb-4">
                            Detalle del Acta
                        </h3>

                        <div className="space-y-2 text-sm">
                            <p><b>Departamento:</b> {actaSeleccionada.departamento}</p>
                            <p><b>Fecha:</b> {actaSeleccionada.fecha}</p>
                            <p>
                                <b>Horario:</b>{" "}
                                {actaSeleccionada.hora_inicio} - {actaSeleccionada.hora_fin}
                            </p>
                            <p><b>Lugar:</b> {actaSeleccionada.lugar}</p>
                        </div>

                        <div className="mt-4">
                            <h4 className="font-semibold mb-2">Participantes</h4>

                            <ul className="list-disc pl-5 text-sm">
                                {actaSeleccionada.participantes &&
                                actaSeleccionada.participantes.length > 0 ? (
                                    actaSeleccionada.participantes.map((p, i) => (
                                        <li key={`p-${i}`}>
                                            {p.nombre} – {p.cargo} ({p.correo})
                                        </li>
                                    ))
                                ) : (
                                    <li className="text-gray-500 italic">
                                        No hay participantes registrados.
                                    </li>
                                )}
                            </ul>
                        </div>

                        <div className="mt-4">
                            <h4 className="font-semibold mb-2">Firmas</h4>

                            <ul className="list-disc pl-5 text-sm">
                                {actaSeleccionada.firmas &&
                                actaSeleccionada.firmas.length > 0 ? (
                                    actaSeleccionada.firmas.map((f, i) => (
                                        <li key={`f-${i}`}>
                                            {f.nombre} – {f.cargo}
                                        </li>
                                    ))
                                ) : (
                                    <li className="text-gray-500 italic">
                                        No hay firmas registradas.
                                    </li>
                                )}
                            </ul>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}

