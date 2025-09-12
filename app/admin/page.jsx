'use client'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { BarChart3, Users, Calendar, Scissors, Settings, TrendingUp, DollarSign } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation"

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const router = useRouter()
  const [services, setServices] = useState([
    { id: 1, name: 'Corte Clássico', duration: 30, price: 2500, popular: true },
    { id: 2, name: 'Barba Completa', duration: 45, price: 3000, popular: false },
    { id: 3, name: 'Corte + Barba', duration: 60, price: 4500, popular: true }
  ])
  const [staff, setStaff] = useState([
    { id: 1, name: 'João Silva', bio: 'Especialista em cortes clássicos', available: true },
    { id: 2, name: 'Pedro Santos', bio: 'Barbeiro com 15 anos de experiência', available: true }
  ])
  const [customers, setCustomers] = useState([
    { id: 1, name: 'Carlos Mendes', phone: '(11) 99999-9999', email: 'carlos@email.com', visits: 12 },
    { id: 2, name: 'Lucas Oliveira', phone: '(11) 88888-8888', email: 'lucas@email.com', visits: 8 }
  ])
  const [appointments, setAppointments] = useState([
    { id: 1, customerName: 'Carlos Mendes', serviceName: 'Corte + Barba', staffName: 'João Silva', startTime: '2024-01-15T10:00:00', status: 'confirmed' },
    { id: 2, customerName: 'Lucas Oliveira', serviceName: 'Corte Clássico', staffName: 'Pedro Santos', startTime: '2024-01-15T14:30:00', status: 'pending' }
  ])
  const [schedule, setSchedule] = useState({ 1: ['Seg', 'Ter', 'Qua'], 2: ['Qui', 'Sex', 'Sáb'] })
  const [selectedStaff, setSelectedStaff] = useState("");

  // Filtra agendamentos pelo barbeiro selecionado
  const WEEK_DAYS = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom']

  const formatPrice = (cents) => `R$ ${(cents / 100).toFixed(2)}`
  const formatTime = (datetime) => new Date(datetime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  const formatDate = (datetime) => new Date(datetime).toLocaleDateString('pt-BR')

  const toggleDay = (staffId, day) => {
    setSchedule(prev => {
      const staffDays = prev[staffId] || []
      const newDays = staffDays.includes(day)
        ? staffDays.filter(d => d !== day)
        : [...staffDays, day]
      return { ...prev, [staffId]: newDays }
    })
  }

  const saveSchedule = () => {
    console.log('Horários salvos:', schedule)
    alert('Horários salvos com sucesso! (somente local por enquanto)')
  }

  const upcomingAppointments = appointments
    .filter(a => new Date(a.startTime) >= new Date())
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 5)

  const todayRevenue = 12750
  const monthlyRevenue = 45600
  const totalClients = customers.length
  const todayAppointments = appointments.filter(a => {
    const appointmentDate = new Date(a.startTime).toDateString()
    const today = new Date().toDateString()
    return appointmentDate === today
  }).length

const filteredAppointments = selectedStaff
  ? upcomingAppointments.filter(a => a.staffName === staff.find(s => s.id === Number(selectedStaff))?.name)
  : upcomingAppointments;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-hero text-white">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-black">Painel Administrativo</h1>
              <p className="text-black">Gerencie sua barbearia com facilidade</p>
            </div>
            <div className="flex items-center gap-4">
              <Settings className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          {/* Navigation */}
          <TabsList className="grid w-full grid-cols-6 bg-card shadow-card">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="services" className="flex items-center gap-2">
              <Scissors className="w-4 h-4" />
              Serviços
            </TabsTrigger>
            <TabsTrigger value="staff" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Equipe
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Clientes
            </TabsTrigger>
            <TabsTrigger value="appointments" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Agendamentos
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Horários
            </TabsTrigger>
          </TabsList>

          {/* Dashboard */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="shadow-card transition-all hover:shadow-elegant">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Receita Hoje</CardTitle>
                  <DollarSign className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{formatPrice(todayRevenue)}</div>
                  <p className="text-xs text-muted-foreground">
                    <TrendingUp className="w-3 h-3 inline mr-1" />
                    +12% desde ontem
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-card transition-all hover:shadow-elegant">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
                  <BarChart3 className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{formatPrice(monthlyRevenue)}</div>
                  <p className="text-xs text-muted-foreground">Meta: R$ 50.000</p>
                </CardContent>
              </Card>

              <Card className="shadow-card transition-all hover:shadow-elegant">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
                  <Users className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{totalClients}</div>
                  <p className="text-xs text-muted-foreground">+3 novos esta semana</p>
                </CardContent>
              </Card>

              <Card className="shadow-card transition-all hover:shadow-elegant">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Hoje</CardTitle>
                  <Calendar className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{todayAppointments}</div>
                  <p className="text-xs text-muted-foreground">agendamentos</p>
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Appointments */}
    <Card className="shadow-card">
      <CardHeader className="flex flex-col gap-4">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Próximos Agendamentos
        </CardTitle>

        {/* Select de Barbeiro */}
