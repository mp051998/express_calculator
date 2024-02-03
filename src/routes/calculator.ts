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
   * @openapi
   * /init:
   *   post:
   *     tags:
   *       - Calculator 
   *     summary: Initializes a new calculator instance.
   *     description: Initializes a new calculator instance and performs the first operation.
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               num1:
   *                 type: number
   *                 description: The first operand/number for the operation.
   *                 example: 5
   *               num2:
   *                 type: number
   *                 description: The second number/operand for the operation.
   *                 example: 3
   *               operator:
   *                 type: string
   *                 description: The operator for the operation. It can be add, subtract, multiply, or divide.
   *                 example: "add"
   *             required:
   *               - num1
   *               - num2
   *               - operator
   *     responses:
   *       '201':
   *         description: Created
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 result:
   *                   type: number
   *                   description: The result of the operation.
   *                   example: 8
   *                 totalOps:
   *                   type: number
   *                   description: The total number of operations performed.
   *                   example: 1
   *                 id:
   *                   type: number
   *                   description: The unique ID of the calculator instance.
   *                   example: 12345
   *       '400':
   *         description: Bad Request
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   description: Indicates if the operation was successful. Value will always be false in this case
   *                   example: false
   *                 error:
   *                   type: string
   *                   description: The error message.
   *                   example: "Invalid operator"    
   * 
   */
  init(req: Request, res: Response) {
    const { num1, num2, operator } = req.body;

    // Logic to calculate the result
    const { result, error } = calculatorHelper.performOperation(num1, num2, operator);

    if (error) {
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
   * @openapi
   * /operation:
   *   post:
   *     tags:
   *       - Calculator 
   *     summary: Performs an operation on a calculator instance.
   *     description: Performs an operation on a calculator instance using the given ID.
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               num:
   *                 type: number
   *                 description: The number/operand for the operation.
   *                 example: 5
   *               operator:
   *                 type: string
   *                 description: The operator for the operation. It can be add, subtract, multiply, or divide.
   *                 example: "add"
   *               id:
   *                 type: number
   *                 description: The unique ID of the calculator instance.
   *                 example: 12345
   *             required:
   *               - num
   *               - operator
   *               - id
   *     responses:
   *       '200':
   *         description: OK
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 result:
   *                   type: number
   *                   description: The result of the operation.
   *                   example: 8
   *                 totalOps:
   *                   type: number
   *                   description: The total number of operations performed.
   *                   example: 2
   *                 id:
   *                   type: number
   *                   description: The unique ID of the calculator instance.
   *                   example: 12345
   *       '400':
   *         description: Bad Request
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean 
   *                   description: Indicates if the operation was successful. Value will always be false in this case
   *                   example: false
   *                 error:
   *                   type: string
   *                   description: The error message.
   *                   example: "Invalid operator"
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
    const { result, error } = calculatorHelper.performOperation(lastOperand, num, operator);

    if (error) {
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
   * @openapi
   * /undo:
   *   put:
   *     tags:
   *       - Calculator 
   *     summary: Undo the last operation performed on the calculator instance.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               id:
   *                 type: number
   *                 description: The unique ID of the calculator instance.
   *                 example: 12345
   *     responses:
   *       '200':
   *         description: OK
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 result:
   *                   type: number
   *                   description: The result of the operation.
   *                   example: 8
   *                 totalOps:
   *                   type: number
   *                   description: The total number of operations performed.
   *                   example: 2
   *                 id:
   *                   type: number
   *                   description: The unique ID of the calculator instance.
   *                   example: 12345
   *       '400':
   *         description: Bad Request
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   description: The error message.
   *                   example: "Invalid ID"
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
    * @openapi
    * /reset:
    *   get:
   *     tags:
   *       - Calculator 
    *     summary: Reset the calculator instance associated with the given ID.
    *     parameters:
    *       - in: query
    *         name: id
    *         schema:
    *           type: number
    *         required: true
    *         description: The ID of the calculator instance to reset.
    *     responses:
    *       '200':
    *         description: OK
    *         content:
    *           application/json:
    *             schema:
    *               type: object
    *               properties:
    *                 success:
    *                   type: boolean
    *                   description: Indicates if the reset was successful.
    *                   example: true
    *                 message:
    *                   type: string
    *                   description: The success message.
    *                   example: "Calculator 12345 is now reset"
    *       '400':
    *         description: Bad Request
    *         content:
    *           application/json:
    *             schema:
    *               type: object
    *               properties:
    *                 error:
    *                   type: string
    *                   description: The error message.
    *                   example: "Could not find instance associated with ID"
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