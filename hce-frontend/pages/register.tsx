import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Input, Button, addToast } from "@heroui/react";
import { authService } from "@/lib/services/auth.service";

export default function RegisterPage() {
  const router = useRouter();
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!nombreCompleto || !email || !password || !confirm) {
      addToast({ title: "Complete todos los campos", color: "warning" });
      return;
    }
    if (password !== confirm) {
      addToast({ title: "Las contraseñas no coinciden", color: "danger" });
      return;
    }
    if (password.length < 6) {
      addToast({ title: "La contraseña debe tener al menos 6 caracteres", color: "warning" });
      return;
    }
    setLoading(true);
    try {
      const data = await authService.register({ nombreCompleto, email, password });
      localStorage.setItem("hce_token", data.access_token);
      localStorage.setItem("hce_user", JSON.stringify(data.user));
      addToast({ title: `Cuenta creada. Bienvenido, ${data.user.nombreCompleto}`, color: "success" });
      router.push("/");
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Error al crear cuenta";
      addToast({ title: msg, color: "danger" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <div className="text-center mb-8">
            <div className="text-4xl mb-2">🏥</div>
            <h1 className="text-2xl font-bold text-gray-900">Crear cuenta</h1>
            <p className="text-gray-500 text-sm mt-1">Regístrate para acceder al sistema</p>
          </div>
          <div className="space-y-4">
            <Input
              label="Nombre completo *"
              placeholder="Juan Pérez"
              value={nombreCompleto}
              onChange={(e) => setNombreCompleto(e.target.value)}
            />
            <Input
              label="Correo electrónico *"
              type="email"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Contraseña *"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Input
              label="Confirmar contraseña *"
              type="password"
              placeholder="Repite tu contraseña"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
          <Button
            color="primary"
            className="w-full mt-6"
            size="lg"
            onPress={handleRegister}
            isLoading={loading}
          >
            Crear cuenta
          </Button>
          <p className="text-center text-sm text-gray-500 mt-6">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
