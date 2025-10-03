'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import { 
  Users, 
  TrendingUp, 
  Phone, 
  Mail, 
  Building2, 
  Search,
  Plus,
  Download,
  BarChart3,
  LogOut,
  Edit,
  Trash2,
  Target,
  DollarSign,
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingDown
} from 'lucide-react'
import api from '../api/api'
import KanbanBoard from '@/components/Dashboard/Kanban'


export default function CRMDashboard() {

  const [leads, setLeads] = useState([])
  const [companies, setCompanies] = useState([])
  const [metrics, setMetrics] = useState({})
  const [loading, setLoading] = useState(false)
  const [selectedLead, setSelectedLead] = useState(null)
  const [showLeadModal, setShowLeadModal] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  
  // Filters
  const [searchFilter, setSearchFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  
  // Lead form
  const [leadForm, setLeadForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    cargo: '',
    source: '',
    status: 'novo',
    notes: '',
    priority: 'medio'
  })

useEffect(() => {
  loadData();
}, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('crm_token')
      localStorage.removeItem('crm_user')
    }
    setShowLeadModal(true)
    setLeads([])
    setMetrics({})
  }

const loadData = async () => {
  setLoading(true);
  try {
    // Chama a rota API que retorna os leads do Supabase
    const res = await api.get('/api/leads');
    const leadsData = res.data;

    // Mapeia os campos da tabela "BluenSDR" para nomes amigáveis do frontend
    const mappedLeads = leadsData.map((lead) => ({
      id: lead.id,
      name: lead.nome || lead.name,
      email: lead.e_mail || lead.email,
      phone: lead.numero || lead.phone,
      company: lead.empresa || lead.company,
      cargo: lead.cargo,
      status: lead.status || 'novo',
      source: lead.source || 'site',
      notes: lead.observacoes || lead.notes,
      priority: lead.priority || 'medio',
      date: lead.data || lead.created_at,
      followUp: lead.followup,
      ticket: lead.ticket,
      whatCompanyDoes: lead.o_que_a_empresa_faz,
      customerProblem: lead.problema_do_cliente
    }));

    setLeads(mappedLeads);

    // Opcional: gerar métricas simples
    const statusCounts = mappedLeads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {});

    setMetrics({
      totalLeads: mappedLeads.length,
      statusCounts
    });

    // Se houver empresas separadas, você pode extrair assim:
    const companiesData = [...new Set(mappedLeads.map(l => l.company).filter(Boolean))];
    setCompanies(companiesData);

  } catch (error) {
    console.error("Erro ao carregar dados:", error);
  } finally {
    setLoading(false);
  }
};


  // Reload leads when filters change
  useEffect(() => {
        loadLeads()
      
  }, [])

const loadLeads = async () => {
  setLoading(true);
  try {
    const response = await api.get('/api/leads');
    const leadsData = response.data;

    const mappedLeads = leadsData.map(lead => {
      let necessidades = {};
      try {
        necessidades = lead.necessidades ? JSON.parse(lead.necessidades) : {};
      } catch (e) {
        console.error('Erro ao parsear necessidades do lead', lead.id, e);
      }

      return {
        id: lead.id,
        name: lead.Nome,
        email: lead['E-mail'],
        phone: lead['Número'],
        company: lead.Empresa,
        cargo: lead.cargo,
        date: lead.Data,
        followUp: lead.FollowUp,
        ticket: lead.Ticket,
        whatCompanyDoes: lead.o_que_a_empresa_faz,
        customerProblem: lead.problema_do_cliente,
        necessidades: necessidades
      };
    });

    setLeads(mappedLeads);
  } catch (error) {
    console.error("Erro ao carregar leads:", error);
  }
  setLoading(false);
};





  // Lead management functions
  const handleSaveLead = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      if (selectedLead) {
        // Update existing lead
        await api.request(`leads/${selectedLead.id}`, {
          method: 'PUT',
          body: JSON.stringify(leadForm)
        })
      } else {
        // Create new lead
        await api.request('leads', {
          method: 'POST',
          body: JSON.stringify(leadForm)
        })
      }
      
      setShowLeadModal(false)
      setSelectedLead(null)
      resetLeadForm()
      loadLeads()
    } catch (error) {
      alert('Erro ao salvar lead: ' + error.message)
    }
    
    setLoading(false)
  }

