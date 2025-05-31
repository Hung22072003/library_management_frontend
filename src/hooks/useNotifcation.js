import { useContext } from 'react';
import NotificationContext from '../context/notificationProvider';

const useNotification = () => {
    return useContext(NotificationContext);
};

export default useNotification;
