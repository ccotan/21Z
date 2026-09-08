--- src/App.tsx (原始)
import { useState, useEffect, useRef, useCallback } from 'react';

// Types
interface Student {
  id: string;
  name: string;
  group: string;
  color: string;
}

interface MarketItem {
  id: string;
  title: string;
  price: string;
  description: string;
  type: 'sell' | 'buy';
  seller: string;
  date: string;
}

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'other';
  time: string;
  name?: string;
}

interface Homework {
  id: string;
  subject: string;
  title: string;
  description: string;
  deadline: string;
  teacher: string;
}

interface Complaint {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'pending' | 'resolved';
  date: string;
  author: string;
}

interface Teacher {
  id: string;
  name: string;
  subject: string;
  info: string;
  email: string;
  color: string;
}

// Colors for avatars
const avatarColors = [
  'linear-gradient(135deg, #ff4444, #ff6666)',
  'linear-gradient(135deg, #44ff88, #66ffaa)',
  'linear-gradient(135deg, #4488ff, #66aaff)',
  'linear-gradient(135deg, #ff44aa, #ff66cc)',
  'linear-gradient(135deg, #ffaa44, #ffcc66)',
  'linear-gradient(135deg, #aa44ff, #cc66ff)',
  'linear-gradient(135deg, #44ffdd, #66ffee)',
  'linear-gradient(135deg, #ff8844, #ffaa66)',
];

const getRandomColor = () => avatarColors[Math.floor(Math.random() * avatarColors.length)];

// SVG Icons as components
const Icons = {
  Home: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  Wheel: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="2" x2="12" y2="12"/>
      <line x1="12" y1="12" x2="19" y2="5"/>
      <line x1="12" y1="12" x2="5" y2="5"/>
      <line x1="12" y1="12" x2="12" y2="22"/>
      <line x1="12" y1="12" x2="19" y2="19"/>
      <line x1="12" y1="12" x2="5" y2="19"/>
      <line x1="12" y1="12" x2="2" y2="12"/>
      <line x1="12" y1="12" x2="22" y2="12"/>
    </svg>
  ),
  UserPlus: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="8.5" cy="7" r="4"/>
      <line x1="20" y1="8" x2="20" y2="14"/>
      <line x1="23" y1="11" x2="17" y2="11"/>
    </svg>
  ),
  Users: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  ShoppingBag: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
  ),
  MessageCircle: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
    </svg>
  ),
  Headphones: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/>
      <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
    </svg>
  ),
  Book: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  ),
  Clipboard: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
    </svg>
  ),
  AlertTriangle: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  Send: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"/>
      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  ),
  Trash: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    </svg>
  ),
  Menu: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  ),
  X: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Mail: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  ),
  Clock: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  Plus: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  Star: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Google: () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  ),
};

// Default teachers data
const defaultTeachers: Teacher[] = [
  { id: '1', name: 'Иванов А.П.', subject: 'Математика', info: 'Кандидат физ.-мат. наук, доцент. Стаж преподавания 15 лет. Специализация: высшая математика, линейная алгебра.', email: 'ivanov@uni.ru', color: avatarColors[0] },
  { id: '2', name: 'Петрова М.С.', subject: 'Физика', info: 'Доктор физических наук, профессор. Автор более 50 научных публикаций. Ведёт лабораторные работы.', email: 'petrova@uni.ru', color: avatarColors[1] },
  { id: '3', name: 'Сидоров В.К.', subject: 'Информатика', info: 'Кандидат технических наук. Разработчик с 10-летним опытом. Преподаёт программирование и алгоритмы.', email: 'sidorov@uni.ru', color: avatarColors[2] },
  { id: '4', name: 'Козлова Е.Н.', subject: 'Английский язык', info: 'Сертифицированный преподаватель CELTA. Опыт работы 8 лет. Подготовка к IELTS и TOEFL.', email: 'kozlova@uni.ru', color: avatarColors[3] },
];

// Default homework
const defaultHomework: Homework[] = [
  { id: '1', subject: 'Математика', title: 'Интегралы', description: 'Решить задачи №15-25 из учебника. Показать подробное решение.', deadline: '2026-02-15', teacher: 'Иванов А.П.' },
  { id: '2', subject: 'Физика', title: 'Лабораторная работа №4', description: 'Оформить отчёт по лабораторной работе. Ответить на контрольные вопросы.', deadline: '2026-02-12', teacher: 'Петрова М.С.' },
  { id: '3', subject: 'Информатика', title: 'Алгоритмы сортировки', description: 'Реализовать быструю сортировку и сортировку слиянием на Python. Написать тесты.', deadline: '2026-02-18', teacher: 'Сидоров В.К.' },
];

