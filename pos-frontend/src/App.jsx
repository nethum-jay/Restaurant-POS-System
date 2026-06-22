import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { Home, Auth, Orders, Tables, Menu } from "./pages";
import Header from "./components/shared/Header";
import { useSelector } from "react-redux";

function Layout() {
  const location = useLocation();
  const hideHeaderRoutes = ["/auth"];

  return (
    <> 
      {!hideHeaderRoutes.includes(location.pathname) && <Header />}
      <Routes>      
          <Route 
            path="/" 
            element={
              <ProtectedRoutes>
                <Home />
              </ProtectedRoutes>
            } 
          />
          <Route path="/auth" element={<Auth />} />
          <Route 
          path="/orders" element={
            <ProtectedRoutes>
              <Orders />
            </ProtectedRoutes>
          } 
          />
          <Route path="/tables" element={
            <ProtectedRoutes>
              <Tables />
            </ProtectedRoutes>
          } />
          <Route path="/menu" element={<Menu />} />
          <Route path="*" element={<div>Not Found</div>} />
      </Routes>
    </>
  );
}

function ProtectedRoutes({children}) {
  const { isAuth } = useSelector(state => state.user);
  if(!isAuth){
    return <Navigate to="/auth" />
  }

  return children;
}
  
function App() {
  return (
    <Router>
      <Layout />
    </Router>
  )
}

export default App;
