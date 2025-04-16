// src/pages/EnclosureReport.js
import React, { useEffect, useState} from 'react';
import axios from 'axios';

const EnclosureReport = () => {
    const [reportData, setReportData] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // filter state
    const [filters, setFilters] = useState({
        type: '',
        minCapacity: '',
        maxCapacity: '',
        vetAfter: '',
        vetBefore: ''
    });

    const handleChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value
        })
    };

    const fetchReport = async () => {
        setLoading(true);
        setError(null);

        try {

            const params = new URLSearchParams();
            if (filters.type) params.append('type', filters.type);
            if (filters.minCapacity) params.append('minCapacity', filters.minCapacity);
            if (filters.maxCapacity) params.append('maxCapacity', filters.maxCapacity);
            if (filters.vetAfter) params.append('vetAfter', filters.vetAfter);  
            if (filters.vetBefore) params.append('vetBefore', filters.vetBefore);

            const response = await axios.get(`/api/enclosures/report?${params.toString()}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            setReportData(response.data);

        } catch (err) {
            console.error('Error fetching report:', err);
            setError('Failed to fetch report. Try again.');
        } finally {
            setLoading(false);
        }
    };

    // load initial report
    useEffect(() => {
        fetchReport();
    }, []);

    

    return (
        <div className="bg-gray-100 min-h-screen pt-20">
            <div className="container mx-auto px-4 py-12">
                <h1 className="text-3xl font-bold mb-6 font-['Roboto_Flex']">Enclosure Report</h1>

                {/* filter options */}
                <div className="bg-white p-6 rounded shadow-md mb-8">
                    <h3 className="text-xl font-semibold mb-4 font-['Mukta_Mahee']">Filter By</h3>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 font-['Mukta_Mahee']">
                            Enclosure Type
                        </label>
                        <select
                            name="type"
                            value={filters.type}
                            onChange={handleChange}
                            className="w-full border border-gray-300 p-2 rounded font-['Lora']"
                        >
                            <option value="">All</option>
                            <option value="Mammal">Mammal</option>
                            <option value="Avian">Avian</option>
                            <option value="Reptile">Reptile</option>
                            <option value="Amphibian">Amphibian</option>
                            <option value="Aquatic">Aquatic</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 font-['Mukta_Mahee']">Min Capacity %</label>
                        <input 
                            type="number"
                            name="minCapacity"
                            value={filters.minCapacity}
                            onChange={handleChange}
                            placeholder="e.g. 50"
                            className="w-full border border-gray-300 p-2 rounded font-['Lora']"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 font-['Mukta_Mahee']">Max Capacity %</label>
                        <input
                            type="number"
                            name="maxCapacity"
                            value={filters.maxCapacity}
                            onChange={handleChange}
                            placeholder="e.g. 100"
                            className="w-full border border-gray-300 p-2 rounded font-['Lora']"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 font-['Mukta_Mahee']">Vet Checkup From</label>
                        <input
                            type="date"
                            name="vetAfter"
                            value={filters.vetAfter || ""}
                            onChange={handleChange}
                            className="w-full border border-gray-300 p-2 rounded font-['Lora']"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 font-['Mukta_Mahee']">Vet Checkup To</label>
                        <input
                            type="date"
                            name="vetBefore"
                            value={filters.vetBefore || ""}
                            onChange={handleChange}
                            className="w-full border border-gray-300 p-2 rounded font-['Lora']"
                        />
                    </div>

                </div>
                {/* button */}
                <div className="mt-4">
                    <button onClick={fetchReport} className="bg-green-600 text-white px-4 py-2 rounded font-['Mukta_Mahee']">
                        Generate Report
                    </button>
                </div>
            </div>

            {/* display report */}
            {loading && <p className="text-gray-700 font-['Lora']">Loading report...</p>}
            {error && <p className="text-red-600 font-['Lora']">{error}</p>}
            {!loading && !error && Object.entries(reportData).map(([type, enclosures]) => (
                <div key={type} className="mb-12">
                    <h2 className="text-2xl font-bold mb-4 font-['Roboto_Flex']">Section: {type} </h2>
                    <div>
                        {Object.entries(enclosures).map(([id, enclosure]) => (
                            <div  key={id} className="bg-white p-6 rounded shadow border">
                                <h3 className="text-xl font-semibold mb-2 font-['Mukta_Mahee']">[Enclosure: "{enclosure.Name}"]</h3>
                                <ul>
                                    <li>Type: {enclosure.Type} | Location: {enclosure.Location} | Capacity: {enclosure.Capacity}</li>
                                    
                                    <li>
                                        Health Summary: {" "}
                                        {Object.entries(enclosure.HealthBreakdown).map(([status, count]) => 
                                            `${count} ${status}`).join(" | ")
                                        }
                                    </li>
                                </ul>

                                {/* if vet filters are active dont show capacity */}
                                <div className="bg-gray-50 p-3 rounded shadow-sm mb-4">
                                    {filters.vetAfter || filters.vetBefore ? (
                                        <p className="text-sm text-gray-900">
                                            {enclosure.Animals.length > 0
                                            ? `Showing ${enclosure.Animals.length} animal${enclosure.Animals.length > 1 ? 's' : ''} with a vet checkup in that period.`
                                            : "No animals had a vet checkup in the specified date range."}
                                        </p>
                                    ) : (
                                        <p className="text-sm text-gray-900">
                                        Capacity Usage: <strong>{enclosure.CapacityUsage}%</strong>
                                        </p>
                                    )}
                                </div>
                                {/* animal tables for enclosure */}

                                <table className="table-auto w-full text-left border border-collapse font-['Lora'] text-sm">
                                        <thead>
                                            <tr className="bg-gray-200">
                                                <th className="border px-4 py-2">Name</th>
                                                <th className="border px-4 py-2">Animal ID</th>
                                                <th className="border px-4 py-2">Species</th>
                                                <th className="border px-4 py-2">Gender</th>
                                                <th className="border px-4 py-2">Health</th>
                                                <th className="border px-4 py-2">Danger Level</th>
                                                <th className="border px-4 py-2">Last Vet Checkup</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {enclosure.Animals.length > 0 ? (
                                                enclosure.Animals.map(animal => (
                                                    <tr key={animal.AnimalID}>
                                                        <td className="border px-4 py-1">{animal.Name}</td>
                                                        <td className="border px-4 py-1">{animal.AnimalID}</td>
                                                        <td className="border px-4 py-1">{animal.Species}</td>
                                                        <td className="border px-4 py-1">{animal.Gender}</td>
                                                        <td className="border px-4 py-1">{animal.HealthStatus}</td>
                                                        <td className="border px-4 py-1">{animal.DangerLevel}</td>
                                                        <td className="border px-4 py-1">
                                                            {animal.LastVetCheckup ? new Date(animal.LastVetCheckup).toLocaleDateString() : "N/A"}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="3" className="text-center text-gray-500 border px-4 py-2">
                                                        No animals in this enclosure.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                </table>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>

    );

};

export default EnclosureReport;