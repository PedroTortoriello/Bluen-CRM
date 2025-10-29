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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Logo from './Logo.png'
import {
  Users,
  TrendingUp,
  Phone,
  Mail,
  Building2,
  Search,
  Plus,
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
  CalendarIcon,
  KanbanSquare
} from 'lucide-react'
import KanbanBoard from '@/components/Dashboard/Kanban'
import Image from 'next/image'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import InboxChat from '@/components/Dashboard/InboxChat'

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
  const [dateRange, setDateRange] = useState({ from: null, to: null })

  const handleDateChange = (range) => {
    setDateRange(range)
    if (range?.from && range?.to) loadLeads(range.from, range.to)
  }

  const handleDateChange2 = (range) => {
    setDateRange(range)
    if (range?.from && range?.to) loadData(range.from, range.to)
  }

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
    loadData()
  }, [])

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('crm_token')
      localStorage.removeItem('crm_user')
    }
    setLeads([])
    setMetrics({})
  }

    // 🔹 Carregar todos os dados (métricas, leads, empresas)
/** @param {Date} [fromDate] @param {Date} [toDate] */
const loadData = async (fromDate, toDate) => {
  setLoading(true)
  try {
    let query = supabaseAdmin
      .from('BluenSDR')
      .select('*')
      .order('created_at', { ascending: false })

    // 🧩 Se datas forem passadas, aplica o filtro
    if (fromDate && toDate) {
      query = query
        .gte('created_at', fromDate.toISOString())
        .lte('created_at', toDate.toISOString())
    }

    const { data: leadsData, error } = await query
    if (error) throw error

    const mappedLeads = leadsData.map((lead) => ({
      id: lead.id,
      name: lead['Nome'] || '—',
      email: lead['E-mail'] || '—',
      phone: lead['numero'] || '—',
      company: lead['Empresa'] || '—',
      cargo: lead['cargo'] || '—',
      status: lead['status'] || 'Novo',
      notes: lead['observacoes'] || '—',
      followUp: lead['FollowUp'] || false,
      date: lead['Data'] || lead['created_at'],
      ticket: lead['Ticket'] || null,
      whatCompanyDoes: lead['o_que_a_empresa_faz'] || '—',
      customerProblem: lead['problema_do_cliente'] || '—',
      needs: lead['necessidades'] || null,
    }))

    setLeads(mappedLeads)

    // 🧮 Recalcula métricas com base no filtro
    const statusCounts = mappedLeads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1
      return acc
    }, {})

    setMetrics({
      totalLeads: mappedLeads.length,
      statusCounts,
    })

    const companiesData = [...new Set(mappedLeads.map((l) => l.company).filter(Boolean))]
    setCompanies(companiesData)
  } catch (error) {
    console.error('Erro ao carregar leads:', error.message)
  } finally {
    setLoading(false)
  }
}


