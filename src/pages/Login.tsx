import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { School, GraduationCap, User, ArrowRight } from 'lucide-react';

const schools = ["Madurai Public School", "Temple City Academy", "Green Valley School"];
const classes = ["Class 1-A", "Class 2-B", "Class 3-C"];

export default function Login() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    school: '',
    className: '',
    studentName: ''
  });
  const navigate = useNavigate();

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else {
      localStorage.setItem('user', JSON.stringify(formData));
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-sky-50 flex flex-col items-center justify-center p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border-4 border-emerald-100"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-emerald-600 mb-2">Vanakkam! 🙏</h1>
          <p className="text-slate-500">Let's set up your Eco-Profile</p>
        </div>

        <div className="space-y-6">
          {step === 1 && (
            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <School size={18} className="text-emerald-500" /> Select School
              </label>
              <div className="grid gap-3">
                {schools.map(s => (
                  <button
                    key={s}
                    onClick={() => setFormData({ ...formData, school: s })}
                    className={`p-4 rounded-2xl border-2 transition-all text-left ${
                      formData.school === s ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 hover:border-emerald-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <GraduationCap size={18} className="text-emerald-500" /> Select Class
              </label>
              <div className="grid gap-3">
                {classes.map(c => (
                  <button
                    key={c}
                    onClick={() => setFormData({ ...formData, className: c })}
                    className={`p-4 rounded-2xl border-2 transition-all text-left ${
                      formData.className === c ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 hover:border-emerald-200'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <User size={18} className="text-emerald-500" /> Your Name
              </label>
              <input
                type="text"
                placeholder="Enter your name..."
                value={formData.studentName}
                onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                className="w-full p-4 rounded-2xl border-2 border-slate-100 focus:border-emerald-500 outline-none transition-all"
              />
            </motion.div>
          )}

          <button
            disabled={
              (step === 1 && !formData.school) ||
              (step === 2 && !formData.className) ||
              (step === 3 && !formData.studentName)
            }
            onClick={handleNext}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all mt-4"
          >
            {step === 3 ? 'Start Saving Madurai!' : 'Next'} <ArrowRight size={20} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
