import { useState, useEffect, useRef } from 'react';
import { auth, db, googleProvider, storage } from './firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut,
  updateProfile,
  User 
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy,
  onSnapshot,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';

// Admin email
const ADMIN_EMAIL = 'ccotanno@gmail.com';

// Types
interface Student {
  id: string;
  name: string;
  group: string;
  color: string;
  userId: string;
}

interface MarketItem {
  id: string;
  title: string;
  price: string;
  description: string;
  type: 'sell' | 'buy';
  seller: string;
  date: string;
  userId: string;
  image?: string;
}

interface ChatMessage {
  id: string;
  text: string;
  sender: string;
  senderName: string;
  senderAvatar?: string;
  time: string;
  timestamp: any;
  file?: {
    name: string;
    url: string;
    type: string;
    size: number;
  };
  mentions?: string[];
}

interface Homework {
  id: string;
  subject: string;
  title: string;
  description: string;
  deadline: string;
  teacher: string;
  userId: string;
}

interface Complaint {
  id: string;
  title: string;
  description: string;
  category: 'student' | 'bugs' | 'admin';
  status: 'pending' | 'resolved';
  date: string;
  author: string;
  userId: string;
}

interface Teacher {
  id: string;
  name: string;
  subject: string;
  info: string;
  email: string;
  color: string;
}

interface ScheduleItem {
  id: string;
  day: string;
  time: string;
  subject: string;
  teacher: string;
  room: string;
  userId: string;
}

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

