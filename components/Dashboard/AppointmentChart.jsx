"use client"

import { Calendar, dateFnsLocalizer } from "react-big-calendar"
import { format, parse, startOfWeek, getDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { useEffect, useState } from "react"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

const locales = { "pt-BR": ptBR }

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
})

// 🔑 Conexão do Supabase
const supabase = supabaseAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function ScheduleCalendar({
  onCreateEvent,
  onOpenEvent
}) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  // 🔄 Carregar os agendamentos ao abrir o componente
  useEffect(() => {
    async function loadEvents() {
      setLoading(true)

      const { data, error } = await supabase
        .from("agendamentos")
        .select("*")
        .order("inicio", { ascending: true })

      if (error) {
        console.error("Erro ao carregar agendamentos:", error)
        setLoading(false)
        return
      }

      // 👉 Converter formato do Supabase → formato do calendário
      const mapped = data.map((item) => ({
        id: item.id,
        title: item.titulo,
        start: new Date(item.inicio),
        end: new Date(item.fim),
        color: item.cor,
        descricao: item.descricao,
        nome_cliente: item.nome_cliente,
        email_cliente: item.email_cliente,
        status: item.status,
      }))

      setEvents(mapped)
      setLoading(false)
    }

    loadEvents()
  }, [])

  if (loading) {
    return <p className="p-4">Carregando agenda...</p>
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
          onSelectEvent={onOpenEvent}
          onSelectSlot={(slot) => onCreateEvent(slot)}
          popup
          style={{ borderRadius: "12px" }}
          eventPropGetter={(event) => ({
            style: {
              backgroundColor: event.color || "#2563eb",
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
