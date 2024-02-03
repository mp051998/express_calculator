interface OperationResult {
  success: boolean;
  result?: number;
  error?: string;
}

export function performOperation(operand1: number, operand2: number, operator: string): OperationResult {
  let error = '';
  let result = 0;
  switch (operator) {
    case 'add':
      result = operand1 + operand2;
      break;
    case 'subtract':
      result = operand1 - operand2;
      break;
    case 'multiply':
      result = operand1 * operand2;
      break;
    case 'divide':
      result = operand1 / operand2;
      break;
    default:
      error = 'Invalid operator';
  }

  if (error) {
    return {
      success: false,
      error: error
    };
  }

  return {
    success: true,
    result: result
  };
}