const getTicketStatus = (ticket) => {
  if (!ticket || ticket <= 40000) 
    return { label: 'Frio', color: 'bg-blue-500', textColor: 'text-white', icon: Clock };
  if (ticket > 40000 && ticket <= 100000) 
    return { label: 'Morno', color: 'bg-yellow-500', textColor: 'text-white', icon: Activity };
  if (ticket > 100000 && ticket <= 300000) 
    return { label: 'Quente', color: 'bg-orange-500', textColor: 'text-white', icon: TrendingUp };
  if (ticket > 300000) 
    return { label: 'Alta Prioridade', color: 'bg-red-500', textColor: 'text-white', icon: Target };

  return { label: 'Desconhecido', color: 'bg-gray-500', textColor: 'text-white', icon: AlertCircle };
};



  const handleDeleteLead = async (leadId) => {
    if (!confirm('Tem certeza que deseja excluir este lead?')) return
    
    try {
      await api.request(`leads/${leadId}`, { method: 'DELETE' })
      loadLeads()
    } catch (error) {
      alert('Erro ao excluir lead: ' + error.message)
    }
  }

  const resetLeadForm = () => {
    setLeadForm({
      name: '',
      email: '',
      phone: '',
      company: '',
      cargo: '',
      source: '',
      status: 'novo',
      notes: '',
      priority: 'medio'
    })
  }

  const openLeadModal = (lead = null) => {
    if (lead) {
      setSelectedLead(lead)
      setLeadForm(lead)
    } else {
      setSelectedLead(null)
      resetLeadForm()
    }
    setShowLeadModal(true)
  }

  // Helper functions
  const getStatusColor = (status) => {
    const colors = {
      novo: 'bg-blue-500/10 text-blue-700 border-blue-200',
      contatado: 'bg-yellow-500/10 text-yellow-700 border-yellow-200',
      qualificado: 'bg-purple-500/10 text-purple-700 border-purple-200',
      proposta: 'bg-orange-500/10 text-orange-700 border-orange-200',
      fechado: 'bg-green-500/10 text-green-700 border-green-200',
      perdido: 'bg-red-500/10 text-red-700 border-red-200'
    }
    return colors[status] || 'bg-gray-500/10 text-gray-700 border-gray-200'
  }

  const getPriorityColor = (priority) => {
    const colors = {
      baixo: 'bg-gray-100 text-gray-700',
      medio: 'bg-yellow-100 text-yellow-700',
      alto: 'bg-red-100 text-red-700'
    }
    return colors[priority] || 'bg-gray-100 text-gray-700'
  }

  const exportToCSV = () => {
    const headers = ['Nome', 'Email', 'Telefone', 'Empresa', 'Status', 'Origem']
    const csvData = leads.map(lead => [
      lead.name,
      lead.email,
      lead.phone,
      lead.company,
      lead.status,
      lead.source
    ])
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `leads_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  // Lead Modal Component
  const LeadModal = () => (
    <Dialog open={showLeadModal} onOpenChange={setShowLeadModal}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {selectedLead ? '✏️ Editar Lead' : '➕ Novo Lead'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSaveLead} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Nome *</Label>
              <Input
                value={leadForm.name}
                onChange={(e) => setLeadForm({...leadForm, name: e.target.value})}
                required
                className="border-gray-300 focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Email *</Label>
              <Input
                type="email"
                value={leadForm.email}
                onChange={(e) => setLeadForm({...leadForm, email: e.target.value})}
                required
                className="border-gray-300 focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Telefone</Label>
              <Input
                value={leadForm.phone}
                onChange={(e) => setLeadForm({...leadForm, phone: e.target.value})}
                className="border-gray-300 focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Empresa</Label>
              <Input
                value={leadForm.company}
                onChange={(e) => setLeadForm({...leadForm, company: e.target.value})}
                className="border-gray-300 focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Cargo</Label>
              <Input
                value={leadForm.cargo}
                onChange={(e) => setLeadForm({...leadForm, cargo: e.target.value})}
                className="border-gray-300 focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Origem</Label>
              <Select value={leadForm.source} onValueChange={(value) => setLeadForm({...leadForm, source: value})}>
                <SelectTrigger className="border-gray-300 focus:border-blue-500">
                  <SelectValue placeholder="Selecione a origem" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="site">🌐 Site</SelectItem>
                  <SelectItem value="linkedin">💼 LinkedIn</SelectItem>
                  <SelectItem value="email">📧 Email</SelectItem>
                  <SelectItem value="telefone">📞 Telefone</SelectItem>
                  <SelectItem value="indicacao">👥 Indicação</SelectItem>
                  <SelectItem value="n8n">🤖 N8N</SelectItem>
                  <SelectItem value="outros">📌 Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Status</Label>
              <Select value={leadForm.status} onValueChange={(value) => setLeadForm({...leadForm, status: value})}>
                <SelectTrigger className="border-gray-300 focus:border-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="novo">🆕 Novo</SelectItem>
                  <SelectItem value="contatado">📞 Contatado</SelectItem>
                  <SelectItem value="qualificado">✅ Qualificado</SelectItem>
                  <SelectItem value="proposta">📄 Proposta</SelectItem>
                  <SelectItem value="fechado">🎉 Fechado</SelectItem>
                  <SelectItem value="perdido">❌ Perdido</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Prioridade</Label>
              <Select value={leadForm.priority} onValueChange={(value) => setLeadForm({...leadForm, priority: value})}>
                <SelectTrigger className="border-gray-300 focus:border-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixo">🔵 Baixa</SelectItem>
                  <SelectItem value="medio">🟡 Média</SelectItem>
                  <SelectItem value="alto">🔴 Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">Observações</Label>
            <Textarea
              value={leadForm.notes}
              onChange={(e) => setLeadForm({...leadForm, notes: e.target.value})}
              rows={3}
              className="border-gray-300 focus:border-blue-500"
              placeholder="Adicione observações sobre este lead..."
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold"
            >
              {loading ? '⏳ Salvando...' : '💾 Salvar Lead'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowLeadModal(false)}
              className="flex-1"
            >
              ❌ Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )

// Definição fake de usuário (mock)
const user = {
  id: "123456",
  name: "João Silva",
  email: "joao.silva@example.com",
  role: "Admin",
  company: "Agência Exemplo",
  phone: "+55 (11) 99999-9999",
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      {/* Header com Gradiente */}
      <header className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 rounded-xl shadow-lg">
                  <BarChart3 className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    Bluen Painel
                  </h1>
                  <p className="text-xs text-gray-500">Sistema de Gestão de Leads</p>
                </div>
              </div>
              <Badge 
                variant="outline" 
                className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-300 text-blue-700 font-semibold"
              >
                {user.role}
              </Badge>
            </div>
            <div className="flex items-center space-x-6">
              {/* <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-gray-800">Olá, {user.name} 👋</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div> */}
              {/* <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden md:inline">Sair</span>
              </Button> */}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white shadow-sm border border-gray-200 p-1 rounded-xl">
            <TabsTrigger 
              value="dashboard"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white rounded-lg font-semibold transition-all"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger 
              value="leads"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white rounded-lg font-semibold transition-all"
            >
              <Users className="h-4 w-4 mr-2" />
              Leads
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Métricas Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow bg-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-bold text-gray-700">Total de Leads</CardTitle>
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{metrics.totalLeads || 0}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    <span className="text-green-600 font-semibold">↗ +12%</span> vs. mês anterior
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500 shadow-lg hover:shadow-xl transition-shadow bg-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-bold text-gray-700">Leads Qualificados</CardTitle>
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-purple-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{metrics.statusCounts?.qualificado || 0}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    <span className="text-green-600 font-semibold">↗ +8%</span> vs. mês anterior
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-orange-500 shadow-lg hover:shadow-xl transition-shadow bg-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-bold text-gray-700">Propostas</CardTitle>
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <DollarSign className="h-5 w-5 text-orange-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{metrics.statusCounts?.proposta || 0}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    <span className="text-green-600 font-semibold">↗ +15%</span> vs. mês anterior
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-shadow bg-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-bold text-gray-700">Fechados</CardTitle>
                  <div className="bg-green-100 p-2 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{metrics.statusCounts?.fechado || 0}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    <span className="text-green-600 font-semibold">↗ +20%</span> vs. mês anterior
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Kanban Board */}
            <Card className="shadow-lg border-0 bg-white">
              <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-blue-50">
                <CardTitle className="flex items-center text-xl font-bold text-gray-800">
                  <Target className="h-6 w-6 mr-3 text-blue-600" />
                  Pipeline de Vendas
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">Arraste os cards para mudar o status dos leads</p>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <KanbanBoard leads={leads} onStatusChange={loadLeads} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leads Tab */}
          <TabsContent value="leads" className="space-y-6">
            {/* Filters and Actions */}
            <Card className="shadow-lg border-0 bg-white">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
                    <div className="relative w-full sm:w-80">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="🔍 Buscar por nome, email ou empresa..."
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                        className="pl-10 border-gray-300 focus:border-blue-500"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full sm:w-48 border-gray-300 focus:border-blue-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">📊 Todos os Status</SelectItem>
                        <SelectItem value="novo">🆕 Novo</SelectItem>
                        <SelectItem value="contatado">📞 Contatado</SelectItem>
                        <SelectItem value="qualificado">✅ Qualificado</SelectItem>
                        <SelectItem value="proposta">📄 Proposta</SelectItem>
                        <SelectItem value="fechado">🎉 Fechado</SelectItem>
                        <SelectItem value="perdido">❌ Perdido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center gap-3 w-full lg:w-auto">
                    <Button 
                      variant="outline" 
                      onClick={exportToCSV}
                      className="flex-1 lg:flex-none border-gray-300 hover:bg-gray-50"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Exportar CSV
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Leads List */}
            <Card className="shadow-lg border-0 bg-white">
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-16 text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Carregando leads...</p>
                  </div>
                ) : leads.length === 0 ? (
                  <div className="p-16 text-center">
                    <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg font-semibold">Nenhum lead encontrado</p>
                    <p className="text-gray-400 text-sm mt-2">Comece adicionando seu primeiro lead!</p>
                    <Button 
                      onClick={() => openLeadModal()}
                      className="mt-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Lead
                    </Button>
                  </div>
                ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead className="bg-gradient-to-r from-gray-50 to-blue-50 border-b-2 border-blue-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    👤 Lead
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    🏢 Empresa
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    🎯 Necessidade
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    📊 Status
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                    ⚙️ Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leads.map((lead) => {
                  const ticketStatus = getTicketStatus(lead.ticket);
                  const StatusIcon = ticketStatus.icon;

                  return (
                    <tr key={lead.id} className="hover:bg-blue-50/50 transition-colors duration-150">
                      
                      {/* Lead */}
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-full p-2">
                            <Users className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex flex-col gap-1">
                            <div className="text-sm font-bold text-gray-900">{lead.name}</div>
                            <div className="text-xs text-gray-600 flex items-center gap-1">
                              <Mail className="h-3 w-3" /> {lead.email}
                            </div>
                            {lead.phone && (
                              <div className="text-xs text-gray-600 flex items-center gap-1">
                                <Phone className="h-3 w-3" /> {lead.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Empresa */}
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <div className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-gray-500" />
                            {lead.company || '-'}
                          </div>
                          {lead.cargo && (
                            <div className="text-xs text-gray-500">{lead.cargo}</div>
                          )}
                        </div>
                      </td>

                      {/* Necessidade */}
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-2 max-w-xs">
                          {lead.necessidades?.necessidade_principal ? (
                            <Badge className="bg-blue-100 text-blue-800 border border-blue-200 font-semibold">
                              {lead.necessidades.necessidade_principal}
                            </Badge>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                          {lead.necessidades?.detalhamento?.objetivo && (
                            <Badge className="bg-green-100 text-green-800 border border-green-200 text-xs">
                              {lead.necessidades.detalhamento.objetivo}
                            </Badge>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex flex-col gap-2">
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-semibold ${ticketStatus.color} ${ticketStatus.textColor} shadow-sm`}>
                            <StatusIcon className="h-4 w-4" />
                            {ticketStatus.label}
                          </div>
                          {lead.ticket && (
                            <span className="text-xs font-semibold text-gray-700">
                              💰 R$ {lead.ticket.toLocaleString('pt-BR')}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Ações */}
                      <td className="px-6 py-5 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => openLeadModal(lead)}
                            className="hover:bg-blue-100 hover:text-blue-700 transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDeleteLead(lead.id)}
                            className="hover:bg-red-100 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>

      {/* Modal */}
      <LeadModal />
    </div>
  )
}
