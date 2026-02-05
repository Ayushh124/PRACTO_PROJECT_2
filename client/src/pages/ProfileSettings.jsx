import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProfileSettings = () => {
    const { user, login } = useAuth(); // login actually sets user state too
    const navigate = useNavigate();

    const [availability, setAvailability] = useState({
        startTime: user?.availability?.startTime || "09:00",
        endTime: user?.availability?.endTime || "17:00",
        slotDuration: user?.availability?.slotDuration || 60,
        holidays: user?.availability?.holidays?.join(', ') || ""
    });

    const handleChange = (e) => {
        setAvailability({ ...availability, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Convert holidays string back to array
            const holidaysArray = availability.holidays.split(',').map(s => s.trim()).filter(s => s);

            const payload = {
                availability: {
                    ...availability,
                    holidays: holidaysArray
                }
            };

            const { data } = await axios.put('/auth/profile', payload);
            alert('Settings Updated!');

            // Update context state properly (hacky way: re-login/set user logic or reload)
            // Ideally AuthContext has an 'updateUser' method. 
            // Since `login` updates state, we can simulate it if response structure matches.
            // Let's assume data returns full user object as per my controller.

            // Actually, best to reload or use specialized update function. 
            // For now, simple alert and redirect.
            localStorage.setItem('userInfo', JSON.stringify(data));
            window.location.reload();

        } catch (error) {
            console.error(error);
            alert('Failed to update settings');
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-12 px-4 mt-16">
            <h1 className="text-3xl font-bold mb-8">Profile & Availability Settings</h1>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Start Time (HH:MM)</label>
                        <input
                            type="time"
                            name="startTime"
                            value={availability.startTime}
                            onChange={handleChange}
                            className="w-full p-3 border border-slate-200 rounded-lg"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">End Time (HH:MM)</label>
                        <input
                            type="time"
                            name="endTime"
                            value={availability.endTime}
                            onChange={handleChange}
                            className="w-full p-3 border border-slate-200 rounded-lg"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Slot Duration (Minutes)</label>
                        <select
                            name="slotDuration"
                            value={availability.slotDuration}
                            onChange={handleChange}
                            className="w-full p-3 border border-slate-200 rounded-lg"
                        >
                            <option value={30}>30 Minutes</option>
                            <option value={60}>60 Minutes</option>
                            <option value={90}>90 Minutes</option>
                            <option value={120}>2 Hours</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Holidays (YYYY-MM-DD, comma separated)</label>
                        <textarea
                            name="holidays"
                            value={availability.holidays}
                            onChange={handleChange}
                            placeholder="2026-12-25, 2027-01-01"
                            className="w-full p-3 border border-slate-200 rounded-lg"
                        />
                    </div>

                    <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition">
                        Save Settings
                    </button>

                    <button type="button" onClick={() => navigate('/dashboard')} className="w-full text-slate-500 py-3 font-bold hover:text-slate-700">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProfileSettings;
