# Survey System - Frontend Application

Modern, responsive web application for survey management built with React, Vite, and Material-UI. Features AI-powered analytics, real-time updates, and OAuth integration.

## 🌐 Production Deployment

**Live URL**: https://joseph_ponce_1.programacionwebuce.net

**Domain Configuration**: 
- Primary domain managed through Cloudflare
- SSL/TLS certificates: Self-signed (nginx)
- Web server: Nginx with HTTPS support
- Hosted on: AWS EC2 (Ubuntu 22.04)

## Technology Stack

- **React** 18.3+ - UI library
- **Vite** 5.4+ - Build tool and dev server
- **Material-UI (MUI)** 6.1+ - Component library
- **React Router** 6.26+ - Client-side routing
- **Axios** - HTTP client
- **Recharts** - Data visualization
- **React Hook Form** - Form management
- **Emotion** - CSS-in-JS styling
- **Nginx** - Production web server with SSL/TLS
- **Docker** - Containerization

## Features

### Core Features
-  **Survey Creation & Management** - Intuitive survey builder with multiple question types
-  **Real-time Analytics** - Live response tracking and statistics
-  **AI-Powered Analysis** - Intelligent insights powered by Groq AI
-  **Authentication** - JWT + OAuth (GitHub) integration
-  **Role-Based Access** - User and admin roles with different permissions
-  **Responsive Design** - Mobile-first, works on all devices
-  **Modern UI/UX** - Clean, professional interface with Material Design

### Question Types Supported
- Multiple Choice
- Single Choice (Radio buttons)
- Text Input (Short answer)
- Long Text (Paragraph)
- Rating Scale
- Linear Scale
- Checkbox Grid
- Multiple Choice Grid

### Admin Features
- User management
- Survey oversight
- System statistics dashboard
- Analytics and reporting

## Project Structure

```
frontend/
├── public/
│   └── vite.svg
├── src/
│   ├── api/
│   │   ├── axios.js              # Axios configuration
│   │   └── endpoints.js          # API endpoint definitions
│   ├── components/
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── UserManagement.jsx
│   │   │   └── SurveyManagement.jsx
│   │   ├── auth/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── survey/
│   │   │   ├── SurveyBuilder.jsx
│   │   │   ├── SurveyList.jsx
│   │   │   ├── SurveyResponse.jsx
│   │   │   ├── SurveyResults.jsx
│   │   │   └── AIAnalysis.jsx
│   │   ├── common/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── Loading.jsx
│   │   └── layout/
│   │       └── MainLayout.jsx
│   ├── contexts/
│   │   └── AuthContext.jsx      # Authentication state management
│   ├── hooks/
│   │   ├── useAuth.js           # Authentication hook
│   │   └── useSurvey.js         # Survey management hook
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Dashboard.jsx
│   │   ├── CreateSurvey.jsx
│   │   ├── MySurveys.jsx
│   │   └── NotFound.jsx
│   ├── styles/
│   │   └── theme.js             # MUI theme configuration
│   ├── utils/
│   │   ├── constants.js         # Application constants
│   │   └── helpers.js           # Utility functions
│   ├── App.jsx                  # Main application component
│   ├── main.jsx                 # Application entry point
│   └── index.css                # Global styles
├── nginx.conf                   # Nginx configuration with SSL
├── Dockerfile                   # Multi-stage Docker build
├── .env                         # Environment variables
├── .env.example                 # Environment template
├── index.html                   # HTML template
├── vite.config.js               # Vite configuration
├── package.json
└── package-lock.json
```

## Environment Configuration

### Production Environment (.env)

```env
VITE_API_URL=https://joseph_ponce_1.programacionwebuce.net/api
VITE_APP_NAME=Sistema de Encuestas UCE
VITE_APP_VERSION=1.0.0
VITE_ENV=production
VITE_ENABLE_AI_FEATURES=true
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_OAUTH=true
VITE_GITHUB_AUTH_URL=https://joseph_ponce_1.programacionwebuce.net/api/auth/github
```

