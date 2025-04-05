import axios from './axiosInstance';

const getAllAuthors = () => {
    return axios.get(`api/authors`);
};

export { getAllAuthors };
