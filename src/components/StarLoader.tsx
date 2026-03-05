import { motion } from "framer-motion";

const StarLoader = () => {
  const stars = Array.from({ length: 12 });

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm">
      <div className="relative w-40 h-40">
        {stars.map((_, i) => {
          const angle = (i / stars.length) * 360;
          const radius = 60;
          const x = Math.cos((angle * Math.PI) / 180) * radius;
          const y = Math.sin((angle * Math.PI) / 180) * radius;
          return (
            <motion.div
              key={i}
              className="absolute left-1/2 top-1/2 text-accent"
              style={{ x: x - 6, y: y - 6 }}
              animate={{
                scale: [0.5, 1.3, 0.5],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.12,
                ease: "easeInOut",
              }}
            >
              ✦
            </motion.div>
          );
        })}
        <motion.div
          className="absolute inset-0 flex items-center justify-center text-4xl"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          ✨
        </motion.div>
      </div>
      <motion.p
        className="mt-8 text-lg font-body text-foreground/80"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Tworzymy magiczną bajkę...
      </motion.p>
    </div>
  );
};

export default StarLoader;
