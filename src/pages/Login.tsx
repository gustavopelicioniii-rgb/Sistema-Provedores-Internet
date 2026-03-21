import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/GlassCard";
import { GlassBackground } from "@/components/GlassBackground";
import { Wifi } from "lucide-react";

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 50%, #f0f4f8 100%)' }}>
      <GlassBackground />
      <GlassCard className="w-full max-w-md">
        <div className="p-8 space-y-6">
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
              <Input id="email" type="email" placeholder="admin@provedor.com" style={{ borderRadius: 10 }} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" placeholder="••••••••" style={{ borderRadius: 10 }} />
            </div>
            <Button className="w-full" style={{ borderRadius: 10 }} asChild>
              <Link to="/dashboard">Entrar</Link>
            </Button>
            <div className="flex items-center justify-between text-sm">
              <Link to="/forgot-password" className="text-primary hover:underline">Esqueci minha senha</Link>
              <Link to="/register" className="text-primary hover:underline">Criar conta</Link>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
