import { motion } from 'framer-motion';
import { Calendar, Snowflake, Sun, Cloud, Users, School, Heart } from 'lucide-react';

const eventTypes = [
  { icon: Calendar, label: 'Festivals', color: '#E53935' },
  { icon: Snowflake, label: 'Christmas', color: '#1a2332' },
  { icon: Sun, label: 'Summer', color: '#FFD700' },
  { icon: Cloud, label: 'Winter', color: '#1a2332' },
  { icon: Users, label: 'Scouts', color: '#E53935' },
  { icon: School, label: 'Schools', color: '#FFD700' },
  { icon: Heart, label: 'NGOs', color: '#1a2332' },
];

export function EventBubbles() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 
          className="text-3xl sm:text-4xl text-center mb-12"
          style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, color: '#1a2332' }}
        >
          Events We Power
        </h2>
        
        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          {eventTypes.map((event, index) => {
            const Icon = event.icon;
            return (
              <motion.button
                key={event.label}
                className="px-6 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 bg-white border-2"
                style={{ 
                  borderColor: event.color,
                  fontFamily: 'Open Sans, sans-serif',
                  fontWeight: 600
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ 
                  opacity: { delay: index * 0.1, duration: 0.5 },
                  y: {
                    duration: 2 + index * 0.3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }}
                whileHover={{ 
                  scale: 1.1,
                  y: -5,
                }}
                animate={{
                  y: [0, -10, 0],
                }}
              >
                <Icon className="w-6 h-6" style={{ color: event.color }} />
                <span style={{ color: event.color }}>{event.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}