import { Server } from 'http';
import { app } from '../app';
import request from 'supertest';

let server: Server;

beforeAll(() => {
  server = app.listen();
});

afterAll((done) => {
  server.close(done);
});

// This is a simple test to check if the calculator flow is working as expected
it('Should create a calculator instance, perform some operations, undo and reset', async () => {
  let response;

  // Initialize the calculator instance
  response = await request(app).post('/init').send({
    num1: 10,
    num2: 20,
    operator: 'add'
  })
  expect(response.status).toBe(201);
  expect(response.body.result).toBe(30);
  expect(response.body.totalOps).toBe(1);
  expect(Number(response.body.id)).toBeGreaterThan(0);

  // Save the calculator instance ID
  const id = response.body.id;

  // Now perform an operation
  response = await request(app).post('/operation').send({
    num: 10,
    operator: 'multiply',
    id: id
  });
  expect(response.status).toBe(200);
  expect(response.body.result).toBe(300);
  expect(response.body.totalOps).toBe(2);
  expect(Number(response.body.id)).toBeGreaterThan(0);

  // Now perform the other operations as well (subtraction & division)
  response = await request(app).post('/operation').send({
    num: 10,
    operator: 'subtract',
    id: id
  });
  expect(response.status).toBe(200);
  expect(response.body.result).toBe(290);
  expect(response.body.totalOps).toBe(3);
  expect(Number(response.body.id)).toBeGreaterThan(0);

  response = await request(app).post('/operation').send({
    num: 10,
    operator: 'divide',
    id: id
  });
  expect(response.status).toBe(200);
  expect(response.body.result).toBe(29);
  expect(response.body.totalOps).toBe(4);
  expect(Number(response.body.id)).toBeGreaterThan(0);

  // Now try to perform an undo operation
  response = await request(app).put('/undo').send({
    id: id
  });
  expect(response.status).toBe(200);
  expect(response.body.result).toBe(290);
  expect(response.body.totalOps).toBe(3);
  expect(Number(response.body.id)).toBeGreaterThan(0);

  // Now try to perform a reset operation
  response = await request(app).get(`/reset?id=${id}`);
  expect(response.status).toBe(200);
  expect(response.body.message).toBe(`Calculator ${id} is now reset`);
});


// A test which creates a calculator instance, performs a few operations 
//  and keeps undoing until the history is cleared
it('Should create a calculator instance, perform some operations and undo until history is cleared', async () => {
  let response;

  response = await request(app).post('/init').send({
    num1: 10,
    num2: 1.5,
    operator: 'multiply'
  });
  expect(response.status).toBe(201);
  expect(response.body.result).toBe(15);
  expect(response.body.totalOps).toBe(1);
  expect(Number(response.body.id)).toBeGreaterThan(0);

  const id = response.body.id;

  // Now perform an operation
  response = await request(app).post('/operation').send({
    num: 10,
    operator: 'add',
    id: id
  });
  expect(response.status).toBe(200);
  expect(response.body.result).toBe(25);
  expect(response.body.totalOps).toBe(2);
  expect(Number(response.body.id)).toBeGreaterThan(0);

  // Now perform the other operations as well (subtraction & division)
  response = await request(app).post('/operation').send({
    num: 5,
    operator: 'subtract',
    id: id
  });
  expect(response.status).toBe(200);
  expect(response.body.result).toBe(20);
  expect(response.body.totalOps).toBe(3);
  expect(Number(response.body.id)).toBeGreaterThan(0);

  // Now keep undoing until the history is cleared
  response = await request(app).put('/undo').send({
    id: id
  });
  expect(response.status).toBe(200);
  expect(response.body.result).toBe(25);
  expect(response.body.totalOps).toBe(2);
  expect(Number(response.body.id)).toBeGreaterThan(0);

  response = await request(app).put('/undo').send({
    id: id
  });
  expect(response.status).toBe(200);
  expect(response.body.result).toBe(15);
  expect(response.body.totalOps).toBe(1);
  expect(Number(response.body.id)).toBeGreaterThan(0);

  response = await request(app).put('/undo').send({
    id: id
  });
  expect(response.status).toBe(200);
  expect(response.body.message).toBe('History cleared');
});

it("Should check if division by zero is handled", async () => {
  let response;

  response = await request(app).post('/init').send({
    num1: 10,
    num2: 0,
    operator: 'divide'
  });
  expect(response.status).toBe(400);
  expect(response.body.error).toBe('Cannot divide by zero');
});
