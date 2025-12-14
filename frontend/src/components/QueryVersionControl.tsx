import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface QueryVersion {
  id: string;
  query: string;
  timestamp: number;
  message: string;
  branch: string;
  author: string;
  tags: string[];
}

interface Branch {
  name: string;
  head: string; // version ID
  created: number;
}

interface QueryVersionControlProps {
  isOpen: boolean;
  onClose: () => void;
  currentQuery: string;
  queryId?: string;
  onLoadVersion: (query: string) => void;
}

export default function QueryVersionControl({
  isOpen,
  onClose,
  currentQuery,
  queryId = 'default',
  onLoadVersion,
}: QueryVersionControlProps) {
  const [versions, setVersions] = useState<QueryVersion[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [currentBranch, setCurrentBranch] = useState('main');
  const [commitMessage, setCommitMessage] = useState('');
  const [showCommitDialog, setShowCommitDialog] = useState(false);
  const [showBranchDialog, setShowBranchDialog] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareVersions, setCompareVersions] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'graph'>('list');
  const [filterBranch, setFilterBranch] = useState<string>('all');

  useEffect(() => {
    if (isOpen) {
      loadVersionHistory();
    }
  }, [isOpen, queryId]);

  const loadVersionHistory = () => {
    const key = `visualsql_query_versions_${queryId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      const data = JSON.parse(stored);
      setVersions(data.versions || []);
      setBranches(data.branches || [{ name: 'main', head: '', created: Date.now() }]);
      setCurrentBranch(data.currentBranch || 'main');
    } else {
      // Initialize with main branch
      setBranches([{ name: 'main', head: '', created: Date.now() }]);
      setCurrentBranch('main');
    }
  };

  const saveVersionHistory = (newVersions: QueryVersion[], newBranches: Branch[], newCurrentBranch: string) => {
    const key = `visualsql_query_versions_${queryId}`;
    localStorage.setItem(key, JSON.stringify({
      versions: newVersions,
      branches: newBranches,
      currentBranch: newCurrentBranch,
    }));
    setVersions(newVersions);
    setBranches(newBranches);
    setCurrentBranch(newCurrentBranch);
  };

  const commitVersion = () => {
    if (!commitMessage.trim()) {
      alert('Please enter a commit message');
      return;
    }

    const newVersion: QueryVersion = {
      id: `v${Date.now()}`,
      query: currentQuery,
      timestamp: Date.now(),
      message: commitMessage,
      branch: currentBranch,
      author: localStorage.getItem('visualsql_user_name') || 'Anonymous',
      tags: [],
    };

    const newVersions = [...versions, newVersion];
    
    // Update branch head
    const newBranches = branches.map(b =>
      b.name === currentBranch ? { ...b, head: newVersion.id } : b
    );

    saveVersionHistory(newVersions, newBranches, currentBranch);
    setCommitMessage('');
    setShowCommitDialog(false);
  };

  const createBranch = () => {
    if (!newBranchName.trim()) {
      alert('Please enter a branch name');
      return;
    }

    if (branches.some(b => b.name === newBranchName)) {
      alert('Branch name already exists');
      return;
    }

    const currentHead = branches.find(b => b.name === currentBranch)?.head || '';
    const newBranch: Branch = {
      name: newBranchName,
      head: currentHead,
      created: Date.now(),
    };

    saveVersionHistory(versions, [...branches, newBranch], currentBranch);
    setNewBranchName('');
    setShowBranchDialog(false);
  };

  const switchBranch = (branchName: string) => {
    const branch = branches.find(b => b.name === branchName);
    if (!branch) return;

    // Load the head version of the branch
    const headVersion = versions.find(v => v.id === branch.head);
    if (headVersion) {
      onLoadVersion(headVersion.query);
    }

    saveVersionHistory(versions, branches, branchName);
  };

  const deleteBranch = (branchName: string) => {
    if (branchName === 'main') {
      alert('Cannot delete main branch');
      return;
    }

    if (branchName === currentBranch) {
      alert('Cannot delete current branch. Switch to another branch first.');
      return;
    }

    const newBranches = branches.filter(b => b.name !== branchName);
    saveVersionHistory(versions, newBranches, currentBranch);
  };

  const mergeBranch = (sourceBranch: string) => {
    if (sourceBranch === currentBranch) {
      alert('Cannot merge a branch into itself');
      return;
    }

    const sourceHead = branches.find(b => b.name === sourceBranch)?.head;
    const sourceVersion = versions.find(v => v.id === sourceHead);

    if (!sourceVersion) {
      alert('Source branch has no commits');
      return;
    }

    // Create merge commit
    const mergeVersion: QueryVersion = {
      id: `v${Date.now()}`,
      query: sourceVersion.query,
      timestamp: Date.now(),
      message: `Merge branch '${sourceBranch}' into '${currentBranch}'`,
      branch: currentBranch,
      author: localStorage.getItem('visualsql_user_name') || 'Anonymous',
      tags: ['merge'],
    };

    const newVersions = [...versions, mergeVersion];
    const newBranches = branches.map(b =>
      b.name === currentBranch ? { ...b, head: mergeVersion.id } : b
    );

    saveVersionHistory(newVersions, newBranches, currentBranch);
    onLoadVersion(mergeVersion.query);
  };

  const revertToVersion = (versionId: string) => {
    const version = versions.find(v => v.id === versionId);
    if (!version) return;

    if (confirm(`Revert to version from ${new Date(version.timestamp).toLocaleString()}?`)) {
      onLoadVersion(version.query);
      
      // Create revert commit
      const revertVersion: QueryVersion = {
        id: `v${Date.now()}`,
        query: version.query,
        timestamp: Date.now(),
        message: `Revert to: ${version.message}`,
        branch: currentBranch,
        author: localStorage.getItem('visualsql_user_name') || 'Anonymous',
        tags: ['revert'],
      };

      const newVersions = [...versions, revertVersion];
      const newBranches = branches.map(b =>
        b.name === currentBranch ? { ...b, head: revertVersion.id } : b
      );

      saveVersionHistory(newVersions, newBranches, currentBranch);
    }
  };

  const tagVersion = (versionId: string, tag: string) => {
    const newVersions = versions.map(v =>
      v.id === versionId ? { ...v, tags: [...v.tags, tag] } : v
    );
    saveVersionHistory(newVersions, branches, currentBranch);
  };

  const toggleCompareVersion = (versionId: string) => {
    if (compareVersions.includes(versionId)) {
      setCompareVersions(compareVersions.filter(id => id !== versionId));
    } else if (compareVersions.length < 2) {
      setCompareVersions([...compareVersions, versionId]);
    }
  };

  const getVersionDiff = (v1Id: string, v2Id: string) => {
    const v1 = versions.find(v => v.id === v1Id);
    const v2 = versions.find(v => v.id === v2Id);
    if (!v1 || !v2) return { additions: 0, deletions: 0 };

    const lines1 = v1.query.split('\n');
    const lines2 = v2.query.split('\n');
    
    let additions = 0;
    let deletions = 0;

    lines2.forEach(line => {
      if (!lines1.includes(line)) additions++;
    });

    lines1.forEach(line => {
      if (!lines2.includes(line)) deletions++;
    });

    return { additions, deletions };
  };

  const filteredVersions = filterBranch === 'all' 
    ? versions 
    : versions.filter(v => v.branch === filterBranch);

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
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <div>
                <h2 className="text-2xl font-bold">Query Version Control</h2>
                <p className="text-indigo-100 text-sm">Git-like version management for your queries</p>
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

          {/* Branch Info */}
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
              </svg>
              <span className="font-medium">{currentBranch}</span>
            </div>
            <div className="text-sm text-indigo-100">
              {filteredVersions.length} commits
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCommitDialog(true)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Commit
            </button>
            <button
              onClick={() => setShowBranchDialog(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Branch
            </button>
            <button
              onClick={() => setCompareMode(!compareMode)}
              className={`px-4 py-2 ${compareMode ? 'bg-orange-600' : 'bg-gray-600'} hover:bg-opacity-80 text-white rounded-lg flex items-center gap-2 transition-colors`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              {compareMode ? 'Exit Compare' : 'Compare'}
            </button>
          </div>

          {/* Branch Filter */}
          <select
            value={filterBranch}
            onChange={(e) => setFilterBranch(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="all">All Branches</option>
            {branches.map(branch => (
              <option key={branch.name} value={branch.name}>{branch.name}</option>
            ))}
          </select>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Branches Panel */}
            <div className="lg:col-span-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Branches</h3>
              <div className="space-y-2">
                {branches.map(branch => (
                  <div
                    key={branch.name}
                    className={`p-3 rounded-lg border-2 ${
                      branch.name === currentBranch
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                        </svg>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{branch.name}</span>
                      </div>
                      {branch.name === currentBranch && (
                        <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">current</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {branch.name !== currentBranch && (
                        <>
                          <button
                            onClick={() => switchBranch(branch.name)}
                            className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50"
                          >
                            Checkout
                          </button>
                          <button
                            onClick={() => mergeBranch(branch.name)}
                            className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded hover:bg-green-200 dark:hover:bg-green-900/50"
                          >
                            Merge
                          </button>
                          {branch.name !== 'main' && (
                            <button
                              onClick={() => deleteBranch(branch.name)}
                              className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50"
                            >
                              Delete
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Version History */}
            <div className="lg:col-span-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Commit History {compareMode && '(Select 2 versions to compare)'}
              </h3>
              <div className="space-y-3">
                {filteredVersions.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <p>No commits yet</p>
                    <p className="text-sm mt-2">Create your first commit to start tracking changes</p>
                  </div>
                ) : (
                  [...filteredVersions].reverse().map((version, idx) => (
                    <motion.div
                      key={version.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`p-4 rounded-lg border-2 ${
                        compareVersions.includes(version.id)
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                          : selectedVersion === version.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                      } cursor-pointer hover:shadow-md transition-all`}
                      onClick={() => {
                        if (compareMode) {
                          toggleCompareVersion(version.id);
                        } else {
                          setSelectedVersion(version.id === selectedVersion ? null : version.id);
                        }
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900 dark:text-gray-100">{version.message}</span>
                            {version.tags.map(tag => (
                              <span key={tag} className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-2 py-0.5 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <span>{version.author}</span>
                            <span>•</span>
                            <span>{new Date(version.timestamp).toLocaleString()}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                              </svg>
                              {version.branch}
                            </span>
                          </div>
                        </div>
                      </div>

                      {selectedVersion === version.id && !compareMode && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700"
                        >
                          <pre className="text-sm bg-gray-50 dark:bg-gray-900 p-3 rounded overflow-x-auto text-gray-900 dark:text-gray-100 mb-3">
                            {version.query}
                          </pre>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                revertToVersion(version.id);
                              }}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                            >
                              Revert to this version
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(version.query);
                              }}
                              className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm"
                            >
                              Copy Query
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  ))
                )}
              </div>

              {/* Compare View */}
              {compareMode && compareVersions.length === 2 && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-500">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Comparison</h4>
                  {(() => {
                    const diff = getVersionDiff(compareVersions[0], compareVersions[1]);
                    return (
                      <div className="flex items-center gap-6 text-sm">
                        <span className="flex items-center gap-2 text-green-600 dark:text-green-400">
                          <span className="font-semibold">+{diff.additions}</span> additions
                        </span>
                        <span className="flex items-center gap-2 text-red-600 dark:text-red-400">
                          <span className="font-semibold">-{diff.deletions}</span> deletions
                        </span>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Commit Dialog */}
        <AnimatePresence>
          {showCommitDialog && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 flex items-center justify-center p-4"
              onClick={() => setShowCommitDialog(false)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Create Commit</h3>
                <textarea
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  placeholder="Enter commit message..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 mb-4 min-h-[100px]"
                  autoFocus
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setShowCommitDialog(false)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={commitVersion}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                  >
                    Commit
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Branch Dialog */}
        <AnimatePresence>
          {showBranchDialog && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 flex items-center justify-center p-4"
              onClick={() => setShowBranchDialog(false)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Create Branch</h3>
                <input
                  type="text"
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  placeholder="Enter branch name..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 mb-4"
                  autoFocus
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setShowBranchDialog(false)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createBranch}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    Create
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
