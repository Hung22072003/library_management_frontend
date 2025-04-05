import React from 'react';
import avatar from '../assets/default-avatar.jpg';
import { faRightFromBracket, faAddressCard, faBell, faBookMedical } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dropdown } from 'antd';
import useAuth from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
const Header = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
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
    return (
        <div className="flex h-[64px] items-center justify-end border-b-[1px] border-[#E5E7EB] bg-white px-[32px] shadow-[0_1px_0_0_rgba(0,0,0,0.1)]">
            <div className="flex items-center text-[#1B326D]">
                <FontAwesomeIcon icon={faBookMedical} className="mr-[16px] cursor-pointer text-[20px]" />
                <FontAwesomeIcon icon={faBell} className="mr-[16px] cursor-pointer text-[20px]" />
                <p className="mr-[8px] font-medium">{user.name} </p>
                <Dropdown
                    menu={{
                        items,
                    }}
                >
                    <img src={avatar} className="h-[32px] w-[32px] cursor-pointer rounded-full" />
                </Dropdown>
            </div>
        </div>
    );
};

export default Header;
