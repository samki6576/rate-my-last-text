/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Skull, AlertTriangle, MessageSquare, Ghost, Share2, RefreshCcw, Zap, Bot } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

const API_KEY = (process.env as any).GEMINI_API_KEY || '';
const genAI = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;



interface RoastResult {
  rizzRating: number;
  ghostRisk: number;
  roastLine: string;
  innerMonologue: string;
  insanityLevel: number;
}

const ROASTS = {
  dry: [
    "You have the personality of dry toast. They're literally falling asleep while typing.",
    "Hey? That's it? You just announced your presence like a malfunctioning doorbell.",
    "A brick has more charisma than this text.",
    "If 'meh' was a person, it would be this message."
  ],
  needy: [
    "The insecurity is leaking through the screen. Chill out, Shakespeare.",
    "You're double texting like your life depends on it. High anxiety detected.",
    "They haven't replied in 2 minutes and you're already spiraling? Pathetic.",
    "Are you okay? Because this screams 'I have no other options'."
  ],
  sociopath: [
    "Writing 'k' is a war crime. You've been blocked in 4 different dimensions.",
    "Who hurt you? 'k' is the digital equivalent of a slap to the face.",
    "Cold. Calculated. Probably a serial killer. They should run.",
    "Minimalist or just hostile? Either way, it's a disaster."
  ],
  boring: [
    "LOL? You mean 'Lack Of Laughs'? You're officially the least funny person they know.",
    "Boring. Next. They're already on a date with someone who doesn't use 'lol' as a crutch.",
    "That 'lol' is holding your entire conversation together like a single piece of scotch tape.",
    "Stale energy. This text belongs in a museum of failed interactions."
  ],
  novel: [
    "You wrote a 3-volume epic. They read 'cool' and closed the app. Tragic.",
    "This isn't a text, it's a manifesto. Calm down.",
    "Nobody is reading all that. You're talking to yourself at this point.",
    "The word count is higher than your chances of a second date."
  ],
  romantic: [
    "Love you? Speedrunning heartbreak, I see. You're already planning the wedding in your head.",
    "Simp energy detected. Lower the intensity before they file a restraining order.",
    "Down bad. Truly. They're showing this to their friends and laughing.",
    "You're falling for a profile picture. Get a grip."
  ],
  confused: [
    "?? - The universal sign of 'I am losing my mind because they didn't reply'.",
    "Punctuation isn't a replacement for a personality. You look desperate.",
    "Question marks? More like 'Questioning why I'm still talking to you'.",
    "The confusion is mutual. They're confused why you think this works."
  ],
  generic: [
    "This text is so mid it hurts. It's the digital equivalent of beige.",
    "I've seen more interesting terms and conditions agreements.",
    "You're lucky they're even acknowledging you.",
    "Is this a text or a bot malfunction?"
  ]
};

const MONOLOGUES = [
  "They're literally showing this to the group chat right now.",
  "They're wondering how they ever swiped right.",
  "They're typing a reply but then deleting it because it's not worth it.",
  "They just put their phone face down and sighed.",
  "They're checking if they can block you without it lookin' weird.",
  "They're thinking about their ex who was much better at this.",
  "They're just going to leave you on read for 3 days to humble you.",
  "They're actually laughing, but at you, not with you."
];

