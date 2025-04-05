import React, { useEffect } from 'react';
import {
    faBookOpen,
    faClockRotateLeft,
    faMoneyBillTransfer,
    faRightFromBracket,
    faDashboard,
    faUser,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import SideBarLink from '../SideBarLink';
import { Link } from 'react-router-dom';
const SideBar = () => {
    const list_navigation_admin = [
        {
            label: 'Dashboard',
            path: '/admin',
            icon: <FontAwesomeIcon icon={faDashboard} />,
        },
        {
            label: 'Users',
            path: '/admin/users',
            icon: <FontAwesomeIcon icon={faUser} />,
        },
        {
            label: 'Books',
            path: '/admin/books',
            icon: <FontAwesomeIcon icon={faBookOpen} />,
        },
        {
            label: 'Borrow History',
            path: '/admin/borrowHistory',
            icon: <FontAwesomeIcon icon={faClockRotateLeft} />,
        },
        {
            label: 'Transactions',
            path: '/admin/transactions',
            icon: <FontAwesomeIcon icon={faMoneyBillTransfer} />,
        },
        // {
        //     label: 'Chat',
        //     path: '/chat',
        //     icon: <FontAwesomeIcon icon={faMessage} />,
        // },
    ];

    return (
        <div className="sticky top-0 left-0 flex h-full w-[256px] flex-col border-r-[1px] border-[#E5E7EB] bg-[#E3E7F3] shadow-[0_0_10px_0_rgba(0,0,0,0.1)]">
            <div className="flex items-center justify-center py-[25px]">
                <Link to="/">
                    <h1 className="text-[24px] font-bold text-[#1B326D]">BookWorm</h1>
                </Link>
            </div>

            <div className="my-[24px] flex flex-col gap-[8px] px-[16px]">
                {list_navigation_admin.map((item) => (
                    <SideBarLink item={item} key={item.label} />
                ))}
                <div className="block cursor-pointer p-[12px_12px] text-[16px] font-medium text-[#1B326D]">
                    <FontAwesomeIcon icon={faRightFromBracket} className="mr-[10px]" />
                    <span>Logout</span>
                </div>
            </div>
        </div>
    );
};

export default SideBar;
