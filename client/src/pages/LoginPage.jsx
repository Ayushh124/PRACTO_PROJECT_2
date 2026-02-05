import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, user, loading } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    useEffect(() => {
        if (!loading && user) {
            navigate('/');
        }
    }, [user, loading, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.message || 'Failed to sign in');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50 px-4">
            <div className="w-full max-w-md bg-white/70 backdrop-blur-lg p-10 rounded-2xl shadow-2xl border border-white/40">
                <div className="text-center mb-8">
                    <Link to="/" className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        NexusService
                    </Link>
                    <h2 className="mt-4 text-xl font-bold text-slate-800">
                        Welcome Back
                    </h2>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm text-center border border-red-100 mb-6">
                        {error}
                    </div>
                )}

                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all duration-200"
                    >
                        Sign In
                    </button>
                </form>

                <div className="text-center mt-6">
                    <p className="text-slate-500 text-sm">
                        New to NexusService?
                        <Link to="/register" className="ml-2 text-indigo-600 font-bold hover:underline">
                            Create an account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
