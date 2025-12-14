import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import dynamic from 'next/dynamic';
import VisualizationCanvas from '@/components/VisualizationCanvas';
import { format } from 'sql-formatter';
import { useTheme } from '@/contexts/ThemeContext';
import QueryTemplates from '@/components/QueryTemplates';
import SchemaExplorer from '@/components/SchemaExplorer';
import KeyboardShortcuts from '@/components/KeyboardShortcuts';
import ShareModal from '@/components/ShareModal';
import HintsPanel from '@/components/HintsPanel';
import { API_ENDPOINTS } from '@/config/api';
import CollectionsManager from '@/components/CollectionsManager';
import ThemeSelector from '@/components/ThemeSelector';
import QueryDiff from '@/components/QueryDiff';
import QueryVersionControl from '@/components/QueryVersionControl';
import AIQueryAssistant from '@/components/AIQueryAssistant';
import QueryTabs, { QueryTab } from '@/components/QueryTabs';
import ResultCharts from '@/components/ResultCharts';
import SQLSnippets from '@/components/SQLSnippets';
import * as XLSX from 'xlsx';

const SQLEditor = dynamic(() => import('@/components/SQLEditor'), { ssr: false });

interface Module {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  description: string;
  content: string;
  sampleQueries: Array<{
    title: string;
    query: string;
    description: string;
  }>;
  recommendedSchema: string;
  hints?: string[];
}

interface ExecutionResult {
  steps: any[];
  finalResult: any;
  error?: string;
  executionTime: number;
}

interface SavedQuery {
  id: string;
  query: string;
  timestamp: number;
  module: string;
  favorite: boolean;
}

