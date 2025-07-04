'use client'

import { useEffect, useState } from 'react'
import { HiOutlineArrowsUpDown } from 'react-icons/hi2'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@shared/components/ui/card'
import Pagination from '@shared/components/ui/pagination'
import { toast } from 'sonner'
import useSWR from 'swr'

import TableSkeleton from '../../shared/skeletons/table-skeleton'

import { BACKEND_URL } from '@/lib/constants'
import { Payment } from '@/modules/shared/types/payments.interfaces'
import { useSortableData } from '@/modules/shared/hooks/use-sort-data'
import { Button } from '@/modules/shared/components/ui/button'
import { fetcher } from '@/lib/http/fetcher'

type Props = {
  query: string
  method: string
  page: number
  limit: number
}
type GetPayments = {
  data: Payment[]
  total: number
  totalPages: number
}

export default function SalesTbl({ page, limit, method, query }: Props) {
  const GET_URL = `${BACKEND_URL}/pagos/obtener-pagos?page=${page}&query=${query}&page_size=${limit}${
    method !== 'all' ? `&method=${method}` : ''
  }`

  const { data, error, isLoading } = useSWR<GetPayments>(GET_URL, fetcher)

  const { data: payments, sort, updateData } = useSortableData<Payment>()
  const [count, setCount] = useState(limit)

  useEffect(() => {
    if (data) {
      updateData(data.data)
      setCount(data.total)
    }
  }, [data])

  if (error) toast.error(error.message)
  return (
    <Card x-chunk="sales-table">
      <CardHeader>
        <CardTitle>Pagos</CardTitle>
        <CardDescription>Visualiza los pagos realizados</CardDescription>
        <CardDescription>Total de Pagos: {count}</CardDescription>
      </CardHeader>
      <CardContent>
        <table className="table-auto text-center w-full text-sm ">
          <thead className=" border-b relative">
            <tr className="h-16">
              <td>
                <Button variant="ghost" onClick={() => sort('id')}>
                  <HiOutlineArrowsUpDown />
                  Id
                </Button>
              </td>
              <td>Transacción</td>
              <td className="max-md:hidden">Fecha</td>
              <td className="max-lg:hidden">Código Cliente</td>
              <td className="">
                <Button variant="ghost" onClick={() => sort('monto_total')}>
                  <HiOutlineArrowsUpDown />
                  Monto
                </Button>
              </td>
              <td className="max-xl:hidden">Método</td>
              <td></td>
            </tr>
          </thead>
          <tbody className="text-xs relative">
            {isLoading ? (
              <TableSkeleton rows={Math.min(limit, count)} />
            ) : payments && payments.length > 0 ? (
              payments.map((payment, index) => (
                <tr
                  key={index}
                  className="hover:bg-muted/50 duration-300 relative h-14 border-t"
                >
                  <td className="rounded-l-lg">{payment.id}</td>
                  <td>{payment.transaccion}</td>
                  <td className="max-md:hidden">{payment.creado}</td>
                  <td className="max-lg:hidden">{payment.codigo}</td>
                  <td className="">S/ {payment.monto_total}</td>
                  <td className="max-md:hidden">{payment.metodo_pago}</td>
                  <td className="rounded-r-lg space-x-2">
                    {/* <Popover>
                      <PopoverTrigger className="p-2 rounded bg-transparent hover:shadow-lg hover:shadow-secondary/50 hover:bg-background duration-300">
                        <MdOutlineUnfoldMore size={20} />
                      </PopoverTrigger>
                      <PopoverContent
                        align="end"
                        className="flex flex-col items-start text-xs max-w-40 p-2"
                      >
                        <Link
                          href={`/admin/sales/${payment.id}`}
                          className="flex items-center gap-2 hover:bg-secondary p-2 w-full rounded-sm "
                        >
                          <AiOutlineInfoCircle size={18} /> Información
                        </Link>
                      </PopoverContent>
                    </Popover> */}
                  </td>
                </tr>
              ))
            ) : (
              <tr className="relative h-24">
                <td colSpan={9} className="text-center py-4">
                  No hay datos disponibles
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </CardContent>
      <CardFooter>
        <Pagination totalPages={data?.totalPages ?? 0} />
      </CardFooter>
    </Card>
  )
}
