import React, { useEffect, useMemo, useState } from 'react';
import {
    Card,
    Descriptions,
    Table,
    Button,
    Popconfirm,
    Empty,
    Divider,
    Space,
    Modal,
    DatePicker,
    message,
    Input,
    InputNumber,
} from 'antd';
import dayjs from 'dayjs';
import { CloseCircleOutlined, ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons';
import { Link, useParams } from 'react-router-dom';
import useBatchDetail from '../../hooks/useBatchDetail';
import Loading from '../../components/Loading';
import { formatDate } from '../../utils/FormatDateTime';
import { formatCurrency } from '../../utils/FormatCurrency';
import ReturnConfirmationModal from '../../components/ReturnConfirmationModal';
import { extendBatch } from '../../services/loanService';
import { createTransaction, getTransactionsOfLoanBatch } from '../../services/transactionService';

// Status tag colors mapping
const statusColors = {
    pending: 'bg-blue-200 text-blue-800',
    borrowed: 'bg-yellow-200 text-yellow-800',
    returned: 'bg-green-200 text-green-800',
    overdue: 'bg-red-200 text-red-800',
    'returned (late)': 'bg-orange-200 text-orange-800',
    cancel: 'bg-rose-200 text-rose-800',
};

const LoanBatchDetail = () => {
    const { id } = useParams();
    const { batchDetail, loading, loadBatchDetail, transactions, handleCancelBatch, handleConfirmBorrowed } =
        useBatchDetail();
    const [returnModalVisible, setReturnModalVisible] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [feeData, setFeeData] = useState({});
    const [createFeeModalVisible, setCreateFeeModalVisible] = useState(false);
    const [currentCopyId, setCurrentCopyId] = useState(null);
    const [currentCondition, setCurrentCondition] = useState(null);
    const [feeAmount, setFeeAmount] = useState(0);
    const [feeNote, setFeeNote] = useState('');

    useEffect(() => {
        loadBatchDetail(id);
    }, [id]);

    useEffect(() => {
        const feeMap = {};
        transactions.forEach((transaction) => {
            feeMap[transaction.copy_id] = transaction;
        });
        setFeeData(feeMap);
    }, [transactions]);

    const totalFee = useMemo(() => {
        return transactions.reduce((total, transaction) => {
            return total + parseInt(transaction.amount);
        }, 0);
    }, [transactions]);

    const handleConfirmReturned = () => {
        setReturnModalVisible(true);
    };

    const handleReturnModalClose = (shouldRefresh) => {
        setReturnModalVisible(false);
        if (shouldRefresh) {
            loadBatchDetail(id);
        }
    };

    const handleExtendBatch = async () => {
        if (!selectedDate) {
            message.error('Please select a date');
            return;
        }

        const selected = dayjs(selectedDate);
        const dueDate = dayjs(batchDetail.due_at);
        const maxExtendDate = dueDate.add(5, 'day');

        if (selected.isAfter(maxExtendDate)) {
            message.error('You can only extend up to 5 days after the due date');
            return;
        }

        try {
            await extendBatch(batchDetail.id, selected.format('YYYY-MM-DD'));
            message.success('Batch extended successfully');
            setIsModalOpen(false);
            setSelectedDate(null);
            loadBatchDetail(batchDetail.id);
        } catch (err) {
            message.error('Error while extending batch');
            console.error(err);
        }
    };

    const showCreateFeeModal = (copyId, condition) => {
        setCurrentCopyId(copyId);
        setCurrentCondition(condition);
        setFeeAmount(0);
        setFeeNote('');
        setCreateFeeModalVisible(true);
    };

    const getType = (condition) => {
        switch (condition) {
            case 'damaged':
                return 'damaged_fee';
            case 'lost':
                return 'lost_fee';
            default:
                return 'other';
        }
    };
    const handleCreateFee = async () => {
        if (!feeAmount || feeAmount <= 0) {
            message.error('Please enter a valid fee amount');
            return;
        }
        try {
            await createTransaction({
                type: getType(currentCondition),
                amount: feeAmount,
                note: feeNote,
                copy_id: currentCopyId,
                batch_id: batchDetail.id,
                user_id: batchDetail.user_id,
            });

            message.success('Fee created successfully');
            setCreateFeeModalVisible(false);
            loadBatchDetail(batchDetail.id);
        } catch (err) {
            console.error('Error creating fee:', err);
            message.error('Failed to create fee');
        }
    };

    const canCancelConfirom = batchDetail && ['pending'].includes(batchDetail.status);
    const canExtend = batchDetail && !batchDetail.extended_at && ['borrowed'].includes(batchDetail.status);

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 200,
        },
        {
            title: 'Book',
            key: 'book',
            width: 200,
            render: (_, record) => {
                const book = record.book;
                return (
                    <div>
                        <div className="font-medium">{book ? book.title : `Book #${record.book_id}`}</div>
                        {book && <div className="text-xs text-gray-500">ISBN: {book.isbn || 'N/A'}</div>}
                    </div>
                );
            },
        },
        {
            title: 'Copy ID',
            dataIndex: 'copy_id',
            key: 'copy_id',
            width: 150,
            render: (text) => (
                <span
                    onClick={() => {
                        window.location.href = `/admin/copies/${text}`;
                    }}
                    className="cursor-pointer hover:font-bold"
                >
                    {text}
                </span>
            ),
        },
        {
            title: 'Condition',
            dataIndex: 'returned_condition',
            key: 'returned_condition',
            width: 60,
            render: (text) => text || 'N/A',
        },
        {
            title: 'Note',
            dataIndex: 'note',
            key: 'note',
            render: (text) => text || 'N/A',
        },
        {
            title: 'Fee',
            key: 'fee',
            width: 200,
            render: (_, record) => {
                const copyFee = feeData[record.copy_id];
                if (copyFee) {
                    return <div className="font-medium">{formatCurrency(copyFee.amount)}</div>;
                }

                if (record.returned_condition === 'good' || !record.returned_condition) {
                    return <div className="font-medium">{formatCurrency(0)}</div>;
                }
            },
        },
    ];

    if (loading) {
        return <Loading />;
    }

    if (!batchDetail) {
        return (
            <Card className="rounded-lg shadow">
                <Empty description="No batch details found" />
            </Card>
        );
    }

    // Calculate total rental fee
    const totalRentalFee = batchDetail.loan_details.reduce((sum, item) => sum + parseInt(item.rental_fee || 0, 10), 0);

    return (
        <Card className="rounded-lg shadow">
            <div className="mb-6 flex items-center justify-between">
                <Space>
                    <Button icon={<ArrowLeftOutlined />} type="default" onClick={() => window.history.back()}>
                        Back
                    </Button>

                    <h1 className="ml-[12px] text-[20px] font-bold text-[#1B326D]"> Batch Details</h1>
                </Space>

                <div>
                    {canCancelConfirom && (
                        <div>
                            <Popconfirm
                                title="Cancel this batch?"
                                description="Are you sure you want to cancel this batch? This action cannot be undone."
                                onConfirm={() => handleCancelBatch(batchDetail.id)}
                                okText="Yes"
                                cancelText="No"
                            >
                                <Button danger type="primary" icon={<CloseCircleOutlined />}>
                                    Cancel Batch
                                </Button>
                            </Popconfirm>
                        </div>
                    )}

                    {canExtend && (
                        <Button type="primary" className="ml-[12px]" onClick={() => setIsModalOpen(true)}>
                            Extend batch
                        </Button>
                    )}
                </div>
            </div>

            <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
                <Descriptions.Item label="Batch ID">{batchDetail.id}</Descriptions.Item>
                <Descriptions.Item label="Status">
                    <span
                        className={`rounded-md px-2 py-1 text-xs font-medium capitalize ${statusColors[batchDetail.status]}`}
                    >
                        {batchDetail.status.toUpperCase()}
                    </span>
                </Descriptions.Item>
                <Descriptions.Item label="Borrowed Date">{formatDate(batchDetail.borrowed_at)}</Descriptions.Item>
                <Descriptions.Item label="Due Date">{formatDate(batchDetail.due_at)}</Descriptions.Item>
                <Descriptions.Item label="Return Date">{formatDate(batchDetail.return_at)}</Descriptions.Item>
                <Descriptions.Item label="Expired Date">{formatDate(batchDetail.expired_at)}</Descriptions.Item>
                <Descriptions.Item label="Extended Date">
                    {formatDate(batchDetail.extended_at) || 'Not Extended'}
                </Descriptions.Item>
                <Descriptions.Item label="Total Fee">{formatCurrency(totalFee)}</Descriptions.Item>
            </Descriptions>

            <Divider orientation="left" style={{ color: '#1B326D' }}>
                Details
            </Divider>

            <Table dataSource={batchDetail.loan_details} columns={columns} rowKey="id" pagination={false} bordered />
            {batchDetail && (
                <ReturnConfirmationModal
                    visible={returnModalVisible}
                    onClose={handleReturnModalClose}
                    batchId={batchDetail.id}
                    loanDetails={batchDetail.loan_details}
                />
            )}

            <Modal
                title="Extend Loan Batch"
                open={isModalOpen}
                onOk={handleExtendBatch}
                onCancel={() => setIsModalOpen(false)}
                okText="Extend"
                cancelText="Cancel"
            >
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Select new due date (max +5 days from original):</label>
                    <DatePicker
                        className="w-full"
                        disabledDate={(current) => {
                            const dueDate = dayjs(batchDetail.due_at);
                            return current <= dueDate || current > dueDate.add(5, 'day');
                        }}
                        onChange={(date) => setSelectedDate(date)}
                    />
                </div>
            </Modal>

            <Modal
                title="Create Fee"
                open={createFeeModalVisible}
                onOk={handleCreateFee}
                onCancel={() => setCreateFeeModalVisible(false)}
                okText="Create"
                cancelText="Cancel"
            >
                <div className="flex flex-col gap-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium">Fee Amount:</label>
                        <InputNumber
                            className="w-full"
                            min={0}
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                            onChange={(value) => setFeeAmount(value)}
                            placeholder="Enter fee amount"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium">Note:</label>
                        <Input.TextArea
                            rows={3}
                            onChange={(e) => setFeeNote(e.target.value)}
                            placeholder="Add a note about the fee (e.g., reason for damage)"
                        />
                    </div>
                </div>
            </Modal>
        </Card>
    );
};

export default LoanBatchDetail;
