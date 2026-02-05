import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const ProviderList = () => {
    const params = useParams();
    // Handle case where categoryName might be undefined (if route is /services) or 'all'
    const categoryName = params.categoryName || 'all';

    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                // Fetch services by category (or all if category is 'all')
                // If categoryName is undefined or 'all', we want ALL services -> /api/services
                let url = '/services';

                if (categoryName && categoryName !== 'all') {
                    url += `?category=${categoryName}`;
                }

                console.log(`Fetching services from: ${url}`); // Debug Log

                const { data } = await axios.get(url);
                console.log("Fetched Services:", data); // Debug Log
                setServices(data);
            } catch (error) {
                console.error("Failed to fetch services", error);
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, [categoryName]);

    if (loading) return <div className="p-10 text-center text-indigo-600 font-semibold text-lg">Loading services...</div>;

    const displayTitle = categoryName === 'all' ? 'All Services' : `${categoryName} Services`;

    return (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 mt-16">
            <h1 className="text-3xl font-extrabold text-slate-800 mb-8 capitalize">
                {displayTitle}
            </h1>

            {services.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-100">
                    <p className="text-xl text-slate-500">No professionals found in this category yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map((service) => (
                        <div key={service._id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100 flex flex-col group">
                            <div className="p-6 flex flex-col items-center border-b border-slate-50 bg-slate-50/50">
                                {/* Profile Placeholder */}
                                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center mb-4 text-2xl font-bold text-indigo-600 shadow-inner">
                                    {service.providerId?.name?.charAt(0) || 'P'}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 text-center">{service.providerId?.name || 'Unknown Provider'}</h3>
                                <div className="flex items-center gap-2 mt-2 text-sm text-slate-500">
                                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold">Verified</span>
                                    <span>•</span>
                                    <span>{service.name}</span>
                                </div>
                            </div>

                            <div className="p-6 flex-1 flex flex-col">
                                <p className="text-slate-600 mb-6 text-sm flex-1 line-clamp-3 leading-relaxed">
                                    {service.description || "No description provided."}
                                </p>

                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Price</span>
                                        <span className="text-xl font-bold text-slate-900">${service.price}</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Duration</span>
                                        <span className="text-sm font-medium text-slate-700">{service.duration} mins</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-slate-50">
                                <Link
                                    to={`/book/${service._id}`}
                                    className="block w-full text-center bg-indigo-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-indigo-700 transition-all shadow-md hover:shadow-indigo-200"
                                >
                                    Book Now
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProviderList;
