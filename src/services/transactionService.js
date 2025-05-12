import axios from './axiosInstance';

const getAllTransactions = (page, size, search) => {
    return axios.get(`api/transactions?page=${page}&size=${size}&q=${search}`);
};

const getTransactionById = (id) => {
    return axios.get(`api/transactions/${id}`);
};
const createTransaction = (values) => {
    return axios.post('api/transactions', values);
};

const getTransactionsOfLoanBatch = (id) => {
    return axios.get(`api/transactions/loan/${id}`);
};

const getTransactionsOfUser = (id, page, size, search) => {
    return axios.get(`api/transactions/user/${id}?page=${page}&size=${size}&q=${search}`);
};
const updateTransaction = (id, values) => {
    return axios.put(`api/transactions/${id}`, values);
};
export {
    getAllTransactions,
    createTransaction,
    getTransactionsOfLoanBatch,
    getTransactionById,
    updateTransaction,
    getTransactionsOfUser,
};
