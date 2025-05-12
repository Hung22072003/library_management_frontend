import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Button, Upload, message, Select } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { FaTimes } from 'react-icons/fa';
import axios from 'axios';
import { getAllCategories } from '../../../services/categoryService';
import { getAllAuthors } from '../../../services/authorService';
import { createBook } from '../../../services/bookService';
import { useNavigate } from 'react-router-dom';
import Loading from '../../Loading';
const { Option } = Select;

const CreateBook = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [thumbnail, setThumbnail] = useState(null); // Lưu file ảnh
    const [thumbnailPreview, setThumbnailPreview] = useState(null); // Lưu URL để hiển thị ảnh
    const [authors, setAuthors] = useState([]); // Lưu danh sách authors từ API
    const [categories, setCategories] = useState([]); // Lưu danh sách categories từ API
    const [loading, setLoading] = useState(false); // Trạng thái loading
    const fetchAuthors = async () => {
        try {
            const response = await getAllAuthors();
            setAuthors(response.data.data); // Giả sử API trả về mảng authors
        } catch (error) {
            message.error('Failed to fetch authors!');
            console.error(error);
        }
    };

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
        fetchAuthors();
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
            console.log(response.data);
            message.success('Create book successfully!');
            form.resetFields();
            setThumbnail(null);
            setThumbnailPreview(null);
            navigate('/admin/books'); // Điều hướng về trang danh sách sách sau khi tạo thành công
        } catch (error) {
            if (error.data.errors.isbn) {
                message.error('ISBN already exists! Please try again!');
            } else if (error.data.errors.thumbnail) {
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
                <div className="grid grid-cols-5 gap-[24px]">
                    <Form.Item label="Title" name="title" rules={[{ required: true, message: 'Title is required' }]}>
                        <Input placeholder="Enter title ..." />
                    </Form.Item>

                    <Form.Item label="ISBN" name="isbn" rules={[{ required: true, message: 'ISBN is required' }]}>
                        <Input placeholder="Enter ISBN" />
                    </Form.Item>
                    <Form.Item
                        label="Publication Year"
                        name="publication_year"
                        rules={[{ required: true, message: 'Publication year is required' }]}
                    >
                        <InputNumber
                            controls={false}
                            max={new Date().getFullYear()}
                            placeholder="Enter publication year"
                            style={{
                                width: '150px',
                            }}
                        />
                    </Form.Item>

                    {/* <Form.Item
                        label="Rental Fee"
                        name="rental_fee"
                        rules={[{ required: true, message: 'Rental Fee is required' }]}
                    >
                        <InputNumber
                            min={0}
                            style={{
                                width: '150px',
                            }}
                            controls={false}
                            placeholder="Enter rental fee"
                            className="w-full"
                        />
                    </Form.Item> */}

                    <Form.Item
                        label="Total Copies"
                        name="total_copies"
                        rules={[{ required: true, message: 'Total Copies is required' }]}
                    >
                        <InputNumber min={1} controls={false} placeholder="Enter total copies" className="w-full" />
                    </Form.Item>
                </div>
                <div className="grid grid-cols-2 gap-[24px]">
                    <Form.Item
                        label="Categories"
                        name="categories"
                        rules={[{ required: true, message: 'Select at least one category' }]}
                    >
                        <Select
                            mode="multiple"
                            placeholder="Select at least one category"
                            allowClear
                            showSearch // Bật tính năng tìm kiếm
                            filterOption={filterOption}
                            dropdownStyle={{ maxHeight: '100px' }}
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
                        rules={[{ required: true, message: 'Select at least one author' }]}
                    >
                        <Select
                            mode="multiple"
                            placeholder="Select at least one author"
                            allowClear
                            showSearch // Bật tính năng tìm kiếm
                            filterOption={filterOption}
                            dropdownStyle={{ maxHeight: '100px' }}
                        >
                            {authors.map((author) => (
                                <Select.Option key={author.id} value={author.id}>
                                    {author.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                </div>
                <Form.Item
                    label="Description"
                    name="description"
                    rules={[{ required: true, message: 'Description is require' }]}
                >
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
