import { useState, useEffect } from 'react';
import { HomePage } from './components/HomePage';
import { Workspace } from './components/Workspace';
import { useStore } from './store/useStore';

function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'workspace'>('home');
  const theme = useStore(state => state.theme);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <>
      {currentPage === 'home' ? (
        <HomePage onGetStarted={() => setCurrentPage('workspace')} />
      ) : (
        <Workspace onNavigateHome={() => setCurrentPage('home')} />
      )}
    </>
  );
}

export default App;