import InventoryTbl from '@admin/inventory/inventory-tbl'
import { SearchByName, ToogleLimit, ToogleStatus } from '@shared/filters'

type SearchParams = {
  query?: string
  page?: string
  limit?: string
  status?: string
}

type Props = {
  searchParams: Promise<SearchParams>
}
export default async function Page({ searchParams }: Props) {
  const { query, page, limit } = await searchParams
  const queryValue = query || ''
  const currentPage = Number(page) || 1
  const limitValue = Number(limit) || 10

  return (
    <>
      <section className="w-full flex items-end justify-between max-sm:flex-col-reverse gap-3">
        <div className="space-y-2 max-sm:w-full">
          <SearchByName className="sm:w-96 " />
          <ToogleLimit />
          <ToogleStatus />
        </div>
      </section>

      <InventoryTbl page={currentPage} limit={limitValue} query={queryValue} />
    </>
  )
}
