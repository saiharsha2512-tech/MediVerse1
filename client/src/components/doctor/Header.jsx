import { FiMenu, FiBell, FiSearch } from 'react-icons/fi';
import { useDoctorAuth } from '../../context/doctor/DoctorAuthContext';
import { Link } from 'react-router-dom';

const Header = ({ sidebarOpen, setSidebarOpen }) => {
  const { doctor } = useDoctorAuth();

  return (
    <header className="flex items-center justify-between h-[72px] px-6 bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-4">
        <button
          className="lg:hidden text-gray-500 hover:text-blue-600 focus:outline-none transition-colors"
          onClick={() => setSidebarOpen(true)}
        >
          <FiMenu className="w-6 h-6" />
        </button>
        
        {/* Search Bar */}
        <div className="hidden md:flex items-center bg-gray-50 rounded-full px-4 py-2 border border-gray-100 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          <FiSearch className="text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search patients, appointments..." 
            className="bg-transparent border-none focus:outline-none ml-2 text-sm w-64 text-gray-700"
          />
        </div>
      </div>

      <div className="flex items-center gap-5">
        <button className="relative p-2 text-gray-400 hover:text-blue-600 transition-colors bg-gray-50 rounded-full hover:bg-blue-50">
          <FiBell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <Link to="/doctor/profile" className="flex items-center gap-3 pl-5 border-l border-gray-100">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-gray-800">Dr. {doctor?.name || 'Loading...'}</p>
            <p className="text-xs text-gray-500 font-medium">{doctor?.specialty || doctor?.specialization || 'Doctor'}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
            {doctor?.image ? (
              <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-blue-600 font-bold text-sm">{doctor?.name ? doctor.name.charAt(0) : 'D'}</span>
            )}
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Header;
