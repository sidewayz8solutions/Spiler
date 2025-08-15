@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --spiler-primary: 99 102 241;
    --spiler-secondary: 34 211 238;
    --spiler-dark: 26 26 46;
    --spiler-darker: 15 15 30;
    --spiler-success: 16 185 129;
    --spiler-warning: 245 158 11;
    --spiler-danger: 239 68 68;
  }

  * {
    @apply border-border;
  }

  body {
    @apply bg-spiler-darker text-white;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}

@layer components {
  .btn {
    @apply px-4 py-2 rounded-lg font-semibold transition-all duration-200 active:scale-95;
  }

  .btn-primary {
    @apply bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700;
  }

  .btn-secondary {
    @apply bg-gray-800 text-gray-200 hover:bg-gray-700;
  }

  .btn-success {
    @apply bg-gradient-to-r from-green-500 to-emerald-600 text-white;
  }

  .btn-danger {
    @apply bg-gradient-to-r from-red-500 to-red-600 text-white;
  }

  .card {
    @apply bg-spiler-dark/50 backdrop-blur-lg rounded-xl p-6 border border-indigo-500/10;
  }

  .input {
    @apply w-full px-4 py-2 bg-spiler-dark/50 border border-indigo-500/20 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors;
  }

  .badge {
    @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
  }

  .animate-pulse-slow {
    animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
}

@layer utilities {
  .gradient-border {
    background: linear-gradient(var(--spiler-dark), var(--spiler-dark)) padding-box,
                linear-gradient(135deg, rgb(var(--spiler-primary)), rgb(var(--spiler-secondary))) border-box;
    border: 2px solid transparent;
  }

  .text-gradient {
    @apply bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent;
  }

  .glass {
    @apply bg-white/5 backdrop-blur-md;
  }
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  @apply bg-spiler-darker;
}

::-webkit-scrollbar-thumb {
  @apply bg-indigo-500/50 rounded-full;
}

::-webkit-scrollbar-thumb:hover {
  @apply bg-indigo-500/70;
}

/* Loading animation */
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.shimmer {
  position: relative;
  overflow: hidden;
}

.shimmer::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent
  );
  animation: shimmer 2s infinite;
}