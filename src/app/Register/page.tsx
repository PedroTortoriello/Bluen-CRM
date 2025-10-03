import RegisterForm from "@/components/Auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <RegisterForm registerForm={undefined} setRegisterForm={undefined} handleRegister={undefined} loading={undefined} switchToLogin={undefined} />
    </div>
  );
}
