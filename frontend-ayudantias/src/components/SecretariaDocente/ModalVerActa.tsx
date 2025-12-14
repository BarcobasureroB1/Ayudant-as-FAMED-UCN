"use client";

import dynamic from "next/dynamic";
import { ActaPDF } from "./ActaPDF";

const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  {
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-full text-gray-500">Cargando documento...</div>,
  }
);

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

interface ModalVerActaProps {
    acta: Acta;
    onClose: () => void;
}

export default function ModalVerActa({ acta, onClose }: ModalVerActaProps) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                
                <div className="flex justify-between items-center p-4 border-b bg-gray-50">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">
                            Vista Previa de Acta
                        </h3>
                        <p className="text-sm text-gray-500">
                            {acta.departamento} - {acta.fecha}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500 hover:text-red-600"
                        title="Cerrar"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 bg-gray-100 p-0 overflow-hidden relative">
                    <PDFViewer width="100%" height="100%" className="border-none absolute inset-0">
                        <ActaPDF data={acta} />
                    </PDFViewer>
                </div>
            </div>
        </div>
    );
}