// Icons
const Icons = {
  Home: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>,
  Wheel: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><path d="M12 2v7M12 15v7M2 12h7M15 12h7M4.93 4.93l4.95 4.95M14.12 14.12l4.95 4.95M4.93 19.07l4.95-4.95M14.12 9.88l4.95-4.95"/></svg>,
  UserPlus: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M20 8v6M23 11h-6"/></svg>,
  Users: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  ShoppingBag: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
  MessageCircle: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>,
  Headphones: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/><path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>,
  Book: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  Clipboard: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>,
  AlertTriangle: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4M12 17h.01"/></svg>,
  Send: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>,
  Trash: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  Menu: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h18M3 6h18M3 18h18"/></svg>,
  X: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>,
  Mail: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/></svg>,
  Clock: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
  Plus: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>,
  Minus: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/></svg>,
  Google: () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>,
  Calendar: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
  Shield: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Check: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>,
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [students, setStudents] = useState<Student[]>([]);
  const [marketItems, setMarketItems] = useState<MarketItem[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [supportMessages, setSupportMessages] = useState<ChatMessage[]>([]);
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);

  const [wheelRotation, setWheelRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelResult, setWheelResult] = useState<string | null>(null);

  const [showAvatarCrop, setShowAvatarCrop] = useState(false);
  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const [avatarScale, setAvatarScale] = useState(1);
  const [avatarPosition, setAvatarPosition] = useState({ x: 0, y: 0 });

  const isAdmin = user?.email === ADMIN_EMAIL;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const unsubStudents = onSnapshot(
      query(collection(db, 'students'), where('userId', '==', user.uid)),
      (snapshot) => {
        setStudents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student)));
      }
    );

    const unsubMarket = onSnapshot(
      query(collection(db, 'market'), orderBy('timestamp', 'desc')),
      (snapshot) => {
        setMarketItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MarketItem)));
      }
    );

    const unsubChat = onSnapshot(
      query(collection(db, 'chat'), orderBy('timestamp', 'asc')),
      (snapshot) => {
        setChatMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage)));
      }
    );

    const unsubSupport = onSnapshot(
      query(collection(db, 'support'), where('userId', '==', user.uid), orderBy('timestamp', 'asc')),
      (snapshot) => {
        setSupportMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage)));
      }
    );

    const unsubHomeworks = onSnapshot(
      query(collection(db, 'homeworks'), where('userId', '==', user.uid)),
      (snapshot) => {
        setHomeworks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Homework)));
      }
    );

    const unsubComplaints = onSnapshot(
      query(collection(db, 'complaints'), where('userId', '==', user.uid)),
      (snapshot) => {
        setComplaints(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Complaint)));
      }
    );

    const unsubSchedule = onSnapshot(
      query(collection(db, 'schedule'), where('userId', '==', user.uid)),
      (snapshot) => {
        setSchedule(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ScheduleItem)));
      }
    );

    return () => {
      unsubStudents();
      unsubMarket();
      unsubChat();
      unsubSupport();
      unsubHomeworks();
      unsubComplaints();
      unsubSchedule();
    };
  }, [user]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleNicknameChange = async () => {
    if (!user) return;
    const newNickname = prompt('Введите новый ник:', user.displayName || '');
    if (newNickname && newNickname.trim()) {
      try {
        await updateProfile(user, { displayName: newNickname.trim() });
        showToast('Ник обновлён!');
      } catch (error) {
        showToast('Ошибка обновления ника');
      }
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3.5 * 1024 * 1024) {
      showToast('Файл слишком большой. Максимум 3.5 МБ');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarImage(e.target?.result as string);
      setShowAvatarCrop(true);
      setAvatarScale(1);
      setAvatarPosition({ x: 0, y: 0 });
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarCropSave = async () => {
    if (!avatarImage || !user) return;

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.onload = async () => {
        const size = 400;
        canvas.width = size;
        canvas.height = size;

        const scale = avatarScale;
        const imgWidth = img.width * scale;
        const imgHeight = img.height * scale;
        
        const x = (size - imgWidth) / 2 + avatarPosition.x;
        const y = (size - imgHeight) / 2 + avatarPosition.y;

        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        ctx.drawImage(img, x, y, imgWidth, imgHeight);

        canvas.toBlob(async (blob) => {
          if (!blob) return;
          
          const fileRef = ref(storage, `avatars/${user.uid}`);
          await uploadBytes(fileRef, blob);
          const url = await getDownloadURL(fileRef);
          
          await updateProfile(user, { photoURL: url });
          showToast('Аватарка обновлена!');
          
          setShowAvatarCrop(false);
          setAvatarImage(null);
        }, 'image/jpeg', 0.9);
      };
      img.src = avatarImage;
    } catch (error) {
      showToast('Ошибка обрезки аватарки');
    }
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
    { id: 'schedule', label: 'Расписание', icon: <Icons.Calendar /> },
    { id: 'complaints', label: 'Жалобы', icon: <Icons.AlertTriangle /> },
    ...(isAdmin ? [{ id: 'admin', label: 'Админ панель', icon: <Icons.Shield /> }] : []),
  ];

  if (loading) {
    return (
      <div className="splash-screen">
        <div className="splash-icon">
          <div className="splash-square"></div>
          <div className="splash-square"></div>
          <div className="splash-square"></div>
          <div className="splash-square"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <div className="background">
          <div className="bg-circle"></div>
          <div className="bg-circle"></div>
          <div className="bg-circle"></div>
          <div className="bg-circle"></div>
        </div>
        <AuthPage />
        {toast && <div className="toast">{toast}</div>}
      </>
    );
  }

  const userName = user.displayName || user.email?.split('@')[0] || 'Пользователь';
  const userAvatar = user.photoURL || undefined;

  return (
    <>
      <div className="background">
        <div className="bg-circle"></div>
        <div className="bg-circle"></div>
        <div className="bg-circle"></div>
        <div className="bg-circle"></div>
      </div>

      <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? <Icons.X /> : <Icons.Menu />}
      </button>

      <div className={`app-layout visible`}>
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
            {navItems.map(item => (
              <button key={item.id} className={`sidebar-btn ${currentPage === item.id ? 'active' : ''}`} onClick={() => navigate(item.id)}>
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="sidebar-footer">
            <div className="sidebar-user">
              <div className="sidebar-user-avatar">
                {userAvatar ? (
                  <img src={userAvatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  userName[0].toUpperCase()
                )}
              </div>
              <div className="sidebar-user-info">
                <div className="sidebar-user-name" style={{ cursor: 'pointer' }} onClick={handleNicknameChange}>
                  {userName}
                </div>
                <div className="sidebar-user-role">Онлайн</div>
              </div>
            </div>
            <button className="sidebar-logout-btn" onClick={handleLogout}>
              <Icons.X />
            </button>
          </div>
        </aside>

        <main className="main-area">
          {currentPage === 'home' && <HomePage navigate={navigate} />}
          {currentPage === 'wheel' && <WheelPage students={students} wheelRotation={wheelRotation} isSpinning={isSpinning} wheelResult={wheelResult} spinWheel={spinWheel} setWheelResult={setWheelResult} navigate={navigate} />}
          {currentPage === 'register' && <RegisterPage showToast={showToast} userId={user.uid} students={students} />}
          {currentPage === 'students' && <StudentsPage students={students} showToast={showToast} userId={user.uid} />}
          {currentPage === 'market' && <MarketPage items={marketItems} showToast={showToast} userId={user.uid} userName={userName} />}
          {currentPage === 'chat' && <ChatPage messages={chatMessages} userId={user.uid} userName={userName} userAvatar={userAvatar} />}
          {currentPage === 'support' && <SupportPage messages={supportMessages} userId={user.uid} userName={userName} userAvatar={userAvatar} />}
          {currentPage === 'wiki' && <WikiPage isAdmin={isAdmin} />}
          {currentPage === 'homework' && <HomeworkPage homeworks={homeworks} showToast={showToast} userId={user.uid} />}
          {currentPage === 'schedule' && <SchedulePage schedule={schedule} showToast={showToast} userId={user.uid} isAdmin={isAdmin} />}
          {currentPage === 'complaints' && <ComplaintsPage complaints={complaints} showToast={showToast} userId={user.uid} userName={userName} />}
          {currentPage === 'admin' && isAdmin && <AdminPage showToast={showToast} />}
        </main>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}

// Компоненты страниц
function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'register') {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <h1 className="auth-title">Quadrant</h1>
          <p className="auth-subtitle">Платформа для студентов</p>
        </div>

        <div className="auth-tabs">
          <button className={`auth-tab ${mode === 'login' ? 'active' : ''}`} onClick={() => setMode('login')}>Вход</button>
          <button className={`auth-tab ${mode === 'register' ? 'active' : ''}`} onClick={() => setMode('register')}>Регистрация</button>
        </div>

        {error && <div style={{ padding: '10px', background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)', borderRadius: 8, color: '#ff4444', fontSize: 13, marginBottom: 16 }}>{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label className="auth-label">Email</label>
            <input type="email" className="form-input" placeholder="example@mail.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="auth-field">
            <label className="auth-label">Пароль</label>
            <input type="password" className="form-input" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
          </div>
          <button type="submit" className="submit-btn" disabled={loading}>{loading ? 'Загрузка...' : mode === 'login' ? 'Войти' : 'Зарегистрироваться'}</button>
        </form>

        <div className="auth-divider"><span>или</span></div>

        <button className="google-btn" onClick={handleGoogle} disabled={loading}>
          <div style={{ width: 20, height: 20 }}><Icons.Google /></div>
          <span>Войти через Google</span>
        </button>
      </div>
    </div>
  );
}

function HomePage({ navigate }: { navigate: (p: string) => void }) {
  const pages = [
    { icon: <Icons.Wheel />, page: 'wheel', color: '#ff4444', gradient: 'linear-gradient(135deg, #ff4444, #ff6666)' },
    { icon: <Icons.ShoppingBag />, page: 'market', color: '#44ff88', gradient: 'linear-gradient(135deg, #44ff88, #66ffaa)' },
    { icon: <Icons.MessageCircle />, page: 'chat', color: '#4488ff', gradient: 'linear-gradient(135deg, #4488ff, #66aaff)' },
    { icon: <Icons.Headphones />, page: 'support', color: '#ff44aa', gradient: 'linear-gradient(135deg, #ff44aa, #ff66cc)' },
    { icon: <Icons.Book />, page: 'wiki', color: '#aa44ff', gradient: 'linear-gradient(135deg, #aa44ff, #cc66ff)' },
    { icon: <Icons.Clipboard />, page: 'homework', color: '#ffaa44', gradient: 'linear-gradient(135deg, #ffaa44, #ffcc66)' },
    { icon: <Icons.Calendar />, page: 'schedule', color: '#44ddff', gradient: 'linear-gradient(135deg, #44ddff, #66eeff)' },
    { icon: <Icons.AlertTriangle />, page: 'complaints', color: '#ff8844', gradient: 'linear-gradient(135deg, #ff8844, #ffaa66)' },
    { icon: <Icons.UserPlus />, page: 'register', color: '#44ffdd', gradient: 'linear-gradient(135deg, #44ffdd, #66ffee)' },
  ];

  return (
    <div className="page-enter">
      <div className="page-header">
        <h1 className="page-title">Quadrant</h1>
        <p className="page-subtitle">Выберите раздел</p>
      </div>
      <div className="home-icon-grid">
        {pages.map(item => (
          <div key={item.page} className="home-icon-card" onClick={() => navigate(item.page)} style={{ background: item.gradient, boxShadow: `0 8px 32px ${item.color}40` }}>
            <div className="home-icon-inner" style={{ color: 'white' }}>{item.icon}</div>
          </div>
        ))}
      </div>
      <div style={{ textAlign: 'center', marginTop: 32, fontSize: 32, fontWeight: 700, color: 'rgba(255,255,255,0.9)', letterSpacing: '2px' }}>21Z</div>
    </div>
  );
}

function WheelPage({ students, wheelRotation, isSpinning, wheelResult, spinWheel, setWheelResult, navigate }: any) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || students.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 10;
    const sliceAngle = (2 * Math.PI) / students.length;
    const colors = ['#ff4444', '#44ff88', '#4488ff', '#ff44aa', '#ffaa44', '#aa44ff', '#44ffdd', '#ff8844'];

    ctx.clearRect(0, 0, size, size);
    students.forEach((student: Student, i: number) => {
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
      ctx.font = 'bold 13px Inter';
      ctx.fillText(student.name.split(' ')[0], radius - 20, 5);
      ctx.restore();
    });

    ctx.beginPath();
    ctx.arc(center, center, 25, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(20,20,20,0.9)';
    ctx.fill();
  }, [students]);

  return (
    <div className="page-enter">
      <div className="page-header">
        <h1 className="page-title">Колесо Фортуны</h1>
        <p className="page-subtitle">Случайный выбор дежурного</p>
      </div>
      {students.length < 2 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p style={{ color: 'rgba(255,255,255,0.4)' }}>Нужно минимум 2 студента</p>
          <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('register')}>Зарегистрировать</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30 }}>
          <div style={{ position: 'relative', width: 380, height: 380 }}>
            <div style={{ position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '14px solid transparent', borderRight: '14px solid transparent', borderTop: '28px solid #ff4444', zIndex: 10 }} />
            <canvas ref={canvasRef} width={380} height={380} style={{ width: 380, height: 380, borderRadius: '50%', transition: 'transform 5s cubic-bezier(0.17, 0.67, 0.12, 0.99)', transform: `rotate(${wheelRotation}deg)` }} />
          </div>
          <button className="btn-primary" onClick={spinWheel} disabled={isSpinning} style={{ padding: '14px 44px', fontSize: 16 }}>
            {isSpinning ? 'Вращается...' : 'Крутить!'}
          </button>
        </div>
      )}
      {wheelResult && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={() => setWheelResult(null)}>
          <div style={{ background: 'rgba(30,30,30,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: '40px 60px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>Дежурный сегодня:</div>
            <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 20 }}>{wheelResult}</div>
            <button className="btn-primary" onClick={() => setWheelResult(null)}>Закрыть</button>
          </div>
        </div>
      )}
    </div>
  );
}

