import React from 'react';
import { Modal, DatePicker, Form, Button, Alert, ConfigProvider } from 'antd';
import useCart from '../hooks/useCart';
import { createStyles } from 'antd-style';
import dayjs from 'dayjs';

const useStyle = createStyles(({ prefixCls, css }) => ({
    primaryButton: css`
        &.${prefixCls}-btn-primary:not([disabled]):not(.${prefixCls}-btn-dangerous) {
            > span {
                position: relative;
            }

            &::before {
                content: '';
                background: #1b326d;
                position: absolute;
                inset: -1px;
                opacity: 1;
                transition: all 0.3s;
                border-radius: inherit;
            }

            &:hover::before {
                opacity: 0.8;
            }
        }
    `,
}));

const BorrowDateModal = () => {
    const { styles } = useStyle();

    const { showDateModal, closeBorrowModal, handleBorrow, borrowDates, updateBorrowDates, loading } = useCart();

    const [form] = Form.useForm();

    const handleOk = () => {
        console.log(borrowDates);
        form.validateFields()
            .then(() => {
                handleBorrow();
            })
            .catch((info) => {
                console.log('Validate Failed:', info);
            });
    };

    // Disallow dates before today
    const disablePastDates = (current) => {
        return current && current < new Date().setHours(0, 0, 0, 0);
    };

    // Disallow due dates before borrow date
    const disableBeforeBorrowDate = (current) => {
        if (!borrowDates.borrowDate) {
            return disablePastDates(current);
        }

        // Clone the borrow date to avoid mutation
        const borrowDate = borrowDates.borrowDate.clone();

        // Calculate max allowed date (borrow date + 30 days)
        const maxAllowedDate = borrowDate.clone().add(30, 'days');

        // Disable if current date is before borrow date or after max allowed date
        return current < borrowDate.startOf('day') || current > maxAllowedDate.endOf('day');
    };

    return (
        <Modal
            title="Select Borrow & Due Dates"
            open={showDateModal}
            onCancel={closeBorrowModal}
            footer={[
                <Button key="back" onClick={closeBorrowModal}>
                    Cancel
                </Button>,
                <ConfigProvider
                    button={{
                        className: styles.primaryButton,
                    }}
                >
                    <Button
                        key="submit"
                        type="primary"
                        loading={loading}
                        onClick={handleOk}
                        disabled={!borrowDates.borrowDate || !borrowDates.dueDate}
                    >
                        Confirm Borrow
                    </Button>
                </ConfigProvider>,
            ]}
        >
            <Form form={form} layout="vertical" className="mt-4">
                <Alert
                    message="Please select both the borrow date and due date for your books"
                    type="info"
                    showIcon
                    className="mb-4"
                />

                <Form.Item name="borrowDate" label="Borrow Date">
                    <DatePicker
                        defaultValue={borrowDates.borrowDate}
                        className="w-full"
                        disabledDate={disablePastDates}
                        value={borrowDates.borrowDate}
                        onChange={(date) => updateBorrowDates('borrowDate', date)}
                        placeholder="Select borrow date"
                    />
                </Form.Item>

                <Form.Item name="dueDate" label="Due Date">
                    <DatePicker
                        className="w-full"
                        disabledDate={disableBeforeBorrowDate}
                        value={borrowDates.dueDate}
                        onChange={(date) => updateBorrowDates('dueDate', date)}
                        placeholder="Select return date"
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default BorrowDateModal;
