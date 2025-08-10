import React from 'react';
import { motion } from 'framer-motion';

interface ClientLogo {
  name: string;
  logo: string; // SVG data URL or path
  url?: string;
}

interface LogoStripProps {
  title?: string;
  logos: ClientLogo[];
  className?: string;
  autoScroll?: boolean;
}

export const LogoStrip: React.FC<LogoStripProps> = ({
  title = 'Ils me font confiance',
  logos,
  className = '',
  autoScroll = true,
}) => {
  // Duplicate logos for seamless scrolling
  const duplicatedLogos = [...logos, ...logos];

  return (
    <div className={`${className}`}>
      {title && (
        <div className="text-center mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            {title}
          </h3>
          <p className="text-gray-600">
            Collaborations avec des entreprises innovantes
          </p>
        </div>
      )}

      <div className="relative overflow-hidden">
        {/* Gradient overlays for fade effect */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10" />

        {/* Logo container */}
        <div className="flex">
          <motion.div
            className="flex items-center gap-12 pr-12"
            animate={autoScroll ? { x: '-50%' } : {}}
            transition={autoScroll ? {
              duration: 30,
              repeat: Infinity,
              ease: 'linear',
            } : {}}
          >
            {duplicatedLogos.map((logo, index) => (
              <motion.div
                key={`${logo.name}-${index}`}
                className="flex-shrink-0 h-16 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300"
                whileHover={{ scale: 1.1 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: (index % logos.length) * 0.1 }}
                viewport={{ once: true }}
              >
                {logo.url ? (
                  <a
                    href={logo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                    aria-label={`Visiter le site de ${logo.name}`}
                  >
                    <img
                      src={logo.logo}
                      alt={`Logo ${logo.name}`}
                      className="h-full max-w-[120px] object-contain filter brightness-0 opacity-60 hover:opacity-100 transition-all duration-300"
                    />
                  </a>
                ) : (
                  <img
                    src={logo.logo}
                    alt={`Logo ${logo.name}`}
                    className="h-full max-w-[120px] object-contain filter brightness-0 opacity-60 hover:opacity-100 transition-all duration-300"
                  />
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Static grid version for small screens */}
      <div className="md:hidden grid grid-cols-2 gap-8 mt-8">
        {logos.slice(0, 4).map((logo, index) => (
          <motion.div
            key={logo.name}
            className="h-12 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            {logo.url ? (
              <a
                href={logo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
                aria-label={`Visiter le site de ${logo.name}`}
              >
                <img
                  src={logo.logo}
                  alt={`Logo ${logo.name}`}
                  className="h-full max-w-[100px] object-contain filter brightness-0 opacity-60"
                />
              </a>
            ) : (
              <img
                src={logo.logo}
                alt={`Logo ${logo.name}`}
                className="h-full max-w-[100px] object-contain filter brightness-0 opacity-60"
              />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};