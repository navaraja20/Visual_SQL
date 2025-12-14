// Theme configurations for VisualSQL

export interface Theme {
  name: string;
  id: string;
  colors: {
    // Background colors
    bg: {
      primary: string;
      secondary: string;
      tertiary: string;
      elevated: string;
    };
    // Text colors
    text: {
      primary: string;
      secondary: string;
      tertiary: string;
      inverse: string;
    };
    // UI element colors
    border: string;
    divider: string;
    // Accent colors
    accent: {
      primary: string;
      secondary: string;
      success: string;
      warning: string;
      error: string;
      info: string;
    };
    // Syntax highlighting
    syntax: {
      keyword: string;
      string: string;
      number: string;
      comment: string;
      function: string;
      operator: string;
      variable: string;
    };
  };
}

export const themes: Theme[] = [
  {
    name: 'Light',
    id: 'light',
    colors: {
      bg: {
        primary: '#ffffff',
        secondary: '#f9fafb',
        tertiary: '#f3f4f6',
        elevated: '#ffffff',
      },
      text: {
        primary: '#111827',
        secondary: '#4b5563',
        tertiary: '#9ca3af',
        inverse: '#ffffff',
      },
      border: '#e5e7eb',
      divider: '#d1d5db',
      accent: {
        primary: '#3b82f6',
        secondary: '#8b5cf6',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#06b6d4',
      },
      syntax: {
        keyword: '#7c3aed',
        string: '#059669',
        number: '#dc2626',
        comment: '#6b7280',
        function: '#2563eb',
        operator: '#ea580c',
        variable: '#0891b2',
      },
    },
  },
  {
    name: 'Dark',
    id: 'dark',
    colors: {
      bg: {
        primary: '#111827',
        secondary: '#1f2937',
        tertiary: '#374151',
        elevated: '#1f2937',
      },
      text: {
        primary: '#f9fafb',
        secondary: '#d1d5db',
        tertiary: '#9ca3af',
        inverse: '#111827',
      },
      border: '#374151',
      divider: '#4b5563',
      accent: {
        primary: '#60a5fa',
        secondary: '#a78bfa',
        success: '#34d399',
        warning: '#fbbf24',
        error: '#f87171',
        info: '#22d3ee',
      },
      syntax: {
        keyword: '#a78bfa',
        string: '#34d399',
        number: '#fb7185',
        comment: '#6b7280',
        function: '#60a5fa',
        operator: '#fb923c',
        variable: '#22d3ee',
      },
    },
  },
  {
    name: 'Dracula',
    id: 'dracula',
    colors: {
      bg: {
        primary: '#282a36',
        secondary: '#21222c',
        tertiary: '#343746',
        elevated: '#21222c',
      },
      text: {
        primary: '#f8f8f2',
        secondary: '#bfbfbf',
        tertiary: '#6272a4',
        inverse: '#282a36',
      },
      border: '#44475a',
      divider: '#6272a4',
      accent: {
        primary: '#bd93f9',
        secondary: '#ff79c6',
        success: '#50fa7b',
        warning: '#f1fa8c',
        error: '#ff5555',
        info: '#8be9fd',
      },
      syntax: {
        keyword: '#ff79c6',
        string: '#f1fa8c',
        number: '#bd93f9',
        comment: '#6272a4',
        function: '#50fa7b',
        operator: '#ff79c6',
        variable: '#8be9fd',
      },
    },
  },
  {
    name: 'Nord',
    id: 'nord',
    colors: {
      bg: {
        primary: '#2e3440',
        secondary: '#3b4252',
        tertiary: '#434c5e',
        elevated: '#3b4252',
      },
      text: {
        primary: '#eceff4',
        secondary: '#d8dee9',
        tertiary: '#4c566a',
        inverse: '#2e3440',
      },
      border: '#4c566a',
      divider: '#434c5e',
      accent: {
        primary: '#88c0d0',
        secondary: '#81a1c1',
        success: '#a3be8c',
        warning: '#ebcb8b',
        error: '#bf616a',
        info: '#5e81ac',
      },
      syntax: {
        keyword: '#81a1c1',
        string: '#a3be8c',
        number: '#b48ead',
        comment: '#616e88',
        function: '#88c0d0',
        operator: '#81a1c1',
        variable: '#8fbcbb',
      },
    },
  },
  {
    name: 'Monokai',
    id: 'monokai',
    colors: {
      bg: {
        primary: '#272822',
        secondary: '#1e1f1c',
        tertiary: '#3e3d32',
        elevated: '#1e1f1c',
      },
      text: {
        primary: '#f8f8f2',
        secondary: '#cfcfc2',
        tertiary: '#75715e',
        inverse: '#272822',
      },
      border: '#3e3d32',
      divider: '#75715e',
      accent: {
        primary: '#66d9ef',
        secondary: '#ae81ff',
        success: '#a6e22e',
        warning: '#e6db74',
        error: '#f92672',
        info: '#66d9ef',
      },
      syntax: {
        keyword: '#f92672',
        string: '#e6db74',
        number: '#ae81ff',
        comment: '#75715e',
        function: '#a6e22e',
        operator: '#f92672',
        variable: '#66d9ef',
      },
    },
  },
  {
    name: 'Solarized Dark',
    id: 'solarized-dark',
    colors: {
      bg: {
        primary: '#002b36',
        secondary: '#073642',
        tertiary: '#586e75',
        elevated: '#073642',
      },
      text: {
        primary: '#fdf6e3',
        secondary: '#eee8d5',
        tertiary: '#657b83',
        inverse: '#002b36',
      },
      border: '#586e75',
      divider: '#073642',
      accent: {
        primary: '#268bd2',
        secondary: '#6c71c4',
        success: '#859900',
        warning: '#b58900',
        error: '#dc322f',
        info: '#2aa198',
      },
      syntax: {
        keyword: '#859900',
        string: '#2aa198',
        number: '#d33682',
        comment: '#586e75',
        function: '#268bd2',
        operator: '#859900',
        variable: '#b58900',
      },
    },
  },
  {
    name: 'Solarized Light',
    id: 'solarized-light',
    colors: {
      bg: {
        primary: '#fdf6e3',
        secondary: '#eee8d5',
        tertiary: '#93a1a1',
        elevated: '#fdf6e3',
      },
      text: {
        primary: '#002b36',
        secondary: '#073642',
        tertiary: '#586e75',
        inverse: '#fdf6e3',
      },
      border: '#93a1a1',
      divider: '#eee8d5',
      accent: {
        primary: '#268bd2',
        secondary: '#6c71c4',
        success: '#859900',
        warning: '#b58900',
        error: '#dc322f',
        info: '#2aa198',
      },
      syntax: {
        keyword: '#859900',
        string: '#2aa198',
        number: '#d33682',
        comment: '#93a1a1',
        function: '#268bd2',
        operator: '#859900',
        variable: '#b58900',
      },
    },
  },
  {
    name: 'GitHub Dark',
    id: 'github-dark',
    colors: {
      bg: {
        primary: '#0d1117',
        secondary: '#161b22',
        tertiary: '#21262d',
        elevated: '#161b22',
      },
      text: {
        primary: '#c9d1d9',
        secondary: '#8b949e',
        tertiary: '#484f58',
        inverse: '#0d1117',
      },
      border: '#30363d',
      divider: '#21262d',
      accent: {
        primary: '#58a6ff',
        secondary: '#bc8cff',
        success: '#3fb950',
        warning: '#d29922',
        error: '#f85149',
        info: '#79c0ff',
      },
      syntax: {
        keyword: '#ff7b72',
        string: '#a5d6ff',
        number: '#79c0ff',
        comment: '#8b949e',
        function: '#d2a8ff',
        operator: '#ff7b72',
        variable: '#ffa657',
      },
    },
  },
];

