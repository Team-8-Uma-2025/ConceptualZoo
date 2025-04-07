import React from "react";
import { Link } from "react-router-dom";

const dashboardItems = [
  {
    title: "Overview",
    icon: "dashboard",
    path: "/staff/overview",
    description: "Dashboard overview",
  },
  {
    title: "Customer Support",
    icon: "support",
    path: "/staff/support",
    description: "Customer service tools",
  },
  // ...other dashboard items remain...
];

const StaffDashboard = () => {
  return (
    <div className="staff-dashboard">
      <h1>Staff Dashboard</h1>
      <ul>
        {dashboardItems.map((item, index) => (
          <li key={index}>
            <Link to={item.path}>
              <i className={`icon-${item.icon}`}></i>
              {item.title}
            </Link>
            <p>{item.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StaffDashboard;