export default function ModulePage() {
  const router = useRouter();
  const { moduleId } = router.query;
  const { themeId, setThemeId, toggleTheme, showThemeSelector, setShowThemeSelector } = useTheme();
  
  const [module, setModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [query, setQuery] = useState('');
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showContent, setShowContent] = useState(true);
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [rowCount, setRowCount] = useState<number | null>(null);
  const [fetchingCount, setFetchingCount] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSchema, setShowSchema] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [showSharedNotification, setShowSharedNotification] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [revealedHintsCount, setRevealedHintsCount] = useState(0);
  const [showCollections, setShowCollections] = useState(false);
  const [showQueryDiff, setShowQueryDiff] = useState(false);
  const [diffLeftQuery, setDiffLeftQuery] = useState('');
  const [diffRightQuery, setDiffRightQuery] = useState('');
  const [showVersionControl, setShowVersionControl] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [tabs, setTabs] = useState<QueryTab[]>([]);
  const [activeTabId, setActiveTabId] = useState('');
  const [showSnippets, setShowSnippets] = useState(false);

  useEffect(() => {
    if (moduleId) {
      fetchModule();
      loadQueryHistory();
      loadTabs();
    }
  }, [moduleId]);

  const loadTabs = () => {
    const key = `visualsql_tabs_${moduleId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      const loadedTabs = JSON.parse(stored);
      setTabs(loadedTabs);
      const activeId = localStorage.getItem(`visualsql_active_tab_${moduleId}`);
      if (activeId && loadedTabs.find((t: QueryTab) => t.id === activeId)) {
        setActiveTabId(activeId);
        const activeTab = loadedTabs.find((t: QueryTab) => t.id === activeId);
        if (activeTab) setQuery(activeTab.query);
      } else if (loadedTabs.length > 0) {
        setActiveTabId(loadedTabs[0].id);
        setQuery(loadedTabs[0].query);
      }
    } else {
      const initialTab: QueryTab = {
        id: `tab-${Date.now()}`,
        name: 'Query 1',
        query: '',
        saved: true,
        timestamp: Date.now(),
      };
      setTabs([initialTab]);
      setActiveTabId(initialTab.id);
      saveTabs([initialTab], initialTab.id);
    }
  };

  const saveTabs = (newTabs: QueryTab[], activeId: string) => {
    const key = `visualsql_tabs_${moduleId}`;
    localStorage.setItem(key, JSON.stringify(newTabs));
    localStorage.setItem(`visualsql_active_tab_${moduleId}`, activeId);
  };

  const handleNewTab = () => {
    const newTab: QueryTab = {
      id: `tab-${Date.now()}`,
      name: `Query ${tabs.length + 1}`,
      query: '',
      saved: true,
      timestamp: Date.now(),
    };
    const newTabs = [...tabs, newTab];
    setTabs(newTabs);
    setActiveTabId(newTab.id);
    setQuery('');
    saveTabs(newTabs, newTab.id);
  };

  const handleTabChange = (tabId: string) => {
    if (activeTabId) {
      const updatedTabs = tabs.map(t =>
        t.id === activeTabId ? { ...t, query, saved: true } : t
      );
      setTabs(updatedTabs);
      saveTabs(updatedTabs, tabId);
    }
    
    const tab = tabs.find(t => t.id === tabId);
    if (tab) {
      setActiveTabId(tabId);
      setQuery(tab.query);
    }
  };

  const handleTabClose = (tabId: string) => {
    if (tabs.length === 1) return;
    
    const tabIndex = tabs.findIndex(t => t.id === tabId);
    const newTabs = tabs.filter(t => t.id !== tabId);
    
    let newActiveId = activeTabId;
    if (tabId === activeTabId) {
      newActiveId = tabIndex > 0 ? newTabs[tabIndex - 1].id : newTabs[0].id;
      const newActiveTab = newTabs.find(t => t.id === newActiveId);
      if (newActiveTab) setQuery(newActiveTab.query);
    }
    
    setTabs(newTabs);
    setActiveTabId(newActiveId);
    saveTabs(newTabs, newActiveId);
  };

  const handleTabRename = (tabId: string, newName: string) => {
    const updatedTabs = tabs.map(t =>
      t.id === tabId ? { ...t, name: newName } : t
    );
    setTabs(updatedTabs);
    saveTabs(updatedTabs, activeTabId);
  };

  const handleTabDuplicate = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return;
    
    const newTab: QueryTab = {
      id: `tab-${Date.now()}`,
      name: `${tab.name} (copy)`,
      query: tab.query,
      saved: true,
      timestamp: Date.now(),
    };
    const newTabs = [...tabs, newTab];
    setTabs(newTabs);
    setActiveTabId(newTab.id);
    setQuery(newTab.query);
    saveTabs(newTabs, newTab.id);
  };

  useEffect(() => {
    if (activeTabId && tabs.length > 0) {
      const activeTab = tabs.find(t => t.id === activeTabId);
      if (activeTab && activeTab.query !== query) {
        const updatedTabs = tabs.map(t =>
          t.id === activeTabId ? { ...t, query, saved: false } : t
        );
        setTabs(updatedTabs);
      }
    }
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 't') {
          e.preventDefault();
          handleNewTab();
        } else if (e.key === 'w') {
          e.preventDefault();
          if (tabs.length > 1) handleTabClose(activeTabId);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tabs, activeTabId]);

  // Load shared query from URL params
  useEffect(() => {
    if (router.isReady && router.query.q) {
      try {
        const sharedQuery = decodeURIComponent(router.query.q as string);
        setQuery(sharedQuery);
        setShowSharedNotification(true);
        // Auto-hide notification after 5 seconds
        setTimeout(() => setShowSharedNotification(false), 5000);
        // Auto-execute if autorun param is present
        if (router.query.autorun === 'true') {
          setTimeout(() => {
            executeQuery();
          }, 500);
        }
      } catch (error) {
        console.error('Error loading shared query:', error);
      }
    }
  }, [router.isReady, router.query.q, router.query.autorun]);

  const loadQueryHistory = () => {
    const stored = localStorage.getItem('visualsql_query_history');
    if (stored) {
      try {
        setSavedQueries(JSON.parse(stored));
      } catch (e) {
        console.error('Error loading history:', e);
      }
    }
  };

  const saveQueryToHistory = (queryText: string) => {
    const newQuery: SavedQuery = {
      id: Date.now().toString(),
      query: queryText,
      timestamp: Date.now(),
      module: module?.id || '',
      favorite: false,
    };
    
    const updated = [newQuery, ...savedQueries.filter(q => q.query !== queryText)].slice(0, 50);
    setSavedQueries(updated);
    localStorage.setItem('visualsql_query_history', JSON.stringify(updated));
  };

  const toggleFavorite = (id: string) => {
    const updated = savedQueries.map(q => 
      q.id === id ? { ...q, favorite: !q.favorite } : q
    );
    setSavedQueries(updated);
    localStorage.setItem('visualsql_query_history', JSON.stringify(updated));
  };

  const deleteQuery = (id: string) => {
    const updated = savedQueries.filter(q => q.id !== id);
    setSavedQueries(updated);
    localStorage.setItem('visualsql_query_history', JSON.stringify(updated));
  };

  useEffect(() => {
    if (moduleId) {
      fetchModule();
    }
  }, [moduleId]);

  const fetchModule = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.modules}/${moduleId}`);
      const data = await response.json();
      setModule(data);
      
      // Set first sample query as default
      if (data.sampleQueries && data.sampleQueries.length > 0) {
        setQuery(data.sampleQueries[0].query);
      }
    } catch (error) {
      console.error('Error fetching module:', error);
    } finally {
      setLoading(false);
    }
  };

  const executeQuery = async () => {
    if (!query.trim()) return;
    
    setExecuting(true);
    setExecutionResult(null);
    setCurrentStep(0);
    setRowCount(null);
    
    try {
      const response = await fetch(API_ENDPOINTS.query, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query.trim(),
          schema: module?.recommendedSchema || 'employees',
        }),
      });
      
      const result = await response.json();
      setExecutionResult(result);
      
      if (!result.error) {
        saveQueryToHistory(query.trim());
        trackQueryExecution(true);
      } else {
        trackQueryExecution(false);
      }
      
      if (result.error) {
        // Don't use alert - show error in UI
        console.error('Query error:', result.error);
      }
    } catch (error: any) {
      trackQueryExecution(false);
      setExecutionResult({
        steps: [],
        finalResult: { name: 'error', rows: [] },
        error: `Network error: ${error.message}. Make sure the backend server is running.`,
        executionTime: 0,
      });
    } finally {
      setExecuting(false);
    }
  };

  const trackQueryExecution = (success: boolean) => {
    if (!module) return;

    const progressKey = 'moduleProgress';
    const saved = localStorage.getItem(progressKey);
    const progress = saved ? JSON.parse(saved) : [];

    const existingIndex = progress.findIndex((p: any) => p.moduleId === module.id);
    
    if (existingIndex >= 0) {
      progress[existingIndex].queriesExecuted++;
      if (success) progress[existingIndex].successfulQueries++;
      else progress[existingIndex].errorCount++;
      progress[existingIndex].lastVisited = Date.now();
      progress[existingIndex].timeSpent += 30; // Estimate 30 seconds per query
    } else {
      progress.push({
        moduleId: module.id,
        moduleName: module.title,
        category: module.category,
        completed: false,
        lastVisited: Date.now(),
        timeSpent: 30,
        queriesExecuted: 1,
        successfulQueries: success ? 1 : 0,
        errorCount: success ? 0 : 1,
      });
    }

    localStorage.setItem(progressKey, JSON.stringify(progress));
  };

  const loadSampleQuery = (sampleQuery: string) => {
    setQuery(sampleQuery);
    setExecutionResult(null);
    setCurrentStep(0);
    setRowCount(null);
  };

  const getPerformanceTips = (queryText: string, executionTime: number): string[] => {
    const tips: string[] = [];
    const upperQuery = queryText.toUpperCase();

    if (executionTime < 10) {
      tips.push('⚡ Excellent performance! This query executed very quickly.');
    } else if (executionTime < 50) {
      tips.push('✓ Good performance for this query.');
    }

    if (upperQuery.includes('SELECT *') && upperQuery.includes('WHERE')) {
      tips.push('💡 Consider selecting only needed columns instead of * for better performance in large tables.');
    }

    if (upperQuery.includes('LIKE \'%') && upperQuery.includes('%\'')) {
      tips.push('⚠️ LIKE with leading wildcard (\'%text%\') cannot use indexes and may be slow on large tables.');
    }

    if (upperQuery.includes('OR') && (upperQuery.match(/OR/g) || []).length > 2) {
      tips.push('💡 Multiple OR conditions may prevent index usage. Consider using IN() or UNION if applicable.');
    }

    if (upperQuery.includes('ORDER BY') && !upperQuery.includes('LIMIT')) {
      tips.push('💡 Add LIMIT clause when ordering large result sets to improve performance.');
    }

    if (upperQuery.includes('DISTINCT') && upperQuery.includes('JOIN')) {
      tips.push('💡 DISTINCT with JOINs can be slow. Ensure JOIN conditions are correct to avoid duplicates.');
    }

    if (upperQuery.includes('GROUP BY') && upperQuery.includes('HAVING')) {
      tips.push('✓ Using HAVING with GROUP BY - consider moving non-aggregate filters to WHERE clause.');
    }

    if (!upperQuery.includes('WHERE') && upperQuery.includes('JOIN')) {
      tips.push('💡 Consider adding WHERE conditions to filter rows early in the query execution.');
    }

    return tips;
  };

  const previewRowCount = async () => {
    if (!query.trim() || fetchingCount) return;

    setFetchingCount(true);
    setRowCount(null);

    try {
      // Extract FROM clause and build COUNT query
      const fromMatch = query.match(/FROM\s+(\w+)/i);
      if (!fromMatch) {
        setRowCount(null);
        return;
      }

      const countQuery = `SELECT COUNT(*) as count FROM ${fromMatch[1]}`;
      
      const response = await fetch(API_ENDPOINTS.query, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: countQuery,
          schema: module?.recommendedSchema || 'employees',
        }),
      });
      
      const result = await response.json();
      if (!result.error && result.steps && result.steps.length > 0) {
        const lastStep = result.steps[result.steps.length - 1];
        const count = lastStep?.resultTable?.rows[0]?.count;
        setRowCount(count || 0);
      }
    } catch (error) {
      console.error('Error fetching row count:', error);
    } finally {
      setFetchingCount(false);
    }
  };

  const formatQuery = () => {
    try {
      const formatted = format(query, {
        language: 'sqlite',
        tabWidth: 2,
        keywordCase: 'upper',
        linesBetweenQueries: 2,
      });
      setQuery(formatted);
    } catch (error) {
      console.error('Format error:', error);
    }
  };

  const generateShareLink = () => {
    const baseUrl = window.location.origin + window.location.pathname;
    const encodedQuery = encodeURIComponent(query.trim());
    const link = `${baseUrl}?q=${encodedQuery}`;
    setShareLink(link);
    setShowShareModal(true);
    setCopied(false);
  };

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      console.error('Failed to copy:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    // Don't handle shortcuts when modals are open (except Escape)
    if (showShortcuts && e.key !== 'Escape') return;

    // Ctrl+Enter or Cmd+Enter to execute
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!e.shiftKey) {
        executeQuery();
      }
    }
    // Ctrl+Shift+F or Cmd+Shift+F to format
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
      e.preventDefault();
      formatQuery();
    }
    // Ctrl+H to toggle history
    if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
      e.preventDefault();
      setShowHistory(prev => !prev);
    }
    // Ctrl+T to toggle templates
    if ((e.ctrlKey || e.metaKey) && e.key === 't') {
      e.preventDefault();
      setShowTemplates(prev => !prev);
    }
    // Ctrl+B to toggle schema browser
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault();
      setShowSchema(prev => !prev);
    }
    // Ctrl+M to toggle module content
    if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
      e.preventDefault();
      setShowContent(prev => !prev);
    }
    // Ctrl+D to toggle dark mode
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
      e.preventDefault();
      toggleTheme();
    }
    // Ctrl+E to export CSV
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'e') {
      e.preventDefault();
      exportToCSV();
    }
    // Ctrl+Shift+E to export JSON
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'E') {
      e.preventDefault();
      exportToJSON();
    }
    // Ctrl+R to get row count
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
      e.preventDefault();
      previewRowCount();
    }
    // ? or Ctrl+/ to show keyboard shortcuts
    if (e.key === '?' || ((e.ctrlKey || e.metaKey) && e.key === '/')) {
      e.preventDefault();
      setShowShortcuts(true);
    }
    // Escape to close modals
    if (e.key === 'Escape') {
      if (showShortcuts) setShowShortcuts(false);
      else if (showHistory) setShowHistory(false);
      else if (showTemplates) setShowTemplates(false);
      else if (showSchema) setShowSchema(false);
    }
    // Space to play/pause (when visualization is active)
    if (e.key === ' ' && executionResult && !(e.target as Element)?.matches?.('input, textarea')) {
      e.preventDefault();
      if (isPlaying) {
        setIsPlaying(false);
      } else {
        playAnimation();
      }
    }
    // Arrow keys for step navigation (when visualization is active)
    if (executionResult && !(e.target as Element)?.matches?.('input, textarea')) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleStepChange(currentStep - 1);
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleStepChange(currentStep + 1);
      }
      if (e.key === 'Home') {
        e.preventDefault();
        setCurrentStep(0);
      }
      if (e.key === 'End' && executionResult.steps.length > 0) {
        e.preventDefault();
        setCurrentStep(executionResult.steps.length - 1);
      }
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [query, executing, executionResult, currentStep, isPlaying, showHistory, showTemplates, showSchema, showShortcuts, showContent]);

  const handleStepChange = (step: number) => {
    if (executionResult && step >= 0 && step < executionResult.steps.length) {
      setCurrentStep(step);
    }
  };

  const playAnimation = () => {
    setIsPlaying(true);
    setCurrentStep(0);
    
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (executionResult && step >= executionResult.steps.length) {
        clearInterval(interval);
        setIsPlaying(false);
      } else {
        setCurrentStep(step);
      }
    }, 2000);
  };

  const exportToCSV = () => {
    if (!executionResult || executionResult.error) return;
    
    const lastStep = executionResult.steps[executionResult.steps.length - 1];
    const rows = lastStep?.resultTable?.rows || [];
    
    if (rows.length === 0) {
      alert('No data to export');
      return;
    }

    const columns = Object.keys(rows[0]);
    // Add UTF-8 BOM for Excel compatibility
    const BOM = '\uFEFF';
    const csvRows = [
      columns.join(','),
      ...rows.map((row: any) => columns.map(col => {
        const value = row[col];
        if (value === null || value === undefined) return 'NULL';
        const stringValue = String(value);
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(','))
    ];

    const csv = BOM + csvRows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query_result_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportToJSON = () => {
    if (!executionResult || executionResult.error) return;
    
    const lastStep = executionResult.steps[executionResult.steps.length - 1];
    const rows = lastStep?.resultTable?.rows || [];
    
    if (rows.length === 0) {
      alert('No data to export');
      return;
    }

    const exportData = {
      metadata: {
        timestamp: new Date().toISOString(),
        query: query.trim(),
        rowCount: rows.length,
        executionTime: executionResult.executionTime + 'ms'
      },
      data: rows
    };

    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query_result_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportToExcel = () => {
    if (!executionResult || executionResult.error) return;
    
    const lastStep = executionResult.steps[executionResult.steps.length - 1];
    const rows = lastStep?.resultTable?.rows || [];
    
    if (rows.length === 0) {
      alert('No data to export');
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Query Results');
    XLSX.writeFile(workbook, `query_result_${Date.now()}.xlsx`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Module Not Found</h1>
          <Link href="/modules" className="text-blue-600 hover:underline">
            Back to Modules
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{module.title} - VisualSQL</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </Head>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-3 sm:py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
              <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
                <Link href="/modules" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100" title="Back to modules">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </Link>
                <Link href="/dashboard" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400" title="View dashboard">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </Link>
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 truncate">{module.title}</h1>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">{module.category}</p>
                </div>
                <span className={`text-xs px-2 sm:px-3 py-1 rounded-full font-medium whitespace-nowrap ${
                  module.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                  module.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {module.difficulty}
                </span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setShowThemeSelector(true)}
                  className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 flex-shrink-0"
                  title="Choose Theme"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </button>
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 flex-shrink-0"
                  title={`Switch to ${themeId === 'light' ? 'dark' : 'light'} mode`}
                >
                  {themeId === 'light' ? (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="px-2 sm:px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0"
                  title="Query History"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="hidden sm:inline">History</span>
                  {savedQueries.length > 0 && (
                    <span className="bg-purple-600 text-white text-xs rounded-full px-1.5 sm:px-2 py-0.5">{savedQueries.length}</span>
                  )}
                </button>
                <button
                  onClick={() => setShowTemplates(!showTemplates)}
                  className="px-2 sm:px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0"
                  title="Query Templates"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="hidden sm:inline">Templates</span>
                </button>
                <button
                  onClick={() => setShowSchema(!showSchema)}
                  className="px-2 sm:px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900/50 flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0"
                  title="Database Schema"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                  </svg>
                  <span className="hidden sm:inline">Schema</span>
                </button>
                <button
                  onClick={() => setShowCollections(true)}
                  className="px-2 sm:px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0"
                  title="Query Collections"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span className="hidden sm:inline">Collections</span>
                </button>
                <button
                  onClick={() => {
                    if (module?.sampleQueries && module.sampleQueries.length > 0) {
                      setDiffLeftQuery(query);
                      setDiffRightQuery(module.sampleQueries[0].query);
                      setShowQueryDiff(true);
                    }
                  }}
                  className="px-2 sm:px-4 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-900/50 flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0"
                  title="Compare Queries"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <span className="hidden sm:inline">Compare</span>
                </button>
                <button
                  onClick={() => setShowVersionControl(true)}
                  className="px-2 sm:px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0"
                  title="Version Control"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  <span className="hidden sm:inline">Version</span>
                </button>
                <button
                  onClick={() => setShowAIAssistant(true)}
                  className="px-2 sm:px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-400 rounded-lg hover:from-purple-200 hover:to-pink-200 dark:hover:from-purple-900/50 dark:hover:to-pink-900/50 flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0"
                  title="AI Assistant"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span className="hidden sm:inline">AI Help</span>
                </button>
                <button
                  onClick={() => setShowSnippets(true)}
                  className="px-2 sm:px-4 py-2 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 rounded-lg hover:bg-cyan-200 dark:hover:bg-cyan-900/50 flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0"
                  title="SQL Snippets Library"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span className="hidden sm:inline">Snippets</span>
                </button>
                {module?.hints && module.hints.length > 0 && (
                  <button
                    onClick={() => setShowHints(!showHints)}
                    className="px-2 sm:px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-900/50 flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0"
                    title="Progressive Hints"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <span className="hidden sm:inline">Hints</span>
                    {revealedHintsCount > 0 && (
                      <span className="bg-yellow-600 text-white text-xs rounded-full px-1.5 sm:px-2 py-0.5">{revealedHintsCount}/{module.hints.length}</span>
                    )}
                  </button>
                )}
                <button
                  onClick={() => setShowShortcuts(true)}
                  className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 flex-shrink-0"
                  title="Keyboard Shortcuts (?)"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </button>
                <button
                  onClick={() => setShowContent(!showContent)}
                  className="px-2 sm:px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm whitespace-nowrap flex-shrink-0"
                >
                  {showContent ? 'Hide' : 'Show'} Lesson
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-3 sm:py-6">
          {/* Shared Query Notification */}
          {showSharedNotification && (
            <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 dark:border-blue-700 p-3 sm:p-4 rounded-lg shadow-lg animate-pulse">
              <div className="flex items-start">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <h4 className="text-sm sm:text-base font-semibold text-blue-900 dark:text-blue-100">Shared Query Loaded</h4>
                  <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 mt-1">
                    A shared SQL query has been loaded into the editor. Click "Run with Visualization" to execute it.
                  </p>
                </div>
                <button
                  onClick={() => setShowSharedNotification(false)}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 ml-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6">
            {/* Left Panel: E-Lecture Content */}
            {showContent && (
              <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 sm:p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                <div className="prose dark:prose-invert prose-sm max-w-none prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-li:text-gray-700 dark:prose-li:text-gray-300 prose-strong:text-gray-900 dark:prose-strong:text-gray-100 prose-code:text-gray-900 dark:prose-code:text-gray-100">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {module.content}
                  </ReactMarkdown>
                </div>
              </div>
            )}

            {/* Right Panel: Editor and Visualization */}
            <div className={`${showContent ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-3 sm:space-y-6`}>
              {/* Templates Panel */}
              {showTemplates && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">Query Templates</h3>
                    <button
                      onClick={() => setShowTemplates(false)}
                      className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <QueryTemplates onSelectTemplate={(selectedQuery) => {
                    setQuery(selectedQuery);
                    setShowTemplates(false);
                  }} />
                </div>
              )}

              {/* Schema Explorer Panel */}
              {showSchema && module && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">Database Schema</h3>
                    <button
                      onClick={() => setShowSchema(false)}
                      className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <SchemaExplorer 
                    schema={module.recommendedSchema} 
                    onInsertTable={(tableName) => {
                      setQuery(query + (query ? ' ' : '') + tableName);
                    }}
                  />
                </div>
              )}

              {/* Hints Panel */}
              {showHints && module?.hints && module.hints.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">Progressive Hints</h3>
                    <button
                      onClick={() => setShowHints(false)}
                      className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <HintsPanel 
                    hints={module.hints}
                    revealedCount={revealedHintsCount}
                    onRevealNext={() => setRevealedHintsCount(prev => Math.min(prev + 1, module.hints!.length))}
                    onReset={() => setRevealedHintsCount(0)}
                  />
                </div>
              )}

              {/* Query History Sidebar */}
              {showHistory && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">Query History</h3>
                    <button
                      onClick={() => setShowHistory(false)}
                      className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {savedQueries.length === 0 ? (
                      <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-8">No saved queries yet. Run a query to save it to history.</p>
                    ) : (
                      <>
                        {savedQueries.filter(q => q.favorite).length > 0 && (
                          <>
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-2 mb-2">⭐ Favorites</h4>
                            {savedQueries.filter(q => q.favorite).map(sq => (
                              <div key={sq.id} className="border border-yellow-200 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 rounded p-3 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors">
                                <div className="flex items-start justify-between mb-2">
                                  <code className="text-xs text-gray-700 dark:text-gray-300 flex-1 break-all">{sq.query.substring(0, 80)}{sq.query.length > 80 ? '...' : ''}</code>
                                  <div className="flex space-x-1 ml-2">
                                    <button
                                      onClick={() => toggleFavorite(sq.id)}
                                      className="text-yellow-600 dark:text-yellow-500 hover:text-yellow-700 dark:hover:text-yellow-400"
                                      title="Remove from favorites"
                                    >
                                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                      </svg>
                                    </button>
                                    <button
                                      onClick={() => deleteQuery(sq.id)}
                                      className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                                      title="Delete"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(sq.timestamp).toLocaleString()}</span>
                                  <button
                                    onClick={() => { setQuery(sq.query); setShowHistory(false); }}
                                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                                  >
                                    Load
                                  </button>
                                </div>
                              </div>
                            ))}
                          </>
                        )}
                        
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-4 mb-2">Recent Queries</h4>
                        {savedQueries.filter(q => !q.favorite).map(sq => (
                          <div key={sq.id} className="border border-gray-200 dark:border-gray-700 rounded p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <div className="flex items-start justify-between mb-2">
                              <code className="text-xs text-gray-700 dark:text-gray-300 flex-1 break-all">{sq.query.substring(0, 80)}{sq.query.length > 80 ? '...' : ''}</code>
                              <div className="flex space-x-1 ml-2">
                                <button
                                  onClick={() => toggleFavorite(sq.id)}
                                  className="text-gray-400 dark:text-gray-500 hover:text-yellow-600 dark:hover:text-yellow-500"
                                  title="Add to favorites"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => deleteQuery(sq.id)}
                                  className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                                  title="Delete"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(sq.timestamp).toLocaleString()}</span>
                              <button
                                onClick={() => { setQuery(sq.query); setShowHistory(false); }}
                                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                              >
                                Load
                              </button>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              )}
              
              {/* SQL Editor */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                {/* Query Tabs */}
                <QueryTabs
                  tabs={tabs}
                  activeTabId={activeTabId}
                  onTabChange={handleTabChange}
                  onTabClose={handleTabClose}
                  onTabRename={handleTabRename}
                  onNewTab={handleNewTab}
                  onTabDuplicate={handleTabDuplicate}
                />
                
                <div className="p-3 sm:p-6">
                  <div className="mb-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">SQL Query Editor</h3>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4">
                      {module.sampleQueries.map((sq, idx) => (
                        <button
                          key={idx}
                          onClick={() => loadSampleQuery(sq.query)}
                          className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50"
                          title={sq.description}
                        >
                          {sq.title}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <SQLEditor value={query} onChange={setQuery} />
                
                <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:space-x-4">
                    <button
                      onClick={executeQuery}
                      disabled={executing || !query.trim()}
                      className="px-4 sm:px-6 py-2 sm:py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm sm:text-base"
                    >
                      {executing ? 'Executing...' : 'Run with Visualization'}
                    </button>
                    
                    <button
                      onClick={formatQuery}
                      disabled={!query.trim()}
                      className="px-3 sm:px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm sm:text-base"
                      title="Format SQL (Ctrl+Shift+F)"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                      Format
                    </button>

                    <button
                      onClick={previewRowCount}
                      disabled={fetchingCount || !query.trim()}
                      className="px-3 sm:px-4 py-2 bg-amber-600 dark:bg-amber-700 text-white font-medium rounded-lg hover:bg-amber-700 dark:hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm sm:text-base"
                      title="Preview row count"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                      </svg>
                      {fetchingCount ? 'Counting...' : 'Preview'}
                    </button>

                    <button
                      onClick={generateShareLink}
                      disabled={!query.trim()}
                      className="px-3 sm:px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm sm:text-base"
                      title="Share query"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      <span className="hidden sm:inline">Share</span>
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-2 sm:space-x-4">
                    {rowCount !== null && (
                      <div className="text-xs sm:text-sm font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 sm:px-3 py-1 rounded-lg whitespace-nowrap">
                        ~{rowCount} rows
                      </div>
                    )}
                    {executionResult && !executionResult.error && (
                      <>
                        <div className="flex items-center gap-2 sm:space-x-3 text-xs sm:text-sm">
                          <div className={`flex items-center space-x-1 px-2 sm:px-3 py-1 rounded-lg ${
                            executionResult.executionTime < 10 ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' :
                            executionResult.executionTime < 50 ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' :
                            'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400'
                          }`}>
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <span className="font-medium">{executionResult.executionTime}ms</span>
                          </div>
                          <div className="text-gray-600 dark:text-gray-400 hidden sm:block">
                            {executionResult.steps.length} steps
                          </div>
                          {executionResult.steps[executionResult.steps.length - 1]?.resultTable?.rows && (
                            <div className="text-gray-600 dark:text-gray-400 hidden sm:block">
                              • {executionResult.steps[executionResult.steps.length - 1].resultTable.rows.length} rows returned
                            </div>
                          )}
                        </div>
                      </>
                    )}
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs">Ctrl+Enter</kbd> to run
                    </div>
                  </div>
                </div>
                </div>
              </div>

              {/* Visualization Canvas */}
              {executionResult && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 sm:p-6">
                  {executionResult.error ? (
                    /* Error Display */
                    <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-700 p-4 sm:p-6 rounded">
                      <div className="flex items-start">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 dark:text-red-400 mt-1 mr-2 sm:mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="flex-1">
                          <h3 className="text-base sm:text-lg font-semibold text-red-900 dark:text-red-100 mb-2">Query Error</h3>
                          <p className="text-red-800 dark:text-red-200 whitespace-pre-wrap font-mono text-xs sm:text-sm">{executionResult.error}</p>
                          <div className="mt-4 text-xs sm:text-sm text-red-700 dark:text-red-300">
                            <p className="font-semibold mb-1">💡 Tips:</p>
                            <ul className="list-disc list-inside space-y-1">
                              <li>Check table and column names for typos</li>
                              <li>Ensure proper SQL syntax (SELECT ... FROM ...)</li>
                              <li>Use sample queries as templates</li>
                              <li>Review the lesson content for examples</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Success - Show Visualization */
                    <>
                      <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">Query Execution Visualization</h3>
                        <div className="flex items-center gap-1.5 sm:space-x-2 flex-wrap">
                          <button
                            onClick={exportToCSV}
                            className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700 flex items-center space-x-1"
                            title="Export as CSV"
                          >
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>CSV</span>
                          </button>
                          <button
                            onClick={exportToJSON}
                            className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center space-x-1"
                            title="Export as JSON"
                          >
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>JSON</span>
                          </button>
                          <button
                            onClick={exportToExcel}
                            className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm bg-green-600 text-white rounded hover:bg-green-700 flex items-center space-x-1"
                            title="Export as Excel"
                          >
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>Excel</span>
                          </button>
                          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
                          <button
                            onClick={() => handleStepChange(currentStep - 1)}
                            disabled={currentStep === 0 || isPlaying}
                            className="p-1.5 sm:p-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
                          >
                            ←
                          </button>
                          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                            Step {currentStep + 1} / {executionResult.steps.length}
                          </span>
                          <button
                            onClick={() => handleStepChange(currentStep + 1)}
                            disabled={currentStep >= executionResult.steps.length - 1 || isPlaying}
                            className="p-1.5 sm:p-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
                          >
                            →
                          </button>
                          <button
                            onClick={playAnimation}
                            disabled={isPlaying}
                            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-green-600 dark:bg-green-700 text-white rounded hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 text-xs sm:text-sm"
                          >
                            {isPlaying ? 'Playing...' : 'Play'}
                          </button>
                        </div>
                      </div>
                      
                      <VisualizationCanvas
                        step={executionResult.steps[currentStep]}
                        stepIndex={currentStep}
                      />

                      {/* Data Visualization Charts */}
                      {executionResult.steps[executionResult.steps.length - 1]?.resultTable?.rows && (
                        <div className="mt-6">
                          <ResultCharts data={executionResult.steps[executionResult.steps.length - 1].resultTable.rows} />
                        </div>
                      )}

                      {/* Performance Tips */}
                      {getPerformanceTips(query, executionResult.executionTime).length > 0 && (
                        <div className="mt-4 bg-blue-50 dark:bg-blue-900/10 border-l-4 border-blue-500 dark:border-blue-700 p-4 rounded">
                          <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2 flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Performance Tips
                          </h4>
                          <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-300">
                            {getPerformanceTips(query, executionResult.executionTime).map((tip, idx) => (
                              <li key={idx} className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts Modal */}
        <KeyboardShortcuts 
          isOpen={showShortcuts} 
          onClose={() => setShowShortcuts(false)} 
        />

        {/* Share Modal */}
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          shareLink={shareLink}
          onCopy={copyShareLink}
          copied={copied}
        />

        {/* Collections Manager */}
        <CollectionsManager
          isOpen={showCollections}
          onClose={() => setShowCollections(false)}
          currentQuery={query}
          currentModule={module?.title}
          onLoadQuery={(loadedQuery) => setQuery(loadedQuery)}
        />

        {/* Theme Selector */}
        <ThemeSelector
          isOpen={showThemeSelector}
          onClose={() => setShowThemeSelector(false)}
          currentTheme={themeId}
          onThemeChange={setThemeId}
        />

        {/* Query Diff Modal */}
        <QueryDiff
          isOpen={showQueryDiff}
          onClose={() => setShowQueryDiff(false)}
          leftQuery={diffLeftQuery}
          rightQuery={diffRightQuery}
          leftLabel="Your Query"
          rightLabel="Solution"
        />

        {/* Version Control Modal */}
        <QueryVersionControl
          isOpen={showVersionControl}
          onClose={() => setShowVersionControl(false)}
          currentQuery={query}
          queryId={moduleId as string}
          onLoadVersion={(loadedQuery) => setQuery(loadedQuery)}
        />

        {/* AI Query Assistant */}
        <AIQueryAssistant
          isOpen={showAIAssistant}
          onClose={() => setShowAIAssistant(false)}
          currentQuery={query}
          moduleContext={module?.title}
          onInsertQuery={(generatedQuery) => setQuery(generatedQuery)}
        />

        {/* SQL Snippets Library */}
        <SQLSnippets
          isOpen={showSnippets}
          onClose={() => setShowSnippets(false)}
          onInsert={(code) => {
            // Update query in active tab
            const updatedTabs = tabs.map(tab => 
              tab.id === activeTabId 
                ? { ...tab, query: code, saved: false }
                : tab
            );
            setTabs(updatedTabs);
            saveTabs(updatedTabs, activeTabId);
            setQuery(code);
          }}
        />
      </div>
    </>
  );
}
