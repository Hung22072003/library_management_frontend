import { useState, useEffect } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Area,
    AreaChart,
} from 'recharts';
import { BookOpen, Clock, CheckCircle, CircleDollarSign } from 'lucide-react';
import { formatCurrency } from '../../utils/FormatCurrency';
import Loading from '../../components/Loading';
const API_BASE_URL = 'http://127.0.0.1:8000/api/statistics';

const Dashboard = () => {
    const [data, setData] = useState({
        totalBooks: 0,
        mostBorrowedBooks: [],
        topUsers: [],
        dailyBorrows: [],
        returnStats: {},
        totalTransactions: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Simulated fetch function to replace axios
    const fetchData = async (url) => {
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Fetch error:', error);
            throw error;
        }
    };
    const fetchAllData = async () => {
        try {
            setLoading(true);
            // Uncomment below for actual API calls:
            const [booksQuantity, mostBorrowedBooks, returnStats, totalTransactions] = await Promise.all([
                fetchData(`${API_BASE_URL}/books/quantity`),
                fetchData(`${API_BASE_URL}/books/borrowed/most`),
                fetchData(`${API_BASE_URL}/books/returned/late`),
                fetchData(`${API_BASE_URL}/transactions/total`),
            ]);

            setData({
                totalBooks: parseInt(booksQuantity.data),
                mostBorrowedBooks: mostBorrowedBooks.data || [],
                returnStats: returnStats.data || {},
                totalTransactions: parseInt(totalTransactions.data),
            });

            setError(null);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load dashboard data. Using demo data instead.');
        } finally {
            setLoading(false);
        }
    };

    const fetchRemainingData = async () => {
        try {
            // Fetch top users and daily borrows
            const [topUsers, dailyBorrows] = await Promise.all([
                fetchData(`${API_BASE_URL}/users/borrowed/most`),
                fetchData(`${API_BASE_URL}/books/borrowed/eachday`),
            ]);

            setData((prevData) => ({
                ...prevData,
                topUsers: topUsers.data || [],
                dailyBorrows: dailyBorrows.data || [],
            }));

            setError(null);
        } catch (err) {
            console.error('Error fetching remaining data:', err);
            setError('Failed to load additional data. Using demo data instead.');
        }
    };

    useEffect(() => {
        fetchAllData();
        fetchRemainingData();
    }, []);

    if (loading) {
        return <Loading />;
    }

    const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'];

    const returnRatePercentage = ((data.returnStats.returned_ratio || 0) * 100).toFixed(1);
    const lateReturnPercentage = ((data.returnStats.returned_late_ratio || 0) * 100).toFixed(1);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="border-b bg-white shadow-sm">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="py-6">
                        <h1 className="flex items-center text-3xl font-bold text-gray-900">
                            <BookOpen className="mr-3 h-8 w-8 text-blue-600" />
                            Library Management Dashboard
                        </h1>
                        <p className="mt-2 text-gray-600">Overview of your library statistics and performance</p>
                        {error && (
                            <div className="mt-2 rounded border border-yellow-400 bg-yellow-100 p-2 text-sm text-yellow-700">
                                {error}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Stats Cards */}
                <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg bg-white p-6 shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Books</p>
                                <p className="text-2xl font-bold text-gray-900">{data.totalBooks.toLocaleString()}</p>
                            </div>
                            <div className="rounded-full bg-blue-100 p-3">
                                <BookOpen className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatCurrency(data.totalTransactions)}
                                </p>
                            </div>
                            <div className="rounded-full bg-green-100 p-3">
                                <CircleDollarSign className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">On-time Return</p>
                                <p className="text-2xl font-bold text-gray-900">{returnRatePercentage}%</p>
                            </div>
                            <div className="rounded-full bg-green-100 p-3">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Late Return</p>
                                <p className="text-2xl font-bold text-gray-900">{lateReturnPercentage}%</p>
                            </div>
                            <div className="rounded-full bg-red-100 p-3">
                                <Clock className="h-6 w-6 text-red-600" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-8">
                    <div className="rounded-lg bg-white p-6 shadow">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900">Most Borrowed Books</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={data.mostBorrowedBooks}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="title" angle={-45} textAnchor="end" height={80} interval={0} />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="borrow_count" fill="#3B82F6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="mb-8">
                    <div className="rounded-lg bg-white p-6 shadow">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900">
                            Number of loans in the last 10 days
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={data.dailyBorrows}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Area
                                    type="monotone"
                                    dataKey="borrow_count"
                                    stroke="#10B981"
                                    fill="#10B981"
                                    fillOpacity={0.3}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Top Users */}
                    <div className="rounded-lg bg-white p-6 shadow lg:col-span-2">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900">Top Active Users</h3>
                        <div className="space-y-4">
                            {data.topUsers &&
                                data.topUsers.map((user, index) => (
                                    <div
                                        key={user.id}
                                        className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                                    >
                                        <div className="flex items-center">
                                            <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                                                <span className="text-sm font-medium text-blue-600">#{index + 1}</span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{user.name}</p>
                                                <p className="text-sm text-gray-500">{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-semibold text-gray-900">{user.borrow_count}</p>
                                            <p className="text-sm text-gray-500">books borrowed</p>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>

                    {/* Return Statistics Pie Chart */}
                    <div className="rounded-lg bg-white p-6 shadow">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900">Return Statistics</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={[
                                        {
                                            name: 'Returned On Time',
                                            value: data.returnStats.returned || 0,
                                            color: '#10B981',
                                        },
                                        {
                                            name: 'Returned Late',
                                            value: data.returnStats.returned_late || 0,
                                            color: '#EF4444',
                                        },
                                    ]}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                >
                                    {[0, 1, 2].map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={['#10B981', '#EF4444', '#6B7280'][index]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>

                        <div className="mt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Total Books:</span>
                                <span className="font-medium">{data.returnStats.total || 0}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Returned:</span>
                                <span className="font-medium text-green-600">{data.returnStats.returned || 0}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Late Returns:</span>
                                <span className="font-medium text-red-600">{data.returnStats.returned_late || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
