import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const Contato = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contato</h1>
          <p className="text-lg md:text-xl">Entre em contato conosco</p>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-6">
                <Phone className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-bold text-primary mb-2">Telefones</h3>
                <div className="space-y-2">
                  <p className="text-muted-foreground">
                    <a href="tel:+5511999999999" className="hover:text-primary transition-colors">
                      (11) 99999-9999
                    </a>
                  </p>
                  <p className="text-muted-foreground">
                    <a href="tel:+5511999989999" className="hover:text-primary transition-colors">
                      (11) 99998-9999
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <Mail className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-bold text-primary mb-2">E-mail</h3>
                <p className="text-muted-foreground">
                  <a
                    href="mailto:contato@mkhigienizacao.com.br"
                    className="hover:text-primary transition-colors"
                  >
                    contato@mkhigienizacao.com.br
                  </a>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <MapPin className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-bold text-primary mb-2">Localização</h3>
                <p className="text-muted-foreground">
                  Atendemos toda a região de São Paulo e Grande São Paulo
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <Clock className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-bold text-primary mb-2">Horário de Atendimento</h3>
                <p className="text-muted-foreground">
                  Segunda a Sábado: 8h às 18h
                  <br />
                  Domingo: Fechado
                </p>
              </CardContent>
            </Card>
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <h2 className="text-3xl font-bold text-primary mb-4">
              Solicite seu Orçamento Gratuito
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Entre em contato agora mesmo e agende seu serviço
            </p>
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              FALE CONOSCO PELO WHATSAPP
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contato;
