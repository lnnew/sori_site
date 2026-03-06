import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import Navigation from './components/Navigation';
import Home from './pages/Home';
import About from './pages/About';
import Numbers from './pages/Numbers';
import Creators from './pages/Creators';
import BehindTheScenes from './pages/BehindTheScenes';
import MiniGamesContainer from './pages/MiniGamesContainer';

import './index.css';

// Background Particle Effect
const Particles = () => {
  const arr = Array.from({ length: 20 });
  return (
    <div className="particles-container">
      <div className="safari-overlay"></div>
      {arr.map((_, i) => {
        const size = Math.random() * 4 + 1;
        const left = Math.random() * 100;
        const animDuration = Math.random() * 20 + 10;
        const delay = Math.random() * 20;

        return (
          <div
            key={i}
            className="particle"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              left: `${left}%`,
              animationDuration: `${animDuration}s`,
              animationDelay: `-${delay}s`
            }}
          />
        );
      })}
    </div>
  );
};

const SECTIONS = [
  { id: "home", title: "HOME", component: Home },
  { id: "about", title: "CAST & CHARACTERS", component: About },
  { id: "numbers", title: "NUMBERS", component: Numbers },
  { id: "creators", title: "CREATORS", component: Creators },
  { id: "bts", title: "BEHIND THE SCENES", component: BehindTheScenes },
  { id: "game", title: "MINI GAMES", component: MiniGamesContainer },
];

function App() {
  const [activeSection, setActiveSection] = useState("home");
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            const section = SECTIONS.find(s => s.id === id);

            if (section && activeSection !== id) {
              setActiveSection(id);
            }
          }
        });
      },
      { threshold: 0.3 } // Trigger when 30% of the section is visible
    );

    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => {
      SECTIONS.forEach((s) => {
        const el = document.getElementById(s.id);
        if (el) observer.unobserve(el);
      });
    };
  }, [activeSection]);

  return (
    <div className="app-container" style={{ overflowY: 'auto', height: '100vh', scrollBehavior: 'smooth' }}>
      <Particles />

      {/* Floating Section Title Popup Removed */}

      <div className="content-wrapper">
        {SECTIONS.map((section) => (
          <section
            key={section.id}
            id={section.id}
            style={{ minHeight: '100vh', width: '100%', position: 'relative' }}
          >
            <section.component />
          </section>
        ))}
      </div>

      <Navigation activeSection={activeSection} />
    </div>
  );
}

export default App;
