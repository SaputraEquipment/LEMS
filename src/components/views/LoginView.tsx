import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FlaskConical, Shield, KeyRound, UserCheck, Eye, Sparkles } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, loginAsGuest, companyProfile } = useApp();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('••••••••');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(username, password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-[#172554] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-4 rounded-3xl bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-600 text-white shadow-2xl shadow-blue-500/30 mb-4 ring-8 ring-slate-900/60">
            <FlaskConical className="w-10 h-10 stroke-[2]" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-wider">LEMS</h1>
          <p className="text-sm font-semibold text-blue-300 mt-1">
            Laboratory Equipment Management System
          </p>
          <p className="text-xs text-slate-400 mt-0.5">{companyProfile.labName}</p>
        </div>

        {/* Card Shell */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-200/80 p-8 shadow-2xl text-slate-800">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Sign In to LEMS</h2>
              <p className="text-xs text-slate-500">Quality Control & Compliance Portal</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-blue-50 text-blue-700 border border-blue-200">
              ISO 17025
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Username
              </label>
              <div className="relative">
                <UserCheck className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Enter username (e.g. admin, tech_sarah)"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-slate-900 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-slate-900 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
              </div>
            </div>

            {/* Default Admin Notice */}
            <div className="p-3 bg-blue-50/80 border border-blue-200/80 rounded-2xl text-[11px] text-blue-900 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">System Default Account:</strong>
                <p className="text-[10px] text-blue-700 mt-0.5">
                  Use <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">admin</code> or <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">tech_sarah</code> for full access. Any password works in demo.
                </p>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white font-bold text-xs shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 hover:from-blue-800 hover:to-indigo-800 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              <Shield className="w-4 h-4" />
              Log In to Dashboard
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold">
              <span className="bg-white px-3 text-slate-400">Or Continue As</span>
            </div>
          </div>

          <button
            type="button"
            onClick={loginAsGuest}
            className="w-full py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4 text-sky-600" />
            👁️ Log In as Guest (View-Only Observer)
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-slate-400 mt-6">
          © {new Date().getFullYear()} {companyProfile.companyName} • {companyProfile.isoStandard}
        </p>
      </div>
    </div>
  );
};
