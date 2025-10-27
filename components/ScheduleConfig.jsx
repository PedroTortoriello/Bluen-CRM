'use client'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Trash2, Clock, Save } from 'lucide-react'

const DAYS_OF_WEEK = [
  { id: 0, name: 'Domingo', short: 'Dom' },
  { id: 1, name: 'Segunda-feira', short: 'Seg' },
  { id: 2, name: 'Terça-feira', short: 'Ter' },
  { id: 3, name: 'Quarta-feira', short: 'Qua' },
  { id: 4, name: 'Quinta-feira', short: 'Qui' },
  { id: 5, name: 'Sexta-feira', short: 'Sex' },
  { id: 6, name: 'Sábado', short: 'Sáb' }
]

export default function ScheduleConfig({ StaffName, tenantSlug }) {
  const [schedule, setSchedule] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedDay, setSelectedDay] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  // Initialize schedule structure
  useEffect(() => {
    const initSchedule = {}
    DAYS_OF_WEEK.forEach(day => {
      initSchedule[day.id] = {
        enabled: false,
        timeBlocks: []
      }
    })
    setSchedule(initSchedule)
    loadSchedule()
  }, [StaffName])

  const loadSchedule = async () => {
    if (!StaffName) return
    
    try {
      setLoading(true)
      const response = await fetch(`/api/${tenantSlug}/${StaffName}/schedule`)
      const data = await response.json()
      
      if (data.success) {
        const loadedSchedule = {}
        DAYS_OF_WEEK.forEach(day => {
          const dayRules = data.rules.filter(rule => rule.day_of_week === day.id)
          loadedSchedule[day.id] = {
            enabled: dayRules.length > 0,
            timeBlocks: dayRules.map(rule => ({
              id: rule.id,
              start_time: rule.start_time,
              end_time: rule.end_time
            }))
          }
        })
        setSchedule(loadedSchedule)
      }
    } catch (error) {
      console.error('Error loading schedule:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveSchedule = async () => {
    try {
      setSaving(true)
      
      const rules = []
      Object.entries(schedule).forEach(([dayId, dayData]) => {
        if (dayData.enabled && dayData.timeBlocks.length > 0) {
          dayData.timeBlocks.forEach(block => {
          rules.push({
            day_of_week: parseInt(dayId),
            start_time: block.start_time,
            end_time: block.end_time
          })

          })
        }
      })

      const response = await fetch(
        `/api/${tenantSlug}/${StaffName}/schedule`, // tenantSlug e StaffName na URL
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rules }) // apenas rules no body
        }
      )


      const data = await response.json()
      
      if (data.success) {
        alert('Horários salvos com sucesso!')
      } else {
        alert('Erro ao salvar horários: ' + data.error)
      }
    } catch (error) {
      console.error('Error saving schedule:', error)
      alert('Erro ao salvar horários')
    } finally {
      setSaving(false)
    }
  }

  const toggleDay = (dayId) => {
    setSchedule(prev => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        enabled: !prev[dayId].enabled,
        timeBlocks: !prev[dayId].enabled ? prev[dayId].timeBlocks : []
      }
    }))
  }

  const addTimeBlock = (dayId) => {
    const newBlock = {
      id: Date.now(),
      start_time: '09:00',
      end_time: '17:00'
    }
    
    setSchedule(prev => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        timeBlocks: [...prev[dayId].timeBlocks, newBlock]
      }
    }))
  }

  const updateTimeBlock = (dayId, blockId, field, value) => {
    setSchedule(prev => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        timeBlocks: prev[dayId].timeBlocks.map(block =>
          block.id === blockId ? { ...block, [field]: value } : block
        )
      }
    }))
  }

  const removeTimeBlock = (dayId, blockId) => {
    setSchedule(prev => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        timeBlocks: prev[dayId].timeBlocks.filter(block => block.id !== blockId)
      }
    }))
  }

  const validateTimeBlock = (startTime, endTime) => {
    return startTime < endTime
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Configuração de Horários</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-8 text-muted-foreground">Carregando...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Configuração de Horários de Trabalho
        </CardTitle>
        <CardDescription>
          Configure os dias e horários de trabalho. Você pode adicionar múltiplos blocos de horário por dia.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          {DAYS_OF_WEEK.map(day => (
            <div key={day.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={schedule[day.id]?.enabled || false}
                    onCheckedChange={() => toggleDay(day.id)}
                  />
                  <Label className="text-base font-medium">{day.name}</Label>
                </div>
                {schedule[day.id]?.enabled && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addTimeBlock(day.id)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Período
                  </Button>
                )}
              </div>

              {schedule[day.id]?.enabled && (
                <div className="space-y-3 ml-6">
                  {schedule[day.id].timeBlocks.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Nenhum período configurado. Clique em "Adicionar Período" para começar.
                    </p>
                  ) : (
                    schedule[day.id].timeBlocks.map((block, index) => (
                      <div key={block.id} className="flex items-center gap-3 p-3 bg-muted rounded-md">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm">De:</Label>
                          <Input
                            type="time"
                            value={block.start_time}
                            onChange={(e) => updateTimeBlock(day.id, block.id, 'start_time', e.target.value)}
                            className="w-auto"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Label className="text-sm">Até:</Label>
                          <Input
                            type="time"
                            value={block.end_time}
                            onChange={(e) => updateTimeBlock(day.id, block.id, 'end_time', e.target.value)}
                            className="w-auto"
                          />
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeTimeBlock(day.id, block.id)}
                          className="ml-auto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        {!validateTimeBlock(block.start_time, block.end_time) && (
                          <span className="text-sm text-destructive">
                            Horário inválido
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <Separator />

        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Lembre-se de salvar suas alterações antes de sair da página.
          </p>
          <Button 
            onClick={saveSchedule} 
            disabled={saving}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}