### Development Environment (.env)

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Sistema de Encuestas UCE - Dev
VITE_APP_VERSION=1.0.0
VITE_ENV=development
VITE_ENABLE_AI_FEATURES=true
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_OAUTH=true
VITE_GITHUB_AUTH_URL=http://localhost:5000/api/auth/github
```

### Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API endpoint | ✅ Yes |
| `VITE_APP_NAME` | Application display name | ✅ Yes |
| `VITE_APP_VERSION` | Application version | ✅ Yes |
| `VITE_ENV` | Environment (development/production) | ✅ Yes |
| `VITE_ENABLE_AI_FEATURES` | Enable AI analysis features | ❌ No |
| `VITE_ENABLE_ANALYTICS` | Enable analytics dashboard | ❌ No |
| `VITE_ENABLE_OAUTH` | Enable GitHub OAuth | ❌ No |
| `VITE_GITHUB_AUTH_URL` | GitHub OAuth endpoint | ❌ No (if OAuth disabled) |

**Important**: All Vite environment variables must be prefixed with `VITE_` to be exposed to the client-side code.

## Installation and Setup

### Prerequisites

- Node.js 18+ and npm 9+
- Docker 20.10+ (for containerized deployment)
- Docker Compose 2.0+ (optional, for full stack)

### Local Development Setup

#### 1. Clone Repository

```bash
git clone <repository-url>
cd frontend
```

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

#### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Production Build

#### Local Production Build

```bash
# Create optimized production build
npm run build

# Preview production build locally
npm run preview
```

Build output will be in the `dist/` directory.

#### Docker Production Build

```bash
# Build Docker image
docker build -t survey-frontend:latest .

# Run container
docker run -d \
  --name survey_frontend \
  -p 80:80 \
  -p 443:443 \
  -v /etc/nginx/ssl:/etc/nginx/ssl:ro \
  survey-frontend:latest
```

## Nginx Configuration

### Production nginx.conf

```nginx
server {
    listen 80;
    server_name _;
    
    # Redirect all HTTP to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name _;

    # SSL Configuration
    ssl_certificate /etc/nginx/ssl/nginx-selfsigned.crt;
    ssl_certificate_key /etc/nginx/ssl/nginx-selfsigned.key;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 10240;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy backend API
    location /api {
        resolver 127.0.0.11 valid=30s;
        set $backend_upstream backend:5000;
        proxy_pass http://$backend_upstream;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Handle React Router (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "OK\n";
        add_header Content-Type text/plain;
    }
}
```

### Key Nginx Features

-  **HTTP to HTTPS Redirect** - All traffic encrypted
-  **SSL/TLS Support** - TLS 1.2 and 1.3
-  **Dynamic DNS Resolution** - Docker service name resolution with resolver directive
-  **Gzip Compression** - Reduced bandwidth usage
-  **Security Headers** - XSS, clickjacking protection
-  **SPA Support** - Client-side routing handled correctly
-  **Static Asset Caching** - 1 year cache for immutable assets
-  **Reverse Proxy** - Backend API proxied through frontend
-  **Health Check** - Container health monitoring

### Important Nginx Configuration Notes

**DNS Resolver Configuration:**
```nginx
resolver 127.0.0.11 valid=30s;
set $backend_upstream backend:5000;
proxy_pass http://$backend_upstream;
```

This configuration is **critical** for Docker environments:
- `resolver 127.0.0.11` - Docker's internal DNS server
- `set $backend_upstream` - Variable to force runtime DNS resolution
- Prevents nginx from failing if backend container isn't ready at startup

## Dockerfile

### Multi-stage Build Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code and .env
COPY . .

# Build with embedded environment variables
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
```

### Dockerfile Features

-  **Multi-stage Build** - Smaller final image
-  **Alpine Linux** - Minimal base image
-  **npm ci** - Reproducible builds
-  **Health Check** - Automatic container monitoring
-  **Environment Variables** - Embedded at build time
-  **Static Serving** - Nginx serves optimized assets

## Production Deployment on EC2

### 1. SSL Certificate Setup

