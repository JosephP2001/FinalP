# Survey System - Backend API

Enterprise-grade backend system for survey management with AI-powered analysis, built with Node.js, Express, MongoDB, and Redis.

## Technology Stack

- **Node.js** 18+ with ES Modules
- **Express.js** - Web application framework
- **MongoDB** 7.0 - NoSQL database
- **Redis** 7.0 - Caching and rate limiting
- **JWT** - Authentication and authorization
- **Groq AI** - Intelligent survey analysis (llama-3.3-70b-versatile)
- **Passport.js** - OAuth authentication (GitHub)
- **Swagger UI** - API documentation
- **Docker** - Containerization

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js          # MongoDB configuration
│   │   ├── passport.js           # OAuth GitHub configuration
│   │   ├── redis.js              # Redis client setup
│   │   └── swagger.js            # API documentation configuration
│   ├── controllers/
│   │   ├── adminController.js    # Administrative operations
│   │   ├── authController.js     # Authentication logic
│   │   ├── responseController.js # Survey response management
│   │   └── surveyController.js   # Survey management
│   ├── middlewares/
│   │   ├── aiRateLimit.js        # AI analysis rate limiting
│   │   ├── auth.js               # JWT verification
│   │   ├── authorize.js          # Role-based access control
│   │   └── cache.js              # Redis caching layer
│   ├── models/
│   │   ├── Response.js           # Response schema
│   │   ├── Survey.js             # Survey schema
│   │   └── User.js               # User schema
│   ├── routes/
│   │   ├── adminRoutes.js        # Administrative endpoints
│   │   ├── aiRoutes.js           # AI analysis endpoints
│   │   ├── authRoutes.js         # Authentication endpoints
│   │   ├── responseRoutes.js     # Response endpoints
│   │   └── surveyRoutes.js       # Survey endpoints
│   ├── services/
│   │   ├── aiService.js          # Groq AI integration
│   │   ├── emailService.js       # Email notification service
│   │   ├── responseService.js    # Response processing logic
│   │   └── surveyClosureService.js # Automated survey closure
│   └── server.js                 # Application entry point
├── .dockerignore
├── .env                          # Environment variables
├── Dockerfile
├── package.json
└── package-lock.json
```

## Environment Configuration

Create a `.env` file in the backend root directory with the following variables:

```env
NODE_ENV=development
PORT=5000

MONGODB_URI=mongodb://mongo:27017/survey_db
REDIS_HOST=redis
REDIS_PORT=6379

JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

CORS_ORIGIN=http://localhost:3000

GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

SESSION_SECRET=your_session_secret
FRONTEND_URL=http://localhost:3000

GROQ_API_KEY=your_groq_api_key
```

### Obtaining Groq API Key

1. Visit [https://console.groq.com](https://console.groq.com)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and add it to your `.env` file

**Important**: Keep your API key secure and never commit it to version control.

## Installation and Deployment

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- Node.js 18+ (for local development)
- MongoDB 7.0+ (for local development)
- Redis 7.0+ (for local development)

### Docker Deployment (Recommended)

Navigate to the project root directory and execute:

```bash
docker-compose up -d
```

This command will start the following services:
- Backend API (port 5000)
- MongoDB (port 27017)
- Redis (port 6379)

### Verify Service Status

```bash
docker-compose ps
```

### View Application Logs

```bash
docker-compose logs -f backend
```

### Stop Services

```bash
docker-compose down
```

### Restart Backend Service

```bash
docker-compose restart backend
```

### Rebuild After Code Changes

```bash
docker-compose up -d --build backend
```

## Local Development Setup

### Install Dependencies

```bash
cd backend
npm install
```

### Configure Local Database Connections

Update `.env` file:

```env
MONGODB_URI=mongodb://localhost:27017/survey_db
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Start Development Server

```bash
npm run dev
```

The server will be available at `http://localhost:5000`

## API Documentation

### Authentication Endpoints

```http
POST   /api/auth/register        # Register new user
POST   /api/auth/login           # User authentication
GET    /api/auth/me              # Get current user profile
GET    /api/auth/github          # GitHub OAuth login
GET    /api/auth/github/callback # GitHub OAuth callback
```

### Survey Management Endpoints

```http
GET    /api/surveys              # List all public surveys
GET    /api/surveys/:id          # Get specific survey
GET    /api/surveys/my/surveys   # Get user's surveys
POST   /api/surveys              # Create new survey
PUT    /api/surveys/:id          # Update survey
DELETE /api/surveys/:id          # Delete survey
GET    /api/surveys/:id/ai-analysis # Get AI analysis
```

### Response Endpoints

