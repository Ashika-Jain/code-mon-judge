import { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosConfig'; // Make sure this points to your axios config!
import { FaUserCircle, FaEnvelope, FaMedal, FaCheckCircle } from 'react-icons/fa';
import Navbar from './Navbar';

const badgeIcons = {
  first_submission: <FaMedal className="text-yellow-500" />,
  ten_solved: <FaCheckCircle className="text-green-500" />,
  // Add more mappings as needed
};

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get('/api/auth/profile')
      .then(res => {
        setUser(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (!user) return <div className="text-center text-red-500 mt-8">Failed to load profile.</div>;

  return (
    <div className="min-h-screen font-sans bg-gradient-to-br from-[#e0f7fa] via-[#f0f4ff] to-[#fce4ec] overflow-x-hidden">
      <Navbar />
      <section className="flex flex-col items-center justify-center py-12 px-4 min-h-[80vh]">
        <div className="w-full max-w-2xl bg-white/90 rounded-2xl shadow-2xl p-8 border border-blue-100 flex flex-col items-center mt-8">
          <h1 className="text-4xl font-extrabold mb-6 bg-gradient-to-r from-purple-700 to-pink-500 bg-clip-text text-transparent text-center">My Profile</h1>
          {/* Avatar */}
          {user.avatar ? (
            <img src={user.avatar} alt="User avatar" className="w-28 h-28 rounded-full shadow mb-4 object-cover" />
          ) : (
            <FaUserCircle className="w-28 h-28 text-blue-400 mb-4" />
          )}
          {/* Username & Email */}
          <h2 className="text-2xl font-bold mb-1 text-blue-700">{user.username}</h2>
          <div className="flex items-center text-gray-600 mb-6">
            <FaEnvelope className="mr-2" />
            <span>{user.email}</span>
          </div>
          {/* Stats */}
          <div className="flex gap-8 my-6 w-full justify-center">
            <div className="bg-blue-50 rounded-xl px-6 py-4 flex flex-col items-center border border-blue-100 shadow">
              <div className="text-xl font-bold text-blue-700">{user.stats.solved}</div>
              <div className="text-gray-500 text-sm">Solved</div>
            </div>
            <div className="bg-purple-50 rounded-xl px-6 py-4 flex flex-col items-center border border-purple-100 shadow">
              <div className="text-xl font-bold text-purple-700">{user.stats.submissions}</div>
              <div className="text-gray-500 text-sm">Submissions</div>
            </div>
            <div className="bg-green-50 rounded-xl px-6 py-4 flex flex-col items-center border border-green-100 shadow">
              <div className="text-xl font-bold text-green-700">{user.stats.accuracy}</div>
              <div className="text-gray-500 text-sm">Accuracy</div>
            </div>
          </div>
          {/* Badges */}
          <div className="w-full mb-6">
            <h3 className="text-lg font-semibold mb-2 text-blue-700">Badges</h3>
            <div className="flex gap-4 flex-wrap justify-center">
              {user.badges.length === 0 ? (
                <span className="text-gray-400 italic">No badges yet</span>
              ) : user.badges.map((badge, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-full shadow text-sm font-semibold border border-blue-200">
                  {badgeIcons[badge.type] || <FaMedal />} {badge.label}
                </div>
              ))}
            </div>
          </div>
          {/* Recent Submissions */}
          <div className="w-full">
            <h3 className="text-lg font-semibold mb-2 text-blue-700">Recent Submissions</h3>
            <div className="bg-white/90 rounded-xl shadow p-4 border border-blue-100">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-500 text-sm">
                    <th className="py-1">Problem</th>
                    <th className="py-1">Status</th>
                    <th className="py-1">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {user.recentSubmissions.length === 0 ? (
                    <tr><td colSpan={3} className="text-center text-gray-400 italic py-2">No submissions yet</td></tr>
                  ) : user.recentSubmissions.map((sub) => (
                    <tr key={sub.id} className="border-t">
                      <td className="py-1 font-medium">{sub.problem}</td>
                      <td className={`py-1 font-semibold ${sub.status === 'Accepted' ? 'text-green-600' : 'text-red-600'}`}>{sub.status}</td>
                      <td className="py-1 text-gray-500">{sub.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProfilePage;