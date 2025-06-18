import React, { useState } from 'react';
import { Modal, Form, Select, Input, Button, message, Row, Col, Typography, Divider } from 'antd';
import { returnBatch, returnOneBook } from '../services/loanService';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

const SingleReturnModal = ({ visible, onClose, batchId, loanDetail }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleReturn = async (values) => {
        setLoading(true);
        try {
            // Prepare the data for single item return
            const returnData = {
                detail_id: loanDetail.id,
                returned_condition: values.condition,
                note: values.note || '',
            };

            console.log('Return Data:', returnData);
            await returnOneBook(returnData);
            message.success('Book returned successfully');
            form.resetFields();
            onClose(true); // Pass true to indicate refresh is needed
        } catch (error) {
            console.error('Error returning book:', error);
            message.error('Failed to return book');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onClose(false);
    };

    return (
        <Modal title="Return Book" open={visible} onCancel={handleCancel} footer={null} width={600} destroyOnClose>
            {loanDetail && (
                <>
                    <div className="mb-4">
                        <Title level={5}>Book Information</Title>
                        <Row gutter={[16, 16]}>
                            <Col span={12}>
                                <Text strong>Title: </Text>
                                <Text>{loanDetail.book?.title || `Book #${loanDetail.book_id}`}</Text>
                            </Col>
                            <Col span={12}>
                                <Text strong>Copy ID: </Text>
                                <Text>{loanDetail.copy_id}</Text>
                            </Col>
                            <Col span={12}>
                                <Text strong>ISBN: </Text>
                                <Text>{loanDetail.book?.isbn13 || loanDetail.book?.isbn10}</Text>
                            </Col>
                            <Col span={12}>
                                <Text strong>Current Status: </Text>
                                <span className="rounded-md bg-yellow-200 px-2 py-1 text-xs font-medium text-yellow-800 capitalize">
                                    {loanDetail.borrowed_status?.toUpperCase()}
                                </span>
                            </Col>
                        </Row>
                    </div>

                    <Divider />

                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleReturn}
                        initialValues={{
                            condition: 'good',
                        }}
                    >
                        <Form.Item
                            label="Return Condition"
                            name="condition"
                            rules={[{ required: true, message: 'Please select return condition' }]}
                        >
                            <Select placeholder="Select condition">
                                <Option value="good">Good</Option>
                                <Option value="damaged">Damaged</Option>
                                <Option value="lost">Lost</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item label="Note (Optional)" name="note">
                            <TextArea rows={3} placeholder="Add any notes about the return condition..." />
                        </Form.Item>

                        <div className="flex justify-end gap-2">
                            <Button onClick={handleCancel}>Cancel</Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                style={{ backgroundColor: '#1B326D' }}
                            >
                                Confirm Return
                            </Button>
                        </div>
                    </Form>
                </>
            )}
        </Modal>
    );
};

export default SingleReturnModal;