```http
POST   /api/responses/:surveyId  # Submit survey response
GET    /api/responses/survey/:surveyId # Get survey responses
GET    /api/responses/my/responses # Get user's responses
```

### Administrative Endpoints

```http
GET    /api/admin/users          # List all users
PUT    /api/admin/users/:id      # Update user information
DELETE /api/admin/users/:id      # Delete user
GET    /api/admin/surveys        # List all surveys
GET    /api/admin/stats          # System statistics
```

### AI Analysis Endpoints

```http
POST   /api/ai/analyze-survey/:surveyId # Generate AI analysis
GET    /api/ai/rate-limit-status        # Check rate limit status
```

## Authentication

### JWT Token Authentication

All protected endpoints require authentication via JWT token in the request header:

```http
Authorization: Bearer <jwt_token>
```

### User Roles

- **user** - Standard user (create surveys, submit responses)
- **admin** - Administrator (full system access)

## AI Analysis System

### Groq AI Integration

The system uses **Groq's llama-3.3-70b-versatile** model for intelligent survey analysis, providing:

- **Executive Summaries**: Concise overview of survey results
- **Key Insights**: Important patterns and trends identification
- **Sentiment Analysis**: Overall respondent sentiment with scoring
- **Actionable Recommendations**: Data-driven suggestions for improvement

### AI Analysis Response Format

```json
{
  "success": true,
  "analysis": {
    "summary": "Comprehensive analysis summary...",
    "keyInsights": [
      "Insight 1",
      "Insight 2",
      "Insight 3"
    ],
    "sentiment": {
      "overall": "positive",
      "score": 75,
      "explanation": "Sentiment explanation..."
    },
    "recommendations": [
      "Recommendation 1",
      "Recommendation 2",
      "Recommendation 3"
    ]
  },
  "metadata": {
    "model": "llama-3.3-70b-versatile",
    "responsesAnalyzed": 45,
    "timestamp": "2026-01-30T19:45:00.000Z"
  },
  "rateLimitInfo": {
    "hourly": {
      "used": 3,
      "remaining": 7,
      "limit": 10
    },
    "daily": {
      "used": 15,
      "remaining": 35,
      "limit": 50
    }
  }
}
```

### Available Groq Models (January 2026)

Current model: **llama-3.3-70b-versatile** (recommended)

Alternative models:
- `llama-3.1-70b-versatile` - Good balance of speed and quality
- `mixtral-8x7b-32768` - Faster responses, larger context window
- `gemma2-9b-it` - Lightweight, faster inference

To change the model, update `src/services/aiService.js`:

```javascript
model: 'llama-3.3-70b-versatile', // Change this line
```

## AI Analysis Rate Limiting

The system implements multi-tier rate limiting to prevent API abuse and manage costs:

### Rate Limit Configuration

Default limits (configurable in `src/middlewares/aiRateLimit.js`):

```javascript
const AI_RATE_LIMIT_CONFIG = {
  MAX_ANALYSES_PER_USER_PER_HOUR: 10,    // 10 analyses per hour
  MAX_ANALYSES_PER_USER_PER_DAY: 50,     // 50 analyses per day
  MAX_ANALYSES_PER_SURVEY_PER_USER: 5,   // 5 analyses per survey
  SURVEY_COOLDOWN_MINUTES: 5,             // 5 minute cooldown between analyses
};
```

### Rate Limit Tiers

1. **Hourly Limit**: 10 analyses per user per hour
2. **Daily Limit**: 50 analyses per user per day
3. **Per-Survey Limit**: 5 analyses maximum for each survey per user
4. **Cooldown Period**: 5 minutes between consecutive analyses of the same survey

### Rate Limit Errors (429 Too Many Requests)

**Hourly Limit Exceeded:**
```json
{
  "success": false,
  "message": "Has alcanzado el límite de 10 análisis por hora. Intenta en 45 minuto(s)",
  "error": "HOURLY_LIMIT_EXCEEDED",
  "retryAfter": 2700,
  "limit": {
    "type": "hourly",
    "max": 10,
    "current": 10,
    "resetIn": 2700
  }
}
```

**Cooldown Active:**
```json
{
  "success": false,
  "message": "Por favor espera 3 minuto(s) antes de analizar esta encuesta nuevamente",
  "error": "COOLDOWN_ACTIVE",
  "retryAfter": 180,
  "limit": {
    "type": "survey_cooldown",
    "resetIn": 180
  }
}
```

### Adjusting Rate Limits

For development, you can modify limits in `src/middlewares/aiRateLimit.js`:

