import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'UCE Survey System API',
      version: '1.0.0',
      description: 'API documentation for the UCE Survey Management System. This API allows users to create, manage, and respond to surveys with AI-powered analysis.',
      contact: {
        name: 'UCE Development Team',
        email: 'admin@uce.edu.ec'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server'
      },
      {
        url: 'http://localhost:5000',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token obtained from login/register'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            name: { type: 'string', example: 'Juan Pérez' },
            email: { type: 'string', example: 'juan@uce.edu.ec' },
            role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Survey: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string', example: 'Encuesta de Satisfacción' },
            description: { type: 'string' },
            creator: { type: 'string', description: 'User ID' },
            questions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  text: { type: 'string' },
                  type: { type: 'string', enum: ['text', 'multiple', 'scale', 'date'] },
                  options: { type: 'array', items: { type: 'string' } },
                  required: { type: 'boolean' }
                }
              }
            },
            status: { type: 'string', enum: ['draft', 'active', 'closed'] },
            responseCount: { type: 'number' }
          }
        },
        Response: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            surveyId: { type: 'string' },
            respondentEmail: { type: 'string', example: 'respondent@uce.edu.ec' },
            answers: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  questionId: { type: 'string' },
                  value: { type: 'string' }
                }
              }
            },
            submittedAt: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error message' }
          }
        }
      }
    },
    tags: [
      {
        name: 'Auth',
        description: 'Authentication and user management endpoints'
      },
      {
        name: 'Surveys',
        description: 'Survey creation and management'
      },
      {
        name: 'Responses',
        description: 'Survey response submission and retrieval'
      },
      {
        name: 'Admin',
        description: 'Admin-only endpoints for user management'
      },
      {
        name: 'AI',
        description: 'AI-powered analysis endpoints'
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js'
  ]
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;