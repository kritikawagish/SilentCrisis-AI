import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer id="global_footer" className="relative bg-cosmos-void border-t border-star-bright/5 mt-20">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-dawn/30 to-transparent" />
      <div className="max-w-[2400px] mx-auto py-16">
        <div className="grid grid-cols-12">
          <div className="col-span-12 px-4 md:col-start-2 md:col-span-10">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
              <div className="md:col-span-4">
                <div className="flex items-center gap-3 mb-5">
                  <svg width="24" height="24" viewBox="0 0 28 28" fill="none" className="text-amber-dawn">
                    <circle cx="14" cy="14" r="2" fill="currentColor" />
                    <circle cx="6" cy="6" r="1.2" fill="currentColor" opacity="0.7" />
                    <circle cx="22" cy="8" r="1.2" fill="currentColor" opacity="0.7" />
                    <circle cx="8" cy="22" r="1.2" fill="currentColor" opacity="0.7" />
                    <circle cx="22" cy="22" r="1.2" fill="currentColor" opacity="0.7" />
                  </svg>
                  <span className="font-display text-2xl text-star-bright">SilentCrisis</span>
                </div>
                <p className="text-lg font-extralight text-star-dim max-w-xs leading-relaxed">
                  Quiet vigilance for mental wellness. Patterns spoken before crises whisper.
                </p>
                <p className="text-lg font-extralight text-star-faint mt-5">
                  Early Warning Systems
                </p>
              </div>

              <div className="md:col-span-2">
                <p className="text-lg font-extralight uppercase tracking-wide-cosmic text-amber-dawn/70 mb-4">Product</p>
                <ul className="space-y-3">
                  <li><Link to="/how-it-works" className="text-lg font-extralight text-star-bright/70 hover:text-amber-dawn transition-colors">How It Works</Link></li>
                  <li><Link to="/dashboard" className="text-lg font-extralight text-star-bright/70 hover:text-amber-dawn transition-colors">Live Demo</Link></li>
                  <li><Link to="/pricing" className="text-lg font-extralight text-star-bright/70 hover:text-amber-dawn transition-colors">Pricing</Link></li>
                </ul>
              </div>

              <div className="md:col-span-2">
                <p className="text-lg font-extralight uppercase tracking-wide-cosmic text-amber-dawn/70 mb-4">For Whom</p>
                <ul className="space-y-3">
                  <li><Link to="/for-individuals" className="text-lg font-extralight text-star-bright/70 hover:text-amber-dawn transition-colors">Individuals</Link></li>
                  <li><Link to="/for-teams" className="text-lg font-extralight text-star-bright/70 hover:text-amber-dawn transition-colors">Teams & HR</Link></li>
                  <li><Link to="/science" className="text-lg font-extralight text-star-bright/70 hover:text-amber-dawn transition-colors">The Science</Link></li>
                </ul>
              </div>

              <div className="md:col-span-2">
                <p className="text-lg font-extralight uppercase tracking-wide-cosmic text-amber-dawn/70 mb-4">Company</p>
                <ul className="space-y-3">
                  <li><Link to="/about" className="text-lg font-extralight text-star-bright/70 hover:text-amber-dawn transition-colors">About</Link></li>
                  <li><Link to="/contact" className="text-lg font-extralight text-star-bright/70 hover:text-amber-dawn transition-colors">Contact</Link></li>
                  <li><a href="#" className="text-lg font-extralight text-star-bright/70 hover:text-amber-dawn transition-colors">Privacy</a></li>
                </ul>
              </div>

              <div className="md:col-span-2">
                <p className="text-lg font-extralight uppercase tracking-wide-cosmic text-amber-dawn/70 mb-4">Crisis Resources</p>
                <ul className="space-y-3">
                  <li><a href="tel:988" className="text-lg font-extralight text-star-bright/70 hover:text-warn-pink transition-colors">988 Lifeline</a></li>
                  <li><a href="#" className="text-lg font-extralight text-star-bright/70 hover:text-warn-pink transition-colors">Crisis Text</a></li>
                  <li><a href="#" className="text-lg font-extralight text-star-bright/70 hover:text-warn-pink transition-colors">Find Help</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-star-bright/5 py-5">
        <div className="max-w-[2400px] mx-auto">
          <div className="grid grid-cols-12">
            <div className="col-span-12 px-4 md:col-start-2 md:col-span-10 flex flex-col md:flex-row justify-between items-center gap-3">
              <p className="text-lg font-extralight text-star-faint">
                © {new Date().getFullYear()} SilentCrisis · Patterns spoken, crises prevented
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
