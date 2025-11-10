"use client";

import React, { useState, useEffect } from "react";
import { useEditarCurriculum } from "@/hooks/useCurriculum";
import { CurriculumResponse } from "@/hooks/useCurriculum";

export interface CurriculumDataEditar {
  id: number;
  rut_alumno?: string;
  nombres?: string;
  apellidos?: string;
  fecha_nacimiento?: string;
  comuna?: string;
  ciudad?: string;
  num_celular?: string;
  correo?: string;
  carrera?: string;
  otros?: string;

  ayudantias?: Ayudantia[];
  cursos_titulos_grados?: CursoTituloGrado[];
  actividades_cientificas?: ActividadCientifica[];
  actividades_extracurriculares?: ActividadExtracurricular[];
}



interface Ayudantia {
  nombre_asig: string;
  nombre_coordinador: string;
  evaluacion_obtenida: string;
}

interface CursoTituloGrado {
  nombre_asig: string;
  n_coordinador: string;
  evaluacion: string;
}

interface ActividadCientifica {
  nombre: string;
  descripcion: string;
  periodo_participacion: string;
}

interface ActividadExtracurricular {
  nombre: string;
  docente: string;
  descripcion: string;
  periodo_participacion: string;
}

interface Props {
  datosIniciales: CurriculumDataEditar;
  onCancel: () => void;
}

