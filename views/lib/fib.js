function fib(n) {
    if (n < 3) return n;
    return fib(n - 1) + fib(n - 2);
}

console.time('fib');
console.log(fib(40));
console.timeEnd('fib');


function betterFib(n, n1, n2) {
    if (!n1) n1 = 1;
    if (!n2) n2 = 1;
    if (--n !== 0) return betterFib(n, n2, n1+n2);
    return n2;
}

console.time('betterFib');
console.log(betterFib(40));
console.timeEnd('betterFib');


var betterFib2 = (function () {
    var cache = {};
    return function (n) {
        if (n < 3) return n;
        if (cache[n]) return cache[n];
        return cache[n] = betterFib2(n-1) + betterFib2(n-2);
    };
})();

console.time('betterFib2');
console.log(betterFib2(40));
console.timeEnd('betterFib2');
