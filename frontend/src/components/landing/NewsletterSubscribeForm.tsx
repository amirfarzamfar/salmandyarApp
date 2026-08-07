'use client';

import { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';

export default function NewsletterSubscribeForm() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setEmail('');
      }, 3000);
    }
  }

  return (
    <div className="p-4 rounded-2xl bg-white/5 border border-slate-700/50 backdrop-blur">
      <p className="text-sm font-bold text-white mb-1 flex items-center gap-2">
        <Send size={16} className="text-teal-400" />
        خبرنامه سلامت سالمندیار
      </p>
      <p className="text-xs text-slate-400 mb-3">مقالات تخصصی و تخفیف‌های ویژه را از دست ندهید</p>
      {submitted ? (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm font-bold">
          <CheckCircle2 size={16} />
          عضویت شما با موفقیت ثبت شد ✅
        </div>
      ) : (
        <form className="flex gap-2" onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ایمیل خود را وارد کنید"
            className="flex-1 px-4 py-2.5 rounded-xl text-sm bg-slate-800/50 border border-slate-700 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-white placeholder-slate-500"
            dir="ltr"
            required
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-l from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-teal-500/20 transition"
          >
            عضویت
          </button>
        </form>
      )}
    </div>
  );
}
