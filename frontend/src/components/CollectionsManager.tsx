import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface QueryCollection {
  id: string;
  name: string;
  description: string;
  queries: Array<{
    id: string;
    name: string;
    query: string;
    module: string;
    createdAt: number;
    notes?: string;
  }>;
  createdAt: number;
  color: string;
}

interface CollectionsManagerProps {
  isOpen: boolean;
  onClose: () => void;
  currentQuery?: string;
  currentModule?: string;
  onLoadQuery: (query: string) => void;
}

const COLORS = [
  { name: 'Blue', value: 'from-blue-500 to-cyan-500', bg: 'bg-blue-100', text: 'text-blue-700' },
  { name: 'Purple', value: 'from-purple-500 to-pink-500', bg: 'bg-purple-100', text: 'text-purple-700' },
  { name: 'Green', value: 'from-green-500 to-emerald-500', bg: 'bg-green-100', text: 'text-green-700' },
  { name: 'Orange', value: 'from-orange-500 to-red-500', bg: 'bg-orange-100', text: 'text-orange-700' },
  { name: 'Indigo', value: 'from-indigo-500 to-blue-500', bg: 'bg-indigo-100', text: 'text-indigo-700' },
];

export default function CollectionsManager({ isOpen, onClose, currentQuery, currentModule, onLoadQuery }: CollectionsManagerProps) {
  const [collections, setCollections] = useState<QueryCollection[]>([]);
  const [activeView, setActiveView] = useState<'list' | 'create' | 'view'>('list');
  const [selectedCollection, setSelectedCollection] = useState<QueryCollection | null>(null);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDesc, setNewCollectionDesc] = useState('');
  const [newCollectionColor, setNewCollectionColor] = useState(COLORS[0].value);
  const [saveQueryName, setSaveQueryName] = useState('');
  const [saveQueryNotes, setSaveQueryNotes] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = () => {
    const saved = localStorage.getItem('queryCollections');
    if (saved) {
      setCollections(JSON.parse(saved));
    }
  };

  const saveCollections = (cols: QueryCollection[]) => {
    localStorage.setItem('queryCollections', JSON.stringify(cols));
    setCollections(cols);
  };

  const createCollection = () => {
    if (!newCollectionName.trim()) return;

    const newCollection: QueryCollection = {
      id: Date.now().toString(),
      name: newCollectionName,
      description: newCollectionDesc,
      queries: [],
      createdAt: Date.now(),
      color: newCollectionColor,
    };

    saveCollections([...collections, newCollection]);
    setNewCollectionName('');
    setNewCollectionDesc('');
    setActiveView('list');
  };

  const deleteCollection = (id: string) => {
    if (confirm('Are you sure you want to delete this collection?')) {
      saveCollections(collections.filter(c => c.id !== id));
    }
  };

  const saveQueryToCollection = (collectionId: string) => {
    if (!currentQuery || !saveQueryName.trim()) return;

    const updated = collections.map(col => {
      if (col.id === collectionId) {
        return {
          ...col,
          queries: [
            ...col.queries,
            {
              id: Date.now().toString(),
              name: saveQueryName,
              query: currentQuery,
              module: currentModule || 'Unknown',
              createdAt: Date.now(),
              notes: saveQueryNotes,
            },
          ],
        };
      }
      return col;
    });

    saveCollections(updated);
    setSaveQueryName('');
    setSaveQueryNotes('');
    setShowSaveDialog(false);
  };

  const deleteQuery = (collectionId: string, queryId: string) => {
    const updated = collections.map(col => {
      if (col.id === collectionId) {
        return {
          ...col,
          queries: col.queries.filter(q => q.id !== queryId),
        };
      }
      return col;
    });
    saveCollections(updated);
  };

  const loadQuery = (query: string) => {
    onLoadQuery(query);
    onClose();
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
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <div>
                <h2 className="text-2xl font-bold">Query Collections</h2>
                <p className="text-indigo-100 text-sm">Organize and save your SQL queries</p>
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

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveView('list')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeView === 'list'
                  ? 'bg-white text-indigo-600'
                  : 'bg-indigo-500 hover:bg-indigo-400 text-white'
              }`}
            >
              My Collections
            </button>
            <button
              onClick={() => setActiveView('create')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeView === 'create'
                  ? 'bg-white text-indigo-600'
                  : 'bg-indigo-500 hover:bg-indigo-400 text-white'
              }`}
            >
              + New Collection
            </button>
            {currentQuery && (
              <button
                onClick={() => setShowSaveDialog(true)}
                className="px-4 py-2 bg-green-500 hover:bg-green-400 text-white rounded-lg font-medium transition-colors ml-auto"
              >
                💾 Save Current Query
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <AnimatePresence mode="wait">
            {activeView === 'list' && (
              <motion.div
                key="list"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                {collections.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="w-24 h-24 mx-auto text-gray-300 dark:text-gray-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">No collections yet</p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm">Create your first collection to start organizing queries!</p>
                  </div>
                ) : (
                  collections.map((collection) => (
                    <motion.div
                      key={collection.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className={`bg-gradient-to-r ${collection.color} p-4`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-white mb-1">{collection.name}</h3>
                            <p className="text-white/90 text-sm">{collection.description}</p>
                            <div className="mt-2 flex items-center gap-4 text-white/80 text-xs">
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                {collection.queries.length} queries
                              </span>
                              <span>{new Date(collection.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedCollection(collection);
                                setActiveView('view');
                              }}
                              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                              title="View collection"
                            >
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => deleteCollection(collection.id)}
                              className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
                              title="Delete collection"
                            >
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}

            {activeView === 'create' && (
              <motion.div
                key="create"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Collection Name
                  </label>
                  <input
                    type="text"
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    placeholder="e.g., Advanced Queries, Interview Prep"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newCollectionDesc}
                    onChange={(e) => setNewCollectionDesc(e.target.value)}
                    placeholder="What type of queries will you save here?"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Color Theme
                  </label>
                  <div className="grid grid-cols-5 gap-3">
                    {COLORS.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setNewCollectionColor(color.value)}
                        className={`p-4 rounded-lg bg-gradient-to-r ${color.value} transition-transform ${
                          newCollectionColor === color.value ? 'ring-4 ring-offset-2 ring-indigo-500 scale-110' : 'hover:scale-105'
                        }`}
                      >
                        <div className="text-white text-xs font-semibold">{color.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={createCollection}
                  disabled={!newCollectionName.trim()}
                  className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Create Collection
                </button>
              </motion.div>
            )}

            {activeView === 'view' && selectedCollection && (
              <motion.div
                key="view"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <button
                  onClick={() => setActiveView('list')}
                  className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to collections
                </button>

                <div className={`bg-gradient-to-r ${selectedCollection.color} p-4 rounded-lg text-white`}>
                  <h3 className="text-2xl font-bold mb-2">{selectedCollection.name}</h3>
                  <p className="text-white/90">{selectedCollection.description}</p>
                </div>

                {selectedCollection.queries.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-500 dark:text-gray-400">No queries in this collection yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedCollection.queries.map((query) => (
                      <motion.div
                        key={query.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 dark:text-gray-100">{query.name}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Module: {query.module} • {new Date(query.createdAt).toLocaleDateString()}
                            </p>
                            {query.notes && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">"{query.notes}"</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => loadQuery(query.query)}
                              className="p-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                              title="Load query"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                              </svg>
                            </button>
                            <button
                              onClick={() => deleteQuery(selectedCollection.id, query.id)}
                              className="p-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                              title="Delete query"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs overflow-x-auto">
                          <code className="text-gray-800 dark:text-gray-200">{query.query}</code>
                        </pre>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Save Query Dialog */}
      {showSaveDialog && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/50 flex items-center justify-center"
          onClick={() => setShowSaveDialog(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Save Query</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Query Name
                </label>
                <input
                  type="text"
                  value={saveQueryName}
                  onChange={(e) => setSaveQueryName(e.target.value)}
                  placeholder="e.g., Get top customers"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Notes (optional)
                </label>
                <input
                  type="text"
                  value={saveQueryNotes}
                  onChange={(e) => setSaveQueryNotes(e.target.value)}
                  placeholder="Any notes about this query..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Save to Collection
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {collections.map((col) => (
                    <button
                      key={col.id}
                      onClick={() => saveQueryToCollection(col.id)}
                      disabled={!saveQueryName.trim()}
                      className={`w-full p-3 bg-gradient-to-r ${col.color} text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all text-left`}
                    >
                      <div className="font-semibold">{col.name}</div>
                      <div className="text-xs text-white/80">{col.queries.length} queries</div>
                    </button>
                  ))}
                  {collections.length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      No collections yet. Create one first!
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