function RegisterPage({ showToast, userId, students }: { showToast: (m: string) => void; userId: string; students: Student[] }) {
  const [name, setName] = useState('');
  const [group, setGroup] = useState('');
  const hasStudent = students.some(s => s.userId === userId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hasStudent) {
      showToast('У вас уже есть зарегистрированный студент!');
      return;
    }
    if (!name.trim() || !group.trim()) {
      showToast('Заполните все поля');
      return;
    }
    await addDoc(collection(db, 'students'), {
      name: name.trim(),
      group: group.trim(),
      color: getRandomColor(),
      userId,
    });
    setName('');
    setGroup('');
    showToast('Студент добавлен!');
  };

  if (hasStudent) {
    const myStudent = students.find(s => s.userId === userId);
    return (
      <div className="page-enter">
        <div className="page-header">
          <h1 className="page-title">Регистрация студента</h1>
          <p className="page-subtitle">Ваш студент</p>
        </div>
        <div className="card" style={{ maxWidth: 480 }}>
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: myStudent?.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '0 auto 16px', color: 'white', fontWeight: 600 }}>
              {myStudent?.name[0]}
            </div>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{myStudent?.name}</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>Группа {myStudent?.group}</div>
            <div style={{ marginTop: 20, padding: 12, background: 'rgba(68,255,136,0.1)', borderRadius: 8, color: '#44ff88', fontSize: 14 }}>
              ✓ Вы уже зарегистрированы
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter">
      <div className="page-header">
        <h1 className="page-title">Регистрация студента</h1>
        <p className="page-subtitle">Добавьте студента для участия в колесе</p>
      </div>
      <div className="card" style={{ maxWidth: 480 }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label className="form-label">ФИО студента</label>
            <input className="form-input" placeholder="Иванов Иван Иванович" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label className="form-label">Номер группы</label>
            <input className="form-input" placeholder="ИС-21" value={group} onChange={e => setGroup(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%' }}>Зарегистрировать</button>
        </form>
      </div>
    </div>
  );
}

function StudentsPage({ students, showToast }: { students: Student[]; showToast: (m: string) => void; userId: string }) {
  const deleteStudent = async (id: string) => {
    await deleteDoc(doc(db, 'students', id));
    showToast('Студент удалён');
  };

  return (
    <div className="page-enter">
      <div className="page-header">
        <h1 className="page-title">Студенты</h1>
        <p className="page-subtitle">Список зарегистрированных ({students.length})</p>
      </div>
      {students.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.4)' }}>Нет студентов</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {students.map(student => (
            <div key={student.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: student.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600 }}>{student.name[0]}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{student.name}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Группа {student.group}</div>
                </div>
              </div>
              <button onClick={() => deleteStudent(student.id)} style={{ width: 32, height: 32, background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.2)', borderRadius: 8, color: '#ff4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icons.Trash />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MarketPage({ items, showToast, userId, userName }: { items: MarketItem[]; showToast: (m: string) => void; userId: string; userName: string }) {
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'sell' | 'buy'>('all');
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'sell' | 'buy'>('sell');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3.5 * 1024 * 1024) {
      showToast('Изображение слишком большое. Максимум 3.5 МБ');
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price.trim()) {
      showToast('Заполните название и цену');
      return;
    }
    setUploading(true);
    let imageUrl = undefined;
    try {
      if (imageFile) {
        const imageRef = ref(storage, `market-images/${Date.now()}_${imageFile.name}`);
        await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(imageRef);
      }
      await addDoc(collection(db, 'market'), {
        title: title.trim(),
        price: price.trim(),
        description: description.trim(),
        type,
        seller: userName,
        date: new Date().toLocaleDateString('ru-RU'),
        userId,
        image: imageUrl,
        timestamp: serverTimestamp(),
      });
      setTitle('');
      setPrice('');
      setDescription('');
      setImageFile(null);
      setImagePreview(null);
      setShowForm(false);
      showToast('Объявление добавлено!');
    } catch (error) {
      showToast('Ошибка загрузки изображения');
    }
    setUploading(false);
  };

  const deleteItem = async (id: string) => {
    if (confirm('Удалить это объявление?')) {
      await deleteDoc(doc(db, 'market', id));
      showToast('Объявление удалено');
    }
  };

  const filtered = items.filter(i => filter === 'all' || i.type === filter);

  return (
    <div className="page-enter">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Продажа / Покупка</h1>
          <p className="page-subtitle">Маркетплейс</p>
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
                <input className="form-input" placeholder="Учебник" value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              <div>
                <label className="form-label">Цена</label>
                <input className="form-input" placeholder="500 ₽" value={price} onChange={e => setPrice(e.target.value)} />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label className="form-label">Описание</label>
              <textarea className="form-input" placeholder="Опишите товар..." value={description} onChange={e => setDescription(e.target.value)} style={{ minHeight: 100, resize: 'vertical' }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label className="form-label">Изображение (необязательно, макс. 3.5 МБ)</label>
              <input type="file" accept="image/*" onChange={handleImageSelect} style={{ display: 'none' }} id="market-image-input" />
              <label htmlFor="market-image-input" className="btn-ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <Icons.Plus />
                {imagePreview ? 'Изменить изображение' : 'Добавить изображение'}
              </label>
              {imagePreview && (
                <div style={{ marginTop: 12, position: 'relative', display: 'inline-block' }}>
                  <img src={imagePreview} alt="Preview" style={{ maxWidth: 200, maxHeight: 200, borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)' }} />
                  <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }} style={{ position: 'absolute', top: -8, right: -8, width: 24, height: 24, borderRadius: '50%', background: '#ff4444', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>×</button>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 4 }}>
                <button type="button" style={{ padding: '8px 20px', background: type === 'sell' ? 'rgba(255,255,255,0.1)' : 'transparent', border: 'none', borderRadius: 8, color: 'rgba(255,255,255,0.9)', cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => setType('sell')}>Продажа</button>
                <button type="button" style={{ padding: '8px 20px', background: type === 'buy' ? 'rgba(255,255,255,0.1)' : 'transparent', border: 'none', borderRadius: 8, color: 'rgba(255,255,255,0.9)', cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => setType('buy')}>Покупка</button>
              </div>
              <button type="submit" className="btn-primary" disabled={uploading}>{uploading ? 'Загрузка...' : 'Опубликовать'}</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 4, marginBottom: 24, width: 'fit-content' }}>
        <button style={{ padding: '8px 20px', background: filter === 'all' ? 'rgba(255,255,255,0.1)' : 'transparent', border: 'none', borderRadius: 8, color: 'rgba(255,255,255,0.9)', cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => setFilter('all')}>Все</button>
        <button style={{ padding: '8px 20px', background: filter === 'sell' ? 'rgba(255,255,255,0.1)' : 'transparent', border: 'none', borderRadius: 8, color: 'rgba(255,255,255,0.9)', cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => setFilter('sell')}>Продажа</button>
        <button style={{ padding: '8px 20px', background: filter === 'buy' ? 'rgba(255,255,255,0.1)' : 'transparent', border: 'none', borderRadius: 8, color: 'rgba(255,255,255,0.9)', cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => setFilter('buy')}>Покупка</button>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.4)' }}>Нет объявлений</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {filtered.map(item => (
            <div key={item.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' }}>
              <div style={{ width: '100%', height: 160, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.image ? (
                  <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: 48, height: 48, color: 'rgba(255,255,255,0.15)' }}><Icons.ShoppingBag /></div>
                )}
              </div>
              <div style={{ padding: 16 }}>
                <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: item.type === 'sell' ? 'rgba(68,255,136,0.1)' : 'rgba(68,136,255,0.1)', color: item.type === 'sell' ? '#44ff88' : '#4488ff', border: `1px solid ${item.type === 'sell' ? 'rgba(68,255,136,0.2)' : 'rgba(68,136,255,0.2)'}` }}>{item.type === 'sell' ? 'Продажа' : 'Покупка'}</span>
                <div style={{ fontSize: 15, fontWeight: 600, marginTop: 8 }}>{item.title}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#44ff88', marginBottom: 8 }}>{item.price}</div>
                {item.description && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>{item.description}</div>}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{item.seller} • {item.date}</div>
                  {item.userId === userId && (
                    <button onClick={() => deleteItem(item.id)} style={{ width: 32, height: 32, background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.2)', borderRadius: 8, color: '#ff4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icons.Trash />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ChatPage({ messages, userId, userName, userAvatar }: { messages: ChatMessage[]; userId: string; userName: string; userAvatar?: string }) {
  const [input, setInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (fileData?: { name: string; url: string; type: string; size: number }) => {
    if (!input.trim() && !fileData) return;
    await addDoc(collection(db, 'chat'), {
      text: input.trim(),
      sender: userId,
      senderName: userName,
      senderAvatar: userAvatar,
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      timestamp: serverTimestamp(),
      file: fileData,
    });
    setInput('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3.5 * 1024 * 1024) {
      alert('Файл слишком большой. Максимум 3.5 МБ');
      return;
    }
    setUploading(true);
    try {
      const fileRef = ref(storage, `chat-files/${Date.now()}_${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      await sendMessage({ name: file.name, url, type: file.type, size: file.size });
    } catch (error) {
      alert('Ошибка загрузки файла');
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="page-enter">
      <div className="page-header">
        <h1 className="page-title">Чат</h1>
        <p className="page-subtitle">Общий чат</p>
      </div>
      <div className="chat-container">
        <div className="chat-header">
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #4488ff, #66aaff)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600, fontSize: 14 }}>Г</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Общий чат</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{messages.length} сообщений</div>
          </div>
        </div>
        <div className="chat-messages">
          {messages.map(msg => (
            <div key={msg.id} className={`chat-msg ${msg.sender === userId ? 'sent' : 'received'}`}>
              {msg.sender !== userId && <div style={{ fontSize: 11, fontWeight: 600, color: '#66aaff', marginBottom: 4 }}>{msg.senderName}</div>}
              <div>{msg.text}</div>
              {msg.file && msg.file.type.startsWith('image/') && (
                <img src={msg.file.url} alt={msg.file.name} style={{ maxWidth: 300, maxHeight: 300, borderRadius: 8, marginTop: 8 }} />
              )}
              <div className="chat-msg-time">{msg.time}</div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="chat-input-area">
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} accept="image/*,application/pdf,.doc,.docx,.txt" />
          <button className="chat-attach-btn" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            {uploading ? '⏳' : '+'}
          </button>
          <input className="chat-input" placeholder={uploading ? 'Загрузка файла...' : 'Написать сообщение...'} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} disabled={uploading} />
          <button className="chat-send-btn" onClick={() => sendMessage()} disabled={uploading}>
            <Icons.Send />
          </button>
        </div>
      </div>
    </div>
  );
}

function SupportPage({ messages, userId, userName, userAvatar }: { messages: ChatMessage[]; userId: string; userName: string; userAvatar?: string }) {
  const [input, setInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (fileData?: { name: string; url: string; type: string; size: number }) => {
    if (!input.trim() && !fileData) return;
    await addDoc(collection(db, 'support'), {
      text: input.trim(),
      sender: userId,
      senderName: userName,
      senderAvatar: userAvatar,
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      userId,
      timestamp: serverTimestamp(),
      file: fileData,
    });
    setInput('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3.5 * 1024 * 1024) {
      alert('Файл слишком большой. Максимум 3.5 МБ');
      return;
    }
    setUploading(true);
    try {
      const fileRef = ref(storage, `support-files/${Date.now()}_${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      await sendMessage({ name: file.name, url, type: file.type, size: file.size });
    } catch (error) {
      alert('Ошибка загрузки файла');
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
            <div style={{ fontSize: 14, fontWeight: 600 }}>Техподдержка</div>
            <div style={{ fontSize: 11, color: '#44ff88' }}>● Онлайн</div>
          </div>
        </div>
        <div className="chat-messages">
          {messages.map(msg => (
            <div key={msg.id} className={`chat-msg ${msg.sender === userId ? 'sent' : 'received'}`}>
              {msg.sender !== userId && <div style={{ fontSize: 11, fontWeight: 600, color: '#44ff88', marginBottom: 4 }}>Поддержка</div>}
              <div>{msg.text}</div>
              {msg.file && msg.file.type.startsWith('image/') && (
                <img src={msg.file.url} alt={msg.file.name} style={{ maxWidth: 300, maxHeight: 300, borderRadius: 8, marginTop: 8 }} />
              )}
              <div className="chat-msg-time">{msg.time}</div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="chat-input-area">
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} accept="image/*" />
          <button className="chat-attach-btn" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            {uploading ? '⏳' : '+'}
          </button>
          <input className="chat-input" placeholder={uploading ? 'Загрузка...' : 'Опишите проблему...'} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} disabled={uploading} />
          <button className="chat-send-btn" onClick={() => sendMessage()} disabled={uploading} style={{ background: 'linear-gradient(135deg, #44ff88, #66ffaa)' }}>
            <Icons.Send />
          </button>
        </div>
      </div>
    </div>
  );
}

function WikiPage({ isAdmin }: { isAdmin: boolean }) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [info, setInfo] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(query(collection(db, 'teachers')), (snapshot) => {
      setTeachers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Teacher)));
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !subject.trim()) return;
    await addDoc(collection(db, 'teachers'), {
      name: name.trim(),
      subject: subject.trim(),
      info: info.trim(),
      email: email.trim(),
      color: getRandomColor(),
    });
    setName('');
    setSubject('');
    setInfo('');
    setEmail('');
    setShowForm(false);
  };

  const deleteTeacher = async (id: string) => {
    await deleteDoc(doc(db, 'teachers', id));
  };

  return (
    <div className="page-enter">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Вики</h1>
          <p className="page-subtitle">Преподаватели</p>
        </div>
        {isAdmin && (
          <button className="btn-primary" onClick={() => setShowForm(!showForm)} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 16, height: 16 }}><Icons.Plus /></div>
            Добавить
          </button>
        )}
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 24 }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label className="form-label">Имя *</label>
                <input className="form-input" placeholder="Иванов И.И." value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div>
                <label className="form-label">Предмет *</label>
                <input className="form-input" placeholder="Математика" value={subject} onChange={e => setSubject(e.target.value)} />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label className="form-label">Информация</label>
              <textarea className="form-input" placeholder="О преподавателе..." value={info} onChange={e => setInfo(e.target.value)} style={{ minHeight: 100, resize: 'vertical' }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label className="form-label">Email</label>
              <input className="form-input" placeholder="email@uni.ru" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" className="btn-primary">Добавить</button>
              <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Отмена</button>
            </div>
          </form>
        </div>
      )}

      {teachers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.4)' }}>Нет преподавателей. Добавьте первого!</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {teachers.map(teacher => (
            <div key={teacher.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24 }}>
              <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                <div style={{ width: 56, height: 56, borderRadius: 14, background: teacher.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: 'white', flexShrink: 0 }}>{teacher.name[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>{teacher.name}</div>
                  <div style={{ fontSize: 13, color: '#66aaff', fontWeight: 500 }}>{teacher.subject}</div>
                </div>
                {isAdmin && (
                  <button onClick={() => deleteTeacher(teacher.id)} style={{ width: 32, height: 32, background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.2)', borderRadius: 8, color: '#ff4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icons.Trash />
                  </button>
                )}
              </div>
              {teacher.info && <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: 12 }}>{teacher.info}</p>}
              {teacher.email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                  <div style={{ width: 14, height: 14 }}><Icons.Mail /></div>
                  {teacher.email}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function HomeworkPage({ homeworks, showToast, userId }: { homeworks: Homework[]; showToast: (m: string) => void; userId: string }) {
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [teacher, setTeacher] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !title.trim() || !deadline) {
      showToast('Заполните обязательные поля');
      return;
    }
    await addDoc(collection(db, 'homeworks'), {
      subject: subject.trim(),
      title: title.trim(),
      description: description.trim(),
      deadline,
      teacher: teacher.trim(),
      userId,
    });
    setSubject('');
    setTitle('');
    setDescription('');
    setDeadline('');
    setTeacher('');
    setShowForm(false);
    showToast('Задание добавлено!');
  };

  const deleteHw = async (id: string) => {
    await deleteDoc(doc(db, 'homeworks', id));
    showToast('Задание удалено');
  };

  const isUrgent = (deadline: string) => {
    const diff = new Date(deadline).getTime() - Date.now();
    return diff < 3 * 24 * 60 * 60 * 1000;
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });

  return (
    <div className="page-enter">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Домашние задания</h1>
          <p className="page-subtitle">Текущие задания</p>
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
              <input className="form-input" placeholder="Задачи" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label className="form-label">Описание</label>
              <textarea className="form-input" placeholder="Описание..." value={description} onChange={e => setDescription(e.target.value)} style={{ minHeight: 100, resize: 'vertical' }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label className="form-label">Преподаватель</label>
              <input className="form-input" placeholder="Иванов А.П." value={teacher} onChange={e => setTeacher(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" className="btn-primary">Добавить</button>
              <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Отмена</button>
            </div>
          </form>
        </div>
      )}

      {homeworks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.4)' }}>Нет заданий</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {homeworks.map(hw => (
            <div key={hw.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: 'rgba(68,136,255,0.15)', color: '#66aaff', border: '1px solid rgba(68,136,255,0.2)', marginBottom: 10 }}>{hw.subject}</span>
                  <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{hw.title}</div>
                  {hw.description && <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5, marginBottom: 12 }}>{hw.description}</div>}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ fontSize: 12, color: isUrgent(hw.deadline) ? '#ff4444' : '#ff8844', fontWeight: 500 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 12, height: 12, display: 'inline-block' }}><Icons.Clock /></span>
                        {formatDate(hw.deadline)}
                      </span>
                    </div>
                    {hw.teacher && <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{hw.teacher}</span>}
                  </div>
                </div>
                <button onClick={() => deleteHw(hw.id)} style={{ width: 32, height: 32, background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.2)', borderRadius: 8, color: '#ff4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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

function SchedulePage({ schedule, showToast, userId, isAdmin }: { schedule: ScheduleItem[]; showToast: (m: string) => void; userId: string; isAdmin: boolean }) {
  const [showForm, setShowForm] = useState(false);
  const [day, setDay] = useState('Понедельник');
  const [time, setTime] = useState('09:00');
  const [subject, setSubject] = useState('');
  const [teacher, setTeacher] = useState('');
  const [room, setRoom] = useState('');

  const days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !teacher.trim() || !room.trim()) {
      showToast('Заполните все поля');
      return;
    }
    await addDoc(collection(db, 'schedule'), {
      day,
      time,
      subject: subject.trim(),
      teacher: teacher.trim(),
      room: room.trim(),
      userId,
    });
    setSubject('');
    setTeacher('');
    setRoom('');
    setShowForm(false);
    showToast('Занятие добавлено!');
  };

  const deleteSchedule = async (id: string) => {
    await deleteDoc(doc(db, 'schedule', id));
    showToast('Занятие удалено');
  };

  const scheduleByDay = days.map(day => ({
    day,
    items: schedule.filter(s => s.day === day).sort((a, b) => a.time.localeCompare(b.time))
  }));

  return (
    <div className="page-enter">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Расписание занятий</h1>
          <p className="page-subtitle">Ваше недельное расписание</p>
        </div>
        {isAdmin && (
          <button className="btn-primary" onClick={() => setShowForm(!showForm)} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 16, height: 16 }}><Icons.Plus /></div>
            Добавить
          </button>
        )}
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 24 }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label className="form-label">День недели</label>
                <select className="form-input" value={day} onChange={e => setDay(e.target.value)}>
                  {days.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Время</label>
                <input className="form-input" type="time" value={time} onChange={e => setTime(e.target.value)} />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label className="form-label">Предмет *</label>
              <input className="form-input" placeholder="Математика" value={subject} onChange={e => setSubject(e.target.value)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div>
                <label className="form-label">Преподаватель *</label>
                <input className="form-input" placeholder="Иванов И.И." value={teacher} onChange={e => setTeacher(e.target.value)} />
              </div>
              <div>
                <label className="form-label">Аудитория *</label>
                <input className="form-input" placeholder="301" value={room} onChange={e => setRoom(e.target.value)} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" className="btn-primary">Добавить</button>
              <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Отмена</button>
            </div>
          </form>
        </div>
      )}

      {schedule.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.4)' }}>Нет занятий. Добавьте первое!</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {scheduleByDay.map(({ day, items }) => (
            items.length > 0 && (
              <div key={day}>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: 'rgba(255,255,255,0.9)', marginBottom: 12 }}>{day}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {items.map(item => (
                    <div key={item.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                            <span style={{ fontSize: 14, fontWeight: 600, color: '#66aaff' }}>{item.time}</span>
                            <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: 'rgba(68,136,255,0.15)', color: '#66aaff', border: '1px solid rgba(68,136,255,0.2)' }}>{item.subject}</span>
                          </div>
                          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
                            <div>Преподаватель: {item.teacher}</div>
                            <div>Аудитория: {item.room}</div>
                          </div>
                        </div>
                        {isAdmin && (
                          <button onClick={() => deleteSchedule(item.id)} style={{ width: 32, height: 32, background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.2)', borderRadius: 8, color: '#ff4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Icons.Trash />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
}

function ComplaintsPage({ complaints, showToast, userId, userName }: { complaints: Complaint[]; showToast: (m: string) => void; userId: string; userName: string }) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'student' | 'bugs' | 'admin'>('student');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      showToast('Заполните все поля');
      return;
    }
    await addDoc(collection(db, 'complaints'), {
      title: title.trim(),
      description: description.trim(),
      category,
      status: 'pending',
      date: new Date().toLocaleDateString('ru-RU'),
      author: userName,
      userId,
    });
    setTitle('');
    setDescription('');
    setCategory('student');
    setShowForm(false);
    showToast('Жалоба отправлена!');
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'student': return 'Студент';
      case 'bugs': return 'Баги';
      case 'admin': return 'Администрация';
      default: return cat;
    }
  };

  return (
    <div className="page-enter">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Жалобы</h1>
          <p className="page-subtitle">Подайте обращение</p>
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
              <select className="form-input" value={category} onChange={e => setCategory(e.target.value as any)}>
                <option value="student">Студент</option>
                <option value="bugs">Баги</option>
                <option value="admin">Администрация</option>
              </select>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label className="form-label">Тема *</label>
              <input className="form-input" placeholder="Кратко опишите" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label className="form-label">Описание *</label>
              <textarea className="form-input" placeholder="Подробно..." value={description} onChange={e => setDescription(e.target.value)} style={{ minHeight: 100, resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" className="btn-danger">Отправить</button>
              <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Отмена</button>
            </div>
          </form>
        </div>
      )}

      {complaints.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.4)' }}>Нет жалоб</div>
      ) : (
        <div>
          {complaints.map(c => (
            <div key={c.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 20, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{c.title}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                    {c.date} • {c.author} • <span style={{ color: '#66aaff' }}>{getCategoryLabel(c.category)}</span>
                  </div>
                </div>
                <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: c.status === 'pending' ? 'rgba(255,136,68,0.15)' : 'rgba(68,255,136,0.15)', color: c.status === 'pending' ? '#ff8844' : '#44ff88' }}>{c.status === 'pending' ? 'В обработке' : 'Решено'}</span>
              </div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{c.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminPage({ showToast }: { showToast: (m: string) => void }) {
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [allComplaints, setAllComplaints] = useState<Complaint[]>([]);

  useEffect(() => {
    const unsubStudents = onSnapshot(collection(db, 'students'), (snapshot) => {
      setAllStudents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student)));
    });
    const unsubComplaints = onSnapshot(collection(db, 'complaints'), (snapshot) => {
      setAllComplaints(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Complaint)));
    });
    return () => {
      unsubStudents();
      unsubComplaints();
    };
  }, []);

  const resolveComplaint = async (id: string) => {
    await updateDoc(doc(db, 'complaints', id), { status: 'resolved' });
    showToast('Жалоба отмечена как решённая');
  };

  const deleteStudent = async (id: string) => {
    if (confirm('Удалить этого студента?')) {
      await deleteDoc(doc(db, 'students', id));
      showToast('Студент удалён');
    }
  };

  return (
    <div className="page-enter">
      <div className="page-header">
        <h1 className="page-title">Админ панель</h1>
        <p className="page-subtitle">Управление системой</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 32 }}>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(68,136,255,0.15)', color: '#4488ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icons.Users />
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{allStudents.length}</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Всего студентов</div>
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,136,68,0.15)', color: '#ff8844', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icons.AlertTriangle />
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{allComplaints.filter(c => c.status === 'pending').length}</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Открытых жалоб</div>
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(68,255,136,0.15)', color: '#44ff88', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icons.Check />
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{allComplaints.filter(c => c.status === 'resolved').length}</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Решённых жалоб</div>
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Жалобы</h2>
      {allComplaints.length === 0 ? (
        <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 32 }}>Нет жалоб</p>
      ) : (
        <div style={{ marginBottom: 32 }}>
          {allComplaints.map(c => (
            <div key={c.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 20, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{c.title}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                    {c.date} • {c.author} • <span style={{ color: '#66aaff' }}>{c.category}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: c.status === 'pending' ? 'rgba(255,136,68,0.15)' : 'rgba(68,255,136,0.15)', color: c.status === 'pending' ? '#ff8844' : '#44ff88' }}>{c.status === 'pending' ? 'В обработке' : 'Решено'}</span>
                  {c.status === 'pending' && (
                    <button onClick={() => resolveComplaint(c.id)} style={{ padding: '4px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'rgba(255,255,255,0.7)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                      Решить
                    </button>
                  )}
                </div>
              </div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{c.description}</p>
            </div>
          ))}
        </div>
      )}

      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Студенты</h2>
      {allStudents.length === 0 ? (
        <p style={{ color: 'rgba(255,255,255,0.4)' }}>Нет студентов</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {allStudents.map(student => (
            <div key={student.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: student.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600 }}>{student.name[0]}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{student.name}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Группа {student.group}</div>
                </div>
              </div>
              <button onClick={() => deleteStudent(student.id)} style={{ width: 32, height: 32, background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.2)', borderRadius: 8, color: '#ff4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icons.Trash />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
