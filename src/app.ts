import { CalculatorRoute } from './routes/calculator';
import { configDotenv } from 'dotenv';
import express from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// Load the environment variables
configDotenv();

const app = express();

// Check if this is a test environment and then set the port
const isTest = process.env.NODE_ENV === 'test';

// Set the port
const port = process.env.PORT || 3000;

// Allow JSON parsing
app.use(express.json());

// Register the routes
new CalculatorRoute(app);

// Set up swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Calculate Express App API Documentation',
      version: '1.0.0',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
  ],
  apis: ['./src/routes/*.ts'], // files containing the routes with spec comments
};
const openapiSpecification = swaggerJsdoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification));


// Start the server if this is not a test environment
if (!isTest) {
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}

export { app };
