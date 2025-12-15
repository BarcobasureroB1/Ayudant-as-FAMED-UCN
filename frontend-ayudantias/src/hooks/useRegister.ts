import { useMutation } from "@tanstack/react-query"
import api from "../api/axios"
import type { AxiosError } from "axios"

interface Registerdata {
  rut: string
  nombres: string
  apellidos: string
  correo: string
  tipo: string
  password: string
}

interface Registerresponse {
  message: string
}

export function useRegister(onSuccess: () => void, onFail: (error: string) => void) {
  return useMutation<Registerresponse, AxiosError, Registerdata>({
    mutationFn: async ({ rut, nombres, apellidos, tipo, correo, password }) => {
      const respuesta = await api.post("/auth/register", { rut, nombres, apellidos, tipo, correo, password})
      return respuesta.data
    },
    onSuccess: () => {
      onSuccess()
    },
    onError: (error) => {
      const mensaje = (error.response?.data as { message?: string })?.message || "no se pudo identificar el error xd"
      onFail(mensaje)
    },
  })
}
