import { useLocation, Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { FiLoader } from 'react-icons/fi';
import Loading from '../components/Loading';

const AuthRoutes = () => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) return <Loading />;
    return user?.role == 'ADMIN' ? (
        <Navigate to="/admin" state={{ from: location }} replace />
    ) : user?.role == 'USER' ? (
        <Navigate to="/" state={{ from: location }} replace />
    ) : (
        <Outlet />
    );
};

export default AuthRoutes;
