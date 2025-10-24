# 🚌 Frontend - ระบบจองรถรับ-ส่งโรงพยาบาล

## 📋 เกี่ยวกับโปรเจค

Frontend สำหรับระบบจองรถรับ-ส่งโรงพยาบาล พัฒนาด้วย React + Vite

## 🛠️ เทคโนโลยีที่ใช้

- **Frontend**: React 18 + Vite
- **UI Framework**: Tailwind CSS
- **Icons**: React Icons (Feather Icons)
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Notifications**: SweetAlert2
- **Build Tool**: Vite

## 🚀 การติดตั้งและรัน

### Prerequisites
- Node.js (v16+)
- npm หรือ yarn

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. ตั้งค่า Environment Variables
```bash
# สร้างไฟล์ .env
VITE_API_URL=https://your-backend-domain.railway.app
```

### 3. รัน Development Server
```bash
npm run dev
```

### 4. Build สำหรับ Production
```bash
npm run build
```

## 📁 โครงสร้างไฟล์

```
src/
├── 📄 App.jsx              # Main App component
├── 📄 main.jsx             # Entry point
├── 📁 components/          # Reusable components
│   ├── 📄 Layout.jsx       # Main layout
│   ├── 📄 Navbar.jsx       # Navigation bar
│   ├── 📄 Sidebar.jsx      # Sidebar navigation
│   ├── 📄 LineConnection.jsx # LINE integration
│   └── 📄 ProtectedRoute.jsx # Route protection
├── 📁 pages/               # Page components
│   ├── 📁 dashboard/       # Dashboard pages
│   ├── 📁 AppointmentForm/ # Appointment forms
│   └── 📄 Login.jsx        # Authentication pages
└── 📁 services/            # API services
    └── 📄 api.js           # API client
```

## 🔧 Environment Variables

```env
# Backend API URL
VITE_API_URL=https://your-backend-domain.railway.app
```

## 🚀 Deployment

### Railway Deployment
1. Push code ไป GitHub
2. Connect GitHub repo กับ Railway
3. ตั้งค่า Environment Variables
4. Deploy

### Build Commands
```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## 📱 Features

- 🏥 **จองรถรับ-ส่ง** - ระบบจองรถไปโรงพยาบาล
- 👨‍⚕️ **จัดการการจอง** - สำหรับเจ้าหน้าที่และแอดมิน
- 📱 **LINE Integration** - เชื่อมต่อ LINE สำหรับการแจ้งเตือน
- 📊 **Dashboard** - แดชบอร์ดสำหรับดูสถิติ
- 🔐 **Authentication** - ระบบล็อกอิน/สมัครสมาชิก
- 📱 **Responsive Design** - รองรับทุกขนาดหน้าจอ

## 📝 License

ISC License

## 👥 Contributors

- [Your Name] - Initial work

## 📞 Support

หากมีปัญหาหรือคำถาม กรุณาติดต่อ [your-email@example.com]

## 🔗 Links

- **Backend Repository**: [https://github.com/your-username/backend](https://github.com/your-username/backend)
- **Frontend Repository**: [https://github.com/your-username/frontend](https://github.com/your-username/frontend)
- **Live Demo**: [https://your-frontend-domain.railway.app](https://your-frontend-domain.railway.app)
