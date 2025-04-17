import axios from './axiosInstance';

const getCartsOfUser = () => {
    return axios.get('api/profile/carts');
};

const deleteCart = (id) => {
    return axios.delete(`api/carts/${id}`);
};

const createCart = (book_id, rental_fee) => {
    return axios.post('api/carts', { book_id, rental_fee });
};

export { getCartsOfUser, deleteCart, createCart };
