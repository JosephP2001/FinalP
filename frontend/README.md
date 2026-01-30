# Survey System - Frontend Application

Modern, responsive web application for survey management with AI-powered analytics, built with React, Vite, and Tailwind CSS.

## Technology Stack

- **React** 18.3 - UI library
- **Vite** 7.2 - Build tool and development server
- **React Router DOM** 7.11 - Client-side routing
- **Tailwind CSS** 3.4 - Utility-first CSS framework
- **Axios** 1.13 - HTTP client
- **React Hook Form** 7.71 - Form management
- **Zod** 3.25 - Schema validation
- **Recharts** 3.6 - Data visualization
- **Lucide React** - Icon library
- **XLSX** - Excel export functionality
- **jsPDF** - PDF generation
- **html2canvas** - Screenshot capture
- **PapaParse** - CSV parsing

## Project Structure

```
frontend/
├── public/                      # Static assets
├── src/
│   ├── assets/
│   │   └── react.svg           # Application assets
│   ├── components/
│   │   ├── common/
│   │   │   ├── FormInput.jsx   # Reusable form input
│   │   │   ├── FormSelect.jsx  # Reusable select component
│   │   │   ├── FormTextarea.jsx # Reusable textarea
│   │   │   └── Skeleton.jsx    # Loading skeleton
│   │   ├── layout/
│   │   │   └── Navbar.jsx      # Navigation component
│   │   └── ProtectedRoute.jsx  # Route authentication guard
│   ├── pages/
│   │   ├── AdminDashboard.jsx  # Admin overview
│   │   ├── AdminUsers.jsx      # User management
│   │   ├── AuthCallback.jsx    # OAuth callback handler
│   │   ├── Dashboard.jsx       # User dashboard
│   │   ├── Login.jsx           # Authentication page
│   │   ├── SurveyBuilder.jsx   # Survey creation
│   │   ├── SurveyEdit.jsx      # Survey editing
│   │   ├── SurveyList.jsx      # Survey listing
│   │   ├── SurveyRespond.jsx   # Survey response form
│   │   └── SurveyResults.jsx   # Survey analytics & AI insights
│   ├── schemas/
│   │   ├── authSchemas.js      # Authentication validation
│   │   ├── responseSchemas.js  # Response validation
│   │   └── surveySchemas.js    # Survey validation
│   ├── services/
│   │   ├── adminService.js     # Admin API calls
│   │   ├── aiService.js        # AI analysis API
│   │   ├── api.js              # Axios instance
│   │   ├── authService.js      # Authentication API
│   │   ├── exportService.js    # Export functionality
│   │   ├── responseService.js  # Response API calls
│   │   └── surveyService.js    # Survey API calls
│   ├── App.css                 # Application styles
│   ├── App.jsx                 # Root component
│   ├── index.css               # Global styles
│   └── main.jsx                # Application entry point
├── .dockerignore
├── .env                        # Environment variables
├── Dockerfile                  # Multi-stage Docker build
├── eslint.config.js            # ESLint configuration
├── index.html                  # HTML template
├── nginx.conf                  # Nginx server configuration
├── package.json
├── postcss.config.js           # PostCSS configuration
├── tailwind.config.js          # Tailwind CSS configuration
└── vite.config.js              # Vite configuration
```

## Environment Configuration

Create a `.env` file in the frontend root directory:

```env
VITE_API_URL=http://localhost:5000/api

VITE_APP_NAME=Sistema de Encuestas UCE
VITE_APP_VERSION=1.0.0

VITE_ENV=development

VITE_ENABLE_AI_FEATURES=true
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_OAUTH=true

VITE_GITHUB_AUTH_URL=http://localhost:5000/api/auth/github
```

## Installation and Development

### Prerequisites

- Node.js 18+
- npm 9+
- Docker (optional, for containerized deployment)

### Local Development Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

Production build will be generated in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

### Code Linting

```bash
npm run lint
```

## Docker Deployment

### Build Docker Image

```bash
docker build -t survey-frontend:latest .
```

### Run Container

```bash
docker run -d \
  --name survey-frontend \
  -p 3000:80 \
  survey-frontend:latest
```

### Docker Compose Deployment

From the project root:

```bash
docker-compose up -d frontend
```

## Application Routes

### Public Routes

