import React, { useEffect, useState, useRef } from 'react';
import avatar from '../assets/default-avatar.jpg';
import { faRightFromBracket, faAddressCard, faBell } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dropdown, Badge, Popover, List, Button, notification, message } from 'antd';
import useAuth from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { FormatDateTime } from '../utils/FormatDateTime';
import useNotification from '../hooks/useNotifcation';
// Hook quản lý Pusher và thông báo

const Header = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const { notifications, unreadCount, markAsRead } = useNotification();
    const [visible, setVisible] = useState(false); // Ref để kiểm soát Popover
    const handleLogout = () => {
        logout();
        navigate('/', { replace: true });
    };

    const items = [
        {
            key: '1',
            label: (
                <button className="cursor-pointer p-[8px_16px] text-[16px] font-[600] text-[#1B326D]">
                    <FontAwesomeIcon icon={faAddressCard} className="mr-[4px]" /> Profile
                </button>
            ),
        },
        {
            key: '2',
            label: (
                <button
                    className="cursor-pointer p-[8px_16px] text-[16px] font-[600] text-[#1B326D]"
                    onClick={handleLogout}
                >
                    <FontAwesomeIcon icon={faRightFromBracket} className="mr-[4px]" /> Logout
                </button>
            ),
        },
    ];

    const handleClickNotification = (notification) => {
        if (!notification.is_read) {
            markAsRead(notification.id);
        }
        setVisible(false);
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

    // Nội dung của Popover (danh sách thông báo)
    const notificationContent = (
        <div className="w-80">
            <div className="max-h-96 overflow-y-auto">
                <List
                    dataSource={notifications.slice(0, 6)} // Giới hạn 6 thông báo mới nhất
                    renderItem={(item) => (
                        <List.Item
                            className={`cursor-pointer hover:bg-[#eff0f3] ${item.is_read ? 'bg-[#eff0f3]' : 'bg-white'}`}
                            onClick={() => handleClickNotification(item)}
                        >
                            <List.Item.Meta
                                description={
                                    <div className="rounded-[8px] px-[16px]">
                                        <p className="font-medium text-[#1B326D]">{item.message}</p>
                                        <span className="mt-[4px] block text-xs text-gray-500">
                                            {FormatDateTime(item.created_at)}
                                        </span>
                                    </div>
                                }
                            />
                        </List.Item>
                    )}
                    locale={{ emptyText: "You don't have notifications" }}
                />
            </div>
            {notifications.length > 0 && (
                <div className="flex justify-center py-2">
                    <button
                        onClick={() => {
                            navigate(user.role === 'ADMIN' ? '/admin/notifications' : '/notifications');
                            setVisible(false);
                        }}
                        className="cursor-pointer font-bold text-[#1B326D] hover:opacity-[0.8]"
                    >
                        Show All
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <div className="flex h-[64px] items-center justify-end border-b-[1px] border-[#E5E7EB] bg-white px-[32px] shadow-[0_1px_0_0_rgba(0,0,0,0.1)]">
            <div className="flex items-center text-[#1B326D]">
                <Popover
                    open={visible} // Kiểm soát hiển thị bằng state
                    onOpenChange={setVisible}
                    content={notificationContent}
                    title="Notifications"
                    trigger="click"
                    placement="bottomRight"
                >
                    <div className="cursor-pointer rounded-full px-4 transition">
                        <Badge count={unreadCount} overflowCount={99} className="text-red-500">
                            <FontAwesomeIcon icon={faBell} className="text-[20px] text-gray-600" />
                        </Badge>
                    </div>
                </Popover>
                <p className="mr-[8px] font-medium">{user.name}</p>
                <Dropdown menu={{ items }}>
                    <img src={avatar} className="h-[32px] w-[32px] cursor-pointer rounded-full" alt="Avatar" />
                </Dropdown>
            </div>
        </div>
    );
};

export default Header;
