'use client'
import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input, Button } from '@/components/ui/input'

export default function SettingsPage({ params }) {
  const { tenant } = params
  const [hours, setHours] = useState([])

  useEffect(() => {
    async function loadHours() {
      const res = await fetch(`/api/tenants/${tenant}/settings/hours`)
      const data = await res.json()
      setHours(data)
    }
    loadHours()
  }, [tenant])

  return (
    <AdminLayout tenantSlug={tenant}>
      <Card>
        <CardHeader><CardTitle>Horários de Funcionamento</CardTitle></CardHeader>
        <CardContent>
          {hours.map((day) => (
            <div key={day.weekday} className="flex gap-2 items-center mb-2">
              <span className="w-24">{day.weekday}</span>
              <Input value={day.open} placeholder="Abre" type="time" />
              <Input value={day.close} placeholder="Fecha" type="time" />
            </div>
          ))}
          <Button className="mt-4">Salvar</Button>
        </CardContent>
      </Card>
    </AdminLayout>
  )
}
