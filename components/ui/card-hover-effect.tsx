import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Button, } from "@heroui/react";
import { Card, CardContent, CardFooter ,CardHeader, CardTitle } from "./card";
import { ServiceModel } from "../Website/servicemodel";

export const HoverEffect = ({
  items,
  className,
}: {
  items: {
    icon: React.ReactNode;
    title: string;
    description: string;
    link: string;
  }[];
  className?: string;
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);  

  const handleServiceClick = (serviceTitle: string) => {
    setSelectedService(serviceTitle);
    setIsModalOpen(true); 
  };

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3", className)}>
      {items.map((item, idx) => (
        <div
        
        key={`${item.title}-${idx}`}
        className="relative group block p-2 h-full w-full"
        onMouseEnter={() => setHoveredIndex(idx)}
        onMouseLeave={() => setHoveredIndex(null)}
      >
          <AnimatePresence>
            {hoveredIndex === idx && (
              <motion.span
                className="absolute inset-0 h-full w-full bg-neutral-200 dark:bg-slate-800/[0.8] block rounded-3xl"
                layoutId="hoverBackground"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: { duration: 0.15 },
                }}
                exit={{
                  opacity: 0,
                  transition: { duration: 0.15, delay: 0.2 },
                }}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            )}
          </AnimatePresence>
          <Card className="rounded-2xl h-full w-full overflow-hidden bg-black-200 border border-transparent dark:border-white/[0.2] group-hover:border-slate-700 relative z-20 p-2">
            <CardHeader className="text-center items-center">
              <CardTitle className="text-zinc-100 font-bold tracking-wide">{item.title}</CardTitle>
            </CardHeader>
            <CardContent className="mb-2">
              <p className="text-zinc-400 tracking-wide leading-relaxed text-sm mb-2">{item.description}</p>
            </CardContent>
            <CardFooter className="justify-between before:bg-white/10 border-white/20 border-1 overflow-hidden py-1 absolute  rounded-large bottom-1 w-[calc(100%_-_8px)] shadow-small  mr-3 z-20">
              <p className="text-tiny text-white/80">Reserve</p>
              <Button className="text-tiny text-white bg-black/20" variant="flat" color="default" radius="lg" size="sm"onClick={() => handleServiceClick(item.title)} >
                Now
              </Button>
            </CardFooter>

          </Card>
          </div>
      ))}
      {selectedService && <ServiceModel
          service={selectedService}
          isOpen={isModalOpen}
          setIsOpen={setIsModalOpen} />}
    </div>
  );
};
