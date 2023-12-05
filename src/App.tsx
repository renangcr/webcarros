import { createBrowserRouter } from 'react-router-dom';

import { CarDetail } from './pages/car';
import { Dashboard } from './pages/dashboard';
import { New } from './pages/dashboard/new';
import { Home } from './pages/home';
import { Register } from './pages/register';
import { Login } from './pages/login';
import { Layout } from './components/layout';

import { Private } from './routes/Private';

export const router = createBrowserRouter([
  {
    element: <Layout/>,
    children: [
      {
        path: "/",
        element: <Home/>
      },
      {
        path: "/car/:id",
        element: <CarDetail/>
      },
      {
        path: "/dashboard",
        element: <Private><Dashboard/></Private>
      },
      {
        path: "/dashboard/new",
        element: <Private><New/></Private>
      },
    ],
    
  },
  {
    path: "/login",
    element: <Login/>
  },
  {
    path: "/register",
    element: <Register/>
  },
]);