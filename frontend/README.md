# Movie Actors Frontend

A modern React frontend for the Movie Actors Service, built with TypeScript, Tailwind CSS, and Vite.

## 🚀 Features

- **Modern React 18** with TypeScript
- **Tailwind CSS** for styling
- **Vite** for fast development
- **Responsive design** for all devices
- **Real-time API integration** with your Python backend
- **Smart routing** with React Router
- **Custom hooks** for API state management

## 🛠️ Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Lucide React** - Icon library

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page-level components
│   ├── services/      # API service layer
│   ├── hooks/         # Custom React hooks
│   ├── types/         # TypeScript definitions
│   └── styles/        # CSS and styling
├── public/            # Static assets
├── package.json       # Dependencies
├── vite.config.ts     # Vite configuration
└── tailwind.config.js # Tailwind configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ 
- Your Python backend running on port 8000

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
npm run preview
```

## 🔌 API Integration

The frontend automatically proxies API calls to your Python backend:

- **Development**: `/api/*` → `http://localhost:8000/*`
- **Production**: Configure your web server to handle routing

## 🎨 Customization

### Styling
- **Tailwind CSS**: Modify `tailwind.config.js` for theme changes
- **Custom CSS**: Add styles in `src/index.css`

### Components
- **New pages**: Add to `src/pages/` and update routing
- **New components**: Create in `src/components/`
- **API calls**: Extend `src/services/api.ts`

## 📱 Responsive Design

The UI is fully responsive and works on:
- 📱 Mobile devices
- 💻 Tablets  
- 🖥️ Desktop computers

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Quality

- **TypeScript**: Full type safety
- **ESLint**: Code linting
- **Prettier**: Code formatting (recommended)

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📄 License

This project is part of the Movie Actors Service.

