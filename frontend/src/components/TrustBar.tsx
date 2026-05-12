import { Gamepad2, Award } from 'lucide-react';

export function TrustBar() {
  return (
    <section className="py-12" style={{ backgroundColor: '#1a2332' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24">
          {/* 50+ Games */}
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-full" style={{ backgroundColor: '#FFD700' }}>
              <Gamepad2 className="w-8 h-8" style={{ color: '#1a2332' }} />
            </div>
            <div>
              <div 
                className="text-4xl"
                style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, color: '#FFD700' }}
              >
                50+
              </div>
              <div 
                className="text-lg"
                style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600, color: 'white' }}
              >
                Games Available
              </div>
            </div>
          </div>
          
          {/* Divider */}
          <div className="hidden md:block w-px h-16 bg-white opacity-20"></div>
          
          {/* 100% Satisfaction */}
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-full" style={{ backgroundColor: '#E53935' }}>
              <Award className="w-8 h-8 text-white" />
            </div>
            <div>
              <div 
                className="text-4xl"
                style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, color: '#E53935' }}
              >
                100%
              </div>
              <div 
                className="text-lg"
                style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600, color: 'white' }}
              >
                Client Satisfaction
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
