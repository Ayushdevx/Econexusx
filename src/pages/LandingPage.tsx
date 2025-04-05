import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Wind, Sun, Battery, ChevronDown, Globe, Shield, BarChart, ArrowUpRight, Play, Pause, CheckCircle, Server, Network, Cpu } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const LandingPage = () => {
  const { isAuthenticated } = useAuthStore();
  const [activeSection, setActiveSection] = useState('hero');
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Handle mouse movement for interactive background
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Handle scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentProgress = (window.scrollY / totalScroll) * 100;
      setScrollProgress(currentProgress);

      const sections = ['hero', 'features', 'stats', 'demo'];
      sections.forEach(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top >= 0 && rect.top <= window.innerHeight / 2) {
            setActiveSection(section);
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-play slides
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const slides = [
    {
      title: "Smart Energy Management",
      description: "AI-powered solutions for optimal energy distribution",
      image: "https://media.licdn.com/dms/image/v2/D5612AQG9SeERllOvGQ/article-cover_image-shrink_600_2000/article-cover_image-shrink_600_2000/0/1728466312224?e=2147483647&v=beta&t=axD0vjF7eb30YYg6jvZQfbVqj1nPERXTORAOEXxMir0"
    },
    {
      title: "Renewable Integration",
      description: "Seamless integration with renewable energy sources",
      image: "https://media.licdn.com/dms/image/v2/D5612AQFgOFws8v7Lww/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1714296316575?e=2147483647&v=beta&t=rv6Lq-Kl3lU9nuiqpaBQ-Ut5KxkBhKM_P_h2aTs7ing"
    },
    {
      title: "Real-time Analytics",
      description: "Advanced analytics for data-driven decisions",
      image: "https://media.licdn.com/dms/image/D4D12AQG59y0dv7PkxQ/article-cover_image-shrink_600_2000/0/1677558251980?e=2147483647&v=beta&t=WLTai82nUfJS1sJXufg1AvgSBhw_G1nuY-gFYmi2VxY"
    }
  ];

  const features = [
    {
      icon: Zap,
      title: 'Real-time Monitoring',
      description: 'Monitor energy consumption across your telecom infrastructure in real-time',
      color: 'green',
      stats: { value: '99.9%', label: 'Uptime' }
    },
    {
      icon: Wind,
      title: 'Renewable Integration',
      description: 'Seamlessly integrate renewable energy sources into your power grid',
      color: 'blue',
      stats: { value: '40%', label: 'Cost Reduction' }
    },
    {
      icon: Sun,
      title: 'Smart Optimization',
      description: 'AI-powered optimization for maximum energy efficiency',
      color: 'yellow',
      stats: { value: '50%', label: 'Efficiency Gain' }
    },
    {
      icon: Battery,
      title: 'Energy Trading',
      description: 'Trade excess energy credits in our marketplace',
      color: 'purple',
      stats: { value: '24/7', label: 'Trading' }
    },
    {
      icon: Globe,
      title: 'Global Coverage',
      description: 'Worldwide network of energy management solutions',
      color: 'indigo',
      stats: { value: '150+', label: 'Countries' }
    },
    {
      icon: Shield,
      title: 'Advanced Security',
      description: 'Enterprise-grade security for your energy infrastructure',
      color: 'red',
      stats: { value: '256-bit', label: 'Encryption' }
    }
  ];

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Interactive background elements
  const BackgroundElements = () => (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute w-96 h-96 rounded-full bg-green-500/20 blur-3xl"
        animate={{
          x: mousePosition.x * 20,
          y: mousePosition.y * 20,
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{
          left: '20%',
          top: '20%',
        }}
      />
      <motion.div
        className="absolute w-96 h-96 rounded-full bg-blue-500/20 blur-3xl"
        animate={{
          x: mousePosition.x * -20,
          y: mousePosition.y * -20,
          scale: [1.1, 1, 1.1],
        }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{
          right: '20%',
          bottom: '20%',
        }}
      />

      {/* Animated grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />

      {/* Floating particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-green-500/30 rounded-full"
            initial={{
              x: Math.random() * 100,
              y: Math.random() * 100,
            }}
            animate={{
              x: Math.random() * 100,
              y: Math.random() * 100,
              scale: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 5 + 3,
              repeat: Infinity,
              repeatType: 'loop',
            }}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-base-200 text-base-content relative">
      <BackgroundElements />

      {/* Navigation Progress */}
      <motion.div
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 z-50"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Navigation Dots */}
      <div className="fixed right-6 top-1/2 transform -translate-y-1/2 space-y-4 z-40">
        {['hero', 'features', 'stats', 'demo'].map((section) => (
          <motion.div
            key={section}
            className={`w-3 h-3 rounded-full cursor-pointer backdrop-blur-sm ${
              activeSection === section ? 'bg-green-500' : 'bg-gray-500/50'
            }`}
            whileHover={{ scale: 1.5 }}
            onClick={() => scrollToSection(section)}
          />
        ))}
      </div>

      {/* Hero Section */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center z-10 space-y-8 px-4"
        >
          <motion.h1
            className="text-6xl md:text-8xl font-bold"
            animate={{
              backgroundPosition: ['0%', '100%'],
              filter: ['brightness(1)', 'brightness(1.2)', 'brightness(1)'],
            }}
            transition={{
              backgroundPosition: { duration: 5, repeat: Infinity, repeatType: 'reverse' },
              filter: { duration: 2, repeat: Infinity }
            }}
            style={{
              backgroundImage: 'linear-gradient(to right, #4ade80, #3b82f6, #8b5cf6)',
              backgroundSize: '200%',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            }}
          >
            Eco Nexus
          </motion.h1>

          <motion.p
            className="text-xl md:text-3xl text-gray-300 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Revolutionizing telecom energy consumption through AI-powered optimization
          </motion.p>

          <div className="flex gap-4 justify-center">
            <motion.div
              whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(74, 222, 128, 0.5)' }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to={isAuthenticated ? '/dashboard' : '/login'}
                className="px-8 py-3 bg-gradient-to-r from-primary to-primary-focus rounded-full font-semibold
                         hover:from-primary-focus hover:to-primary transition-all duration-300
                         flex items-center gap-2"
              >
                Get Started
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.span>
              </Link>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-gray-800/80 backdrop-blur-sm rounded-full font-semibold
                       hover:bg-gray-700/80 transition-colors flex items-center gap-2"
              onClick={() => scrollToSection('demo')}
            >
              Watch Demo
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </motion.button>
          </div>

          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer"
            onClick={() => scrollToSection('features')}
          >
            <ChevronDown className="w-8 h-8 text-gray-400" />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-4xl font-bold text-center mb-16"
        >
          Powerful Features
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02, translateY: -5 }}
              transition={{ delay: index * 0.1 }}
              className="group bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700
                       hover:border-green-500/50 cursor-pointer relative overflow-hidden"
              onHoverStart={() => setHoveredFeature(index)}
              onHoverEnd={() => setHoveredFeature(null)}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-800/30 to-transparent
                            translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

              <feature.icon className="w-12 h-12 text-green-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400 mb-4">{feature.description}</p>

              <AnimatePresence>
                {hoveredFeature === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pt-4 border-t border-gray-700"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-green-400">{feature.stats.value}</span>
                      <span className="text-gray-400">{feature.stats.label}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-20 bg-gray-800/30 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center max-w-5xl mx-auto">
            {[
              { value: '500+', label: 'Telecom Partners', icon: Globe },
              { value: '30%', label: 'Average Energy Savings', icon: Battery },
              { value: '1M+', label: 'Tons of CO₂ Reduced', icon: Wind }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.1 }}
                transition={{ type: 'spring', duration: 0.5, delay: index * 0.2 }}
                className="p-6 rounded-xl bg-gray-700/30 backdrop-blur-lg border border-gray-600 hover:border-green-500/50"
              >
                <stat.icon className="w-8 h-8 text-green-400 mx-auto mb-4" />
                <div className="text-5xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden backdrop-blur-sm bg-gray-800/30">
            <div className="absolute top-4 right-4 z-20 space-x-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </motion.button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="relative aspect-video bg-gray-800 rounded-2xl overflow-hidden"
              >
                <img
                  src={slides[currentSlide].image}
                  alt={slides[currentSlide].title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <motion.div
                  className="absolute bottom-0 left-0 right-0 p-8"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 className="text-2xl font-bold mb-2">{slides[currentSlide].title}</h3>
                  <p className="text-gray-300">{slides[currentSlide].description}</p>
                </motion.div>
              </motion.div>
            </AnimatePresence>

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {slides.map((_, index) => (
                <motion.button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    currentSlide === index ? 'bg-green-500' : 'bg-gray-500'
                  }`}
                  whileHover={{ scale: 1.5 }}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto text-center px-4 relative z-10"
        >
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Energy Management?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join hundreds of telecom companies already optimizing their energy consumption with Eco Nexus.
          </p>
          <motion.div
            whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(74, 222, 128, 0.5)' }}
            whileTap={{ scale: 0.95 }}
            className="mx-auto"
          >
            <Link
              to={isAuthenticated ? '/dashboard' : '/login'}
              className="px-8 py-3 bg-gradient-to-r from-primary to-primary-focus rounded-full font-semibold
                       hover:from-primary-focus hover:to-primary transition-all duration-300
                       flex items-center gap-2"
            >
              Get Started Now
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <ArrowRight className="w-5 h-5" />
              </motion.span>
            </Link>
          </motion.div>
        </motion.div>

        {/* Background decoration */}
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }}
          style={{
            backgroundImage: 'radial-gradient(circle at center, rgba(74, 222, 128, 0.1) 0%, transparent 50%)',
            backgroundSize: '100% 100%',
          }}
        />
      </section>
    </div>
  );
};

export default LandingPage;