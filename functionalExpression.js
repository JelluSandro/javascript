"use strict";

const cnst = value => () => value;
const variable = name => {
    switch (name) {
        case 'x':
            name = 0;
            break;
        case 'y':
            name = 1;
            break;
        default:
            name = 2;
            break;
    }
    return (...variables) => variables[name];
};
const operation = oper => {
    let f = (...expression) => (...variables) => oper(...expression.map(currentValue => currentValue(...variables)));
    f.size = oper.length;
    return f;
};
const add = operation((a, b) => a + b);
const subtract = operation((a, b) => a - b);
const divide = operation((a, b) => a / b);
const multiply = operation((a, b) => a * b);
const negate = operation(a => -a);
const madd = operation((a, b, c) => a * b + c);
const floor = operation(a => Math.floor(a));
const one = cnst(1);
const two = cnst(2);
const ceil = operation(a => Math.ceil(a));
const operations = {
    "+": add,
    "-": subtract,
    "/": divide,
    "*": multiply,
    "negate": negate,
    "floor": floor,
    "ceil": ceil,
    "madd": madd,
    "_": floor,
    "^": ceil,
    "*+": madd
}
const parse = input => {
    let arr = [];
    for (const it of input.trim().split(/\s+/)) {
        if (it in operations) {
            const op = operations[it];
            arr.push(op(...arr.splice(-op.size)));
        } else {
            switch (it) {
                case "one":
                    arr.push(one);
                    break;
                case "two":
                    arr.push(two);
                    break;
                default:
                    if (isFinite(it)) {
                        arr.push(cnst(+it));
                    } else {
                        arr.push(variable(it));
                    }
            }
        }
    }
    return arr.pop();
};
