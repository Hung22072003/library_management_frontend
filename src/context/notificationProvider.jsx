import { createContext } from 'react';
import useAuth from '../hooks/useAuth';
import { notification } from 'antd';
import Pusher from 'pusher-js';
import { useEffect, useRef, useState } from 'react';
import { getAllNotifications, updateNotification } from '../services/notificationService';
const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const userId = user?.id || '1';
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const pusherRef = useRef(null); // Store Pusher instance
    const channelRef = useRef(null); // Store channel

    useEffect(() => {
        if (pusherRef.current) return;

        const pusher = new Pusher('92b091228e00bad280e8', {
            cluster: 'ap1',
            encrypted: true,
            authEndpoint: 'http://localhost:8000/broadcasting/auth',
            auth: {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                },
            },
        });
        pusherRef.current = pusher;

        const channel = pusher.subscribe(`private-notifications.${userId}`);
        channelRef.current = channel;

        channel.bind('notification-event', (data) => {
            setNotifications((prev) => [data.message, ...prev]);
            setUnreadCount((prev) => prev + 1);

            notification.info({
                message: 'You have a new notification',
                description: data.message.message,
                placement: 'bottomRight',
                duration: 2,
            });
        });

        return () => {
            if (channelRef.current) {
                channelRef.current.unbind_all();
                pusher.unsubscribe(`private-notifications.${userId}`);
                channelRef.current = null;
            }
            if (pusherRef.current) {
                pusherRef.current.disconnect();
                pusherRef.current = null;
            }
        };
    }, [userId]);

    useEffect(() => {
        const fetchData = async () => {
            const initialNotifications = await fetchNotifications();
            setUnreadCount(initialNotifications.data.filter((notif) => !notif.is_read).length);
            setNotifications(initialNotifications.data);
        };
        fetchData();
    }, []);

    const fetchNotifications = async (page = 1, size = 6) => {
        setLoading(true);
        try {
            const response = await getAllNotifications(page, size);

            return response.data.data;
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await updateNotification(id);
        } catch (error) {
            message.error('Error marking notification as read');
        }
        setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, is_read: true } : notif)));
        setUnreadCount((prev) => Math.max(prev - 1, 0));
    };
    return (
        <NotificationContext.Provider
            value={{ loading, total, notifications, setNotifications, unreadCount, markAsRead, fetchNotifications }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

export default NotificationContext;
