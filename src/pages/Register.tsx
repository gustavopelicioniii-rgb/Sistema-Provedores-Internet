import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/shared/GlassCard";
import { GlassBackground } from "@/components/shared/GlassBackground";
import { Wifi } from "lucide-react";

export default function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 50%, #f0f4f8 100%)' }}>
      <GlassBackground />
      <GlassCard className="w-full max-w-md">
        <div className="p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-primary flex items-center justify-center mb-3">
              <Wifi className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">Criar Conta</h1>
            <p className="text-sm text-muted-foreground">Cadastre seu provedor no NetAdmin</p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Nome completo</Label><Input placeholder="João da Silva" style={{ borderRadius: 10 }} /></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" placeholder="joao@provedor.com" style={{ borderRadius: 10 }} /></div>
            <div className="space-y-2"><Label>Senha</Label><Input type="password" placeholder="••••••••" style={{ borderRadius: 10 }} /></div>
            <div className="space-y-2"><Label>Nome do provedor</Label><Input placeholder="NetFibra Telecom" style={{ borderRadius: 10 }} /></div>
            <div className="space-y-2"><Label>CNPJ</Label><Input placeholder="12.345.678/0001-90" style={{ borderRadius: 10 }} /></div>
            <Button className="w-full" style={{ borderRadius: 10 }}>Criar conta</Button>
            <p className="text-center text-sm text-muted-foreground">
              Já tem conta? <Link to="/login" className="text-primary hover:underline">Entrar</Link>
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
