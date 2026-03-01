'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { UserSchema, type UserFormData } from '@/lib/schemas/user.schema'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useState } from 'react'
import { toast } from '@/hooks/use-toast'

/**
 * FormDataUser - Formulario para actualizar datos del usuario
 * Usa React Hook Form + Zod para validación
 * Se sincroniza con Clerk y la base de datos local
 */
export default function FormDataUser() {
  const { user, isLoaded } = useUser()
  const [isSaving, setIsSaving] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<UserFormData>({
    resolver: zodResolver(UserSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      dni: '',
      address: '',
      department: '',
      deliveryLocation: 'Null'
    }
  })

  // Cargar datos del usuario cuando estén disponibles
  useState(() => {
    if (isLoaded && user) {
      reset({
        name: user.fullName || '',
        email: user.emailAddresses[0]?.emailAddress || '',
        phone: user.phoneNumbers[0]?.phoneNumber || '',
        dni: '',
        address: '',
        department: '',
        deliveryLocation: 'Null'
      })
    }
  })

  const onSubmit = async (data: UserFormData) => {
    if (!user) return

    setIsSaving(true)
    try {
      // Actualizar datos en Clerk (metadata)
      await user.update({
        firstName: data.name?.split(' ')[0] || '',
        lastName: data.name?.split(' ').slice(1).join(' ') || ''
      })

      // Actualizar datos en la base de datos local
      const response = await fetch('/api/updateuser', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clerkId: user.id,
          ...data
        })
      })

      if (!response.ok) {
        throw new Error('Error al actualizar usuario')
      }

      toast({
        title: 'Perfil actualizado',
        description: 'Tus datos han sido actualizados exitosamente'
      })
    } catch (error) {
      console.error('Error actualizando usuario:', error)
      toast({
        title: 'Error',
        description: 'No se pudo actualizar tu perfil',
        variant: 'destructive'
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (!isLoaded || !user) {
    return <div>Cargando...</div>
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 max-w-2xl'>
      <div className='space-y-2'>
        <Label htmlFor='name'>Nombre completo</Label>
        <Input
          id='name'
          placeholder='Tu nombre'
          {...register('name')}
          disabled={isSaving}
        />
        {errors.name && (
          <span className='text-sm text-red-500'>{errors.name.message}</span>
        )}
      </div>

      <div className='space-y-2'>
        <Label htmlFor='email'>Email</Label>
        <Input
          id='email'
          type='email'
          placeholder='tu@email.com'
          {...register('email')}
          disabled={isSaving}
        />
        {errors.email && (
          <span className='text-sm text-red-500'>{errors.email.message}</span>
        )}
      </div>

      <div className='space-y-2'>
        <Label htmlFor='phone'>Teléfono</Label>
        <Input
          id='phone'
          placeholder='999 999 999'
          {...register('phone')}
          disabled={isSaving}
        />
        {errors.phone && (
          <span className='text-sm text-red-500'>{errors.phone.message}</span>
        )}
      </div>

      <div className='space-y-2'>
        <Label htmlFor='dni'>DNI</Label>
        <Input
          id='dni'
          placeholder='12345678'
          maxLength={8}
          {...register('dni')}
          disabled={isSaving}
        />
        {errors.dni && (
          <span className='text-sm text-red-500'>{errors.dni.message}</span>
        )}
      </div>

      <div className='space-y-2'>
        <Label htmlFor='address'>Dirección</Label>
        <Input
          id='address'
          placeholder='Av. Principal 123'
          {...register('address')}
          disabled={isSaving}
        />
        {errors.address && (
          <span className='text-sm text-red-500'>{errors.address.message}</span>
        )}
      </div>

      <div className='space-y-2'>
        <Label htmlFor='department'>Departamento</Label>
        <Input
          id='department'
          placeholder='Lima'
          {...register('department')}
          disabled={isSaving}
        />
        {errors.department && (
          <span className='text-sm text-red-500'>
            {errors.department.message}
          </span>
        )}
      </div>

      <div className='space-y-2'>
        <Label htmlFor='deliveryLocation'>Ubicación de entrega</Label>
        <Select
          onValueChange={(value: 'Lima' | 'Provincia' | 'Null') =>
            register('deliveryLocation').onChange({
              target: { value }
            })
          }
          defaultValue={register('deliveryLocation').ref?.name || 'Null'}
        >
          <SelectTrigger>
            <SelectValue placeholder='Selecciona una opción' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='Lima'>Lima Metropolitana</SelectItem>
            <SelectItem value='Provincia'>Provincia</SelectItem>
            <SelectItem value='Null'>No especificado</SelectItem>
          </SelectContent>
        </Select>
        {errors.deliveryLocation && (
          <span className='text-sm text-red-500'>
            {errors.deliveryLocation.message}
          </span>
        )}
      </div>

      <Button type='submit' disabled={isSaving}>
        {isSaving ? 'Guardando...' : 'Guardar cambios'}
      </Button>
    </form>
  )
}
