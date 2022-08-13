"use strict";
//Homework6
function OperationFactory(sign, func, diff) {
    let construct = function(...args) {
        this.args = args;
        this.diff = diff(...args);
    };
    construct.sz = func.length;
    construct.prototype.sign = sign;
    construct.prototype.func = func;
    construct.prototype.evaluate = function(...variables) {
        return this.func(...this.args.map(currentValue => currentValue.evaluate(...variables)));
    }
    construct.prototype.toString = function() {
        return this.args.reduce((sum, cur) => sum + " " + cur.toString()) + " " + this.sign;
   }
    construct.prototype.prefix = function() {
        return "(" + this.sign + this.args.reduce((sum, cur) => sum + " " + cur.prefix(), "") + ")";
    }
    construct.prototype.postfix = function() {
        return "(" + this.args.reduce((sum, cur) => sum + cur.postfix() + " ", "") + this.sign + ")";
    }
    return construct;
};
const Add = OperationFactory(
    "+",
    (a, b) => a + b,
    (x, y) => name => new Add(x.diff(name), y.diff(name))
);
const Subtract = OperationFactory(
    "-",
    (a, b) => a - b,
    (x, y) => name => new Subtract(x.diff(name), y.diff(name))
);
const Multiply = OperationFactory(
    "*",
    (a, b) => a * b,
    (x, y) => name => new Add(new Multiply(x.diff(name), y), new Multiply(x, y.diff(name)))
);
const Divide = OperationFactory(
    "/",
    (a, b) => a / b,
    (x, y) => name => new Divide(new Subtract(new Multiply(x.diff(name), y),
    new Multiply(x, y.diff(name))), new Multiply(y, y))
);
const Negate = OperationFactory(
    "negate",
    (a) => -a,
    x => name => new Negate(x.diff(name))
);
const Hypot = OperationFactory(
    "hypot",
    (a, b) => a * a + b * b,
    (x, y) => name => new Add(new Multiply(x, x), new Multiply(y, y)).diff(name)
);
const HMean = OperationFactory(
    "hmean",
    (a, b) => 2 / (1 / a + 1 / b),
    (x, y) => name => new Divide(two, new Add(new Divide(one, x), new Divide(one, y))).diff(name)
);
const Sumsq =  OperationFactory(
    "sumsq",
    (...args) => args.reduce((sum, cur) => sum + cur * cur, 0),
    (...args) => name => (args.reduce((sum, cur) => new Add(sum, new Multiply(cur, cur))
    , zero)).diff(name)
);
const ArithMean =  OperationFactory(
    "arith-mean",
    (...args) => (args.reduce((sum, cur) => sum + cur, 0)) / args.length,
    (...args) => name => new Divide((args.reduce((sum, cur) => new Add(sum, cur)
    , zero)), new Const(args.length)).diff(name)
);
const GeomMean =  OperationFactory(
    "geom-mean",
    (...args) => Math.abs(args.reduce((sum, cur) => sum * cur, 1)) ** (1 / args.length),
    (...args) => function(name) {
        let ans = new Divide(new Abs((args.reduce((sum, cur) => new Multiply(sum, cur)
        , one))).diff(name), new Const(args.length));
        //println(ans.evaluate(2,2,2));
        //println(ans.evaluate(2,3,2));
        for (let i = 0; i < args.length - 1; i++) {
            ans = new Divide(ans, this);
        }
        return ans;
    }
);
const HarmMean =  OperationFactory(
    "harm-mean",
    (...args) => args.length / (args.reduce((sum, cur) => sum + 1 / cur, 0)),
    (...args) => name => new Divide(new Const(args.length),
    (args.reduce((sum, cur) => new Add(sum, new Divide(one, cur))
    , zero))).diff(name)
);
const Abs = OperationFactory(
    "abs",
    x => Math.abs(x),
    x => name => new Multiply(new Sign(x), x.diff(name))
);
const Sign = OperationFactory(
    "sign",
    function(x) {
        if (x === 0) {
            return 0;
        }
        if (x < 0) {
            return -1;
        }
        return 1;
    },
    x => name => zero
);
const zero = new Const (0);
const one = new Const (1);
const two = new Const (2);

function Const(value) {
    this.value = value;
    this.evaluate = function() {
        return this.value;
    }
    this.toString = function() {
        return "" + this.value;
    }
    this.prefix = function() {
        return "" + this.value;
    }
    this.postfix = function() {
        return "" + this.value;
    }
    this.diff = function() {
        return zero;
    }
}

