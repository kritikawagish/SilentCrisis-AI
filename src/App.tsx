import React, { Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import ScrollToTop from './components/ScrollToTop';
import Nav from './components/Nav';
import Footer from './components/Footer';

/*
  All page imports are lazy-loaded.
  Each page is only downloaded when the user navigates to it.
  This cuts the initial bundle size significantly.
*/
const Home = lazy(() => import('./pages/Home'));
const HowItWorks = lazy(() => import('./pages/HowItWorks'));
const ForIndividuals = lazy(() => import('./pages/ForIndividuals'));
const ForTeams = lazy(() => import('./pages/ForTeams'));
const Science = lazy(() => import('./pages/Science'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const CheckIn = lazy(() => import('./pages/CheckIn'));
const Pricing = lazy(() => import('./pages/Pricing'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));

/*
  Fallback shown during page load — matches the site background
  so there's no flash of white.
*/
function PageLoader() {
  return (
    <div className="min-h-screen bg-cosmos-void flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-amber-dawn/30 border-t-amber-dawn rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  const location = useLocation();

  return (
    <>
      <ScrollToTop />
      <Nav />
      <main className="min-h-screen">
        <Suspense fallback={<PageLoader />}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Home />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/for-individuals" element={<ForIndividuals />} />
              <Route path="/for-teams" element={<ForTeams />} />
              <Route path="/science" element={<Science />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/check-in" element={<CheckIn />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
