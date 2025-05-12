import React, { useState } from 'react';
import { Modal, Form, Input, Select, Button, message, Space, Typography, Divider } from 'antd';
import { returnBatch } from '../services/loanService';

const { Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const ReturnConfirmationModal = ({ visible, onClose, batchId, loanDetails }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            // Transform form data into the format required by the API
            const returnData = {
                loan_batch_id: batchId,
                returns: loanDetails.map((detail) => {
                    const bookId = detail.book_id;
                    return {
                        copy_id: detail.copy_id,
                        book_id: bookId,
                        note: values[`note_${bookId}`] || '',
                        returned_condition: values[`condition_${bookId}`] || 'good',
                    };
                }),
            };
            await returnBatch(returnData);
            message.success('Books successfully returned');
            onClose(true);
        } catch (error) {
            console.error('Error returning books:', error);
            message.error('Failed to process return: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            centered
            title="Confirm Book Returns"
            open={visible}
            onCancel={() => onClose(false)}
            styles={{
                body: {
                    maxHeight: 'calc(100vh - 150px)',
                    overflow: 'auto',
                },
            }}
            width={700}
            footer={[
                <Button key="cancel" onClick={() => onClose(false)}>
                    Cancel
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    loading={loading}
                    onClick={handleSubmit}
                    style={{ backgroundColor: '#1B326D' }}
                >
                    Confirm Return
                </Button>,
            ]}
        >
            <Form form={form} layout="vertical">
                <Text>Please provide return details for each book:</Text>
                <Divider />

                {loanDetails.map((detail, index) => {
                    const book = detail.book;
                    const bookId = detail.book_id;

                    return (
                        <div key={bookId} className="mb-6">
                            <div className="mb-2 flex items-start">
                                <div className="flex-1">
                                    <Text strong className="text-lg">
                                        {book ? book.title : `Book #${bookId}`}
                                    </Text>
                                    {book && <div className="text-xs text-gray-500">ISBN: {book.isbn || 'N/A'}</div>}
                                </div>
                            </div>

                            <Form.Item
                                name={`condition_${bookId}`}
                                label="Return Condition"
                                initialValue="good"
                                rules={[{ required: true, message: 'Please select the book condition' }]}
                            >
                                <Select>
                                    <Option value="good">Good</Option>
                                    <Option value="damaged">Damaged</Option>
                                    <Option value="lost">Lost</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item name={`note_${bookId}`} label="Notes">
                                <TextArea rows={2} placeholder="Any notes about this book's return?" />
                            </Form.Item>

                            {index < loanDetails.length - 1 && <Divider />}
                        </div>
                    );
                })}
            </Form>
        </Modal>
    );
};

export default ReturnConfirmationModal;
