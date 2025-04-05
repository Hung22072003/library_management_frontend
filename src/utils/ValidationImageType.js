export const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export const isValidImageType = (file) => {
    return file && validImageTypes.includes(file.type);
};
