import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-indigo-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo Section */}
                    <Link to="/" className="font-extrabold text-2xl text-slate-900 tracking-tight flex items-center gap-2">
                        <span className="text-3xl">✨</span> NexusService
                    </Link>

                    {/* Navigation Buttons */}
                    <div className="flex items-center gap-6">
                        {/* Persistent Link for Find Services (Visible to everyone except Providers maybe?) */}
                        <Link to="/services/all" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">
                            Find Services
                        </Link>

                        {user ? (
                            <>
                                <span className="text-slate-500 font-medium hidden md:block text-sm">
                                    Welcome, <span className="text-slate-900 font-bold">{user.name}</span>
                                </span>

                                <Link
                                    to="/dashboard"
                                    className="text-indigo-600 hover:text-indigo-800 font-semibold border border-indigo-100 bg-indigo-50 px-4 py-2 rounded-lg transition-all"
                                >
                                    {user.role === 'customer' || user.role === 'user' ? 'My Appointments' : 'Dashboard'}
                                </Link>

                                <button
                                    onClick={handleLogout}
                                    className="text-slate-400 hover:text-red-500 font-medium transition-colors text-sm"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-2.5 px-6 rounded-full shadow-lg hover:shadow-indigo-500/30 transition-all transform hover:-translate-y-0.5"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
