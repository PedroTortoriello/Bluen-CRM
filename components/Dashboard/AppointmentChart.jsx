"use client"

import { Calendar, dateFnsLocalizer } from "react-big-calendar"
import { format, parse, startOfWeek, getDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { useEffect, useState } from "react"
import { supabaseAdmin } from "@/lib/supabaseAdmin" // ❗ igual usado no Dashboard

const locales = { "pt-BR": ptBR }

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
})

export default function ScheduleCalendar() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  // ---------------------------------------------
  // 🔥 Buscar agendamentos do Supabase (Admin)
  // ---------------------------------------------
  const loadAgendamentos = async () => {
    try {
      setLoading(true)

      const { data, error } = await supabaseAdmin
        .from("agendamentos")
        .select("*")
        .order("inicio", { ascending: true })

      if (error) throw error

      // Transformar no formato do react-big-calendar
      const mapped = data.map((item) => ({
        id: item.id,
        title: item.titulo,
        start: new Date(item.inicio),
        end: new Date(item.fim),
        color: item.cor || "#2563eb",
        descricao: item.descricao,
        status: item.status,
        nome_cliente: item.nome_cliente,
        email_cliente: item.email_cliente,
      }))

      setEvents(mapped)
    } catch (err) {
      console.error("Erro ao buscar agendamentos:", err.message)
    } finally {
      setLoading(false)
    }
  }

  // Carregar ao abrir a página
  useEffect(() => {
    loadAgendamentos()
  }, [])

  const handleOpenEvent = (event) => {
    alert(
      `Evento: ${event.title}\nInício: ${event.start}\nFim: ${event.end}`
    )
  }

  const handleCreateEvent = (slotInfo) => {
    alert(
      `Criar novo evento:\nInício: ${slotInfo.start}\nFim: ${slotInfo.end}`
    )
  }

  if (loading) {
    return <p className="p-4 text-gray-600">Carregando agenda...</p>
  }

  return (
    <div className="bg-white border rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">
        📅 Agenda Semanal
      </h2>

      <div style={{ height: "700px" }}>
        <Calendar
          localizer={localizer}
          events={events}
          defaultView="week"
          views={["day", "week", "month"]}
          selectable
          step={30}
          timeslots={2}
          onSelectEvent={handleOpenEvent}
          onSelectSlot={handleCreateEvent}
          popup
          eventPropGetter={(event) => ({
            style: {
              backgroundColor: event.color,
              borderRadius: "8px",
              color: "white",
              padding: "4px",
              border: "none",
            },
          })}
        />
      </div>
    </div>
  )
}
