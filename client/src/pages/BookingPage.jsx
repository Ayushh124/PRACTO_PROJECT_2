import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from '../context/AuthContext';

const BookingPage = () => {
    const { serviceId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [service, setService] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [takenSlots, setTakenSlots] = useState([]);
    const [availableSlots, setAvailableSlots] = useState([]);

    // Add missing state variables
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchService = async () => {
            try {
                const { data } = await axios.get(`/services/${serviceId}`);
                setService(data);
            } catch (error) {
                setError('Service not found');
            }
        };
        if (serviceId) {
            fetchService();
        }
    }, [serviceId]);

    // Fetch AVAILABLE slots when provider or date changes
    useEffect(() => {
        const fetchAvailableSlots = async () => {
            if (service?.providerId?._id && selectedDate) {
                setLoading(true);
                try {
                    const { data } = await axios.get('/appointments/available-slots', {
                        params: {
                            providerId: service.providerId._id,
                            date: selectedDate.toISOString()
                        }
                    });

                    if (data.message) {
                        // e.g. "Provider is on holiday"
                        setError(data.message);
                        setAvailableSlots([]);
                    } else {
                        setAvailableSlots(data.slots || []);
                        setError('');
                    }
                } catch (error) {
                    console.error("Failed to fetch slots", error);
                    setError('Failed to load availability');
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchAvailableSlots();
    }, [service, selectedDate]);

    const handleBook = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (!selectedSlot) {
            setError('Please select a time slot');
            return;
        }

        setError('');
        setLoading(true);

        try {
            await axios.post('/appointments', {
                serviceId,
                date: selectedDate,
                timeSlot: selectedSlot
            });
            alert('Booking Confirmed!');
            navigate('/dashboard');
        } catch (error) {
            setError(error.response?.data?.message || 'Booking failed');
        } finally {
            setLoading(false);
        }
    };

    if (!service) return <div className="min-h-screen flex items-center justify-center text-indigo-600 font-bold">Loading Service Details...</div>;

    return (
        <div className="max-w-3xl mx-auto py-12 px-4 mt-16">
            <h1 className="text-3xl font-bold mb-2 text-slate-900">Book Appointment</h1>
            <p className="text-xl text-slate-600 mb-8 font-medium">
                {service.name} <span className="text-slate-400">with</span> {service.providerId?.name}
            </p>

            <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
                <div className="mb-8">
                    <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">Select Date</label>
                    <div className="relative">
                        <DatePicker
                            selected={selectedDate}
                            onChange={(date) => { setSelectedDate(date); setSelectedSlot(null); }}
                            minDate={new Date()}
                            className="p-3 border border-slate-200 rounded-xl w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="mb-8">
                    <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">Select Time</label>

                    {availableSlots.length === 0 ? (
                        <div className="text-slate-500 italic p-4 bg-slate-50 rounded-lg text-center">
                            No available slots for this date.
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                            {availableSlots.map(slot => (
                                <button
                                    key={slot}
                                    onClick={() => setSelectedSlot(slot)}
                                    className={`py-3 px-4 rounded-xl text-sm font-bold transition-all 
                                    ${selectedSlot === slot
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105'
                                            : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-white hover:border-indigo-300 hover:text-indigo-600'
                                        }`}
                                >
                                    {slot}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        {error}
                    </div>
                )}

                <button
                    onClick={handleBook}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl hover:shadow-indigo-500/30 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Processing...' : 'Confirm Booking'}
                </button>
            </div>
        </div>
    );
};

export default BookingPage;
