import { CalculatorRoute } from './routes/calculator';
import { configDotenv } from 'dotenv';
import express from 'express';

// Load the environment variables
configDotenv();

const app = express();
const port = process.env.PORT || 3000;

// Allow JSON parsing
app.use(express.json());

// Register the routes
new CalculatorRoute(app);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
