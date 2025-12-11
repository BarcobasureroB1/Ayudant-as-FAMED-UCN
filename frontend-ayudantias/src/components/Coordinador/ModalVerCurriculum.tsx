import React from 'react';
import { useComprobarCurriculum } from '@/hooks/useCurriculum';

const InfoCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">{title}</h3>
        {children}
    </div>
);

interface ModalVerCurriculumProps {
    rut: string;
    onClose: () => void;
}

export const ModalVerCurriculum = ({ rut, onClose}: ModalVerCurriculumProps) => {
    //hook se ejecuta cuando el componente recibe el rut asociado en la page de coordinador
    const {data: curriculum, isLoading } = useComprobarCurriculum(rut);

    return (
        <div
            className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
        >
            <div
                className="bg-white p-6 rounded-2xl shadow-2xl w-[90%] max-w-[800px] relative animate-fadeIn max-h-[85vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl transition-colors font-bold"
                >
                    ✕
                </button>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Curriculum Postulante</h2>
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                    </div>
                ) : !curriculum ? (
                    <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-lg">⚠ No se encontró información.</p>
                        <p className="text-sm mt-2">El estudiante no ha completado su currículum aún.</p>
                    </div>
                ) : (
                    <div className="space-y-4 text-gray-700">
                        <InfoCard title="Información Personal">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6 text-sm">
                                <div><span className="font-semibold text-gray-900">Nombre:</span> {curriculum.nombres} {curriculum.apellidos}</div>
                                <div><span className="font-semibold text-gray-900">RUT:</span> {curriculum.usuario.rut}</div>
                                <div><span className="font-semibold text-gray-900">Correo:</span> {curriculum.correo}</div>
                                <div><span className="font-semibold text-gray-900">Celular:</span> {curriculum.Num_Celular}</div>
                                <div><span className="font-semibold text-gray-900">Carrera:</span> {curriculum.carrera}</div>
                                <div><span className="font-semibold text-gray-900">Fecha Nacimiento:</span> {curriculum.fecha_nacimiento}</div>
                                <div className="md:col-span-2"><span className="font-semibold text-gray-900">Dirección:</span> {curriculum.ciudad}, {curriculum.comuna}</div>
                            </div>
                        </InfoCard>


                        {curriculum.usuario.ayudantias && curriculum.usuario.ayudantias.length > 0 && (
                            <InfoCard title="Ayudantías Realizadas">
                                <ul className="space-y-3">
                                    {curriculum.usuario.ayudantias.map((ayudantia: any) => (
                                        <li key={ayudantia.id} className="border-l-4 border-blue-500 pl-4 py-1 bg-blue-50 rounded-r-lg">
                                            <p className="font-bold text-gray-800">{ayudantia.nombre_asig}</p>
                                            <div className="text-sm text-gray-600 flex flex-col sm:flex-row gap-2 sm:gap-4">
                                                <span>Coordinador: {ayudantia.nombre_coordinador}</span>
                                                {ayudantia.evaluacion && <span className="font-medium text-blue-700">Nota: {ayudantia.evaluacion}</span>}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </InfoCard>
                        )}


                        {curriculum.usuario.titulos && curriculum.usuario.titulos.length > 0 && (
                            <InfoCard title="Cursos, Títulos y Grados">
                                <ul className="space-y-3">
                                    {curriculum.usuario.titulos.map((titulo: any) => (
                                        <li key={titulo.id} className="border-l-4 border-purple-500 pl-4 py-1 bg-purple-50 rounded-r-lg">
                                            <p className="font-bold text-gray-800">{titulo.nombre_asig}</p>
                                            <p className="text-sm text-gray-600">{titulo.n_coordinador}</p>
                                        </li>
                                    ))}
                                </ul>
                            </InfoCard>
                        )}

                        {curriculum.usuario.actividades_cientificas && curriculum.usuario.actividades_cientificas.length > 0 && (
                            <InfoCard title="Actividades Científicas">
                                <ul className="space-y-3">
                                    {curriculum.usuario.actividades_cientificas.map((act: any) => (
                                        <li key={act.id} className="border-l-4 border-orange-500 pl-4 py-1 bg-orange-50 rounded-r-lg">
                                            <p className="font-bold text-gray-800">{act.nombre}</p>
                                            <p className="text-sm text-gray-700 italic">"{act.descripcion}"</p>
                                            <p className="text-xs text-gray-500 mt-1">{act.periodo_participacion}</p>
                                        </li>
                                    ))}
                                </ul>
                            </InfoCard>
                        )}


                        {curriculum.usuario.actividades_extracurriculares && curriculum.usuario.actividades_extracurriculares.length > 0 && (
                            <InfoCard title="Actividades Extracurriculares">
                                <ul className="space-y-3">
                                    {curriculum.usuario.actividades_extracurriculares.map((extra: any) => (
                                        <li key={extra.id} className="border-l-4 border-green-500 pl-4 py-1 bg-green-50 rounded-r-lg">
                                            <p className="font-bold text-gray-800">{extra.nombre}</p>
                                            <p className="text-sm text-gray-600">Docente/Institución: {extra.docente}</p>
                                            <p className="text-sm text-gray-700 mt-1">{extra.descripcion}</p>
                                        </li>
                                    ))}
                                </ul>
                            </InfoCard>
                        )}

                        {curriculum.otros && (
                            <InfoCard title="Información Adicional">
                                <p className="text-sm text-gray-700 whitespace-pre-line bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    {curriculum.otros}
                                </p>
                            </InfoCard>
                        )}
                        </div>
                )}
            </div>
        </div>
    );
};