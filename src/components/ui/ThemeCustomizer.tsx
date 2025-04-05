import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Palette, Check, X, Sparkles, Brush, Droplet, RefreshCw } from 'lucide-react';
import { useAppStore } from '../../store/appStore';

interface ColorOption {
  name: string;
  value: string;
  textColor: string;
}

const ThemeCustomizer: React.FC = () => {
  const { theme, setTheme } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'themes' | 'colors'>('themes');
  const [selectedPrimary, setSelectedPrimary] = useState<string>('emerald');
  const [selectedSecondary, setSelectedSecondary] = useState<string>('blue');
  const [selectedAccent, setSelectedAccent] = useState<string>('violet');

  const themes = [
    { name: 'Light', value: 'light', icon: '☀️' },
    { name: 'Dark', value: 'dark', icon: '🌙' },
    { name: 'Cyberpunk', value: 'cyberpunk', icon: '🤖' },
    { name: 'Synthwave', value: 'synthwave', icon: '🌆' },
    { name: 'Retro', value: 'retro', icon: '📟' },
    { name: 'Valentine', value: 'valentine', icon: '💖' },
    { name: 'Aqua', value: 'aqua', icon: '🌊' },
    { name: 'Forest', value: 'forest', icon: '🌲' },
    { name: 'Luxury', value: 'luxury', icon: '✨' },
  ];

  const colorOptions: Record<string, ColorOption[]> = {
    primary: [
      { name: 'Emerald', value: 'emerald', textColor: 'text-white' },
      { name: 'Sky', value: 'sky', textColor: 'text-white' },
      { name: 'Indigo', value: 'indigo', textColor: 'text-white' },
      { name: 'Rose', value: 'rose', textColor: 'text-white' },
      { name: 'Amber', value: 'amber', textColor: 'text-black' },
      { name: 'Lime', value: 'lime', textColor: 'text-black' },
      { name: 'Teal', value: 'teal', textColor: 'text-white' },
      { name: 'Purple', value: 'purple', textColor: 'text-white' },
      { name: 'Pink', value: 'pink', textColor: 'text-white' },
    ],
    secondary: [
      { name: 'Blue', value: 'blue', textColor: 'text-white' },
      { name: 'Emerald', value: 'emerald', textColor: 'text-white' },
      { name: 'Violet', value: 'violet', textColor: 'text-white' },
      { name: 'Orange', value: 'orange', textColor: 'text-white' },
      { name: 'Cyan', value: 'cyan', textColor: 'text-black' },
      { name: 'Yellow', value: 'yellow', textColor: 'text-black' },
      { name: 'Fuchsia', value: 'fuchsia', textColor: 'text-white' },
      { name: 'Slate', value: 'slate', textColor: 'text-white' },
      { name: 'Red', value: 'red', textColor: 'text-white' },
    ],
    accent: [
      { name: 'Violet', value: 'violet', textColor: 'text-white' },
      { name: 'Amber', value: 'amber', textColor: 'text-black' },
      { name: 'Emerald', value: 'emerald', textColor: 'text-white' },
      { name: 'Pink', value: 'pink', textColor: 'text-white' },
      { name: 'Blue', value: 'blue', textColor: 'text-white' },
      { name: 'Green', value: 'green', textColor: 'text-white' },
      { name: 'Red', value: 'red', textColor: 'text-white' },
      { name: 'Purple', value: 'purple', textColor: 'text-white' },
      { name: 'Indigo', value: 'indigo', textColor: 'text-white' },
    ],
  };

  // Apply custom theme
  const applyCustomTheme = () => {
    // In a real implementation, this would generate a custom theme
    // For now, we'll just switch to the base theme
    setTheme('light');

    // Apply custom colors via CSS variables
    document.documentElement.style.setProperty('--p', `hsl(var(--${selectedPrimary}))`);
    document.documentElement.style.setProperty('--s', `hsl(var(--${selectedSecondary}))`);
    document.documentElement.style.setProperty('--a', `hsl(var(--${selectedAccent}))`);

    // Close the customizer
    setIsOpen(false);
  };

  // Reset to default theme
  const resetTheme = () => {
    document.documentElement.style.removeProperty('--p');
    document.documentElement.style.removeProperty('--s');
    document.documentElement.style.removeProperty('--a');
    setTheme('light');
  };

  if (!isOpen) {
    return (
      <button
        className="fixed bottom-6 right-6 btn btn-circle btn-primary shadow-lg"
        onClick={() => setIsOpen(true)}
      >
        <Palette className="h-5 w-5" />
      </button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-6 right-6 w-80 bg-base-100 rounded-xl shadow-2xl border border-base-300 overflow-hidden z-50"
    >
      <div className="flex justify-between items-center p-4 border-b border-base-300">
        <h3 className="font-bold flex items-center gap-2">
          <Palette className="h-5 w-5 text-primary" />
          Theme Customizer
        </h3>
        <button
          className="btn btn-ghost btn-sm btn-circle"
          onClick={() => setIsOpen(false)}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="tabs tabs-boxed bg-base-200 p-1 m-4 mb-0">
        <button
          className={`tab flex-1 ${activeTab === 'themes' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('themes')}
        >
          <Sparkles className="h-4 w-4 mr-1" />
          Themes
        </button>
        <button
          className={`tab flex-1 ${activeTab === 'colors' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('colors')}
        >
          <Brush className="h-4 w-4 mr-1" />
          Colors
        </button>
      </div>

      <div className="p-4">
        {activeTab === 'themes' ? (
          <div className="grid grid-cols-3 gap-2">
            {themes.map((themeOption) => (
              <button
                key={themeOption.value}
                className={`btn btn-sm ${theme === themeOption.value ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => {
                  resetTheme();
                  setTheme(themeOption.value);
                }}
              >
                <span className="mr-1">{themeOption.icon}</span>
                {themeOption.name}
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="label">
                <span className="label-text">Primary Color</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {colorOptions.primary.map((color) => (
                  <button
                    key={color.value}
                    className={`h-10 rounded-lg ${color.textColor}`}
                    style={{ backgroundColor: `hsl(var(--${color.value}))` }}
                    onClick={() => setSelectedPrimary(color.value)}
                  >
                    {selectedPrimary === color.value && <Check className="h-4 w-4 mx-auto" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">
                <span className="label-text">Secondary Color</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {colorOptions.secondary.map((color) => (
                  <button
                    key={color.value}
                    className={`h-10 rounded-lg ${color.textColor}`}
                    style={{ backgroundColor: `hsl(var(--${color.value}))` }}
                    onClick={() => setSelectedSecondary(color.value)}
                  >
                    {selectedSecondary === color.value && <Check className="h-4 w-4 mx-auto" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">
                <span className="label-text">Accent Color</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {colorOptions.accent.map((color) => (
                  <button
                    key={color.value}
                    className={`h-10 rounded-lg ${color.textColor}`}
                    style={{ backgroundColor: `hsl(var(--${color.value}))` }}
                    onClick={() => setSelectedAccent(color.value)}
                  >
                    {selectedAccent === color.value && <Check className="h-4 w-4 mx-auto" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                className="btn btn-primary flex-1"
                onClick={applyCustomTheme}
              >
                <Droplet className="h-4 w-4 mr-1" />
                Apply Colors
              </button>

              <button
                className="btn btn-outline"
                onClick={resetTheme}
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-base-200 p-3 text-xs text-center text-base-content/70">
        Changes apply to the current session only
      </div>
    </motion.div>
  );
};

export default ThemeCustomizer;
