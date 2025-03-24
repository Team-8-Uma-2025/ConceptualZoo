import React, { useState, useEffect } from 'react';
import axios from 'axios';

// notes for me: 
// useState is for keeping track of states
// useEffect controls when to fetch
// axios is to fetch data(used inside useEffect)

const EnclosureList = () => {

    // store enclosures fetched from backend
    const [enclosures, setEnclosures] = useState([]); 

    // Fetch enclosure data
    useEffect(() => {
        axios.get('http://localhost:5000/api/enclosures')
            .then(response => {
                setEnclosures(response.data); // sets data
            })
            .catch(error => {
                console.error(`error fetching enclosures:`, error);
            });
    }, []); // run once 

    return (
        <div className='min-h-screen bg-white pt-20'>
            <h1>Enclosure List</h1>
            <table>
                <thead>
                    <tr>
                        <th>Enclosure ID</th>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Capacity</th>
                        <th>Location</th>
                    </tr>
                </thead>
                <tbody>
                    {/*add table rows with data*/}
                    {enclosures.map((enclosure) => (
                        <tr key={enclosure.EnclosureID}>
                            <td>{enclosure.EnclosureID}</td>
                            <td>{enclosure.Name}</td>
                            <td>{enclosure.Type}</td>
                            <td>{enclosure.Capacity}</td>
                            <td>{enclosure.Location}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default EnclosureList;