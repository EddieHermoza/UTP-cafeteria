'use client'
import Link from 'next/link'
import { MdOutlineChevronLeft } from 'react-icons/md'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useForm, Controller, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import _ from 'lodash'
import { use, useEffect, useState } from 'react'
import { AiOutlineLoading } from 'react-icons/ai'
import { Textarea } from '@shared/components/ui/textarea'
import { Input } from '@shared/components/ui/input'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@shared/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/components/ui/select'
import { Button } from '@shared/components/ui/button'
import { z } from 'zod'

import { Product } from '@/modules/shared/types'
import { productSchema } from '@/modules/admin/schemas/products.schema'
import { PRODUCT_CATEGORIES } from '@/lib/categories'
import { useGetData } from '@/modules/shared/hooks/use-get-data'
import { BACKEND_URL } from '@/lib/constants'
import { useSendRequest } from '@/modules/shared/hooks/use-send-request'
import ImageUploader from '@/modules/shared/components/image-uploader'
import { Switch } from '@/modules/shared/components/ui/switch'

type Props = {
  params: Promise<{ id: string }>
}

type EditProductSchemaType = z.infer<typeof productSchema>
export default function Page({ params }: Props) {
  const { id } = use(params)
  const { push } = useRouter()

  //servicios
  const PATCH_URL = `${BACKEND_URL}/productos/${id}/actualizar-producto`
  const GET_URL = `${BACKEND_URL}/productos/${id}/obtener-producto`

  const { sendRequest, loading } = useSendRequest(PATCH_URL, 'PATCH', '', true)
  const {
    data: product,
    error: getError,
    loading: getLoading,
  } = useGetData<Product>(GET_URL)

  const {
    register,
    control,
    watch,
    setValue,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditProductSchemaType>({
    resolver: zodResolver(productSchema),
  })

  const [currentImage, setCurrentImage] = useState<string>('PENDIENTE')

  if (getError) toast.error(getError)

  useEffect(() => {
    if (product) {
      reset(extractEditableFields(product))
      setCurrentImage(product.url)
    }
  }, [product, reset])

  const onSubmit: SubmitHandler<EditProductSchemaType> = async (data) => {
    if (!product) {
      toast.error('Error al obtener el producto')
      return
    }
    if (_.isEqual(extractEditableFields(product), data)) {
      toast.warning('No se está actualizando nada en los datos del producto')
      return
    }

    const form = new FormData()
    form.append('nombre', data.nombre)
    form.append('descripcion', data.descripcion)
    form.append('habilitado', data.habilitado.toString())
    form.append('precio', data.precio.toString())
    form.append('categoria', data.categoria)
    form.append('limite_de_orden', data.limite_de_orden.toString())
    if (data.file) {
      form.append('file', data.file)
    }

    const { error } = await sendRequest(form)

    if (error) {
      toast.error(error)
      return
    }

    toast.success('Producto Actualizado Correctamente')

    push('/admin/products')
  }
  const habilitado = watch('habilitado')
  return (
    <>
      <section className="max-w-screen-xl w-full mx-auto flex items-center justify-start  gap-5">
        <Button asChild variant={'outline'} size={'icon'}>
          <Link href={'/admin/products'}>
            <MdOutlineChevronLeft size={25} />
          </Link>
        </Button>

        <h1 className="text-3xl">Editar Producto {id}</h1>
      </section>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex max-w-screen-xl max-lg:flex-col w-full mx-auto gap-5"
      >
        <div className="flex flex-col gap-5 w-full lg:w-[60%]">
          <Card className="flex-row items-center justify-between p-4">
            <div className="space-y-0.5">
              <label className="text-lg">Estado</label>
              <p className="text-sm text-gray-500">
                Verifica si el producto estará habilitado
              </p>
            </div>
            <CardContent>
              <Switch
                checked={habilitado}
                onCheckedChange={(value) => setValue('habilitado', value)}
              />
            </CardContent>
          </Card>

          <Card className="max-w-screen-md">
            <CardHeader>
              <CardTitle className="text-xl font-normal">Detalles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <label className="flex flex-col gap-2">
                <span>Nombre</span>
                <Input id="name" {...register('nombre')} />
                {errors.nombre && (
                  <p className="text-red-600 text-xs">
                    {errors.nombre.message}
                  </p>
                )}
              </label>

              <label className="flex flex-col gap-2">
                <span>Descripción</span>
                <Textarea id="description" {...register('descripcion')} />
                {errors.descripcion && (
                  <p className="text-red-600 text-xs ">
                    {errors.descripcion.message}
                  </p>
                )}
              </label>
            </CardContent>
          </Card>
          <div className="flex max-md:flex-col w-full gap-5">
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-xl font-normal">Precio</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <label className="flex flex-col gap-2">
                  <Input
                    type="number"
                    defaultValue={0}
                    min={0}
                    step={0.01}
                    id="precio"
                    {...register('precio', { valueAsNumber: true })}
                  />
                </label>
                {errors.precio && (
                  <p className="text-red-600 text-xs">
                    {errors.precio.message}
                  </p>
                )}
              </CardContent>
            </Card>
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-xl font-normal">Categoria</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Controller
                  name="categoria"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ''}
                    >
                      <SelectTrigger className="hover:bg-secondary">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent position="popper" hideWhenDetached>
                        {PRODUCT_CATEGORIES.map((category, index) => (
                          <SelectItem key={index} value={`${category.value}`}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.categoria && (
                  <p className="text-red-600 text-xs">
                    {errors.categoria.message}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
          <div className="flex gap-5 max-md:flex-col w-full"></div>
        </div>
        <div className="w-full lg:w-[40%] relative flex flex-col gap-5">
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-xl font-normal">
                Compra Limite
              </CardTitle>
              <CardDescription>
                Cantidad máxima que el cliente podra adquirir por compra.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <label className="flex flex-col gap-2">
                <Input
                  type="number"
                  defaultValue={0}
                  min={0}
                  id="limite_de_orden"
                  {...register('limite_de_orden', { valueAsNumber: true })}
                />
              </label>
              {errors.limite_de_orden && (
                <p className="text-red-600 text-xs">
                  {errors.limite_de_orden.message}
                </p>
              )}
            </CardContent>
          </Card>
          <Card className="w-full h-auto relative">
            <CardHeader>
              <CardTitle className="text-xl font-normal">Imagen</CardTitle>
              <CardDescription>
                Arrastra las imágenes en el contenedor o haz clic para
                seleccionar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Controller
                name="file"
                control={control}
                render={({ field }) => (
                  <ImageUploader
                    value={field.value}
                    onChange={field.onChange}
                    defaultImage={currentImage ?? 'PENDIENTE'}
                  />
                )}
              />
            </CardContent>
            {errors.file && (
              <p className="text-red-600 text-xs">
                {errors.file.message?.toString()}
              </p>
            )}
          </Card>
          <Button disabled={getLoading || loading}>
            {getLoading || loading ? (
              <AiOutlineLoading
                size={18}
                className="animate-spin ease-in-out"
              />
            ) : (
              <>Guardar Producto</>
            )}
          </Button>
        </div>
      </form>
    </>
  )
}

function extractEditableFields(product: Product): EditProductSchemaType {
  const {
    nombre,
    descripcion,
    precio,
    categoria,
    habilitado,
    limite_de_orden,
  } = product
  return {
    nombre,
    descripcion,
    precio: Number(precio),
    categoria,
    habilitado,
    limite_de_orden,
  }
}
