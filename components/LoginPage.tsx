import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';

interface LoginProps {
  onLogin: (email: string, password?: string) => void;
}

const LoginPage: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="relative w-full h-screen bg-[#F2F4F7] overflow-hidden flex font-sans text-gray-900">
      <style>{`
        @keyframes slow-spin {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.8; scale: 1; }
          50% { opacity: 0.6; scale: 1.05; }
        }

        .iridescent-sphere {
          position: absolute;
          top: 50%;
          left: 35%; 
          transform: translate(-50%, -50%);
          width: 75vh;
          height: 75vh;
          border-radius: 50%;
          background: conic-gradient(
            from 0deg,
            #4285F4,    /* Google Blue */
            #EA4335,    /* Google Red */
            #FBBC05,    /* Google Yellow */
            #34A853,    /* Google Green */
            #4285F4     /* Google Blue (Close loop) */
          );
          filter: blur(80px); 
          opacity: 0.8;
          animation: slow-spin 10s linear infinite; /* Increased speed to 10s */
          z-index: 0;
          mix-blend-mode: multiply; 
        }
        
        /* Optional inner glow to make it look less flat */
        .iridescent-sphere::after {
          content: '';
          position: absolute;
          inset: 10%;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), transparent 70%);
          filter: blur(40px);
          animation: pulse-glow 8s ease-in-out infinite;
        }

        .glass-split {
          background: rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(40px); 
          -webkit-backdrop-filter: blur(40px);
          border-left: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: -10px 0 60px rgba(0,0,0,0.05);
        }

        @media (max-width: 1024px) {
          .iridescent-sphere {
            left: 50%; 
            top: 30%;
            width: 80vw;
            height: 80vw;
          }
          
          .glass-split {
            border-left: none;
            background: rgba(255,255,255,0.7);
            backdrop-filter: blur(30px);
            border-top: 1px solid white;
          }
        }
      `}</style>

      {/* --- BACKGROUND LAYER --- */}

      {/* Brand Top Left */}
      <div className="absolute top-8 left-8 z-20 flex items-center gap-3">
        <h1 className="text-2xl font-bold tracking-wider text-gray-900 font-display">ORIGIN</h1>
      </div>

      {/* The Sphere Elements */}
      <div className="iridescent-sphere"></div>

      {/* --- FOREGROUND LAYOUT --- */}

      {/* Left side (Desktop only - Transparent) */}
      <div className="hidden lg:block lg:w-1/2 h-full pointer-events-none"></div>

      {/* Right side (The Blur Field / Glass Pane) */}
      <div className="w-full lg:w-1/2 h-full glass-split relative z-10 flex flex-col justify-center lg:justify-between p-8 md:p-12 lg:p-24 overflow-y-auto">

        {/* Content Wrapper */}
        <div className="flex flex-col h-full justify-center lg:justify-between min-h-[600px]">

          {/* Top Content */}
          <div className="mt-8 lg:mt-12 mb-12 lg:mb-0">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl mb-6 tracking-tight text-gray-900 whitespace-nowrap flex items-center">
              <span className="font-display font-bold tracking-wider mr-3">ORIGIN</span>
              <span className="font-light">kundportal</span>
            </h2>


          </div>

          {/* Bottom Form Area */}
          <div className="mb-4 lg:mb-12 max-w-md w-full mx-auto lg:mx-0">
            <form
              onSubmit={(e) => { e.preventDefault(); onLogin(email || 'kund@example.com', password); }}
              className="space-y-8"
            >
              <div className="space-y-6">
                {/* Floating Label Input: Email */}
                <div className="relative group">
                  <input
                    type="email"
                    id="email"
                    className="peer block w-full bg-transparent border-b border-gray-400 py-3 text-lg font-medium text-gray-900 focus:outline-none focus:border-brand transition-colors placeholder-transparent"
                    placeholder="E-post"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <label
                    htmlFor="email"
                    className="absolute left-0 top-3 text-gray-500 text-lg font-medium transition-all duration-300 pointer-events-none
                                       peer-focus:-top-3 peer-focus:text-xs peer-focus:text-brand 
                                       peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-500"
                  >
                    E-post
                  </label>
                  <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-brand transition-all duration-500 peer-focus:w-full"></div>
                </div>

                {/* Floating Label Input: Password */}
                <div className="relative group">
                  <input
                    type="password"
                    id="password"
                    className="peer block w-full bg-transparent border-b border-gray-400 py-3 text-lg font-medium text-gray-900 focus:outline-none focus:border-brand transition-colors placeholder-transparent"
                    placeholder="Lösenord"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <label
                    htmlFor="password"
                    className="absolute left-0 top-3 text-gray-500 text-lg font-medium transition-all duration-300 pointer-events-none
                                       peer-focus:-top-3 peer-focus:text-xs peer-focus:text-brand 
                                       peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-500"
                  >
                    Lösenord
                  </label>
                  <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-brand transition-all duration-500 peer-focus:w-full"></div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => onLogin(email || 'demo@origin.se', password || 'demo')}
                  className="group w-full h-14 rounded-full bg-slate-900 text-white font-semibold tracking-wide text-sm shadow-[0_14px_30px_rgba(15,23,42,0.18)] hover:-translate-y-[2px] hover:shadow-[0_18px_36px_rgba(15,23,42,0.22)] transition-all duration-300 flex items-center justify-center gap-3"
                >
                  <span>Logga in till kundportal</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  type="button"
                  onClick={() => onLogin('admin@admin.se', 'admin')}
                  className="group w-full h-14 rounded-full bg-white/85 text-slate-900 font-semibold tracking-wide text-sm border border-slate-300/80 shadow-[0_10px_24px_rgba(15,23,42,0.12)] hover:bg-white hover:-translate-y-[2px] hover:shadow-[0_14px_32px_rgba(15,23,42,0.16)] transition-all duration-300 flex items-center justify-center gap-3"
                >
                  <span>Logga in som SEO-byrå</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
