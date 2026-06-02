import { useEffect } from 'react';
import AppRouter from './routes/AppRouter';
import HeaderLogo from './components/HeaderLogo';
import AnimatedSorteoBackground from './UI/AnimatedSorteoBackground';
import { clearAllCache } from './utils/clearCache';
// import BackgroundChecker from './UI/BackgroundChecker';


function App() {
  // Limpiar caché cuando la app se carga
  useEffect(() => {
    clearAllCache();
  }, []);

  return (
    <>
      <HeaderLogo />
      <AnimatedSorteoBackground />
      {/* <BackgroundChecker */}
      <AppRouter />
    </>
  );
}

export default App;