<Select value={selectedStaff ?? undefined} onValueChange={setSelectedStaff}>
  <SelectTrigger>
    <SelectValue placeholder="Todos os barbeiros" />
  </SelectTrigger>
  <SelectContent>
    {staff.map(s => (
      <SelectItem key={s.id} value={String(s.id)}>
        {s.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>

      </CardHeader>

      <CardContent>
        {filteredAppointments.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Nenhum agendamento futuro.
          </p>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map(a => (
              <div
                key={a.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="space-y-1">
                  <p className="font-medium">{a.customerName}</p>
                  <p className="text-sm text-muted-foreground">
                    {a.serviceName} com {a.staffName}
                  </p>
                  <p className="text-sm text-primary font-medium">
                    {formatDate(a.startTime)} às {formatTime(a.startTime)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={a.status === "confirmed" ? "default" : "secondary"}>
                    {a.status === "confirmed" ? "Confirmado" : "Pendente"}
                  </Badge>
                  <Button size="sm" variant="outline">
                    Gerenciar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
          </TabsContent>

          {/* Services */}
          <TabsContent value="services" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scissors className="w-5 h-5 text-primary" />
                  Gerenciar Serviços
                </CardTitle>
                <CardDescription>
                  Adicione, edite ou remova os serviços oferecidos pela barbearia.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
              <Button 
                className="bg-primary" 
                onClick={() => router.push("/services")}
              >
                Adicionar Novo Serviço
              </Button>
                <Separator />
                <div className="space-y-4">
                  {services.map(s => (
                    <div key={s.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{s.name}</h3>
                            {s.popular && <Badge variant="default">Popular</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {s.duration} minutos • {formatPrice(s.price)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">Editar</Button>
                        <Button size="sm" variant="destructive">Excluir</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Staff */}
          <TabsContent value="staff" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Gerenciar Equipe
                </CardTitle>
                <CardDescription>
                  Gerencie os profissionais da sua barbearia.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="bg-primary">
                  Adicionar Profissional
                </Button>
                <Separator />
                <div className="space-y-4">
                  {staff.map(s => (
                    <div key={s.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{s.name}</h3>
                          <Badge variant={s.available ? 'default' : 'secondary'}>
                            {s.available ? 'Disponível' : 'Indisponível'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{s.bio}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">Editar</Button>
                        <Button size="sm" variant="destructive">Remover</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customers */}
          <TabsContent value="customers" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Clientes Cadastrados
                </CardTitle>
                <CardDescription>
                  Visualize e gerencie informações dos seus clientes.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {customers.map(c => (
                    <div key={c.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <h3 className="font-medium">{c.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {c.phone} • {c.email}
                        </p>
                        <p className="text-xs text-primary">{c.visits} visitas realizadas</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">Ver Histórico</Button>
                        <Button size="sm" variant="outline">Contatar</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appointments */}
          <TabsContent value="appointments" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Todos os Agendamentos
                </CardTitle>
                <CardDescription>
                  Gerencie todos os agendamentos da barbearia.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {appointments.map(a => (
                    <div key={a.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <h3 className="font-medium">{a.customerName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {a.serviceName} com {a.staffName}
                        </p>
                        <p className="text-sm text-primary">
                          {formatDate(a.startTime)} às {formatTime(a.startTime)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={a.status === 'confirmed' ? 'default' : 'secondary'}>
                          {a.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                        </Badge>
                        <Button size="sm" variant="outline">Editar</Button>
                        <Button size="sm" variant="destructive">Cancelar</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Schedule */}
          <TabsContent value="schedule" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary" />
                  Configuração de Horários
                </CardTitle>
                <CardDescription>
                  Defina os dias da semana que cada profissional trabalha.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {staff.map(s => (
                  <div key={s.id} className="space-y-4">
                    <h3 className="font-semibold text-lg">{s.name}</h3>
                    <div className="grid grid-cols-7 gap-2">
                      {WEEK_DAYS.map(day => {
                        const isSelected = schedule[s.id]?.includes(day)
                        return (
                          <Button
                            key={day}
                            size="sm"
                            variant={isSelected ? 'default' : 'outline'}
                            onClick={() => toggleDay(s.id, day)}
                            className="transition-all hover:scale-105"
                          >
                            {day}
                          </Button>
                        )
                      })}
                    </div>
                    <Separator />
                  </div>
                ))}
                <Button className="bg-primary w-full">
                  Salvar Configurações
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default AdminPanel