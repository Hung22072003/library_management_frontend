import { Input, message, Modal, Pagination, Select } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { getAllBookCopiesOfOneBook, getAllBooks, getBookById, getBooksByCategory } from '../../services/bookService';
import { getAllCategories } from '../../services/categoryService';
import { debounce } from 'lodash';
import Loading from '../../components/Loading';
import { createCart } from '../../services/cartService';
import useCart from '../../hooks/useCart';
import defaultBook from '../../assets/default-book.png'; // Assuming you have a default image for books
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
    const size = 12;

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
                        showSearch
                        filterOption={filterOption}
                        onChange={handleSelectCategory}
                        style={{
                            width: '250px',
                            color: '#1B326D',
                            height: '42px',
                        }}
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
                        placeholder="Search books..."
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
                    <div className="space-y-[16px]">
                        {books &&
                            books.map((book) => (
                                <div
                                    key={book.id}
                                    className="rounded-lg border border-gray-200 bg-white p-[16px] shadow-md transition-shadow duration-300 hover:shadow-lg"
                                >
                                    <div className="flex items-center gap-[20px]">
                                        {/* Book Thumbnail */}
                                        <div className="h-[160px] w-[120px] flex-shrink-0 overflow-hidden rounded-lg">
                                            <img
                                                src={book.thumbnail || defaultBook}
                                                alt={book.title}
                                                className="h-auto w-full object-cover"
                                            />
                                        </div>

                                        {/* Book Information */}
                                        <div className="flex-1 space-y-[12px]">
                                            {/* Title */}
                                            <h3 className="line-clamp-2 text-[16px] font-bold text-[#1B326D]">
                                                {book.title}
                                            </h3>

                                            {/* Authors */}
                                            <p className="text-[14px] text-[#666]">
                                                <span className="font-medium text-[#1B326D]">Authors:</span>{' '}
                                                {book.authors}
                                            </p>

                                            {/* Categories */}
                                            <p className="text-[14px] text-[#666]">
                                                <span className="font-medium text-[#1B326D]">Genre:</span>
                                                <span className="ml-[8px]">
                                                    {book.categories?.map((category) => category.name).join(', ')}
                                                </span>
                                            </p>

                                            {/* Availability Info */}
                                            <div className="flex items-center gap-[24px] text-[14px]">
                                                <span className="text-[#1B326D]">
                                                    Total Copies:{' '}
                                                    <span className="font-medium text-[#1B326D]">
                                                        {book.total_copies}
                                                    </span>
                                                </span>
                                                <span className="text-[#1B326D]">
                                                    Available:{' '}
                                                    <span
                                                        className={`font-medium ${book.available_copies > 0 ? 'text-green-600' : 'text-red-600'}`}
                                                    >
                                                        {book.available_copies}
                                                    </span>
                                                </span>
                                                <span className="text-[#1B326D]">
                                                    Language:{' '}
                                                    <span className="font-medium text-[#1B326D]">{book.language}</span>
                                                </span>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex min-w-[120px] flex-col gap-[8px]">
                                            <button
                                                className={`w-full cursor-pointer rounded-[6px] border-[1px] p-[10px] text-[14px] font-medium transition-colors duration-200 ${
                                                    book.available_copies > 0
                                                        ? 'bg-[#1B326D] text-white hover:bg-[#0f1f47]'
                                                        : 'cursor-not-allowed bg-gray-300 text-gray-500'
                                                }`}
                                                onClick={() => showCopiesModal(book.id)}
                                                disabled={book.available_copies <= 0}
                                            >
                                                {book.available_copies > 0 ? 'Add to cart' : 'Out of stock'}
                                            </button>

                                            <button
                                                onClick={() => handleViewDetail(book.id)}
                                                className="w-full cursor-pointer rounded-[6px] border border-[#1B326D] px-[10px] py-[10px] text-[14px] font-medium text-[#1B326D] transition-colors duration-200 hover:bg-[#1B326D] hover:text-white"
                                            >
                                                View Details
                                            </button>
                                        </div>
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
                                    src={selectedBook.thumbnail || defaultBook}
                                    alt={selectedBook.title}
                                    className="h-auto w-full rounded-lg object-cover"
                                />
                            </div>

                            {/* selectedBook Details */}
                            <div className="w-2/3 pl-6">
                                <h2 className="text-[16px] font-bold text-[#1B326D]">{selectedBook.title}</h2>
                                <p className="mt-[12px] text-sm font-semibold text-[#9b9c9d]">
                                    Authors:
                                    <span className="ml-[4px] text-[#1B326D]">{selectedBook.authors}</span>
                                </p>

                                <p className="mt-[12px] text-sm font-semibold text-[#9b9c9d]">
                                    Genre:
                                    <span className="ml-[4px] text-[#1B326D]">
                                        {selectedBook.categories?.map((c) => c.name).join(', ') || 'No Category'}
                                    </span>
                                </p>

                                <p className="mt-[12px] text-sm font-semibold text-[#9b9c9d]">
                                    Publication year:
                                    <span className="ml-[4px] text-[#1B326D]">{selectedBook.publication_year}</span>
                                </p>
                                <p className="mt-[12px] text-sm font-semibold text-[#9b9c9d]">
                                    ISBN:
                                    <span className="ml-[4px] text-[#1B326D]">
                                        {selectedBook.isbn13 || selectedBook.isbn10}
                                    </span>
                                </p>
                                <p className="mt-[12px] font-semibold text-[#9b9c9d]">
                                    Available Copies:
                                    <span className="ml-[4px] text-[#1B326D]">
                                        {selectedBook.available_copies} / {selectedBook.total_copies}
                                    </span>
                                </p>
                                <p className="mt-[12px] text-sm font-semibold text-[#9b9c9d]">
                                    Language:
                                    <span className="ml-[4px] text-[#1B326D]">{selectedBook.language}</span>
                                </p>

                                <p className="mt-[12px] text-sm font-semibold text-[#9b9c9d]">
                                    NumPages:
                                    <span className="ml-[4px] text-[#1B326D]">{selectedBook.num_pages}</span>
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
