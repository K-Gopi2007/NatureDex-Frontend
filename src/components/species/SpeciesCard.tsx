import { Link } from "react-router-dom";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";

interface SpeciesCardProps {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  date?: string;
}

export default function SpeciesCard({ id, name, category, imageUrl, date }: SpeciesCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <Link to={`/profile/${id}`} className="block perspective-1000">
      <motion.div 
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        whileHover={{ scale: 1.05, zIndex: 10 }}
        whileTap={{ scale: 0.95 }}
        className="h-full flex flex-col group relative rounded-2xl overflow-hidden shadow-xl shadow-black/50 border border-emerald-900/40 bg-gradient-to-br from-emerald-900/30 to-black backdrop-blur-md"
      >
        <div className="aspect-[4/3] w-full overflow-hidden relative" style={{ transform: "translateZ(30px)" }}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10" />
          
          <img 
            src={imageUrl} 
            alt={name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          
          {/* Glowing border effect */}
          <div className="absolute inset-0 border-2 border-primary/0 group-hover:border-primary/50 transition-colors duration-300 rounded-2xl z-20 pointer-events-none shadow-[inset_0_0_20px_rgba(16,185,129,0)] group-hover:shadow-[inset_0_0_20px_rgba(16,185,129,0.3)]" />

          <div className="absolute bottom-4 left-4 z-20 pr-4" style={{ transform: "translateZ(50px)" }}>
            <span className="px-2.5 py-1 bg-primary/20 border border-primary/50 text-primary text-[10px] uppercase tracking-widest font-bold rounded-full mb-2 inline-block backdrop-blur-md shadow-[0_0_10px_rgba(16,185,129,0.4)]">
              {category}
            </span>
            <h3 className="text-lg font-black text-white leading-tight drop-shadow-md">{name}</h3>
            {date && <p className="text-xs text-emerald-100/60 mt-1 font-medium">{date}</p>}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}


