import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProviderDashboard = () => {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState([]);

    // State for Provider
    const [newService, setNewService] = useState({
        name: '', description: '', category: 'Cleaning', price: '', duration: 60
    });

    // DEBUG LOG
    console.log("Current User Role:", user?.role);

    useEffect(() => {
        if (user) {
            // If customer (which is 'user' in DB), fetch my bookings
            if (user.role === 'customer' || user.role === 'user') {
                fetchMyBookings();
            } else if (user.role === 'provider') {
                fetchProviderAppointments();
            }
        }
    }, [user]);

    const fetchMyBookings = async () => {
        try {
            const { data } = await axios.get('/appointments/my-bookings');
            setAppointments(data);
        } catch (error) {
            console.error("Failed to fetch my bookings:", error);
        }
    };

    const fetchProviderAppointments = async () => {
        try {
            const { data } = await axios.get('/appointments');
            setAppointments(data);
        } catch (error) {
            console.error("Failed to fetch provider appointments:", error);
        }
    };

    // Provider actions
    const handleStatusUpdate = async (id, status) => {
        try {
            await axios.put(`/appointments/${id}/status`, { status });
            fetchProviderAppointments();
        } catch (error) {
            alert('Failed to update status');
        }
    };

    const handleAddService = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/services', newService);
            alert('Service Added!');
            setNewService({ name: '', description: '', category: 'Cleaning', price: '', duration: 60 });
        } catch (error) {
            alert('Failed to add service');
        }
    };

    if (!user) return <div>Loading...</div>;

    // ----------------------------------------------------------------------
    // CUSTOMER VIEW
    // ----------------------------------------------------------------------
    if (user.role === 'customer' || user.role === 'user') {
        return (
            <div className="max-w-7xl mx-auto py-10 px-4 mt-16">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                    <h1 className="text-3xl font-bold">My Bookings</h1>
                    <Link to="/services/all" className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 shadow-md transition-all flex items-center gap-2">
                        <span className="text-xl">+</span> Book New Appointment
                    </Link>
                </div>

                {appointments.length === 0 ? (
                    <div className="text-center py-20 bg-slate-50 rounded-xl">
                        <p className="text-xl text-slate-500 mb-6">You have no upcoming appointments.</p>
                        <Link to="/services/all" className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700">
                            Find a Service
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-slate-100">
                        <table className="min-w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 font-bold text-slate-600">Service Name</th>
                                    <th className="px-6 py-4 font-bold text-slate-600">Provider</th>
                                    <th className="px-6 py-4 font-bold text-slate-600">Date</th>
                                    <th className="px-6 py-4 font-bold text-slate-600">Time</th>
                                    <th className="px-6 py-4 font-bold text-slate-600">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {appointments.map((appt) => (
                                    <tr key={appt._id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 font-medium">{appt.serviceId?.name || 'Unknown'}</td>
                                        <td className="px-6 py-4">{appt.providerId?.name || 'Unknown'}</td>
                                        <td className="px-6 py-4">{new Date(appt.date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">{appt.timeSlot}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase 
                                                    ${appt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                                        appt.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
                                                    {appt.status}
                                                </span>
                                                {appt.status === 'pending' && (<div className="flex gap-2">
                                                    <button
                                                        onClick={async () => {
                                                            if (window.confirm('To reschedule, we must cancel your current slot first. Proceed?')) {
                                                                try {
                                                                    // Step 1: Cancel current (using existing DELETE route which sets status='cancelled')
                                                                    await axios.delete(`/appointments/${appt._id}`);
                                                                    // Step 2: Redirect to book new
                                                                    // Navigate to /book/:serviceId. appt.serviceId is populated object.
                                                                    window.location.href = `/book/${appt.serviceId?._id}`;
                                                                } catch (error) {
                                                                    console.error(error);
                                                                    alert('Error rescheduling');
                                                                }
                                                            }
                                                        }}
                                                        className="text-blue-600 hover:text-blue-800 font-bold text-sm underline"
                                                    >
                                                        Reschedule
                                                    </button>
                                                    <button
                                                        onClick={async () => {
                                                            if (window.confirm('Are you sure you want to cancel this appointment?')) {
                                                                try {
                                                                    await axios.delete(`/appointments/${appt._id}`);
                                                                    // Update state to remove item immediately
                                                                    setAppointments(prev => prev.filter(item => item._id !== appt._id));
                                                                } catch (error) {
                                                                    alert('Failed to cancel appointment');
                                                                }
                                                            }
                                                        }}
                                                        className="text-red-500 hover:text-red-700 font-bold text-sm underline"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>)}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    }

    // ----------------------------------------------------------------------
    // PROVIDER VIEW
    // ----------------------------------------------------------------------
    return (
        <div className="max-w-7xl mx-auto py-10 px-4 mt-16">
            <h1 className="text-3xl font-bold mb-8">Provider Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Bookings List */}
                <div>
                    <h2 className="text-xl font-bold mb-4">Booking Requests</h2>
                    <div className="space-y-4">
                        {appointments.map((appt) => (
                            <div key={appt._id} className="bg-white p-6 rounded-lg shadow border border-slate-100">
                                <h3 className="font-bold text-lg">{appt.serviceId?.name}</h3>
                                <p className="text-sm text-slate-500 mb-2">Client: {appt.userId?.name}</p>
                                <p className="text-sm">Date: {new Date(appt.date).toLocaleDateString()} at {appt.timeSlot}</p>
                                <div className="mt-4 flex gap-2">
                                    {appt.status === 'pending' && (
                                        <>
                                            <button onClick={() => handleStatusUpdate(appt._id, 'confirmed')} className="bg-green-500 text-white px-3 py-1 rounded text-sm">Accept</button>
                                            <button onClick={() => handleStatusUpdate(appt._id, 'cancelled')} className="bg-red-500 text-white px-3 py-1 rounded text-sm">Reject</button>
                                        </>
                                    )}
                                    <span className="ml-auto font-bold text-sm uppercase text-slate-400">{appt.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Add Service */}
                <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-100 h-fit">
                    <h2 className="text-xl font-bold mb-6">Add New Service</h2>
                    <form onSubmit={handleAddService} className="space-y-4">
                        <input type="text" placeholder="Service Name" className="w-full p-2 border rounded"
                            value={newService.name} onChange={(e) => setNewService({ ...newService, name: e.target.value })} />

                        <select className="w-full p-2 border rounded"
                            value={newService.category} onChange={(e) => setNewService({ ...newService, category: e.target.value })}>
                            <option>Cleaning</option>
                            <option>Medical</option>
                            <option>Repair</option>
                        </select>

                        <textarea placeholder="Description" className="w-full p-2 border rounded"
                            value={newService.description} onChange={(e) => setNewService({ ...newService, description: e.target.value })} />

                        <div className="flex gap-4">
                            <input type="number" placeholder="Price" className="w-full p-2 border rounded"
                                value={newService.price} onChange={(e) => setNewService({ ...newService, price: e.target.value })} />
                            <input type="number" placeholder="Duration (min)" className="w-full p-2 border rounded"
                                value={newService.duration} onChange={(e) => setNewService({ ...newService, duration: e.target.value })} />
                        </div>

                        <button className="w-full bg-indigo-600 text-white py-2 rounded font-bold">Add Service</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProviderDashboard;
