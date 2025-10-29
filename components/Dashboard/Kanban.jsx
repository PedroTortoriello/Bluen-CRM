'use client'

import { useState, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MoreHorizontal, Target, X } from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

const PIPELINE_COLUMNS = ['Novo', 'Qualificado', 'Proposta', 'Fechado']

// ===============================
// 🧩 LEAD CARD
// ===============================
function LeadCard({ lead }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: lead.id })
  const [open, setOpen] = useState(false)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || '150ms ease',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative group bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing transition-all"
    >
      <div className="space-y-1">
        <h3 className="font-semibold text-gray-900 text-sm truncate">{lead.Nome}</h3>
        <p className="text-xs text-gray-500">{lead.Empresa || '-'}</p>
        <p className="text-xs text-gray-500">🎯 Ticket: {lead.Ticket || '-'}</p>
      </div>

      <button
        onClick={() => setOpen(!open)}
        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-blue-600 transition"
      >
        <MoreHorizontal size={16} />
      </button>

      {open && (
        <div className="absolute z-10 top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs text-gray-600">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-gray-800">Detalhes</span>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          </div>
          <p><strong>Email:</strong> {lead.Email || '—'}</p>
          <p><strong>Empresa:</strong> {lead.Empresa || '—'}</p>
          <p><strong>Telefone:</strong> {lead.numero || lead.phone || '—'}</p>
          <p><strong>Status:</strong> {lead.status || '—'}</p>
          {lead.observacoes && (
            <p className="mt-1 text-gray-500"><strong>Obs:</strong> {lead.observacoes}</p>
          )}
        </div>
      )}
    </div>
  )
}

// ===============================
// 🧱 COLUNA DO PIPELINE
// ===============================
function PipelineColumn({ id, leads, children }) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-w-[280px] max-w-[350px] bg-gray-50 border rounded-2xl p-4 shadow-sm transition-all ${
        isOver ? 'bg-blue-50 border-blue-300 shadow-md' : 'border-gray-100'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <Badge
          className={`px-3 py-1 rounded-full text-sm font-semibold ${
            id === 'Novo'
              ? 'bg-gray-200 text-gray-800'
              : id === 'Qualificado'
              ? 'bg-blue-200 text-blue-800'
              : id === 'Proposta'
              ? 'bg-yellow-200 text-yellow-800'
              : 'bg-green-200 text-green-800'
          }`}
        >
          {id}
        </Badge>
        <span className="text-sm font-bold text-gray-600">{leads.length}</span>
      </div>
      <div className="space-y-3 min-h-[200px]">{children}</div>
    </div>
  )
}

// ===============================
// 🚀 KANBAN BOARD
// ===============================
export default function KanbanBoard() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  // 🔹 Carrega leads do Supabase
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const { data, error } = await supabaseAdmin
          .from('BluenSDR')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        setLeads(data || [])
      } catch (err) {
        console.error('Erro ao carregar leads:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchLeads()
  }, [])

  const leadsByStatus = (status) => leads.filter((l) => (l.status || 'Novo') === status)

  // 🔹 Atualiza status ao arrastar
  const handleDragEnd = async (event) => {
    const { active, over } = event
    if (!over) return

    const draggedLead = leads.find((lead) => lead.id === active.id)
    if (!draggedLead || draggedLead.status === over.id) return

    // Atualiza localmente
    setLeads((prev) =>
      prev.map((l) => (l.id === draggedLead.id ? { ...l, status: over.id } : l))
    )

    // Atualiza no Supabase
    try {
      const { error } = await supabaseAdmin
        .from('BluenSDR')
        .update({ status: over.id })
        .eq('id', draggedLead.id)

      if (error) throw error
    } catch (err) {
      console.error('Erro ao atualizar lead:', err)
    }
  }

  return (
    <Card className="border border-gray-100 bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-[1600px] mx-auto">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-gray-50 border-b py-5 px-6">
        <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xl font-bold text-gray-800">
          <div className="flex items-center">
            <Target className="h-6 w-6 mr-2 text-blue-600" />
            Pipeline de Vendas
          </div>
          <p className="text-sm text-gray-600 font-normal mt-1 sm:mt-0">
            Arraste os cards entre estágios
          </p>
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-6 pb-8 px-6">
        {loading ? (
          <div className="text-center text-gray-500 py-10 text-sm">
            Carregando leads...
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <div className="flex flex-wrap justify-between gap-6 w-full">
              {PIPELINE_COLUMNS.map((column) => (
                <SortableContext
                  key={column}
                  items={leadsByStatus(column).map((l) => l.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <PipelineColumn id={column} leads={leadsByStatus(column)}>
                    {leadsByStatus(column).map((lead) => (
                      <LeadCard key={lead.id} lead={lead} />
                    ))}
                  </PipelineColumn>
                </SortableContext>
              ))}
            </div>
          </DndContext>
        )}
      </CardContent>
    </Card>
  )
}
