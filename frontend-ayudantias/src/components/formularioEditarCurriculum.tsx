"use client";

import React, { useState } from "react";
import { useEditarCurriculum } from "@/hooks/useCurriculum";
import { CurriculumDataEditar } from "@/hooks/useCurriculum";

interface Props {
  datosIniciales: CurriculumDataEditar;
  onCancel: () => void;
}

export default function FormularioEditarCurriculum({
  datosIniciales,
  onCancel,
}: Props) {
  const [formData, setFormData] = useState<CurriculumDataEditar>(datosIniciales);
  const { mutate: editarCurriculum, isPending, isSuccess } = useEditarCurriculum();

  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


  const handleListChange = (
    section:
      | "ayudantias"
      | "cursos_titulos_grados"
      | "actividades_cientificas"
      | "actividades_extracurriculares",
    index: number,
    field: string,
    value: string
  ) => {
    const updatedList = [...(formData[section] || [])];
    updatedList[index] = { ...updatedList[index], [field]: value };
    setFormData((prev) => ({ ...prev, [section]: updatedList }));
  };
  
  const addItem = (
    section:
      | "ayudantias"
      | "cursos_titulos_grados"
      | "actividades_cientificas"
      | "actividades_extracurriculares"
  ) => {
    const emptyItem: any = {};
    setFormData((prev) => ({
      ...prev,
      [section]: [...(prev[section] || []), emptyItem],
    }));
  };

  const removeItem = (
    section:
      | "ayudantias"
      | "cursos_titulos_grados"
      | "actividades_cientificas"
      | "actividades_extracurriculares",
    index: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]: prev[section]?.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    editarCurriculum(formData);
  };

    const handleArrayChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
    key:
      | "ayudantias"
      | "cursos_titulos_grados"
      | "actividades_cientificas"
      | "actividades_extracurriculares"
    ) => {
        const { name, value } = e.target;
        const field = name.split(".").pop(); 

        setFormData((prev) => {
            const list = (prev[key] as any[]) || [];
            const updated = list.map((item: any, i: number) =>
                i === index ? { ...item, [field!]: value } : item
            );
            return {
                ...prev,
                [key]: updated,
            };
        });
    };


  return (
    
    <div className="bg-white shadow-md rounded-xl p-6 mt-4">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">
        ✏️ Editar Curriculum
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        <section>
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            Información Personal
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="nombres"
              value={formData.nombres || ""}
              onChange={handleChange}
              placeholder="Nombres"
              required
              className="border rounded-md p-2 text-black"
            />
            <input
              name="apellidos"
              value={formData.apellidos || ""}
              onChange={handleChange}
              placeholder="Apellidos"
              required
              className="border rounded-md p-2 text-black"
            />
            <input
              name="correo"
              value={formData.correo || ""}
              onChange={handleChange}
              placeholder="Correo"
              required
              className="border rounded-md p-2 text-black"
            />
            <input
              name="comuna"
              value={formData.comuna || ""}
              onChange={handleChange}
              placeholder="Comuna"
              required
              className="border rounded-md p-2 text-black"
            />
            <input
              name="ciudad"
              value={formData.ciudad || ""}
              onChange={handleChange}
              placeholder="Ciudad"
              required
              className="border rounded-md p-2 text-black"
            />
            <input
              id="fecha_nacimiento"
              name="fecha_nacimiento"
              type="date"
              value={formData.fecha_nacimiento || ""}
              onChange={handleChange}
              required
              className="border rounded-md p-2 text-black"
            />
            <input
              id="num_celular"
              name="num_celular"
              type="number"
              value={formData.Num_Celular || ""}
              onChange={handleChange}
              placeholder="Número de celular"
              required
              className="border rounded-md p-2 text-black"
            />
            <input
              id="carrera"
              name="carrera"
              value={formData.carrera || ""}
              onChange={handleChange}
              required
              className="border rounded-md p-2 text-black"
              placeholder="Medicina, Kinesiologia, etc..."
            />
          </div>
        </section>

        <section>
            <h3 className="text-lg font-medium text-gray-700 mb-2">Ayudantías</h3>
            {formData.ayudantias?.map((a, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                <input
                    name={`ayudantias[${i}].nombre_asig`}
                    value={a.nombre_asig || ""}
                    onChange={(e) => handleArrayChange(e, i, "ayudantias")}
                    placeholder="Nombre asignatura"
                    className="border rounded-md p-2 text-black"
                />
                <input
                    name={`ayudantias[${i}].nombre_coordinador`}
                    value={a.nombre_coordinador || ""}
                    onChange={(e) => handleArrayChange(e, i, "ayudantias")}
                    placeholder="Nombre coordinador"
                    className="border rounded-md p-2 text-black"
                />
                <input
                    name={`ayudantias[${i}].evaluacion_obtenida`}
                    value={a.evaluacion_obtenida || ""}
                    onChange={(e) => handleArrayChange(e, i, "ayudantias")}
                    placeholder="Evaluación obtenida"
                    className="border rounded-md p-2 text-black"
                />
                </div>
            ))}

            <button
                type="button"
                onClick={() =>
                setFormData({
                    ...formData,
                    ayudantias: [
                    ...(formData.ayudantias || []),
                    { nombre_asig: "", nombre_coordinador: "", evaluacion_obtenida: "" },
                    ],
                })
                }
                className="text-blue-600 hover:text-blue-800 mt-2"
            >
                + Agregar ayudantía
            </button>
        </section>


        
        <section>
            <h3 className="text-lg font-medium text-gray-700 mb-2">
                Cursos, Títulos o Grados
            </h3>
            {formData.cursos_titulos_grados?.map((c, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                <input
                    name={`cursos_titulos_grados[${i}].nombre`}
                    value={c.nombre_asig || ""}
                    onChange={(e) => handleArrayChange(e, i, "cursos_titulos_grados")}
                    placeholder="Nombre curso / título / grado"
                    className="border rounded-md p-2 text-black"
                />
                <input
                    name={`cursos_titulos_grados[${i}].institucion`}
                    value={c.n_coordinador || ""}
                    onChange={(e) => handleArrayChange(e, i, "cursos_titulos_grados")}
                    placeholder="Institución"
                    className="border rounded-md p-2 text-black"
                />
                <input
                    name={`cursos_titulos_grados[${i}].anio`}
                    value={c.evaluacion || ""}
                    onChange={(e) => handleArrayChange(e, i, "cursos_titulos_grados")}
                    placeholder="Año"
                    className="border rounded-md p-2 text-black"
                />
                </div>
            ))}

            <button
                type="button"
                onClick={() =>
                setFormData({
                    ...formData,
                    cursos_titulos_grados: [
                    ...(formData.cursos_titulos_grados || []),
                    { nombre_asig: "", n_coordinador: "", evaluacion: "" },
                    ],
                })
                }
                className="text-blue-600 hover:text-blue-800 mt-2"
            >
                + Agregar curso / título / grado
            </button>
        </section>


        
        <section>
            <h3 className="text-lg font-medium text-gray-700 mb-2">
                Actividades Científicas
            </h3>
            {formData.actividades_cientificas?.map((a, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                <input
                    name={`actividades_cientificas[${i}].nombre_actividad`}
                    value={a.nombre || ""}
                    onChange={(e) => handleArrayChange(e, i, "actividades_cientificas")}
                    placeholder="Nombre de la actividad"
                    className="border rounded-md p-2 text-black"
                />
                <input
                    name={`actividades_cientificas[${i}].rol`}
                    value={a.descripcion || ""}
                    onChange={(e) => handleArrayChange(e, i, "actividades_cientificas")}
                    placeholder="Descripcion de la actividad"
                    className="border rounded-md p-2 text-black"
                />
                <input
                    name={`actividades_cientificas[${i}].descripcion`}
                    value={a.periodo_participacion || ""}
                    onChange={(e) => handleArrayChange(e, i, "actividades_cientificas")}
                    placeholder="Periodo de participación"
                    className="border rounded-md p-2 text-black"
                />
                </div>
            ))}

            <button
                type="button"
                onClick={() =>
                setFormData({
                    ...formData,
                    actividades_cientificas: [
                    ...(formData.actividades_cientificas || []),
                    { nombre: "", descripcion: "", periodo_participacion: "" },
                    ],
                })
                }
                className="text-blue-600 hover:text-blue-800 mt-2"
            >
                + Agregar actividad científica
            </button>
        </section>


        
        <section>
            <h3 className="text-lg font-medium text-gray-700 mb-2">
                Actividades Extracurriculares
            </h3>
            {formData.actividades_extracurriculares?.map((a, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                <input
                    name={`actividades_extracurriculares[${i}].nombre_actividad`}
                    value={a.nombre || ""}
                    onChange={(e) =>
                    handleArrayChange(e, i, "actividades_extracurriculares")
                    }
                    placeholder="Nombre de la actividad"
                    className="border rounded-md p-2 text-black"
                />
                <input
                    name={`actividades_extracurriculares[${i}].rol`}
                    value={a.docente || ""}
                    onChange={(e) =>
                    handleArrayChange(e, i, "actividades_extracurriculares")
                    }
                    placeholder="Docente / Institución"
                    className="border rounded-md p-2 text-black"
                />
                <input
                    name={`actividades_extracurriculares[${i}].descripcion`}
                    value={a.descripcion || ""}
                    onChange={(e) =>
                    handleArrayChange(e, i, "actividades_extracurriculares")
                    }
                    placeholder="Descripción"
                    className="border rounded-md p-2 text-black"
                />
                <input
                    name={`actividades_extracurriculares[${i}].perido_participacion`}
                    value={a.periodo_participacion || ""}
                    onChange={(e) =>
                    handleArrayChange(e, i, "actividades_extracurriculares")
                    }
                    placeholder="Periodo de participación"
                    className="border rounded-md p-2 text-black"
                />
                </div>
            ))}

            <button
                type="button"
                onClick={() =>
                setFormData({
                    ...formData,
                    actividades_extracurriculares: [
                    ...(formData.actividades_extracurriculares || []),
                    { nombre: "", docente: "", descripcion: "", periodo_participacion: "" },
                    ],
                })
                }
                className="text-blue-600 hover:text-blue-800 mt-2"
            >
                + Agregar actividad extracurricular
            </button>
        </section>


        
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {isPending ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>

        {isSuccess && (
          <p className="text-green-600 text-sm mt-3">
            Curriculum actualizado correctamente ✅
          </p>
        )}
      </form>
    </div>
  );
}
