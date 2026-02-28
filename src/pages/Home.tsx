import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Upload, CheckCircle2, XCircle, Award, Trophy, MapPin, Sparkles, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [filename, setFilename] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isAssisting, setIsAssisting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [assistMessage, setAssistMessage] = useState<React.ReactNode | null>(null);
  const [result, setResult] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const playSpeech = async (text: string) => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    
    try {
      const base64Audio = await api.generateSpeech(text);
      if (!base64Audio) {
        setIsSpeaking(false);
        return;
      }

      // Gemini TTS returns raw PCM 16-bit mono at 24kHz
      const binaryString = window.atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Int16Array(len / 2);
      for (let i = 0; i < len; i += 2) {
        bytes[i / 2] = (binaryString.charCodeAt(i + 1) << 8) | binaryString.charCodeAt(i);
      }

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const audioBuffer = audioContext.createBuffer(1, bytes.length, 24000);
      const channelData = audioBuffer.getChannelData(0);
      
      // Convert Int16 to Float32
      for (let i = 0; i < bytes.length; i++) {
        channelData[i] = bytes[i] / 32768;
      }

      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.onended = () => {
        setIsSpeaking(false);
        audioContext.close();
      };
      source.start();
    } catch (err) {
      console.error("Playback Error:", err);
      setIsSpeaking(false);
    }
  };

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFilename(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!image) return;
    setAssistMessage(null);
    setIsUploading(true);
    try {
      // 1. Run Real AI Analysis on Client
      const analysis = await api.analyzeWasteImage(image);
      
      // 2. Record the score on the Server
      const res = await api.recordScore(analysis, user?.studentName || 'Student');
      setResult(res);
      
      // 3. Play Tamil Speech
      if (analysis.tamilSpeechText) {
        playSpeech(analysis.tamilSpeechText);
      }
      
      if (res.score > 0) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#0ea5e9', '#f59e0b']
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAssist = async () => {
    if (!image) {
      setAssistMessage("Kanna, first take a photo of the waste! 📸");
      return;
    }
    setAssistMessage(null);
    setIsAssisting(true);
    try {
      const analysis = await api.analyzeWasteImage(image);
      
      // Reward 5 points for seeking help/learning
      await api.recordScore({ ...analysis, score: 5, message: "Learning points!" }, user?.studentName || 'Student');

      // Play Tamil Speech
      if (analysis.tamilSpeechText) {
        playSpeech(analysis.tamilSpeechText);
      }

      setAssistMessage(
        <div className="space-y-2">
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="font-black text-sky-700"
          >
            {analysis.message}
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-sky-50 p-3 rounded-xl border border-sky-100"
          >
            <p className="text-xs font-bold text-sky-600 uppercase tracking-wider mb-1">Eco Teacher's Tip 🍎</p>
            <p className="text-sm text-slate-600 leading-relaxed">{analysis.educationalTip}</p>
          </motion.div>
        </div>
      );
    } catch (err) {
      setAssistMessage("Oops! My AI brain is a bit tired. Try again! 🌟");
    } finally {
      setIsAssisting(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setAssistMessage(null);
  };

  return (
    <div className="pb-24 pt-6 px-4 max-w-md mx-auto min-h-screen bg-sky-50 relative overflow-hidden">
      {/* Background Watermark */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 opacity-5 pointer-events-none">
        <Trophy size={300} className="text-emerald-900" />
      </div>

      <header className="flex items-center justify-between mb-8 relative z-10">
        <div>
          <h2 className="text-2xl font-black text-emerald-600 leading-tight">Green Madurai</h2>
          <div className="flex items-center gap-1 text-slate-500 text-xs font-bold">
            <MapPin size={12} /> {user?.school || 'Madurai'}
          </div>
        </div>
        <div className="bg-white p-2 rounded-2xl shadow-sm border border-emerald-100 flex items-center gap-2">
          <span className="text-xl">🌟</span>
          <span className="font-black text-emerald-600">120 pts</span>
        </div>
      </header>

      <main className="relative z-10">
        <AnimatePresence>
          {assistMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-4 bg-white p-4 rounded-2xl border-2 border-sky-200 shadow-lg flex items-start gap-3"
            >
              <div className="bg-sky-100 p-2 rounded-full shrink-0">
                <Sparkles className="text-sky-500" size={18} />
              </div>
              <p className="text-sm font-bold text-slate-700 leading-relaxed">
                {assistMessage}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {!image ? (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[2.5rem] p-8 shadow-xl border-4 border-emerald-50 text-center"
          >
            <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Camera size={48} className="text-emerald-500" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-4">Ready to save the earth?</h3>
            <p className="text-slate-500 mb-8">Take a photo of the waste you are handing over!</p>
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-6 rounded-3xl shadow-lg shadow-emerald-200 flex items-center justify-center gap-3 text-xl transition-all active:scale-95"
            >
              <Camera size={28} /> Take Photo
            </button>
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleCapture}
            />
          </motion.div>
        ) : (
          <div className="space-y-6">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white aspect-square"
            >
              <img src={image} alt="Waste" className="w-full h-full object-cover" />
              {isUploading && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                  <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="font-bold">AI is thinking...</p>
                </div>
              )}
            </motion.div>

            {!result ? (
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={reset}
                  className="bg-white text-slate-500 font-bold py-4 rounded-2xl border-2 border-slate-100"
                >
                  Retake
                </button>
                <button 
                  onClick={handleSubmit}
                  className="bg-emerald-500 text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2"
                >
                  <Upload size={20} /> Submit
                </button>
              </div>
            ) : (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`p-8 rounded-[2.5rem] shadow-xl text-center border-4 ${
                  result.score > 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'
                }`}
              >
                <div className="mb-4">
                  {result.score > 0 ? (
                    <CheckCircle2 size={64} className="text-emerald-500 mx-auto" />
                  ) : (
                    <XCircle size={64} className="text-rose-500 mx-auto" />
                  )}
                </div>
                <h4 className={`text-2xl font-black mb-2 ${result.score > 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {result.score > 0 ? `+${result.score} Points!` : `${result.score} Points`}
                </h4>
                <p className="text-slate-600 font-medium mb-6">{result.message}</p>
                
                {result.badgeUnlocked && (
                  <motion.div 
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-amber-100 p-4 rounded-2xl border-2 border-amber-200 mb-6 flex items-center gap-3 text-left"
                  >
                    <div className="bg-amber-400 p-2 rounded-full">
                      <Award className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">New Badge!</p>
                      <p className="font-black text-amber-900">🌱 Seed Starter</p>
                    </div>
                  </motion.div>
                )}

                <button 
                  onClick={reset}
                  className="w-full bg-white text-slate-800 font-bold py-4 rounded-2xl border-2 border-slate-200 shadow-sm"
                >
                  Done
                </button>
              </motion.div>
            )}
          </div>
        )}
      </main>

      {/* Quick Stats */}
      <section className="mt-12">
        <h3 className="text-lg font-black text-slate-800 mb-4">Class Progress</h3>
        <div className="bg-white p-6 rounded-3xl shadow-md border border-emerald-50">
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-bold text-slate-500">850 / 1000 pts</span>
            <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">🚜 Farm Visit</span>
          </div>
          <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '85%' }}
              className="h-full bg-emerald-500 rounded-full"
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-3 text-center font-bold">
            Only 150 more points to unlock the Farm Visit! Keep going! 🌟
          </p>
        </div>
      </section>
      {/* AI Akka Button - Jumping Bottom Right */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{ 
          y: isSpeaking ? [0, -15, 0] : [0, -10, 0],
          scale: isSpeaking ? [1, 1.1, 1] : 1,
          boxShadow: isSpeaking ? [
            "0 10px 15px -3px rgba(236, 72, 153, 0.3)",
            "0 20px 25px -5px rgba(236, 72, 153, 0.5)",
            "0 10px 15px -3px rgba(236, 72, 153, 0.3)"
          ] : "0 10px 15px -3px rgba(14, 165, 233, 0.3)"
        }}
        transition={{ 
          duration: isSpeaking ? 0.6 : 2, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        onClick={handleAssist}
        disabled={isAssisting || isSpeaking}
        className={`fixed bottom-28 right-6 w-20 h-20 text-white rounded-full shadow-xl flex flex-col items-center justify-center z-40 border-4 border-white active:scale-95 transition-colors ${
          isSpeaking ? 'bg-pink-500' : 'bg-sky-500'
        }`}
      >
        <div className="mb-1">
          {isAssisting ? (
            <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Sparkles size={28} strokeWidth={3} />
          )}
        </div>
        <span className="font-black text-[10px] uppercase tracking-tighter leading-none">
          {isSpeaking ? 'Speaking' : 'AI AKKA'}
        </span>
      </motion.button>
      <audio ref={audioRef} className="hidden" />
    </div>
  );
}