export default function FormularioEditarCurriculum({
  datosIniciales,
  onCancel,
}: Props) {

    const [formData, setFormData] = useState<CurriculumDataEditar>({
    id: 0,
    nombres: "",
    apellidos: "",
    correo: "",
    comuna: "",
    ciudad: "",
    fecha_nacimiento: "",
    num_celular: "",
    carrera: "",
    ayudantias: [],
    cursos_titulos_grados: [],
    actividades_cientificas: [],
    actividades_extracurriculares: [],
    });

    useEffect(() => {
        if (datosIniciales) {
            const d = datosIniciales as CurriculumResponse;

            setFormData({
            id: d.id || 0,
            nombres: d.nombres || "",
            apellidos: d.apellidos || "",
            correo: d.correo || "",
            comuna: d.comuna || "",
            ciudad: d.ciudad || "",
            fecha_nacimiento: d.fecha_nacimiento || "",
            num_celular: d.Num_Celular || "",
            carrera: d.carrera || "",
            ayudantias: d.usuario?.ayudantias?.map(a => ({
                nombre_asig: a.nombre_asig,
                nombre_coordinador: a.nombre_coordinador,
                evaluacion_obtenida: a.evaluacion, 
            })) || [],
            cursos_titulos_grados: d.usuario?.titulos?.map(t => ({
                nombre_asig: t.nombre_asig,
                n_coordinador: t.n_coordinador,
                evaluacion: t.evaluacion,
            })) || [],
            actividades_cientificas: d.usuario?.actividades_cientificas?.map(c => ({
                nombre: c.nombre,
                descripcion: c.descripcion,
                periodo_participacion: c.periodo_participacion,
            })) || [],
            actividades_extracurriculares: d.usuario?.actividades_extracurriculares?.map(e => ({
                nombre: e.nombre,
                docente: e.docente,
                descripcion: e.descripcion,
                periodo_participacion: e.periodo_participacion,
            })) || [],
            });
        }
        }, [datosIniciales]);



  const { mutate: editarCurriculum, isPending } = useEditarCurriculum();

  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  
    const handleAddArrayItem = (key: keyof CurriculumDataEditar, newItem: any) => {
    setFormData((prev) => ({
        ...prev,
        [key]: Array.isArray(prev[key]) ? [...(prev[key] as any[]), newItem] : [newItem],
    }));
    };

    
    const handleArrayChange = (
    key: keyof CurriculumDataEditar,
    index: number,
    field: string,
    value: string
    ) => {
    setFormData((prev) => {
        const current = prev[key];
        if (Array.isArray(current)) {
        const updated = current.map((item, i) =>
            i === index ? { ...item, [field]: value } : item
        );
        return { ...prev, [key]: updated };
        }
        return prev;
    });
    };

    
    const handleRemoveArrayItem = (key: keyof CurriculumDataEditar, index: number) => {
    setFormData((prev) => {
        const current = prev[key];
        if (Array.isArray(current)) {
        const updated = current.filter((_, i) => i !== index);
        return { ...prev, [key]: updated };
        }
        return prev;
    });
    };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id) return alert("Error: falta el ID del curriculum.");

    editarCurriculum(formData);
    onCancel(); 
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 space-y-6 bg-white rounded-2xl text-black"
    >
      
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
            className="border rounded-md p-2 text-black"
          />
          <input
            name="apellidos"
            value={formData.apellidos || ""}
            onChange={handleChange}
            placeholder="Apellidos"
            className="border rounded-md p-2 text-black"
          />
          <input
            name="correo"
            value={formData.correo || ""}
            onChange={handleChange}
            placeholder="Correo"
            className="border rounded-md p-2 text-black"
          />
          <input
            name="comuna"
            value={formData.comuna || ""}
            onChange={handleChange}
            placeholder="Comuna"
            className="border rounded-md p-2 text-black"
          />
          <input
            name="ciudad"
            value={formData.ciudad || ""}
            onChange={handleChange}
            placeholder="Ciudad"
            className="border rounded-md p-2 text-black"
          />
          <input
            name="fecha_nacimiento"
            type="date"
            value={formData.fecha_nacimiento || ""}
            onChange={handleChange}
            className="border rounded-md p-2 text-black"
          />
          <input
            name="num_celular"
            type="number"
            value={formData.num_celular || ""}
            onChange={handleChange}
            placeholder="Número de celular"
            className="border rounded-md p-2 text-black"
          />
          <input
            name="carrera"
            value={formData.carrera || ""}
            onChange={handleChange}
            placeholder="Medicina, Kinesiología, etc..."
            className="border rounded-md p-2 text-black"
          />
        </div>
      </section>

      
      <section>
        <h3 className="text-lg font-medium text-gray-700 mb-2">Ayudantías</h3>
        {formData.ayudantias?.map((a, index) => (
        <div key={index} className="grid grid-cols-3 gap-2 mb-2">
            <input
            placeholder="Nombre Asignatura"
            value={a.nombre_asig || ""}
            onChange={(e) =>
                handleArrayChange("ayudantias", index, "nombre_asig", e.target.value)
            }
            className="border rounded-md p-2 text-black"
            />
            <input
            placeholder="Nombre Coordinador"
            value={a.nombre_coordinador || ""}
            onChange={(e) =>
                handleArrayChange("ayudantias", index, "nombre_coordinador", e.target.value)
            }
            className="border rounded-md p-2 text-black"
            />
            <input
            placeholder="Evaluación Obtenida"
            value={a.evaluacion_obtenida || ""}
            onChange={(e) =>
                handleArrayChange("ayudantias", index, "evaluacion_obtenida", e.target.value)
            }
            className="border rounded-md p-2 text-black"
            />
            <button
            type="button"
            onClick={() => handleRemoveArrayItem("ayudantias", index)}
            className="text-red-500 hover:text-red-700 font-bold ml-2"
            >
            Eliminar
            </button>
        </div>
        ))}

        <button
            type="button"
            onClick={() =>
            handleAddArrayItem("ayudantias", {
                nombre_asig: "",
                nombre_coordinador: "",
                evaluacion_obtenida: "",
            })
            }
            className="text-blue-600 hover:text-blue-800 font-medium mt-2"
        >
            + Agregar Ayudantía
        </button>
      </section>

      
      <section className="mt-6">
        <h3 className="text-lg font-medium text-gray-700 mb-2">Cursos, Títulos o Grados</h3>
        {formData.cursos_titulos_grados?.map((c, index) => (
            <div key={index} className="grid grid-cols-3 gap-2 mb-2">
            <input
                placeholder="Nombre Asignatura o Curso"
                value={c.nombre_asig || ""}
                onChange={(e) =>
                handleArrayChange("cursos_titulos_grados", index, "nombre_asig", e.target.value)
                }
                className="border rounded-md p-2 text-black"
            />
            <input
                placeholder="Nombre Coordinador o Docente"
                value={c.n_coordinador || ""}
                onChange={(e) =>
                handleArrayChange("cursos_titulos_grados", index, "n_coordinador", e.target.value)
                }
                className="border rounded-md p-2 text-black"
            />
            <input
                placeholder="Evaluación"
                value={c.evaluacion || ""}
                onChange={(e) =>
                handleArrayChange("cursos_titulos_grados", index, "evaluacion", e.target.value)
                }
                className="border rounded-md p-2 text-black"
            />
            <button
                type="button"
                onClick={() => handleRemoveArrayItem("cursos_titulos_grados", index)}
                className="text-red-500 hover:text-red-700 font-bold ml-2"
            >
                Eliminar
            </button>
            </div>
        ))}
        <button
            type="button"
            onClick={() =>
            handleAddArrayItem("cursos_titulos_grados", {
                nombre_asig: "",
                n_coordinador: "",
                evaluacion: "",
            })
            }
            className="text-blue-600 hover:text-blue-800 font-medium mt-2"
        >
            + Agregar Curso / Título / Grado
        </button>
      </section>


      
      <section className="mt-6">
        <h3 className="text-lg font-medium text-gray-700 mb-2">Actividades Científicas</h3>
        {formData.actividades_cientificas?.map((a, index) => (
            <div key={index} className="grid grid-cols-3 gap-2 mb-2">
            <input
                placeholder="Nombre Actividad"
                value={a.nombre || ""}
                onChange={(e) =>
                handleArrayChange("actividades_cientificas", index, "nombre", e.target.value)
                }
                className="border rounded-md p-2 text-black"
            />
            <input
                placeholder="Descripción"
                value={a.descripcion || ""}
                onChange={(e) =>
                handleArrayChange("actividades_cientificas", index, "descripcion", e.target.value)
                }
                className="border rounded-md p-2 text-black"
            />
            <input
                placeholder="Periodo de Participación"
                value={a.periodo_participacion || ""}
                onChange={(e) =>
                handleArrayChange(
                    "actividades_cientificas",
                    index,
                    "periodo_participacion",
                    e.target.value
                )
                }
                className="border rounded-md p-2 text-black"
            />
            <button
                type="button"
                onClick={() => handleRemoveArrayItem("actividades_cientificas", index)}
                className="text-red-500 hover:text-red-700 font-bold ml-2"
            >
                Eliminar
            </button>
            </div>
        ))}
        <button
            type="button"
            onClick={() =>
            handleAddArrayItem("actividades_cientificas", {
                nombre: "",
                descripcion: "",
                periodo_participacion: "",
            })
            }
            className="text-blue-600 hover:text-blue-800 font-medium mt-2"
        >
            + Agregar Actividad Científica
        </button>
      </section>


      
      <section className="mt-6">
        <h3 className="text-lg font-medium text-gray-700 mb-2">Actividades Extracurriculares</h3>
        {formData.actividades_extracurriculares?.map((a, index) => (
            <div key={index} className="grid grid-cols-4 gap-2 mb-2">
            <input
                placeholder="Nombre Actividad"
                value={a.nombre || ""}
                onChange={(e) =>
                handleArrayChange("actividades_extracurriculares", index, "nombre", e.target.value)
                }
                className="border rounded-md p-2 text-black"
            />
            <input
                placeholder="Docente"
                value={a.docente || ""}
                onChange={(e) =>
                handleArrayChange("actividades_extracurriculares", index, "docente", e.target.value)
                }
                className="border rounded-md p-2 text-black"
            />
            <input
                placeholder="Descripción"
                value={a.descripcion || ""}
                onChange={(e) =>
                handleArrayChange("actividades_extracurriculares", index, "descripcion", e.target.value)
                }
                className="border rounded-md p-2 text-black"
            />
            <input
                placeholder="Periodo de Participación"
                value={a.periodo_participacion || ""}
                onChange={(e) =>
                handleArrayChange(
                    "actividades_extracurriculares",
                    index,
                    "periodo_participacion",
                    e.target.value
                )
                }
                className="border rounded-md p-2 text-black"
            />
            <button
                type="button"
                onClick={() => handleRemoveArrayItem("actividades_extracurriculares", index)}
                className="text-red-500 hover:text-red-700 font-bold ml-2"
            >
                Eliminar
            </button>
            </div>
        ))}
        <button
            type="button"
            onClick={() =>
            handleAddArrayItem("actividades_extracurriculares", {
                nombre: "",
                docente: "",
                descripcion: "",
                periodo_participacion: "",
            })
            }
            className="text-blue-600 hover:text-blue-800 font-medium mt-2"
        >
            + Agregar Actividad Extracurricular
        </button>
      </section>


      
      <div className="flex justify-end space-x-4 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}