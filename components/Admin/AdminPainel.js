'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatPrice, formatTime, formatDate } from '@/lib/db'

const DEMO_TENANT = 'demo-barbershop'

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [services, setServices] = useState([])
  const [staff, setStaff] = useState([])
  const [customers, setCustomers] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadAdminData()
  }, [])

  const loadAdminData = async () => {
    try {
      setLoading(true)
      const [servicesRes, staffRes, customersRes, appointmentsRes] = await Promise.all([
        fetch(`/api/tenants/${DEMO_TENANT}/services`),
        fetch(`/api/tenants/${DEMO_TENANT}/staff`),
        fetch(`/api/tenants/${DEMO_TENANT}/customers`),
        fetch(`/api/tenants/${DEMO_TENANT}/appointments`)
      ])

      setServices((await servicesRes.json()).services || [])
      setStaff((await staffRes.json()).staff || [])
      setCustomers((await customersRes.json()).customers || [])
      setAppointments((await appointmentsRes.json()).appointments || [])

    } catch (error) {
      console.error('Erro ao carregar dados admin:', error)
    } finally {
      setLoading(false)
    }
  }

  const upcomingAppointments = appointments
    .filter(a => new Date(a.start_time) >= new Date())
    .sort((a,b) => new Date(a.start_time) - new Date(b.start_time))
    .slice(0,5)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6">Painel Administrativo</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">

        <TabsList className="mb-4 border-b">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="services">Serviços</TabsTrigger>
          <TabsTrigger value="staff">Profissionais</TabsTrigger>
          <TabsTrigger value="customers">Clientes</TabsTrigger>
          <TabsTrigger value="appointments">Agendamentos</TabsTrigger>
          <TabsTrigger value="schedule">Horários</TabsTrigger>
        </TabsList>

        {/* Dashboard */}
        <TabsContent value="dashboard">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Total de Serviços</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{services.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Total de Profissionais</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{staff.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Total de Clientes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{customers.length}</p>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Próximos Agendamentos</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingAppointments.length === 0 
                ? <p>Nenhum agendamento futuro.</p>
                : upcomingAppointments.map(a => (
                  <div key={a.id} className="flex justify-between py-2 border-b">
                    <span>
                      {a.customer_name} - {a.service_name} com {a.staff_name} em {formatDate(a.start_time)} {formatTime(a.start_time)}
                    </span>
                    <Button size="sm" variant="outline">Editar</Button>
                  </div>
                ))
              }
            </CardContent>
          </Card>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle>Serviços</CardTitle>
            </CardHeader>
            <CardContent>
              {services.map(s => (
                <div key={s.id} className="flex justify-between py-2 border-b">
                  <span>{s.name} ({s.duration_minutes} min) - {formatPrice(s.price_cents)}</span>
                  <div className="flex gap-2">
                    <Button size="sm">Editar</Button>
                    <Button size="sm" variant="destructive">Excluir</Button>
                  </div>
                </div>
              ))}
              <Button className="mt-4">Adicionar Serviço</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Staff Tab */}
        <TabsContent value="staff">
          <Card>
            <CardHeader>
              <CardTitle>Profissionais</CardTitle>
            </CardHeader>
            <CardContent>
              {staff.map(s => (
                <div key={s.id} className="flex justify-between py-2 border-b">
                  <span>{s.name} - {s.bio}</span>
                  <div className="flex gap-2">
                    <Button size="sm">Editar</Button>
                    <Button size="sm" variant="destructive">Excluir</Button>
                  </div>
                </div>
              ))}
              <Button className="mt-4">Adicionar Profissional</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers">
          <Card>
            <CardHeader>
              <CardTitle>Clientes</CardTitle>
            </CardHeader>
            <CardContent>
              {customers.map(c => (
                <div key={c.id} className="flex justify-between py-2 border-b">
                  <span>{c.name} - {c.phone} - {c.email}</span>
                  <div className="flex gap-2">
                    <Button size="sm">Editar</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appointments Tab */}
        <TabsContent value="appointments">
          <Card>
            <CardHeader>
              <CardTitle>Agendamentos</CardTitle>
            </CardHeader>
            <CardContent>
              {appointments.map(a => (
                <div key={a.id} className="flex justify-between py-2 border-b">
                  <span>
                    {a.customer_name} - {a.service_name} com {a.staff_name} em {formatDate(a.start_time)} {formatTime(a.start_time)}
                  </span>
                  <div className="flex gap-2">
                    <Button size="sm">Editar</Button>
                    <Button size="sm" variant="destructive">Cancelar</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Configuração de Horários</CardTitle>
              <CardDescription>Defina os horários disponíveis para cada profissional</CardDescription>
            </CardHeader>
            <CardContent>
              {staff.map(s => (
                <div key={s.id} className="mb-4">
                  <h3 className="font-semibold mb-2">{s.name}</h3>
                  <div className="grid grid-cols-7 gap-2">
                    {['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'].map(day => (
                      <Button key={day} size="sm" variant="outline">{day}</Button>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  )
}