export default function App() {
  const [splashVisible, setSplashVisible] = useState(true);
  const [layoutVisible, setLayoutVisible] = useState(false);
  const [isAuth, setIsAuth] = useState(() => {
    return localStorage.getItem('quadrant_auth') === 'true';
  });
  const [authUser, setAuthUser] = useState(() => {
    const saved = localStorage.getItem('quadrant_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [currentPage, setCurrentPage] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Data states
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('quadrant_students');
    return saved ? JSON.parse(saved) : [];
  });
  const [marketItems, setMarketItems] = useState<MarketItem[]>(() => {
    const saved = localStorage.getItem('quadrant_market');
    return saved ? JSON.parse(saved) : [];
  });
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('quadrant_chat');
    return saved ? JSON.parse(saved) : [];
  });
  const [supportMessages, setSupportMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('quadrant_support');
    return saved ? JSON.parse(saved) : [
      { id: '1', text: 'Здравствуйте! Чем могу помочь?', sender: 'other' as const, time: '10:00', name: 'Поддержка' },
    ];
  });
  const [homeworks, setHomeworks] = useState<Homework[]>(() => {
    const saved = localStorage.getItem('quadrant_hw');
    return saved ? JSON.parse(saved) : defaultHomework;
  });
  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    const saved = localStorage.getItem('quadrant_complaints');
    return saved ? JSON.parse(saved) : [];
  });
  const [teachers] = useState<Teacher[]>(defaultTeachers);

  // Wheel state
  const [wheelRotation, setWheelRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelResult, setWheelResult] = useState<string | null>(null);

  // Save to localStorage
  useEffect(() => { localStorage.setItem('quadrant_students', JSON.stringify(students)); }, [students]);
  useEffect(() => { localStorage.setItem('quadrant_market', JSON.stringify(marketItems)); }, [marketItems]);
  useEffect(() => { localStorage.setItem('quadrant_chat', JSON.stringify(chatMessages)); }, [chatMessages]);
  useEffect(() => { localStorage.setItem('quadrant_support', JSON.stringify(supportMessages)); }, [supportMessages]);
  useEffect(() => { localStorage.setItem('quadrant_hw', JSON.stringify(homeworks)); }, [homeworks]);
  useEffect(() => { localStorage.setItem('quadrant_complaints', JSON.stringify(complaints)); }, [complaints]);

  // Splash screen
  useEffect(() => {
    const t1 = setTimeout(() => setSplashVisible(false), 2200);
    const t2 = setTimeout(() => setLayoutVisible(true), 2600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleLogin = (user: { name: string; email: string; avatar?: string }) => {
    setIsAuth(true);
    setAuthUser(user);
    localStorage.setItem('quadrant_auth', 'true');
    localStorage.setItem('quadrant_user', JSON.stringify(user));
    showToast(`Добро пожаловать, ${user.name}!`);
  };

  const handleLogout = () => {
    setIsAuth(false);
    setAuthUser(null);
    localStorage.removeItem('quadrant_auth');
    localStorage.removeItem('quadrant_user');
  };

  const navigate = (page: string) => {
    setCurrentPage(page);
    setSidebarOpen(false);
  };

  const spinWheel = () => {
    if (isSpinning || students.length < 2) return;
    setIsSpinning(true);
    setWheelResult(null);

    const extraSpins = 5 + Math.random() * 5;
    const randomAngle = Math.random() * 360;
    const newRotation = wheelRotation + extraSpins * 360 + randomAngle;
    setWheelRotation(newRotation);

    setTimeout(() => {
      const normalizedAngle = newRotation % 360;
      const sliceAngle = 360 / students.length;
      const index = Math.floor(((360 - normalizedAngle + sliceAngle / 2) % 360) / sliceAngle) % students.length;
      setWheelResult(students[index].name);
      setIsSpinning(false);
    }, 5200);
  };

  // Navigation items
  const navItems = [
    { id: 'home', label: 'Главная', icon: <Icons.Home /> },
    { id: 'wheel', label: 'Колесо Фортуны', icon: <Icons.Wheel /> },
    { id: 'register', label: 'Регистрация', icon: <Icons.UserPlus /> },
    { id: 'students', label: 'Студенты', icon: <Icons.Users /> },
    { id: 'market', label: 'Продажа / Покупка', icon: <Icons.ShoppingBag /> },
    { id: 'chat', label: 'Чат', icon: <Icons.MessageCircle /> },
    { id: 'support', label: 'Чат поддержки', icon: <Icons.Headphones /> },
    { id: 'wiki', label: 'Вики', icon: <Icons.Book /> },
    { id: 'homework', label: 'ДЗ', icon: <Icons.Clipboard /> },
    { id: 'complaints', label: 'Жалобы', icon: <Icons.AlertTriangle /> },
  ];

  // Show Auth page if not authenticated
  if (!isAuth) {
    return (
      <>
        <div className="background">
          <div className="bg-circle"></div>
          <div className="bg-circle"></div>
          <div className="bg-circle"></div>
          <div className="bg-circle"></div>
        </div>
        <AuthPage onLogin={handleLogin} />
        {toast && <div className="toast">{toast}</div>}
      </>
    );
  }

  return (
    <>
      {/* Background */}
      <div className="background">
        <div className="bg-circle"></div>
        <div className="bg-circle"></div>
        <div className="bg-circle"></div>
        <div className="bg-circle"></div>
      </div>

      {/* Splash */}
      <div className={`splash-screen ${!splashVisible ? 'hidden' : ''}`}>
        <div className="splash-icon">
          <div className="splash-square"></div>
          <div className="splash-square"></div>
          <div className="splash-square"></div>
          <div className="splash-square"></div>
        </div>
      </div>

      {/* Mobile menu button */}
      <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? <Icons.X /> : <Icons.Menu />}
      </button>

      {/* Sidebar overlay */}
      <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

      {/* Layout */}
      <div className={`app-layout ${layoutVisible ? 'visible' : ''}`}>
        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <div className="sidebar-logo">
              <div className="sidebar-logo-icon">
                <div className="sidebar-logo-square"></div>
                <div className="sidebar-logo-square"></div>
                <div className="sidebar-logo-square"></div>
                <div className="sidebar-logo-square"></div>
              </div>
              <span className="sidebar-logo-text">Quadrant</span>
            </div>
          </div>

          <nav className="sidebar-nav">
            <div className="nav-section-title">Основное</div>
            {navItems.slice(0, 4).map(item => (
              <button
                key={item.id}
                className={`sidebar-btn ${currentPage === item.id ? 'active' : ''}`}
                onClick={() => navigate(item.id)}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.id === 'students' && students.length > 0 && (
                  <span className="sidebar-badge">{students.length}</span>
                )}
              </button>
            ))}

            <div className="nav-section-title">Коммуникации</div>
            {navItems.slice(4, 7).map(item => (
              <button
                key={item.id}
                className={`sidebar-btn ${currentPage === item.id ? 'active' : ''}`}
                onClick={() => navigate(item.id)}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}

            <div className="nav-section-title">Учёба</div>
            {navItems.slice(7).map(item => (
              <button
                key={item.id}
                className={`sidebar-btn ${currentPage === item.id ? 'active' : ''}`}
                onClick={() => navigate(item.id)}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="sidebar-footer">
            <div className="sidebar-user">
              <div className="sidebar-user-avatar">{authUser?.name?.[0]?.toUpperCase() || 'Q'}</div>
              <div className="sidebar-user-info">
                <div className="sidebar-user-name">{authUser?.name || 'Студент'}</div>
                <div className="sidebar-user-role">Онлайн</div>
              </div>
            </div>
            <button className="sidebar-logout-btn" onClick={handleLogout} title="Выйти">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="main-area">
          {currentPage === 'home' && <HomePage navigate={navigate} />}
          {currentPage === 'wheel' && (
            <WheelPage
              students={students}
              wheelRotation={wheelRotation}
              isSpinning={isSpinning}
              wheelResult={wheelResult}
              spinWheel={spinWheel}
              setWheelResult={setWheelResult}
              navigate={navigate}
            />
          )}
          {currentPage === 'register' && <RegisterPage setStudents={setStudents} showToast={showToast} />}
          {currentPage === 'students' && <StudentsPage students={students} setStudents={setStudents} showToast={showToast} />}
          {currentPage === 'market' && <MarketPage items={marketItems} setItems={setMarketItems} showToast={showToast} />}
          {currentPage === 'chat' && <ChatPage messages={chatMessages} setMessages={setChatMessages} />}
          {currentPage === 'support' && <SupportPage messages={supportMessages} setMessages={setSupportMessages} />}
          {currentPage === 'wiki' && <WikiPage teachers={teachers} />}
          {currentPage === 'homework' && <HomeworkPage homeworks={homeworks} setHomeworks={setHomeworks} showToast={showToast} />}
          {currentPage === 'complaints' && <ComplaintsPage complaints={complaints} setComplaints={setComplaints} showToast={showToast} />}
        </main>
      </div>

      {/* Toast */}
      {toast && <div className="toast">{toast}</div>}
    </>
  );
}

// ============ HOME PAGE ============
function HomePage({ navigate }: { navigate: (p: string) => void }) {
  const pages = [
    { icon: <Icons.Wheel />, page: 'wheel', color: '#ff4444', gradient: 'linear-gradient(135deg, #ff4444, #ff6666)' },
    { icon: <Icons.ShoppingBag />, page: 'market', color: '#44ff88', gradient: 'linear-gradient(135deg, #44ff88, #66ffaa)' },
    { icon: <Icons.MessageCircle />, page: 'chat', color: '#4488ff', gradient: 'linear-gradient(135deg, #4488ff, #66aaff)' },
    { icon: <Icons.Headphones />, page: 'support', color: '#ff44aa', gradient: 'linear-gradient(135deg, #ff44aa, #ff66cc)' },
    { icon: <Icons.Book />, page: 'wiki', color: '#aa44ff', gradient: 'linear-gradient(135deg, #aa44ff, #cc66ff)' },
    { icon: <Icons.Clipboard />, page: 'homework', color: '#ffaa44', gradient: 'linear-gradient(135deg, #ffaa44, #ffcc66)' },
    { icon: <Icons.AlertTriangle />, page: 'complaints', color: '#ff8844', gradient: 'linear-gradient(135deg, #ff8844, #ffaa66)' },
    { icon: <Icons.UserPlus />, page: 'register', color: '#44ffdd', gradient: 'linear-gradient(135deg, #44ffdd, #66ffee)' },
    { icon: <Icons.Users />, page: 'students', color: '#88ff44', gradient: 'linear-gradient(135deg, #88ff44, #aaff66)' },
  ];

  return (
    <div className="page-enter">
      <div className="page-header">
        <h1 className="page-title">Quadrant</h1>
        <p className="page-subtitle">Выберите раздел</p>
      </div>

      <div className="home-icon-grid">
        {pages.map(item => (
          <div
            key={item.page}
            className="home-icon-card"
            onClick={() => navigate(item.page)}
            style={{
              background: item.gradient,
              boxShadow: `0 8px 32px ${item.color}40`
            }}
          >
            <div className="home-icon-inner" style={{ color: 'white' }}>
              {item.icon}
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: 32, fontSize: 32, fontWeight: 700, color: 'rgba(255, 255, 255, 0.9)', letterSpacing: '2px' }}>
        21Z
      </div>
    </div>
  );
}

// ============ WHEEL PAGE ============
function WheelPage({ students, wheelRotation, isSpinning, wheelResult, spinWheel, setWheelResult, navigate }: {
  students: Student[];
  wheelRotation: number;
  isSpinning: boolean;
  wheelResult: string | null;
  spinWheel: () => void;
  setWheelResult: (v: string | null) => void;
  navigate: (p: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    drawWheel();
  }, [students]);

  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas || students.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 10;
    const sliceAngle = (2 * Math.PI) / students.length;

    ctx.clearRect(0, 0, size, size);

    const colors = ['#ff4444', '#44ff88', '#4488ff', '#ff44aa', '#ffaa44', '#aa44ff', '#44ffdd', '#ff8844', '#88ff44', '#ff4466', '#44aaff', '#ffdd44'];

    students.forEach((student, i) => {
      const startAngle = i * sliceAngle - Math.PI / 2;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = 'white';
      ctx.font = 'bold 13px Inter, sans-serif';
      const name = student.name.split(' ')[0];
      ctx.fillText(name, radius - 20, 5);
      ctx.restore();
    });

    ctx.beginPath();
    ctx.arc(center, center, 25, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(20, 20, 20, 0.9)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  return (
    <div className="page-enter">
      <div className="page-header">
        <h1 className="page-title">Колесо Фортуны</h1>
        <p className="page-subtitle">Случайный выбор дежурного студента</p>
      </div>

      {students.length < 2 ? (
        <div className="empty-state">
          <Icons.Users />
          <p className="empty-state-text">Нужно минимум 2 студента для вращения колеса</p>
          <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('register')}>
            Зарегистрировать студентов
          </button>
        </div>
      ) : (
        <div className="wheel-container">
          <div className="wheel-wrapper">
            <div className="wheel-pointer" />
            <canvas
              ref={canvasRef}
              className="wheel-canvas"
              width={380}
              height={380}
              style={{ transform: `rotate(${wheelRotation}deg)` }}
            />
          </div>
          <button className="spin-btn" onClick={spinWheel} disabled={isSpinning}>
            {isSpinning ? 'Вращается...' : 'Крутить!'}
          </button>
        </div>
      )}

      {wheelResult && (
        <div className="result-overlay" onClick={() => setWheelResult(null)}>
          <div className="result-card" onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>Дежурный сегодня:</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: 'rgba(255,255,255,0.95)', marginBottom: 20 }}>{wheelResult}</div>
            <button className="btn-primary" onClick={() => setWheelResult(null)}>Закрыть</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ AUTH PAGE ============
function AuthPage({ onLogin }: { onLogin: (user: { name: string; email: string; avatar?: string }) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    if (mode === 'register' && !name) return;

    setLoading(true);
    setTimeout(() => {
      onLogin({
        name: mode === 'register' ? name : email.split('@')[0],
        email: email,
      });
      setLoading(false);
    }, 800);
  };

  const handleGoogleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      onLogin({
        name: 'Google User',
        email: 'user@gmail.com',
        avatar: 'G',
      });
      setLoading(false);
    }, 800);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <div className="auth-logo-square"></div>
            <div className="auth-logo-square"></div>
            <div className="auth-logo-square"></div>
            <div className="auth-logo-square"></div>
          </div>
          <h1 className="auth-title">Quadrant</h1>
          <p className="auth-subtitle">Платформа для студентов</p>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => setMode('login')}
          >
            Вход
          </button>
          <button
            className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => setMode('register')}
          >
            Регистрация
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'register' && (
            <div className="auth-field">
              <label className="auth-label">Имя</label>
              <input
                type="text"
                className="form-input"
                placeholder="Введите ваше имя"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="auth-field">
            <label className="auth-label">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="example@mail.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">Пароль</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Загрузка...' : mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </form>

        <div className="auth-divider">
          <span>или</span>
        </div>

        <button className="google-btn" onClick={handleGoogleLogin} disabled={loading}>
          <div style={{ width: 20, height: 20 }}>
            <Icons.Google />
          </div>
          <span>Войти через Google</span>
        </button>
      </div>
    </div>
  );
}

// ============ REGISTER PAGE ============
function RegisterPage({ setStudents, showToast }: { setStudents: React.Dispatch<React.SetStateAction<Student[]>>; showToast: (m: string) => void }) {
  const [name, setName] = useState('');
  const [group, setGroup] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !group.trim()) {
      showToast('Заполните все поля');
      return;
    }
    const newStudent: Student = {
      id: Date.now().toString(),
      name: name.trim(),
      group: group.trim(),
      color: getRandomColor(),
    };
    setStudents(prev => [...prev, newStudent]);
    setName('');
    setGroup('');
    showToast(`${name.trim()} зарегистрирован!`);
  };

  return (
    <div className="page-enter">
      <div className="page-header">
        <h1 className="page-title">Регистрация</h1>
        <p className="page-subtitle">Зарегистрируйте студента для участия в колесе</p>
      </div>

      <div className="card" style={{ maxWidth: 480 }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label className="form-label">ФИО студента</label>
            <input
              className="form-input"
              placeholder="Иванов Иван Иванович"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label className="form-label">Номер группы</label>
            <input
              className="form-input"
              placeholder="ИС-21"
              value={group}
              onChange={e => setGroup(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%' }}>
            Зарегистрировать
          </button>
        </form>
      </div>
    </div>
  );
}

// ============ STUDENTS PAGE ============
function StudentsPage({ students, setStudents, showToast }: { students: Student[]; setStudents: React.Dispatch<React.SetStateAction<Student[]>>; showToast: (m: string) => void }) {
  const deleteStudent = (id: string) => {
    const student = students.find(s => s.id === id);
    setStudents(prev => prev.filter(s => s.id !== id));
    if (student) showToast(`${student.name} удалён`);
  };

  return (
    <div className="page-enter">
      <div className="page-header">
        <h1 className="page-title">Студенты</h1>
        <p className="page-subtitle">Список зарегистрированных студентов ({students.length})</p>
      </div>

      {students.length === 0 ? (
        <div className="empty-state">
          <Icons.Users />
          <p className="empty-state-text">Пока нет зарегистрированных студентов</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {students.map(student => (
            <div key={student.id} className="student-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="student-avatar" style={{ background: student.color }}>
                  {student.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>{student.name}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Группа {student.group}</div>
                </div>
              </div>
              <button className="delete-btn" onClick={() => deleteStudent(student.id)}>
                <Icons.Trash />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ MARKET PAGE ============
function MarketPage({ items, setItems, showToast }: { items: MarketItem[]; setItems: React.Dispatch<React.SetStateAction<MarketItem[]>>; showToast: (m: string) => void }) {
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'sell' | 'buy'>('all');
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'sell' | 'buy'>('sell');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price.trim()) { showToast('Заполните название и цену'); return; }
    const item: MarketItem = {
      id: Date.now().toString(),
      title: title.trim(),
      price: price.trim(),
      description: description.trim(),
      type,
      seller: 'Вы',
      date: new Date().toLocaleDateString('ru-RU'),
    };
    setItems(prev => [item, ...prev]);
    setTitle(''); setPrice(''); setDescription('');
    setShowForm(false);
    showToast('Объявление добавлено!');
  };

  const filtered = items.filter(i => filter === 'all' || i.type === filter);

  return (
    <div className="page-enter">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Продажа / Покупка</h1>
          <p className="page-subtitle">Маркетплейс для студентов</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 16, height: 16 }}><Icons.Plus /></div>
          Разместить
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 24 }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label className="form-label">Название</label>
                <input className="form-input" placeholder="Учебник по мат. анализу" value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              <div>
                <label className="form-label">Цена</label>
                <input className="form-input" placeholder="500 ₽" value={price} onChange={e => setPrice(e.target.value)} />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label className="form-label">Описание</label>
              <textarea className="form-textarea" placeholder="Опишите товар..." value={description} onChange={e => setDescription(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div className="tabs" style={{ marginBottom: 0 }}>
                <button type="button" className={`tab-btn ${type === 'sell' ? 'active' : ''}`} onClick={() => setType('sell')}>Продажа</button>
                <button type="button" className={`tab-btn ${type === 'buy' ? 'active' : ''}`} onClick={() => setType('buy')}>Покупка</button>
              </div>
              <button type="submit" className="btn-primary">Опубликовать</button>
            </div>
          </form>
        </div>
      )}

      <div className="tabs">
        <button className={`tab-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>Все</button>
        <button className={`tab-btn ${filter === 'sell' ? 'active' : ''}`} onClick={() => setFilter('sell')}>Продажа</button>
        <button className={`tab-btn ${filter === 'buy' ? 'active' : ''}`} onClick={() => setFilter('buy')}>Покупка</button>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <Icons.ShoppingBag />
          <p className="empty-state-text">Нет объявлений</p>
        </div>
      ) : (
        <div className="card-grid">
          {filtered.map(item => (
            <div key={item.id} className="market-card">
              <div className="market-card-img">
                <div style={{ width: 48, height: 48, color: 'rgba(255,255,255,0.15)' }}><Icons.ShoppingBag /></div>
              </div>
              <div className="market-card-body">
                <span className={`market-tag ${item.type}`}>{item.type === 'sell' ? 'Продажа' : 'Покупка'}</span>
                <div className="market-card-title" style={{ marginTop: 8 }}>{item.title}</div>
                <div className="market-card-price">{item.price}</div>
                {item.description && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>{item.description}</div>}
                <div className="market-card-seller">{item.seller} • {item.date}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ CHAT PAGE ============
function ChatPage({ messages, setMessages }: { messages: ChatMessage[]; setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>> }) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const msg: ChatMessage = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: 'user',
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, msg]);
    setInput('');

    // Simulate reply
    setTimeout(() => {
      const replies = ['Понял, спасибо!', 'Хорошо, сделаем', 'Ок, договорились', 'Да, согласен', 'Интересная идея!'];
      const reply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: replies[Math.floor(Math.random() * replies.length)],
        sender: 'other',
        time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        name: 'Одногруппник',
      };
      setMessages(prev => [...prev, reply]);
    }, 1500);
  };

  return (
    <div className="page-enter">
      <div className="page-header">
        <h1 className="page-title">Чат</h1>
        <p className="page-subtitle">Общий чат группы</p>
      </div>

      <div className="chat-container">
        <div className="chat-header">
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #4488ff, #66aaff)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600, fontSize: 14 }}>Г</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>Группа ИС-21</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Общий чат</div>
          </div>
        </div>

        <div className="chat-messages">
          {messages.map(msg => (
            <div key={msg.id} className={`chat-msg ${msg.sender}`}>
              {msg.sender === 'other' && msg.name && (
                <div style={{ fontSize: 11, fontWeight: 600, color: '#66aaff', marginBottom: 4 }}>{msg.name}</div>
              )}
              <div>{msg.text}</div>
              <div className="chat-msg-time">{msg.time}</div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-area">
          <input
            className="chat-input"
            placeholder="Написать сообщение..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
          />
          <button className="chat-send-btn" onClick={sendMessage}>
            <Icons.Send />
          </button>
        </div>
      </div>
    </div>
  );
}

// ============ SUPPORT PAGE ============
function SupportPage({ messages, setMessages }: { messages: ChatMessage[]; setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>> }) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const msg: ChatMessage = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: 'user',
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, msg]);
    setInput('');

    setTimeout(() => {
      const replies = [
        'Спасибо за обращение! Мы рассмотрим ваш вопрос.',
        'Понял вашу проблему. Сейчас проверю и вернусь с ответом.',
        'Ваш вопрос принят. Ожидайте ответа в течение 24 часов.',
        'Здравствуйте! Чем могу помочь?',
        'Попробуйте очистить кэш браузера и обновить страницу.',
      ];
      const reply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: replies[Math.floor(Math.random() * replies.length)],
        sender: 'other',
        time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        name: 'Поддержка',
      };
      setMessages(prev => [...prev, reply]);
    }, 2000);
  };

  return (
    <div className="page-enter">
      <div className="page-header">
        <h1 className="page-title">Чат поддержки</h1>
        <p className="page-subtitle">Свяжитесь с администрацией</p>
      </div>

      <div className="chat-container">
        <div className="chat-header">
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #44ff88, #66ffaa)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <div style={{ width: 18, height: 18 }}><Icons.Headphones /></div>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>Техподдержка</div>
            <div style={{ fontSize: 11, color: '#44ff88' }}>● Онлайн</div>
          </div>
        </div>

        <div className="chat-messages">
          {messages.map(msg => (
            <div key={msg.id} className={`chat-msg ${msg.sender}`}>
              {msg.sender === 'other' && msg.name && (
                <div style={{ fontSize: 11, fontWeight: 600, color: '#44ff88', marginBottom: 4 }}>{msg.name}</div>
              )}
              <div>{msg.text}</div>
              <div className="chat-msg-time">{msg.time}</div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-area">
          <input
            className="chat-input"
            placeholder="Опишите вашу проблему..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
          />
          <button className="chat-send-btn" onClick={sendMessage} style={{ background: 'linear-gradient(135deg, #44ff88, #66ffaa)' }}>
            <Icons.Send />
          </button>
        </div>
      </div>
    </div>
  );
}

// ============ WIKI PAGE ============
function WikiPage({ teachers }: { teachers: Teacher[] }) {
  const [tab, setTab] = useState<'teachers' | 'info'>('teachers');

  return (
    <div className="page-enter">
      <div className="page-header">
        <h1 className="page-title">Вики</h1>
        <p className="page-subtitle">Информация о преподавателях и учебный справочник</p>
      </div>

      <div className="tabs">
        <button className={`tab-btn ${tab === 'teachers' ? 'active' : ''}`} onClick={() => setTab('teachers')}>Преподаватели</button>
        <button className={`tab-btn ${tab === 'info' ? 'active' : ''}`} onClick={() => setTab('info')}>Информация</button>
      </div>

      {tab === 'teachers' ? (
        <div className="card-grid">
          {teachers.map(teacher => (
            <div key={teacher.id} className="wiki-card">
              <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                <div className="teacher-avatar" style={{ background: teacher.color }}>
                  {teacher.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>{teacher.name}</div>
                  <div style={{ fontSize: 13, color: '#66aaff', fontWeight: 500 }}>{teacher.subject}</div>
                </div>
              </div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: 12 }}>{teacher.info}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                <div style={{ width: 14, height: 14 }}><Icons.Mail /></div>
                {teacher.email}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card-grid">
          {[
            { title: 'Учебный план', desc: 'Расписание занятий, сроки сессий, каникулы', color: '#4488ff' },
            { title: 'Библиотека', desc: 'Электронные ресурсы и учебные материалы', color: '#44ff88' },
            { title: 'Стипендии', desc: 'Информация о стипендиальных программах', color: '#ffaa44' },
            { title: 'Правила', desc: 'Правила внутреннего распорядка', color: '#ff4444' },
          ].map(item => (
            <div key={item.title} className="wiki-card" style={{ cursor: 'pointer' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${item.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color, marginBottom: 12 }}>
                <div style={{ width: 20, height: 20 }}><Icons.Book /></div>
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.9)', marginBottom: 6 }}>{item.title}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{item.desc}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ HOMEWORK PAGE ============
function HomeworkPage({ homeworks, setHomeworks, showToast }: { homeworks: Homework[]; setHomeworks: React.Dispatch<React.SetStateAction<Homework[]>>; showToast: (m: string) => void }) {
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [teacher, setTeacher] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !title.trim() || !deadline) { showToast('Заполните обязательные поля'); return; }
    const hw: Homework = {
      id: Date.now().toString(),
      subject: subject.trim(),
      title: title.trim(),
      description: description.trim(),
      deadline,
      teacher: teacher.trim(),
    };
    setHomeworks(prev => [hw, ...prev]);
    setSubject(''); setTitle(''); setDescription(''); setDeadline(''); setTeacher('');
    setShowForm(false);
    showToast('Задание добавлено!');
  };

  const deleteHw = (id: string) => {
    setHomeworks(prev => prev.filter(h => h.id !== id));
    showToast('Задание удалено');
  };

  const isUrgent = (deadline: string) => {
    const diff = new Date(deadline).getTime() - Date.now();
    return diff < 3 * 24 * 60 * 60 * 1000;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  };

  return (
    <div className="page-enter">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Домашние задания</h1>
          <p className="page-subtitle">Текущие задания и дедлайны</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 16, height: 16 }}><Icons.Plus /></div>
          Добавить
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 24 }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label className="form-label">Предмет *</label>
                <input className="form-input" placeholder="Математика" value={subject} onChange={e => setSubject(e.target.value)} />
              </div>
              <div>
                <label className="form-label">Дедлайн *</label>
                <input className="form-input" type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label className="form-label">Название *</label>
              <input className="form-input" placeholder="Задачи по интегралам" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label className="form-label">Описание</label>
              <textarea className="form-textarea" placeholder="Подробное описание задания..." value={description} onChange={e => setDescription(e.target.value)} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label className="form-label">Преподаватель</label>
              <input className="form-input" placeholder="Иванов А.П." value={teacher} onChange={e => setTeacher(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" className="btn-primary">Добавить задание</button>
              <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Отмена</button>
            </div>
          </form>
        </div>
      )}

      {homeworks.length === 0 ? (
        <div className="empty-state">
          <Icons.Clipboard />
          <p className="empty-state-text">Нет домашних заданий</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {homeworks.map(hw => (
            <div key={hw.id} className="hw-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span className="hw-subject">{hw.subject}</span>
                  <div className="hw-title">{hw.title}</div>
                  {hw.description && <div className="hw-desc">{hw.description}</div>}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div className={`hw-deadline ${isUrgent(hw.deadline) ? 'urgent' : ''}`}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 12, height: 12, display: 'inline-block' }}><Icons.Clock /></span>
                        {formatDate(hw.deadline)}
                      </span>
                    </div>
                    {hw.teacher && <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{hw.teacher}</span>}
                  </div>
                </div>
                <button className="delete-btn" onClick={() => deleteHw(hw.id)}>
                  <Icons.Trash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ COMPLAINTS PAGE ============
function ComplaintsPage({ complaints, setComplaints, showToast }: { complaints: Complaint[]; setComplaints: React.Dispatch<React.SetStateAction<Complaint[]>>; showToast: (m: string) => void }) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('general');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) { showToast('Заполните все поля'); return; }
    const complaint: Complaint = {
      id: Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      category,
      status: 'pending',
      date: new Date().toLocaleDateString('ru-RU'),
      author: 'Вы',
    };
    setComplaints(prev => [complaint, ...prev]);
    setTitle(''); setDescription(''); setCategory('general');
    setShowForm(false);
    showToast('Жалоба отправлена!');
  };

  const resolveComplaint = (id: string) => {
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: 'resolved' as const } : c));
    showToast('Жалоба отмечена как решённая');
  };

  return (
    <div className="page-enter">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Жалобы</h1>
          <p className="page-subtitle">Подайте обращение или просмотрите статус</p>
        </div>
        <button className="btn-danger" onClick={() => setShowForm(!showForm)} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 16, height: 16 }}><Icons.AlertTriangle /></div>
          Подать жалобу
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 24 }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label className="form-label">Категория</label>
              <select
                className="form-input"
                value={category}
                onChange={e => setCategory(e.target.value)}
                style={{ cursor: 'pointer' }}
              >
                <option value="general">Общее</option>
                <option value="teacher">Преподаватель</option>
                <option value="facility">Условия обучения</option>
                <option value="food">Питание</option>
                <option value="other">Другое</option>
              </select>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label className="form-label">Тема жалобы *</label>
              <input className="form-input" placeholder="Кратко опишите проблему" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label className="form-label">Описание *</label>
              <textarea className="form-textarea" placeholder="Подробно опишите ситуацию..." value={description} onChange={e => setDescription(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" className="btn-danger">Отправить жалобу</button>
              <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Отмена</button>
            </div>
          </form>
        </div>
      )}

      {complaints.length === 0 ? (
        <div className="empty-state">
          <Icons.AlertTriangle />
          <p className="empty-state-text">Жалоб пока нет</p>
        </div>
      ) : (
        <div>
          {complaints.map(complaint => (
            <div key={complaint.id} className="complaint-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.9)', marginBottom: 4 }}>{complaint.title}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{complaint.date} • {complaint.author}</div>
                </div>
                <span className={`complaint-status ${complaint.status}`}>
                  {complaint.status === 'pending' ? 'В обработке' : 'Решено'}
                </span>
              </div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5, marginBottom: 12 }}>{complaint.description}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: 4 }}>
                  {complaint.category === 'general' ? 'Общее' : complaint.category === 'teacher' ? 'Преподаватель' : complaint.category === 'facility' ? 'Условия' : complaint.category === 'food' ? 'Питание' : 'Другое'}
                </span>
                {complaint.status === 'pending' && (
                  <button className="btn-ghost" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => resolveComplaint(complaint.id)}>
                    Отметить решённой
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


+++ src/App.tsx (修改后)
