/* eslint-disable no-unused-vars */
'use client'
import * as z from 'zod'
import { SubmitHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { AiOutlineLoading } from 'react-icons/ai'
import { IoSearchOutline } from 'react-icons/io5'

import { Input } from '@/modules/shared/components/ui/input'
import { Button } from '@/modules/shared/components/ui/button'
import { BACKEND_URL } from '@/lib/constants'

type Props = {
  handleOpenChange: (open: boolean) => void
  handleFetchReniec: (dni: string, nombre: string, apellidos: string) => void
}

type ReniecDniFormData = {
  dni: string
}

const schema = z.object({
  dni: z.string().length(8, { message: 'El DNI debe tener 8 caracteres' }),
})

export function FetchReniecForm({
  handleOpenChange,
  handleFetchReniec,
}: Props) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReniecDniFormData>({
    resolver: zodResolver(schema),
  })

  const onConfirm = (result: any) => {
    handleFetchReniec(
      result.numeroDocumento,
      result.nombres,
      result.apellidoPaterno + ' ' + result.apellidoMaterno,
    )
  }

  const onSubmit: SubmitHandler<ReniecDniFormData> = async (data) => {
    setLoading(true)
    setResult(null)
    setServerError('')

    try {
      const response = await fetch(
        `${BACKEND_URL}/usuarios/${data.dni}/verificar-dni`,
      )

      if (!response.ok) {
        const errorResponse = await response.json()
        setServerError(errorResponse.message || 'Error desconocido')
        return
      }

      const resultData = await response.json()

      if (
        resultData.nombres &&
        resultData.apellidoPaterno &&
        resultData.apellidoMaterno
      ) {
        setResult(resultData)
        return
      }

      setServerError('DNI inválido')
    } catch (error: any) {
      console.error('Error', error)
      setServerError('Error en la consulta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full flex flex-col gap-10">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex justify-between w-full text-sm items-start gap-5"
      >
        <label className="flex flex-col w-full gap-2">
          <Input id="dni" placeholder="DNI" type="text" {...register('dni')} />
          {errors.dni && (
            <span className="text-red-500 text-xs">{errors.dni.message}</span>
          )}
        </label>

        <Button size={'icon'} disabled={loading}>
          {loading ? (
            <AiOutlineLoading size={18} className="animate-spin ease-in-out" />
          ) : (
            <IoSearchOutline size={18} />
          )}
        </Button>
      </form>

      {serverError && <p className="flex w-full text-red-500">{serverError}</p>}

      {result && !serverError && (
        <div className="flex flex-col gap-3">
          <h3 className="text-xl">Resultado:</h3>
          <p>Nombres: {result.nombres}</p>
          <p>
            Apellidos: {result.apellidoPaterno + ' ' + result.apellidoMaterno}
          </p>
        </div>
      )}
      <Button
        disabled={!result}
        className="text-lg"
        onClick={() => {
          onConfirm(result)
          handleOpenChange(false)
        }}
      >
        Confirmar
      </Button>
    </div>
  )
}
