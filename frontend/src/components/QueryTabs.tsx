import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface QueryTab {
  id: string;
  name: string;
  query: string;
  saved: boolean;
  timestamp: number;
}

interface QueryTabsProps {
  tabs: QueryTab[];
  activeTabId: string;
  onTabChange: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onTabRename: (tabId: string, newName: string) => void;
  onNewTab: () => void;
  onTabDuplicate: (tabId: string) => void;
}

export default function QueryTabs({
  tabs,
  activeTabId,
  onTabChange,
  onTabClose,
  onTabRename,
  onNewTab,
  onTabDuplicate,
}: QueryTabsProps) {
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [contextMenu, setContextMenu] = useState<{ tabId: string; x: number; y: number } | null>(null);

  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    if (contextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu]);

  const handleRename = (tabId: string) => {
    if (editName.trim()) {
      onTabRename(tabId, editName.trim());
    }
    setEditingTabId(null);
    setEditName('');
  };

  const handleContextMenu = (e: React.MouseEvent, tabId: string) => {
    e.preventDefault();
    setContextMenu({ tabId, x: e.clientX, y: e.clientY });
  };

  const handleDuplicate = (tabId: string) => {
    onTabDuplicate(tabId);
    setContextMenu(null);
  };

  const handleCloseOthers = (tabId: string) => {
    tabs.forEach(tab => {
      if (tab.id !== tabId) {
        onTabClose(tab.id);
      }
    });
    setContextMenu(null);
  };

  const handleCloseAll = () => {
    tabs.forEach(tab => onTabClose(tab.id));
    setContextMenu(null);
  };

  return (
    <div className="relative">
      <div className="flex items-center bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        <div className="flex items-center flex-1 min-w-0">
          <AnimatePresence mode="popLayout">
            {tabs.map((tab) => (
              <motion.div
                key={tab.id}
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className={`group flex items-center gap-2 px-4 py-2 border-r border-gray-200 dark:border-gray-700 cursor-pointer transition-colors min-w-0 max-w-[200px] ${
                  tab.id === activeTabId
                    ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400'
                    : 'hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
                onClick={() => onTabChange(tab.id)}
                onContextMenu={(e) => handleContextMenu(e, tab.id)}
              >
                {/* Tab Icon */}
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>

                {/* Tab Name */}
                {editingTabId === tab.id ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={() => handleRename(tab.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRename(tab.id);
                      if (e.key === 'Escape') {
                        setEditingTabId(null);
                        setEditName('');
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="px-1 py-0 text-sm bg-white dark:bg-gray-700 border border-blue-500 rounded outline-none w-full"
                    autoFocus
                  />
                ) : (
                  <span
                    className="text-sm truncate flex-1 min-w-0"
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      setEditingTabId(tab.id);
                      setEditName(tab.name);
                    }}
                  >
                    {tab.name}
                    {!tab.saved && <span className="text-orange-500 ml-1">•</span>}
                  </span>
                )}

                {/* Close Button */}
                {tabs.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTabClose(tab.id);
                    }}
                    className="p-0.5 hover:bg-gray-300 dark:hover:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* New Tab Button */}
        <button
          onClick={onNewTab}
          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors flex-shrink-0"
          title="New Tab (Ctrl+T)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-1 z-50 min-w-[160px]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setEditingTabId(contextMenu.tabId);
                setEditName(tabs.find(t => t.id === contextMenu.tabId)?.name || '');
                setContextMenu(null);
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Rename
            </button>
            <button
              onClick={() => handleDuplicate(contextMenu.tabId)}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Duplicate
            </button>
            <hr className="my-1 border-gray-200 dark:border-gray-700" />
            <button
              onClick={() => handleCloseOthers(contextMenu.tabId)}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Close Others
            </button>
            <button
              onClick={handleCloseAll}
              className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Close All
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard Shortcuts Info */}
      <div className="absolute right-0 top-0 p-2 text-xs text-gray-500 dark:text-gray-400 pointer-events-none">
        <span className="hidden lg:inline">Ctrl+T: New Tab • Ctrl+W: Close Tab • Double-click: Rename</span>
      </div>
    </div>
  );
}
