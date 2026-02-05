import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const MyAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };
            const { data } = await axios.get('/api/appointments', config);
            setAppointments(data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch appointments');
            setLoading(false);
        }
    };

    const handleCancel = async (id) => {
        if (window.confirm('Are you sure you want to cancel this appointment?')) {
            try {
                const token = localStorage.getItem('token');
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                };
                await axios.put(`/api/appointments/${id}/cancel`, {}, config);
                // Refresh list
                fetchAppointments();
            } catch (err) {
                alert(err.response?.data?.message || 'Failed to cancel appointment');
            }
        }
    };

    const handleReschedule = async (appointment) => {
        if (window.confirm('To reschedule, we must cancel your current slot first. Proceed?')) {
            try {
                const token = localStorage.getItem('token');
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                };
                // Step 1: Cancel current
                await axios.put(`/api/appointments/${appointment._id}/cancel`, {}, config);

                // Step 2: Navigate to booking page
                // SAFE: Check if serviceId is object or string
                const serviceId = appointment.serviceId?._id || appointment.serviceId;
                if (!serviceId) {
                    alert('Service details missing, cannot reschedule.');
                    fetchAppointments();
                    return;
                }

                window.location.href = `/book/${serviceId}`;
            } catch (err) {
                alert(err.response?.data?.message || 'Failed to reschedule');
            }
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed':
                return 'bg-emerald-100 text-emerald-700 border-transparent';
            case 'pending':
                return 'bg-amber-100 text-amber-700 border-transparent';
            case 'cancelled':
                return 'bg-slate-100 text-slate-500 border-transparent';
            case 'completed':
                return 'bg-indigo-100 text-indigo-700 border-transparent';
            default:
                return 'bg-gray-100 text-gray-500 border-gray-200';
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-indigo-600 text-xl font-bold animate-pulse">Loading appointments...</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-end mb-10">
                    <div>
                        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">My Appointments</h1>
                        <p className="text-lg text-slate-500 mt-2">Manage your bookings and service history.</p>
                    </div>
                    {!loading && !error && (
                        <span className="bg-indigo-100 text-indigo-700 font-bold px-4 py-2 rounded-full shadow-sm">
                            {appointments.length} Total
                        </span>
                    )}
                </header>

                {error && <div className="text-center py-20 text-red-600">{error}</div>}

                {appointments.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-3xl shadow-sm border border-slate-100 max-w-2xl mx-auto">
                        <div className="text-6xl mb-6">📅</div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-4">No appointments yet</h3>
                        <p className="text-slate-500 mb-8 max-w-md mx-auto">You haven't booked any services. Explore our professionals to get started.</p>
                        <Link to="/" className="inline-block bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all duration-300">
                            Browse Services
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {appointments.map((apt) => (
                            <div key={apt._id} className="group bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusColor(apt.status)}`}>
                                            {apt.status}
                                        </div>
                                        <div className="text-xs text-slate-400 font-bold tracking-wider uppercase">
                                            {apt.serviceId?.category || 'Service'}
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">
                                            {apt.providerId?.name || 'Unknown Provider'}
                                        </h3>
                                        <p className="text-slate-500 font-medium">
                                            {apt.serviceId?.name || 'Service Deleted'}
                                        </p>
                                    </div>

                                    <div className="space-y-3 mb-8 bg-slate-50 p-4 rounded-xl">
                                        <div className="flex items-center text-slate-700">
                                            <span className="mr-3 text-lg opacity-70">📅</span>
                                            <span className="font-semibold">
                                                {new Date(apt.date).toLocaleDateString('en-US', {
                                                    weekday: 'short',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                        <div className="flex items-center text-slate-700">
                                            <span className="mr-3 text-lg opacity-70">⏰</span>
                                            <span className="font-semibold">
                                                {apt.timeSlot}
                                            </span>
                                        </div>
                                    </div>

                                    {['pending', 'confirmed'].includes(apt.status) && (
                                        <div className="flex flex-col gap-2">
                                            <button
                                                onClick={() => handleReschedule(apt)}
                                                className="w-full py-3 px-4 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl font-bold hover:bg-indigo-100 hover:text-indigo-700 transition-all text-sm"
                                            >
                                                Reschedule
                                            </button>
                                            <button
                                                onClick={() => handleCancel(apt._id)}
                                                className="w-full py-3 px-4 bg-white border border-red-100 text-red-500 rounded-xl font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all text-sm"
                                            >
                                                Cancel Appointment
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyAppointments;
