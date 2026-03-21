import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wifi } from "lucide-react";

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 rounded-xl bg-primary flex items-center justify-center mb-2">
            <Wifi className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">NetAdmin</CardTitle>
          <CardDescription>Acesse sua conta para gerenciar seu provedor</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="admin@provedor.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" placeholder="••••••••" />
          </div>
          <Button className="w-full" asChild>
            <Link to="/dashboard">Entrar</Link>
          </Button>
          <div className="flex items-center justify-between text-sm">
            <Link to="/forgot-password" className="text-primary hover:underline">Esqueci minha senha</Link>
            <Link to="/register" className="text-primary hover:underline">Criar conta</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
