import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  ArrowRight, 
  MessageSquare, 
  Zap, 
  Layout, 
  BarChart3, 
  Send, 
  Mail,
  Play,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Target,
  FileText,
  Code,
  Rocket,
  Loader2,
  User,
  Database,
  Bell
} from 'lucide-react';
import { getContent } from './services/api';
import Admin from './admin/Admin';

// --- Public Components ---

const Logo = () => (
  <div className="flex items-center gap-3">
    <div className="bg-[#1e293b] text-white px-3 py-2 rounded-lg font-black text-xl leading-none flex items-center justify-center relative">
      BRB
      <span className="absolute top-1 right-1 text-[6px] font-bold opacity-80">TM</span>
    </div>
    <div className="h-8 w-[1px] bg-slate-200 mx-1"></div>
    <div className="text-xl font-light tracking-[0.15em] text-[#1e293b] uppercase">
      Roman Dev
    </div>
  </div>
);

const Navbar = ({ content }: { content: any }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Кейси', href: '#cases' },
    { name: 'Процес', href: '#process' },
    { name: 'Про мене', href: '#about' },
    { name: 'Контакти', href: '#contact' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'}`}>
      <div className="container-custom flex items-center justify-between">
        <a href="#" className="flex items-center">
          <Logo />
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link, i) => (
            <a key={i} href={link.href} className="text-sm font-medium text-slate-600 hover:text-accent transition-colors">
              {link.name}
            </a>
          ))}
          <a href="#contact" className="btn-primary py-2.5 px-6 text-sm">
            {content?.primaryButtonText || 'Обговорити проєкт'}
          </a>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-slate-900" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-white border-t border-slate-100 p-6 shadow-xl md:hidden"
          >
            <div className="flex flex-col gap-6">
              {navLinks.map((link, i) => (
                <a 
                  key={i} 
                  href={link.href} 
                  className="text-lg font-medium text-slate-900"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <a href="#contact" className="btn-primary text-center" onClick={() => setIsMenuOpen(false)}>
                {content?.primaryButtonText || 'Обговорити проєкт'}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = ({ content, onOpenVideo }: { content: any, onOpenVideo: () => void }) => {
  const smoothTransition = { duration: 0.8, ease: [0.16, 1, 0.3, 1] };
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Animation settings for the sequential flow
  const stepDuration = 1.2; // Total time for one step (fade + flashes)
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationKey(prev => prev + 1);
    }, 7000); // Restart every 7 seconds (4 steps * 1.2s + pause)
    return () => clearInterval(interval);
  }, []);

  const subtitle = content?.subtitle || 'Ваш сайт — це не просто картинка, а повноцінний відділ продажів 24/7.';
  const lines = subtitle.split('\n');
  const previewLines = lines.slice(0, 3).join('\n');
  const hasMore = lines.length > 3;
  
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-24 overflow-hidden">
      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={smoothTransition}
            className="max-w-2xl"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 leading-[1.1] mb-6">
              {content?.title || 'Будую автономні системи залучення клієнтів'}
            </h1>
            <div className="text-lg md:text-xl text-slate-600 mb-8 leading-relaxed max-w-xl whitespace-pre-line">
              {isExpanded ? subtitle : previewLines}
              {!isExpanded && hasMore && '...'}
              {hasMore && (
                <button 
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="ml-2 text-accent font-bold hover:underline focus:outline-none"
                >
                  {isExpanded ? (content?.collapseLabel || 'згорнути') : (content?.readMoreLabel || 'докладніше')}
                </button>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <motion.a 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href="#contact" 
                className="btn-primary flex items-center justify-center gap-2 py-3.5 px-8"
              >
                {content?.primaryButtonText || 'Обговорити проєкт'} <ArrowRight size={20} />
              </motion.a>
              <motion.a 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href="#audit" 
                className="btn-secondary flex items-center justify-center gap-2 py-3.5 px-8"
              >
                {content?.secondaryButtonText || 'Отримати відео-розбір'} <Play size={18} />
              </motion.a>
            </div>

            <div className="flex flex-wrap gap-6">
              {[
                { text: content?.badge1 || 'Відповідаю протягом дня' },
                { text: content?.badge2 || 'Безкоштовний розбір перед стартом' }
              ].map((badge, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...smoothTransition, delay: 0.4 + (i * 0.1) }}
                  className="flex items-center gap-2 text-slate-500"
                >
                  <CheckCircle2 size={18} className="text-accent" />
                  <span className="text-sm font-medium">{badge.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Visual Flow Column - Static Container with Looping Sequential Animation */}
          <div className="relative mt-16 lg:mt-0">
            <div className="bg-slate-50 rounded-[40px] p-8 border border-slate-100 relative overflow-hidden max-w-md mx-auto lg:ml-auto shadow-sm">
              {/* Background Glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-accent/5 blur-[80px] rounded-full" />
              
              <div key={animationKey} className="relative space-y-8">
                {[
                  { icon: <User size={24} />, label: content?.flowLabel1 || 'Крок 01', title: content?.flowLead || 'Заявка' },
                  { icon: <Send size={24} />, label: content?.flowLabel2 || 'Крок 02', title: content?.flowTelegram || 'Telegram' },
                  { icon: <Database size={24} />, label: content?.flowLabel3 || 'Крок 03', title: content?.flowCRM || 'CRM' },
                  { icon: <Bell size={24} />, label: content?.flowLabel4 || 'Крок 04', title: content?.flowReminder || 'Нагадування' }
                ].map((step, i, arr) => {
                  const baseDelay = 0.5 + (i * stepDuration);
                  
                  return (
                    <React.Fragment key={i}>
                      <div className="relative">
                        {/* Step Container Fades In */}
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.4, delay: baseDelay }}
                          className="flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-4">
                            {/* Icon with Subtle Flicker Animation */}
                            <motion.div 
                              initial={{ backgroundColor: "#ffffff", scale: 1, boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)" }}
                              animate={{ 
                                backgroundColor: [
                                  "#ffffff", 
                                  "#3b82f6", // Flash 1 (Blue)
                                  "#ffffff", 
                                  "#3b82f6", // Flash 2 (Blue)
                                  "#ffffff"  // Final state
                                ],
                                scale: [1, 1.05, 1, 1.05, 1],
                                boxShadow: [
                                  "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                                  "0 4px 6px -1px rgba(59, 130, 246, 0.3)",
                                  "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                                  "0 4px 6px -1px rgba(59, 130, 246, 0.3)",
                                  "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
                                ]
                              }}
                              transition={{ 
                                duration: 0.8, 
                                delay: baseDelay + 0.4,
                                times: [0, 0.25, 0.5, 0.75, 1]
                              }}
                              className="w-12 h-12 rounded-xl border border-slate-100 flex items-center justify-center text-accent"
                            >
                              {step.icon}
                            </motion.div>

                            <div>
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{step.label}</div>
                              <div className="text-lg font-bold text-slate-900">{step.title}</div>
                            </div>
                          </div>

                          {/* Completion Checkmark */}
                          <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ 
                              type: "spring",
                              stiffness: 300,
                              damping: 20,
                              delay: baseDelay + 1.0 
                            }}
                            className="text-green-500"
                          >
                            <CheckCircle2 size={20} />
                          </motion.div>
                        </motion.div>

                        {/* Arrow between steps - Fades in after the step flashes and checkmark appears */}
                        {i < arr.length - 1 && (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.4, delay: baseDelay + stepDuration - 0.1 }}
                            className="ml-6 h-8 w-px bg-gradient-to-b from-accent/40 to-transparent" 
                          />
                        )}
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Learn More Button - Moved Outside Block */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 5.5, duration: 0.6 }}
              className="mt-8 text-center"
            >
              <button 
                onClick={onOpenVideo}
                className="inline-flex items-center gap-3 text-slate-900 font-bold hover:text-accent transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center group-hover:bg-accent group-hover:text-white group-hover:border-accent transition-all">
                  <Play size={18} fill="currentColor" />
                </div>
                <span className="text-lg">{content?.moreButtonText || 'Докладніше про систему'}</span>
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Problem = ({ items, content }: { items: any[], content: any }) => {
  return (
    <section className="section-padding bg-slate-900 text-white">
      <div className="container-custom">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            {content?.title || 'Чому ваш маркетинг не приносить грошей?'}
          </h2>
          {content?.subtitle && (
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              {content.subtitle}
            </p>
          )}
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((p, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`p-6 sm:p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors ${i === 2 ? 'md:col-span-2 lg:col-span-1' : ''}`}
            >
              <AlertCircle className="text-accent mb-6" size={32} />
              <h3 className="text-xl font-bold mb-4">{p.title}</h3>
              <p className="text-slate-400 leading-relaxed">{p.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Solution = ({ items, content }: { items: any[], content: any }) => {
  const iconMap: any = {
    Layout: <Layout className="text-accent" size={32} />,
    Zap: <Zap className="text-accent" size={32} />,
    MessageSquare: <MessageSquare className="text-accent" size={32} />
  };

  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            {content?.title || 'Ми перетворюємо ваш сайт на автономний відділ продажів'}
          </h2>
          {content?.subtitle && (
            <p className="text-xl text-slate-600">
              {content.subtitle}
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((s, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.8, 
                delay: i * 0.2,
                ease: [0.21, 0.47, 0.32, 0.98]
              }}
              whileHover={{ y: -10 }}
              className={`card-base text-center flex flex-col items-center group p-8 ${i === 2 ? 'md:col-span-2 lg:col-span-1' : ''}`}
            >
              <motion.div 
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="mb-8 p-5 bg-blue-50 rounded-2xl group-hover:bg-accent group-hover:text-white transition-colors duration-500"
              >
                {iconMap[s.icon_name] || <Zap className="text-accent" size={32} />}
              </motion.div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">{s.title}</h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                {s.result}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const SpeedSection = ({ content }: { content: any }) => {
  return (
    <section className="section-padding bg-slate-900 text-white overflow-hidden">
      <div className="container-custom">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8 leading-tight">
              {content?.title || 'Швидкість — це ваша головна конкурентна перевага'}
            </h2>
            <p className="text-lg text-slate-400 mb-8 leading-relaxed">
              {content?.subtitle || 'У 2024 році клієнт не чекає. Він купує там, де йому відповіли першим.'}
            </p>
            <div className="space-y-6">
              {content?.features?.map((item: any, i: number) => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent shrink-0">
                    <Zap size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">{item.title}</h4>
                    <p className="text-sm text-slate-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-video rounded-[32px] bg-slate-800 border border-white/10 p-8 flex flex-col justify-center items-center text-center">
              <div className="text-6xl font-black mb-4">
                <span className="text-white text-4xl mr-2">{content?.statPrefix || 'до'}</span>
                <span className="text-accent">{content?.statValue || '+400%'}</span>
              </div>
              <div className="text-xl font-bold mb-2">{content?.statLabel || 'Ріст конверсії в продаж'}</div>
              <p className="text-slate-500 max-w-xs">{content?.statDesc || 'при відповіді клієнту в перші 5 хвилин'}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const ROICalculator = ({ content }: { content: any }) => {
  const [traffic, setTraffic] = useState(1000);
  const [conv, setConv] = useState(1);
  const [check, setCheck] = useState(5000);

  const currentRevenue = traffic * (conv / 100) * check;
  const potentialRevenue = traffic * (5 / 100) * check; 
  const increase = potentialRevenue - currentRevenue;

  return (
    <section id="roi" className="section-padding bg-white">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">{content?.title || 'Скільки грошей ви втрачаєте щомісяця?'}</h2>
            <div className="text-slate-600 whitespace-pre-line">
              {content?.description || 'Розрахуйте потенційний прибуток, який ви недоотримуєте через низьку конверсію.'}
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center bg-slate-50 p-8 md:p-12 rounded-[40px] border border-slate-100">
            <div className="space-y-8">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">{content?.labelTraffic || 'Трафік (кількість кліків)'}</label>
                <input 
                  type="range" min="100" max="10000" step="100" 
                  value={traffic} onChange={(e) => setTraffic(Number(e.target.value))}
                  className="w-full accent-accent"
                />
                <div className="flex justify-between mt-2 font-mono text-sm text-slate-500">
                  <span>100</span>
                  <span className="text-accent font-bold">{traffic}</span>
                  <span>10 000</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">{content?.labelConversion || 'Поточна конверсія (%)'}</label>
                <input 
                  type="range" min="0.1" max="5" step="0.1" 
                  value={conv} onChange={(e) => setConv(Number(e.target.value))}
                  className="w-full accent-accent"
                />
                <div className="flex justify-between mt-2 font-mono text-sm text-slate-500">
                  <span>0.1%</span>
                  <span className="text-accent font-bold">{conv}%</span>
                  <span>5%</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">{content?.labelCheck || 'Середній чек (грн)'}</label>
                <input 
                  type="number" 
                  value={check} onChange={(e) => setCheck(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all font-bold text-slate-900"
                />
              </div>
            </div>

            <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="mb-8">
                  <div className="text-slate-400 text-sm mb-1">{content?.labelCurrentRevenue || 'Поточний дохід:'}</div>
                  <div className="text-2xl font-bold">{currentRevenue.toLocaleString()} грн</div>
                </div>
                <div className="mb-8">
                  <div className="text-slate-400 text-sm mb-1">{content?.labelPotentialRevenue || 'Потенціал (при 5% конверсії):'}</div>
                  <div className="text-4xl font-black text-accent">{potentialRevenue.toLocaleString()} грн</div>
                </div>
                <div className="pt-6 border-t border-white/10">
                  <div className="text-accent text-sm font-bold uppercase tracking-widest mb-1">{content?.labelLostProfit || 'Ваша недоотримана вигода:'}</div>
                  <div className="text-3xl font-bold text-white">+{increase > 0 ? `${increase.toLocaleString()}` : '0'} грн / міс.</div>
                </div>
              </div>
            </div>
          </div>
          
          {content?.example && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-12 p-6 bg-accent/5 border border-accent/10 rounded-3xl text-center italic text-slate-700 max-w-2xl mx-auto"
            >
              {content.example}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

const CaseModal = ({ isOpen, onClose, caseData, content }: { isOpen: boolean, onClose: () => void, caseData: any, content: any, key?: any }) => {
  if (!isOpen || !caseData) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/90 backdrop-blur-md"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-5xl bg-white rounded-[40px] shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-hide"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-20 w-10 h-10 bg-white/80 hover:bg-white backdrop-blur-md rounded-full flex items-center justify-center text-slate-900 shadow-lg transition-all hover:scale-110 active:scale-95"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col lg:flex-row min-h-[500px]">
          {/* Left Side: Image & Action */}
          <div className="lg:w-[40%] bg-slate-50 p-6 lg:p-10 flex flex-col gap-8 border-b lg:border-b-0 lg:border-r border-slate-100">
            <div className="relative group rounded-3xl overflow-hidden shadow-2xl aspect-square lg:aspect-auto lg:h-[350px]">
              <img 
                src={caseData.image} 
                alt={caseData.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            
            <div className="flex flex-col gap-4">
              <a 
                href={caseData.link || "#"} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-primary flex items-center justify-center gap-3 text-base py-4 px-6 shadow-blue-500/20 shadow-xl"
              >
                <span>{content?.visitSiteLabel || 'Відвідати сайт'}</span>
                <ArrowRight size={20} />
              </a>
              <p className="text-xs text-center text-slate-400 font-medium uppercase tracking-widest">
                {content?.visitSiteHint || 'Натисніть, щоб побачити результат наживо'}
              </p>
            </div>
          </div>

          {/* Right Side: Content */}
          <div className="lg:w-[60%] p-8 lg:p-16 flex flex-col">
            <div className="mb-10">
              <div className="inline-block px-4 py-1.5 bg-accent/10 text-accent rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                {caseData.niche}
              </div>
              <h2 className="text-3xl lg:text-5xl font-black text-slate-900 leading-tight">
                {caseData.title}
              </h2>
            </div>
            
            <div className="grid gap-10">
              <div className="relative pl-6 border-l-4 border-slate-100 hover:border-accent transition-colors">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">{content?.problemLabel || 'Проблема'}</h4>
                <p className="text-slate-600 text-lg leading-relaxed">{caseData.detailed_problem || caseData.problem}</p>
              </div>
              
              <div className="relative pl-6 border-l-4 border-slate-100 hover:border-accent transition-colors">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">{content?.solutionLabel || 'Рішення'}</h4>
                <p className="text-slate-600 text-lg leading-relaxed">{caseData.detailed_solution || caseData.solution}</p>
              </div>

              <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 lg:p-10 rounded-[32px] text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 blur-3xl rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150" />
                <h4 className="text-xs font-bold text-accent uppercase tracking-widest mb-4 relative z-10">{content?.resultLabel || 'Результат'}</h4>
                <div className="text-3xl lg:text-4xl font-black relative z-10 leading-tight">
                  {caseData.result}
                </div>
              </div>
            </div>

            <button 
              onClick={onClose} 
              className="mt-12 text-slate-400 hover:text-slate-900 font-bold text-sm uppercase tracking-widest transition-colors flex items-center justify-center gap-2 group"
            >
              <X size={16} className="transition-transform group-hover:rotate-90" />
              <span>{content?.closeModalLabel || 'Закрити вікно'}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const Cases = ({ items, onSelectCase, content }: { items: any[], onSelectCase: (c: any) => void, content: any }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => {
      let nextIndex = prevIndex + newDirection;
      if (nextIndex < 0) nextIndex = items.length - 1;
      if (nextIndex >= items.length) nextIndex = 0;
      return nextIndex;
    });
  };

  if (!items || items.length === 0) return null;

  return (
    <section id="cases" className="section-padding bg-white overflow-hidden">
      <div className="container-custom">
        <div className="mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-4">{content?.title || 'Результати, які можна виміряти в грошах'}</h2>
          <p className="text-slate-600">{content?.subtitle || 'Кейси, де ми впровадили систему і вивели бізнес на новий рівень.'}</p>
        </div>

        <div className="relative h-[620px] md:h-[600px] pb-8">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={1}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = swipePower(offset.x, velocity.x);
                if (swipe < -swipeConfidenceThreshold) {
                  paginate(1);
                } else if (swipe > swipeConfidenceThreshold) {
                  paginate(-1);
                }
              }}
              className="absolute inset-0"
            >
              <div className="grid md:grid-cols-2 h-full bg-slate-50 rounded-[40px] overflow-hidden border border-slate-100 group">
                <div className="relative h-56 md:h-auto overflow-hidden">
                  <img 
                    src={items[currentIndex].image} 
                    alt={items[currentIndex].title} 
                    className="w-full h-full object-cover" 
                  />
                  {/* Arrows on Image */}
                  <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { e.stopPropagation(); paginate(-1); }}
                      className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/40 transition-all"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); paginate(1); }}
                      className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/40 transition-all"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
                <div className="p-6 pt-3 md:p-16 flex flex-col justify-start md:justify-center">
                  <div className="text-xs font-bold text-accent uppercase tracking-widest mb-2">{items[currentIndex].niche}</div>
                  <h3 className="text-2xl md:text-4xl font-bold text-slate-900 mb-4">{items[currentIndex].title}</h3>
                  <p className="text-slate-500 text-base md:text-lg mb-6 line-clamp-2 md:line-clamp-3">{items[currentIndex].problem}</p>
                  <button 
                    onClick={() => onSelectCase(items[currentIndex])}
                    className="btn-primary w-full sm:w-auto px-8 py-4 text-base shadow-xl shadow-blue-500/20"
                  >
                    {content?.moreDetailsLabel || 'Дивитись детальніше'}
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Pagination Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {items.map((item, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > currentIndex ? 1 : -1);
                setCurrentIndex(i);
              }}
              className={`w-2 h-2 rounded-full transition-all ${i === currentIndex ? 'w-8 bg-accent' : 'bg-slate-200 hover:bg-slate-300'}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

const Process = ({ items, content }: { items: any[], content: any }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  return (
    <section id="process" className="section-padding bg-slate-50 overflow-hidden">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-4">{content?.title || 'Як ми будуємо вашу систему'}</h2>
          <p className="text-slate-600">{content?.subtitle || 'Від першого дзвінка до стабільного потоку заявок — всього 6 кроків.'}</p>
        </div>

        {/* Desktop Grid */}
        <div className="hidden lg:grid grid-cols-3 xl:grid-cols-6 gap-6">
          {items.map((step, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative p-6 rounded-3xl bg-white border border-slate-100 hover:shadow-xl transition-all duration-300 group h-full flex flex-col"
            >
              <div className="text-4xl font-black text-slate-100 mb-4 group-hover:text-accent/20 transition-colors">{step.step_number}</div>
              <h3 className="text-lg font-bold text-slate-900 mb-3 leading-tight">{step.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed mt-auto">{step.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Mobile/Tablet Carousel */}
        <div className="lg:hidden relative">
          <div className="flex items-center justify-center gap-4 mb-8">
            <button 
              onClick={prev}
              className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center text-slate-900 hover:bg-accent hover:text-white transition-all"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              {content?.stepLabel || 'Крок'} {currentIndex + 1} з {items.length}
            </div>
            <button 
              onClick={next}
              className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center text-slate-900 hover:bg-accent hover:text-white transition-all"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-8 rounded-[40px] shadow-xl border border-slate-100 text-center max-w-md mx-auto"
            >
              <div className="text-7xl font-black text-accent/10 mb-6">{items[currentIndex].step_number}</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">{items[currentIndex].title}</h3>
              <p className="text-slate-600 leading-relaxed">{items[currentIndex].description}</p>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-center gap-2 mt-8">
            {items.map((_, i) => (
              <button 
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-2 h-2 rounded-full transition-all ${currentIndex === i ? 'w-8 bg-accent' : 'bg-slate-200'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const Pricing = ({ items, onSelectPlan, content }: { items: any[], onSelectPlan: (p: any) => void, content: any }) => {
  const [activePlanIndex, setActivePlanIndex] = useState<number | null>(
    items.findIndex(p => p.is_featured) !== -1 ? items.findIndex(p => p.is_featured) : 0
  );

  return (
    <section id="pricing" className="section-padding bg-slate-900 text-white">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">{content?.title || 'Оберіть свій рівень масштабування'}</h2>
          <p className="text-slate-400">{content?.subtitle || 'Ми підберемо рішення під ваші задачі: від швидкого старту до повного захоплення ринку.'}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {items.map((plan, i) => (
            <motion.div 
              key={i} 
              onMouseEnter={() => setActivePlanIndex(i)}
              whileHover={{ y: -10, scale: 1.02 }}
              className={`relative p-8 rounded-[32px] border-2 transition-all duration-500 flex flex-col h-full ${
                activePlanIndex === i 
                  ? 'bg-slate-800 border-accent' 
                  : 'bg-slate-800/50 border-white/5'
              }`}
            >
              {!!plan.is_featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-white text-xs font-bold uppercase tracking-widest px-4 py-1 rounded-full whitespace-nowrap">
                  {plan.label || 'популярно'}
                </div>
              )}
              <div className="mb-8">
                <span className="text-sm font-bold text-accent uppercase tracking-widest">{plan.label}</span>
                <div className="flex items-baseline gap-1 mt-2">
                  <h3 className="text-4xl font-extrabold">{plan.price}</h3>
                  <span className="text-slate-400 font-medium">/ {plan.name}</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8 flex-grow">
                {plan.features.map((f: string, j: number) => (
                  <li key={j} className="flex items-start gap-3 text-slate-300">
                    <CheckCircle2 size={18} className="text-accent mt-1 shrink-0" />
                    <span className="text-sm">{f}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-8 border-t border-white/10 mt-auto">
                <p className="text-sm font-semibold text-white mb-6 min-h-[40px]">
                  <span className="text-accent">{content?.resultLabel || 'Результат:'}</span> {plan.result_text}
                </p>
                <button 
                  onClick={() => onSelectPlan(plan)}
                  className={`w-full py-4 rounded-xl font-bold transition-all ${
                    activePlanIndex === i ? 'bg-accent text-white' : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {content?.selectPlanLabel || 'Обрати цей формат'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const PricingModal = ({ isOpen, onClose, plan, contactContent }: { isOpen: boolean, onClose: () => void, plan: any, contactContent: any, key?: any }) => {
  const [formData, setFormData] = useState({ name: '', contact: '', comment: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  if (!isOpen || !plan) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.contact) return;
    
    setStatus('loading');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          message: formData.comment,
          plan: plan.name,
          source: 'Pricing Modal'
        })
      });
      
      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', contact: '', comment: '' });
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    }
  };

  const modalContent = {
    title: plan.modal_title || contactContent?.pricingModalTitle || 'Обговоримо ваш проект?',
    subtitle: plan.modal_subtitle || contactContent?.pricingModalSubtitle || 'Залиште контакти, і я зв\'яжуся з вами найближчим часом.',
    tip: plan.modal_tip || null
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl p-8 md:p-12 max-h-[90vh] overflow-y-auto scrollbar-hide"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-10 w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-900 transition-colors"
        >
          <X size={24} />
        </button>

        {status === 'success' ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">{contactContent?.successTitle || 'Дякуємо!'}</h3>
            <p className="text-slate-600 mb-8">{contactContent?.successSubtitle || 'Ваша заявка прийнята. Я зв\'яжуся з вами протягом 15 хвилин.'}</p>
            <button 
              onClick={onClose}
              className="btn-primary px-8 py-3"
            >
              {contactContent?.successButtonText || 'Закрити'}
            </button>
          </motion.div>
        ) : (
          <>
            <div className="mb-8">
              <div className="text-xs font-bold text-accent uppercase tracking-widest mb-2">{plan.label}</div>
              <h2 className="text-2xl font-bold text-slate-900">{modalContent.title}</h2>
              <p className="text-slate-500 mt-2">{modalContent.subtitle}</p>
              
              {modalContent.tip && (
                <div className="mt-4 p-4 bg-accent/5 border border-accent/20 rounded-2xl">
                  <p className="text-sm text-slate-700 font-medium">
                    <span className="text-accent font-bold">{contactContent?.tipLabel || 'Порада:'}</span> {modalContent.tip}
                  </p>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">{contactContent?.formNameLabel || 'Ваше ім\'я'}</label>
                <input 
                  type="text" 
                  required
                  placeholder={contactContent?.formNamePlaceholder || "Ваше ім'я"}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-accent/10 focus:border-accent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">{contactContent?.formContactLabel || 'Telegram або Телефон'}</label>
                <input 
                  type="text" 
                  required
                  placeholder={contactContent?.formContactPlaceholder || "Telegram або Телефон"}
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-accent/10 focus:border-accent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">{contactContent?.formCommentLabel || 'Коментар'}</label>
                <textarea 
                  rows={3}
                  placeholder={contactContent?.formCommentPlaceholder || "Ваші побажання або запитання"}
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-accent/10 focus:border-accent outline-none transition-all resize-none"
                ></textarea>
              </div>
              {status === 'error' && (
                <p className="text-red-500 text-sm font-bold">{contactContent?.errorText || 'Помилка при відправці. Спробуйте ще раз.'}</p>
              )}
              <button 
                type="submit" 
                disabled={status === 'loading'}
                className="btn-primary w-full py-5 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? (contactContent?.formButtonLoadingText || 'Відправка...') : (contactContent?.formButtonText || 'Відправити запит')}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
};

const FAQ = ({ items, content }: { items: any[], content: any }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="section-padding bg-slate-50">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-4">{content?.title || 'Часті запитання'}</h2>
          <p className="text-slate-600">{content?.subtitle || 'Відповіді на те, що зазвичай цікавить моїх клієнтів.'}</p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {items.map((item, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden transition-all">
              <button 
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
              >
                <span className="text-lg font-bold text-slate-900">{item.question}</span>
                <div className={`w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-900 transition-transform duration-300 ${openIndex === i ? 'rotate-180' : ''}`}>
                  <ChevronRight size={18} className="rotate-90" />
                </div>
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-8 pb-6 text-slate-600 leading-relaxed border-t border-slate-50 pt-4">
                      {item.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const About = ({ content }: { content: any }) => {
  return (
    <section id="about" className="section-padding bg-white">
      <div className="container-custom">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="aspect-[4/5] rounded-[40px] overflow-hidden">
              <img src={content?.image} alt="Роман — архітектор систем" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-8 -right-8 bg-accent text-white p-8 rounded-[32px] shadow-xl">
              <div className="text-4xl font-black mb-1">{content?.experienceValue}</div>
              <div className="text-sm font-bold uppercase tracking-widest opacity-80">{content?.experienceLabel}</div>
            </div>
          </div>
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-8">{content?.title}</h2>
            <div className="space-y-6 text-lg text-slate-600 leading-relaxed">
              {content?.paragraphs?.map((p: string, i: number) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <div className="mt-10 flex flex-wrap gap-3">
              {content?.skills?.map((skill: string, i: number) => (
                <span key={i} className="px-4 py-2 bg-slate-50 text-slate-600 rounded-full text-sm font-medium border border-slate-100">{skill}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const CTA = ({ content }: { content: any }) => {
  return (
    <section id="audit" className="section-padding">
      <div className="container-custom">
        <div className="max-w-5xl mx-auto">
          <div className="bg-accent rounded-[48px] p-8 md:p-16 text-white relative overflow-hidden shadow-2xl shadow-blue-500/20">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 blur-3xl rounded-full -ml-32 -mb-32" />
            
            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
              <div className="lg:w-2/3 text-center lg:text-left">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-6 leading-tight">
                  {content?.title || 'Досить годувати Google даремно'}
                </h2>
                <p className="text-lg md:text-xl opacity-90 leading-relaxed">
                  {content?.subtitle || 'Кожен день без нормальної системи — це втрачені клієнти, які пішли до конкурентів.'}
                </p>
                {content?.additionalText && (
                  <p className="text-sm opacity-70 mt-4 italic">
                    {content.additionalText}
                  </p>
                )}
              </div>
              <div className="lg:w-1/3 w-full">
                <a href="#contact" className="block w-full bg-white text-accent px-8 py-5 rounded-2xl font-black text-lg md:text-xl hover:scale-105 active:scale-95 transition-all shadow-xl hover:shadow-white/20 text-center">
                  {content?.buttonText || 'Обговорити мій проєкт'}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Contacts = ({ content }: { content: any }) => {
  const [formData, setFormData] = useState({ name: '', contact: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [responseMsg, setResponseMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.contact) return;
    
    setStatus('loading');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          source: 'Main Contact Form'
        })
      });
      const result = await response.json();
      if (response.ok) {
        setStatus('success');
        setResponseMsg(result.message);
        setFormData({ name: '', contact: '', message: '' });
      } else {
        setStatus('error');
        setResponseMsg(result.message || 'Помилка при відправці');
      }
    } catch (err) {
      setStatus('error');
      setResponseMsg('Помилка мережі. Спробуйте пізніше.');
    }
  };

  return (
    <section id="contact" className="section-padding bg-white">
      <div className="container-custom">
        <div className="grid md:grid-cols-2 gap-20">
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-8">{content?.title}</h2>
            <p className="text-xl text-slate-600 mb-12">{content?.subtitle}</p>
            <div className="space-y-8">
              <div className="flex items-center gap-6 group">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all duration-300">
                  <Mail size={24} />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Email</div>
                  <a 
                    href={`mailto:${content?.email}`} 
                    className="text-xl font-bold text-slate-900 hover:text-accent transition-colors no-underline"
                  >
                    {content?.email}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-6 group">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all duration-300">
                  <Send size={24} />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Telegram</div>
                  <a 
                    href={`https://t.me/${content?.telegram?.replace('@', '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xl font-bold text-slate-900 hover:text-accent transition-colors no-underline"
                  >
                    {content?.telegram}
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-slate-50 p-8 md:p-12 rounded-[40px] border border-slate-100">
            {status === 'success' ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col items-center justify-center text-center py-12"
              >
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 size={40} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{content?.successTitle || 'Дякуємо!'}</h3>
                <p className="text-slate-600 mb-8">{responseMsg || content?.successSubtitle}</p>
                <button 
                  onClick={() => setStatus('idle')}
                  className="text-accent font-bold hover:underline"
                >
                  {content?.sendAnotherLabel || 'Надіслати ще одну заявку'}
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">{content?.formNameLabel}</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-200 focus:border-accent outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">{content?.formContactLabel}</label>
                  <input 
                    required
                    type="text" 
                    value={formData.contact}
                    onChange={(e) => setFormData({...formData, contact: e.target.value})}
                    className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-200 focus:border-accent outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">{content?.formMessageLabel}</label>
                  <textarea 
                    rows={4} 
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-200 focus:border-accent outline-none resize-none"
                  ></textarea>
                </div>
                {status === 'error' && (
                  <div className="text-red-500 text-sm font-medium flex items-center gap-2">
                    <AlertCircle size={16} /> {responseMsg}
                  </div>
                )}
                <button 
                  disabled={status === 'loading'}
                  className="btn-primary w-full py-5 text-lg flex items-center justify-center gap-3 disabled:opacity-70"
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2 className="animate-spin" size={20} /> {content?.formButtonLoadingText || 'Відправка...'}
                    </>
                  ) : (content?.formButtonText || 'Відправити запит')}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = ({ content }: { content: any }) => {
  return (
    <footer className="py-12 border-t border-slate-100 bg-white">
      <div className="container-custom flex flex-col md:flex-row items-center justify-between gap-8">
        <Logo />
        <div className="text-slate-400 text-sm font-medium">{content?.copyright}</div>
        <div className="flex gap-6">
          <a href={content?.telegramLink} className="text-slate-400 hover:text-accent transition-colors flex items-center gap-2">
            <Send size={18} />
            {content?.telegramLabel || 'Telegram'}
          </a>
        </div>
      </div>
    </footer>
  );
};

// --- Main App Component ---

const VideoModal = ({ isOpen, onClose, videoUrl }: { isOpen: boolean, onClose: () => void, videoUrl: string, key?: any }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-slate-900/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-colors"
        >
          <X size={24} />
        </button>
        
        {videoUrl ? (
          videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') || videoUrl.includes('vimeo.com') ? (
            <iframe
              src={videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') 
                ? videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/') 
                : videoUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : (
            <video 
              src={videoUrl} 
              className="w-full h-full" 
              controls 
              autoPlay
            ></video>
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/50">
            Відео скоро з'явиться
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

const PublicSite = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getContent();
        setData(response.data);
      } catch (err) {
        console.error('Failed to fetch content', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-accent" size={48} />
      </div>
    );
  }

  if (!data || !data.content) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-6 text-center">
        <div>
          <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
          <h1 className="text-2xl font-bold text-slate-900">Помилка завантаження контенту</h1>
          <p className="text-slate-500 mt-2">Будь ласка, перевірте підключення до бази даних або налаштування сервера.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar content={data.content.hero || {}} />
      <Hero 
        content={data.content.hero || {}} 
        onOpenVideo={() => setIsVideoModalOpen(true)}
      />
      <Problem items={data.problems || []} content={data.content.problems_header || {}} />
      <Solution items={data.benefits || []} content={data.content.benefits_header || {}} />
      <SpeedSection content={data.content.speed_roi || {}} />
      <ROICalculator content={data.content.speed_roi || {}} />
      <Cases items={data.cases || []} onSelectCase={(c) => setSelectedCase(c)} content={data.content.cases_header || {}} />
      <Process items={data.process || []} content={data.content.process_header || {}} />
      <Pricing items={data.pricing || []} onSelectPlan={(p) => setSelectedPlan(p)} content={data.content.pricing_header || {}} />
      <FAQ items={data.faq || []} content={data.content.faq_header || {}} />
      <About content={data.content.about || {}} />
      <CTA content={data.content.cta || {}} />
      <Contacts content={data.content.contacts || {}} />
      <Footer content={data.content.footer || {}} />
      
      <AnimatePresence mode="wait">
        {selectedCase && (
          <CaseModal 
            key={`case-${selectedCase.id}`}
            isOpen={!!selectedCase} 
            onClose={() => setSelectedCase(null)} 
            caseData={selectedCase} 
            content={data.content.cases_header || {}}
          />
        )}
        {selectedPlan && (
          <PricingModal 
            key={`plan-${selectedPlan.id || selectedPlan.name}`}
            isOpen={!!selectedPlan} 
            onClose={() => setSelectedPlan(null)} 
            plan={selectedPlan}
            contactContent={data.content.contacts}
          />
        )}
        {isVideoModalOpen && (
          <VideoModal 
            key="video-modal"
            isOpen={isVideoModalOpen} 
            onClose={() => setIsVideoModalOpen(false)} 
            videoUrl={data.content.hero?.videoUrl || ''} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/admin/*" element={<Admin />} />
        <Route path="/" element={<PublicSite />} />
      </Routes>
    </Router>
  );
};

export default App;
