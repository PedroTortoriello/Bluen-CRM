'use client'
import { useState } from 'react'
import { db } from '@/lib/db'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Users } from 'lucide-react'

const StaffRegister = ({ tenantSlug }) => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!tenantSlug) {
      alert('Tenant não encontrado na URL!')
      return
    }

    const { data, error } = await db.createStaff({
      name,
      email,
      password,
      tenantSlug
    })

    if (error) {
      alert(error.message)
    } else {
      alert('Barbeiro cadastrado com sucesso!')
      setName('')
      setEmail('')
      setPassword('')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 px-6">
      <div className="w-full max-w-md bg-background shadow-lg rounded-2xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <Users className="w-10 h-10 text-primary mx-auto" />
          <h1 className="text-2xl font-bold">Cadastro de Barbeiro</h1>
          <p className="text-muted-foreground">
            Crie sua conta para a barbearia <span className="font-semibold text-primary">{tenantSlug}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <Button type="submit" className="w-full h-11 bg-primary text-white font-semibold">
            Criar Conta
          </Button>
        </form>
      </div>
    </div>
  )
}

export default StaffRegister