```
/                          # Redirect to login
/login                     # User authentication
/auth/callback             # GitHub OAuth callback
/surveys/:id/respond       # Public survey response form
```

### Protected Routes (Require Authentication)

```
/dashboard                 # User dashboard
/surveys                   # Survey list
/surveys/create            # Create new survey
/surveys/:id/edit          # Edit survey
/surveys/:id/results       # Survey results and AI analytics
```

### Admin Routes (Require Admin Role)

```
/admin                     # Admin dashboard
/admin/users               # User management
```

## Key Features

### Authentication
- Email/password authentication
- GitHub OAuth integration
- JWT token management
- Protected route guards
- Automatic token refresh

### Survey Management
- Visual survey builder
- Question types: text, multiple choice, scale, date
- Survey settings: access control, response limits, scheduling
- Real-time validation
- Draft and publish workflow

### Response Collection
- Public and private survey access
- Token-based authentication for restricted surveys
- Email validation
- Progress tracking
- Response validation

### AI-Powered Analytics
- **Intelligent Analysis**: Powered by Groq's llama-3.3-70b-versatile model
- **Executive Summaries**: Concise overview of survey results
- **Key Insights**: Pattern and trend identification
- **Sentiment Analysis**: Overall respondent sentiment scoring
- **Actionable Recommendations**: Data-driven suggestions
- **Rate Limit Awareness**: Real-time quota display

### Analytics and Reporting
- Interactive data visualizations
- AI-powered insights and recommendations
- Export to Excel, CSV, PDF
- Chart generation (pie, bar, line charts)
- Statistical summaries
- Response timeline analysis

### User Experience
- Responsive design (mobile, tablet, desktop)
- Loading skeletons and progress indicators
- Form validation with error messages
- Toast notifications
- AI analysis status and quota display
- Accessibility compliant

## AI Features Integration

### AI Analysis Service

The frontend integrates with the backend AI service to provide intelligent survey analysis:

```javascript
// src/services/aiService.js

export const aiService = {
  /**
   * Get current rate limit status
   */
  getRateLimitStatus: async () => {
    const response = await axios.get(
      `${API_URL}/ai/rate-limit-status`,
      getAuthHeader()
    );
    return response.data;
  },

  /**
   * Analyze survey with AI
   */
  analyzeSurvey: async (surveyId) => {
    const response = await axios.post(
      `${API_URL}/ai/analyze-survey/${surveyId}`,
      {},
      getAuthHeader()
    );
    return response.data;
  }
};
```

### Rate Limit Display

The application displays AI analysis quota to users:

```jsx
// Example: Display in SurveyResults.jsx
{rateLimitInfo && (
  <div className="rate-limit-info">
    <h4>Análisis IA Disponibles</h4>
    <div className="limit-stats">
      <div className="stat">
        <span>Por hora:</span>
        <strong>{rateLimitInfo.hourly.remaining}/{rateLimitInfo.hourly.limit}</strong>
      </div>
      <div className="stat">
        <span>Por día:</span>
        <strong>{rateLimitInfo.daily.remaining}/{rateLimitInfo.daily.limit}</strong>
      </div>
    </div>
  </div>
)}
```

### AI Error Handling

The frontend gracefully handles rate limit errors:

```javascript
try {
  const result = await aiService.analyzeSurvey(surveyId);
  setAnalysis(result.analysis);
  setRateLimitInfo(result.rateLimitInfo);
} catch (err) {
  if (err.isRateLimitError) {
    // Display rate limit error
    setError({
      type: 'rate_limit',
      message: err.message,
      retryAfter: err.retryAfter
    });
  } else {
    // Handle other errors
    setError({
      type: 'general',
      message: 'Error al generar análisis'
    });
  }
}
```

### AI Analysis Display

Survey results page shows comprehensive AI insights:

