import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProviderDashboard = () => {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState([]);

    const [serviceForm, setServiceForm] = useState({
        name: '', description: '', category: 'Cleaning', price: '', duration: 60
    });
    const [editingId, setEditingId] = useState(null);

    // DEBUG LOG
    console.log("Current User Role:", user?.role);

    useEffect(() => {
        if (user) {
            // If customer (which is 'user' in DB), fetch my bookings
            if (user.role === 'customer' || user.role === 'user') {
                fetchMyBookings();
            } else if (user.role === 'provider') {
                fetchProviderAppointments();
                fetchMyServices();
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

    const fetchMyServices = async () => {
        try {
            const { data } = await axios.get('/services/my-services');
            setMyServices(data);
        } catch (error) {
            console.error("Failed to fetch my services:", error);
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

    const handleSubmitService = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                // Update existing
                await axios.put(`/services/${editingId}`, serviceForm);
                alert('Service Updated!');
            } else {
                // Create new
                await axios.post('/services', serviceForm);
                alert('Service Added!');
            }
            setServiceForm({ name: '', description: '', category: 'Cleaning', price: '', duration: 60 });
            setEditingId(null);
            fetchMyServices();
        } catch (error) {
            console.error(error);
            alert('Failed to save service');
        }
    };

    const handleEditClick = (service) => {
        setServiceForm({
            name: service.name,
            description: service.description,
            category: service.category,
            price: service.price,
            duration: service.duration
        });
        setEditingId(service._id);
        // Scroll to form (simple implementation)
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteService = async (id) => {
        if (window.confirm('Are you sure you want to delete this service?')) {
            try {
                await axios.delete(`/services/${id}`);
                fetchMyServices();
            } catch (error) {
                alert('Failed to delete service');
            }
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
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Provider Dashboard</h1>
                <Link to="/profile-settings" className="bg-slate-800 text-white px-5 py-2 rounded-lg hover:bg-slate-700">
                    Profile Settings
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Bookings List */}
                <div>
                    <h2 className="text-xl font-bold mb-4">Booking Requests</h2>
                    <div className="space-y-4">
                        {appointments.length === 0 && <p className="text-slate-500">No booking requests yet.</p>}
                        {appointments.map((appt) => (
                            <div key={appt._id} className="bg-white p-6 rounded-lg shadow border border-slate-100">
                                <h3 className="font-bold text-lg">{appt.serviceId?.name}</h3>
                                <p className="text-sm text-slate-500 mb-2">Client: {appt.userId?.name}</p>
                                <p className="text-sm">Date: {new Date(appt.date).toLocaleDateString()} at {appt.timeSlot}</p>
                                <div className="mt-4 flex gap-2">
                                    {appt.status === 'pending' && (
                                        <>
                                            <button onClick={() => handleStatusUpdate(appt._id, 'confirmed')} className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition">Accept</button>
                                            <button onClick={() => handleStatusUpdate(appt._id, 'cancelled')} className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition">Reject</button>
                                        </>
                                    )}
                                    <span className={`ml-auto font-bold text-sm uppercase px-2 py-1 rounded 
                                        ${appt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                            appt.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                        {appt.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Services Management */}
                <div>
                    <h2 className="text-xl font-bold mb-6">{editingId ? 'Edit Service' : 'Add New Service'}</h2>
                    <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-100 h-fit mb-8">
                        <form onSubmit={handleSubmitService} className="space-y-4">
                            <input type="text" placeholder="Service Name" className="w-full p-2 border rounded"
                                value={serviceForm.name} onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })} />

                            <select className="w-full p-2 border rounded"
                                value={serviceForm.category} onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}>
                                <option>Cleaning</option>
                                <option>Medical</option>
                                <option>Repair</option>
                            </select>

                            <textarea placeholder="Description" className="w-full p-2 border rounded"
                                value={serviceForm.description} onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })} />

                            <div className="flex gap-4">
                                <input type="number" placeholder="Price" className="w-full p-2 border rounded"
                                    value={serviceForm.price} onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })} />
                                <input type="number" placeholder="Duration (min)" className="w-full p-2 border rounded"
                                    value={serviceForm.duration} onChange={(e) => setServiceForm({ ...serviceForm, duration: e.target.value })} />
                            </div>

                            <button className="w-full bg-indigo-600 text-white py-2 rounded font-bold hover:bg-indigo-700 transition">
                                {editingId ? 'Update Service' : 'Add Service'}
                            </button>
                            {editingId && (
                                <button type="button" onClick={() => { setEditingId(null); setServiceForm({ name: '', description: '', category: 'Cleaning', price: '', duration: 60 }) }} className="w-full text-slate-500 py-2">
                                    Cancel
                                </button>
                            )}
                        </form>
                    </div>

                    <h2 className="text-xl font-bold mb-4">My Services</h2>
                    <div className="space-y-4">
                        {myServices.length === 0 && <p className="text-slate-500">No services added yet.</p>}
                        {myServices.map((service) => (
                            <div key={service._id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-100 flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold">{service.name}</h3>
                                    <p className="text-sm text-slate-500">${service.price} • {service.duration} mins</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEditClick(service)} className="text-blue-500 hover:text-blue-700" title="Edit Service">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                    </button>
                                    <button onClick={() => handleDeleteService(service._id)} className="text-slate-400 hover:text-red-600">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProviderDashboard;
