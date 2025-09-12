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
import { formatPrice, formatTime, formatDate } from '@/lib/db'
import { ChevronDown, Settings, LogOut } from 'lucide-react'

const DEMO_TENANT = 'demo-barbershop'
const tenant_id = '16f50d46-274a-4f00-b4a9-87088cd6967a'
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

  const [tenant, setTenant] = useState(null)
  const [services, setServices] = useState([])
  const [staff, setStaff] = useState([])
  const [availableSlots, setAvailableSlots] = useState([])
  const [loading, setLoading] = useState(false)
  const [appointment, setAppointment] = useState(null)
  const [customer, setCustomer] = useState(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  useEffect(() => { loadTenantData() }, [])
  useEffect(() => { if (selectedService && selectedStaff && selectedDate) loadAvailableSlots() }, [selectedService, selectedStaff, selectedDate])

  const loadTenantData = async () => {
    try {
      setLoading(true)
      const tenantRes = await fetch(`/api/tenants/${DEMO_TENANT}`)
      const tenantData = await tenantRes.json()
      setTenant(tenantData.tenant)

      const servicesRes = await fetch(`/api/tenants/${DEMO_TENANT}/services`)
      const servicesData = await servicesRes.json()
      setServices(servicesData.services || [])

      const staffRes = await fetch(`/api/tenants/${DEMO_TENANT}/staff`)
      const staffData = await staffRes.json()
      setStaff(staffData.staff || [])
    } catch (error) {
      console.error('Error loading tenant data:', error)
    } finally { setLoading(false) }
  }

  const loadAvailableSlots = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/tenants/${DEMO_TENANT}/availability?staff_id=${selectedStaff.id}&service_id=${selectedService.id}&date=${selectedDate}`)
      const data = await response.json()
      setAvailableSlots(data.slots || [])
    } catch (error) {
      console.error('Error loading available slots:', error)
      setAvailableSlots([])
    } finally { setLoading(false) }
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData)
      })

      const result = await response.json()
      if (response.ok) { setAppointment(result.appointment); setCurrentStep(5) }
      else { throw new Error(result.error || 'Failed to create appointment') }
    } catch (error) {
      console.error('Error creating appointment:', error)
      alert('Erro ao criar agendamento. Tente novamente.')
    } finally { setLoading(false) }
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-16">
      {/* Header */}
    <header className="bg-white shadow-md border-b sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        {/* Left: Barber Info */}
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 rounded-xl p-3 shadow-md">
            <Scissors className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{tenant?.name || 'Barbearia Demo'}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mt-1">
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{tenant?.address || 'São Paulo, SP'}</span>
              <span className="flex items-center gap-1"><Phone className="h-4 w-4" />{tenant?.phone || '(11) 99999-9999'}</span>
              <span className="flex items-center gap-1"><Star className="h-4 w-4 text-yellow-400" />4.9 (127)</span>
            </div>
          </div>
        </div>

        {/* Right: Customer Avatar */}
        <div className="relative">
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)} 
            className="flex items-center gap-2 focus:outline-none"
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={customer?.avatar_url} alt={customer?.name} />
              <AvatarFallback>{customer?.name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <span className="hidden md:block font-medium text-gray-700">{customer?.name || 'Cliente'}</span>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded-xl shadow-lg overflow-hidden z-50">
              <button className="flex items-center gap-2 w-full px-4 py-2 text-gray-700 hover:bg-gray-100">
                <User className="h-4 w-4" /> Perfil
              </button>
              <button className="flex items-center gap-2 w-full px-4 py-2 text-gray-700 hover:bg-gray-100">
                <Settings className="h-4 w-4" /> Configurações
              </button>
              <button className="flex items-center gap-2 w-full px-4 py-2 text-red-600 hover:bg-gray-100">
                <LogOut className="h-4 w-4" /> Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>

      <main className="container mx-auto px-6 mt-10">
        {/* Steps Indicator */}
        <div className="flex items-center justify-center mb-12">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shadow-md transition-colors ${
                currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>{step}</div>
              {step < 4 && <div className={`w-16 h-1 mx-2 rounded-full ${currentStep > step ? 'bg-blue-600' : 'bg-gray-300'}`}/>}
            </div>
          ))}
        </div>

        {/* STEP 1: Choose Service */}
        {currentStep === 1 && (
          <Card className="max-w-5xl mx-auto shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-bold"><Scissors className="h-5 w-5" />Escolha o Serviço</CardTitle>
              <CardDescription>Selecione o serviço que deseja agendar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {services.map((service) => (
                  <button
                    key={service.id}
                    type="button"
                    className={`p-5 rounded-2xl border-2 transition-all duration-200 text-left w-full shadow-sm hover:shadow-lg ${
                      selectedService?.id === service.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-400'
                    }`}
                    onClick={() => setSelectedService(service)}
                  >
                    <h3 className="font-semibold text-lg">{service.name}</h3>
                    <p className="text-gray-600 text-sm mt-1">{service.description}</p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-blue-600 font-semibold">{formatPrice(service.price_cents)}</span>
                      <Badge variant="secondary">{service.duration_minutes} min</Badge>
                    </div>
                  </button>
                ))}
              </div>
              {selectedService && <div className="mt-8 flex justify-end"><Button onClick={() => setCurrentStep(2)}>Continuar</Button></div>}
            </CardContent>
          </Card>
        )}

        {/* STEP 2: Choose Staff */}
        {currentStep === 2 && (
          <Card className="max-w-5xl mx-auto shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-bold"><User className="h-5 w-5" />Escolha o Profissional</CardTitle>
              <CardDescription>Selecione o profissional para: {selectedService?.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-5">
                {staff.map((member) => {
                  const staffService = member.staff_services?.find(ss => ss.service_id === selectedService.id)
                  if (!staffService) return null
                  const servicePrice = staffService.price_cents_override || selectedService.price_cents
                  const serviceDuration = staffService.duration_minutes_override || selectedService.duration_minutes
                  return (
                    <div
                      key={member.id}
                      className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-lg ${
                        selectedStaff?.id === member.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-400'
                      }`}
                      onClick={() => setSelectedStaff(member)}
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="h-14 w-14">
                          <AvatarImage src={member.photo_url} alt={member.name} />
                          <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{member.name}</h3>
                          <p className="text-gray-600 text-sm mt-1">{member.bio}</p>
                          <div className="flex justify-between items-center mt-2">
                            <Badge variant="secondary">{serviceDuration} min</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="mt-8 flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>Voltar</Button>
                {selectedStaff && <Button onClick={() => setCurrentStep(3)}>Continuar</Button>}
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 3: Choose Date & Time */}
        {currentStep === 3 && (
          <Card className="max-w-5xl mx-auto shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-bold"><Calendar className="h-5 w-5" />Escolha Data e Horário</CardTitle>
              <CardDescription>{selectedService?.name} com {selectedStaff?.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <Label className="text-base font-semibold mb-3 block">Escolha a Data</Label>
                <div className="grid grid-cols-7 gap-3">
                  {getAvailableDates().map((date) => {
                    const isSelected = selectedDate === date
                    return (
                      <Button
                        key={date}
                        variant={isSelected ? "default" : "outline"}
                        className="flex flex-col p-2 h-auto text-sm"
                        onClick={() => { setSelectedDate(date); setSelectedSlot(null) }}
                      >
                        <span className="capitalize">{new Date(date).toLocaleDateString('pt-BR', { weekday: 'short' })}</span>
                        <span className="font-semibold">{new Date(date).getDate()}</span>
                      </Button>
                    )
                  })}
                </div>
              </div>

              {selectedDate && (
                <div className="mt-6">
                  <Label className="text-base font-semibold mb-3 block">Horários Disponíveis - {formatDate(selectedDate)}</Label>
                  {loading ? (
                    <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
                  ) : availableSlots.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">Não há horários disponíveis</div>
                  ) : (
                    <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
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

              <div className="mt-8 flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>Voltar</Button>
                {selectedSlot && <Button onClick={() => setCurrentStep(4)}>Continuar</Button>}
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 4: Customer Info */}
        {currentStep === 4 && (
          <Card className="max-w-3xl mx-auto shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-bold"><User className="h-5 w-5" />Seus Dados</CardTitle>
              <CardDescription>Preencha seus dados para confirmar o agendamento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 rounded-xl p-5 mb-6 shadow-inner">
                <h3 className="font-semibold mb-2 text-lg">Resumo do Agendamento</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Serviço:</span> {selectedService?.name}</p>
                  <p><span className="font-medium">Profissional:</span> {selectedStaff?.name}</p>
                  <p><span className="font-medium">Data:</span> {formatDate(selectedDate)}</p>
                  <p><span className="font-medium">Horário:</span> {formatTime(selectedSlot?.time)}</p>
                  <p><span className="font-medium">Duração:</span> {selectedSlot?.duration} minutos</p>
                  <p className="text-lg font-semibold text-blue-600"><span className="font-medium text-black">Valor:</span> {formatPrice(selectedSlot?.price)}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome *</Label>
                  <Input id="name" value={customerData.name} onChange={e => setCustomerData({...customerData, name: e.target.value})} placeholder="Digite seu nome" />
                </div>
                <div>
                  <Label htmlFor="phone">WhatsApp *</Label>
                  <Input id="phone" value={customerData.phone} onChange={e => setCustomerData({...customerData, phone: e.target.value})} placeholder="(11) 99999-9999" />
                </div>
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" value={customerData.email} onChange={e => setCustomerData({...customerData, email: e.target.value})} placeholder="seu@email.com" />
                </div>
                <div>
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea id="notes" value={customerData.notes} onChange={e => setCustomerData({...customerData, notes: e.target.value})} placeholder="Alguma observação..." rows={3} />
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(3)}>Voltar</Button>
                <Button onClick={createAppointment} disabled={!customerData.name || !customerData.phone || loading}>{loading ? 'Agendando...' : 'Confirmar'}</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 5: Success */}
        {currentStep === 5 && appointment && (
          <Card className="max-w-3xl mx-auto shadow-lg rounded-2xl">
            <CardHeader className="text-center">
                <div className="mx-auto bg-green-100 rounded-full p-4 w-fit">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="mt-4 text-2xl font-bold text-green-700">Agendamento Confirmado!</h2>
              <p className="mt-2 text-gray-600">Obrigado, {customerData.name}. Seu horário foi reservado com sucesso.</p>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-2 text-gray-700">
                <p><span className="font-medium">Serviço:</span> {selectedService?.name}</p>
                <p><span className="font-medium">Profissional:</span> {selectedStaff?.name}</p>
                <p><span className="font-medium">Data:</span> {formatDate(selectedDate)}</p>
                <p><span className="font-medium">Horário:</span> {formatTime(selectedSlot?.time)}</p>
                <p className="font-medium text-blue-600 text-lg">Valor: {formatPrice(selectedSlot?.price)}</p>
              </div>
              <div className="mt-6">
                <Button onClick={() => window.location.reload()}>Agendar Outro Horário</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
