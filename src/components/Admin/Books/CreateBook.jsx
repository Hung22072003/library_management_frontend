import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Button, Upload, message, Select } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { FaTimes } from 'react-icons/fa';
import { getAllCategories } from '../../../services/categoryService';
import { createBook } from '../../../services/bookService';
import { useNavigate } from 'react-router-dom';
import Loading from '../../Loading';

const CreateBook = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [thumbnail, setThumbnail] = useState(null); // Lưu file ảnh
    const [thumbnailPreview, setThumbnailPreview] = useState(null); // Lưu URL để hiển thị ảnh
    const [categories, setCategories] = useState([]); // Lưu danh sách categories từ API
    const [loading, setLoading] = useState(false); // Trạng thái loading

    const fetchCategories = async () => {
        try {
            const response = await getAllCategories();
            setCategories(response.data.data); // Giả sử API trả về mảng categories
        } catch (error) {
            message.error('Failed to fetch categories!');
            console.error(error);
        }
    };
    // Lấy danh sách authors và categories khi component mount
    useEffect(() => {
        fetchCategories();
    }, []);

    // Xử lý khi người dùng chọn ảnh
    const handleThumbnailChange = (info) => {
        console.log(info);
        const file = info.file;
        if (file) {
            setThumbnail(file);
            const previewUrl = URL.createObjectURL(file);
            setThumbnailPreview(previewUrl);
        }
    };
    // Xử lý khi xóa ảnh
    const handleRemoveThumbnail = () => {
        setThumbnail(null);
        setThumbnailPreview(null);
        // Thu hồi URL để tránh rò rỉ bộ nhớ
        if (thumbnailPreview) {
            URL.revokeObjectURL(thumbnailPreview);
        }
    };

    // Xử lý khi gửi form
    const onFinish = async (values) => {
        setLoading(true);
        try {
            const response = await createBook(values, thumbnail);
            message.success('Create book successfully!');
            form.resetFields();
            setThumbnail(null);
            setThumbnailPreview(null);
            navigate('/admin/books');
        } catch (error) {
            if (error?.data?.errors?.isbn13) {
                message.error('ISBN13 already exists! Please try again!');
            } else if (error?.data?.errors?.thumbnail) {
                message.error('The thumbnail field must be a file of type: jpeg, png, jpg, gif.');
            } else {
                message.error('Create book failed! Please try again!');
            }
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    const filterOption = (input, option) => {
        return option.children.toLowerCase().includes(input.toLowerCase());
    };
    if (loading) <Loading />;
    return (
        <div className="">
            <h2 className="mb-[24px] text-center text-[24px] font-bold text-[#1B326D]">New Book</h2>
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{
                    available_copies: 1,
                    total_copies: 1,
                }}
                style={{
                    color: '#1B326D',
                }}
            >
                <Form.Item label="Title" name="title" rules={[{ required: true, message: 'Title is required' }]}>
                    <Input placeholder="Enter title ..." />
                </Form.Item>

                <div className="grid grid-cols-4 gap-[24px]">
                    <Form.Item label="ISBN13" name="isbn13">
                        <Input placeholder="Enter ISBN13" />
                    </Form.Item>
                    <Form.Item label="ISBN10" name="isbn10">
                        <Input placeholder="Enter ISBN10" />
                    </Form.Item>
                    <Form.Item label="Publication Year" name="publication_year">
                        <InputNumber
                            controls={false}
                            max={new Date().getFullYear()}
                            placeholder="Enter publication year"
                            style={{
                                width: '200px',
                            }}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Total Copies"
                        name="total_copies"
                        rules={[{ required: true, message: 'Total Copies is required' }]}
                    >
                        <InputNumber min={1} controls={false} placeholder="Enter total copies" className="w-full" />
                    </Form.Item>
                </div>

                <div className="grid grid-cols-[30%_30%_15%_15%] gap-[24px]">
                    <Form.Item
                        label="Categories"
                        name="categories"
                        rules={[{ required: true, message: 'Select at least one category' }]}
                    >
                        <Select
                            mode="multiple"
                            placeholder="Select at least one category"
                            allowClear
                            showSearch
                            filterOption={filterOption}
                        >
                            {categories.map((category) => (
                                <Select.Option key={category.id} value={category.id}>
                                    {category.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Authors"
                        name="authors"
                        rules={[{ required: true, message: 'Authors is required' }]}
                    >
                        <Input placeholder="Enter Authors (Using ', ' to seperate multiple authors)" />
                    </Form.Item>

                    <Form.Item label="Number of pages" name="num_pages">
                        <InputNumber min={1} controls={false} placeholder="Enter number of pages" className="w-full" />
                    </Form.Item>

                    <Form.Item label="Language" name="language">
                        <Input placeholder="Enter Language" />
                    </Form.Item>
                </div>
                <Form.Item label="Description" name="description">
                    <Input.TextArea rows={8} placeholder="Enter description" />
                </Form.Item>

                <Form.Item label="Thumbnail">
                    <Upload
                        beforeUpload={() => false} // Ngăn upload tự động
                        onChange={handleThumbnailChange}
                        accept="image/*"
                        showUploadList={false}
                    >
                        <Button icon={<UploadOutlined />}>Select thumbnail</Button>
                    </Upload>
                    {thumbnailPreview && (
                        <div className="relative mt-[24px] w-fit">
                            <img src={thumbnailPreview} alt="Uploaded" className="h-auto w-32 rounded object-cover" />
                            <button
                                type="button"
                                onClick={handleRemoveThumbnail}
                                className="absolute top-0 right-0 cursor-pointer rounded-full bg-red-500 p-1 text-white"
                            >
                                <FaTimes size={12} />
                            </button>
                        </div>
                    )}
                </Form.Item>

                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        style={{
                            color: '#fff',
                            backgroundColor: '#1B326D',
                            width: '100%',
                            height: '42px',
                        }}
                    >
                        CREATE NEW BOOK
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default CreateBook;
