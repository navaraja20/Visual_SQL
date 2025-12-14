import { motion, AnimatePresence } from 'framer-motion';
import { themes, Theme, applyTheme } from '@/utils/themes';

interface ThemeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: string;
  onThemeChange: (themeId: string) => void;
}

export default function ThemeSelector({ isOpen, onClose, currentTheme, onThemeChange }: ThemeSelectorProps) {
  const handleThemeSelect = (theme: Theme) => {
    onThemeChange(theme.id);
    applyTheme(theme);
    localStorage.setItem('selectedTheme', theme.id);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
              <div>
                <h2 className="text-2xl font-bold">Theme Selector</h2>
                <p className="text-purple-100 text-sm">Customize your learning environment</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Theme Grid */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {themes.map((theme) => (
              <motion.button
                key={theme.id}
                onClick={() => handleThemeSelect(theme)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative overflow-hidden rounded-xl border-2 transition-all ${
                  currentTheme === theme.id
                    ? 'border-purple-500 ring-4 ring-purple-200 dark:ring-purple-900/50'
                    : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
                }`}
              >
                {/* Theme Preview */}
                <div 
                  className="p-6"
                  style={{ backgroundColor: theme.colors.bg.primary }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 
                      className="text-lg font-bold"
                      style={{ color: theme.colors.text.primary }}
                    >
                      {theme.name}
                    </h3>
                    {currentTheme === theme.id && (
                      <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>

                  {/* Color Palette Preview */}
                  <div className="space-y-2">
                    {/* Background layers */}
                    <div className="flex gap-2">
                      <div 
                        className="flex-1 h-12 rounded"
                        style={{ backgroundColor: theme.colors.bg.primary }}
                        title="Primary BG"
                      />
                      <div 
                        className="flex-1 h-12 rounded"
                        style={{ backgroundColor: theme.colors.bg.secondary }}
                        title="Secondary BG"
                      />
                      <div 
                        className="flex-1 h-12 rounded"
                        style={{ backgroundColor: theme.colors.bg.tertiary }}
                        title="Tertiary BG"
                      />
                    </div>

                    {/* Accent colors */}
                    <div className="flex gap-2">
                      <div 
                        className="flex-1 h-8 rounded"
                        style={{ backgroundColor: theme.colors.accent.primary }}
                        title="Primary"
                      />
                      <div 
                        className="flex-1 h-8 rounded"
                        style={{ backgroundColor: theme.colors.accent.success }}
                        title="Success"
                      />
                      <div 
                        className="flex-1 h-8 rounded"
                        style={{ backgroundColor: theme.colors.accent.warning }}
                        title="Warning"
                      />
                      <div 
                        className="flex-1 h-8 rounded"
                        style={{ backgroundColor: theme.colors.accent.error }}
                        title="Error"
                      />
                    </div>

                    {/* Syntax colors */}
                    <div 
                      className="p-3 rounded text-xs font-mono"
                      style={{ 
                        backgroundColor: theme.colors.bg.secondary,
                        color: theme.colors.text.primary 
                      }}
                    >
                      <div className="space-y-1">
                        <div>
                          <span style={{ color: theme.colors.syntax.keyword }}>SELECT</span>{' '}
                          <span style={{ color: theme.colors.syntax.variable }}>name</span>{' '}
                          <span style={{ color: theme.colors.syntax.keyword }}>FROM</span>{' '}
                          <span style={{ color: theme.colors.syntax.function }}>users</span>
                        </div>
                        <div>
                          <span style={{ color: theme.colors.syntax.keyword }}>WHERE</span>{' '}
                          <span style={{ color: theme.colors.syntax.variable }}>age</span>{' '}
                          <span style={{ color: theme.colors.syntax.operator }}>&gt;</span>{' '}
                          <span style={{ color: theme.colors.syntax.number }}>25</span>
                        </div>
                        <div style={{ color: theme.colors.syntax.comment }}>
                          -- This is a comment
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Info Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
          >
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-1">Pro Tip</h4>
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  Your theme preference is saved automatically and will be applied across all sessions. 
                  Try different themes to find the one that's most comfortable for your eyes during long learning sessions!
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