```javascript
// Development settings (more permissive)
const AI_RATE_LIMIT_CONFIG = {
  MAX_ANALYSES_PER_USER_PER_HOUR: 100,
  MAX_ANALYSES_PER_USER_PER_DAY: 500,
  MAX_ANALYSES_PER_SURVEY_PER_USER: 50,
  SURVEY_COOLDOWN_MINUTES: 0,  // Disable cooldown
};
```

**Important**: Remember to restore production limits before deployment.

### Checking Rate Limit Status

Users can check their remaining quota:

```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:5000/api/ai/rate-limit-status
```

Response:
```json
{
  "success": true,
  "data": {
    "hourly": {
      "used": 3,
      "remaining": 7,
      "limit": 10,
      "resetIn": 2145
    },
    "daily": {
      "used": 15,
      "remaining": 35,
      "limit": 50,
      "resetIn": 45678
    }
  }
}
```

### Resetting Rate Limits (Admin Only)

For development or testing purposes, reset all rate limits:

```bash
# Clear all Redis rate limit keys
docker exec -it survey_redis redis-cli FLUSHDB

# Or reset specific user
docker exec -it survey_redis redis-cli DEL ai:ratelimit:user:{userId}:hour
docker exec -it survey_redis redis-cli DEL ai:ratelimit:user:{userId}:day
```

## Interactive API Documentation

Access the Swagger UI documentation at:

```
http://localhost:5000/api-docs
```

The documentation provides:
- Complete endpoint specifications
- Request/response schemas
- Interactive API testing interface
- Authentication instructions

## Health Check

Verify server status and connectivity:

```bash
curl http://localhost:5000/api/health
```

Expected response:

```json
{
  "status": "OK",
  "message": "Survey API is running",
  "timestamp": "2026-01-30T19:45:00.000Z"
}
```

## NPM Scripts

```bash
npm start           # Start production server
npm run dev         # Start development server with nodemon
```

## Database Schema

### MongoDB Collections

#### Users Collection
- Stores user account information
- Supports both local and OAuth authentication
- Implements role-based access control

#### Surveys Collection
- Contains survey definitions and settings
- Tracks survey status and metadata
- References survey creator

#### Responses Collection
- Stores survey response data
- Links responses to surveys and respondents
- Maintains submission timestamps

### Database Indexes

```javascript
// Users Collection
users.email (unique)
users.githubId (unique, sparse)

// Surveys Collection
surveys.creator
surveys.status
surveys.createdAt

// Responses Collection
responses.surveyId
responses.respondentEmail
responses.createdAt
```

## Redis Cache Structure

### Rate Limiting Keys

```
ai:ratelimit:user:{userId}:hour          # Hourly counter
ai:ratelimit:user:{userId}:day           # Daily counter
ai:ratelimit:survey:{surveyId}:user:{userId}  # Per-survey counter
ai:cooldown:survey:{surveyId}:user:{userId}   # Cooldown timer
```

### Cache Keys

```
cache:survey:{surveyId}
cache:responses:{surveyId}
```

## Automated Tasks

### Survey Auto-Closure

The system implements a cron job that runs hourly to automatically close surveys when they reach:
- Configured end date and time
- Maximum response limit

The job ensures data integrity and prevents responses to expired surveys.

## Debugging and Monitoring

### View MongoDB Logs

```bash
docker-compose logs -f mongo
```

### View Redis Logs

```bash
docker-compose logs -f redis
```

### Access MongoDB Shell

```bash
docker exec -it survey_mongodb mongosh
use survey_db
db.surveys.find().pretty()
db.users.countDocuments()
```

### Access Redis CLI

```bash
docker exec -it survey_redis redis-cli
KEYS *
GET ai:ratelimit:user:123:hour
TTL ai:ratelimit:user:123:hour
```

### Monitor Redis Memory Usage

```bash
docker exec -it survey_redis redis-cli INFO memory
```

### Monitor AI Analysis Usage

```bash
# Check all AI-related keys
docker exec -it survey_redis redis-cli KEYS "ai:*"

# Check specific user's hourly usage
docker exec -it survey_redis redis-cli GET ai:ratelimit:user:{userId}:hour

# Check cooldown for specific survey
docker exec -it survey_redis redis-cli TTL ai:cooldown:survey:{surveyId}:user:{userId}
```

## Troubleshooting

### MongoDB Connection Failure

```bash
# Restart MongoDB service
docker-compose restart mongo

# Check MongoDB logs
docker-compose logs mongo

# Verify MongoDB is listening
docker exec -it survey_mongodb mongosh --eval "db.adminCommand('ping')"
```

### Redis Connection Issues

```bash
# Restart Redis service
docker-compose restart redis

# Test Redis connectivity
docker exec -it survey_redis redis-cli PING

# Check Redis status
docker-compose logs redis
```

### Port Conflict on 5000

