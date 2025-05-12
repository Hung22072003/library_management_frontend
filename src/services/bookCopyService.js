import axios from './axiosInstance';

const getConditionsOfBookCopy = (bookId) => {
    return axios.get(`api/bookcopies/${bookId}`);
};

export { getConditionsOfBookCopy };
