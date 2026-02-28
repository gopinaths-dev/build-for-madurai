import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trophy, Crown, Star, TrendingUp } from 'lucide-react';
import { api } from '../services/api';

export default function Leaderboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.getLeaderboard().then(setData);
  }, []);

  if (!data) return null;

  return (
    <div className="pb-24 pt-6 px-4 max-w-md mx-auto min-h-screen bg-sky-50">
      <header className="text-center mb-8">
        <div className="inline-block bg-white p-4 rounded-full shadow-lg border-4 border-emerald-100 mb-4">
          <Trophy size={48} className="text-amber-400" />
        </div>
        <h1 className="text-3xl font-black text-slate-800">Eco Heroes</h1>
        <p className="text-slate-500 font-bold">Class 3-C Leaderboard</p>
      </header>

      <div className="space-y-3">
        {data.students.map((student: any, index: number) => (
          <motion.div
            key={student.id}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-white p-4 rounded-2xl shadow-sm border-2 flex items-center justify-between ${
              index === 0 ? 'border-amber-200 bg-amber-50/30' : 'border-slate-50'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 flex items-center justify-center font-black text-xl">
                {index === 0 ? <Crown className="text-amber-400" /> : index + 1}
              </div>
              <div>
                <p className="font-black text-slate-800">{student.name}</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Rank {student.rank}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-black text-emerald-600 text-lg">{student.points}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Points</p>
            </div>
          </motion.div>
        ))}
      </div>

      <section className="mt-12 bg-emerald-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-emerald-200">
        <div className="flex items-center gap-3 mb-4">
          <Star className="text-amber-300 fill-amber-300" />
          <h3 className="text-xl font-black">Class Goal</h3>
        </div>
        <p className="text-emerald-100 font-bold mb-6">
          We are almost there! When we hit 1000 points, we all go for a <span className="text-white underline underline-offset-4 decoration-amber-300">{data.reward}</span>!
        </p>
        
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-black inline-block py-1 px-2 uppercase rounded-full bg-emerald-700 text-emerald-100">
                Progress
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-black inline-block text-emerald-100">
                {Math.round((data.classTotal / data.threshold) * 100)}%
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-3 mb-4 text-xs flex rounded-full bg-emerald-800">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(data.classTotal / data.threshold) * 100}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-amber-400"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-200">
          <TrendingUp size={14} />
          <span>{data.threshold - data.classTotal} points to go!</span>
        </div>
      </section>
    </div>
  );
}
