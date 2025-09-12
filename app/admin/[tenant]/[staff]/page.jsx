'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Calendar, Users, Scissors, Settings, TrendingUp, DollarSign, BarChart3 } from 'lucide-react'
import { toast } from 'react-toastify'

export default function StaffPage({ params }) {
  const { tenant, staff } = params
  const [appointments, setAppointments] = useState([])
  const [activeTab, setActiveTab] = useState('dashboard')
  const [staffList, setStaffList] = useState([])
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAppointments() {
      setLoading(true)
      const res = await fetch(`/api/tenants/${tenant}/appointments?staff_id=${staff}`)
      const data = await res.json()
      setAppointments(Array.isArray(data) ? data : [])
      setLoading(false)
    }
    loadAppointments()
  }, [tenant, staff])

  useEffect(() => {
    async function loadStaff() {
      const res = await fetch(`/api/tenants/${tenant}/staff`)
      const data = await res.json()
      setStaffList(Array.isArray(data) ? data : [])
    }
    loadStaff()
  }, [tenant])

  // Format helpers
  const formatPrice = (cents) => `R$ ${(cents / 100).toFixed(2)}`
  const formatTime = (datetime) => new Date(datetime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  const formatDate = (datetime) => new Date(datetime).toLocaleDateString('pt-BR')

  const today = new Date().toISOString().split('T')[0]
  const todayAppointments = appointments.filter(a => a.start_time.startsWith(today)).length
  const todayRevenue = appointments
    .filter(a => a.start_time.startsWith(today) && a.status === 'confirmed')
    .reduce((sum, a) => sum + (a.price_cents || 0), 0)

  const monthlyRevenue = appointments
    .filter(a => a.start_time.startsWith(new Date().toISOString().slice(0,7)) && a.status === 'confirmed')
    .reduce((sum, a) => sum + (a.price_cents || 0), 0)

  const totalClients = [...new Set(appointments.map(a => a.customer_id))].length
  const filteredAppointments = selectedStaff
    ? appointments.filter(a => a.staff_id === parseInt(selectedStaff) && new Date(a.start_time) >= new Date())
    : appointments.filter(a => new Date(a.start_time) >= new Date())

  filteredAppointments.sort((a,b) => new Date(a.start_time) - new Date(b.start_time))

  return (
      <div className="px-6 py-8 space-y-8">
        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-6 bg-card shadow-card">
            <TabsTrigger value="dashboard"><BarChart3 className="w-4 h-4" /> Dashboard</TabsTrigger>
            <TabsTrigger value="services"><Scissors className="w-4 h-4" /> Serviços</TabsTrigger>
            <TabsTrigger value="staff"><Users className="w-4 h-4" /> Equipe</TabsTrigger>
            <TabsTrigger value="customers"><Users className="w-4 h-4" /> Clientes</TabsTrigger>
            <TabsTrigger value="appointments"><Calendar className="w-4 h-4" /> Agendamentos</TabsTrigger>
            <TabsTrigger value="schedule"><Settings className="w-4 h-4" /> Horários</TabsTrigger>
          </TabsList>

          {/* Dashboard */}
          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card><CardHeader><CardTitle>Receita Hoje</CardTitle></CardHeader>
                <CardContent><p className="text-2xl font-bold">{formatPrice(todayRevenue)}</p></CardContent>
              </Card>
              <Card><CardHeader><CardTitle>Receita Mensal</CardTitle></CardHeader>
                <CardContent><p className="text-2xl font-bold">{formatPrice(monthlyRevenue)}</p></CardContent>
              </Card>
              <Card><CardHeader><CardTitle>Clientes Ativos</CardTitle></CardHeader>
                <CardContent><p className="text-2xl font-bold">{totalClients}</p></CardContent>
              </Card>
              <Card><CardHeader><CardTitle>Hoje</CardTitle></CardHeader>
                <CardContent><p className="text-2xl font-bold">{todayAppointments}</p></CardContent>
              </Card>
            </div>

            <Card className="mt-6">
              <CardHeader><CardTitle>Próximos Agendamentos</CardTitle></CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-muted-foreground text-center py-6">Carregando...</p>
                ) : filteredAppointments.length === 0 ? (
                  <p className="text-muted-foreground text-center py-6">Nenhum agendamento futuro.</p>
                ) : (
                  <div className="space-y-4">
                    {filteredAppointments.map(a => (
                      <div key={a.id} className="flex justify-between items-center p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{a.customerName}</p>
                          <p className="text-sm text-muted-foreground">{a.serviceName} com {a.staffName}</p>
                          <p className="text-sm text-primary">{formatDate(a.startTime)} às {formatTime(a.startTime)}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={a.status === "confirmed" ? "default" : "secondary"}>
                            {a.status === "confirmed" ? "Confirmado" : "Pendente"}
                          </Badge>
                          <Button size="sm" variant="outline">Gerenciar</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services */}
          <TabsContent value="services">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Serviços</CardTitle>
                <CardDescription>Adicione, edite ou remova os serviços.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="bg-primary w-full mb-4">+ Novo Serviço</Button>
                <Separator />
                {services.length === 0 ? (
                  <p className="text-muted-foreground text-center py-6">Nenhum serviço cadastrado.</p>
                ) : (
                  <div className="space-y-3 mt-4">
                    {services.map(s => (
                      <div key={s.id} className="flex justify-between items-center p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium">{s.name} {s.popular && <Badge>Popular</Badge>}</h3>
                          <p className="text-sm text-muted-foreground">{s.duration} min • {formatPrice(s.price)}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">Editar</Button>
                          <Button size="sm" variant="destructive">Excluir</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Schedule */}
          <TabsContent value="schedule">
            <Card>
              <CardHeader>
                <CardTitle>Configuração de Horários</CardTitle>
                <CardDescription>Defina os dias e horários de cada profissional.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="bg-primary w-full">Salvar Configurações</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  )
}