/** @param {Date} [fromDate] @param {Date} [toDate] */
const loadLeads = async (fromDate, toDate) => {
  setLoading(true)
  try {
    let query = supabaseAdmin
      .from('BluenSDR')
      .select('*')
      .order('created_at', { ascending: false })

    if (fromDate && toDate) {
      query = query
        .gte('created_at', fromDate.toISOString())
        .lte('created_at', toDate.toISOString())
    }

    const { data, error } = await query
    if (error) throw error

  const mappedLeads = data.map((lead) => {
  let necessidades = null
  let necessidade_principal = null
  let servico_interesse = null
  let detalhamento = null

  if (lead.necessidades) {
    try {
      // remove aspas extras externas, se existirem
      let cleaned = lead.necessidades.trim()

      // caso venha como "\"{...}\"", remove aspas do início e fim
      if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
        cleaned = cleaned.slice(1, -1)
      }

      // tenta fazer o primeiro parse
      let parsed = JSON.parse(cleaned)

      // se ainda assim for string (dupla codificação), parse de novo
      if (typeof parsed === 'string') {
        parsed = JSON.parse(parsed)
      }

      necessidades = parsed
      necessidade_principal = parsed.necessidade_principal || null
      servico_interesse = parsed.servico_interesse || null
      detalhamento = parsed.detalhamento || null
    } catch (e) {
      console.warn('Erro ao parsear necessidades:', e.message, lead.necessidades)
    }
  }

  return {
    id: lead.id,
    name: lead['Nome'] || '—',
    email: lead['E-mail'] || '—',
    phone: lead['numero'] || '—',
    company: lead['Empresa'] || '—',
    cargo: lead['cargo'] || '—',
    status: lead['status'] || 'Novo',
    followUp: lead['FollowUp'] || false,
    date: lead['Data'] || lead['created_at'],
    ticket: lead['Ticket'] || null,
    whatCompanyDoes: lead['o_que_a_empresa_faz'] || '—',
    customerProblem: lead['problema_do_cliente'] || '—',
    necessidades,
    necessidade_principal,
    servico_interesse,
    detalhamento,
  }
})


    setLeads(mappedLeads)
  } catch (error) {
    console.error('Erro ao carregar leads filtrados:', error.message)
  } finally {
    setLoading(false)
  }
}



  const handleSaveLead = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (selectedLead) {
        const { error } = await supabaseAdmin
          .from('BluenSDR')
          .update({
            nome: leadForm.name,
            e_mail: leadForm.email,
            numero: leadForm.phone,
            empresa: leadForm.company,
            cargo: leadForm.cargo,
            source: leadForm.source,
            status: leadForm.status,
            observacoes: leadForm.notes,
            priority: leadForm.priority,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedLead.id)

        if (error) throw error
      } else {
        const { error } = await supabaseAdmin.from('BluenSDR').insert({
          nome: leadForm.name,
          e_mail: leadForm.email,
          numero: leadForm.phone,
          empresa: leadForm.company,
          cargo: leadForm.cargo,
          source: leadForm.source,
          status: leadForm.status,
          observacoes: leadForm.notes,
          priority: leadForm.priority,
          created_at: new Date().toISOString()
        })

        if (error) throw error
      }

      setShowLeadModal(false)
      setSelectedLead(null)
      resetLeadForm()
      loadData()
    } catch (error) {
      alert('Erro ao salvar lead: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteLead = async (leadId) => {
    if (!confirm('Tem certeza que deseja excluir este lead?')) return

    try {
      const { error } = await supabaseAdmin.from('BluenSDR').delete().eq('id', leadId)
      if (error) throw error
      loadLeads()
    } catch (error) {
      alert('Erro ao excluir lead: ' + error.message)
    }
  }

  const getTicketStatus = (ticket) => {
    if (!ticket || ticket <= 40000)
      return { label: 'Frio', color: 'bg-blue-500', textColor: 'text-white', icon: Clock }
    if (ticket > 40000 && ticket <= 100000)
      return { label: 'Morno', color: 'bg-yellow-500', textColor: 'text-white', icon: Activity }
    if (ticket > 100000 && ticket <= 300000)
      return { label: 'Quente', color: 'bg-orange-500', textColor: 'text-white', icon: TrendingUp }
    if (ticket > 300000)
      return { label: 'Alta Prioridade', color: 'bg-red-500', textColor: 'text-white', icon: Target }

    return { label: 'Sem Faturamento', color: 'bg-gray-500', textColor: 'text-white', icon: AlertCircle }
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
            {['name', 'email', 'phone', 'company', 'cargo'].map((field, i) => (
              <div key={i} className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700 capitalize">{field}</Label>
                <Input
                  type={field === 'email' ? 'email' : 'text'}
                  value={leadForm[field]}
                  onChange={(e) => setLeadForm({ ...leadForm, [field]: e.target.value })}
                  required={['name', 'email'].includes(field)}
                  className="border-gray-300 focus:border-blue-500"
                />
              </div>
            ))}
            <div className="space-y-2">
              <Label>Origem</Label>
              <Select value={leadForm.source} onValueChange={(v) => setLeadForm({ ...leadForm, source: v })}>
                <SelectTrigger><SelectValue placeholder="Origem" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="site">🌐 Site</SelectItem>
                  <SelectItem value="linkedin">💼 LinkedIn</SelectItem>
                  <SelectItem value="email">📧 Email</SelectItem>
                  <SelectItem value="telefone">📞 Telefone</SelectItem>
                  <SelectItem value="indicacao">👥 Indicação</SelectItem>
                  <SelectItem value="n8n">🤖 N8N</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={leadForm.status} onValueChange={(v) => setLeadForm({ ...leadForm, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
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
          </div>

          <div>
            <Label>Observações</Label>
            <Textarea
              value={leadForm.notes}
              onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })}
              placeholder="Adicione observações sobre este lead..."
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
            <Button type="button" variant="outline" className="flex-1" onClick={() => setShowLeadModal(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
        <header className="bg-white border-b shadow-sm sticky top-0 z-50">
          <div className="max-w-9xl mx-auto px-6 py-4 flex items-center justify-between">
            {/* 🔹 Logo à esquerda */}
            <div className="flex items-center gap-3">
              <Image src={Logo} alt="Logo" width={150} height={150} className="cursor-pointer" />
            </div>

            {/* 🔹 Botão à direita */}
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center gap-2 border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600 transition-all"
            >
              <LogOut className="h-4 w-4" /> 
              <span className="font-medium">Sair</span>
            </Button>
          </div>
        </header>

      <main className="max-w-9xl mx-auto px-6 py-10 space-y-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 bg-white border rounded-xl shadow-sm">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <BarChart3 className="h-4 w-4 mr-2" /> Dashboard
            </TabsTrigger>
            <TabsTrigger value="leads" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Users className="h-4 w-4 mr-2" /> Leads
            </TabsTrigger>
            <TabsTrigger value="kanban" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
             <KanbanSquare className="w-4 h-4" /> KanBan
            </TabsTrigger>
            <TabsTrigger value="inbox" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              💬 Caixa de Entrada
            </TabsTrigger>
          </TabsList>

            {/* ✅ DASHBOARD TAB */}
            <TabsContent value="dashboard" className="space-y-6">

              {/* 🔹 Filtro de Datas */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-gray-200 rounded-xl shadow-sm p-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-700">📅 Período de Análise</h2>
                  <p className="text-sm text-gray-500">Selecione um intervalo de tempo para atualizar os dados do dashboard.</p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {/* Opções rápidas */}
                  {[
                    { label: 'Hoje', range: { from: new Date(), to: new Date() } },
                    { label: 'Ontem', range: { from: new Date(Date.now() - 86400000), to: new Date(Date.now() - 86400000) } },
                    { label: 'Últimos 7 dias', range: { from: new Date(Date.now() - 6 * 86400000), to: new Date() } },
                    { label: 'Últimos 30 dias', range: { from: new Date(Date.now() - 29 * 86400000), to: new Date() } },
                  ].map((opt) => (
                    <Button
                      key={opt.label}
                      variant="outline"
                      size="sm"
                      onClick={() => handleDateChange2(opt.range)}
                      className="text-sm"
                    >
                      {opt.label}
                    </Button>
                  ))}

                  {/* Calendário personalizado */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="justify-start text-left font-normal border-gray-300"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from && dateRange?.to
                          ? `${format(dateRange.from, 'dd/MM/yyyy')} - ${format(dateRange.to, 'dd/MM/yyyy')}`
                          : 'Selecionar período'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2" align="end">
                      <Calendar
                        initialFocus
                        mode="range"
                        selected={dateRange}
                        onSelect={handleDateChange}
                        locale={ptBR}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* 🔹 Cards de Métricas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 bg-white rounded-xl">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-semibold text-gray-700">Total de Leads</CardTitle>
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

                <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 bg-white rounded-xl">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-semibold text-gray-700">Leads Qualificados</CardTitle>
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

                <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 bg-white rounded-xl">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-semibold text-gray-700">Propostas</CardTitle>
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

                <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 bg-white rounded-xl">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-semibold text-gray-700">Fechados</CardTitle>
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

            </TabsContent>


          {/* ✅ LEADS TAB */}
          <TabsContent value="leads" className="space-y-6">
            {/* Filtros */}
            <Card className="shadow-sm border">
              <CardContent className="p-6 space-y-4">
                <div className="flex flex-col lg:flex-row justify-between gap-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative sm:w-80">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Buscar por nome, email ou empresa"
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="sm:w-48"><SelectValue placeholder="Status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="novo">Novo</SelectItem>
                        <SelectItem value="contatado">Contatado</SelectItem>
                        <SelectItem value="qualificado">Qualificado</SelectItem>
                        <SelectItem value="proposta">Proposta</SelectItem>
                        <SelectItem value="fechado">Fechado</SelectItem>
                        <SelectItem value="perdido">Perdido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {/* Opções rápidas */}
                  {[
                    { label: 'Hoje', range: { from: new Date(), to: new Date() } },
                    { label: 'Ontem', range: { from: new Date(Date.now() - 86400000), to: new Date(Date.now() - 86400000) } },
                    { label: 'Últimos 7 dias', range: { from: new Date(Date.now() - 6 * 86400000), to: new Date() } },
                    { label: 'Últimos 30 dias', range: { from: new Date(Date.now() - 29 * 86400000), to: new Date() } },
                  ].map((opt) => (
                    <Button
                      key={opt.label}
                      variant="outline"
                      size="sm"
                      onClick={() => handleDateChange2(opt.range)}
                      className="text-sm"
                    >
                      {opt.label}
                    </Button>
                  ))}

                  {/* Calendário personalizado */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="justify-start text-left font-normal border-gray-300"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from && dateRange?.to
                          ? `${format(dateRange.from, 'dd/MM/yyyy')} - ${format(dateRange.to, 'dd/MM/yyyy')}`
                          : 'Selecionar período'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2" align="end">
                      <Calendar
                        initialFocus
                        mode="range"
                        selected={dateRange}
                        onSelect={handleDateChange}
                        locale={ptBR}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Leads */}
            <Card className="shadow-sm border">
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-16 text-center text-gray-600">Carregando leads...</div>
                ) : leads.length === 0 ? (
                  <div className="p-16 text-center">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">Nenhum lead encontrado</p>
                    <Button onClick={() => openLeadModal()} className="mt-4 bg-blue-600 text-white">
                      <Plus className="h-4 w-4 mr-2" /> Adicionar Lead
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100 border-b text-xs uppercase tracking-wide text-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left">Lead</th>
                          <th className="px-6 py-3 text-left">Empresa</th>
                          <th className="px-6 py-3 text-left">Necessidade</th>
                          <th className="px-6 py-3 text-left">Status</th>
                          <th className="px-6 py-3 text-center">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {leads.map((lead) => {
                          const ticketStatus = getTicketStatus(lead.ticket)
                          const Icon = ticketStatus.icon
                          return (
                            <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="font-semibold">{lead.name}</div>
                                <div className="text-xs text-gray-500">{lead.Email}</div>
                              </td>
                              <td className="px-6 py-4">{lead.company || '-'}</td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                <Badge>{lead.problema_do_cliente || '-'}</Badge>
                              </td>
                              <td className="px-6 py-4">
                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${ticketStatus.color} ${ticketStatus.textColor}`}>
                                  <Icon className="h-4 w-4" />
                                  {ticketStatus.label}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <Button variant="ghost" onClick={() => openLeadModal(lead)}>
                                  <Edit className="h-4 w-4 text-blue-600" />
                                </Button>
                                <Button variant="ghost" onClick={() => handleDeleteLead(lead.id)}>
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inbox">
            <InboxChat />
          </TabsContent>

          <TabsContent value="kanban">
            <KanbanBoard leads={leads} onStatusChange={loadLeads} />
          </TabsContent>
        </Tabs>
      </main>

      <LeadModal />
    </div>
  )
}
