import { useNavigate } from 'react-router'
import Typical from 'react-typical';
import coderGif from './assets/coder.gif';
import { FaGithub, FaLinkedin, FaDiscord } from 'react-icons/fa';
import giphyGif from './assets/giphy.gif';

const testimonials = [
  {
    text: 'Code Mon helped me crack my first coding interview!',
    name: 'Priya, IIIT-G',
    img: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    text: 'Best online code platform I\'ve used.',
    name: 'Arjun, NITK',
    img: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    text: 'The AI feedback is a game changer!',
    name: 'Sara, CSE Student',
    img: 'https://randomuser.me/api/portraits/women/65.jpg',
  },
];

const features = [
  { icon: '🚀', title: 'Live Code Editor', desc: 'Write, run, and test code instantly in multiple languages.' },
  { icon: '🧠', title: 'AI Code Review', desc: 'Get instant AI-powered feedback and suggestions.' },
  { icon: '📊', title: 'Submission History', desc: 'Track your progress and view past submissions.' },
  { icon: '🗂️', title: 'Diverse Problem Set', desc: 'Solve a wide range of curated problems.' },
];

const roadmap = [
  { track: 'Beginner', tags: ['DSA', 'OOP', 'Logic'] },
  { track: 'Intermediate', tags: ['SQL', 'Frontend', 'Backend'] },
  { track: 'Advanced', tags: ['System Design', 'AI', 'Competitive'] },
];

function Intro_Website() {
  const navigate = useNavigate();

  function go_to_prob_list() {
    navigate("/problems")
  }

  return (
    <div className="min-h-screen font-sans bg-gradient-to-br from-[#e0f7fa] via-[#f0f4ff] to-[#fce4ec] overflow-x-hidden">
      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-center py-16 px-4 gap-8 relative">
        <div className="max-w-xl flex-1 z-10">
          <h1 className="text-5xl sm:text-6xl font-extrabold mb-2 bg-gradient-to-r from-purple-700 to-pink-500 bg-clip-text text-transparent">
            Welcome to Code Mon
          </h1>
          <Typical
            steps={['Where coding challenges transform into solutions...', 2000]}
            loop={Infinity}
            wrapper="p"
            className="text-lg sm:text-xl text-gray-700 mb-6 mt-2 min-h-[2.5rem]"
          />
          <button
            className="bg-gradient-to-r from-purple-700 to-pink-500 text-white px-8 py-3 rounded-xl shadow-lg font-semibold hover:scale-105 transition mb-8"
            onClick={go_to_prob_list}
          >
            Start Solving
          </button>
        </div>
        <div className="flex-1 flex justify-center items-center z-10">
          <img src={coderGif} alt="Coding Boy" style={{ width: 320, height: 320 }} className="rounded-xl shadow-lg object-contain" />
        </div>
        {/* Animated background blobs */}
        <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
          <div className="absolute w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob1" style={{ top: '-6rem', left: '-6rem' }} />
          <div className="absolute w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob2" style={{ top: '10rem', right: '-6rem' }} />
          <div className="absolute w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob3" style={{ bottom: '-6rem', left: '30%' }} />
        </div>
      </section>

      {/* Why Code Mon Section */}
      <section className="max-w-4xl mx-auto py-8 px-4">
        <h2 className="text-3xl font-bold mb-4 text-center">🔍 Why Choose Code Mon?</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-lg">
          <li>🌐 Practice coding in real-time with our fast code editor.</li>
          <li>🤖 Get instant AI feedback to improve your logic and code quality.</li>
          <li>🧠 Tackle interview-level problems with real-world relevance.</li>
          <li>🔥 Compete in weekly coding battles and climb the leaderboard.</li>
        </ul>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto py-8 px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {features.map((f) => (
          <div key={f.title} className="card bg-white rounded-2xl shadow-lg p-6 text-center transition-transform duration-200 hover:scale-105 hover:shadow-2xl border border-blue-100">
            <h4 className="text-3xl mb-2">{f.icon}</h4>
            <h5 className="font-bold text-lg mb-1 text-blue-700">{f.title}</h5>
            <p className="text-gray-600 text-sm">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Testimonials Section */}
      <section className="max-w-4xl mx-auto py-8 px-4">
        <h3 className="text-2xl font-bold mb-6 text-center">💬 What Users Say</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-white rounded-xl shadow p-6 flex flex-col items-center text-center border border-blue-100">
              <img src={t.img} alt={t.name} className="w-16 h-16 rounded-full mb-3 object-cover" />
              <p className="italic text-gray-700 mb-2">&quot;{t.text}&quot;</p>
              <span className="font-semibold text-blue-700">{t.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Explore / Roadmap Section */}
      <section className="max-w-4xl mx-auto py-8 px-4">
        <h3 className="text-2xl font-bold mb-4 text-center">🧭 Where to Start?</h3>
        <div className="flex flex-col md:flex-row gap-6 justify-center">
          {roadmap.map((r) => (
            <div key={r.track} className="bg-white rounded-xl shadow p-6 flex-1 text-center border border-blue-100">
              <h4 className="font-bold text-lg mb-2 text-purple-700">{r.track} Track</h4>
              <div className="flex flex-wrap gap-2 justify-center">
                {r.tags.map((tag) => (
                  <span key={tag} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold shadow">{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Gamification Teaser */}
      <section className="max-w-4xl mx-auto py-8 px-4 text-center">
        <h3 className="text-2xl font-bold mb-2">Level Up with XP 💎 <span className="text-sm text-gray-500">– coming soon!</span></h3>
        <div className="flex flex-wrap gap-4 justify-center mt-4">
          <span className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full font-semibold shadow">🏅 First Submission</span>
          <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold shadow">🎯 10 Problems Solved</span>
          <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-semibold shadow">🔥 Weekly Winner</span>
        </div>
        <div className="flex justify-center mt-6">
          <img src={giphyGif} alt="Fun coding gif" className="w-64 h-40 object-cover rounded-xl shadow-lg border-4 border-pink-200" />
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-8 bg-white/80 border-t border-blue-100 flex flex-col items-center relative z-10 mt-8">
        <div className="flex gap-6 mb-2">
          <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-black text-2xl"><FaGithub /></a>
          <a href="https://linkedin.com/" target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:text-blue-900 text-2xl"><FaLinkedin /></a>
          <a href="https://discord.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-900 text-2xl"><FaDiscord /></a>
        </div>
        <div className="mb-2">
          <a href="#" className="text-gray-500 hover:text-black mx-2">About Us</a>|
          <a href="#" className="text-gray-500 hover:text-black mx-2">Contact</a>|
          <a href="#" className="text-gray-500 hover:text-black mx-2">Privacy Policy</a>
        </div>
        <span className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} Code Mon. All rights reserved.</span>
      </footer>

      {/* Animations (Tailwind custom classes) */}
      <style>{`
        @keyframes blob1 { 0%,100%{transform:translateY(0) scale(1);} 50%{transform:translateY(-30px) scale(1.1);} }
        .animate-blob1 { animation: blob1 8s infinite ease-in-out; }
        @keyframes blob2 { 0%,100%{transform:translateY(0) scale(1);} 50%{transform:translateY(30px) scale(1.05);} }
        .animate-blob2 { animation: blob2 10s infinite ease-in-out; }
        @keyframes blob3 { 0%,100%{transform:translateX(0) scale(1);} 50%{transform:translateX(40px) scale(1.08);} }
        .animate-blob3 { animation: blob3 12s infinite ease-in-out; }
      `}</style>
    </div>
  )
}

export default Intro_Website