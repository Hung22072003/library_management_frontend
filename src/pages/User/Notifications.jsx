import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { useEffect, useState } from 'react';
import { FormatDateTime } from '../../utils/FormatDateTime';
import Loading from '../../components/Loading';
import { Pagination } from 'antd';
import useNotification from '../../hooks/useNotifcation';

const Notifications = () => {
    const { user } = useAuth();
    const userId = user?.id || '1';
    const navigate = useNavigate();
    const { loading, markAsRead, fetchNotifications } = useNotification();
    const [notifications, setNotifications] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const pageSize = 6;

    const fetchData = async (currentPage) => {
        const response = await fetchNotifications(currentPage, pageSize);
        setNotifications(response.data);
        setTotal(response.total);
    };

    const handleClickNotification = (notification) => {
        if (!notification.is_read) {
            markAsRead(notification.id);
        }
        if (notification.batch_id) {
            navigate(
                user.role === 'ADMIN'
                    ? `/admin/borrowHistory/${notification.batch_id}`
                    : `/borrowHistory/${notification.batch_id}`,
            );
        } else if (notification.transaction_id) {
            navigate(user.role === 'ADMIN' ? `/admin/transactions` : `/transactions`);
        }
    };

    useEffect(() => {
        fetchData(page);
    }, [page]);

    if (loading && notifications.length === 0) {
        return <Loading />;
    }

    return (
        <div>
            <h1 className="mb-4 text-[20px] font-bold text-[#1B326D]">Notifications</h1>
            <div className="rounded-lg border border-gray-200 p-2">
                {notifications.length === 0 ? (
                    <div className="py-4 text-center text-gray-500">You don't have notifications</div>
                ) : (
                    <>
                        <ul className="space-y-2">
                            {notifications.map((item) => (
                                <li
                                    key={item.id}
                                    onClick={() => handleClickNotification(item)}
                                    className={`cursor-pointer rounded-lg p-4 transition duration-200 ${
                                        item.is_read ? 'bg-[#eff0f3]' : 'bg-white'
                                    } hover:bg-[#eff0f3]`}
                                >
                                    <div>
                                        <p className="font-medium text-[#1B326D]">{item.message}</p>
                                        <span className="mt-1 block text-xs text-gray-500">
                                            {FormatDateTime(item.created_at)}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-4 flex justify-center">
                            <Pagination
                                current={page}
                                pageSize={pageSize}
                                total={total}
                                onChange={(newPage) => setPage(newPage)}
                                showSizeChanger={false}
                                className="text-[#1B326D]"
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Notifications;
