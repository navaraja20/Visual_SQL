import { motion, AnimatePresence } from 'framer-motion';
import Certificate from './Certificate';
import { useState } from 'react';

interface CertificateData {
  id: string;
  userName: string;
  moduleName: string;
  category: string;
  completionDate: string;
  queriesExecuted: number;
  successRate: number;
}

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificateData: CertificateData;
}

export default function CertificateModal({ isOpen, onClose, certificateData }: CertificateModalProps) {
  const [userName, setUserName] = useState(certificateData.userName);
  const [editingName, setEditingName] = useState(!certificateData.userName);

  const handleSaveName = () => {
    if (userName.trim()) {
      // Save to localStorage
      localStorage.setItem('visualsql_user_name', userName);
      setEditingName(false);

      // Update certificate in storage
      const certificates = JSON.parse(localStorage.getItem('certificates') || '[]');
      const updated = certificates.map((cert: CertificateData) =>
        cert.id === certificateData.id ? { ...cert, userName } : cert
      );
      localStorage.setItem('certificates', JSON.stringify(updated));
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-2xl max-w-5xl w-full my-8 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-2xl text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                <div>
                  <h2 className="text-2xl font-bold">Congratulations! 🎉</h2>
                  <p className="text-blue-100 text-sm">You've earned a certificate</p>
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

          {/* Content */}
          <div className="p-8">
            {/* Name Input */}
            {editingName ? (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800"
              >
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <div className="flex-1">
                    <h3 className="font-bold text-blue-900 dark:text-blue-200 mb-2">Enter Your Name</h3>
                    <p className="text-sm text-blue-800 dark:text-blue-300 mb-4">
                      Your name will appear on the certificate. This will be saved for future certificates.
                    </p>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="Enter your full name"
                        className="flex-1 px-4 py-2 border border-blue-300 dark:border-blue-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        autoFocus
                        onKeyPress={(e) => e.key === 'Enter' && handleSaveName()}
                      />
                      <button
                        onClick={handleSaveName}
                        disabled={!userName.trim()}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="mb-4 text-right">
                <button
                  onClick={() => setEditingName(true)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Change Name
                </button>
              </div>
            )}

            {/* Certificate */}
            {!editingName && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Certificate
                  userName={userName}
                  moduleName={certificateData.moduleName}
                  category={certificateData.category}
                  completionDate={certificateData.completionDate}
                  queriesExecuted={certificateData.queriesExecuted}
                  successRate={certificateData.successRate}
                  certificateId={certificateData.id}
                />
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
