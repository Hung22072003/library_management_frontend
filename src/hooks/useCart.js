import { useContext } from 'react';
import CartContext from '../context/cartProvider';

const useCart = () => {
    return useContext(CartContext);
};

export default useCart;
