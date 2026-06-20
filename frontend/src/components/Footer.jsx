import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-vault-900/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-display font-bold text-xl mb-3">
              Prop<span className="text-vault-gold">Vault</span>
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Pakistan's next-generation property platform. Buy, sell, and rent with verified agents and secure OTP authentication.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Platform</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li><Link to="/properties" className="hover:text-vault-gold transition">Browse Properties</Link></li>
              <li><Link to="/auth/register" className="hover:text-vault-gold transition">Register</Link></li>
              <li><Link to="/auth/login" className="hover:text-vault-gold transition">Login</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">For Agents</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li><Link to="/auth/register" className="hover:text-vault-gold transition">Become an Agent</Link></li>
              <li>Admin Approval Required</li>
              <li>List & Manage Properties</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Contact</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li>ranahammad9795@gmail.com</li>
              <li>Islamabad, Pakistan</li>
              <li className="text-vault-gold/60">+92 300 1234567</li></ul>
          </div>
        </div>
        <div className="border-t border-white/5 mt-8 pt-6 text-center text-slate-500 text-xs">
          © 2026 PropVault. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
