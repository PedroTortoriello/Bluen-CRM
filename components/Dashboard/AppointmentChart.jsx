"use client"

import { Calendar, dateFnsLocalizer } from "react-big-calendar"
import { format, parse, startOfWeek, getDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { useState } from "react"

const locales = { "pt-BR": ptBR }

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
})

export default function ScheduleCalendar({
  events,
  onCreateEvent,
  onOpenEvent
}) {
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
