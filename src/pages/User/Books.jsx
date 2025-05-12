import { Input, message, Modal, Pagination, Select } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { getAllBookCopiesOfOneBook, getAllBooks, getBookById, getBooksByCategory } from '../../services/bookService';
import { getAllCategories } from '../../services/categoryService';
import { faSearch, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { formatCurrency } from '../../utils/FormatCurrency';
import { debounce } from 'lodash';
import Loading from '../../components/Loading';
import { createCart } from '../../services/cartService';
import useCart from '../../hooks/useCart';
import { formatDate } from '../../utils/FormatDateTime';

const Books = () => {
    const { fetchCarts } = useCart();
    const [books, setBooks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalBooks, setTotalBooks] = useState();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [bookCopies, setBookCopies] = useState([]);
    const [selectedCopy, setSelectedCopy] = useState(null);
    const [isCopiesModalOpen, setIsCopiesModalOpen] = useState(false);
    const [currentBookId, setCurrentBookId] = useState(null);
    const [currentRentalFee, setCurrentRentalFee] = useState(null);
    const size = 6;

    const handleSelectCategory = (value) => {
        setSelectedCategory(value);
        setSearchTerm('');
        setCurrentPage(1);
    };

    const showModal = () => {
        setIsModalOpen(true);
    };

    const showCopiesModal = async (bookId) => {
        setCurrentBookId(bookId);

        try {
            const response = await getAllBookCopiesOfOneBook(bookId);
            const result = response.data.data;

            // Filter only available copies
            const availableCopies = result.filter((copy) => copy.status === 'available');
            setBookCopies(availableCopies);
            setIsCopiesModalOpen(true);
        } catch (error) {
            message.error('Error fetching book copies');
            console.error(error);
        }
    };

    const handleViewDetail = (id) => {
        fetchBookById(id);
    };

    useEffect(() => {
        debouncedFetchBooks(searchTerm);
    }, [currentPage, selectedCategory, searchTerm]);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchBooks = async (query = '') => {
        setLoading(true);
        let response;
        if (selectedCategory === 'all') {
            response = await getAllBooks(currentPage, size, query);
        } else {
            response = await getBooksByCategory(selectedCategory, currentPage, size, query);
        }
        if (response.status === 200) {
            setBooks(response.data.data.data);
            setTotalBooks(response.data.data.total);
            setLoading(false);
        } else {
            message.error('Failed to fetch books');
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        setLoading(true);
        const response = await getAllCategories();
        if (response.status === 200) {
            setCategories(response.data.data);
            setLoading(false);
        } else {
            message.error('Failed to fetch categories');
            setLoading(false);
        }
    };

    const fetchBookById = async (id) => {
        const response = await getBookById(id);
        console.log(response);
        if (response.status === 200) {
            setSelectedBook(response.data.data);
            showModal();
        } else {
            message.error('Failed to fetch book detail');
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const filterOption = (input, option) => {
        return option.children.toLowerCase().includes(input.toLowerCase());
    };

    const debouncedFetchBooks = useCallback(
        debounce((query) => fetchBooks(query), 300),
        [selectedCategory, currentPage],
    );

    const handleAddCart = async () => {
        if (!selectedCopy) {
            message.error('Please select a book copy');
            return;
        }

        try {
            await createCart(currentBookId, selectedCopy.id);
            fetchCarts();
            fetchBooks(searchTerm);
            message.success('Book added to cart successfully');
            setIsCopiesModalOpen(false);
            setSelectedCopy(null);
        } catch (e) {
            message.error(e.data?.message || 'Failed to add book to cart');
        }
    };

    const handleCopySelect = (copy) => {
        setSelectedCopy(copy);
    };

    return (
        <div>
            <div className="flex items-center">
                <div className="relative">
                    <Select
                        defaultValue={selectedCategory}
                        showSearch // Bật tính năng tìm kiếm
                        filterOption={filterOption}
                        onChange={handleSelectCategory}
                        style={{
                            width: '250px',
                            color: '#1B326D',
                            height: '42px',
                        }}
                        dropdownStyle={{ maxHeight: '100px' }}
                    >
                        <Select.Option
                            style={{
                                color: '#1B326D',
                            }}
                            value="all"
                        >
                            All books
                        </Select.Option>
                        {categories.map((category) => (
                            <Select.Option
                                style={{
                                    color: '#1B326D',
                                }}
                                key={category.id}
                                value={category.id}
                            >
                                {category.name}
                            </Select.Option>
                        ))}
                    </Select>
                </div>

                <div className="mx-[24px] flex items-center">
                    <label htmlFor="" className="mr-[12px] font-medium text-[#1B326D]">
                        Keywords
                    </label>
                    <Input
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                        }}
                        style={{ height: '42px', width: '250px', color: '#1B326D', outline: 'none' }}
                    />
                </div>
            </div>
            <div className="mt-[16px]">
                <div className="mb-[16px] flex items-center justify-between">
                    <h1 className="text-[20px] leading-[24px] font-medium text-[#1B326D]">All books</h1>
                    {totalBooks > size && (
                        <div>
                            <Pagination
                                showSizeChanger={false}
                                current={currentPage}
                                onChange={handlePageChange}
                                total={totalBooks}
                                pageSize={size}
                                align="center"
                                className="text-[#1B326D]"
                            />
                        </div>
                    )}
                </div>

                {loading ? (
                    <Loading />
                ) : (
                    <div className="grid grid-cols-3 gap-[16px]">
                        {books &&
                            books.map((book) => (
                                <div key={book.id} className="flex items-center">
                                    <img src={book.thumbnail} className="h-auto w-[40%]" />

                                    <div className="ml-[24px] flex flex-1 flex-col gap-[12px] text-[14px]">
                                        <p className="font-bold text-[#1B326D]">{book.title}</p>
                                        <span className="text-[#9b9c9d]">
                                            Total:{' '}
                                            <span className="font-medium text-[#1B326D]">{book.total_copies}</span>
                                        </span>
                                        <span className="text-[#9b9c9d]">
                                            Available:{' '}
                                            <span className="font-medium text-[#1B326D]">{book.available_copies}</span>
                                        </span>
                                        <span className="text-[#9b9c9d]">
                                            Genre:{' '}
                                            <span className="font-medium text-[#1B326D]">
                                                {book.categories && book.categories.map((a) => a.name).join(', ')}
                                            </span>
                                        </span>

                                        <button
                                            className="max-w-[130px] cursor-pointer rounded-[8px] border-[1px] bg-[#1B326D] p-[8px] text-white"
                                            onClick={() => showCopiesModal(book.id)}
                                            disabled={book.available_copies <= 0}
                                        >
                                            Add to cart
                                        </button>

                                        <span
                                            onClick={() => handleViewDetail(book.id)}
                                            className="cursor-pointer font-medium text-[#1B326D] underline hover:font-bold"
                                        >
                                            View detail
                                        </span>
                                    </div>
                                </div>
                            ))}
                    </div>
                )}

                {/* Book Details Modal */}
                <Modal
                    open={isModalOpen}
                    onCancel={() => setIsModalOpen(false)}
                    footer={null}
                    centered
                    width={1000}
                    maskClosable={true}
                >
                    {selectedBook && (
                        <div className="flex bg-white">
                            {/* Thumbnail */}
                            <div className="w-1/3">
                                <img
                                    src={selectedBook.thumbnail}
                                    alt={selectedBook.title}
                                    className="h-auto w-full rounded-lg object-cover"
                                />
                            </div>

                            {/* selectedBook Details */}
                            <div className="w-2/3 pl-6">
                                <h2 className="text-[24px] font-bold text-[#1B326D]">{selectedBook.title}</h2>
                                <p className="text-[14px] text-[#1B326D]">
                                    by {selectedBook.authors.map((a) => a.name).join(', ')}
                                </p>

                                <p className="mt-[12px] font-semibold text-[#1B326D]">
                                    Genre: {selectedBook.categories.map((c) => c.name).join(', ')}
                                </p>
                                <p className="mt-[12px] text-sm font-semibold text-[#9b9c9d]">
                                    Publication year:
                                    <span className="ml-[4px] text-[#1B326D]">{selectedBook.publication_year}</span>
                                </p>
                                <p className="mt-[12px] text-sm font-semibold text-[#9b9c9d]">
                                    ISBN:
                                    <span className="ml-[4px] text-[#1B326D]">{selectedBook.isbn}</span>
                                </p>
                                <p className="mt-[12px] font-semibold text-[#9b9c9d]">
                                    Available Copies:
                                    <span className="ml-[4px] text-[#1B326D]">
                                        {selectedBook.available_copies} / {selectedBook.total_copies}
                                    </span>
                                </p>

                                <p className="mt-4 font-semibold text-[#9b9c9d]">Description:</p>

                                <span className="mt-[4px] text-[#1B326D]">{selectedBook.description}</span>
                            </div>
                        </div>
                    )}
                </Modal>

                {/* Book Copies Modal */}
                <Modal
                    title="Select Book Copy"
                    open={isCopiesModalOpen}
                    onCancel={() => {
                        setIsCopiesModalOpen(false);
                        setSelectedCopy(null);
                    }}
                    footer={[
                        <button
                            key="cancel"
                            onClick={() => {
                                setIsCopiesModalOpen(false);
                                setSelectedCopy(null);
                            }}
                            className="mr-2 rounded-[8px] border border-gray-300 px-4 py-2"
                        >
                            Cancel
                        </button>,
                        <button
                            key="submit"
                            onClick={handleAddCart}
                            disabled={!selectedCopy}
                            className={`rounded-[8px] px-4 py-2 text-white ${
                                selectedCopy ? 'cursor-pointer bg-[#1B326D]' : 'cursor-not-allowed bg-gray-400'
                            }`}
                        >
                            Add to Cart
                        </button>,
                    ]}
                    centered
                    width={600}
                >
                    <div className="max-h-[435px] overflow-y-auto">
                        {bookCopies.length === 0 ? (
                            <p className="text-center text-red-500">No available copies for this book</p>
                        ) : (
                            <div className="grid gap-3">
                                {bookCopies.map((copy) => (
                                    <div
                                        key={copy.id}
                                        className={`cursor-pointer rounded-lg border p-4 ${
                                            selectedCopy?.id === copy.id
                                                ? 'border-[#1B326D] bg-blue-50'
                                                : 'border-gray-200'
                                        }`}
                                        onClick={() => handleCopySelect(copy)}
                                    >
                                        <div className="flex justify-between">
                                            <div>
                                                <p className="font-medium text-[#1B326D]">Copy ID: {copy.id}</p>
                                                <p className="text-sm text-gray-600">Status: {copy.status}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Condition: {copy.condition}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </Modal>
            </div>
        </div>
    );
};

export default Books;
