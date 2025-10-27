'use client'
import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { CalendarIcon } from 'lucide-react'

// Helpers
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
const formatTime = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export default function BarberAppointments({ staffName }) {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]) // YYYY-MM-DD

  useEffect(() => {
    if (!staffName) return
    loadAppointments(selectedDate)
  }, [staffName, selectedDate])

  const loadAppointments = async (date) => {
    try {
      setLoading(true)
      const tenantId = localStorage.getItem('tenant_id')
      const staffId = localStorage.getItem('staff_id')
      if (!tenantId || !staffId) throw new Error('Tenant ou Staff não encontrado no localStorage')

      const response = await fetch(`/api/${tenantSlug}/${StaffName}/schedule`)
      const data = await response.json()
      if (data.success) {
        setAppointments(data.appointments)
      } else {
        setAppointments([])
      }
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error)
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agenda do Dia</CardTitle>
        <CardDescription>
          Visualize os agendamentos de <span className="font-medium">{staffName}</span> neste dia.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Filtro por data */}
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-muted-foreground" />
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-auto"
          />
        </div>

        {loading ? (
          <p className="text-muted-foreground text-center py-6">Carregando...</p>
        ) : appointments.length === 0 ? (
          <p className="text-muted-foreground text-center py-6">Nenhum agendamento para este dia.</p>
        ) : (
          <div className="space-y-3">
            {appointments.map((a) => (
              <div key={a.id} className="flex justify-between items-center p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{a.customer_name || 'Cliente'}</p>
                  <p className="text-sm text-muted-foreground">
                    {a.service_name || 'Serviço'} — {a.staff_name || staffName}
                  </p>
                  <p className="text-sm text-primary">
                    {formatTime(a.start_time)} às {formatTime(a.end_time)}
                  </p>
                </div>
                <div className="flex gap-2 items-center">
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
  )
}
