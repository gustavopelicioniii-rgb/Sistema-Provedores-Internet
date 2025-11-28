import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface ServiceCardProps {
  title: string;
  category: string;
  description: string;
  image: string;
  icon: React.ReactNode;
  link: string;
}

const ServiceCard = ({ title, category, description, image, icon, link }: ServiceCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4 bg-accent text-accent-foreground rounded-full p-3">
          {icon}
        </div>
      </div>
      <CardContent className="p-6 text-center">
        <p className="text-sm text-muted-foreground mb-2">{category}</p>
        <h3 className="text-xl font-bold text-primary mb-3">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Button asChild className="w-full bg-primary hover:bg-primary/90">
          <Link to={link}>VEJA MAIS</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ServiceCard;
