
// Evernote Design System Tokens
export const designTokens = {
  // Spacing (8px grid system)
  spacing: {
    xs: '4px',   // 0.5rem
    sm: '8px',   // 1rem
    md: '12px',  // 1.5rem
    lg: '16px',  // 2rem
    xl: '20px',  // 2.5rem
    xxl: '24px', // 3rem
  },
  
  // Component dimensions
  dimensions: {
    buttonHeight: '36px',      // h-9
    inputHeight: '36px',       // h-9
    sidebarWidth: '240px',     // w-60
    toolbarHeight: '48px',     // h-12
    cardMinHeight: '120px',    // min-h-30
  },
  
  // Typography
  fonts: {
    primary: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
    mono: "'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace",
  },
  
  // Colors (Evernote palette)
  colors: {
    // Dark theme colors
    dark: {
      bg: '#2a2a2a',           // Main background
      sidebarBg: '#2a2a2a',    // Sidebar background
      cardBg: '#3a3a3a',       // Card/note background
      borderColor: '#404040',   // Border color
      textPrimary: '#ffffff',   // Primary text
      textSecondary: '#b3b3b3', // Secondary text
      textMuted: '#808080',     // Muted text
      accent: '#00a82d',        // Green accent (Note button)
      accentHover: '#008a24',   // Green hover state
      blue: '#4285f4',          // Blue accent
      blueHover: '#3367d6',     // Blue hover
      warning: '#ff9500',       // Orange/warning
    },
    
    // Light theme colors (for editor)
    light: {
      bg: '#ffffff',
      border: '#e1e1e1',
      text: '#484848',
      textSecondary: '#737373',
      toolbarBg: '#f8f8f8',
    }
  },
  
  // Border radius
  borderRadius: {
    sm: '4px',
    md: '6px',
    lg: '8px',
  },
  
  // Shadows
  shadows: {
    card: '0 1px 3px rgba(0, 0, 0, 0.1)',
    hover: '0 2px 8px rgba(0, 0, 0, 0.15)',
    focus: '0 0 0 2px rgba(66, 133, 244, 0.3)',
  }
} as const;

// Tailwind utility classes for consistent spacing
export const spacingClasses = {
  // Padding classes
  padding: {
    xs: 'p-1',    // 4px
    sm: 'p-2',    // 8px
    md: 'p-3',    // 12px
    lg: 'p-4',    // 16px
    xl: 'p-5',    // 20px
    xxl: 'p-6',   // 24px
  },
  
  // Gap classes
  gap: {
    xs: 'gap-1',  // 4px
    sm: 'gap-2',  // 8px
    md: 'gap-3',  // 12px
    lg: 'gap-4',  // 16px
  },
  
  // Standard component dimensions
  button: 'h-9 px-4 py-2',
  input: 'h-9 px-3 py-2',
  card: 'p-4 gap-3',
  icon: 'w-5 h-5',
} as const;
