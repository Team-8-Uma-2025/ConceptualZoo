// src/components/StaffCard.js
import React, { useState } from 'react';
import { User } from 'lucide-react';

// neatly displays the staff that works in a designated attraction in cards
const StaffCard = ({ staff }) => {
    return (
        <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition duration-300">
            <div className="p-4">
                <h3 className="text-xl font-semibold mb-2 text-gray-800 font-['Mukta_Mahee']">{staff.NAME}</h3>

                <div className="text-sm text-gray-500 font-['Lora']">
                    Staff ID: {staff.StaffID}
                </div>

                {/* If manager show show they are manager next to their role */}
                <div className="mb-2 flex items-center text-gray-600 font-['Lora']">
                    <User className="w-4 h-4 mr-2" />
                    Role: {staff.StaffType} {staff.Role === 'Manager' && '(Manager)'} 
                </div>

                <div className="text-sm text-gray-500 font-['Lora']">
                    Staff Type: {staff.StaffType}
                </div>

                <div className="text-sm text-gray-500 font-['Lora']">
                    Role: {staff.Role}
                </div>

                <div className="text-sm text-gray-500 font-['Lora']">
                    Assigned Date: {new Date(staff.AssignedDate).toLocaleDateString()}
                </div>
            </div>
        </div>
    );
};

export default StaffCard;