const nameVar = {
    "x": 0,
    "y": 1,
    "z": 2
}

function Variable(variable) {
    const name = nameVar[variable];
    this.variable = variable;
    this.evaluate = (...variables) => variables[name];
    this.toString = function() {
        return variable;
    }
    this.prefix = function() {
        return variable;
    }
    this.postfix = function() {
        return variable;
    }
    this.diff = function(name) {
        if (this.variable === name) {
            return one;
        }
        return zero;
    }
}
const operations = {
    "+": Add,
    "-": Subtract,
    "/": Divide,
    "*": Multiply,
    "negate": Negate,
    "hypot": Hypot,
    "hmean": HMean,
    "sumsq": Sumsq,
    "arith-mean": ArithMean,
    "geom-mean": GeomMean,
    "harm-mean": HarmMean
}
const unary = {
    "+": Add,
    "-": Subtract,
    "/": Divide,
    "*": Multiply
}
function parse(input) {
    let arr = [];
    for (const it of input.trim().split(/\s+/))         {
        if (it in operations) {
            const op = operations[it];
            arr.push(new op(...arr.splice(-op.sz)));
        } else if (isFinite(it)) {
            arr.push(new Const(+it));
        } else {
            arr.push(new Variable(it));
        }
    }
    return arr.pop();
}

//HomeWork 7
//TL

function parsePrefix(input) {
    return parser(input, 0);
}
function parsePostfix(input) {
    return parser(input.split("").reverse().join(""), 1);
}

function ParserError(message, where) {
    this.message = message + " in " + where;
    this.where = where;
}
ParserError.prototype = Object.create(Error.prototype);
ParserError.prototype.name = "ParserError";
ParserError.prototype.constructor = ParserError;

function parser(input, flag) {
    const len = input.length;
    if (len === 0) {
        throw new ParserError("Empty input");
    }
    const arr = [];
    let close = 0;
    let s = "";
    let openBr = '(';
    let closeBr = ')';
    if (flag === 1) {
        openBr = ')';
        closeBr = '(';
    }
    let i = 0;
    function where() {
        if (flag) return len - i;
        return i;
    }
    function parseS() {
        if (s !== "") {
            if (flag === 1) {
                s = s.split("").reverse().join("");
            }
            if (s in operations) {
                arr.push(s);
            } else if (isFinite(s[0]) || (s[0] in unary)) {
                    if (!isFinite(s)) {
                        throw new ParserError("Invalid number : " + s, where());
                    }
                    arr.push(new Const(+s));
                } else {
                    if (!(s in nameVar)) {
                        throw new ParserError("Unknown variable : " + s, where());
                    }
                    arr.push(new Variable(s));
                }
            s = "";
        }
    }
    for (; i < len; i++) {
        if (input[i] === ' ') {
            parseS()
        } else if (input[i] === openBr) {
            parseS();
            close++;
        } else if (input[i] === closeBr) {
            close--;
            if (close < 0) {
                throw new ParserError("Missing " + openBr, where());
            }
            parseS()
            let cnt = 0;
            let lenOp = arr.length;
            while (lenOp - cnt >= 0 && !(arr[lenOp - cnt] in operations)) {
                cnt++;
            }
            if (lenOp - cnt < 0) {
                throw new ParserError("Expected operation, found " + arr[0] + " with " + (cnt - 2) + " arguments", where());
            }
            const op = operations[arr[lenOp - cnt]];
            if (op.sz !== 0 && op.sz !== cnt - 1) {
                throw new ParserError("Found " + (cnt - 1) + " args, need " + op.sz, where());
            }
            let y;
            if (flag === 1) {
                y = new op(...arr.splice(-cnt + 1).reverse());
            } else {
                y = new op(...arr.splice(-cnt + 1));
            }
            arr.pop();
            arr.push(y);
        } else {
            s += input[i];
        }
    }
    if (close !== 0) {
        throw new ParserError("Missing " + closeBr, "first brackets");
    }
    parseS();
    if (arr.length !== 1) {
        throw new ParserError("Excessive info", "first brackets")
    }
    return arr.pop();
}
//let x = new GeomMean(new Variable('x'), new Variable('y')).diff('x').evaluate(2, 2, 2);
//console.log(x);
//let x = parsePostfix("(2 5 sumsq)").evaluate(0, 0, 0);
//console.log(x)
//let x = parsePostfix("10");
//console.log(x);