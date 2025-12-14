"use client";

import { useState } from "react";
import ModalVerActa from "./ModalVerActa";

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
                <ModalVerActa 
                    acta={actaSeleccionada} 
                    onClose={() => setActaSeleccionada(null)} 
                />
            )}
        </div>
    );
}