```bash
# Identify process using port 5000
lsof -i :5000

# Terminate conflicting process
kill -9 <PID>

# Alternative: Change port in .env
PORT=5001
```

### Groq API Errors

**Model Decommissioned Error:**
```
Error: The model `llama3-70b-8192` has been decommissioned
```

**Solution**: Update model in `src/services/aiService.js` to current model (`llama-3.3-70b-versatile`)

**API Key Invalid:**
```
Error: Invalid API key
```

**Solution**: Verify `GROQ_API_KEY` in `.env` file is correct

**Rate Limit from Groq:**
```
Error: Rate limit exceeded
```

**Solution**: Wait for Groq's rate limit to reset or upgrade your Groq account

### Rate Limiting Issues

**Rate Limiting Not Working:**

```bash
# Verify Redis is running
docker-compose ps redis

# Check Redis keys
docker exec -it survey_redis redis-cli KEYS "ai:*"

# Test Redis connection
docker exec -it survey_redis redis-cli PING
```

**User Can't Analyze (Cooldown):**

```bash
# Check remaining cooldown time
docker exec -it survey_redis redis-cli TTL ai:cooldown:survey:{surveyId}:user:{userId}

# Reset cooldown (development only)
docker exec -it survey_redis redis-cli DEL ai:cooldown:survey:{surveyId}:user:{userId}
```

**Reset All User Limits:**

```bash
# Clear all rate limit keys for specific user
docker exec -it survey_redis redis-cli DEL ai:ratelimit:user:{userId}:hour
docker exec -it survey_redis redis-cli DEL ai:ratelimit:user:{userId}:day
```

## Security Measures

The application implements the following security practices:

- **Password Security**: Bcrypt hashing with 10 salt rounds
- **Token Security**: JWT with configurable expiration
- **CORS Protection**: Configured allowed origins
- **Rate Limiting**: API abuse prevention for AI endpoints
- **Input Validation**: Request data sanitization
- **HTTP Security Headers**: Security best practices
- **Container Security**: Non-root user execution
- **Environment Variables**: Sensitive data protection
- **API Key Protection**: Groq API key stored securely in environment

## Production Deployment

### Docker Production Build

```bash
# Build production image
docker build -t survey-backend:latest .

# Run production container
docker run -d \
  --name survey-backend \
  -p 5000:5000 \
  --env-file .env.production \
  survey-backend:latest
```

### Production Environment Variables

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://production-mongo:27017/survey_db
REDIS_HOST=production-redis
CORS_ORIGIN=https://your-production-domain.com
FRONTEND_URL=https://your-production-domain.com
JWT_SECRET=strong_production_secret_key
SESSION_SECRET=strong_session_secret_key
GROQ_API_KEY=your_production_groq_api_key
```

### Health Check Endpoint

The Docker container includes a health check that monitors:
- Server responsiveness
- Database connectivity
- Service availability

Configuration in Dockerfile:

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"
```

## Performance Optimization

- **Redis Caching**: Reduces database queries
- **Database Indexing**: Optimizes query performance
- **Connection Pooling**: Efficient resource utilization
- **Lazy Loading**: On-demand data retrieval
- **Compression**: Response payload optimization
- **Rate Limiting**: Prevents AI API abuse and manages costs

## System Requirements

### Minimum Requirements
- CPU: 2 cores
- RAM: 2GB
- Storage: 10GB
- Network: 100Mbps

### Recommended Requirements
- CPU: 4 cores
- RAM: 4GB
- Storage: 20GB SSD
- Network: 1Gbps

## Cost Management

### Groq API Usage

Monitor your Groq API usage to manage costs:
- Free tier: Check [Groq pricing](https://groq.com/pricing)
- Rate limiting helps control costs
- Monitor usage in Groq console

### Optimization Tips

1. Set appropriate rate limits based on user base
2. Enable Redis caching to reduce redundant analyses
3. Monitor and log AI analysis patterns
4. Consider caching AI results for frequently analyzed surveys

## License

This project is proprietary and confidential. All rights reserved by Universidad Central del Ecuador.

## Support and Maintenance

For technical support, system maintenance, or bug reports, please contact the system administrator.

## Development Team

Developed and maintained by the UCE Survey System Development Team.

## Version History

- **v1.0.0** - Initial release with core functionality
  - User authentication and authorization
  - Survey creation and management
  - Response collection
  - AI-powered analysis with Groq (llama-3.3-70b-versatile)
  - Multi-tier rate limiting implementation
  - Administrative dashboard

## Contributing

This is a closed-source institutional project. Contributions are limited to authorized development team members only.

## Acknowledgments

Special thanks to Universidad Central del Ecuador for supporting this project development.