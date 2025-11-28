import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Facebook, Instagram, Youtube } from "lucide-react";
import logo from "@/assets/logo.png";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-bold mb-4">SOBRE</h3>
            <p className="text-sm leading-relaxed mb-4">
              A MK Higienização é especialista em seu bem estar e de
              sua família garantindo um ambiente saudável, com isso
              ela traz o cuidado e a eficiência da MK na limpeza profunda de estofados em São Paulo
              de forma econômica e sustentável e MK Higienização conta com um atendimento
              diferenciado.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">ACESSO RÁPIDO</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm hover:text-accent transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/sobre" className="text-sm hover:text-accent transition-colors">
                  Sobre
                </Link>
              </li>
              <li>
                <Link to="/servicos" className="text-sm hover:text-accent transition-colors">
                  Serviços
                </Link>
              </li>
              <li>
                <Link to="/depoimentos" className="text-sm hover:text-accent transition-colors">
                  Depoimentos
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-sm hover:text-accent transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/contato" className="text-sm hover:text-accent transition-colors">
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-4">NOSSOS CONTATOS</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                <p className="text-sm">
                  MK Higienização - Limpeza e Higienização de Estofados em SP
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <a href="tel:+5511999999999" className="text-sm hover:text-accent transition-colors">
                  (11) 99999-9999
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <a href="tel:+5511999989999" className="text-sm hover:text-accent transition-colors">
                  (11) 99998-9999
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <a
                  href="mailto:contato@mkhigienizacao.com.br"
                  className="text-sm hover:text-accent transition-colors"
                >
                  contato@mkhigienizacao.com.br
                </a>
              </div>
            </div>

            {/* Social Media */}
            <div className="flex items-center gap-4 mt-6">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent transition-colors"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Logo & Copyright */}
        <div className="mt-12 pt-8 border-t border-primary-foreground/20 flex flex-col md:flex-row items-center justify-between gap-4">
          <img src={logo} alt="MK Higienização" className="h-16 w-auto" />
          <p className="text-sm text-center md:text-right">
            Criação de sites Vale do Web
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
