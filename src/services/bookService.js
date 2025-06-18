import axios from './axiosInstance';

const getAllBooks = (page, size, search) => {
    return axios.get(`api/books?page=${page}&size=${size}&q=${search}`);
};

const getBookById = (id) => {
    return axios.get(`api/books/${id}`);
};

const getBooksByCategory = (categoryId, page, size, search) => {
    return axios.get(`api/books/category/${categoryId}?page=${page}&size=${size}&q=${search}`);
};

const createBook = (values, thumbnail) => {
    const formData = new FormData();
    formData.append('title', values.title);
    if (values.description) formData.append('description', values.description);
    if (values.publication_year) formData.append('publication_year', values.publication_year);
    if (values.isbn13) formData.append('isbn13', values.isbn13);
    if (values.isbn10) formData.append('isbn10', values.isbn10);
    if (values.authors) formData.append('authors', values.authors);
    if (values.language) formData.append('language', values.language);
    if (values.num_pages) formData.append('num_pages', values.num_pages);
    if (values.total_copies) formData.append('total_copies', values.total_copies);
    if (thumbnail) formData.append('thumbnail', thumbnail);

    if (values.categories) {
        values.categories.forEach((category) => {
            formData.append('categories[]', category);
        });
    }

    return axios.post('api/books', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

const updateBook = async (id, values, thumbnail, oldThumbnail) => {
    const formData = new FormData();
    formData.append('title', values.title);
    if (values.description) formData.append('description', values.description);
    if (values.publication_year) formData.append('publication_year', values.publication_year);
    if (values.isbn13) formData.append('isbn13', values.isbn13);
    if (values.isbn10) formData.append('isbn10', values.isbn10);
    if (values.authors) formData.append('authors', values.authors);
    if (values.language) formData.append('language', values.language);
    if (values.num_pages) formData.append('num_pages', values.num_pages);
    if (oldThumbnail) formData.append('thumbnail', oldThumbnail);
    if (thumbnail) formData.append('file', thumbnail);

    formData.append('categories[]', values.categories);

    return await axios.post(`/api/books/${id}?_method=PUT`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

const deleteBook = (id) => {
    return axios.delete(`/api/books/${id}`);
};

const restoreBook = (id) => {
    return axios.post(`/api/books/${id}`);
};

const getAllBookCopiesOfOneBook = (id) => {
    return axios.get(`/api/books/bookcopies/${id}`);
};

const addBookCopies = (id, num) => {
    return axios.post(`/api/books/${id}/bookcopies/add?num=${num}`);
};
export {
    getAllBooks,
    getBookById,
    getBooksByCategory,
    createBook,
    updateBook,
    deleteBook,
    restoreBook,
    getAllBookCopiesOfOneBook,
    addBookCopies,
};
