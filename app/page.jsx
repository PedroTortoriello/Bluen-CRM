'use client'

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { 
  Search, 
  MapPin, 
  Star, 
  Clock, 
  Scissors, 
  User, 
  Filter,
  ChevronDown,
  Phone,
  Zap
} from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation"

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const LandingPage = () => {
  const router = useRouter()
  const [barbershops, setBarbershops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [minRating, setMinRating] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const cities = ["São Paulo", "Rio de Janeiro", "Belo Horizonte"];
  const popularServices = [
    { name: "Corte Masculino", icon: Scissors },
    { name: "Barba", icon: User },
    { name: "Corte + Barba", icon: Zap },
    { name: "Sobrancelha", icon: User }
  ];

  useEffect(() => {
    fetchBarbershops();
  }, []);

  const fetchBarbershops = async (filters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.city) params.append('city', filters.city);
      if (filters.service) params.append('service', filters.service);
      if (filters.min_rating) params.append('min_rating', filters.min_rating);
      
      const response = await axios.get(`${API}/barbershops?${params}`);
      setBarbershops(response.data);
    } catch (error) {
      console.error('Error fetching barbershops:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchBarbershops({
      city: selectedCity,
      service: searchQuery,
      min_rating: minRating
    });
  };

  const handleServiceClick = (serviceName) => {
    setSearchQuery(serviceName);
    fetchBarbershops({ service: serviceName });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <Scissors className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">BarberBook</span>
          </div>
          <nav className="hidden space-x-8 md:flex">
            <a href="#inicio" className="hover:text-primary transition-colors">Início</a>
            <a href="#como-funciona" className="hover:text-primary transition-colors">Como Funciona</a>
            <a href="#servicos" className="hover:text-primary transition-colors">Serviços</a>
          </nav>
          <Button variant="outline">Entrar</Button>
        </div>
      </header>

      {/* Hero Section */}
      <section 
        id="inicio" 
        className="relative min-h-[600px] flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('https://images.unsplash.com/photo-1747832512459-5566e6d0ee5a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHwyfHxwcm9mZXNzaW9uYWwlMjBiYXJiZXJzaG9wfGVufDB8fHx8MTc1NzY5MDAzNnww&ixlib=rb-4.1.0&q=85')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="container mx-auto px-4 text-center text-white">
          <h1 className="mb-6 text-5xl font-bold leading-tight lg:text-6xl">
            Encontre a barbearia
            <span className="block text-yellow-400">perfeita para você</span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-200">
            Agende seu horário em segundos nas melhores barbearias da sua cidade.
            Profissionais qualificados, preços transparentes.
          </p>

          {/* Search Box */}
          <div className="mx-auto max-w-4xl">
            <Card className="bg-white/95 backdrop-blur-sm shadow-2xl">
              <CardContent className="p-6">
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="md:col-span-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        placeholder="Buscar por serviço (ex: corte, barba)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-12 text-base"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <select
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="w-full h-12 pl-10 pr-8 text-base border border-input rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                      >
                        <option value="">Todas as cidades</option>
                        {cities.map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <Button 
                    onClick={handleSearch}
                    className="h-12 text-base font-medium"
                    disabled={loading}
                  >
                    {loading ? "Buscando..." : "Buscar"}
                  </Button>
                </div>

                {/* Filters Toggle */}
                <div className="mt-4 flex items-center justify-between">
                  <Button
                    variant="ghost"
                    onClick={() => setShowFilters(!showFilters)}
                    className="text-sm"
                  >
                    <Filter className="mr-2 h-4 w-4" />
                    Filtros avançados
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </div>

                {/* Advanced Filters */}
                {showFilters && (
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Avaliação mínima</label>
                      <select
                        value={minRating}
                        onChange={(e) => setMinRating(e.target.value)}
                        className="mt-1 w-full h-10 px-3 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                      >
                        <option value="">Qualquer avaliação</option>
                        <option value="4">4+ estrelas</option>
                        <option value="4.5">4.5+ estrelas</option>
                      </select>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Popular Services */}
      <section id="servicos" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Serviços Populares</h2>
            <p className="text-gray-600 text-lg">Os serviços mais procurados nas nossas barbearias</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {popularServices.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card 
                  key={index}
                  className="cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                  onClick={() => handleServiceClick(service.name)}
                >
                  <CardContent className="p-6 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg">{service.name}</h3>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Barbershops Results */}
      {barbershops.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold">
                {barbershops.length} barbearia{barbershops.length !== 1 ? 's' : ''} encontrada{barbershops.length !== 1 ? 's' : ''}
              </h2>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {barbershops.map((barbershop) => (
                <Card 
                  key={barbershop.id}
                  className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                  onClick={() => router.push(`/barbershop/${barbershop.id}`)}
                >
                  <div className="relative h-48">
                    <img
                      src={barbershop.photos[0]}
                      alt={barbershop.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3 bg-white rounded-full px-2 py-1 flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{barbershop.rating}</span>
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-2">{barbershop.name}</h3>
                    <p className="text-gray-600 mb-3 line-clamp-2">{barbershop.description}</p>
                    
                    <div className="flex items-center text-gray-500 mb-2">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="text-sm">{barbershop.location.address}, {barbershop.location.city}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-500">
                        <span className="text-sm font-medium text-primary">{barbershop.price_range}</span>
                      </div>
                      <div className="flex items-center text-gray-500">
                        <span className="text-sm">({barbershop.review_count} avaliações)</span>
                      </div>
                    </div>
                    
                    <Button className="w-full mt-4">
                      Ver Detalhes e Agendar
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How it Works */}
      <section id="como-funciona" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Como Funciona</h2>
            <p className="text-gray-600 text-lg">Agendar nunca foi tão fácil</p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary text-white text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-bold mb-4">Busque</h3>
              <p className="text-gray-600">Encontre a barbearia perfeita na sua região usando nossos filtros inteligentes.</p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary text-white text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-bold mb-4">Agende</h3>
              <p className="text-gray-600">Escolha o serviço, profissional e horário que melhor se adequa à sua agenda.</p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary text-white text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-bold mb-4">Relaxe</h3>
              <p className="text-gray-600">Receba lembretes automáticos e aproveite seu momento de cuidado pessoal.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">500+</div>
              <div className="text-gray-600">Barbearias Parceiras</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">50k+</div>
              <div className="text-gray-600">Agendamentos Realizados</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">4.8</div>
              <div className="text-gray-600">Avaliação Média</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">24h</div>
              <div className="text-gray-600">Agendamento Online</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Scissors className="h-8 w-8 text-yellow-400" />
                <span className="text-2xl font-bold">BarberBook</span>
              </div>
              <p className="text-gray-400">
                A plataforma que conecta você às melhores barbearias da sua cidade.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Para Clientes</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Como Agendar</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Encontrar Barbearias</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Avaliações</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Para Barbearias</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Cadastrar Barbearia</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Gerenciar Agenda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Planos</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Contato</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  (11) 9999-9999
                </li>
                <li>suporte@barberbook.com</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 BarberBook. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;