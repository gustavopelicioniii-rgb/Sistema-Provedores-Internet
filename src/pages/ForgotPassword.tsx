import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/GlassCard";
import { GlassBackground } from "@/components/GlassBackground";
import { Wifi } from "lucide-react";

export default function ForgotPassword() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 50%, #f0f4f8 100%)' }}>
      <GlassBackground />
      <GlassCard className="w-full max-w-md">
        <div className="p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-primary flex items-center justify-center mb-3">
              <Wifi className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">Recuperar Senha</h1>
            <p className="text-sm text-muted-foreground">Informe seu email para receber o link de recuperação</p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Email</Label><Input type="email" placeholder="admin@provedor.com" style={{ borderRadius: 10 }} /></div>
            <Button className="w-full" style={{ borderRadius: 10 }}>Enviar link de recuperação</Button>
            <p className="text-center text-sm text-muted-foreground">
              <Link to="/login" className="text-primary hover:underline">Voltar para o login</Link>
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
