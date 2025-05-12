import React, { useState, useEffect } from 'react';
import { Table, Alert, Button } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import Loading from '../../components/Loading';
import { FormatDateTime } from '../../utils/FormatDateTime';
import { getConditionsOfBookCopy } from '../../services/bookCopyService';
import { ArrowLeftOutlined } from '@ant-design/icons';

const BookCopyDetail = () => {
    const navigate = useNavigate();
    const [conditions, setConditions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { id } = useParams();

    useEffect(() => {
        const fetchConditions = async () => {
            try {
                setLoading(true);
                const response = await getConditionsOfBookCopy(id);

                setConditions(response.data.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchConditions();
        }
    }, [id]);

    const columns = [
        {
            title: 'Copy ID',
            dataIndex: 'id',
            key: 'id',
            ellipsis: true,
            width: 300,
        },
        {
            title: 'User ID',
            dataIndex: 'user_id',
            key: 'user_id',
            ellipsis: true,
            width: 150,
        },
        {
            title: 'Condition',
            dataIndex: 'condition_note',
            key: 'condition_note',
            ellipsis: true,
        },
        {
            title: 'Created At',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date) => FormatDateTime(date),
        },
        {
            title: 'Batch ID',
            dataIndex: 'batch_id',
            key: 'batch_id',
            ellipsis: true,
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
                <h2 className="text-[24px] font-bold text-[#1B326D]">Book Copy Conditions</h2>
                <Button icon={<ArrowLeftOutlined />} type="default" onClick={() => window.history.go(-1)}>
                    Back
                </Button>
            </div>
            <Table
                columns={columns}
                dataSource={conditions.map((condition) => ({ ...condition, key: condition.id }))}
                bordered
                pagination={false}
            />
        </div>
    );
};

export default BookCopyDetail;
