import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Input, Button, addToast } from "@heroui/react";
import { authService } from "@/lib/services/auth.service";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { addToast({ title:"Ingrese email y contraseña", color:"warning" }); return; }
    setLoading(true);
    try {
      const { token, user } = await authService.login({ email, password });
      localStorage.setItem("hce_token", token);
      localStorage.setItem("hce_user", JSON.stringify(user));
      addToast({ title:`Bienvenido, ${user.nombre}`, color:"success" });
      router.push("/");
    } catch (e: unknown) {
      addToast({ title: e instanceof Error ? e.message : "Error al iniciar sesión", color:"danger" });
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <div className="text-center mb-8">
            <div className="text-4xl mb-2">🏥</div>
            <h1 className="text-2xl font-bold text-gray-900">HCE Sistema</h1>
            <p className="text-gray-500 text-sm mt-1">Inicia sesión para continuar</p>
          </div>
          <div className="space-y-4">
            <Input label="Correo electrónico" type="email" placeholder="admin@hce.com" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
            <Input label="Contraseña" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password"
              onKeyDown={e => e.key === "Enter" && handleLogin()} />
          </div>
          <Button color="primary" className="w-full mt-6" size="lg" onPress={handleLogin} isLoading={loading}>Iniciar sesión</Button>
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-500">
            <p className="font-medium mb-1">Credenciales de prueba:</p>
            <p>Email: admin@hce.com · Contraseña: admin123</p>
          </div>
          <p className="text-center text-sm text-gray-500 mt-6">
            ¿No tienes cuenta?{" "}
            <Link href="/register" className="text-blue-600 hover:underline font-medium">Crear cuenta</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
