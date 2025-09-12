import StaffRegister from "@/components/Staff/StaffRegister"

export default function StaffPage({ params }) {
  const { tenant } = params // pega o slug da URL
  return <StaffRegister tenantSlug={tenant} />
}