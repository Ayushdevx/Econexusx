import React, { useState, useEffect } from 'react';
import { Github, Twitter, Linkedin, Mail, ChevronRight, ExternalLink, Globe, Phone, Clock, Heart } from 'lucide-react';

const Footer = () => {
  const [hoveredLink, setHoveredLink] = useState(null);
  const [currentTime, setCurrentTime] = useState('');
  const [activeTab, setActiveTab] = useState('contact');
  const [isVisible, setIsVisible] = useState(false);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Intersection Observer for fade-in effect
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );

    const footer = document.getElementById('animated-footer');
    if (footer) observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  const links = {
    quickLinks: [
      { name: 'About Us', href: '/about' },
      { name: 'Contact', href: '/contact' },
      { name: 'Blog', href: '/blog' },
      { name: 'Careers', href: '/careers' }
    ],
    resources: [
      { name: 'Documentation', href: '/docs' },
      { name: 'API Reference', href: '/api' },
      { name: 'Support', href: '/support' },
      { name: 'System Status', href: '/status' }
    ],
    social: [
      { name: 'Twitter', icon: Twitter, href: '#', color: 'hover:text-blue-400' },
      { name: 'LinkedIn', icon: Linkedin, href: '#', color: 'hover:text-blue-600' },
      { name: 'GitHub', icon: Github, href: '#', color: 'hover:text-purple-400' },
      { name: 'Email', icon: Mail, href: '#', color: 'hover:text-red-400' }
    ]
  };

  const contactInfo = {
    contact: [
      { icon: Globe, text: 'www.ayushdevxai@gmail.com', href: '#' },
      { icon: Phone, text: '+91 9305183418', href: 'LimkedIn : AyushDevai ' },
      { icon: Mail, text: 'contact@econexus.com', href: 'mailto:contact@econexus.com' }
    ],
    hours: [
      { icon: Clock, text: 'Mon-Fri: 9:00 AM - 6:00 PM' },
      { icon: Clock, text: 'Sat: 10:00 AM - 4:00 PM' },
      { icon: Clock, text: 'Sun: Closed' }
    ]
  };

  const LinkWithIcon = ({ href, children, className = '' }) => (
    <a
      href={href}
      className={`group flex items-center gap-2 transition-all duration-300 ${className}`}
      onMouseEnter={() => setHoveredLink(href)}
      onMouseLeave={() => setHoveredLink(null)}
    >
      <ChevronRight 
        className={`w-4 h-4 transform transition-transform duration-300 
          ${hoveredLink === href ? 'translate-x-1 text-green-400' : 'opacity-0 -translate-x-2'}`}
      />
      {children}
      <ExternalLink 
        className={`w-3 h-3 transition-opacity duration-300 
          ${hoveredLink === href ? 'opacity-100' : 'opacity-0'}`}
      />
    </a>
  );

  return (
    <footer 
      id="animated-footer"
      className={`bg-gray-900/50 backdrop-blur-md border-t border-gray-800 py-12 transition-opacity duration-1000 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="container mx-auto px-4">
        {/* Newsletter Subscription */}
        <div className="mb-12 bg-gray-800/50 p-6 rounded-lg transform hover:scale-[1.02] transition-all duration-300">
          <h3 className="text-xl font-bold mb-4 text-green-400">Subscribe to Our Newsletter and Get Updated bt our Latest Announcement</h3>
          <div className="flex gap-4">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="flex-1 px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-green-400 focus:outline-none transition-all duration-300"
            />
            <button className="px-6 py-2 bg-green-500 hover:bg-green-400 text-white rounded transition-colors duration-300">
              Subscribe
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="transform transition-all duration-500 hover:scale-105">
            <h3 className="text-2xl font-bold mb-4 text-green-400 relative group">
              Eco Nexus
              <span className="absolute -bottom-1 left-0 w-12 h-0.5 bg-green-400 transform transition-all duration-300 group-hover:w-full"></span>
            </h3>
            <p className="text-gray-400 leading-relaxed">
              Revolutionizing telecom energy consumption through innovative solutions and sustainable practices.
            </p>
            <div className="mt-4 text-gray-400">
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-400" />
                {currentTime}
              </p>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white border-b border-gray-800 pb-2">
              Quick Links
            </h4>
            <ul className="space-y-3 text-gray-400">
              {links.quickLinks.map((link) => (
                <li key={link.name} className="transform hover:translate-x-2 transition-transform duration-300">
                  <LinkWithIcon href={link.href} className="hover:text-green-400">
                    {link.name}
                  </LinkWithIcon>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Resources */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white border-b border-gray-800 pb-2">
              Resources
            </h4>
            <ul className="space-y-3 text-gray-400">
              {links.resources.map((link) => (
                <li key={link.name} className="transform hover:translate-x-2 transition-transform duration-300">
                  <LinkWithIcon href={link.href} className="hover:text-green-400">
                    {link.name}
                  </LinkWithIcon>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Contact & Hours Tab Section */}
          <div>
            <div className="flex mb-6 border-b border-gray-800">
              <button
                onClick={() => setActiveTab('contact')}
                className={`flex-1 py-2 text-center transition-colors duration-300 ${
                  activeTab === 'contact' ? 'text-green-400 border-b-2 border-green-400' : 'text-gray-400'
                }`}
              >
                Contact
              </button>
              <button
                onClick={() => setActiveTab('hours')}
                className={`flex-1 py-2 text-center transition-colors duration-300 ${
                  activeTab === 'hours' ? 'text-green-400 border-b-2 border-green-400' : 'text-gray-400'
                }`}
              >
                Hours
              </button>
            </div>
            
            <div className="text-gray-400">
              {activeTab === 'contact' ? (
                <div className="space-y-4">
                  {contactInfo.contact.map((item, index) => (
                    <a
                      key={index}
                      href={item.href}
                      className="flex items-center gap-3 hover:text-green-400 transition-colors duration-300"
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.text}</span>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {contactInfo.hours.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <item.icon className="w-5 h-5 text-green-400" />
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Social Links */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            {links.social.map((social) => (
              <a
                key={social.name}
                href={social.href}
                className={`flex items-center gap-2 text-gray-400 ${social.color} transform transition-all duration-300 hover:scale-110 hover:-translate-y-1`}
              >
                <social.icon className="w-6 h-6" />
                <span>{social.name}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center text-gray-400">
          <p className="flex items-center justify-center gap-2 transform transition-all duration-300 hover:scale-105">
            Made with <Heart className="w-4 h-4 text-red-400" />by Ayush Upadhyay Eco Nexus &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;