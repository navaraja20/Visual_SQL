import { useRef } from 'react';
import { motion } from 'framer-motion';

interface CertificateProps {
  userName: string;
  moduleName: string;
  category: string;
  completionDate: string;
  queriesExecuted: number;
  successRate: number;
  certificateId: string;
}

export default function Certificate({
  userName,
  moduleName,
  category,
  completionDate,
  queriesExecuted,
  successRate,
  certificateId,
}: CertificateProps) {
  const certificateRef = useRef<HTMLDivElement>(null);

  const downloadCertificate = async () => {
    if (!certificateRef.current) return;

    try {
      // Create a canvas from the certificate
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(certificateRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      });

      // Download as image
      const link = document.createElement('a');
      link.download = `VisualSQL_Certificate_${moduleName.replace(/\s+/g, '_')}_${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error generating certificate:', error);
      alert('Failed to download certificate. Please try again.');
    }
  };

  const shareCertificate = () => {
    const text = `I just completed "${moduleName}" on VisualSQL! 🎉\n\nQueries Executed: ${queriesExecuted}\nSuccess Rate: ${successRate}%\n\n#SQL #Learning #VisualSQL`;
    
    if (navigator.share) {
      navigator.share({
        title: 'VisualSQL Certificate',
        text,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(text);
      alert('Certificate details copied to clipboard!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Certificate Preview */}
      <div 
        ref={certificateRef}
        className="relative bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{ aspectRatio: '1.414', maxWidth: '800px', margin: '0 auto' }}
      >
        {/* Border Design */}
        <div className="absolute inset-0 border-[20px] border-double border-blue-600 rounded-2xl" />
        <div className="absolute inset-[30px] border-[2px] border-blue-400 rounded-xl" />
        
        {/* Corner Decorations */}
        <div className="absolute top-8 left-8 w-16 h-16 border-t-4 border-l-4 border-purple-500 rounded-tl-xl" />
        <div className="absolute top-8 right-8 w-16 h-16 border-t-4 border-r-4 border-purple-500 rounded-tr-xl" />
        <div className="absolute bottom-8 left-8 w-16 h-16 border-b-4 border-l-4 border-purple-500 rounded-bl-xl" />
        <div className="absolute bottom-8 right-8 w-16 h-16 border-b-4 border-r-4 border-purple-500 rounded-br-xl" />

        {/* Content */}
        <div className="relative h-full flex flex-col items-center justify-center p-16 text-center">
          {/* Logo/Header */}
          <div className="mb-8">
            <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              VisualSQL
            </div>
            <div className="text-sm text-gray-600 tracking-[0.3em] uppercase">
              Certificate of Completion
            </div>
          </div>

          {/* Ribbon Icon */}
          <div className="mb-8">
            <svg className="w-20 h-20 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          </div>

          {/* Main Text */}
          <div className="mb-8 space-y-4">
            <div className="text-gray-700 text-lg">This certifies that</div>
            <div className="text-5xl font-serif font-bold text-gray-900 border-b-2 border-gray-300 pb-2 px-8">
              {userName || 'SQL Learner'}
            </div>
            <div className="text-gray-700 text-lg">has successfully completed</div>
            <div className="text-3xl font-bold text-blue-600 mt-2">
              {moduleName}
            </div>
            <div className="text-lg text-gray-600">
              Category: <span className="font-semibold">{category}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-12 mb-8 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{queriesExecuted}</div>
              <div className="text-gray-600">Queries Executed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{successRate}%</div>
              <div className="text-gray-600">Success Rate</div>
            </div>
          </div>

          {/* Date and Signature */}
          <div className="flex items-end justify-between w-full mt-8">
            <div className="text-left">
              <div className="text-gray-600 text-sm mb-2">Date of Completion</div>
              <div className="text-lg font-semibold text-gray-900">{completionDate}</div>
            </div>
            <div className="text-right">
              <div className="border-t-2 border-gray-900 pt-2 px-8">
                <div className="font-script text-2xl text-gray-900">VisualSQL Team</div>
              </div>
            </div>
          </div>

          {/* Certificate ID */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-gray-400">
            Certificate ID: {certificateId}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={downloadCertificate}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download Certificate
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={shareCertificate}
          className="px-8 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 font-semibold rounded-lg shadow-lg border-2 border-gray-300 dark:border-gray-600 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share Achievement
        </motion.button>
      </div>
    </div>
  );
}
