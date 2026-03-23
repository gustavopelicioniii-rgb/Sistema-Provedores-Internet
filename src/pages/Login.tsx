import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/GlassCard";
import { GlassBackground } from "@/components/GlassBackground";
import { Wifi, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { toast } from "@/hooks/use-toast";

export default function Login() {
  const [email, setEmail] = useState("admin@provedor.com");
  const [password, setPassword] = useState("admin123");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (error: any) {
      // If API is not available, allow demo access
      if (error.message?.includes('fetch') || error.message?.includes('Failed') || error.message?.includes('NetworkError')) {
        toast({
          title: "Modo Demo",
          description: "API nao disponivel. Acessando em modo demonstracao.",
        });
        navigate("/dashboard");
      } else {
        toast({
          title: "Erro ao entrar",
          description: error.message || "Email ou senha invalidos",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 50%, #f0f4f8 100%)' }}>
      <GlassBackground />
      <GlassCard className="w-full max-w-md">
        <form onSubmit={handleLogin} className="p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-primary flex items-center justify-center mb-3">
              <Wifi className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">NetAdmin</h1>
            <p className="text-sm text-muted-foreground">Acesse sua conta para gerenciar seu provedor</p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@provedor.com"
                style={{ borderRadius: 10 }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                style={{ borderRadius: 10 }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button className="w-full" style={{ borderRadius: 10 }} type="submit" disabled={isLoading}>
              {isLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Entrando...</> : "Entrar"}
            </Button>
            <div className="flex items-center justify-between text-sm">
              <Link to="/forgot-password" className="text-primary hover:underline">Esqueci minha senha</Link>
              <Link to="/register" className="text-primary hover:underline">Criar conta</Link>
            </div>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-muted-foreground">
              Demo: admin@provedor.com / admin123
            </p>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
