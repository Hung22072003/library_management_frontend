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
import AdminBorrowHistory from './pages/Admin/BorrowHistory';
import AdminBorrowDetail from './pages/Admin/LoanBatchDetail';
import CreateBook from './components/Admin/Books/CreateBook';
import BookDetail from './components/Admin/Books/BookDetail';
import Carts from './pages/User/Carts';
import BorrowHistory from './pages/User/BorrowHistory';
import LoanBatchDetail from './pages/User/LoanBatchDetail';
import BookCopies from './pages/Admin/BookCopies';
import BookCopyDetail from './pages/Admin/BookCopyDetail';
import AdminTransactions from './pages/Admin/Transactions';
import ConfirmTransaction from './pages/ConfirmTransaction';
import Transactions from './pages/User/Transactions';
import Notifications from './pages/User/Notifications';
import Chat from './pages/User/Chat';
import RequestOtp from './pages/RequestOtp';
import ResetPassword from './pages/ResetPassword';
import VerifyOtp from './pages/VerifyOtp';
import Profile from './pages/User/Profile';
import AdminProfile from './pages/Admin/Profile';
import AdminNotifications from './pages/Admin/Notifications';
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
                        <Route path="/forgot-password/request-otp" element={<RequestOtp />}></Route>
                        <Route path="/forgot-password/verify-otp" element={<VerifyOtp />}></Route>
                        <Route path="/forgot-password/reset" element={<ResetPassword />}></Route>
                    </Route>

                    <Route element={<PrivateRoutes allowedRoles={[roles.user, roles.admin]} />}>
                        <Route path="/" element={<Layout />}>
                            <Route index element={<Books />} />
                            <Route path="/carts" element={<Carts />} />
                            <Route path="/borrowHistory" element={<BorrowHistory />} />
                            <Route path="/borrowHistory/:id" element={<LoanBatchDetail />} />
                            <Route path="/transactions" element={<Transactions />} />
                            <Route path="/notifications" element={<Notifications />} />
                            <Route path="/chat" element={<Chat />} />
                            <Route path="/profile" element={<Profile />} />
                        </Route>

                        <Route element={<PrivateRoutes allowedRoles={[roles.admin]} />}>
                            <Route path="/admin" element={<LayoutAdmin />}>
                                <Route index element={<Dashboard />} />
                                <Route path="users" element={<AdminUsers />} />
                                <Route path="books" element={<AdminBooks />} />
                                <Route path="books/:id" element={<BookDetail />} />
                                <Route path="books/:id/copies" element={<BookCopies />} />
                                <Route path="books/create" element={<CreateBook />} />
                                <Route path="copies/:id" element={<BookCopyDetail />} />
                                <Route path="borrowHistory" element={<AdminBorrowHistory />} />
                                <Route path="borrowHistory/:id" element={<AdminBorrowDetail />} />
                                <Route path="transactions" element={<AdminTransactions />} />
                                <Route path="profile" element={<AdminProfile />} />
                                <Route path="notifications" element={<AdminNotifications />} />
                            </Route>
                        </Route>

                        <Route path="/confirmTransaction" element={<ConfirmTransaction />} />
                    </Route>
                </Routes>
            </Router>
        </div>
    );
}

export default App;
