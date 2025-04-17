import React, { useEffect, useState } from 'react';
import { Card, Descriptions, Table, Button, Popconfirm, Empty, Divider, Space, Modal, DatePicker, message } from 'antd';
import dayjs from 'dayjs';
import { CloseCircleOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import useBatchDetail from '../../hooks/useBatchDetail';
import Loading from '../../components/Loading';
import { formatDate } from '../../utils/FormatDateTime';
import { formatCurrency } from '../../utils/FormatCurrency';
import ReturnConfirmationModal from '../../components/ReturnConfirmationModal';
import { extendBatch } from '../../services/loanService';

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
    const { batchDetail, loading, loadBatchDetail, handleCancelBatch, handleConfirmBorrowed } = useBatchDetail();
    const [returnModalVisible, setReturnModalVisible] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    useEffect(() => {
        loadBatchDetail(id);
    }, [id]);

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
    const canCancelConfirom = batchDetail && ['pending'].includes(batchDetail.status);
    const canReturned = batchDetail && ['borrowed', 'overdue'].includes(batchDetail.status);
    const canExtend = batchDetail && !batchDetail.extended_at && ['borrowed'].includes(batchDetail.status);

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 60,
        },
        {
            title: 'Book',
            key: 'book',
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
            title: 'Returned At',
            dataIndex: 'returned_at',
            key: 'returned_at',
            render: (text) => formatDate(text),
        },
        {
            title: 'Condition',
            dataIndex: 'returned_condition',
            key: 'returned_condition',
            render: (text) => text || 'N/A',
        },
        {
            title: 'Rental Fee',
            dataIndex: 'rental_fee',
            key: 'rental_fee',
            render: (fee) => formatCurrency(fee),
        },
        {
            title: 'Late Fee (Per Day)',
            dataIndex: 'late_fee_per_day',
            key: 'late_fee_per_day',
            render: (fee) => formatCurrency(fee),
        },
        {
            title: 'Note',
            dataIndex: 'note',
            key: 'note',
            render: (text) => text || 'N/A',
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

                    <h1 className="ml-[12px] text-[20px] font-bold text-[#1B326D]"> Batch Details #{batchDetail.id}</h1>
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
                <Descriptions.Item label="Total Rental Fee">{formatCurrency(totalRentalFee)}</Descriptions.Item>
            </Descriptions>

            <Divider orientation="left" style={{ color: '#1B326D' }}>
                Loan Details
            </Divider>

            <Table dataSource={batchDetail.loan_details} columns={columns} rowKey="id" pagination={false} />
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
        </Card>
    );
};

export default LoanBatchDetail;
