'use client'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Scissors } from 'lucide-react'

const ServiceForm = ({ onSubmit }) => {
  const [name, setName] = useState('')
  const [duration, setDuration] = useState('')
  const [price, setPrice] = useState('')
  const [popular, setPopular] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit?.({ name, duration, price: Number(price), popular })
  }

  return (
    <div className="min-h-screen w-full bg-muted/20 flex flex-col">
      {/* Header */}
      <header className="w-full border-b bg-background px-10 py-8 shadow-sm">
        <div className="max-w-5xl mx-auto flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Scissors className="w-7 h-7 text-primary" />
            Cadastrar Serviço
          </h1>
          <p className="text-muted-foreground text-lg">
            Defina os detalhes do novo serviço que será oferecido na barbearia.
          </p>
        </div>
      </header>

      {/* Form */}
      <main className="flex-1 flex justify-center px-6 py-12">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-3xl bg-background shadow-md rounded-xl p-10 space-y-10"
        >
          {/* Campo Nome */}
          <div className="space-y-3">
            <Label htmlFor="name" className="text-base font-medium">
              Nome do Serviço
            </Label>
            <Input
              id="name"
              placeholder="Ex: Corte Degradê, Barba, etc."
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="h-12 text-base"
            />
          </div>

          {/* Duração e Preço */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label htmlFor="duration" className="text-base font-medium">
                Duração (minutos)
              </Label>
              <Input
                id="duration"
                type="number"
                placeholder="30"
                value={duration}
                onChange={e => setDuration(e.target.value)}
                required
                className="h-12 text-base"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="price" className="text-base font-medium">
                Preço (R$)
              </Label>
              <Input
                id="price"
                type="number"
                placeholder="50,00"
                value={price}
                onChange={e => setPrice(e.target.value)}
                required
                className="h-12 text-base"
              />
            </div>
          </div>

          {/* Popular */}
          <div className="flex items-center gap-3 border rounded-lg p-4 bg-muted/30">
            <Checkbox
              checked={popular}
              onCheckedChange={setPopular}
              id="popular"
            />
            <Label htmlFor="popular" className="cursor-pointer text-base">
              Marcar como <span className="font-semibold text-primary">Popular</span>
            </Label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button type="button" variant="outline" className="h-12 px-6">
              Cancelar
            </Button>
            <Button type="submit" className="h-12 px-6 bg-primary text-white font-semibold">
              Salvar Serviço
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}

export default ServiceForm