```jsx
{analysis && (
  <div className="ai-analysis-section">
    <h3>📊 Análisis IA</h3>
    
    {/* Executive Summary */}
    <div className="summary-card">
      <h4>Resumen Ejecutivo</h4>
      <p>{analysis.summary}</p>
    </div>

    {/* Key Insights */}
    <div className="insights-card">
      <h4>Insights Clave</h4>
      <ul>
        {analysis.keyInsights.map((insight, idx) => (
          <li key={idx}>{insight}</li>
        ))}
      </ul>
    </div>

    {/* Sentiment Analysis */}
    <div className="sentiment-card">
      <h4>Análisis de Sentimiento</h4>
      <div className="sentiment-score">
        {analysis.sentiment.overall} - {analysis.sentiment.score}/100
      </div>
      <p>{analysis.sentiment.explanation}</p>
    </div>

    {/* Recommendations */}
    <div className="recommendations-card">
      <h4>Recomendaciones</h4>
      <ol>
        {analysis.recommendations.map((rec, idx) => (
          <li key={idx}>{rec}</li>
        ))}
      </ol>
    </div>
  </div>
)}
```

## API Integration

### Base Configuration

All API calls are configured through the centralized `api.js` service:

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for JWT token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Handle unauthorized (redirect to login)
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### Service Layer

Services provide abstraction over API endpoints:

- `authService.js` - Authentication operations
- `surveyService.js` - Survey CRUD operations
- `responseService.js` - Response management
- `aiService.js` - AI analysis requests
- `adminService.js` - Administrative functions
- `exportService.js` - Data export utilities

## State Management

The application uses:
- **React Hooks** - Local component state (useState, useEffect, useReducer)
- **localStorage** - Authentication persistence and user preferences
- **React Router** - Navigation state
- **Context API** - Global state for user authentication (when needed)

## Form Validation

### Schema-based Validation

Using Zod and React Hook Form:

```javascript
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { loginSchema } from './schemas/authSchemas';

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(loginSchema)
});
```

### Validation Schemas

- `authSchemas.js` - Login and registration validation
- `surveySchemas.js` - Survey creation validation
- `responseSchemas.js` - Response submission validation

## Styling Architecture

### Tailwind CSS

Utility-first approach with custom configuration:

```javascript
// tailwind.config.js
theme: {
  extend: {
    colors: {
      primary: {
        50: '#f5f7ff',
        100: '#ebf0ff',
        200: '#d6e0ff',
        300: '#b3c7ff',
        400: '#809dff',
        500: '#667eea',
        600: '#5a67d8',
        700: '#4c51bf',
        800: '#434190',
        900: '#3c366b'
      }
    },
    animation: {
      'spin-slow': 'spin 3s linear infinite',
      'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite'
    }
  }
}
```

### Component Styling

- Mobile-first responsive design
- Consistent spacing and typography
- Custom color palette
- Smooth transitions and animations
- Dark mode ready (configurable)

## Build Optimization

### Vite Configuration

```javascript
build: {
  outDir: 'dist',
  sourcemap: false,
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom', 'react-router-dom'],
        charts: ['recharts'],
        forms: ['react-hook-form', 'zod'],
        utils: ['axios', 'date-fns']
      }
    }
  },
  chunkSizeWarningLimit: 1000
}
```

### Code Splitting

- Vendor bundle separation
- Chart library chunking
- Form library chunking
- Lazy loading for routes (optional)

### Performance Features

- Tree shaking
- Minification
- Asset optimization
- HTTP/2 ready
- Gzip compression

## Nginx Configuration

Production deployment uses Nginx with optimized settings:

```nginx
server {
  listen 80;
  server_name localhost;
  
  # Gzip compression
  gzip on;
  gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
  
  location / {
    root /usr/share/nginx/html;
    index index.html;
    try_files $uri $uri/ /index.html;
  }
  
  # API proxy (optional, for same-origin requests)
  location /api {
    proxy_pass http://backend:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
  
  # Cache static assets
  location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
}
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Development Guidelines

### Code Style

- ESLint configuration for code consistency
- React best practices
- Functional components with hooks
- JSX naming conventions
- Proper prop-types or TypeScript (future)

### Component Structure

```javascript
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const ComponentName = ({ prop1, prop2 }) => {
  // Hooks
  const [state, setState] = useState(null);
  
  // Effects
  useEffect(() => {
    // Side effects
  }, []);
  
  // Event handlers
  const handleEvent = () => {
    // Handler logic
  };
  
  // Early returns
  if (!state) return <div>Loading...</div>;
  
  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
};

ComponentName.propTypes = {
  prop1: PropTypes.string.isRequired,
  prop2: PropTypes.number
};

