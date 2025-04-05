import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import AuthRoutes from './roots/AuthRoutes';
import PrivateRoutes from './roots/PrivateRoutes';
import Layout from './components/Layout';
import LayoutAdmin from './components/Admin/Layout';
import Books from './pages/User/Books';
import AdminBooks from './pages/Admin/Books';
import AdminUsers from './pages/Admin/Users';
import Dashboard from './pages/Admin/Dashboard';
import CreateBook from './components/Admin/Books/CreateBook';
import BookDetail from './components/Admin/Books/BookDetail';
const roles = {
    user: 'USER',
    admin: 'ADMIN',
};
function App() {
    return (
        <div>
            <Router>
                <Routes>
                    <Route element={<AuthRoutes />}>
                        <Route path="/login" element={<Login />}></Route>
                        <Route path="/register" element={<Register />}></Route>
                    </Route>

                    <Route element={<PrivateRoutes allowedRoles={[roles.user, roles.admin]} />}>
                        <Route path="/" element={<Layout />}>
                            <Route index element={<Books />} />
                        </Route>

                        <Route element={<PrivateRoutes allowedRoles={[roles.admin]} />}>
                            <Route path="/admin" element={<LayoutAdmin />}>
                                <Route index element={<Dashboard />} />
                                <Route path="users" element={<AdminUsers />} />
                                <Route path="books" element={<AdminBooks />} />
                                <Route path="books/:id" element={<BookDetail />} />
                                <Route path="books/create" element={<CreateBook />} />
                            </Route>
                        </Route>
                    </Route>
                </Routes>
            </Router>
        </div>
    );
}

export default App;
