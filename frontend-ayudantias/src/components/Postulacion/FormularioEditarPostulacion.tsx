"use client";

import React, { useState } from "react";
import Select from "react-select";
import { EditarPostulacion } from "@/hooks/usePostulacion";
import { useEditarPostulacion } from "@/hooks/usePostulacion";


interface FormularioEditarPostulacionProps {
  postulacion: EditarPostulacion;
  opcionesAsignaturas: { value: string; label: string }[];
  onClose: () => void;
}

const InfoCard = ({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">{title}</h3>
        {children}
    </div>
);

//Formulario que actualiza los datos de una postulación existente, sólo reemplaza los campos de una postulación.
export default function FormularioEditarPostulacion({
  postulacion,
  opcionesAsignaturas,
  onClose,
}: FormularioEditarPostulacionProps) {
  const [formPostulacion, setFormPostulacion] = useState<EditarPostulacion>(postulacion);

  const [incluirCorreo, setIncluirCorreo] = useState(
    !!postulacion.correo_profe && postulacion.correo_profe.trim() !== ""
  );

  const editarPostulacionMutation = useEditarPostulacion();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const datosAEnviar = {
      ...formPostulacion,
      correo_profe: incluirCorreo ? formPostulacion.correo_profe : null
    };

    editarPostulacionMutation.mutate(datosAEnviar, {
      onSuccess: () => {
        alert("✅ Postulación actualizada correctamente");
        onClose();
      },
      onError: (error) => {
        console.error("Error al editar postulación:", error);
        alert("❌ Ocurrió un error al editar la postulación");
      },
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 max-w-3xl mx-auto">
      <InfoCard title="Editar Postulación">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Asignatura
            </label>
            {opcionesAsignaturas.length > 0 ? (
              <Select
                options={opcionesAsignaturas}
                value={
                  opcionesAsignaturas.find(
                    (opt) => opt.value === String(formPostulacion.id_asignatura)
                  ) || null
                }
                onChange={(selectedOption) => {
                  if (!selectedOption) return;
                  setFormPostulacion({
                    ...formPostulacion,
                    id_asignatura: selectedOption.value,
                    nombre_asignatura: selectedOption.label,
                  });
                }}
                placeholder="Seleccione una asignatura"
                isSearchable
                styles={{
                  control: (provided) => ({
                    ...provided,
                    color: "black",
                    borderColor: "#ccc",
                    backgroundColor: "white",
                  }),
                  singleValue: (provided) => ({
                    ...provided,
                    color: "black",
                  }),
                  input: (provided) => ({
                    ...provided,
                    color: "black",
                  }),
                  placeholder: (provided) => ({
                    ...provided,
                    color: "gray",
                  }),
                  option: (provided, state) => ({
                    ...provided,
                    color: "black",
                    backgroundColor: state.isFocused ? "#e5e7eb" : "white",
                    cursor: "pointer",
                  }),
                }}
              />
            ) : (
              <p className="text-gray-500 italic">No hay asignaturas disponibles</p>
            )}
          </div>

          <div>
            <label
              htmlFor="descripcion_carta"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Carta de interés
            </label>
            <textarea
              name="descripcion_carta"
              value={formPostulacion.descripcion_carta}
              onChange={(e) =>
                setFormPostulacion({
                  ...formPostulacion,
                  [e.target.name]: e.target.value,
                })
              }
              className="w-full px-4 py-3 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors h-32 resize-none"
              required
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <input
                type="checkbox"
                id="check_correo"
                checked={incluirCorreo}
                onChange={(e) => {
                  setIncluirCorreo(e.target.checked);
                  if (!e.target.checked)
                  {
                    setFormPostulacion(prev => ({ ...prev, correo_profe: ""}));
                  }
                }}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="check_correo" className="text-sm font-medium text-gray-800 cursor-pointer select-none">
                ¿Incluir correo de recomendación del profesor?
              </label>
            </div>

            {incluirCorreo && (
              <div className="animate-fadeIn mt-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Correo del profesor
                </label>
                <input
                  name="correo_profe"
                  type="email"
                  value={formPostulacion.correo_profe || ""}
                  onChange={(e) => 
                    setFormPostulacion({
                      ...formPostulacion,
                      [e.target.name]: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="correo_profesor@ucn.cl"
                  required={incluirCorreo}
                />
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Plan de Trabajo
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Actividad propuesta
                </label>
                <input
                  name="actividad"
                  value={formPostulacion.actividad}
                  onChange={(e) =>
                    setFormPostulacion({
                      ...formPostulacion,
                      [e.target.name]: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Metodología
                </label>
                <textarea
                  name="metodologia"
                  value={formPostulacion.metodologia}
                  onChange={(e) =>
                    setFormPostulacion({
                      ...formPostulacion,
                      [e.target.name]: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors h-24 resize-y"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Día preferente
              </label>
              <select
                name="dia"
                value={formPostulacion.dia}
                onChange={(e) =>
                  setFormPostulacion({
                    ...formPostulacion,
                    [e.target.name]: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              >
                <option value="">Seleccione un día</option>
                <option value="Lunes">Lunes</option>
                <option value="Martes">Martes</option>
                <option value="Miércoles">Miércoles</option>
                <option value="Jueves">Jueves</option>
                <option value="Viernes">Viernes</option>
                <option value="Sábado">Sábado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bloque horario
              </label>
              <select
                name="bloque"
                value={formPostulacion.bloque}
                onChange={(e) =>
                  setFormPostulacion({
                    ...formPostulacion,
                    [e.target.name]: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              >
                <option value="">Seleccione un bloque</option>
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

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center gap-2"
            >
              ✏️ Guardar Cambios
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-3 px-6 rounded-lg transition duration-200"
            >
              Cancelar
            </button>
          </div>
        </form>
      </InfoCard>
    </div>
  );
}
