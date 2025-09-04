'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Calendar, Clock, User, Phone, Mail, MapPin, Scissors, Star } from 'lucide-react'
import { formatPrice, formatTime, formatDate } from '@/lib/supabase'

const DEMO_TENANT = 'demo-barbershop'

export default function BookingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedService, setSelectedService] = useState(null)
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [customerData, setCustomerData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  })

  // Data state
  const [tenant, setTenant] = useState(null)
  const [services, setServices] = useState([])
  const [staff, setStaff] = useState([])
  const [availableSlots, setAvailableSlots] = useState([])
  const [loading, setLoading] = useState(false)
  const [appointment, setAppointment] = useState(null)

  // Load tenant data
  useEffect(() => {
    loadTenantData()
  }, [])

  // Load available slots when service, staff, and date are selected
  useEffect(() => {
    if (selectedService && selectedStaff && selectedDate) {
      loadAvailableSlots()
    }
  }, [selectedService, selectedStaff, selectedDate])

  const loadTenantData = async () => {
    try {
      setLoading(true)
      
      // Load tenant
      const tenantRes = await fetch(`/api/tenants/${DEMO_TENANT}`)
      const tenantData = await tenantRes.json()
      setTenant(tenantData.tenant)

      // Load services
      const servicesRes = await fetch(`/api/tenants/${DEMO_TENANT}/services`)
      const servicesData = await servicesRes.json()
      setServices(servicesData.services || [])

      // Load staff
      const staffRes = await fetch(`/api/tenants/${DEMO_TENANT}/staff`)
      const staffData = await staffRes.json()
      setStaff(staffData.staff || [])

    } catch (error) {
      console.error('Error loading tenant data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAvailableSlots = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/tenants/${DEMO_TENANT}/availability?staff_id=${selectedStaff.id}&service_id=${selectedService.id}&date=${selectedDate}`
      )
      const data = await response.json()
      setAvailableSlots(data.slots || [])
    } catch (error) {
      console.error('Error loading available slots:', error)
      setAvailableSlots([])
    } finally {
      setLoading(false)
    }
  }

  const createAppointment = async () => {
    try {
      setLoading(true)
      
      const appointmentData = {
        staffId: selectedStaff.id,
        serviceId: selectedService.id,
        startTime: selectedSlot.datetime,
        endTime: new Date(new Date(selectedSlot.datetime).getTime() + selectedSlot.duration * 60000).toISOString(),
        customerData
      }

      const response = await fetch(`/api/tenants/${DEMO_TENANT}/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(appointmentData)
      })

      const result = await response.json()
      
      if (response.ok) {
        setAppointment(result.appointment)
        setCurrentStep(5) // Success step
      } else {
        throw new Error(result.error || 'Failed to create appointment')
      }
    } catch (error) {
      console.error('Error creating appointment:', error)
      alert('Erro ao criar agendamento. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const getAvailableDates = () => {
    const dates = []
    const today = new Date()
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      dates.push(date.toISOString().split('T')[0])
    }
    
    return dates
  }

  if (loading && !tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 rounded-lg p-3">
              <Scissors className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{tenant?.name || 'Barbearia Demo'}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {tenant?.address || 'São Paulo, SP'}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  {tenant?.phone || '(11) 99999-9999'}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  4.9 (127 avaliações)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Steps indicator */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                currentStep >= step 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {step}
              </div>
              {step < 4 && (
                <div className={`w-16 h-1 mx-2 ${
                  currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Choose Service */}
        {currentStep === 1 && (
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scissors className="h-5 w-5" />
                Escolha o Serviço
              </CardTitle>
              <CardDescription>
                Selecione o serviço que deseja agendar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedService?.id === service.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => setSelectedService(service)}
                  >
                    <h3 className="font-semibold text-lg">{service.name}</h3>
                    <p className="text-gray-600 text-sm mt-1">{service.description}</p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-blue-600 font-semibold">
                        {formatPrice(service.price_cents)}
                      </span>
                      <Badge variant="secondary">
                        {service.duration_minutes} min
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              
              {selectedService && (
                <div className="mt-6 flex justify-end">
                  <Button onClick={() => setCurrentStep(2)}>
                    Continuar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 2: Choose Barber */}
        {currentStep === 2 && (
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Escolha o Profissional
              </CardTitle>
              <CardDescription>
                Selecione o profissional para o serviço: {selectedService?.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {staff.map((member) => {
                  // Check if this staff member offers the selected service
                  const staffService = member.staff_services?.find(ss => ss.service_id === selectedService.id)
                  if (!staffService) return null

                  const servicePrice = staffService.price_cents_override || selectedService.price_cents
                  const serviceDuration = staffService.duration_minutes_override || selectedService.duration_minutes

                  return (
                    <div
                      key={member.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedStaff?.id === member.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                      onClick={() => setSelectedStaff(member)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={member.photo_url} alt={member.name} />
                          <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-semibold">{member.name}</h3>
                          <p className="text-gray-600 text-sm">{member.bio}</p>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-blue-600 font-semibold">
                              {formatPrice(servicePrice)}
                            </span>
                            <Badge variant="secondary">
                              {serviceDuration} min
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              
              <div className="mt-6 flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  Voltar
                </Button>
                {selectedStaff && (
                  <Button onClick={() => setCurrentStep(3)}>
                    Continuar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Choose Date & Time */}
        {currentStep === 3 && (
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Escolha Data e Horário
              </CardTitle>
              <CardDescription>
                {selectedService?.name} com {selectedStaff?.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Date Selection */}
              <div className="mb-6">
                <Label className="text-base font-semibold mb-3 block">Escolha a Data</Label>
                <div className="grid grid-cols-7 gap-2">
                  {getAvailableDates().map((date) => {
                    const dateObj = new Date(date + 'T00:00:00')
                    const isSelected = selectedDate === date
                    
                    return (
                      <Button
                        key={date}
                        variant={isSelected ? "default" : "outline"}
                        className="flex flex-col p-2 h-auto"
                        onClick={() => {
                          setSelectedDate(date)
                          setSelectedSlot(null)
                        }}
                      >
                        <span className="text-xs">
                          {dateObj.toLocaleDateString('pt-BR', { weekday: 'short' })}
                        </span>
                        <span className="text-sm font-semibold">
                          {dateObj.getDate()}
                        </span>
                      </Button>
                    )
                  })}
                </div>
              </div>

              {/* Time Slots */}
              {selectedDate && (
                <div>
                  <Label className="text-base font-semibold mb-3 block">
                    Horários Disponíveis - {formatDate(selectedDate)}
                  </Label>
                  
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Não há horários disponíveis para esta data
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                      {availableSlots.map((slot) => (
                        <Button
                          key={slot.time}
                          variant={selectedSlot?.time === slot.time ? "default" : "outline"}
                          className="text-sm"
                          onClick={() => setSelectedSlot(slot)}
                        >
                          {formatTime(slot.time)}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              <div className="mt-6 flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>
                  Voltar
                </Button>
                {selectedSlot && (
                  <Button onClick={() => setCurrentStep(4)}>
                    Continuar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Customer Information */}
        {currentStep === 4 && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Seus Dados
              </CardTitle>
              <CardDescription>
                Preencha seus dados para confirmar o agendamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Booking Summary */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold mb-2">Resumo do Agendamento</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Serviço:</span> {selectedService?.name}</p>
                  <p><span className="font-medium">Profissional:</span> {selectedStaff?.name}</p>
                  <p><span className="font-medium">Data:</span> {formatDate(selectedDate)}</p>
                  <p><span className="font-medium">Horário:</span> {formatTime(selectedSlot?.time)}</p>
                  <p><span className="font-medium">Duração:</span> {selectedSlot?.duration} minutos</p>
                  <p className="text-lg font-semibold text-blue-600">
                    <span className="font-medium text-black">Valor:</span> {formatPrice(selectedSlot?.price)}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    value={customerData.name}
                    onChange={(e) => setCustomerData({...customerData, name: e.target.value})}
                    placeholder="Digite seu nome completo"
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">WhatsApp *</Label>
                  <Input
                    id="phone"
                    value={customerData.phone}
                    onChange={(e) => setCustomerData({...customerData, phone: e.target.value})}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerData.email}
                    onChange={(e) => setCustomerData({...customerData, email: e.target.value})}
                    placeholder="seu@email.com"
                  />
                </div>
                
                <div>
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    value={customerData.notes}
                    onChange={(e) => setCustomerData({...customerData, notes: e.target.value})}
                    placeholder="Alguma observação especial..."
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(3)}>
                  Voltar
                </Button>
                <Button 
                  onClick={createAppointment}
                  disabled={!customerData.name || !customerData.phone || loading}
                >
                  {loading ? 'Agendando...' : 'Confirmar Agendamento'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Success */}
        {currentStep === 5 && appointment && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto bg-green-100 rounded-full p-3 w-fit mb-4">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <CardTitle className="text-green-600">Agendamento Confirmado!</CardTitle>
              <CardDescription>
                Seu horário foi reservado com sucesso
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p><span className="font-medium">Serviço:</span> {selectedService?.name}</p>
                <p><span className="font-medium">Profissional:</span> {selectedStaff?.name}</p>
                <p><span className="font-medium">Data:</span> {formatDate(selectedDate)}</p>
                <p><span className="font-medium">Horário:</span> {formatTime(selectedSlot?.time)}</p>
                <p><span className="font-medium">Cliente:</span> {customerData.name}</p>
                <p><span className="font-medium">WhatsApp:</span> {customerData.phone}</p>
                <p className="text-lg font-semibold text-blue-600">
                  <span className="font-medium text-black">Valor:</span> {formatPrice(selectedSlot?.price)}
                </p>
              </div>
              
              <div className="mt-6 text-center space-y-4">
                <p className="text-sm text-gray-600">
                  Você receberá lembretes por WhatsApp 24h e 2h antes do seu horário.
                </p>
                
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" onClick={() => window.location.reload()}>
                    Novo Agendamento
                  </Button>
                  <Button>
                    Adicionar ao Calendário
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}