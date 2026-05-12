/**
 * ============================================================
 * FRONTEND SERVICES PAGE — Enhanced Premium Edition
 * ============================================================
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Truck, Wrench, Clock, Shield, Users, MapPin, Sparkles, 
  Package, Headphones, TrendingUp, Award, CheckCircle2, 
  ArrowRight, DollarSign, Settings, ShieldCheck, Zap
} from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { Link } from 'react-router-dom';

// =============================
// DATA CONFIGURATION
// =============================
const services = [
  {
    icon: Package,
    title: 'Elite Arcade Rental',
    description: 'Hand-pick from 50+ premium machines — from nostalgic classics to cutting-edge simulators. Every unit arrives event-ready and fully tested.',
    features: ['Flexible 1-day to long-term rentals', 'All categories available', 'Preventive maintenance included', 'Rapid swap if any issue arises'],
    color: '#E53935'
  },
  {
    icon: Sparkles,
    title: 'Turnkey Event Management',
    description: 'From blueprint to breakdown — we own every detail so you don\'t have to. Our team is your silent event engine.',
    features: ['Strategic game selection consultation', 'Custom zone planning & design', 'Full setup & professional installation', 'Dedicated on-site operations team'],
    color: '#1a2332'
  },
  {
    icon: MapPin,
    title: 'Venue Space Takeover',
    description: 'We transform dead space into a revenue-generating entertainment zone — at zero cost to you. You provide the square meters, we bring the magic.',
    features: ['Guaranteed monthly rental income', '100% managed — zero work on your side', 'Boosts foot traffic & dwell time', 'Brand-safe & family-friendly'],
    color: '#FFD700'
  },
  {
    icon: Truck,
    title: 'White-Glove Delivery',
    description: 'Our logistics crew handles every kilometre. Machines arrive on time, installed safely, and ready to run before your first guest walks in.',
    features: ['Nationwide coverage across Lebanon', 'Certified installation team', 'Pre-event testing & calibration', 'Full safety & compliance check'],
    color: '#E53935'
  },
  {
    icon: Wrench,
    title: '24/7 Technical Support',
    description: 'Machines run flawlessly or we fix it — instantly. Our engineers are on standby for the entire duration of your event.',
    features: ['Round-the-clock hotline', 'On-site rapid response team', 'Instant replacement units on reserve', 'Post-event full maintenance report'],
    color: '#1a2332'
  },
  {
    icon: Users,
    title: 'Professional Staffing',
    description: 'Friendly, trained, and presentable — our game attendants keep the energy high and guests engaged from start to finish.',
    features: ['Certified game operators', 'Arabic & English fluent', 'Crowd management expertise', 'Branded uniform appearance'],
    color: '#FFD700'
  }
];

const eventTypes = [
  { name: 'Universities & Campuses', icon: Award },
  { name: 'Festivals & Fairs', icon: Sparkles },
  { name: 'Schools & Youth Events', icon: CheckCircle2 },
  { name: 'NGO & Community Events', icon: Users },
  { name: 'Private Parties', icon: Sparkles },
  { name: 'Corporate Events', icon: TrendingUp },
  { name: 'Christmas & Seasonal', icon: CheckCircle2 },
  { name: 'Malls & Public Spaces', icon: MapPin },
];

const whyChooseUs = [
  { title: 'Machines in Fleet', description: 'The largest premium arcade collection available for event rental in Lebanon', stat: '50+' },
  { title: 'Client Satisfaction', description: 'Every event we\'ve powered has left clients asking us back', stat: '100%' },
  { title: 'Support Coverage', description: 'Always reachable — before, during, and after your event', stat: '24/7' },
  { title: 'Years Delivering', description: 'A proven track record of making events legendary', stat: '5+' },
];

// Revenue funnel steps
const revenueSteps = [
  { step: '01', title: 'You Book the Space', desc: 'Reserve your date. We come to assess the venue at zero cost.', color: '#E53935' },
  { step: '02', title: 'We Design the Zone', desc: 'Custom layout tailored to your crowd size and space dimensions.', color: '#FFD700' },
  { step: '03', title: 'Event Day — We Run It', desc: 'Our team handles everything. You just show up and enjoy.', color: '#1a2332' },
  { step: '04', title: 'Your Event Goes Viral', desc: 'Memorable experiences = social media buzz = more ticket sales.', color: '#E53935' },
  { step: '05', title: 'You Make More Money', desc: 'Longer stays, higher satisfaction, and repeat attendance. Win-win.', color: '#FFD700' },
];

// =============================
// MAIN COMPONENT
// =============================
export function Services() {
  return (
    <div className="bg-white">
      
      {/* ── 1. HERO ── */}
      <section className="relative py-20 text-white overflow-hidden" style={{ backgroundColor: '#1a2332' }}>
        <div className="absolute inset-0 opacity-10">
          <ImageWithFallback 
            src="https://images.unsplash.com/photo-1758706552632-64ab529c2631?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
            alt="Event setup" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 25% 60%, #E53935 0%, transparent 50%), radial-gradient(circle at 75% 40%, #FFD700 0%, transparent 50%)' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5"
              style={{ backgroundColor: 'rgba(255,215,0,0.15)', border: '1px solid rgba(255,215,0,0.35)' }}>
              <Zap className="w-4 h-4" style={{ color: '#FFD700' }} />
              <span className="text-sm font-bold uppercase tracking-widest" style={{ color: '#FFD700', fontFamily: 'Open Sans, sans-serif' }}>
                End-to-End Arcade Solutions
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl mb-6" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800 }}>
              We Don't Just Deliver Games.<br />
              <span style={{ color: '#FFD700' }}>We Deliver Moments.</span>
            </h1>
            <p className="text-xl sm:text-2xl max-w-3xl mx-auto text-white/80" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 400 }}>
              Comprehensive arcade entertainment solutions — built to make your event unforgettable and your crowd come back for more.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── 2. WHY METRICS ── */}
      <section className="py-14 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {whyChooseUs.map((item, index) => (
              <motion.div key={item.title} className="text-center"
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: index * 0.1, duration: 0.5 }}>
                <div className="text-5xl sm:text-6xl mb-3 font-black" style={{ fontFamily: 'Montserrat, sans-serif', color: '#E53935' }}>{item.stat}</div>
                <h3 className="text-base font-bold mb-1" style={{ fontFamily: 'Montserrat, sans-serif', color: '#1a2332' }}>{item.title}</h3>
                <p className="text-sm text-gray-500" style={{ fontFamily: 'Open Sans, sans-serif' }}>{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. SERVICES GRID ── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl mb-3" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, color: '#1a2332' }}>What We Offer</h2>
            <p className="text-lg max-w-2xl mx-auto text-gray-500" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              From a single machine to a full event takeover — every service is designed to remove headaches and maximize impact.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.div key={service.title}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2"
                  style={{ borderColor: service.color }}
                  initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ y: -6 }}>
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: service.color }}>
                    <Icon className="w-8 h-8" style={{ color: service.color === '#FFD700' ? '#1a2332' : 'white' }} />
                  </div>
                  <h3 className="text-xl mb-3" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, color: '#1a2332' }}>{service.title}</h3>
                  <p className="mb-5 text-gray-500 leading-relaxed" style={{ fontFamily: 'Open Sans, sans-serif' }}>{service.description}</p>
                  <ul className="space-y-2.5">
                    {service.features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-sm" style={{ fontFamily: 'Open Sans, sans-serif', color: '#444' }}>
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: service.color }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 4. REVENUE FUNNEL SCHEMA ── */}
      <section className="py-20" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4" style={{ backgroundColor: 'rgba(229,57,53,0.1)' }}>
              <TrendingUp className="w-4 h-4" style={{ color: '#E53935' }} />
              <span className="text-sm font-bold uppercase tracking-widest" style={{ color: '#E53935', fontFamily: 'Open Sans, sans-serif' }}>Revenue Blueprint</span>
            </div>
            <h2 className="text-3xl sm:text-4xl mb-4" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, color: '#1a2332' }}>
              How We Make Your Event <span style={{ color: '#E53935' }}>More Profitable</span>
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              Arcade entertainment isn't a cost — it's a revenue driver. Here's the proven formula:
            </p>
          </div>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 hidden sm:block" style={{ backgroundColor: '#e5e7eb' }} />
            <div className="space-y-6">
              {revenueSteps.map((item, i) => (
                <motion.div key={item.step}
                  className="flex gap-6 items-start"
                  initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.12, duration: 0.5 }}>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-white font-black text-sm z-10 relative"
                    style={{ backgroundColor: item.color, fontFamily: 'Montserrat, sans-serif', boxShadow: `0 4px 16px ${item.color}50` }}>
                    {item.step}
                  </div>
                  <div className="flex-1 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <h3 className="font-black text-base mb-1" style={{ fontFamily: 'Montserrat, sans-serif', color: '#1a2332' }}>{item.title}</h3>
                    <p className="text-sm text-gray-500" style={{ fontFamily: 'Open Sans, sans-serif' }}>{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            {/* Result banner */}
            <motion.div className="mt-8 rounded-2xl p-6 text-center"
              style={{ backgroundColor: '#1a2332' }}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <DollarSign className="w-10 h-10 mx-auto mb-3" style={{ color: '#FFD700' }} />
              <p className="text-xl font-black text-white mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                The Result: More Buzz. More Revenue. More Repeat Clients.
              </p>
              <p className="text-white/60 text-sm max-w-lg mx-auto" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                Event organizers who partner with us consistently report higher ticket sales, longer average visit durations, and stronger social media engagement.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 5. EVENTS WE SERVE ── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl mb-3" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, color: '#1a2332' }}>Events We Specialise In</h2>
            <p className="text-lg max-w-2xl mx-auto text-gray-500" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              Hundreds of successful events across Lebanon — from university campuses to open-air festivals.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {eventTypes.map((event, index) => {
              const Icon = event.icon;
              return (
                <motion.div key={event.name}
                  className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
                  initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }} transition={{ delay: index * 0.05, duration: 0.4 }}
                  whileHover={{ y: -5 }}>
                  <Icon className="w-9 h-9 mx-auto mb-3" style={{ color: '#E53935' }} />
                  <p className="font-bold text-sm" style={{ fontFamily: 'Open Sans, sans-serif', color: '#1a2332' }}>{event.name}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 6. PARTNERSHIP MODEL ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-14"
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl mb-4 leading-tight"
              style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, color: '#1a2332' }}>
              Your Playground, Our Responsibility:<br />
              <span style={{ color: '#FFD700' }}>The Plug-and-Play Partnership.</span>
            </h2>
            <div className="w-24 h-1 mx-auto" style={{ backgroundColor: '#E53935' }} />
          </motion.div>
          <motion.div className="mb-14 rounded-2xl overflow-hidden shadow-2xl"
            initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <ImageWithFallback 
              src="https://images.unsplash.com/photo-1722834258867-da53814b50d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
              alt="Professional arcade setup at outdoor festival in Lebanon"
              className="w-full h-[350px] sm:h-[450px] lg:h-[550px] object-cover" />
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-14">
            {[
              { icon: DollarSign, color: '#FFD700', title: 'Guaranteed Revenue', desc: 'We rent the space from you. Predictable income with zero operational burden on your team.' },
              { icon: Settings, color: '#1a2332', title: 'Full Operational Ownership', desc: 'We manage staff, power, and logistics. You provide the space — we handle everything else.' },
              { icon: ShieldCheck, color: '#E53935', title: 'Zero-Risk Entertainment', desc: 'All liability, maintenance, and operations are on us. You enjoy the partnership without the headaches.' },
            ].map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div key={card.title}
                  className="text-center p-8 bg-white rounded-2xl shadow-lg border-2"
                  style={{ borderColor: card.color }}
                  initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
                  whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.12)' }}>
                  <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-5" style={{ backgroundColor: card.color }}>
                    <Icon className="w-10 h-10" style={{ color: card.color === '#FFD700' ? '#1a2332' : 'white' }} />
                  </div>
                  <h3 className="text-xl mb-3" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, color: '#1a2332' }}>{card.title}</h3>
                  <p className="text-gray-500 leading-relaxed" style={{ fontFamily: 'Open Sans, sans-serif' }}>{card.desc}</p>
                </motion.div>
              );
            })}
          </div>
          {/* Quote */}
          <motion.div className="relative py-12 px-8 sm:px-16 rounded-2xl mb-12"
            style={{ backgroundColor: '#1a2332' }}
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <blockquote className="text-center">
              <p className="text-xl sm:text-2xl lg:text-3xl mb-5 text-white leading-relaxed italic"
                style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700 }}>
                "Hand us the keys to your Kids Area, and we will handle the rest. Your success is our reputation."
              </p>
              <footer>
                <p className="text-lg font-bold" style={{ fontFamily: 'Open Sans, sans-serif', color: '#FFD700' }}>— Founder, Next Level Game</p>
              </footer>
            </blockquote>
          </motion.div>
          {/* CTA */}
          <motion.div className="text-center"
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <a href="https://wa.me/96103919876?text=Hi%2C%20I%27d%20like%20to%20request%20a%20space%20takeover%20consultation." target="_blank" rel="noopener noreferrer">
              <button className="px-12 py-5 rounded-xl text-xl sm:text-2xl transition-all duration-300 hover:shadow-2xl hover:scale-105 inline-flex items-center gap-3"
                style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, backgroundColor: '#FFD700', color: '#1a2332', boxShadow: '0 10px 30px rgba(255,215,0,0.3)' }}>
                Request a Space Takeover Consultation
                <ArrowRight className="w-6 h-6" />
              </button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── 7. HOW IT WORKS ── */}
      <section className="py-20" style={{ backgroundColor: '#1a2332' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl mb-3 text-white" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700 }}>How It Works</h2>
            <p className="text-lg max-w-2xl mx-auto text-white/70" style={{ fontFamily: 'Open Sans, sans-serif' }}>From first call to full event — we make it effortless.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Reach Out', description: 'Call, WhatsApp, or email — we respond within hours, not days.' },
              { step: '02', title: 'Free Consultation', description: 'We assess your venue, crowd size, and event goals. No obligation.' },
              { step: '03', title: 'Confirm & Schedule', description: 'Lock in your game selection, layout, and delivery time.' },
              { step: '04', title: 'We Handle Everything', description: 'Setup, management, and takedown — all without you lifting a finger.' }
            ].map((item, index) => (
              <motion.div key={item.step} className="text-center"
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: index * 0.15, duration: 0.5 }}>
                <div className="text-6xl mb-4 font-black" style={{ fontFamily: 'Montserrat, sans-serif', color: '#FFD700' }}>{item.step}</div>
                <h3 className="text-xl mb-2 text-white font-bold" style={{ fontFamily: 'Montserrat, sans-serif' }}>{item.title}</h3>
                <p className="text-white/70 text-sm" style={{ fontFamily: 'Open Sans, sans-serif' }}>{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. CONVERSION CTA ── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="rounded-2xl p-12 text-center" style={{ backgroundColor: '#E53935' }}
            initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="text-3xl sm:text-4xl mb-5 text-white font-bold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Ready to Level Up Your Event?
            </h2>
            <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              Join hundreds of satisfied event organizers. Let's talk about what we can build together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="https://wa.me/96103919876" target="_blank" rel="noopener noreferrer">
                <button className="px-10 py-4 rounded-lg text-lg transition-all duration-300 hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2 font-bold"
                  style={{ fontFamily: 'Open Sans, sans-serif', backgroundColor: '#FFD700', color: '#1a2332' }}>
                  Get a Free Quote <ArrowRight className="w-5 h-5" />
                </button>
              </a>
              <Link to="/build-your-event">
                <button className="px-10 py-4 rounded-lg text-lg transition-all duration-300 hover:shadow-xl hover:scale-105 border-2 border-white flex items-center justify-center gap-2 font-bold text-white"
                  style={{ fontFamily: 'Open Sans, sans-serif', backgroundColor: 'transparent' }}>
                  Build Your Event <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
