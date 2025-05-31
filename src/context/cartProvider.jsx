import React, { createContext, useContext, useState, useEffect } from 'react';
import { message } from 'antd';
import { deleteCart, getCartsOfUser } from '../services/cartService';
import { createLoanBatch } from '../services/loanService';
import dayjs from 'dayjs';
const CartContext = createContext();
export const CartProvider = ({ children }) => {
    const [carts, setCarts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showDateModal, setShowDateModal] = useState(false);
    const [borrowDates, setBorrowDates] = useState({
        borrowDate: null,
        dueDate: null,
    });
    const fetchCarts = async () => {
        const accessToken = localStorage.getItem('access_token');
        if (accessToken) {
            try {
                setLoading(true);
                const response = await getCartsOfUser();
                setCarts(response.data.data);
            } catch (err) {
                message.error('Failed to load your book cart');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleRemoveItem = async (itemId) => {
        try {
            setLoading(true);
            await deleteCart(itemId);
            setCarts(carts.filter((item) => item.id !== itemId));
            message.success('Remove item cart successfully');
        } catch (err) {
            message.error('Failed to remove item from cart');
        } finally {
            setLoading(false);
        }
    };

    const openBorrowModal = () => {
        setBorrowDates((prev) => ({
            ...prev,
            borrowDate: dayjs(new Date()),
        }));
        setShowDateModal(true);
    };

    const closeBorrowModal = () => {
        setShowDateModal(false);
    };

    const handleBorrow = async () => {
        try {
            setLoading(true);
            const { borrowDate, dueDate } = borrowDates;
            if (borrowDate >= dueDate) {
                message.error('Borrow date must be before due date');
                return;
            }
            await createLoanBatch(borrowDate?.format('YYYY-MM-DD'), dueDate?.format('YYYY-MM-DD'));

            message.success('Books borrowed successfully!');
            setCarts([]);
            closeBorrowModal();

            // Reset dates
            setBorrowDates({
                borrowDate: null,
                dueDate: null,
            });
        } catch (err) {
            message.error('Failed to process your borrow request');
        } finally {
            setLoading(false);
        }
    };

    const updateBorrowDates = (type, date) => {
        setBorrowDates((prev) => ({
            ...prev,
            [type]: date,
        }));
    };
    useEffect(() => {
        fetchCarts();
    }, []);

    return (
        <CartContext.Provider
            value={{
                carts,
                loading,
                fetchCarts,
                handleBorrow,
                handleRemoveItem,
                showDateModal,
                openBorrowModal,
                closeBorrowModal,
                borrowDates,
                updateBorrowDates,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};
export default CartContext;
