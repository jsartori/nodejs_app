const app = require('./app')

test('test addition', () => {
    const result = app.executeCalculation({ operation: "addition", left: 10, right: 5 });
    expect(result).toEqual(15);
})

test('test subtraction', () => {
    const result = app.executeCalculation({ operation: "subtraction", left: 10, right: 5 });
    expect(result).toEqual(5);
})

test('test multiplication', () => {
    const result = app.executeCalculation({ operation: "multiplication", left: 10, right: 5 });
    expect(result).toEqual(50);
})

test('test division', () => {
    const result = app.executeCalculation({ operation: "division", left: 10, right: 5 });
    expect(result).toEqual(2);
})

test('test remainder', () => {
    const result = app.executeCalculation({ operation: "remainder", left: 10, right: 5 });
    expect(result).toEqual(0);
})
