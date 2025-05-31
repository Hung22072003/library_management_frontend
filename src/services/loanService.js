import axios from './axiosInstance';

const createLoanBatch = (borrowed_at, due_date) => {
    return axios.post('/api/loans', { borrowed_at, due_date });
};

const getBatchesOfUser = (page, size) => {
    return axios.get(`api/profile/batches?page=${page}&size=${size}`);
};

const getAllBatches = (page, size, query) => {
    return axios.get(`api/loans?page=${page}&size=${size}&q=${query}`);
};

const getBatchById = (id) => {
    return axios.get(`/api/loans/${id}`);
};

const updateStatusBatch = (id, status) => {
    return axios.post(`/api/loans/status/${id}?status=${status}`);
};

const extendBatch = (id, date) => {
    return axios.post(`/api/loans/extend/${id}?date=${date}`);
};

const returnBatch = (data) => {
    return axios.post('/api/loans/return', data);
};

const returnOneBook = (data) => {
    return axios.post('/api/loans/detail/return', data);
};

export {
    createLoanBatch,
    getBatchesOfUser,
    getBatchById,
    updateStatusBatch,
    getAllBatches,
    returnBatch,
    extendBatch,
    returnOneBook,
};