```bash
# Create SSL directory
sudo mkdir -p /etc/nginx/ssl

# Generate self-signed certificate
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/nginx/ssl/nginx-selfsigned.key \
  -out /etc/nginx/ssl/nginx-selfsigned.crt \
  -subj "/C=EC/ST=Pichincha/L=Quito/O=UCE/CN=joseph_ponce_1.programacionwebuce.net"
```

### 2. Configure Environment

```bash
cd ~/FinalP/frontend

# Create production .env
nano .env
```

Paste production configuration:
```env
VITE_API_URL=https://joseph_ponce_1.programacionwebuce.net/api
VITE_APP_NAME=Sistema de Encuestas UCE
VITE_APP_VERSION=1.0.0
VITE_ENV=production
VITE_ENABLE_AI_FEATURES=true
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_OAUTH=true
VITE_GITHUB_AUTH_URL=https://joseph_ponce_1.programacionwebuce.net/api/auth/github
```

### 3. Deploy with Docker Compose

```bash
cd ~/FinalP

# Build and start frontend
docker-compose up -d --build frontend
```

### 4. Verify Deployment

```bash
# Check container status
docker ps | grep survey_frontend

# View logs
docker logs survey_frontend

# Test locally
curl http://localhost
curl -k https://localhost

# Test from outside
curl https://joseph_ponce_1.programacionwebuce.net
```

### 5. Auto-start on System Reboot (Optional)

```bash
# Enable Docker to start on boot
sudo systemctl enable docker

# Create systemd service for auto-start
sudo nano /etc/systemd/system/survey-app.service
```

Paste this configuration:

```ini
[Unit]
Description=Survey Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/ubuntu/FinalP
ExecStart=/usr/bin/docker-compose up -d
ExecStop=/usr/bin/docker-compose down
User=ubuntu

[Install]
WantedBy=multi-user.target
```

Enable and start the service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable survey-app
sudo systemctl start survey-app
sudo systemctl status survey-app
```

## Available Scripts

### Development

```bash
# Start development server with hot reload
npm run dev

# Start development server with network access
npm run dev -- --host
```

### Production

```bash
# Create optimized production build
npm run build

# Preview production build locally
npm run preview

# Lint code
npm run lint

# Format code with Prettier
npm run format
```

### Docker

```bash
# Build Docker image
docker build -t survey-frontend .

# Run Docker container
docker run -d -p 80:80 -p 443:443 survey-frontend

# View container logs
docker logs survey_frontend

# Stop container
docker stop survey_frontend
```

## Application Routes

### Public Routes

```
/                    # Landing page
/login               # User login
/register            # User registration
/surveys/:id         # View public survey
/surveys/:id/respond # Submit survey response
```

### Protected Routes (Authenticated Users)

```
/dashboard           # User dashboard
/surveys/create      # Create new survey
/surveys/my          # My surveys
/surveys/:id/edit    # Edit survey
/surveys/:id/results # View survey results
/surveys/:id/ai-analysis # AI analysis
/responses/my        # My responses
```

### Admin Routes

```
/admin               # Admin dashboard
/admin/users         # User management
/admin/surveys       # Survey management
/admin/stats         # System statistics
```

## API Integration

### Axios Configuration

```javascript
// src/api/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### API Usage Example

```javascript
import api from '../api/axios';

// Fetch surveys
const fetchSurveys = async () => {
  try {
    const response = await api.get('/surveys');
    return response.data;
  } catch (error) {
    console.error('Error fetching surveys:', error);
    throw error;
  }
};

// Create survey
const createSurvey = async (surveyData) => {
  try {
    const response = await api.post('/surveys', surveyData);
    return response.data;
  } catch (error) {
    console.error('Error creating survey:', error);
    throw error;
  }
};
```

## Authentication Flow

### JWT Authentication

1. User logs in with email/password
2. Backend returns JWT token
3. Token stored in localStorage
4. Token included in Authorization header for protected requests
5. Token validated on each request
6. On 401 response, user redirected to login

### GitHub OAuth Flow

