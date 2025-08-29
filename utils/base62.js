const BASE62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

function encodeBase62(numStr) {
    let n = BigInt(numStr);
    if (n === 0n) return '0';
    let s = '';
    while (n > 0n) {
        const rem = Number(n % 62n);
        s = BASE62[rem] + s;
        n = n / 62n;
    }
    return s;
}

module.exports = encodeBase62;