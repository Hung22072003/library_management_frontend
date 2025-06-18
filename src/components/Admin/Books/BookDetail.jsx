import { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Button, Upload, message, Select } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { FaTimes } from 'react-icons/fa';
import { getAllCategories } from '../../../services/categoryService';
import { getBookById, updateBook, deleteBook, restoreBook } from '../../../services/bookService'; // Updated service functions
import { useNavigate, useParams } from 'react-router-dom';
import Loading from '../../Loading';
const { Option } = Select;

const BookDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // Lấy id từ URL (e.g., /admin/books/12)
    const [form] = Form.useForm();
    const [oldThumbnail, setOldThumbnail] = useState(null);
    const [thumbnail, setThumbnail] = useState(null); // Lưu file ảnh mới nếu có
    const [thumbnailPreview, setThumbnailPreview] = useState(null); // Lưu URL để hiển thị ảnh
    const [categories, setCategories] = useState([]); // Lưu danh sách categories từ API
    const [loading, setLoading] = useState(false); // Trạng thái loading
    const [bookData, setBookData] = useState(null); // Lưu dữ liệu sách từ API

    // Fetch book details by ID
    const fetchBookDetails = async () => {
        setLoading(true);
        try {
            const response = await getBookById(id);
            const book = response.data.data;
            setBookData(book);

            // Điền dữ liệu vào form
            form.setFieldsValue({
                title: book.title,
                description: book.description,
                publication_year: book.publication_year,
                isbn13: book.isbn13,
                isbn10: book.isbn10,
                language: book.language,
                num_pages: book.num_pages,
                available_copies: book.available_copies,
                total_copies: book.total_copies,
                categories: book.categories.map((cat) => cat.id),
                authors: book.authors,
            });
            setOldThumbnail(book.thumbnail);
            // Đặt ảnh xem trước nếu có thumbnail
            if (book.thumbnail) {
                setThumbnailPreview(book.thumbnail); // Giả sử thumbnail là URL
            }
        } catch (error) {
            message.error('Failed to fetch book!');
            console.error(error);
        } finally {
            setLoading(false);
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

    // Gọi API khi component mount
    useEffect(() => {
        fetchCategories();
        fetchBookDetails();
    }, [id]);

    // Xử lý khi người dùng chọn ảnh mới
    const handleThumbnailChange = (info) => {
        const file = info.file;
        if (file) {
            setThumbnail(file);
            const previewUrl = URL.createObjectURL(file);
            setThumbnailPreview(previewUrl);
        }
    };

    // Xử lý khi xóa ảnh
    const handleRemoveThumbnail = () => {
        setOldThumbnail(null);
        setThumbnail(null);
        setThumbnailPreview(null);
        if (thumbnailPreview) {
            URL.revokeObjectURL(thumbnailPreview);
        }
    };

    // Xử lý khi gửi form để cập nhật
    const onFinish = async (values) => {
        setLoading(true);
        console.log(values, thumbnail);
        try {
            const response = await updateBook(id, values, thumbnail, oldThumbnail);
            message.success('Update book successfully!');
            fetchBookDetails();
        } catch (error) {
            if (error?.data?.errors?.isbn) {
                message.error('ISBN already exists! Please try again!');
            } else if (error?.data?.errors?.thumbnail) {
                message.error('The thumbnail field must be a file of type: jpeg, png, jpg, gif.');
            } else {
                message.error('Update book failed! Please try again!');
            }
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filterOption = (input, option) => {
        return option.children.toLowerCase().includes(input.toLowerCase());
    };

    const handleDeleteBook = async () => {
        try {
            const response = await deleteBook(bookData.id);
            message.success('Delete book successfully!');
            fetchBookDetails();
        } catch (e) {
            message.error('Delete book failed! Please try again!');
        }
    };

    const handleActiveBook = async () => {
        try {
            const response = await restoreBook(bookData.id);
            message.success('Active book successfully!');
            fetchBookDetails();
        } catch (e) {
            message.error('Active book failed! Please try again!');
        }
    };

    if (loading) return <Loading />;

    return (
        <div className="">
            <h2 className="mb-[24px] text-center text-[24px] font-bold text-[#1B326D]">Book Details</h2>
            <Form form={form} layout="vertical" onFinish={onFinish} style={{ color: '#000' }}>
                <Form.Item label="Title" name="title" rules={[{ required: true, message: 'Title is required' }]}>
                    <Input placeholder="Enter title ..." />
                </Form.Item>

                <div className="grid grid-cols-5 gap-[24px]">
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

                    <Form.Item label="Total Copies" name="total_copies">
                        <InputNumber
                            disabled
                            min={1}
                            controls={false}
                            placeholder="Enter total copies"
                            className="w-full"
                        />
                    </Form.Item>
                    <Form.Item label="Available Copies" name="available_copies">
                        <InputNumber
                            disabled
                            min={1}
                            controls={false}
                            placeholder="Enter Available Copies"
                            className="w-full"
                        />
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
                            <img src={thumbnailPreview} alt="Thumbnail" className="h-auto w-32 rounded object-cover" />
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
                    <div className="flex justify-between">
                        <div className="flex gap-4">
                            <Button
                                type="primary"
                                htmlType="submit"
                                style={{
                                    color: '#fff',
                                    backgroundColor: '#1B326D',
                                    width: '200px',
                                    height: '42px',
                                }}
                            >
                                Save Changes
                            </Button>
                            <Button
                                onClick={() => navigate('/admin/books')}
                                style={{
                                    width: '200px',
                                    height: '42px',
                                }}
                            >
                                Back to Books List
                            </Button>
                        </div>

                        {bookData &&
                            (bookData.deleted_at ? (
                                <Button
                                    type="primary"
                                    onClick={handleActiveBook}
                                    style={{
                                        color: '#fff',
                                        backgroundColor: '#24c24d',
                                        width: '200px',
                                        height: '42px',
                                    }}
                                >
                                    Active
                                </Button>
                            ) : (
                                <Button
                                    type="primary"
                                    onClick={handleDeleteBook}
                                    style={{
                                        color: '#fff',
                                        backgroundColor: '#f43535',
                                        width: '200px',
                                        height: '42px',
                                    }}
                                >
                                    InActive
                                </Button>
                            ))}
                    </div>
                </Form.Item>
            </Form>
        </div>
    );
};

export default BookDetail;