1. User clicks "Login with GitHub"
2. Redirected to GitHub authorization page
3. User authorizes application
4. GitHub redirects to callback URL with code
5. Backend exchanges code for access token
6. Backend creates/updates user and returns JWT
7. Frontend receives JWT and stores it
8. User authenticated and redirected to dashboard

## State Management

### AuthContext

```javascript
// src/contexts/AuthContext.jsx
import { createContext, useState, useEffect } from 'react';
import api from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await api.get('/auth/me');
          setUser(response.data.data);
        } catch (error) {
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, user } = response.data.data;
    localStorage.setItem('token', token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

## Theme Customization

### MUI Theme Configuration

```javascript
// src/styles/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0'
    },
    secondary: {
      main: '#dc004e',
      light: '#e33371',
      dark: '#9a0036'
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff'
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600
        }
      }
    }
  }
});

export default theme;
```

## Performance Optimization

### Build Optimization

- **Code Splitting** - Lazy loading for routes
- **Tree Shaking** - Remove unused code
- **Minification** - Compress JavaScript and CSS
- **Asset Optimization** - Compress images and fonts
- **Gzip Compression** - Server-side compression

### Runtime Optimization

- **React.memo** - Prevent unnecessary re-renders
- **useMemo/useCallback** - Memoize expensive computations
- **Lazy Loading** - Load components on demand
- **Virtualization** - Render only visible list items
- **Debouncing** - Delay API calls on user input

### Example: Lazy Loading

```javascript
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Loading from './components/common/Loading';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const CreateSurvey = lazy(() => import('./pages/CreateSurvey'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/surveys/create" element={<CreateSurvey />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
```

## Troubleshooting

### Build Issues

**Error: Cannot find module**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Build fails with memory error**
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### Runtime Issues

**API calls failing**
```javascript
// Check VITE_API_URL in .env
console.log(import.meta.env.VITE_API_URL);

// Verify backend is running
curl http://localhost:5000/health
```

**Environment variables not working**
- Ensure variables start with `VITE_`
- Restart dev server after changing .env
- Rebuild for production after .env changes

**Authentication not persisting**
```javascript
// Check localStorage
console.log(localStorage.getItem('token'));

// Clear localStorage if corrupted
localStorage.clear();
```

### Docker Issues

**Container not starting**
```bash
# Check container logs
docker logs survey_frontend

# Rebuild without cache
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

**Nginx error: "host not found in upstream 'backend'"**

This error occurs when nginx starts before Docker's DNS is ready.

**Solution**: The nginx.conf now includes:
```nginx
resolver 127.0.0.11 valid=30s;
set $backend_upstream backend:5000;
proxy_pass http://$backend_upstream;
```

If you still see this error:
```bash
# Restart the frontend container
docker-compose restart frontend

# Or rebuild completely
docker-compose down
docker-compose up -d
```

**SSL certificate errors**
```bash
# Verify certificates exist
ls -la /etc/nginx/ssl/

# Check nginx configuration
docker exec survey_frontend nginx -t

# Reload nginx
docker exec survey_frontend nginx -s reload
```

**Environment variables not available in build**
```bash
# Ensure .env file exists before build
ls -la frontend/.env

# Verify variables in built files
docker exec survey_frontend cat /usr/share/nginx/html/assets/*.js | grep VITE_API_URL
```

**Port already in use (80 or 443)**
```bash
# Check what's using the port
sudo lsof -i :80
sudo lsof -i :443

# If it's system nginx, stop it
sudo systemctl stop nginx
sudo systemctl disable nginx

# Then restart containers
docker-compose down
docker-compose up -d
```

### Network Issues

**CORS errors**
- Verify CORS_ORIGIN in backend .env matches frontend URL
- Check browser console for specific CORS error
- Ensure backend is running and accessible

**Mixed content warnings (HTTP/HTTPS)**
- Ensure all API calls use HTTPS in production
- Check VITE_API_URL uses https:// protocol
- Verify nginx proxy configuration

**Container restart loop**
```bash
# Check logs for specific error
docker logs survey_frontend --tail 50

# Common causes:
# 1. Nginx configuration syntax error
docker exec survey_frontend nginx -t

# 2. Missing SSL certificates
ls -la /etc/nginx/ssl/

# 3. Backend service not found (fixed by resolver directive)
```

## Security Best Practices

### Client-Side Security

1. **XSS Protection**
   - Sanitize user input before rendering
   - Use React's built-in XSS protection
   - Avoid dangerouslySetInnerHTML

2. **Authentication**
   - Store JWT in localStorage (or httpOnly cookies for enhanced security)
   - Validate tokens on every protected route
   - Implement token refresh mechanism

3. **Environment Variables**
   - Never expose API keys in frontend
   - Only use VITE_ prefix for safe variables
   - Don't commit .env to version control

4. **HTTPS**
   - Always use HTTPS in production
   - Redirect HTTP to HTTPS
   - Enable HSTS headers

### Code Security Checklist

- [ ] Input validation on all forms
- [ ] CSRF protection (handled by backend)
- [ ] Secure headers configured in nginx
- [ ] Dependencies regularly updated
- [ ] No sensitive data in localStorage
- [ ] API endpoints use HTTPS
- [ ] Error messages don't expose system details

## Testing

### Unit Testing (Future Implementation)

```bash
# Install testing dependencies
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom

# Run tests
npm run test

# Run tests with coverage
npm run test:coverage
```

### E2E Testing (Future Implementation)

```bash
# Install Playwright
npm install --save-dev @playwright/test

# Run E2E tests
npx playwright test
```

## Accessibility

### WCAG 2.1 Compliance

-  Semantic HTML elements
-  ARIA labels on interactive elements
-  Keyboard navigation support
-  Sufficient color contrast
-  Focus indicators
-  Screen reader friendly

### Accessibility Features

```javascript
// Example: Accessible button
<Button
  aria-label="Create new survey"
  onClick={handleCreate}
>
  Create Survey
</Button>

// Example: Accessible form
<TextField
  id="email"
  label="Email Address"
  type="email"
  required
  aria-required="true"
  aria-describedby="email-helper"
/>
```

## Browser Support

### Supported Browsers

-  Chrome 90+
-  Firefox 88+
-  Safari 14+
-  Edge 90+
-  Opera 76+

### Mobile Support

-  iOS Safari 14+
-  Chrome Mobile 90+
-  Samsung Internet 14+

## Monitoring and Analytics

### Production Monitoring (Future Enhancement)

```javascript
// Error tracking with Sentry
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: import.meta.env.VITE_ENV
});

// Performance monitoring
import { BrowserTracing } from "@sentry/tracing";
```

### Analytics Integration (Future Enhancement)

```javascript
// Google Analytics 4
import ReactGA from 'react-ga4';

ReactGA.initialize('G-XXXXXXXXXX');

// Track page views
ReactGA.send({ hitType: "pageview", page: window.location.pathname });
```

## License

This project is proprietary and confidential. All rights reserved by Universidad Central del Ecuador.

## Support

For technical support, bug reports, or feature requests, please contact the development team.

## Development Team

Developed and maintained by the UCE Survey System Development Team.

## Version History

- **v1.0.1** (February 2026) - Production deployment
  - SSL/TLS support with nginx
  - Domain configuration with Cloudflare
  - Reverse proxy for backend API
  - Dynamic DNS resolution for Docker networking
  - Production environment setup
  - Enhanced security headers
  - Auto-start configuration for EC2

- **v1.0.0** (January 2026) - Initial release
  - React 18.3 with Vite 5.4
  - Material-UI component library
  - JWT authentication
  - GitHub OAuth integration
  - Survey creation and management
  - AI analysis integration
  - Responsive design
  - Admin dashboard

## Acknowledgments

Special thanks to:
- **Universidad Central del Ecuador** for project support
- **Material-UI** for the excellent component library
- **Vite** for blazing fast build tooling
- **React** community for continuous innovation
- **AWS** for hosting infrastructure
- **Cloudflare** for domain and security services

## Contributing

This is a closed-source institutional project. Contributions are limited to authorized development team members only.

---
