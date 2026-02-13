import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Heart, Volume2, VolumeX, Sparkles } from 'lucide-react';

const messages = [
  "Are you sure?",
  "Really sure?",
  "Think again...",
  "Last chance!",
  "Surely not?",
  "You might regret this!",
  "Give it another thought!",
  "Are you absolutely certain?",
  "This could be a mistake!",
  "Have a heart!",
  "Don't be so cold!",
  "Change of heart?",
  "Wouldn't you reconsider?",
  "Is that your final answer?",
  "You're breaking my heart ;(",
];

export default function App() {
  const [noCount, setNoCount] = useState(0);
  const [yesPressed, setYesPressed] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const audioContextRef = useRef(null);

  // Audio System
  const initAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  };

  const playNote = (freq, duration, type = 'sine') => {
    if (!audioEnabled || !audioContextRef.current) return;
    const osc = audioContextRef.current.createOscillator();
    const gain = audioContextRef.current.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioContextRef.current.currentTime);
    gain.gain.setValueAtTime(0.05, audioContextRef.current.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioContextRef.current.destination);
    osc.start();
    osc.stop(audioContextRef.current.currentTime + duration);
  };



  // Better Music Loop using useEffect
  useEffect(() => {
    let timeoutId;
    let noteIndex = 0;
    const notes = [261.63, 329.63, 392.00, 523.25];

    const playLoop = () => {
      if (audioEnabled && isPlaying && audioContextRef.current) {
        playNote(notes[noteIndex], 1.5);
        noteIndex = (noteIndex + 1) % notes.length;
        timeoutId = setTimeout(playLoop, 400);
      }
    };

    if (isPlaying && audioEnabled) {
      initAudio();
      playLoop();
    }

    return () => clearTimeout(timeoutId);
  }, [isPlaying, audioEnabled]);

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
    setIsPlaying(!isPlaying);
    if (!audioEnabled) initAudio();
  };

  const handleNoClick = () => {
    setNoCount(noCount + 1);
    // Play a "bonk" or sad sound?
    if (audioEnabled) playNote(150, 0.3, 'sawtooth');
  };

  const handleYesClick = () => {
    setYesPressed(true);
    if (audioEnabled) {
      // Success chime
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        setTimeout(() => playNote(freq, 2, 'triangle'), i * 100);
      });
    }
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff6b81', '#ff4757', '#ffffff']
    });
    
    // Continuous confetti
    const duration = 3000;
    const end = Date.now() + duration;
    const frame = () => {
        confetti({
            particleCount: 2,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#ff6b81', '#ff4757']
        });
        confetti({
            particleCount: 2,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#ff6b81', '#ff4757']
        });
        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    };
    frame();
  };

  const yesButtonSize = noCount * 15 + 24;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-red-100 flex flex-col items-center justify-center overflow-hidden relative font-sans text-gray-800">
      
      {/* Background Hearts */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-pink-300 opacity-20"
            initial={{ y: "110vh", x: Math.random() * 100 + "vw", scale: 0.5 }}
            animate={{ 
              y: "-10vh", 
              rotate: 360,
              scale: 1.5
            }}
            transition={{ 
              duration: Math.random() * 10 + 10, 
              repeat: Infinity, 
              ease: "linear",
              delay: Math.random() * 10 
            }}
          >
            <Heart size={Math.random() * 30 + 20} fill="currentColor" />
          </motion.div>
        ))}
      </div>

      {/* Audio Control */}
      <button 
        onClick={toggleAudio}
        className="absolute top-5 right-5 p-3 rounded-full bg-white/50 hover:bg-white/80 transition-colors z-50 text-pink-600"
      >
        {audioEnabled ? <Volume2 /> : <VolumeX />}
      </button>

      <AnimatePresence mode="wait">
        {yesPressed ? (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center z-10"
          >
            <motion.div 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="mb-8 flex justify-center text-pink-500"
            >
              <Heart size={100} fill="currentColor" />
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-bold text-pink-600 mb-4 drop-shadow-sm font-handwriting">
              Yay! Best Day Ever!
            </h1>
            <p className="text-xl text-gray-600">I knew you'd say yes! ❤️</p>
          </motion.div>
        ) : (
          <motion.div 
            key="question"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center z-10 w-full max-w-sm px-6 flex flex-col items-center justify-center"
          >
            <h1 className="text-3xl md:text-5xl font-bold text-pink-600 mb-12 drop-shadow-sm leading-tight h-32 flex items-center justify-center">
              Will you be my Valentine?
            </h1>
            
            <div className="flex flex-col items-center justify-center gap-6 w-full relative min-h-[300px]">
              <motion.button
                className="bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:from-pink-600 hover:to-rose-600 transition-all z-20 flex items-center justify-center whitespace-nowrap overflow-hidden"
                style={{ 
                  fontSize: Math.min(yesButtonSize, 120), // Cap size to prevent overflow
                  padding: `${Math.max(12, yesButtonSize/3)}px ${Math.max(24, yesButtonSize/1.5)}px`
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleYesClick}
              >
                Yes
              </motion.button>

              <NoButton 
                noCount={noCount} 
                onClick={handleNoClick} 
                text={noCount > 0 ? messages[noCount % messages.length] : "No"} 
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const NoButton = ({ noCount, onClick, text }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const buttonRef = useRef(null);

  const moveButton = () => {
    if (noCount < 1) return;

    // Calculate safe bounds (10% padding from edges)
    const padding = 20;
    const buttonWidth = buttonRef.current ? buttonRef.current.offsetWidth : 100;
    const buttonHeight = buttonRef.current ? buttonRef.current.offsetHeight : 50;
    
    // Calculate max displacement from center
    const maxX = (window.innerWidth / 2) - (buttonWidth / 2) - padding;
    const maxY = (window.innerHeight / 2) - (buttonHeight / 2) - padding;

    const randomX = (Math.random() * 2 - 1) * maxX;
    const randomY = (Math.random() * 2 - 1) * maxY;
    
    setPosition({ x: randomX, y: randomY });
  };

  const isRunaway = noCount >= 1;

  return (
    <motion.button
      ref={buttonRef}
      className="bg-gray-200 text-gray-600 font-semibold py-3 px-8 rounded-full hover:bg-gray-300 transition-colors z-30"
      style={isRunaway ? { 
        position: 'fixed', 
        left: 'calc(50% - 50px)', // Center horizontally initially
        top: 'calc(50% - 25px)'  // Center vertically initially
      } : {}}
      animate={isRunaway ? { x: position.x, y: position.y } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onMouseEnter={isRunaway ? moveButton : undefined}
      onTouchStart={isRunaway ? (e) => { e.preventDefault(); moveButton(); } : undefined}
      onClick={onClick}
    >
      {text}
    </motion.button>
  );
};
