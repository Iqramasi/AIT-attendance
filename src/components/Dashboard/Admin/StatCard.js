"use client";

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-white/20">
    <div className="flex items-center">
      <div className={`p-3 rounded-2xl bg-gradient-to-br ${color} shadow-lg`}>
        {icon}
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl sm:text-3xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

export default StatCard;
