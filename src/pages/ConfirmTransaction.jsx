import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Tag, Descriptions, Spin, Alert, Divider, message, Button } from 'antd';
import { FiCheckCircle, FiXCircle, FiUser, FiCalendar, FiDollarSign } from 'react-icons/fi';
import { getTransactionById } from '../services/transactionService';
import { FormatDateTime } from '../utils/FormatDateTime';
import { formatCurrency } from '../utils/FormatCurrency';
import Loading from '../components/Loading';
import { upperCase } from 'lodash';
import useAuth from '../hooks/useAuth';

const { Title, Text } = Typography;

const ConfirmTransaction = () => {
    const { user } = useAuth();
    // Get query parameters using useSearchParams
    const [searchParams] = useSearchParams();
    const id = searchParams.get('id');
    const status = searchParams.get('status') || 'success';

    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [transaction, setTransaction] = useState(null);

    useEffect(() => {
        fetchTransaction();
    }, [id]);

    const fetchTransaction = async () => {
        setLoading(true);
        try {
            const response = await getTransactionById(id);
            setTransaction(response.data.data);
        } catch (err) {
            message.error('Failed to fetch transaction details. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        if (user.role == 'ADMIN')
            navigate('/admin/transactions'); // Admin route
        else navigate('/'); // Go back to previous page
    };

    if (loading) {
        return <Loading />;
    }

    if (!transaction) {
        return (
            <Alert
                message="Transaction not found"
                description="The requested transaction details could not be found."
                type="warning"
                showIcon
            />
        );
    }

    const statusColor = status === 'success' ? 'green' : 'red';
    const StatusIcon = status === 'success' ? FiCheckCircle : FiXCircle;

    return (
        <div className="mx-auto max-w-2xl p-4">
            <Card className="shadow-md">
                <div className="mb-6 flex items-center justify-between">
                    <Title level={3} className="m-0">
                        Transaction Details
                    </Title>
                    <Tag color={statusColor} className="px-3 py-1 text-base">
                        <StatusIcon className="mr-1 inline" size={18} />
                        <span className="align-middle">{status === 'success' ? 'Success' : 'Failed'}</span>
                    </Tag>
                </div>

                <Descriptions bordered column={1} className="mb-6">
                    <Descriptions.Item label="Transaction ID">{transaction.id}</Descriptions.Item>
                    <Descriptions.Item label="Type">{transaction.type.replace('_', ' ')}</Descriptions.Item>
                    <Descriptions.Item label="Amount">{formatCurrency(transaction.amount)}</Descriptions.Item>
                    <Descriptions.Item label="Note">{transaction.note}</Descriptions.Item>
                    <Descriptions.Item label="Payment Method">
                        {upperCase(transaction.payment_method)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Payment Status">
                        {upperCase(transaction.payment_status)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Payment At">{FormatDateTime(transaction.updated_at)}</Descriptions.Item>
                </Descriptions>

                <Divider />

                <div className="mb-4">
                    <div className="mb-2 flex items-center">
                        <FiUser className="mr-2 text-blue-600" size={18} />
                        <Text strong className="text-lg">
                            User Information
                        </Text>
                    </div>
                    <Card size="small" className="mt-2">
                        <Descriptions column={1} size="small">
                            <Descriptions.Item label="Name">{transaction.user.name}</Descriptions.Item>
                            <Descriptions.Item label="Email">{transaction.user.email}</Descriptions.Item>
                            <Descriptions.Item label="Phone">{transaction.user.phone}</Descriptions.Item>
                        </Descriptions>
                    </Card>
                </div>

                <div className="mt-6 flex justify-center">
                    <Button onClick={handleBack} size="middle">
                        Back
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default ConfirmTransaction;
