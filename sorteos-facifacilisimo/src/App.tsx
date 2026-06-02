import AppRouter from './routes/AppRouter';
import HeaderLogo from './components/HeaderLogo';
import AnimatedSorteoBackground from './UI/AnimatedSorteoBackground';
// import BackgroundChecker from './UI/BackgroundChecker';


function App() {
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
