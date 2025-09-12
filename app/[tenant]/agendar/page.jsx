'use client'

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Star, 
  MapPin, 
  Clock, 
  Phone, 
  Instagram,
  Scissors,
  User,
  Calendar,
  X
} from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation"
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
import { db } from "@/lib/db" // ou onde você salvou as funções
const BarbershopDetails = () => {
  const { id } = useParams();
  const router = useRouter()
  const [barbershop, setBarbershop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
    "17:00", "17:30", "18:00", "18:30"
  ];

  useEffect(() => {
    fetchBarbershop();
  }, [id]);



const fetchBarbershop = async () => {
  try {
    // 1. Buscar tenant pela slug (ou id, depende de como você guarda no banco)
    const { data: tenant, error: tenantError } = await db.getTenant("tortoriello-barbearia")
    if (tenantError || !tenant) throw tenantError || new Error("Tenant não encontrado")

    // 2. Buscar serviços
    const { data: services, error: servicesError } = await db.getServices(tenant.id)
    if (servicesError) throw servicesError

    // 3. Buscar staff
    const { data: staff, error: staffError } = await db.getStaff(tenant.id)
    if (staffError) throw staffError

    // Montar objeto no formato que sua tela espera
    const barbershopData = {
      id: tenant.id,
      name: tenant.name,
      description: tenant.description,
      rating: tenant.rating || 5,
      review_count: tenant.review_count || 0,
      location: {
        address: tenant.address,
        city: tenant.city
      },
      photos: tenant.photos || [],
      phone: tenant.phone,
      instagram: tenant.instagram,
      working_hours: tenant.working_hours,
      services,
      employees: staff.map(s => ({
        id: s.id,
        name: s.name,
        bio: s.bio,
        photo_url: s.photo_url,
        services: s.staff_services.map(ss => ss.service_id)
      }))
    }

    setBarbershop(barbershopData)
  } catch (error) {
    console.error("Erro ao carregar barbearia:", error)
  } finally {
    setLoading(false)
  }
}

  const formatWorkingHours = (hours) => {
    if (!hours) return "Fechado";
    return `${hours.open} - ${hours.close}`;
  };

  const handleBooking = () => {
    setShowBookingModal(true);
  };

  const handleConfirmBooking = () => {
    // Here you would normally send the booking to the backend
    alert(`Agendamento confirmado!\
\
Serviço: ${selectedService?.name}\
Profissional: ${selectedEmployee?.name}\
Data: ${selectedDate}\
Horário: ${selectedTime}`);
    setShowBookingModal(false);
    // Reset form
    setSelectedService(null);
    setSelectedEmployee(null);
    setSelectedDate("");
    setSelectedTime("");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!barbershop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Barbearia não encontrada</h2>
          <Button onClick={() => router.push('/')}>Voltar ao início</Button>
        </div>
      </div>
    );
  }

  const availableEmployees = selectedService 
    ? barbershop.employees.filter(emp => emp.services.includes(selectedService.id))
    : barbershop.employees;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar</span>
            </Button>
            <div className="flex items-center space-x-2">
              <Scissors className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-primary">BarberBook</span>
            </div>
          </div>
          <Button onClick={handleBooking}>Agendar Agora</Button>
        </div>
      </header>

      {/* Hero Section with Photos */}
      {/* <section className="relative">
        <div className="grid md:grid-cols-2 gap-2 h-96">
          <div className="relative overflow-hidden rounded-lg">
            <img
              src={barbershop.photos[0]}
              alt={barbershop.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid gap-2 h-full">
            {barbershop.photos.slice(1, 3).map((photo, index) => (
              <div key={index} className="relative overflow-hidden rounded-lg">
                <img
                  src={photo}
                  alt={`${barbershop.name} - ${index + 2}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section> */}

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Info */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{barbershop.name}</h1>
                  <div className="flex items-center space-x-4 text-gray-600 mb-2">
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-yellow-400 fill-current mr-1" />
                      <span className="font-medium">{barbershop.rating}</span>
                      <span className="ml-1">({barbershop.review_count} avaliações)</span>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span>{barbershop.location.address}, {barbershop.location.city}</span>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-700 leading-relaxed">{barbershop.description}</p>
            </div>

            {/* Services */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Scissors className="h-5 w-5 mr-2" />
                  Serviços
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {barbershop.services.map((service) => (
                    <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div>
                        <h4 className="font-medium">{service.name}</h4>
                        <p className="text-sm text-gray-600">{service.description}</p>
                        <div className="flex items-center mt-1 text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{service.duration_minutes} min</span>
                        </div>
                      </div>
                      <div className="text-right">
                       <div className="text-xl font-bold text-primary">
                          R$ {(service.price_cents / 100).toFixed(2)}
                        </div>

                        <Button 
                          size="sm" 
                          onClick={() => {
                            setSelectedService(service);
                            handleBooking();
                          }}
                        >
                          Agendar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Team */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Nossa Equipe
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {barbershop.employees.map((employee) => (
                    <div key={employee.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                      {/* <img
                        src={employee.photo_url}
                        alt={employee.name}
                        className="w-16 h-16 rounded-full object-cover"
                      /> */}
                      <div className="flex-1">
                        <h4 className="font-medium">{employee.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{employee.bio}</p>
                        <div className="flex flex-wrap gap-1">
                          {employee.services.map((serviceId) => {
                            const service = barbershop.services.find(s => s.id === serviceId);
                            return service ? (
                              <span key={serviceId} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                {service.name}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Booking */}
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Agendar Horário</CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handleBooking}
                  className="w-full mb-4"
                  size="lg"
                >
                  <Calendar className="h-5 w-5 mr-2" />
                  Escolher Horário
                </Button>
                
                <div className="text-center text-sm text-gray-600">
                  Agendamento online 24h
                </div>
              </CardContent>
            </Card>

            {/* Info */}
            <Card>
              <CardHeader>
                <CardTitle>Informações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {barbershop.phone && (
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 mr-3 text-gray-400" />
                    <span>{barbershop.phone}</span>
                  </div>
                )}
                
                {barbershop.instagram && (
                  <div className="flex items-center">
                    <Instagram className="h-5 w-5 mr-3 text-gray-400" />
                    <span>{barbershop.instagram}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Working Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Horário de Funcionamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Segunda</span>
                    <span>{formatWorkingHours(barbershop.working_hours?.monday)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Terça</span>
                    <span>{formatWorkingHours(barbershop.working_hours?.tuesday)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Quarta</span>
                    <span>{formatWorkingHours(barbershop.working_hours?.wednesday)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Quinta</span>
                    <span>{formatWorkingHours(barbershop.working_hours?.thursday)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sexta</span>
                    <span>{formatWorkingHours(barbershop.working_hours?.friday)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sábado</span>
                    <span>{formatWorkingHours(barbershop.working_hours?.saturday)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Domingo</span>
                    <span>{formatWorkingHours(barbershop.working_hours?.sunday)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold">Agendar Horário</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBookingModal(false)}
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Service Selection */}
              <div>
                <h3 className="text-lg font-medium mb-3">1. Escolha o serviço</h3>
                <div className="grid gap-3">
                  {barbershop.services.map((service) => (
                    <div
                      key={service.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedService?.id === service.id
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedService(service)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{service.name}</h4>
                          <div className="flex items-center mt-1 text-sm text-gray-500">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{service.duration_minutes} min</span>
                          </div>
                        </div>
                      <div className="text-lg font-bold text-primary">
                        R$ {(service.price_cents / 100).toFixed(2)}
                      </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Employee Selection */}
              {selectedService && (
                <div>
                  <h3 className="text-lg font-medium mb-3">2. Escolha o profissional</h3>
                  <div className="grid gap-3">
                    {availableEmployees.map((employee) => (
                      <div
                        key={employee.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedEmployee?.id === employee.id
                            ? 'border-primary bg-primary/5'
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedEmployee(employee)}
                      >
                        <div className="flex items-center space-x-3">
                          {/* <img
                            src={employee.photo_url}
                            alt={employee.name}
                            className="w-12 h-12 rounded-full object-cover"
                          /> */}
                          <div>
                            <h4 className="font-medium">{employee.name}</h4>
                            <p className="text-sm text-gray-600">{employee.bio}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Date Selection */}
              {selectedEmployee && (
                <div>
                  <h3 className="text-lg font-medium mb-3">3. Escolha a data</h3>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              )}

              {/* Time Selection */}
              {selectedDate && (
                <div>
                  <h3 className="text-lg font-medium mb-3">4. Escolha o horário</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {timeSlots.map((time) => (
                      <button
                        key={time}
                        className={`p-3 border rounded-lg text-sm transition-colors ${
                          selectedTime === time
                            ? 'border-primary bg-primary text-white'
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedTime(time)}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Confirm Button */}
              {selectedService && selectedEmployee && selectedDate && selectedTime && (
                <div className="pt-4 border-t">
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <h4 className="font-medium mb-2">Resumo do agendamento:</h4>
                    <div className="text-sm space-y-1 text-gray-600">
                      <div>Serviço: <span className="font-medium">{selectedService.name}</span></div>
                      <div>Profissional: <span className="font-medium">{selectedEmployee.name}</span></div>
                      <div>Data: <span className="font-medium">{selectedDate}</span></div>
                      <div>Horário: <span className="font-medium">{selectedTime}</span></div>
                      <div className="text-lg font-bold text-primary">
                        Total: R$ {(selectedService.price_cents / 100).toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <Button 
                    onClick={handleConfirmBooking}
                    className="w-full"
                    size="lg"
                  >
                    Confirmar Agendamento
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BarbershopDetails;