import { CalculatorRoute } from './routes/calculator';
import { configDotenv } from 'dotenv';
import express from 'express';

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

// Start the server if this is not a test environment
if (!isTest) {
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}

export { app };