export default function App() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<RoastResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [insanityMeter, setInsanityMeter] = useState(0);
  const [isGlitching, setIsGlitching] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const triggerGlitch = () => {
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), Math.random() * 200 + 100);
      
      const nextTime = Math.random() * 5000 + 2000;
      setTimeout(triggerGlitch, nextTime);
    };

    const timer = setTimeout(triggerGlitch, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const originalTitle = "Rate My Last Text 💀";
    const altTitle = "💀 RATE MY LAST TEXT 💀";
    let toggle = false;
    
    const interval = setInterval(() => {
      document.title = toggle ? altTitle : originalTitle;
      toggle = !toggle;
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const roastMe = useCallback(async () => {
    if (!text.trim()) return;

    setIsLoading(true);
    setResult(null);

    // Try Real AI if key exists
    if (genAI) {
      try {
        const response = await genAI.models.generateContent({ 
          model: "gemini-2.0-flash",
          contents: [{ role: 'user', parts: [{ text }] }],
          config: {
            systemInstruction: `You are the Neon Apocalyptic Roast Engine. Your job is to brutally roast users' last text messages. 
            You must respond in JSON format with the following fields:
            - rizzRating: number (0-10)
            - ghostRisk: number (0-100)
            - roastLine: string (short, savage, neon-noir/cyberpunk vibes)
            - innerMonologue: string (what the recipient is actually thinking)
            - insanityLevel: number (current level of cringe, 0-100)
            
            Be creative, mean but funny, and use internet slang (rizz, mid, cooked, etc.).`
          }
        });


        const responseText = response.text || '';
        
        // Extract JSON from response (handling potential markdown formatting)
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          setResult({
            rizzRating: parsed.rizzRating ?? 5,
            ghostRisk: parsed.ghostRisk ?? 50,
            roastLine: parsed.roastLine ?? "AI was too stunned to roast this.",
            innerMonologue: parsed.innerMonologue ?? "Silence.",
            insanityLevel: parsed.insanityLevel ?? 50
          });
          setInsanityMeter(prev => Math.min(100, Math.max(prev, parsed.insanityLevel || 0)));
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.error("AI Roast failed, falling back to simulation:", error);
      }
    }


    // Fallback Simulation (Original Logic)
    setTimeout(() => {
      const lowerText = text.toLowerCase();
      let roastCategory: keyof typeof ROASTS = 'generic';

      if (lowerText.length < 5) roastCategory = 'dry';
      if (lowerText.length > 150) roastCategory = 'novel';
      if (lowerText.includes('hey')) roastCategory = 'dry';
      if (lowerText.includes('lol') || lowerText.includes('lmao')) roastCategory = 'boring';
      if (lowerText === 'k') roastCategory = 'sociopath';
      if (lowerText.includes('??')) roastCategory = 'confused';
      if (lowerText.includes('love') || lowerText.includes('miss')) roastCategory = 'romantic';
      if (lowerText.split(' ').length < 3) roastCategory = 'dry';

      if ((lowerText.match(/\?/g) || []).length > 2) roastCategory = 'needy';

      const roasts = ROASTS[roastCategory];
      const roastLine = roasts[Math.floor(Math.random() * roasts.length)];
      const innerMonologue = MONOLOGUES[Math.floor(Math.random() * MONOLOGUES.length)];
      
      const newResult: RoastResult = {
        rizzRating: Math.floor(Math.random() * 4) + (roastCategory === 'novel' || roastCategory === 'dry' ? 0 : 3),
        ghostRisk: Math.floor(Math.random() * 50) + 50,
        roastLine,
        innerMonologue,
        insanityLevel: Math.min(100, insanityMeter + 10)
      };

      setResult(newResult);
      setInsanityMeter(prev => Math.min(100, prev + 15));
      setIsLoading(false);
    }, 1500);
  }, [text, insanityMeter]);

  const copyToClipboard = () => {
    if (!result) return;
    const shareText = `💀 RATE MY LAST TEXT 💀\n\n" ${text.length > 50 ? text.substring(0, 50) + '...' : text} "\n\nRIZZ: ${result.rizzRating}/10\nGHOST RISK: ${result.ghostRisk}%\nROAST: ${result.roastLine}\n\nCan you survive the roast? #RateMyLastText #GeminiAI`;
    navigator.clipboard.writeText(shareText);
    alert('ROAST COPIED! SHARE THE SHAME. 💀');
  };

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY, currentTarget } = e;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = (clientX - left) / width - 0.5;
    const y = (clientY - top) / height - 0.5;
    setMousePos({ x: x * 10, y: y * -10 });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 font-sans scanlines crt-overlay relative overflow-hidden">
      {isGlitching && <div className="glitch-flash" />}
      {/* Background Animated Glitch Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <motion.div 
          animate={{ x: [0, 10, -10, 0], y: [0, -5, 5, 0] }}
          transition={{ duration: 0.1, repeat: Infinity, repeatType: 'reverse' }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 blur-3xl rounded-full" 
        />
        <motion.div 
          animate={{ x: [0, -15, 15, 0], y: [0, 5, -5, 0] }}
          transition={{ duration: 0.15, repeat: Infinity, repeatType: 'reverse' }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 blur-3xl rounded-full" 
        />
      </div>

      <header className="z-10 mb-8 text-center">
        <h1 className="text-4xl md:text-6xl font-display text-pink-500 glitch-text drop-shadow-[0_0_15px_rgba(255,0,255,0.8)] tracking-tighter uppercase mb-6 leading-none">
          Rate My Last Text
        </h1>
        <p className="text-cyan-400 font-mono text-[10px] md:text-xs tracking-[0.5em] uppercase">
          💀 Neon Apocalyptic Roast Engine 💀
        </p>
      </header>

      <main className="z-10 w-full max-w-2xl" style={{ perspective: '1000px' }}>
        <motion.div 
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          animate={{ rotateY: mousePos.x, rotateX: mousePos.y }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="neon-border bg-black/80 p-6 md:p-8 rounded-lg relative"
        >
          {/* Insanity Meter */}
          <div className="absolute -top-4 right-8 bg-black border border-cyan-500 px-3 py-1 rounded shadow-[0_0_15px_rgba(0,255,255,0.5)]">
            <span className="text-[10px] font-mono text-cyan-500 uppercase tracking-tighter mr-2">Insanity Meter</span>
            <div className="inline-block w-24 h-2 bg-gray-900 overflow-hidden relative border border-cyan-900">
              <motion.div 
                animate={{ width: `${insanityMeter}%` }}
                className="absolute left-0 top-0 h-full bg-cyan-500 shadow-[0_0_10px_rgba(0,255,255,1)]"
              />
            </div>
          </div>

          <div className="mb-6 relative">
            <label className="block text-xs font-mono text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
              <MessageSquare size={12} /> Input Evidence
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your last text here... the more cringe, the better"
              className="w-full bg-gray-900/50 border border-cyan-900 p-4 text-cyan-100 font-mono placeholder:text-gray-700 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all min-h-[120px] resize-none"
            />
          </div>

          <button
            onClick={roastMe}
            disabled={isLoading || !text.trim()}
            className="w-full relative group overflow-hidden bg-transparent border-2 border-pink-500 py-4 font-bold text-xl tracking-[0.2em] uppercase transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
          >
            <div className="absolute inset-0 bg-pink-500 opacity-0 group-hover:opacity-20 transition-opacity" />
            <span className="relative z-10 flex items-center justify-center gap-3 text-pink-500 group-hover:text-pink-300">
              {isLoading ? (
                <>
                  <RefreshCcw className="animate-spin" /> ROASTING...
                </>
              ) : (
                <>
                  <Skull className="shaking" /> ROAST ME
                </>
              )}
            </span>
            {/* Liquid Glitch Effect on Border */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-pink-400 group-hover:animate-ping opacity-50" />
            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-pink-400 group-hover:animate-ping opacity-50" />
          </button>
          
          <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-mono text-gray-600 uppercase tracking-widest">
            <Bot size={12} className="text-cyan-500 animate-pulse" />
            <span>Neural Engine: <span className={genAI ? "text-cyan-400" : "text-yellow-600"}>{genAI ? "Gemini 2.0 Flash" : "Local Simulation Mode"}</span></span>
          </div>
        </motion.div>

        <AnimatePresence>
          {result && !isLoading && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0, rotateX: 45 }}
              animate={{ scale: 1, opacity: 1, rotateX: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="mt-8 neon-border-pink bg-black/90 p-6 md:p-8 rounded-lg relative overflow-hidden"
              style={{ perspective: '1000px' }}
            >
              {/* Sound Simulation Tag */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: [1, 0], y: -100 }}
                transition={{ duration: 1 }}
                className="absolute top-0 right-10 text-pink-500 font-display text-4xl pointer-events-none"
              >
                *BRUTAL*
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-xs font-mono text-gray-500 uppercase mb-4 flex items-center gap-2">
                    <Zap size={14} className="text-yellow-500" /> Rizz Rating
                  </h3>
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-5xl font-mono text-pink-500 font-bold tracking-tighter">
                      {result.rizzRating}
                    </span>
                    <span className="text-xl text-gray-700 font-mono mb-1">/10</span>
                  </div>
                  <div className="w-full h-4 bg-gray-900 rounded-full overflow-hidden border border-gray-800">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${result.rizzRating * 10}%` }}
                      className={`h-full ${result.rizzRating > 6 ? 'bg-cyan-500' : 'bg-red-500'} shadow-[0_0_15px_rgba(0,255,255,0.5)]`}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-mono text-gray-500 uppercase mb-4 flex items-center gap-2">
                    <Ghost size={14} className="text-white" /> Ghost Risk
                  </h3>
                  <div className="flex items-center gap-4">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                    >
                      <Skull size={48} className="text-gray-200" />
                    </motion.div>
                    <div>
                      <div className="text-4xl font-mono text-white tracking-tighter">
                        {result.ghostRisk}%
                      </div>
                      <div className="text-[10px] uppercase tracking-widest text-red-500 font-bold animate-pulse">
                        HIGH LIKELIHOOD
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6 border-t border-pink-900/50 pt-6">
                <div>
                  <label className="text-xs font-mono text-cyan-500 uppercase tracking-widest block mb-2">AI Roast Line:</label>
                  <p className="text-2xl md:text-3xl font-glitch text-pink-500 leading-tight tracking-normal glitch-text">
                    "{result.roastLine}"
                  </p>
                </div>

                <div className="bg-gray-900/40 p-4 border-l-2 border-cyan-500 italic">
                  <label className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.2em] block mb-1">What they really thought:</label>
                  <p className="text-gray-300 font-mono text-sm">
                    "{result.innerMonologue}"
                  </p>
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <button 
                  onClick={copyToClipboard}
                  className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-black font-bold py-3 px-4 rounded flex items-center justify-center gap-2 transition-colors uppercase text-sm tracking-widest shadow-[0_0_20px_rgba(0,255,255,0.3)]"
                >
                  <Share2 size={16} /> Share This Roast
                </button>
                <button 
                  onClick={() => { setText(''); setResult(null); }}
                  className="bg-gray-800 hover:bg-gray-700 text-white p-3 rounded transition-colors border border-gray-600"
                  title="Wipe Evidence"
                >
                  <RefreshCcw size={18} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="mt-12 text-center text-gray-700 font-mono text-[10px] tracking-[0.3em] uppercase z-10 max-w-lg">
        <p>Warning: AI is savage and lacks empathy. Use at your own risk. No human emotions were harmed in the making of this roast.</p>
        <div className="mt-4 flex justify-center gap-4 opacity-30">
          <Zap size={12} /> <Skull size={12} /> <Zap size={12} />
        </div>
      </footer>

      {/* Decorative Floating Symbols */}
      <div className="fixed inset-0 pointer-events-none opacity-10 font-mono text-xs overflow-hidden z-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: -100, x: Math.random() * 100 + 'vw' }}
            animate={{ y: '110vh' }}
            transition={{ 
              duration: Math.random() * 10 + 10, 
              repeat: Infinity, 
              ease: 'linear',
              delay: Math.random() * 20
            }}
            className="absolute text-cyan-500"
          >
            {Math.random() > 0.5 ? '01' : '10'}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
