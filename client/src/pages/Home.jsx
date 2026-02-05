import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50 font-sans">
            {/* Glassmorphism Card */}
            <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl w-full max-w-md text-center border border-white/20">

                {/* Logo Area */}
                <h1 className="text-4xl font-extrabold text-indigo-600 mb-2 tracking-tight">
                    NexusService
                </h1>

                {/* Subtitle */}
                <p className="text-slate-500 mb-8 font-medium">
                    Welcome! Please sign in or join us to continue.
                </p>

                {/* Buttons */}
                <div className="flex flex-col gap-4">
                    <Link
                        to="/login"
                        className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all duration-300"
                    >
                        Sign In
                    </Link>
                    <Link
                        to="/register"
                        className="w-full py-3 rounded-xl bg-white border border-indigo-100 text-indigo-600 font-bold hover:bg-indigo-50 transition-all duration-300"
                    >
                        Create Account
                    </Link>
                </div>

                <div className="mt-8 text-xs text-slate-400">
                    Trusted by thousands of healthcare professionals
                </div>
            </div>
        </div>
    );
};

export default Home;
