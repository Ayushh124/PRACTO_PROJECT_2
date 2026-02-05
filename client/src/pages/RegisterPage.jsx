import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user'); // Default to customer
    const [category, setCategory] = useState({ category: 'Cleaning', bio: '' });
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const { register } = useAuth();

    const submitHandler = async (e) => {
        e.preventDefault();
        setError('');
        try {
            // "user" is the role string for Customer in backend
            const roleToSend = role === 'user' ? 'user' : role;

            // Construct providerProfile only if role is provider
            const providerData = role === 'provider' ? { category: category.category, bio: category.bio } : undefined;

            await register(name, email, password, roleToSend, providerData);
            navigate('/dashboard');
        } catch (err) {
            setError(err || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-200">

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
                    <p className="text-gray-500 text-sm">Sign up to get started</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm font-medium flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        {error}
                    </div>
                )}

                <form onSubmit={submitHandler} className="space-y-5">

                    {/* Role Toggle */}
                    <div className="grid grid-cols-2 p-1 bg-gray-100 rounded-lg mb-6">
                        <button
                            type="button"
                            onClick={() => setRole('user')}
                            className={`py-2 text-center rounded-md text-sm font-medium transition-all ${role === 'user'
                                    ? 'bg-white text-blue-700 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Customer
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole('provider')}
                            className={`py-2 text-center rounded-md text-sm font-medium transition-all ${role === 'provider'
                                    ? 'bg-white text-blue-700 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Professional
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">Full Name</label>
                            <input
                                type="text"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-gray-900"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">Email Address</label>
                            <input
                                type="email"
                                placeholder="john@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-gray-900"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-gray-900"
                                required
                            />
                        </div>

                        {role === 'provider' && (
                            <div className="animate-fade-in-down">
                                <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">Service Category</label>
                                <div className="relative">
                                    <select
                                        value={category.category}
                                        onChange={(e) => setCategory({ ...category, category: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-gray-900 appearance-none cursor-pointer"
                                    >
                                        <option value="Cleaning">Cleaning Services</option>
                                        <option value="Medical">Medical Services</option>
                                        <option value="Repair">Repair & Maintenance</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500">
                                        ▼
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md transition-colors mt-6"
                    >
                        Create Account
                    </button>
                </form>

                <p className="mt-8 text-center text-gray-600 text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-800 hover:underline transition-colors">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