export default ComponentName;
```

## Troubleshooting

### Port 3000 Already in Use

```bash
# Kill process on port 3000
lsof -i :3000
kill -9 <PID>

# Or use different port in vite.config.js
server: {
  port: 3001
}
```

### API Connection Issues

```bash
# Verify backend is running
curl http://localhost:5000/api/health

# Check VITE_API_URL in .env
VITE_API_URL=http://localhost:5000/api
```

### Build Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf .vite node_modules/.vite
```

### Docker Build Failures

```bash
# Clear Docker cache
docker builder prune

# Rebuild without cache
docker build --no-cache -t survey-frontend .
```

### AI Features Not Working

**Check Backend Connection:**
```bash
curl http://localhost:5000/api/ai/rate-limit-status \
  -H "Authorization: Bearer <your-token>"
```

**Verify Environment Variable:**
```env
VITE_ENABLE_AI_FEATURES=true
```

**Check Console for Errors:**
- Open browser DevTools (F12)
- Check Console tab for API errors
- Check Network tab for failed requests

## Testing

### Manual Testing Checklist

- [ ] User registration and login
- [ ] OAuth authentication (GitHub)
- [ ] Survey creation and editing
- [ ] Survey response submission
- [ ] Results visualization
- [ ] AI analysis generation
- [ ] AI rate limit display
- [ ] Export functionality (Excel, CSV, PDF)
- [ ] Admin user management
- [ ] Responsive design verification
- [ ] Cross-browser compatibility

### AI Features Testing

- [ ] AI analysis button appears for surveys with responses
- [ ] Rate limit status displays correctly
- [ ] AI analysis generates successfully
- [ ] Rate limit errors display properly
- [ ] Cooldown timer shows remaining time
- [ ] Analysis results display all sections (summary, insights, sentiment, recommendations)

## Security Considerations

- **XSS Prevention**: Input sanitization and proper escaping
- **CSRF Protection**: Token-based authentication
- **Secure Storage**: No sensitive data in localStorage (only JWT token)
- **HTTPS**: Required for production
- **Content Security Policy**: Configured headers
- **Environment Variables**: No secrets in client code
- **API Key Protection**: No Groq API key in frontend (handled by backend)

## Production Deployment

### Environment Variables for Production

```env
VITE_API_URL=https://api.your-domain.com/api
VITE_ENV=production
VITE_GITHUB_AUTH_URL=https://api.your-domain.com/api/auth/github
VITE_ENABLE_AI_FEATURES=true
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_OAUTH=true
```

### Deployment Checklist

- [ ] Update environment variables
- [ ] Build production bundle (`npm run build`)
- [ ] Test production build locally (`npm run preview`)
- [ ] Configure Nginx/web server
- [ ] Set up SSL certificates (Let's Encrypt)
- [ ] Configure CORS on backend
- [ ] Test all functionality
- [ ] Monitor error logs
- [ ] Set up analytics (optional)
- [ ] Configure CDN (optional)

## Performance Metrics

Target metrics for production:

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

## Accessibility

The application follows WCAG 2.1 Level AA standards:

- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation support
- Screen reader compatibility
- Sufficient color contrast ratios (4.5:1 minimum)
- Focus indicators
- Form labels and error messages
- Skip navigation links

## License

This project is proprietary and confidential. All rights reserved by Universidad Central del Ecuador.

## Support and Maintenance

For technical support, bug reports, or feature requests, please contact the system administrator.

## Development Team

Developed and maintained by the UCE Survey System Development Team.

## Version History

- **v1.0.0** - Initial release
  - User authentication and authorization
  - Survey builder interface
  - Response collection system
  - Analytics dashboard
  - AI-powered insights with Groq integration
  - Rate limit awareness and display
  - Export functionality (Excel, CSV, PDF)
  - Admin panel
  - Responsive design

## Acknowledgments

Special thanks to Universidad Central del Ecuador for supporting this project development.

## Future Enhancements

Planned features for future releases:

- [ ] TypeScript migration
- [ ] Dark mode toggle
- [ ] Real-time collaboration
- [ ] Advanced chart customization
- [ ] Survey templates library
- [ ] Multi-language support
- [ ] Survey branching logic
- [ ] Email notifications
- [ ] Survey sharing via social media
- [ ] Advanced filtering and search
- [ ] Bulk operations
- [ ] Survey versioning