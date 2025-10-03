'use client'

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import api from '@/app/api/api'

const pipelineColumns = ['Novo', 'Qualificado', 'Proposta', 'Fechado']

function LeadCard({ lead }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: lead.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-3 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow cursor-move"
    >
      <div className="text-sm font-semibold text-gray-900 truncate">{lead.Nome}</div>
      <div className="text-xs text-gray-500 truncate">{lead.Empresa || '-'}</div>
      <div className="text-xs text-gray-500">Ticket: {lead.Ticket || '-'}</div>
    </div>
  )
}

// Droppable para cada coluna
function Column({ column, children }) {
  const { setNodeRef } = useDroppable({ id: column })

  return (
    <div
      ref={setNodeRef}
      className="flex-shrink-0 w-72 bg-white rounded-2xl shadow-md p-4 min-h-[200px]"
    >
      {children}
    </div>
  )
}

export default function KanbanBoard() {
  const [leads, setLeads] = useState([])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const res = await api.get('/api/leads')
        setLeads(res.data || [])
      } catch (err) {
        console.error(err)
      }
    }
    fetchLeads()
  }, [])

  const leadsByStatus = (status) => leads.filter((l) => (l.status || 'Novo') === status)

 const handleDragEnd = async (event) => {
  const { active, over } = event;
  if (!over) return;

  // Buscar lead arrastado pelo id
  const draggedLead = leads.find((lead) => lead.id === active.id);
  if (!draggedLead) return;

  // A nova coluna é o id do droppable (nome da coluna)
  const newStatus = over.id;

  if (draggedLead.status !== newStatus) {
    // Atualizar estado local
    setLeads((prev) =>
      prev.map((l) =>
        l.id === draggedLead.id ? { ...l, status: newStatus } : l
      )
    );

    // Atualizar no backend pelo Número do lead
    try {
      await api.patch(`/api/leads/numero/${draggedLead.numero}`, { status: newStatus })
    } catch (err) {
      console.error(err);
    }
  }
};


  return (
    <Card className="bg-gray-50">
      <CardHeader>
        <CardTitle>Pipeline de Leads</CardTitle>
      </CardHeader>
      <CardContent>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 overflow-x-auto pb-4">
            {pipelineColumns.map((column) => {
              const columnLeads = leadsByStatus(column)
              return (
                <Column key={column} column={column}>
                  <div className="flex items-center justify-between mb-4">
                    <Badge
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        column === 'Novo'
                          ? 'bg-gray-200 text-gray-800'
                          : column === 'Qualificado'
                          ? 'bg-blue-200 text-blue-800'
                          : column === 'Proposta'
                          ? 'bg-yellow-200 text-yellow-800'
                          : 'bg-green-200 text-green-800'
                      }`}
                    >
                      {column}
                    </Badge>
                    <span className="text-lg font-bold text-gray-700">{columnLeads.length}</span>
                  </div>

                  <SortableContext
                    items={columnLeads.map((l) => l.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3 min-h-[100px]">
                      {columnLeads.map((lead) => (
                        <LeadCard key={lead.id} lead={lead} />
                      ))}
                    </div>
                  </SortableContext>
                </Column>
              )
            })}
          </div>
        </DndContext>
      </CardContent>
    </Card>
  )
}
