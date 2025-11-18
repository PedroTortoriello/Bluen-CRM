import { NextResponse } from "next/server"
import { db } from "@/lib/db"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
}

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders })
}

export async function GET(request, { params }) {
  try {
    const url = new URL(request.url)
    const [resource] = params.path || []

    switch (resource) {
      case "leads": {
        const { data, error } = await db.getLeads()
        if (error) throw error
        return NextResponse.json({ leads: data }, { headers: corsHeaders })
      }

      case "companies": {
        const { data, error } = await db.getCompanies()
        if (error) throw error
        return NextResponse.json({ companies: data }, { headers: corsHeaders })
      }

      default:
        return NextResponse.json({ error: "Endpoint GET inválido" }, { status: 404, headers: corsHeaders })
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders })
  }
}

export async function POST(request, { params }) {
  try {
    const [resource] = params.path || []
    const body = await request.json()

    switch (resource) {
      case "auth":
        if (body.action === "register") {
          const { data, error } = await db.registerUser(body)
          if (error) throw error
          return NextResponse.json({ message: "Conta criada com sucesso!", user: data }, { headers: corsHeaders })
        }
        if (body.action === "login") {
          const { data, error } = await db.loginUser(body)
          if (error) throw error
          return NextResponse.json(
            {
              token: "fake-jwt",
              user: { id: data.id, name: data.name, email: data.email, role: data.role }
            },
            { headers: corsHeaders }
          )
        }
        return NextResponse.json({ error: "Ação inválida em auth" }, { status: 400, headers: corsHeaders })

      case "leads": {
        const lead = { ...body, id: body.id || crypto.randomUUID(), created_at: new Date().toISOString() }
        const { data, error } = await db.upsertLead(lead)
        if (error) throw error
        return NextResponse.json({ lead: data }, { headers: corsHeaders })
      }

      default:
        return NextResponse.json({ error: "Endpoint POST inválido" }, { status: 404, headers: corsHeaders })
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders })
  }
}

export async function DELETE(request, { params }) {
  try {
    const [resource, id] = params.path || []
    if (resource === "leads" && id) {
      const { error } = await db.deleteLead(id)
      if (error) throw error
      return NextResponse.json({ message: "Lead excluído com sucesso" }, { headers: corsHeaders })
    }

    return NextResponse.json({ error: "Endpoint DELETE inválido" }, { status: 404, headers: corsHeaders })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders })
  }
}
