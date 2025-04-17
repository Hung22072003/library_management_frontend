import React, { createContext, useContext, useState, useEffect } from 'react';
import { message } from 'antd';
import { getBatchById, updateStatusBatch } from '../services/loanService';

const BatchDetailContext = createContext();

export const BatchDetailProvider = ({ children }) => {
    const [batchDetail, setBatchDetail] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadBatchDetail = async (batchId) => {
        try {
            setLoading(true);
            const response = await getBatchById(batchId);
            setBatchDetail(response.data.data);
            setError(null);
        } catch (err) {
            setError('Failed to load batch details');
            message.error('Failed to load batch details');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelBatch = async (batchId) => {
        try {
            setLoading(true);
            await updateStatusBatch(batchId, 'cancel');
            message.success('Batch canceled successfully');
            loadBatchDetail(batchId);
        } catch (err) {
            setError('Failed to cancel batch');
            message.error('Failed to cancel batch');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmBorrowed = async (batchId) => {
        try {
            setLoading(true);
            await updateStatusBatch(batchId, 'borrowed');
            message.success('Confirm borrowed successfully');
            loadBatchDetail(batchId);
        } catch (err) {
            setError('Failed to borrow batch');
            message.error('Failed to borrow batch');
        } finally {
            setLoading(false);
        }
    };

    return (
        <BatchDetailContext.Provider
            value={{
                batchDetail,
                loading,
                error,
                loadBatchDetail,
                handleCancelBatch,
                handleConfirmBorrowed,
            }}
        >
            {children}
        </BatchDetailContext.Provider>
    );
};
export default BatchDetailContext;
