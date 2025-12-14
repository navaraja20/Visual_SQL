import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import ThemeSelector from '@/components/ThemeSelector';
import CertificateModal from '@/components/CertificateModal';

interface CertificateData {
  id: string;
  userName: string;
  moduleName: string;
  moduleId: string;
  category: string;
  completionDate: string;
  queriesExecuted: number;
  successRate: number;
  timestamp: number;
}

export default function Certificates() {
  const { themeId, setThemeId, showThemeSelector, setShowThemeSelector } = useTheme();
  const [certificates, setCertificates] = useState<CertificateData[]>([]);
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateData | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = () => {
    const saved = localStorage.getItem('certificates');
    if (saved) {
      const certs = JSON.parse(saved);
      setCertificates(certs.sort((a: CertificateData, b: CertificateData) => b.timestamp - a.timestamp));
    }
  };

  const categories = ['all', ...Array.from(new Set(certificates.map(c => c.category)))];
  const filteredCertificates = filter === 'all' 
    ? certificates 
    : certificates.filter(c => c.category === filter);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'SELECT': 'from-blue-500 to-cyan-500',
      'WHERE': 'from-green-500 to-emerald-500',
      'JOIN': 'from-purple-500 to-pink-500',
      'GROUP BY': 'from-orange-500 to-red-500',
      'SUBQUERY': 'from-indigo-500 to-purple-500',
      'ADVANCED': 'from-pink-500 to-rose-500',
    };
    return colors[category] || 'from-gray-500 to-gray-600';
  };

  return (
    <>
      <Head>
        <title>My Certificates - VisualSQL</title>
      </Head>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/" className="flex items-center gap-3">
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    VisualSQL
                  </span>
                </Link>
                <nav className="flex items-center space-x-4">
                  <Link href="/modules" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                    Modules
                  </Link>
                  <Link href="/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                    Dashboard
                  </Link>
                  <Link href="/challenges" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                    Challenges
                  </Link>
                  <Link href="/flashcards" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                    Flashcards
                  </Link>
                  <Link href="/certificates" className="text-blue-600 dark:text-blue-400 font-semibold">
                    Certificates
                  </Link>
                </nav>
              </div>
              <button
                onClick={() => setShowThemeSelector(true)}
                className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                title="Choose Theme"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-3">
                  <svg className="w-10 h-10 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  My Certificates
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Your achievements and completed modules
                </p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                  {certificates.length}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Certificates Earned
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setFilter(category)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    filter === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {category === 'all' ? 'All Categories' : category}
                  {category !== 'all' && (
                    <span className="ml-2 text-xs opacity-75">
                      ({certificates.filter(c => c.category === category).length})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Certificates Grid */}
          {filteredCertificates.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <svg className="w-24 h-24 text-gray-300 dark:text-gray-700 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                No Certificates Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Complete modules to earn your first certificate!
              </p>
              <Link
                href="/modules"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg"
              >
                Browse Modules
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCertificates.map((cert, idx) => (
                <motion.div
                  key={cert.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedCertificate(cert)}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden cursor-pointer group"
                >
                  {/* Certificate Preview */}
                  <div className={`h-40 bg-gradient-to-r ${getCategoryColor(cert.category)} p-6 text-white relative overflow-hidden`}>
                    <div className="absolute inset-0 opacity-10">
                      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M0,50 Q25,30 50,50 T100,50 L100,100 L0,100 Z" fill="white" />
                      </svg>
                    </div>
                    <div className="relative">
                      <div className="flex items-center justify-between mb-2">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                        </svg>
                        <span className="text-xs bg-white/20 backdrop-blur-sm px-2 py-1 rounded">
                          {cert.category}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold mb-1 line-clamp-2">
                        {cert.moduleName}
                      </h3>
                      <p className="text-sm opacity-90">
                        Certificate of Completion
                      </p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {cert.completionDate}
                    </div>

                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Queries Executed:</span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">{cert.queriesExecuted}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Success Rate:</span>
                        <span className="font-semibold text-green-600 dark:text-green-400">{cert.successRate}%</span>
                      </div>
                    </div>

                    <button className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-600 group-hover:text-white text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View Certificate
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Info Section */}
          {certificates.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800"
            >
              <div className="flex items-start gap-4">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="font-bold text-blue-900 dark:text-blue-200 mb-2">About Your Certificates</h3>
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    Each certificate represents your successful completion of a SQL module. You can download certificates as images to share on social media or include in your portfolio. All certificates include your performance metrics and a unique ID for verification.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Certificate Modal */}
        {selectedCertificate && (
          <CertificateModal
            isOpen={!!selectedCertificate}
            onClose={() => setSelectedCertificate(null)}
            certificateData={selectedCertificate}
          />
        )}

        {/* Theme Selector */}
        <ThemeSelector
          isOpen={showThemeSelector}
          onClose={() => setShowThemeSelector(false)}
          currentTheme={themeId}
          onThemeChange={setThemeId}
        />
      </div>
    </>
  );
}
