import React from 'react';
import { User } from 'lucide-react';

// Displays the staff data in a card format. If selectable is true,
// a checkbox is rendered on the top-right to allow selection.
const StaffCard = ({ staff, selectable = false, isSelected = false, onSelect }) => {
  const handleCheckboxChange = (e) => {
    if (onSelect) {
      onSelect(staff, e.target.checked);
    }
  };

  return (
    <div className="relative bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition duration-300">
      {selectable && (
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleCheckboxChange}
          className="absolute top-2 right-2 form-checkbox h-5 w-5"
        />
      )}
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2 text-gray-800 font-['Mukta_Mahee']">{staff.NAME}</h3>

        <div className="text-sm text-gray-500 font-['Lora']">
          Staff ID: {staff.StaffID}
        </div>

        {/* If manager, show they are manager next to their role */}
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
