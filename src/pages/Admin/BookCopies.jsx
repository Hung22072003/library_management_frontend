import React, { useState, useEffect } from 'react';
import { Table, Alert, Button, Modal, InputNumber, message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { addBookCopies, getAllBookCopiesOfOneBook } from '../../services/bookService';
import Loading from '../../components/Loading';
import { FormatDateTime } from '../../utils/FormatDateTime';
import { ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons';

const BookCopies = () => {
    const navigate = useNavigate();
    const [bookCopies, setBookCopies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [numCopies, setNumCopies] = useState(1);
    const [addingCopies, setAddingCopies] = useState(false);
    const { id } = useParams();

    const fetchBookCopies = async () => {
        try {
            setLoading(true);
            const response = await getAllBookCopiesOfOneBook(id);
            setBookCopies(response.data.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (id) {
            fetchBookCopies();
        }
    }, [id]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'available':
                return 'bg-green-200 text-green-800';
            case 'borrowed':
                return 'bg-yellow-200 text-yellow-800';
            case 'unavailable':
                return 'bg-red-200 text-red-800';
            case 'in_cart':
                return 'bg-orange-200 text-orange-800';
            case 'new':
                return 'bg-green-200 text-green-800';
            case 'damaged':
                return 'bg-yellow-200 text-yellow-800';
            case 'lost':
                return 'bg-red-200 text-red-800';
        }
    };

    const handleAddCopies = async () => {
        try {
            setAddingCopies(true);
            const response = await addBookCopies(id, numCopies);
            message.success(`Successfully added ${numCopies} book copies!`);
            setIsModalVisible(false);
            setNumCopies(1);
            fetchBookCopies();
        } catch (err) {
            console.log(err);
            message.error('Error adding book copies: ' + err?.data?.message);
        } finally {
            setAddingCopies(false);
        }
    };

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setNumCopies(1);
    };

    const columns = [
        {
            title: 'Copy ID',
            dataIndex: 'id',
            key: 'id',
            ellipsis: true,
            width: 300,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <span className={`rounded-md px-2 py-1 text-xs font-medium capitalize ${getStatusColor(status)}`}>
                    {status}
                </span>
            ),
        },
        {
            title: 'Condition',
            dataIndex: 'condition',
            key: 'condition',
            render: (condition) => (
                <span className={`rounded-md px-2 py-1 text-xs font-medium capitalize ${getStatusColor(condition)}`}>
                    {condition}
                </span>
            ),
        },
        {
            title: 'Acquired At',
            dataIndex: 'acquired_at',
            key: 'acquired_at',
            render: (date) => FormatDateTime(date),
        },
    ];

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return <Alert message="Error" description={error} type="error" showIcon className="mb-4" />;
    }

    return (
        <div className="p-4">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-[24px] font-bold text-[#1B326D]">Book Copies</h2>
                <div className="flex gap-2">
                    <Button
                        icon={<PlusOutlined />}
                        type="primary"
                        style={{ backgroundColor: '#1B326D' }}
                        onClick={showModal}
                    >
                        Add Book Copies
                    </Button>
                    <Button
                        icon={<ArrowLeftOutlined />}
                        type="default"
                        onClick={() => {
                            navigate('/admin/books');
                        }}
                    >
                        Back
                    </Button>
                </div>
            </div>

            <Table
                columns={columns}
                dataSource={bookCopies.map((copy) => ({ ...copy, key: copy.id }))}
                bordered
                pagination={false}
                onRow={(record, rowIndex) => {
                    return {
                        onClick: (event) => {
                            navigate(`/admin/copies/${record.id}`);
                        },
                    };
                }}
                className="cursor-pointer"
            />

            <Modal
                title="Add Book Copies"
                open={isModalVisible}
                onOk={handleAddCopies}
                onCancel={handleCancel}
                confirmLoading={addingCopies}
                okText="Add Copies"
                cancelText="Cancel"
            >
                <div className="py-4">
                    <label className="mb-2 block text-sm font-medium text-gray-700">Number of copies to add:</label>
                    <InputNumber
                        min={1}
                        max={100}
                        value={numCopies}
                        onChange={(value) => setNumCopies(value)}
                        className="w-full"
                        placeholder="Enter number of copies"
                    />
                </div>
            </Modal>
        </div>
    );
};

export default BookCopies;