export const getTheme = (themeId: string): Theme => {
  return themes.find(t => t.id === themeId) || themes[0];
};

export const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  
  // Apply CSS custom properties
  root.style.setProperty('--color-bg-primary', theme.colors.bg.primary);
  root.style.setProperty('--color-bg-secondary', theme.colors.bg.secondary);
  root.style.setProperty('--color-bg-tertiary', theme.colors.bg.tertiary);
  root.style.setProperty('--color-bg-elevated', theme.colors.bg.elevated);
  
  root.style.setProperty('--color-text-primary', theme.colors.text.primary);
  root.style.setProperty('--color-text-secondary', theme.colors.text.secondary);
  root.style.setProperty('--color-text-tertiary', theme.colors.text.tertiary);
  root.style.setProperty('--color-text-inverse', theme.colors.text.inverse);
  
  root.style.setProperty('--color-border', theme.colors.border);
  root.style.setProperty('--color-divider', theme.colors.divider);
  
  root.style.setProperty('--color-accent-primary', theme.colors.accent.primary);
  root.style.setProperty('--color-accent-secondary', theme.colors.accent.secondary);
  root.style.setProperty('--color-accent-success', theme.colors.accent.success);
  root.style.setProperty('--color-accent-warning', theme.colors.accent.warning);
  root.style.setProperty('--color-accent-error', theme.colors.accent.error);
  root.style.setProperty('--color-accent-info', theme.colors.accent.info);
  
  root.style.setProperty('--color-syntax-keyword', theme.colors.syntax.keyword);
  root.style.setProperty('--color-syntax-string', theme.colors.syntax.string);
  root.style.setProperty('--color-syntax-number', theme.colors.syntax.number);
  root.style.setProperty('--color-syntax-comment', theme.colors.syntax.comment);
  root.style.setProperty('--color-syntax-function', theme.colors.syntax.function);
  root.style.setProperty('--color-syntax-operator', theme.colors.syntax.operator);
  root.style.setProperty('--color-syntax-variable', theme.colors.syntax.variable);
};
