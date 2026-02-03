import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const WhatsAppFloat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showButton, setShowButton] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleWhatsApp = (message: string) => {
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/5511999999999?text=${encodedMessage}`, '_blank');
    setIsOpen(false);
  };
  
  const quickMessages = [
    'Olá! Gostaria de solicitar um orçamento.',
    'Quero saber mais sobre os serviços.',
    'Preciso de ajuda com meu projeto.',
  ];

  return (
    <AnimatePresence>
      {showButton && (
        <div className="fixed bottom-6 right-6 z-50">
          {/* Chat popup */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                className="absolute bottom-20 right-0 w-80 glass-card rounded-2xl shadow-2xl overflow-hidden mb-2"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                        <MessageCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold">IdealHub</p>
                        <p className="text-xs text-white/80">Online agora</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setIsOpen(false)}
                      className="p-1 hover:bg-white/20 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                {/* Body */}
                <div className="p-4 space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Olá! 👋 Como podemos ajudar você hoje?
                  </p>
                  
                  <div className="space-y-2">
                    {quickMessages.map((message, index) => (
                      <button
                        key={index}
                        onClick={() => handleWhatsApp(message)}
                        className="w-full text-left p-3 rounded-xl bg-muted/50 hover:bg-primary/10 hover:text-primary text-sm transition-colors"
                      >
                        {message}
                      </button>
                    ))}
                  </div>
                  
                  <Button 
                    onClick={() => handleWhatsApp('Olá!')}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Iniciar conversa
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Float button */}
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(!isOpen)}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30 flex items-center justify-center pulse-glow"
          >
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                >
                  <X className="w-7 h-7" />
                </motion.div>
              ) : (
                <motion.div
                  key="open"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                >
                  <MessageCircle className="w-7 h-7" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
          
          {/* Notification dot */}
          {!isOpen && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold"
            >
              1
            </motion.div>
          )}
        </div>
      )}
    </AnimatePresence>
  );
};

export default WhatsAppFloat;
