'use client'

import { useState } from 'react'

import ChangePasswordForm from './change-password-form'

import { Button } from '@/modules/shared/components/ui/button'
import { CardContent } from '@/modules/shared/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/modules/shared/components/ui/dialog'

type Props = {
  id: number
}

export default function ChangePasswordDialog({ id }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button asChild variant={'outline'}>
        <DialogTrigger>Cambiar Contraseña</DialogTrigger>
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Contraseña</DialogTitle>
          <DialogDescription>Modifica la contraseña</DialogDescription>
        </DialogHeader>
        <CardContent className="space-y-4">
          <ChangePasswordForm id={id} onSuccess={() => setOpen(false)} />
        </CardContent>
      </DialogContent>
    </Dialog>
  )
}
