export const FormatDateTime = (date) => {
    return (
        new Date(date)
            .toLocaleString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour12: false,
            })
            //   .replace(',', '')
            .replace(/(\d+)\/(\d+)\/(\d+)/, '$3-$1-$2')
    );
};

export const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};
