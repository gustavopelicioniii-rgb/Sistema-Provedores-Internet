import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center space-y-4">
      <h1 className="text-6xl font-bold text-primary">404</h1>
      <p className="text-lg text-muted-foreground">Página não encontrada</p>
      <Button asChild><Link to="/dashboard">Voltar ao Dashboard</Link></Button>
    </div>
  </div>
);

export default NotFound;
