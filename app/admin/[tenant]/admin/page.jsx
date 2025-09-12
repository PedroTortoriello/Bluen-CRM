'use client'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Calendar, Users, Scissors, Settings, TrendingUp, DollarSign } from 'lucide-react'

const BarberPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard')

  // Mock data (futuro: puxar da API/Supabase)
  const barber = { id: 1, name: 'João Silva' }
  const appointments = [
    { id: 1, customerName: 'Carlos Mendes', serviceName: 'Corte Clássico', startTime: '2024-01-15T10:00:00', status: 'confirmed' },
    { id: 2, customerName: 'Lucas Oliveira', serviceName: 'Barba Completa', startTime: '2024-01-15T14:30:00', status: 'pending' }
  ]
  const clients = [
    { id: 1, name: 'Carlos Mendes', visits: 12 },
    { id: 2, name: 'Lucas Oliveira', visits: 8 }
  ]
  const [schedule, setSchedule] = useState(['Seg', 'Qua', 'Sex'])

  const WEEK_DAYS = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom']

  const formatPrice = (cents) => `R$ ${(cents / 100).toFixed(2)}`
  const formatTime = (datetime) => new Date(datetime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  const formatDate = (datetime) => new Date(datetime).toLocaleDateString('pt-BR')

  const toggleDay = (day) => {
    setSchedule(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    )
  }
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-hero text-white">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2 text-black">Painel do Barbeiro</h1>
              <p className="text-black">Bem-vindo, {barber.name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 bg-card shadow-card">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="appointments" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Minha Agenda
            </TabsTrigger>
            <TabsTrigger value="clients" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Meus Clientes
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Meus Horários
            </TabsTrigger>
          </TabsList>

          {/* Dashboard */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Próximos Cortes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{appointments.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Clientes Atendidos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{clients.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Receita Estimada</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{formatPrice(32000)}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Appointments */}
          <TabsContent value="appointments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Meus Agendamentos</CardTitle>
                <CardDescription>Veja todos os seus horários marcados.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {appointments.map(a => (
                  <div key={a.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{a.customerName}</h3>
                      <p className="text-sm text-muted-foreground">{a.serviceName}</p>
                      <p className="text-sm text-primary">{formatDate(a.startTime)} às {formatTime(a.startTime)}</p>
                    </div>
                    <Badge variant={a.status === 'confirmed' ? 'default' : 'secondary'}>
                      {a.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Clients */}
          <TabsContent value="clients" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Clientes Recentes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {clients.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{c.name}</h3>
                      <p className="text-xs text-muted-foreground">{c.visits} visitas</p>
                    </div>
                    <Button size="sm" variant="outline">Contatar</Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Schedule */}
          <TabsContent value="schedule" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Definir Horários</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-7 gap-2">
                  {WEEK_DAYS.map(day => (
                    <Button
                      key={day}
                      size="sm"
                      variant={schedule.includes(day) ? 'default' : 'outline'}
                    >
                      {day}
                    </Button>
                  ))}
                </div>
                <Button className="bg-primary w-full">Salvar Configurações</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default BarberPanel
