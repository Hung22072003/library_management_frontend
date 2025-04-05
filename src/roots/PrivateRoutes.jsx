import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { FiLoader } from 'react-icons/fi';
import Loading from '../components/Loading';
const PrivateRoutes = ({ allowedRoles }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) return <Loading />;
    return allowedRoles?.includes(user?.role) ? (
        <Outlet />
    ) : (
        <Navigate to="/login" state={{ from: location }} replace />
    );
};

export default PrivateRoutes;
