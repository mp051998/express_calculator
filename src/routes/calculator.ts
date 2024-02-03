import * as calculatorHelper from '../helpers/calculator';

import { Request, Response } from 'express';

import { Express } from 'express';

// import { v4 as uuid } from 'uuid';

/**
 * Represents a calculator route that handles various operations.
 */
export class CalculatorRoute {

  // A map to store the history of operations for each calculator instance in memory.
  history: Map<number, Array<{ operator: string, result: number }>> = new Map();

  constructor(app: Express) {
    this.registerRoutes(app);
  }

  /**
   * 
   * @param app - The Express application object.
   *  It is used to register the routes for the calculator.
   *  The routes are:
   *    - POST /init
   *    - POST /operation
   *    - PUT /undo
   *    - GET /reset
   * 
   * 
   */
  registerRoutes(app: Express) {
    app.post('/init', this.init.bind(this));
    app.post('/operation', this.operation.bind(this));
    app.put('/undo', this.undo.bind(this));
    app.get('/reset', this.reset.bind(this));

    console.log("Registered Calculator route(s)");
  }

  /**
   * Generates a unique ID for a calculator instance.
   * 
   * @returns A unique ID.
   */
  generateID() {
    // // TODO: If id can be a string, use this instead as it will always be unique
    // return uuid();
    let id = Math.floor(Math.random() * 1000000);
    while (this.history.has(id)) {
      id = Math.floor(Math.random() * 1000000);
    }
    return id;
  }

  /**
   * Initializes a new calculator instance with the given numbers and operator and returns the result.
   * 
   * @param req - The request object.
   * @param res - The response object.
   *          
   */
  init(req: Request, res: Response) {
    const { num1, num2, operator } = req.body;

    // Logic to calculate the result
    const { success, result, error } = calculatorHelper.performOperation(num1, num2, operator);

    if (!success) {
      res.status(400).json({
        success: false,
        error: error
      });
      return;
    }

    let id = this.generateID();
    let responseData = {
      result: result,
      totalOps: 1,
      id: id
    }

    // Add this to history
    this.history.set(id, [{ operator: operator, result: result! }]);

    res.status(201).json(responseData);
  }

  /**
   * Performs the requested operation based on the provided parameters.
   * 
   * @param req - The request object.
   * @param res - The response object.
   */
  operation(req: Request, res: Response) {
    const { num, operator, id } = req.body;

    // Logic to calculate the result
    // let result, error;
    let instanceHistory = this.history.get(id);
    if (!instanceHistory) {
      res.status(400).json({ error: 'Invalid ID' });
      return;
    }

    let totalOps = instanceHistory.length;
    const lastOperand = instanceHistory[totalOps - 1]['result'];
    const { success, result, error } = calculatorHelper.performOperation(lastOperand, num, operator);

    if (!success) {
      res.status(400).json({
        success: false,
        error: error
      });
    }

    instanceHistory.push({ operator: operator, result: result! });
    this.history.set(id, instanceHistory);
    totalOps += 1;

    return res.status(200).json({ result, totalOps, id });
  }

  /**
   * Undo the last operation for a given ID.
   * 
   * @param req - The request object.
   * @param res - The response object.
   */
  undo(req: Request, res: Response) {
    const { id } = req.body;

    // Logic to calculate the result
    let instanceHistory = this.history.get(id);
    if (!instanceHistory) {
      res.status(400).json({ error: 'Invalid ID' });
      return;
    }

    instanceHistory.pop();
    this.history.set(id, instanceHistory);

    if (instanceHistory.length === 0) {
      this.history.delete(id);
      return res.status(200).json({ message: 'History cleared' });
    }

    let totalOps = instanceHistory.length;
    let result = instanceHistory[totalOps - 1]['result'];
    return res.status(200).json({ result, totalOps, id });
  }

  /**
   * Resets the calculator instance associated with the given ID.
   * 
   * @param req - The request object.
   * @param res - The response object.
   */
  reset(req: Request, res: Response) {
    const id: number = Number(req.query.id);

    // Logic to calculate the result
    let instanceHistory = this.history.get(id);
    if (!instanceHistory) {
      res.status(400).json({ error: 'Could not find instance associated with ID' });
      return;
    }

    this.history.delete(id);
    return res.status(200).json({
      success: true,
      message: `Calculator ${id} is now reset`
    });
  }

}