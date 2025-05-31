import React, { useState, useEffect, useCallback } from 'react';
import { formatCurrency } from '../../utils/FormatCurrency';
import { Input, message, Pagination, Select, Modal, Button, Radio } from 'antd';
import Loading from '../../components/Loading';
import { Link } from 'react-router-dom';
import { debounce, upperCase } from 'lodash';
import { getAllBatches } from '../../services/loanService';
import { formatDate } from '../../utils/FormatDateTime';
import { getAllTransactions, updateTransaction } from '../../services/transactionService';
import axios from 'axios';

const statusColors = {
    pending: 'bg-blue-200 text-blue-800',
    success: 'bg-green-200 text-green-800',
    failed: 'bg-red-200 text-red-800',
};

const PaymentMethodsEnum = {
    VNPAY: 'vnpay',
    MOMO: 'momo',
    BANK_TRANSFER: 'bank_transfer',
    CASH: 'cash',
};

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalTransactions, setTotalTransactions] = useState();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState(PaymentMethodsEnum.VNPAY);
    const [processingPayment, setProcessingPayment] = useState(false);
    const size = 6;

    useEffect(() => {
        debouncedFetchTransactions(searchTerm);
    }, [currentPage, searchTerm]);

    useEffect(() => {
        fetchTransactions();
    }, [currentPage]);

    const fetchTransactions = async (query = '') => {
        setLoading(true);
        try {
            const response = await getAllTransactions(currentPage, size, query);
            setTransactions(response.data.data.data);
            setTotalTransactions(response.data.data.total);
        } catch (e) {
            message.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const debouncedFetchTransactions = useCallback(
        debounce((query) => fetchTransactions(query), 300),
        [currentPage],
    );

    const showPaymentModal = (transaction) => {
        if (transaction.payment_status === 'pending' || transaction.payment_status === 'failed') {
            setSelectedTransaction(transaction);
            setIsModalVisible(true);
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setSelectedTransaction(null);
        setPaymentMethod(PaymentMethodsEnum.VNPAY);
    };

    const handlePaymentMethodChange = (e) => {
        setPaymentMethod(e.target.value);
    };

    const handlePayment = async () => {
        if (!selectedTransaction) return;

        setProcessingPayment(true);
        try {
            if (paymentMethod === PaymentMethodsEnum.VNPAY) {
                window.location.href = `http://localhost:8000/api/payment?amount=${selectedTransaction.amount}&id=${selectedTransaction.id}`;
            } else if (paymentMethod === PaymentMethodsEnum.MOMO) {
                message.info('Momo payment will be implemented soon');
            } else if (
                paymentMethod === PaymentMethodsEnum.BANK_TRANSFER ||
                paymentMethod === PaymentMethodsEnum.CASH
            ) {
                await updateTransaction(selectedTransaction.id, {
                    payment_status: 'success',
                    payment_method: paymentMethod,
                });
            }
        } catch (error) {
            message.error('Payment processing failed: ' + error.message);
        } finally {
            setProcessingPayment(false);
            handleCancel();
            fetchTransactions();
        }
    };

    const isPayable = (status) => {
        return status === 'pending' || status === 'failed';
    };

    return (
        <div className="mx-auto max-w-[1200px]">
            <div className="flex items-center">
                <label htmlFor="" className="mr-[12px] font-medium text-[#1B326D]">
                    User ID
                </label>
                <Input
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                    }}
                    style={{ height: '42px', width: '250px', color: '#1B326D', outline: 'none' }}
                />
            </div>
            <div className="flex items-center justify-between">
                <h1 className="my-[24px] text-[20px] font-bold text-[#1B326D]">Transactions</h1>
            </div>
            {loading ? (
                <Loading />
            ) : (
                <>
                    <div className="overflow-hidden overflow-x-auto">
                        <table className="min-w-full overflow-hidden rounded-lg bg-white shadow-lg">
                            <thead className="bg-gray-100 text-[16px] text-[#1B326D]">
                                <tr>
                                    <th className="min-w-[150px] px-4 py-3 text-left">User ID</th>
                                    <th className="min-w-[30px] px-4 py-3 text-left">Type</th>
                                    <th className="min-w-[150px] px-4 py-3 text-left">Amount</th>
                                    <th className="min-w-[150px] px-4 py-3 text-left">Note</th>
                                    <th className="min-w-[150px] px-4 py-3 text-left">Payment Status</th>
                                    <th className="min-w-[150px] px-4 py-3 text-left">Payment Method</th>
                                    <th className="min-w-[200px] px-4 py-3 text-left">Payment Expired At</th>
                                    <th className="min-w-[150px] px-4 py-3 text-left">Copy ID</th>
                                    <th className="min-w-[150px] px-4 py-3 text-left">Batch ID</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {transactions.map((transaction) => (
                                    <tr
                                        key={transaction.id}
                                        className={`text-[14px] text-[#1B326D] hover:bg-gray-50 ${isPayable(transaction.payment_status) ? 'cursor-pointer' : ''}`}
                                        onClick={() => showPaymentModal(transaction)}
                                    >
                                        <td className="px-4 py-3">{transaction.user_id}</td>
                                        <td className="px-4 py-3">{transaction.type}</td>
                                        <td className="px-4 py-3">{formatCurrency(transaction.amount)}</td>
                                        <td className="px-4 py-3">{transaction.note}</td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`rounded-md px-2 py-1 text-xs font-medium capitalize ${statusColors[transaction.payment_status]}`}
                                            >
                                                {transaction.payment_status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">{upperCase(transaction.payment_method) || 'N/A'}</td>
                                        <td className="px-4 py-3">{formatDate(transaction.payment_expired_at)}</td>
                                        <td className="px-4 py-3">{transaction.copy_id}</td>
                                        <td className="px-4 py-3">{transaction.batch_id}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {totalTransactions > size && (
                        <div className="mt-[24px]">
                            <Pagination
                                showSizeChanger={false}
                                current={currentPage}
                                onChange={handlePageChange}
                                total={totalTransactions}
                                pageSize={size}
                                align="center"
                                className="text-[#1B326D]"
                            />
                        </div>
                    )}

                    <Modal
                        centered
                        title="Payment Details"
                        open={isModalVisible}
                        onCancel={handleCancel}
                        footer={[
                            <Button key="back" onClick={handleCancel}>
                                Cancel
                            </Button>,
                            <Button
                                key="submit"
                                type="primary"
                                loading={processingPayment}
                                onClick={handlePayment}
                                style={{ backgroundColor: '#1B326D' }}
                            >
                                Proceed to Payment
                            </Button>,
                        ]}
                    >
                        {selectedTransaction && (
                            <div>
                                <p className="mb-4">
                                    <strong>Amount:</strong> {formatCurrency(selectedTransaction.amount)}
                                </p>
                                <p className="mb-4">
                                    <strong>Transaction ID:</strong> {selectedTransaction.id}
                                </p>

                                <div className="mb-4">
                                    <p className="mb-2">
                                        <strong>Select Payment Method:</strong>
                                    </p>
                                    <Radio.Group onChange={handlePaymentMethodChange} value={paymentMethod}>
                                        <Radio value={PaymentMethodsEnum.VNPAY} className="mb-2 block">
                                            <div className="flex items-center">
                                                <span className="mr-2">VNPay</span>
                                            </div>
                                        </Radio>
                                        <Radio value={PaymentMethodsEnum.MOMO} className="mb-2 block">
                                            <div className="flex items-center">
                                                <span className="mr-2">Momo</span>
                                            </div>
                                        </Radio>
                                        <Radio value={PaymentMethodsEnum.BANK_TRANSFER} className="block">
                                            <div className="flex items-center">
                                                <span className="mr-2">Bank Transfer</span>
                                            </div>
                                        </Radio>
                                        <Radio value={PaymentMethodsEnum.CASH} className="block">
                                            <div className="flex items-center">
                                                <span className="mr-2">Cash</span>
                                            </div>
                                        </Radio>
                                    </Radio.Group>
                                </div>
                            </div>
                        )}
                    </Modal>
                </>
            )}
        </div>
    );
};

export default Transactions;
