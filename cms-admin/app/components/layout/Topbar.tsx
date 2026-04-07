import { Bell, User } from 'lucide-react';

export default function Topbar() {
  return (
    <header className="bg-white h-16 flex items-center justify-between px-8 shadow-sm border-b border-gray-200 z-10">
      <div className="text-lg font-semibold text-gray-800">
        Admin Panel
      </div>
      
      <div className="flex items-center gap-6">
        <button className="text-gray-500 hover:text-blue-600 transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        
        <div className="flex items-center gap-3 border-l pl-6 border-gray-200">
          <div className="flex flex-col text-right">
            <span className="text-sm font-semibold text-gray-800">Admin Glowear</span>
            <span className="text-xs text-gray-500">admin@glowear.com</span>
          </div>
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
            <User size={20} />
          </div>
        </div>
      </div>
    </header>
  );
}