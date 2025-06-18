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
import { CloseCircleOutlined, ArrowLeftOutlined, PlusOutlined, CheckOutlined } from '@ant-design/icons';
import { Link, useParams } from 'react-router-dom';
import useBatchDetail from '../../hooks/useBatchDetail';
import Loading from '../../components/Loading';
import { formatDate } from '../../utils/FormatDateTime';
import { formatCurrency } from '../../utils/FormatCurrency';
import ReturnConfirmationModal from '../../components/ReturnConfirmationModal';
import { cancelBook, extendBatch, returnBatch } from '../../services/loanService';
import { createTransaction, getTransactionsOfLoanBatch } from '../../services/transactionService';
import SingleReturnModal from '../../components/SingleReturnModal';

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
    const {
        batchDetail,
        loading,
        setLoading,
        loadBatchDetail,
        transactions,
        handleCancelBatch,
        handleConfirmBorrowed,
    } = useBatchDetail();
    const [returnModalVisible, setReturnModalVisible] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [feeData, setFeeData] = useState({});
    const [createFeeModalVisible, setCreateFeeModalVisible] = useState(false);
    const [currentCopyId, setCurrentCopyId] = useState(null);
    const [currentCondition, setCurrentCondition] = useState(null);
    const [feeAmount, setFeeAmount] = useState(0);
    const [feeNote, setFeeNote] = useState('');
    const [singleReturnModalVisible, setSingleReturnModalVisible] = useState(false);
    const [selectedDetail, setSelectedDetail] = useState(null);
    const [loanDetails, setLoanDetails] = useState([]);

    const handleSingleReturn = (detail) => {
        setSelectedDetail(detail);
        setSingleReturnModalVisible(true);
    };

    const handleCancelBook = async (detail) => {
        try {
            await cancelBook(detail.id);
            message.success('Cancel book successfully');
            loadBatchDetail(detail.batch_id);
        } catch (error) {
            console.error('Error returning batch:', error);
            message.error('Failed to cancel batch');
        }
    };

    const handleSingleReturnModalClose = (shouldRefresh) => {
        setSingleReturnModalVisible(false);
        setSelectedDetail(null);
        if (shouldRefresh) {
            loadBatchDetail(id);
        }
    };
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

    const handleConfirmReturned = async () => {
        const borrowedDetails = batchDetail.loan_details.filter(
            (detail) => detail.borrowed_status === 'borrowed' || detail.borrowed_status === 'overdue',
        );

        console.log('Borrowed details:', borrowedDetails);
        if (borrowedDetails.length === 0) {
            setLoading(true);
            try {
                await returnBatch({ loan_batch_id: batchDetail.id });
                message.success('Batch returned successfully');
                loadBatchDetail(batchDetail.id);
            } catch (error) {
                console.error('Error returning batch:', error);
                message.error('Failed to return batch');
            } finally {
                setLoading(false);
            }
        } else {
            setLoanDetails(borrowedDetails);
            setReturnModalVisible(true);
        }
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
    const canReturned = batchDetail && ['borrowed', 'overdue'].includes(batchDetail.status);
    const canExtend = batchDetail && !batchDetail.extended_at && ['borrowed'].includes(batchDetail.status);

    const columns = [
        // {
        //     title: 'ID',
        //     dataIndex: 'id',
        //     key: 'id',
        //     width: 200,
        // },
        {
            title: 'Book',
            key: 'book',
            width: 200,
            render: (_, record) => {
                const book = record.book;
                return (
                    <div>
                        <div className="font-medium">{book ? book.title : `Book #${record.book_id}`}</div>
                        {book && <div className="text-xs text-gray-500">ISBN: {book.isbn13 || book.isbn10}</div>}
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
            title: 'Status',
            dataIndex: 'borrowed_status',
            key: 'borrowed_status',
            width: 200,
            render: (text) => (
                <span className={`rounded-md px-2 py-1 text-xs font-medium capitalize ${statusColors[text]}`}>
                    {text.toUpperCase()}
                </span>
            ),
        },
        {
            title: 'Return Date',
            dataIndex: 'return_at',
            key: 'return_at',
            width: 150,
            render: (text) => formatDate(text) || 'N/A',
        },
        {
            title: 'Extended Date',
            dataIndex: 'extended_at',
            key: 'extended_at',
            width: 150,
            render: (text) => formatDate(text) || 'N/A',
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
            width: 200,
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
                return (
                    <Button
                        size="middle"
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => showCreateFeeModal(record.copy_id, record.returned_condition)}
                        style={{ backgroundColor: '#1B326D' }}
                    >
                        Create Fee
                    </Button>
                );
            },
        },
        {
            title: 'Action',
            key: 'action',
            width: 150,
            render: (_, record) => {
                if (record.borrowed_status === 'borrowed' || record.borrowed_status === 'overdue') {
                    return (
                        <Button
                            type="primary"
                            size="small"
                            icon={<CheckOutlined />}
                            onClick={() => handleSingleReturn(record)}
                            style={{ backgroundColor: '#1B326D' }}
                        >
                            Return
                        </Button>
                    );
                } else if (record.borrowed_status === 'pending') {
                    return (
                        <Popconfirm
                            title="Cancel this book?"
                            description="Are you sure you want to cancel this book? This action cannot be undone."
                            onConfirm={() => handleCancelBook(record)}
                            okText="Yes"
                            cancelText="No"
                        >
                            <Button type="primary" size="small" danger icon={<CloseCircleOutlined />}>
                                Cance Book
                            </Button>
                        </Popconfirm>
                    );
                }
                return null;
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
                            <Button
                                type="primary"
                                className="ml-[12px]"
                                onClick={() => handleConfirmBorrowed(batchDetail.id)}
                            >
                                Confirm Borrowed
                            </Button>
                        </div>
                    )}

                    {canReturned && (
                        <Button color="green" variant="solid" onClick={() => handleConfirmReturned(batchDetail.id)}>
                            Confirm Returned
                        </Button>
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
                <Descriptions.Item label="User ID">{batchDetail.user_id}</Descriptions.Item>
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
                    loanDetails={loanDetails}
                />
            )}

            {/* Modal for returning single item */}
            {selectedDetail && (
                <SingleReturnModal
                    visible={singleReturnModalVisible}
                    onClose={handleSingleReturnModalClose}
                    batchId={batchDetail.id}
                    loanDetail={selectedDetail}
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
                        defaultValue={dayjs(batchDetail.due_at).add(1, 'day')}
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
