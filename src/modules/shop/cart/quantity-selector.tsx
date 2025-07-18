'use client'

import { ChangeEvent, useState } from 'react'
import { MdRemove, MdAdd } from 'react-icons/md'
import { Input } from '@shared/components/ui/input'
import { Button } from '@shared/components//ui/button'

import { useCartStore } from '@/store/cart-store'
import { CartProduct } from '@/modules/shared/types/product.interfaces'

type Props = {
  product: CartProduct
}

export default function QuantitySelector({ product }: Props) {
  const updateProductQuantity = useCartStore(
    (state) => state.updateProductQuantity,
  )
  const [count, setCount] = useState(product.cantidad)

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10)

    if (!isNaN(value) && value >= 1 && value <= product.limite_de_orden) {
      setCount(value)
      updateProductQuantity(product, value)
    }
  }

  const toggleCount = (value: number) => {
    const updatedCount = count + value
    if (updatedCount >= 1 && updatedCount <= product.limite_de_orden) {
      setCount(updatedCount)
      updateProductQuantity(product, updatedCount)
    }
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        onClick={() => toggleCount(-1)}
        size={'icon'}
        variant={'ghost'}
        className="h-8 w-8"
        disabled={count === 1}
      >
        <MdRemove size={18} />
      </Button>
      <Input
        type="number"
        className="w-20 text-center h-8"
        value={count}
        onChange={handleInputChange}
        min={1}
        max={product.limite_de_orden}
      />
      <Button
        onClick={() => toggleCount(1)}
        size={'icon'}
        variant={'ghost'}
        className="h-8 w-8"
        disabled={count >= product.limite_de_orden}
      >
        <MdAdd size={18} />
      </Button>
    </div>
  )
}
