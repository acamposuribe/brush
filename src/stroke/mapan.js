(function() {
    const n = document.createElement("link").relList;
    if (n && n.supports && n.supports("modulepreload"))
        return;
    for (const p of document.querySelectorAll('link[rel="modulepreload"]'))
        a(p);
    new MutationObserver(p => {
        for (const R of p)
            if (R.type === "childList")
                for (const F of R.addedNodes)
                    F.tagName === "LINK" && F.rel === "modulepreload" && a(F)
    }
    ).observe(document, {
        childList: !0,
        subtree: !0
    });
    function r(p) {
        const R = {};
        return p.integrity && (R.integrity = p.integrity),
        p.referrerpolicy && (R.referrerPolicy = p.referrerpolicy),
        p.crossorigin === "use-credentials" ? R.credentials = "include" : p.crossorigin === "anonymous" ? R.credentials = "omit" : R.credentials = "same-origin",
        R
    }
    function a(p) {
        if (p.ep)
            return;
        p.ep = !0;
        const R = r(p);
        fetch(p.href, R)
    }
}
)();
const We = ["#D9E5EB", "#B5C0C6", "#557484", "#2C697F", "#034053", "#000000", "#FECD1A", "#EFED9B", "#F7AA42", "#803717", "#EF7F00", "#FABE5D", "#D8C262", "#C2AB60", "#C67615", "#7E7948", "#F6AD6E", "#FDD48F", "#91816D", "#544429", "#EB6A27", "#F29B81", "#C73636", "#955D40", "#6B4833", "#E85127", "#CB653C", "#A53722", "#BD6B44", "#D4011D", "#F19C99", "#C10121", "#EB6E81", "#B5007C", "#6D3F6E", "#6F195F", "#3E2A71", "#7C5D9F", "#2B195F", "#003483", "#655A9F", "#02315C", "#00579D", "#0092D2", "#012857", "#0262A7", "#003556", "#007FAC", "#00A5CF", "#00AEC6", "#047E9D", "#028D7A", "#3AB6B8", "#009B5A", "#368F2D", "#70BD95", "#47732D", "#039A47", "#628B2A", "#4E602C", "#A4C401", "#FCE90F", "#F0D500", "#AD9216", "#FBEB46", "#005A9A", "#E53257", "#F6AA24", "#C7C2B4", "#6E6168", "#3E2F36", "#D6855D", "#C7CDD1", "#C3A24E", "#282838", "#FFE7AB", "#E53527", "#86273D", "#76ACD5", "#00784F", "#7AB63E", "#C7D32D"]
  , Vn = typeof window < "u" ? window.location.search : "";
new URLSearchParams(Vn);
const Yn = .5 * (Math.sqrt(3) - 1)
  , Se = (3 - Math.sqrt(3)) / 6
  , _n = 1 / 3
  , ie = 1 / 6
  , zn = (Math.sqrt(5) - 1) / 4
  , qt = (5 - Math.sqrt(5)) / 20
  , $t = new Float32Array([1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1, 0, 1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, -1, 0, 1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1])
  , _t = new Float32Array([0, 1, 1, 1, 0, 1, 1, -1, 0, 1, -1, 1, 0, 1, -1, -1, 0, -1, 1, 1, 0, -1, 1, -1, 0, -1, -1, 1, 0, -1, -1, -1, 1, 0, 1, 1, 1, 0, 1, -1, 1, 0, -1, 1, 1, 0, -1, -1, -1, 0, 1, 1, -1, 0, 1, -1, -1, 0, -1, 1, -1, 0, -1, -1, 1, 1, 0, 1, 1, 1, 0, -1, 1, -1, 0, 1, 1, -1, 0, -1, -1, 1, 0, 1, -1, 1, 0, -1, -1, -1, 0, 1, -1, -1, 0, -1, 1, 1, 1, 0, 1, 1, -1, 0, 1, -1, 1, 0, 1, -1, -1, 0, -1, 1, 1, 0, -1, 1, -1, 0, -1, -1, 1, 0, -1, -1, -1, 0]);
class $n {
    constructor(n=Math.random) {
        const r = typeof n == "function" ? n : qn(n);
        this.p = Wn(r),
        this.perm = new Uint8Array(512),
        this.permMod12 = new Uint8Array(512);
        for (let a = 0; a < 512; a++)
            this.perm[a] = this.p[a & 255],
            this.permMod12[a] = this.perm[a] % 12
    }
    noise2D(n, r) {
        const a = this.permMod12
          , p = this.perm;
        let R = 0
          , F = 0
          , U = 0;
        const H = (n + r) * Yn
          , Q = Math.floor(n + H)
          , L = Math.floor(r + H)
          , yt = (Q + L) * Se
          , vt = Q - yt
          , Mt = L - yt
          , ot = n - vt
          , mt = r - Mt;
        let j, st;
        ot > mt ? (j = 1,
        st = 0) : (j = 0,
        st = 1);
        const W = ot - j + Se
          , K = mt - st + Se
          , J = ot - 1 + 2 * Se
          , it = mt - 1 + 2 * Se
          , S = Q & 255
          , I = L & 255;
        let i = .5 - ot * ot - mt * mt;
        if (i >= 0) {
            const A = a[S + p[I]] * 3;
            i *= i,
            R = i * i * ($t[A] * ot + $t[A + 1] * mt)
        }
        let k = .5 - W * W - K * K;
        if (k >= 0) {
            const A = a[S + j + p[I + st]] * 3;
            k *= k,
            F = k * k * ($t[A] * W + $t[A + 1] * K)
        }
        let M = .5 - J * J - it * it;
        if (M >= 0) {
            const A = a[S + 1 + p[I + 1]] * 3;
            M *= M,
            U = M * M * ($t[A] * J + $t[A + 1] * it)
        }
        return 70 * (R + F + U)
    }
    noise3D(n, r, a) {
        const p = this.permMod12
          , R = this.perm;
        let F, U, H, Q;
        const L = (n + r + a) * _n
          , yt = Math.floor(n + L)
          , vt = Math.floor(r + L)
          , Mt = Math.floor(a + L)
          , ot = (yt + vt + Mt) * ie
          , mt = yt - ot
          , j = vt - ot
          , st = Mt - ot
          , W = n - mt
          , K = r - j
          , J = a - st;
        let it, S, I, i, k, M;
        W >= K ? K >= J ? (it = 1,
        S = 0,
        I = 0,
        i = 1,
        k = 1,
        M = 0) : W >= J ? (it = 1,
        S = 0,
        I = 0,
        i = 1,
        k = 0,
        M = 1) : (it = 0,
        S = 0,
        I = 1,
        i = 1,
        k = 0,
        M = 1) : K < J ? (it = 0,
        S = 0,
        I = 1,
        i = 0,
        k = 1,
        M = 1) : W < J ? (it = 0,
        S = 1,
        I = 0,
        i = 0,
        k = 1,
        M = 1) : (it = 0,
        S = 1,
        I = 0,
        i = 1,
        k = 1,
        M = 0);
        const A = W - it + ie
          , nt = K - S + ie
          , Y = J - I + ie
          , w = W - i + 2 * ie
          , X = K - k + 2 * ie
          , V = J - M + 2 * ie
          , N = W - 1 + 3 * ie
          , T = K - 1 + 3 * ie
          , lt = J - 1 + 3 * ie
          , dt = yt & 255
          , et = vt & 255
          , ft = Mt & 255;
        let xt = .6 - W * W - K * K - J * J;
        if (xt < 0)
            F = 0;
        else {
            const It = p[dt + R[et + R[ft]]] * 3;
            xt *= xt,
            F = xt * xt * ($t[It] * W + $t[It + 1] * K + $t[It + 2] * J)
        }
        let rt = .6 - A * A - nt * nt - Y * Y;
        if (rt < 0)
            U = 0;
        else {
            const It = p[dt + it + R[et + S + R[ft + I]]] * 3;
            rt *= rt,
            U = rt * rt * ($t[It] * A + $t[It + 1] * nt + $t[It + 2] * Y)
        }
        let pt = .6 - w * w - X * X - V * V;
        if (pt < 0)
            H = 0;
        else {
            const It = p[dt + i + R[et + k + R[ft + M]]] * 3;
            pt *= pt,
            H = pt * pt * ($t[It] * w + $t[It + 1] * X + $t[It + 2] * V)
        }
        let Dt = .6 - N * N - T * T - lt * lt;
        if (Dt < 0)
            Q = 0;
        else {
            const It = p[dt + 1 + R[et + 1 + R[ft + 1]]] * 3;
            Dt *= Dt,
            Q = Dt * Dt * ($t[It] * N + $t[It + 1] * T + $t[It + 2] * lt)
        }
        return 32 * (F + U + H + Q)
    }
    noise4D(n, r, a, p) {
        const R = this.perm;
        let F, U, H, Q, L;
        const yt = (n + r + a + p) * zn
          , vt = Math.floor(n + yt)
          , Mt = Math.floor(r + yt)
          , ot = Math.floor(a + yt)
          , mt = Math.floor(p + yt)
          , j = (vt + Mt + ot + mt) * qt
          , st = vt - j
          , W = Mt - j
          , K = ot - j
          , J = mt - j
          , it = n - st
          , S = r - W
          , I = a - K
          , i = p - J;
        let k = 0
          , M = 0
          , A = 0
          , nt = 0;
        it > S ? k++ : M++,
        it > I ? k++ : A++,
        it > i ? k++ : nt++,
        S > I ? M++ : A++,
        S > i ? M++ : nt++,
        I > i ? A++ : nt++;
        const Y = k >= 3 ? 1 : 0
          , w = M >= 3 ? 1 : 0
          , X = A >= 3 ? 1 : 0
          , V = nt >= 3 ? 1 : 0
          , N = k >= 2 ? 1 : 0
          , T = M >= 2 ? 1 : 0
          , lt = A >= 2 ? 1 : 0
          , dt = nt >= 2 ? 1 : 0
          , et = k >= 1 ? 1 : 0
          , ft = M >= 1 ? 1 : 0
          , xt = A >= 1 ? 1 : 0
          , rt = nt >= 1 ? 1 : 0
          , pt = it - Y + qt
          , Dt = S - w + qt
          , It = I - X + qt
          , Lt = i - V + qt
          , C = it - N + 2 * qt
          , P = S - T + 2 * qt
          , D = I - lt + 2 * qt
          , s = i - dt + 2 * qt
          , h = it - et + 3 * qt
          , o = S - ft + 3 * qt
          , l = I - xt + 3 * qt
          , c = i - rt + 3 * qt
          , m = it - 1 + 4 * qt
          , f = S - 1 + 4 * qt
          , y = I - 1 + 4 * qt
          , u = i - 1 + 4 * qt
          , v = vt & 255
          , _ = Mt & 255
          , g = ot & 255
          , b = mt & 255;
        let E = .6 - it * it - S * S - I * I - i * i;
        if (E < 0)
            F = 0;
        else {
            const O = R[v + R[_ + R[g + R[b]]]] % 32 * 4;
            E *= E,
            F = E * E * (_t[O] * it + _t[O + 1] * S + _t[O + 2] * I + _t[O + 3] * i)
        }
        let z = .6 - pt * pt - Dt * Dt - It * It - Lt * Lt;
        if (z < 0)
            U = 0;
        else {
            const O = R[v + Y + R[_ + w + R[g + X + R[b + V]]]] % 32 * 4;
            z *= z,
            U = z * z * (_t[O] * pt + _t[O + 1] * Dt + _t[O + 2] * It + _t[O + 3] * Lt)
        }
        let G = .6 - C * C - P * P - D * D - s * s;
        if (G < 0)
            H = 0;
        else {
            const O = R[v + N + R[_ + T + R[g + lt + R[b + dt]]]] % 32 * 4;
            G *= G,
            H = G * G * (_t[O] * C + _t[O + 1] * P + _t[O + 2] * D + _t[O + 3] * s)
        }
        let $ = .6 - h * h - o * o - l * l - c * c;
        if ($ < 0)
            Q = 0;
        else {
            const O = R[v + et + R[_ + ft + R[g + xt + R[b + rt]]]] % 32 * 4;
            $ *= $,
            Q = $ * $ * (_t[O] * h + _t[O + 1] * o + _t[O + 2] * l + _t[O + 3] * c)
        }
        let Z = .6 - m * m - f * f - y * y - u * u;
        if (Z < 0)
            L = 0;
        else {
            const O = R[v + 1 + R[_ + 1 + R[g + 1 + R[b + 1]]]] % 32 * 4;
            Z *= Z,
            L = Z * Z * (_t[O] * m + _t[O + 1] * f + _t[O + 2] * y + _t[O + 3] * u)
        }
        return 27 * (F + U + H + Q + L)
    }
}
function Wn(e) {
    const n = new Uint8Array(256);
    for (let r = 0; r < 256; r++)
        n[r] = r;
    for (let r = 0; r < 255; r++) {
        const a = r + ~~(e() * (256 - r))
          , p = n[r];
        n[r] = n[a],
        n[a] = p
    }
    return n
}
function qn(e) {
    let n = 0
      , r = 0
      , a = 0
      , p = 1;
    const R = Zn();
    return n = R(" "),
    r = R(" "),
    a = R(" "),
    n -= R(e),
    n < 0 && (n += 1),
    r -= R(e),
    r < 0 && (r += 1),
    a -= R(e),
    a < 0 && (a += 1),
    function() {
        const F = 2091639 * n + p * 23283064365386963e-26;
        return n = r,
        r = a,
        a = F - (p = F | 0)
    }
}
function Zn() {
    let e = 4022871197;
    return function(n) {
        n = n.toString();
        for (let r = 0; r < n.length; r++) {
            e += n.charCodeAt(r);
            let a = .02519603282416938 * e;
            e = a >>> 0,
            a -= e,
            a *= e,
            e = a >>> 0,
            a -= e,
            e += a * 4294967296
        }
        return (e >>> 0) * 23283064365386963e-26
    }
}
const jn = (e, n=0, r=1) => {
    const a = {
        hash: e,
        editionNumber: n,
        totalEditions: r,
        input: {}
    };
    return btoa(JSON.stringify(a).replace("==", ""))
}
;
let Fe = tokenData;
function Hn() {}
setTimeout(Hn, 0);
console.log(Fe.hash);
console.log(jn(Fe.hash));
const Jn = function(e) {
    var n, r, a, p, R = function(H) {
        for (var Q = 0, L = 1779033703 ^ H.length; Q < H.length; Q++)
            L = (L = Math.imul(L ^ H.charCodeAt(Q), 3432918353)) << 13 | L >>> 19;
        return function() {
            return L = Math.imul((L = Math.imul(L ^ L >>> 16, 2246822507)) ^ L >>> 13, 3266489909),
            (L ^= L >>> 16) >>> 0
        }
    }(e), F = {
        rand: (n = R(),
        r = R(),
        a = R(),
        p = R(),
        function() {
            a |= 0;
            var U = ((n |= 0) + (r |= 0) | 0) + (p |= 0) | 0;
            return p = p + 1 | 0,
            n = r ^ r >>> 9,
            r = a + (a << 3) | 0,
            a = (a = a << 21 | a >>> 11) + U | 0,
            (U >>> 0) / 4294967296
        }
        ),
        randInt: function(U, H) {
            return U + Math.floor((H - U) * F.rand())
        }
    };
    return F
};
class pn {
    constructor(n=!1) {
        this.useA = !1,
        this.tk = Fe,
        this.useNative = n,
        this.prng = Jn(Fe.hash),
        this.simplex = new $n(this.random())
    }
    random() {
        return this.useNative ? Math.random() : this.prng.rand()
    }
    range(n, r) {
        return n + (r - n) * this.random()
    }
    int(n, r) {
        return Math.floor(n + (r - n + 1) * this.random())
    }
    bool(n) {
        return this.random() < n
    }
    pick(n) {
        return n[this.int(0, n.length - 1)]
    }
    n2D(n, r) {
        return this.simplex.noise2D(n, r)
    }
    curl2D(n, r, a=1) {
        const p = this.n2D(n, r + a)
          , R = this.n2D(n, r - a)
          , F = this.n2D(n + a, r)
          , U = this.n2D(n - a, r)
          , H = (p - R) / (2 * a);
        return [-((F - U) / (2 * a)), H]
    }
    randomPow(n) {
        return Math.pow(this.random(), n)
    }
    random2(n) {
        const r = Math.sin(n * 12.9898) * 43758.5453;
        return r - Math.floor(r)
    }
}
const t = new pn;
new pn(!0);
const Ne = JSON.parse(localStorage.getItem("lastHashes")) || [];
Ne.length == 10 && Ne.shift();
Ne.push(t.tk.hash);
localStorage.setItem("lastHashes", JSON.stringify(Ne));
const qe = e => {
    const n = [...e];
    for (let r = n.length - 1; r > 0; r--) {
        const a = Math.floor(t.random() * (r + 1));
        [n[r],n[a]] = [n[a], n[r]]
    }
    return n
}
  , Wt = (e, n, r) => {
    const a = Math.min(n, r)
      , p = Math.max(n, r);
    return Math.min(Math.max(e, a), p)
}
  , Bt = (e, n, r, a, p, R=!1) => {
    let F = a + (p - a) * (e - n) / (r - n);
    return R && (F = Wt(F, a, p)),
    F
}
  , Me = (e, n, r) => e * (1 - r) + n * r
  , Qn = ({r: e, g: n, b: r}) => "#" + ((1 << 24) + (e << 16) + (n << 8) + r).toString(16).slice(1)
  , Kn = ({h: e, s: n, l: r}) => {
    n /= 100,
    r /= 100;
    let a = (1 - Math.abs(2 * r - 1)) * n
      , p = a * (1 - Math.abs(e / 60 % 2 - 1))
      , R = r - a / 2
      , F = 0
      , U = 0
      , H = 0;
    return 0 <= e && e < 60 ? (F = a,
    U = p,
    H = 0) : 60 <= e && e < 120 ? (F = p,
    U = a,
    H = 0) : 120 <= e && e < 180 ? (F = 0,
    U = a,
    H = p) : 180 <= e && e < 240 ? (F = 0,
    U = p,
    H = a) : 240 <= e && e < 300 ? (F = p,
    U = 0,
    H = a) : 300 <= e && e < 360 && (F = a,
    U = 0,
    H = p),
    F = Math.round((F + R) * 255),
    U = Math.round((U + R) * 255),
    H = Math.round((H + R) * 255),
    {
        r: F,
        g: U,
        b: H
    }
}
  , Ve = e => {
    if (e.s)
        return e;
    let n = 0
      , r = 0
      , a = 0;
    e.length == 4 ? (n = "0x" + e[1] + e[1],
    r = "0x" + e[2] + e[2],
    a = "0x" + e[3] + e[3]) : e.length == 7 && (n = "0x" + e[1] + e[2],
    r = "0x" + e[3] + e[4],
    a = "0x" + e[5] + e[6]),
    n /= 255,
    r /= 255,
    a /= 255;
    let p = Math.min(n, r, a)
      , R = Math.max(n, r, a)
      , F = R - p
      , U = 0
      , H = 0
      , Q = 0;
    return F == 0 ? U = 0 : R == n ? U = (r - a) / F % 6 : R == r ? U = (a - n) / F + 2 : U = (n - r) / F + 4,
    U = Math.round(U * 60),
    U < 0 && (U += 360),
    Q = (R + p) / 2,
    H = F == 0 ? 0 : F / (1 - Math.abs(2 * Q - 1)),
    H = +(H * 100).toFixed(1),
    Q = +(Q * 100).toFixed(1),
    {
        h: U,
        s: H,
        l: Q
    }
}
  , to = e => {
    e = e.replace(/^#/, "");
    let n, r, a;
    return e.length === 3 ? (n = parseInt(e[0] + e[0], 16),
    r = parseInt(e[1] + e[1], 16),
    a = parseInt(e[2] + e[2], 16)) : (n = parseInt(e.slice(0, 2), 16),
    r = parseInt(e.slice(2, 4), 16),
    a = parseInt(e.slice(4, 6), 16)),
    {
        r: n,
        g: r,
        b: a
    }
}
  , en = e => {
    const {r: n, g: r, b: a} = to(e);
    return .2126 * n + .7152 * r + .0722 * a
}
  , nn = e => Qn(Kn(e));
for (let e = 0; e < 100; e++)
    t.random();
const eo = !0
  , on = localStorage.getItem("batching") == "true" || !1
  , no = 4
  , oo = "l";
let mn = t.int(3, 15)
  , kt = oo
  , bn = kt == "h" && t.bool(0);
kt == "l" && t.bool(.005) && (kt = "m");
const so = "none"
  , xn = 1.2;
let de = !1
  , In = kt !== "h" && t.bool(.07);
const io = kt == "h" ? "grandeur" : "Un air de grandeur"
  , x = {
    GRIBOUILLIS: "gribouillis",
    GRANDEUR: io,
    VERTICAL: "vertical",
    HORIZONTAL: "horizontal",
    GRID: "grid",
    UNGRID: "ungrid",
    FIELD: "field",
    LANDSCAPE: "landscape",
    CONCENTRIC: "concentric",
    LINEAR: "linear",
    PRIMITIVES: "primitives",
    INTERSECTIONS: "intersections",
    OPRIMITIVES: "oprimitives",
    OINTERSECTIONS: "ointersections",
    ROOM: "room",
    RANDOMLINES: "randomLines",
    PRIMGRID: "primgrid",
    ROTATEDGRID: "rotatedgrid",
    FULLGRID: "fullgrid"
}
  , lo = {
    [x.GRIBOUILLIS]: "Gestuelle: gribouillis",
    [x.GRANDEUR]: kt == "h" ? "Ext\xE9rieur" : "Gestuelle: gros gribouillis",
    [x.VERTICAL]: "\xC9chauffement: vertical",
    [x.HORIZONTAL]: "\xC9chauffement: horizontal",
    [x.GRID]: "Structure: grille",
    [x.UNGRID]: "Structure: grille moins uniforme",
    [x.FIELD]: "La base",
    [x.CONCENTRIC]: "Structure: r\xE9p\xE9tition concentrique",
    [x.LINEAR]: "Structure: r\xE9p\xE9tition lin\xE9aire",
    [x.PRIMITIVES]: "Structure: primitives opaques",
    [x.INTERSECTIONS]: "Structure: primitives transparentes",
    [x.OPRIMITIVES]: "Structure: primitives opaques et organiques",
    [x.OINTERSECTIONS]: "Structure: primitives transparentes et organiques",
    [x.LANDSCAPE]: "Structure: paysage",
    [x.ROOM]: "Contexte: int\xE9rieur",
    [x.RANDOMLINES]: "Structure: lignes al\xE9atoires",
    [x.PRIMGRID]: "Structure: grille"
};
let Qt = [x.PRIMITIVES, x.INTERSECTIONS, x.OPRIMITIVES, x.OINTERSECTIONS]
  , Le = [];
const ro = t.random();
ro < 1e-4 && kt == "h" && (Le = [x.FULLGRID]);
t.bool(.01) && kt !== "h" && (Le = [x.GRIBOUILLIS]);
t.bool(.5) && (de = kt !== "h" && t.bool(1 / 15),
Qt = Qt.concat([x.VERTICAL, x.HORIZONTAL, x.GRID, x.UNGRID, x.FIELD, x.CONCENTRIC, x.LINEAR, x.ROOM, x.GRANDEUR]));
kt == "h" && (de = t.bool(.008),
Qt = Qt.filter(e => e !== x.HORIZONTAL && e !== x.FIELD),
Qt = [x.GRANDEUR, x.UNGRID, x.CONCENTRIC, x.LINEAR, x.PRIMITIVES, x.INTERSECTIONS, x.OPRIMITIVES, x.OINTERSECTIONS, x.ROOM, x.PRIMGRID, x.ROTATEDGRID]);
de && (Qt = [x.VERTICAL, x.PRIMITIVES, x.OPRIMITIVES]);
let q = [];
if (kt == "h") {
    const e = t.random() < .5 ? 1 : t.int(2, 4);
    if (t.bool(.5) && e > 1) {
        const r = t.bool(.5);
        r ? q.push(x.ROOM) : q.push(x.GRANDEUR),
        t.bool(.5) && (r ? q.push(x.GRANDEUR) : q.push(x.ROOM))
    }
    for (; q.length < e; ) {
        let r = Qt.filter(p => p !== x.ROOM && p !== x.GRANDEUR);
        const a = t.pick(r);
        q.includes(a) || q.push(a)
    }
    if (t.bool(.5) && !q.includes(x.ROOM) && q.push(x.ROOM),
    q.length == 1 && (q[0] == x.PRIMGRID || q[0] == x.UNGRID || q[0] == x.ROTATEDGRID)) {
        let r = Qt.filter(a => a !== x.PRIMGRID && a !== x.UNGRID && a !== x.ROTATEDGRID);
        q.push(t.pick(r))
    }
    q.includes(x.PRIMGRID) && (q = [x.PRIMGRID, ...q.filter(r => r !== x.PRIMGRID)]);
    let n = .5;
    q.includes(x.GRANDEUR) && (n = .2),
    q.includes(x.FULLGRID) && (n = .8),
    t.bool(n) && q.push(x.RANDOMLINES)
} else {
    const e = t.int(0, Qt.length - 1)
      , n = Qt[e];
    if (q.push(n),
    t.bool(.03)) {
        const r = Qt.filter(a => a !== x.FIELD && !q.includes(a));
        r.length > 0 && q.push(r[t.int(0, r.length - 1)])
    }
    if (de) {
        const r = t.int(1, 3);
        for (mn = t.int(1, 5),
        q = []; q.length < r; ) {
            const a = t.pick(Qt);
            q.includes(a) || q.push(a)
        }
        t.bool(.3) && (q = [x.FIELD])
    }
}
t.bool(.01) && (q = [x.ROOM]);
t.bool(.01) && (q = [x.GRANDEUR]);
Le.length > 0 && (q = Le);
kt !== "h" && q.includes(x.GRANDEUR) && (In = !0);
q.includes(x.ROOM) && t.bool(.3) && (q = [...q.filter(e => e !== x.ROOM), x.ROOM]);
const Sn = 100
  , ao = [420, 595]
  , jt = ao
  , sn = 1.5;
{
    const e = jt[0];
    jt[0] = jt[1],
    jt[1] = e
}
jt[0] = jt[0] * (Sn / 72);
jt[1] = jt[1] * (Sn / 72);
jt[0] *= xn;
jt[1] *= xn;
const co = 12;
let Mn = 1;
if (t.bool(.995)) {
    const e = t.bool(.7) ? 3 : 2;
    Mn = t.int(e, co)
}
let ae = qe([...We]).slice(0, Mn);
t.bool(.015) && (ae = ["#D4011D", "#EB6E81", "#FECD1A", "#0262A7", "#628B2A", "#000000"]);
t.bool(.001) && (ae = qe(We));
t.bool(.02) && (ae = ["#757575", "#616161", "#424242", "#212121", "#010101"],
t.bool(.5) && (ae = t.bool(.5) ? ["#424242", "#212121"] : ["#757575"]));
ae = qe(ae);
let Ye = Array.from(ae).sort( (e, n) => {
    const r = Math.round(en(e) * 1e6) / 1e6;
    return Math.round(en(n) * 1e6) / 1e6 - r
}
);
for (let e = 0; e < Ye.length; e++)
    console.log(`%c   ${Ye[e]}   `, `background: ${Ye[e]}; color: white; padding: 2px 5px; border-radius: 2px;`);
let Cn = kt == "h" ? t.bool(.15) : t.bool(.03)
  , Rn = "#eae4cc"
  , kn = Cn ? t.pick(ae) : Rn
  , ho = kt == "h" ? t.bool(0) : !1
  , fo = q.length == 1 && q[0] == x.GRANDEUR && t.bool(.1)
  , uo = t.int(1, 5)
  , Ze = ["c"];
bn && (kt = "m",
Ze = ["b", "c"]);
let Kt = ["o", "oc"]
  , go = !0
  , vn = t.bool(.75) && !bn ? 1.2 : t.range(0, .4)
  , je = t.bool(.99) ? 0 : t.range(0, 1)
  , He = t.random()
  , xe = 1;
He < .7 && (xe = 0);
He < .5 && (xe = t.range(.6, 1));
He < .3 && (xe = t.range(.15, .4));
let wn = [1]
  , An = kt == "h" ? t.pick([.6, 1]) : 1
  , yo = t.bool(.5) ? 0 : t.range(.2, 1.4)
  , Dn = t.bool(.5) || t.bool(.03) ? 1 : t.range(0, 1)
  , Ie = t.bool(.9) ? t.range(.05, .25) : .5
  , po = t.bool(.99) ? t.range(.2, .27) * t.pick([1, 3, 5]) : 5
  , mo = t.bool(.2)
  , bo = t.bool(.3)
  , Ge = !1;
const xo = t.pick([["bottom", "right"], ["bottom", "left"], ["bottom", "left", "right"]]);
let Je = 1
  , Io = t.pick([.5, .9, 1, 1]);
kt == "h" && (Ge = t.bool(.0085),
Je = t.bool(.8) ? 1 : .75);
let On = kt == "h" ? t.bool(.92) : !0;
q.length <= 2 && q.includes(x.CONCENTRIC) && (On = !1);
Ge && q.includes(x.ROOM) && (q = [...q.filter(e => e !== x.ROOM), x.ROOM]);
Je < 1 && (Ge = !1,
je = 0);
let En = !1;
kt !== "h" && q.length == 1 && (q[0] == x.PRIMITIVES || q[0] == x.INTERSECTIONS || q[0] == x.OPRIMITIVES || q[0] == x.OINTERSECTIONS) && (En = t.bool(.01));
const Pn = q.filter(e => e !== x.ROOM && e !== x.GRANDEUR).length;
let fe = t.bool(.5);
Pn >= 3 && !fe && (fe = t.bool(.7));
Pn == 1 && (fe = t.bool(.15),
q.includes(x.PRIMGRID) && !fe && (fe = t.bool(.75)));
kt !== "h" && (fe = !1);
t.bool(.02) && (Ie = 1);
kt == "h" && (Ie = t.range(.01, .1));
(kt == "h" && t.bool(.15) || kt !== "h" && t.bool(.3)) && (Ie = 0);
let we = kt == "h" || de ? !0 : t.bool(.6);
q.length == 1 && (q[0] == "horizontal" || q[0] == "vertical" || q[0] == "grid") && (we = !0);
q.length == 1 && q[0] == x.GRIBOUILLIS && kt !== "h" && (we = !1);
const So = kt == "h" ? 0 : .3
  , Mo = kt == "h" ? .2 : .6;
let Co = t.bool(.95) ? 0 : t.range(So, Mo)
  , Fn = 1
  , Nn = Ie == 0 && kt == "h" ? t.range(0, .01) : .05
  , ze = t.range(.07, .15)
  , Ro = !1
  , ko = kt == "h" ? t.bool(.1) : t.bool(.5)
  , Ln = kt == "h" ? t.bool(.35) : t.bool(.5);
q.length == 1 && q[0] == x.GRANDEUR && (Ln = t.bool(.65));
(q.includes(x.VERTICAL) || q.includes(x.HORIZONTAL)) && (we = !0);
let vo = t.bool(.5);
kt !== "h" && Ze.length == 1 && (vn = 2,
je = 0,
kn = Rn,
xe = t.bool(.35) ? 1 : t.range(0, .6),
!we && t.bool(.5) && (xe = t.range(0, .7)),
wn = [1],
Fn = t.bool(.5) ? 1 : t.range(.1, .4),
Nn = t.bool(.7) ? .05 : t.range(.25, .5),
Kt = ["h", "o", "c", "v", "n"],
t.bool(.05) && (Kt = ["v"]),
(t.bool(.005) || de && t.bool(1.1)) && (Kt = ["h"]),
q.length == 1 && q[0] == "vertical" && (Kt = t.bool(.5) ? ["h", "v", "n"] : ["v"]),
q.length == 1 && q[0] == "horizontal" && (Kt = t.bool(.5) ? ["h", "v", "n"] : ["h"]),
q.length == 1 && q[0] == x.FIELD && (An = t.pick([.3, .5, .5, 1, 1]),
t.bool(.5) ? (Kt = ["n"],
ze = t.range(.1, .35)) : (Kt = ["c"],
ze = t.range(.3, 1)),
t.bool(.05) && (kt = "m")));
const wo = t.pick([[-5], [-0, -1, -2, -3, -4, -5]])
  , Ao = t.pick([[-5], [-5, -4, -3]])
  , Do = t.pick([[-5, -10], [-6, -8]]);
let Tn = {
    normOffsetOpts: Do,
    noiseScl: 3.5,
    noiseAmp: t.range(7, 15)
}
  , Oo = {
    normOffsetOpts: Ao,
    noiseScl: 2,
    noiseAmp: t.range(7, 10)
}
  , Qe = {
    normOffsetOpts: kt == "h" ? [-5] : wo,
    noiseScl: 3,
    noiseAmp: t.pick([1.5, 5, 1.5])
}
  , Be = Qe;
Be = t.pick([Qe, Oo, Tn]);
Be = Qe;
Kt.length == 1 && Kt[0] == "v" && (Be = Tn);
Kt.length == 1 && Kt[0] == "h" && (Dn = 0);
const d = {
    isBuild: eo,
    batching: on,
    dimensions: {
        base: jt,
        final: [jt[0] * sn, jt[1] * sn],
        debugScl: .3,
        rebelleScl: 2
    },
    useColorBg: Cn,
    backgroundColor: kn,
    palette: ae,
    comps: q,
    availableComps: Qt,
    NB_FRAMES: 240,
    targetFPS: 60,
    animate: !1,
    plotMode: so,
    density: kt,
    tangentModeOpts: Kt,
    fillBackground: go,
    isLandscape: de,
    presence: "l",
    skipContour: xe,
    simline: 1,
    rotateSkew: yo,
    contained: Dn,
    neg: vn,
    negMode: kt == "h" ? t.pick(["f", "f"]) : t.pick(["e"]),
    bfill: we,
    gradient: je,
    colorrep: t.bool(.7) ? "r" : "n",
    isStrokeColorFromB: Co,
    othercolor: Ie,
    othercolorScl: po,
    darkOtherColorInBg: mo,
    dirtyBgColor: bo,
    fuzinessOpts: wn,
    tScl: An,
    geomOffset: Be,
    multiplyAmount: Nn,
    baseEllipseWidthScl: Fn,
    compNseScl: ze,
    mpress: Ro,
    rough: In,
    sim: ko,
    smalls: Ln,
    uniformBg: ho,
    isolation: fo,
    nbIsolated: uo,
    bonly: En,
    masks: fe,
    windo: vo,
    light: Ge,
    lightSides: xo,
    press: Je,
    vstrokes: On,
    vgridSpacing: t.pick([5, 10]),
    maskChance: Io,
    gridSpacing: no,
    export: {
        iterationIdx: parseInt(localStorage.getItem("iterationIdx")) || 0,
        batching: on,
        batchSize: parseInt(localStorage.getItem("batchSize")) || 100,
        batchIdx: parseInt(localStorage.getItem("batchIdx")) || 0
    },
    shapes: {
        count: mn,
        size: [.05 * jt[1], .5 * jt[1]]
    },
    layers: Ze
};
let Te = "";
kt !== "h" && (Te = q.length == 1 ? lo[q[0]] : "mixed");
Te !== "" && console.log(Te);
window.$artifact = {
    features: {
        trait: Te
    }
};
function Eo(e) {
    return {
        strideX: e[1],
        data: new Uint32Array(e[0] * e[1])
    }
}
var Po = Eo
  , Fo = Po
  , Gn = Math.PI / 3
  , $e = [[0, 0], [0, -1], [-1, 0], [1, 0], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1], [0, -2], [-2, 0], [2, 0], [0, 2], [-1, -2], [1, -2], [-2, -1], [2, -1], [-2, 1], [2, 1], [-1, 2], [1, 2]]
  , No = $e.length;
function Ut(e, n) {
    this.width = e.shape[0],
    this.height = e.shape[1],
    this.radius = e.radius || e.minDistance,
    this.maxTries = Math.max(3, Math.ceil(e.tries || 30)),
    this.rng = n || Math.random;
    const a = 1e-14 * Math.max(1, Math.max(this.width, this.height) / 64 | 0)
      , p = 2e-14;
    this.squaredRadius = this.radius * this.radius,
    this.radiusPlusEpsilon = this.radius + a,
    this.cellSize = this.radius * Math.SQRT1_2,
    this.angleIncrement = Math.PI * 2 / this.maxTries,
    this.angleIncrementOnSuccess = Gn + p,
    this.triesIncrementOnSuccess = Math.ceil(this.angleIncrementOnSuccess / this.angleIncrement),
    this.processList = [],
    this.samplePoints = [],
    this.gridShape = [Math.ceil(this.width / this.cellSize), Math.ceil(this.height / this.cellSize)],
    this.grid = Fo(this.gridShape)
}
Ut.prototype.width = null;
Ut.prototype.height = null;
Ut.prototype.radius = null;
Ut.prototype.radiusPlusEpsilon = null;
Ut.prototype.squaredRadius = null;
Ut.prototype.cellSize = null;
Ut.prototype.angleIncrement = null;
Ut.prototype.angleIncrementOnSuccess = null;
Ut.prototype.triesIncrementOnSuccess = null;
Ut.prototype.maxTries = null;
Ut.prototype.rng = null;
Ut.prototype.processList = null;
Ut.prototype.samplePoints = null;
Ut.prototype.gridShape = null;
Ut.prototype.grid = null;
Ut.prototype.addRandomPoint = function() {
    return this.directAddPoint([this.rng() * this.width, this.rng() * this.height, this.rng() * Math.PI * 2, 0])
}
;
Ut.prototype.addPoint = function(e) {
    var n = e.length === 2 && e[0] >= 0 && e[0] < this.width && e[1] >= 0 && e[1] < this.height;
    return n ? this.directAddPoint([e[0], e[1], this.rng() * Math.PI * 2, 0]) : null
}
;
Ut.prototype.directAddPoint = function(e) {
    var n = [e[0], e[1]];
    this.processList.push(e),
    this.samplePoints.push(n);
    var r = (e[0] / this.cellSize | 0) * this.grid.strideX + (e[1] / this.cellSize | 0);
    return this.grid.data[r] = this.samplePoints.length,
    n
}
;
Ut.prototype.inNeighbourhood = function(e) {
    var n = this.grid.strideX, r = this.gridShape[0], a = this.gridShape[1], p = e[0] / this.cellSize | 0, R = e[1] / this.cellSize | 0, F, U, H, Q, L;
    for (F = 0; F < No; F++)
        if (H = p + $e[F][0],
        Q = R + $e[F][1],
        U = H < 0 || Q < 0 || H >= r || Q >= a ? -1 : H * n + Q,
        U !== -1 && this.grid.data[U] !== 0 && (L = this.samplePoints[this.grid.data[U] - 1],
        Math.pow(e[0] - L[0], 2) + Math.pow(e[1] - L[1], 2) < this.squaredRadius))
            return !0;
    return !1
}
;
Ut.prototype.next = function() {
    for (var e, n, r, a; this.processList.length > 0; ) {
        var p = this.processList.length * this.rng() | 0;
        for (n = this.processList[p],
        r = n[2],
        e = n[3],
        e === 0 && (r = r + (this.rng() - .5) * Gn * 4); e < this.maxTries; e++) {
            if (a = [n[0] + Math.cos(r) * this.radiusPlusEpsilon, n[1] + Math.sin(r) * this.radiusPlusEpsilon, r, 0],
            a[0] >= 0 && a[0] < this.width && a[1] >= 0 && a[1] < this.height && !this.inNeighbourhood(a))
                return n[2] = r + this.angleIncrementOnSuccess + this.rng() * this.angleIncrement,
                n[3] = e + this.triesIncrementOnSuccess,
                this.directAddPoint(a);
            r = r + this.angleIncrement
        }
        if (e >= this.maxTries) {
            const R = this.processList.pop();
            p < this.processList.length && (this.processList[p] = R)
        }
    }
    return null
}
;
Ut.prototype.fill = function() {
    for (this.samplePoints.length === 0 && this.addRandomPoint(); this.next(); )
        ;
    return this.samplePoints
}
;
Ut.prototype.getAllPoints = function() {
    return this.samplePoints
}
;
Ut.prototype.reset = function() {
    var e = this.grid.data, n;
    for (n = 0; n < e.length; n++)
        e[n] = 0;
    this.samplePoints = [],
    this.processList.length = 0
}
;
var Bn = Ut;
const ln = d.shapes.count
  , Lo = () => {
    t.random();
    let e = d.dimensions.base[0]
      , n = d.dimensions.base[1]
      , r = e / n
      , a = null
      , p = null
      , R = null
      , F = null
      , U = -1
      , H = []
      , Q = 1;
    d.density == "h" && (Q = 4);
    let L = []
      , yt = [];
    const vt = () => {}
      , Mt = () => a
      , ot = () => R
      , mt = () => {
        const C = ft(e / 2 - e * .05, n - n * t.range(.1, .18), e * 1.1, n * .4, 0, 10)
          , P = d.density == "h" ? !0 : t.bool(.5);
        let D = t.pick([0, .5, 1]);
        const s = .03 * e;
        for (let h = 0; h < C.length; h++) {
            const o = C[h].x / e
              , l = C[h].y / n
              , c = 0
              , m = 0;
            let f = s;
            f *= Bt(l, .7, 1, 1, 0),
            C[h].x += t.n2D((o * r + c) * D * r, (l + c) * D) * f,
            C[h].y += t.n2D((o * r + m) * D * r, (l + m) * D) * f
        }
        L.push({
            points: C,
            isFilled: P,
            fillColor: "white",
            strokeColor: "black"
        })
    }
      , j = (C=e / 2, P=n / 2) => {
        const D = t.range(.8, 1.5)
          , s = e * t.range(.2, .35) * D
          , h = n * t.range(.2, .6) * D;
        let o = Q == 1 ? t.bool(.15) : t.bool(.5);
        d.light && (o = !1),
        C = t.range(e * .25, e * .75),
        P = t.range(n * .25, n * .75);
        const l = t.bool(.5) ? 0 : t.range(-Math.PI / 6, Math.PI / 6);
        let c = d.density == "h" ? t.bool(.5) : !1;
        d.windo && (c = !1),
        d.light && d.lightSides.includes("bottom") && (c = !0);
        const m = C - s / 2
          , f = C + s / 2
          , y = P - h / 2
          , u = P + h / 2
          , v = (G, $, Z, O, B) => {
            const bt = G - Z
              , ut = $ - O;
            return {
                x: Z + (bt * Math.cos(B) - ut * Math.sin(B)),
                y: O + (bt * Math.sin(B) + ut * Math.cos(B))
            }
        }
          , _ = v(m, y, C, P, l)
          , g = v(f, y, C, P, l)
          , b = v(f, u, C, P, l)
          , E = v(m, u, C, P, l)
          , z = ft(C, P, s, h, l, 10);
        if (L.push({
            points: z,
            isFilled: !1,
            fillColor: "white",
            strokeColor: "black"
        }),
        !o) {
            const G = d.density == "h" && t.bool(.05) || d.light && d.lightSides.includes("top");
            L.push({
                points: [{
                    x: 0,
                    y: 0
                }, _, g, {
                    x: e,
                    y: 0
                }],
                isFilled: G,
                isDoorSide: !0,
                side: "top"
            });
            const $ = d.density == "h" && t.bool(.05) || d.light && d.lightSides.includes("right");
            L.push({
                points: [{
                    x: e,
                    y: 0
                }, g, b, {
                    x: e,
                    y: n
                }],
                isFilled: $,
                isDoorSide: !0,
                side: "right"
            });
            const Z = d.density == "h" && t.bool(.05) || d.light && d.lightSides.includes("left");
            L.push({
                points: [{
                    x: 0,
                    y: 0
                }, _, E, {
                    x: 0,
                    y: n
                }],
                isFilled: Z,
                isDoorSide: !0,
                side: "left"
            })
        }
        L.push({
            points: [{
                x: 0,
                y: n
            }, E, b, {
                x: e,
                y: n
            }],
            isFilled: c,
            fillColor: "white",
            strokeColor: "black",
            isDoorSide: !0,
            side: "bottom"
        })
    }
      , st = () => {
        let C = t.bool(.5) ? 1 : t.int(2, Q);
        for (let P = 0; P < C; P++)
            j()
    }
      , W = (C, P, D, s, h, o=0, l=0, c=1, m=1) => {
        const f = N()
          , y = D / h
          , u = s / h
          , v = ft(C, P, D, s, o, 20);
        L.push({
            bb: {
                x: C,
                y: P,
                width: D,
                height: s,
                rotation: o
            },
            points: v,
            isFilled: !1,
            fillColor: "white",
            strokeColor: "black",
            type: "boundingBox",
            func: x.ROTATEDGRID,
            mask: f
        }),
        t.bool(l);
        const _ = t.bool(c)
          , g = t.bool(m)
          , b = [5, 45, 60, 90, 120]
          , E = t.pick(b)
          , z = t.bool(.5);
        for (let G = 0; G < h; G++)
            for (let $ = 0; $ < h; $++) {
                let Z = C - D / 2 + y * G + y / 2
                  , O = P - s / 2 + u * $ + u / 2;
                const B = Z - C
                  , bt = O - P
                  , ut = C + (B * Math.cos(o) - bt * Math.sin(o))
                  , Tt = P + (B * Math.sin(o) + bt * Math.cos(o))
                  , Et = ft(ut, Tt, y, u, o, 10);
                t.range(10, 5) * .3;
                for (let Ft = 0; Ft < Et.length; Ft++)
                    Et[Ft].x / e,
                    Et[Ft].y / n;
                if (L.push({
                    points: Et,
                    isFilled: _,
                    fillColor: "white",
                    strokeColor: "black",
                    mask: f
                }),
                t.bool(l)) {
                    const Ft = y > u ? u : y
                      , wt = z ? E : t.pick(b)
                      , Gt = xt(ut, Tt, Ft * .45, o, wt);
                    L.push({
                        points: Gt,
                        isFilled: g,
                        fillColor: "white",
                        strokeColor: "black",
                        mask: f
                    })
                }
            }
    }
      , K = (C=0, P=1, D=1) => {
        const s = t.bool(.5) ? 1 : t.int(2, 3)
          , h = t.bool(.5)
          , o = t.bool(.5)
          , l = t.bool(.5) ? 1 : .5
          , c = t.bool(.5) ? 1 : .5;
        for (let m = 0; m < s; m++) {
            const f = t.range(0, e)
              , y = t.range(0, n)
              , u = f / e
              , v = y / n
              , _ = t.range(e * .2, e * l)
              , g = t.range(n * .2, n * c)
              , b = t.int(1, 4);
            let E = o ? t.n2D(u, v) * Math.PI * 2 : t.range(0, Math.PI * 2);
            h || (E = 0),
            W(f, y, _, g, b, E, C, P, D)
        }
    }
      , J = () => {
        const C = e / 2
          , P = n / 2
          , D = 1 * e
          , s = 1 * n
          , h = t.int(6, 10)
          , o = 0
          , l = t.bool(.5) ? 1 : t.range(.2, 1)
          , c = t.bool(.5) ? 1 : t.range(.2, 1)
          , m = t.bool(.5) ? 1 : t.range(0, 1);
        W(C, P, D, s, h, o, l, c, m)
    }
      , it = (C="y", P=[0, 0]) => {
        const D = t.int(2, 10)
          , s = C === "y"
          , h = N();
        for (let o = 0; o < D; o++) {
            const l = (s ? e : n) / D * o
              , c = []
              , m = t.range(P[0], P[1])
              , f = 0;
            if (t.bool(f))
                continue;
            const u = s ? n : e;
            for (let v = 0; v <= u + D * 2; v += D)
                c.push({
                    x: s ? l : v + m,
                    y: s ? v + m : l
                });
            L.push({
                points: c,
                isFilled: !1,
                mask: h
            })
        }
    }
      , S = () => {
        const C = ft(e / 2, n / 2, e, n, 0, 10);
        L.push({
            points: C,
            isFilled: !0,
            fillColor: "white",
            strokeColor: "black"
        })
    }
      , I = (C=[0, 0]) => {
        it("y", C)
    }
      , i = (C=[0, 0]) => {
        it("x", C)
    }
      , k = () => {
        const C = {
            x: 0,
            y: 0,
            width: e,
            height: n
        }
          , P = t.int(4, 8)
          , D = e / (P + 1)
          , s = n * .3
          , h = n * .8;
        for (let o = 1; o <= P; o++) {
            let l = D * o
              , c = t.range(s, h)
              , m = (n - c) / 2
              , f = m + c;
            l = Bt(l, 0, e, C.x, C.x + C.width),
            m = Bt(m, 0, n, C.y, C.y + C.height),
            f = Bt(f, 0, n, C.y, C.y + C.height);
            const y = [{
                x: l,
                y: m
            }, {
                x: l,
                y: f
            }];
            L.push({
                points: y,
                isFilled: !1
            })
        }
    }
      , M = (C=30, P=100, D=e * .01, s=5, h=[.2, .8]) => {
        for (let o = 0; o < C; o++) {
            const l = [];
            let c = t.range(e * h[0], e * h[1])
              , m = t.range(n * h[0], n * h[1])
              , f = t.range(0, Math.PI * 2);
            l.push({
                x: c,
                y: m
            });
            for (let y = 0; y < P; y++) {
                const u = t.n2D(c * .01, m * .01) * s;
                f += u,
                c += Math.cos(f) * D,
                m += Math.sin(f) * D,
                c = Wt(c, 0, e),
                m = Wt(m, 0, n),
                l.push({
                    x: c,
                    y: m
                })
            }
            L.push({
                points: l,
                isFilled: !1
            })
        }
    }
      , A = () => {
        const C = t.int(1, 15)
          , P = t.bool(.5) ? .5 : 0;
        for (let D = 0; D < C; D++)
            if (t.bool(P)) {
                const h = t.range(0, e)
                  , o = t.range(0, n)
                  , l = t.range(0, Math.PI * 2)
                  , c = t.range(e * .1, e * .3)
                  , m = 100
                  , f = t.range(Math.PI * .7, Math.PI * 1.5)
                  , y = [];
                for (let u = 0; u < m; u++) {
                    const v = Bt(u, 0, m, 0, f)
                      , _ = h + Math.cos(v + l) * c
                      , g = o + Math.sin(v + l) * c;
                    y.push({
                        x: _,
                        y: g
                    })
                }
                L.push({
                    points: y,
                    isFilled: !1
                })
            } else {
                const h = t.range(0, e)
                  , o = t.range(0, n)
                  , l = t.range(0, Math.PI * 2)
                  , c = t.range(e * .2, e * .8)
                  , m = h + Math.cos(l) * c
                  , f = o + Math.sin(l) * c
                  , y = [{
                    x: h,
                    y: o
                }, {
                    x: m,
                    y: f
                }];
                L.push({
                    points: y,
                    isFilled: !1
                })
            }
    }
      , nt = () => {
        const C = N()
          , P = t.range(0, Math.PI * 2)
          , D = t.int(3, 15)
          , s = t.bool(.5)
          , h = t.pick([1, 10, 45, 90, 120])
          , o = t.bool(.5)
          , l = t.range(0, Math.PI * 2);
        for (let c = D; c > 0; c--) {
            let m = c / D
              , f = (c + 1) / D
              , y = .8 * e * f
              , u = e / 2
              , v = n / 2
              , _ = o ? m + Math.sin(Math.PI * 2 * t.random()) * .1 + P : l
              , g = ft(u, v, y, y, _, 10)
              , b = s ? h : t.pick([1, 10, 45, 90, 120]);
            t.bool(1.5) && (g = xt(u, v, y, _, b));
            const z = {
                points: g,
                isFilled: !1,
                mask: C
            };
            L.push(z)
        }
    }
      , Y = () => {
        const C = t.int(2, 3);
        let P = d.windo ? e * t.range(0, .1) : 0
          , D = d.windo ? n * t.range(0, .1) : 0;
        t.bool(.2) && (P = D = t.range(0, .1) * e);
        const h = e - P * 2
          , l = (n - D * 2) / C
          , c = Math.floor(h / l)
          , m = l * .85
          , f = l
          , y = t.bool(.5)
          , u = t.pick([1, 10, 45, 90, 120]);
        t.range(0, Math.PI * 2);
        const v = N();
        for (let _ = 0; _ < C; _++)
            for (let g = 0; g < c; g++) {
                const b = P + g * l + l / 2
                  , E = D + _ * l + l / 2
                  , z = t.range(0, Math.PI * 2)
                  , G = y ? u : t.pick([1, 10, 45, 90, 120])
                  , $ = ft(b, E, f, f, 0, G);
                L.push({
                    points: $,
                    isFilled: !1,
                    fillColor: "white",
                    strokeColor: "black",
                    mask: v
                });
                const Z = xt(b, E, m / 2, z, G);
                L.push({
                    points: Z,
                    isFilled: !1,
                    fillColor: "white",
                    strokeColor: "black",
                    mask: v
                })
            }
    }
      , w = (C=.5, P=.5, D=1) => {
        const s = N()
          , h = ln
          , o = t.bool(P)
          , l = n * t.range(.5, 1)
          , c = t.bool(C)
          , m = t.pick([1, 45, 60, 90, 120])
          , f = t.range(0, Math.PI)
          , y = e / h
          , u = t.bool(.5);
        for (let v = 0; v < h * 2; v++) {
            const _ = u ? e - v * y : v * y
              , g = n / 2
              , b = o ? l : l * t.range(1, .5)
              , E = f
              , z = c ? m : t.pick([1, 5, 10, 45, 90, 120])
              , G = xt(_, g, b, E, z);
            t.pick([1, 5]);
            let $ = t.bool(D);
            for (let Z = 0; Z < G.length; Z++)
                G[Z].x / e,
                G[Z].y / n;
            L.push({
                points: G,
                isFilled: $,
                fillColor: "white",
                strokeColor: "black",
                mask: s
            })
        }
    }
      , X = (C=1, P=0) => {
        const D = N()
          , s = e / n
          , h = t.range(0, Math.PI * 2)
          , o = t.bool(.5);
        let l = t.pick([1, 1, 10, 45, 90, 120]);
        const c = t.bool(.5) ? 1 : .5
          , m = t.range(.65, 1.5) * c;
        let f = d.density == "h" ? t.bool(.5) : !0
          , y = 360;
        d.density == "h" && (y = t.bool(.7) ? 360 : 270);
        const u = t.pick([1, 3, 5, t.pick([1, 5])]);
        for (let v = 0; v < ln; v++) {
            let _ = Bt(Math.pow(t.random(), 1), 0, 1, .1, .6) * n * m;
            const g = .1 * e;
            let b = t.range(g, e - g)
              , E = t.range(g, n - g)
              , z = t.bool(P);
            const G = .7
              , $ = 1;
            let Z = h + t.n2D(b * G, E * G) * $
              , O = t.bool(C)
              , B = o ? l : t.pick([1, 1, 10, 45, 90, 120])
              , bt = []
              , ut = y;
            d.density == "h" && !f && (ut = t.bool(.5) ? 270 : 360),
            bt = xt(b, E, _, Z, B, ut);
            let Tt = u;
            Array.isArray(u) && (Tt = t.pick(u));
            const Et = .07 * e;
            for (let wt = 0; wt < bt.length; wt++) {
                const Gt = bt[wt].x / e
                  , Rt = bt[wt].y / n
                  , Ht = b
                  , Nt = E;
                let Ot = Et;
                z && (bt[wt].x += t.n2D((Gt * s + Ht) * Tt * s, (Rt + Ht) * Tt) * Ot,
                bt[wt].y += t.n2D((Gt * s + Nt) * Tt * s, (Rt + Nt) * Tt) * Ot)
            }
            const Ft = {
                points: bt,
                isFilled: O,
                mask: D
            };
            O && (Ft.fillColor = "white",
            Ft.strokeColor = "black"),
            L.push(Ft)
        }
    }
      , V = (C=.5, P=4) => {
        const D = N()
          , s = (c, m, f, y, u, v) => {
            if (u <= 0 || f < e * .1 && y < n * .1) {
                const b = t.range(-.2, .2) * 0;
                let E = ft(c + f / 2, m + y / 2, f, y, b, 10);
                for (let z = 0; z < E.length; z++) {
                    const G = E[z].x / e
                      , $ = E[z].y / n;
                    t.n2D(G * 4, $ * 4) * .1 * e
                }
                L.push({
                    points: E,
                    isFilled: t.bool(.5),
                    mask: D
                });
                return
            }
            const _ = Bt(u, P, 0, .2, .4)
              , g = Bt(u, P, 0, .8, .6);
            if (v) {
                const b = f * t.range(_, g);
                s(c, m, b, y, u - 1, !1),
                s(c + b, m, f - b, y, u - 1, !1)
            } else {
                const b = y * t.range(_, g);
                s(c, m, f, b, u - 1, !0),
                s(c, m + b, f, y - b, u - 1, !0)
            }
        }
          , h = d.windo ? e * .1 : 0
          , o = d.windo ? n * .05 : 0
          , l = t.bool(.5);
        s(h, o, e - h * 2, n - o * 2, P, l)
    }
      , N = () => (U++,
    U >= yt.length && (U = 0),
    yt[U])
      , T = () => {
        yt = [];
        const C = (o, l, c, m, f, y) => {
            if (f <= 0 || c < e * .1 && m < n * .1) {
                const _ = ft(o + c / 2, l + m / 2, c, m, 0, 10)
                  , g = t.pick([1, 2, 1, 2, 1, 2, 10]);
                let b = t.bool(.9) ? .07 : .17;
                b *= e,
                t.bool(.5) && (b *= 0);
                for (let E = 0; E < _.length; E++) {
                    const z = _[E].x / e
                      , G = _[E].y / n
                      , $ = o
                      , Z = l;
                    let O = b;
                    _[E].x += t.n2D((z * r + $) * g * r, (G + $) * g) * O,
                    _[E].y += t.n2D((z * r + Z) * g * r, (G + Z) * g) * O
                }
                yt.push({
                    points: _,
                    isFilled: !1,
                    fillColor: "white",
                    strokeColor: "black"
                });
                return
            }
            const u = Bt(f, s, 0, .1, .3)
              , v = Bt(f, s, 0, .9, .7);
            if (y) {
                const _ = c * t.range(u, v);
                C(o, l, _, m, f - 1, !1),
                C(o + _, l, c - _, m, f - 1, !1)
            } else {
                const _ = m * t.range(u, v);
                C(o, l, c, _, f - 1, !0),
                C(o, l + _, c, m - _, f - 1, !0)
            }
        }
          , P = d.windo ? e * .1 : 0
          , D = d.windo ? n * .05 : 0;
        H = d.comps.filter(o => o !== x.ROOM && o !== x.GRANDEUR && o !== x.RANDOMLINES);
        let s = H.length;
        t.bool(.5) && (s -= 1),
        s = Wt(s, 1, 2),
        t.bool(.15) && (s = t.bool(.5) ? 3 : 4);
        const h = t.bool(.5);
        C(P, D, e - P * 2, n - D * 2, s, h),
        yt = yt.map(o => ({
            value: o,
            sort: t.random()
        })).sort( (o, l) => o.sort - l.sort).map( ({value: o}) => o),
        yt.length > 8 && d.smalls && (d.smalls = t.bool(.2))
    }
      , lt = C => {
        for (let P = 0; P < C.length; P++) {
            const D = C[P];
            if (D === x.VERTICAL)
                t.bool(.5) ? I() : V(1, t.int(3, 4));
            else if (D === x.HORIZONTAL)
                i();
            else if (D === x.GRID)
                I(),
                i();
            else if (D === x.UNGRID) {
                let s = t.range(.15, .8);
                s = t.bool(.2) ? 1 : s,
                s = t.bool(.2) ? 0 : s;
                const h = d.density == "h" ? t.int(2, 4) : t.int(2, 6);
                V(s, h)
            } else if (D === x.FIELD)
                S();
            else if (D === x.CONCENTRIC)
                nt();
            else if (D === x.LINEAR) {
                const s = d.density == "l" || t.bool(.5) ? 1 : 0
                  , h = t.bool(.5) ? 1 : 0
                  , o = t.bool(.5) ? 1 : 0;
                w(h, o, s)
            } else if (D === x.PRIMITIVES)
                X(1, 0);
            else if (D === x.INTERSECTIONS) {
                const s = t.bool(.5) ? t.range(0, .5) : 0;
                X(s, 0)
            } else if (D === x.OPRIMITIVES)
                X(1, 1);
            else if (D === x.OINTERSECTIONS) {
                const s = t.bool(.5) ? t.range(0, .5) : 0;
                X(s, 1)
            } else if (D === x.ROOM)
                st();
            else if (D === x.RANDOMLINES)
                A(),
                t.bool(.3) && k();
            else if (D === x.GRIBOUILLIS && d.density !== "h") {
                const s = t.int(10, 30);
                M(s)
            } else if (D === x.GRIBOUILLIS && d.density == "h") {
                let s = [.1, .9]
                  , h = 100
                  , o = 10
                  , l = e * .01;
                M(h, o, l, 5, s)
            } else if (D === x.GRANDEUR) {
                let s = [.2, .8]
                  , h = 20
                  , o = 10
                  , l = e * .2
                  , c = 1;
                t.bool(.5) && (h = 10,
                o = t.pick([10]),
                l = e * .2,
                c = 2),
                M(h, o, l, c, s)
            } else if (D === x.PRIMGRID)
                Y();
            else if (D === x.ROTATEDGRID) {
                const s = t.bool(.5) ? t.range(.5, 1) : 0
                  , h = t.bool(.5) ? 1 : 0
                  , o = t.bool(.5) ? 1 : 0;
                K(s, h, o)
            } else
                D === x.FULLGRID && J();
            d.isLandscape && mt()
        }
    }
      , dt = (C=d.comps) => {
        lt(C)
    }
      , et = () => {
        let C = d.comps;
        if (a = document.createElement("canvas"),
        a.width = e,
        a.height = n,
        a.style.width = `${e * d.dimensions.debugScl}px`,
        a.style.height = `${n * d.dimensions.debugScl}px`,
        p = a.getContext("2d"),
        R = document.createElement("canvas"),
        R.width = e,
        R.height = n,
        R.style.width = `${e * d.dimensions.debugScl}px`,
        R.style.height = `${n * d.dimensions.debugScl}px`,
        F = R.getContext("2d"),
        F.lineWidth = 4,
        d.masks && T(),
        d.masks && H.length < yt.length && t.bool(.5)) {
            const P = yt.length - H.length
              , D = [x.CONCENTRIC, x.LINEAR, x.PRIMITIVES, x.INTERSECTIONS, x.OPRIMITIVES, x.OINTERSECTIONS, x.VERTICAL, x.HORIZONTAL]
              , s = [];
            for (let h = 0; h < P; h++)
                s.push(t.pick(D));
            C = [...C, ...s],
            t.bool(.3) && (C = [...C.filter(h => h !== x.ROOM), x.ROOM])
        }
        dt(C)
    }
      , ft = (C, P, D, s, h, o) => {
        const l = []
          , c = {
            x: C,
            y: P
        }
          , m = C - D / 2
          , f = P - s / 2;
        for (let y = 0; y <= s; y += o) {
            let u = m
              , v = f + y;
            u = Wt(u, 0, e),
            v = Wt(v, 0, n),
            l.push({
                x: u,
                y: v
            })
        }
        for (let y = 0; y <= D; y += o) {
            let u = m + y
              , v = f + s;
            u = Wt(u, 0, e),
            v = Wt(v, 0, n),
            l.push({
                x: u,
                y: v
            })
        }
        for (let y = s; y >= 0; y -= o) {
            let u = m + D
              , v = f + y;
            u = Wt(u, 0, e),
            v = Wt(v, 0, n),
            l.push({
                x: u,
                y: v
            })
        }
        for (let y = D; y >= 0; y -= o) {
            let u = m + y
              , v = f;
            u = Wt(u, 0, e),
            v = Wt(v, 0, n),
            l.push({
                x: u,
                y: v
            })
        }
        for (let y = 0; y < l.length; y++) {
            const u = l[y].x - c.x
              , v = l[y].y - c.y;
            l[y] = {
                x: Wt(c.x + (u * Math.cos(h) - v * Math.sin(h)), 0, e),
                y: Wt(c.y + (u * Math.sin(h) + v * Math.cos(h)), 0, n)
            }
        }
        return l
    }
      , xt = (C, P, D, s, h, o=360) => {
        const l = []
          , c = {
            x: C,
            y: P
        }
          , m = o;
        for (let f = 0; f <= m; f += h) {
            const y = f * Math.PI / 180;
            l.push({
                x: C + D * Math.cos(y),
                y: P + D * Math.sin(y)
            })
        }
        for (let f = 0; f < l.length; f++) {
            const y = l[f].x - c.x
              , u = l[f].y - c.y;
            l[f] = {
                x: Wt(c.x + (y * Math.cos(s) - u * Math.sin(s)), 0, e),
                y: Wt(c.y + (y * Math.sin(s) + u * Math.cos(s)), 0, n)
            }
        }
        for (let f = 0; f < l.length; f++)
            l[f].x = Wt(l[f].x, 0, e),
            l[f].y = Wt(l[f].y, 0, n);
        return l
    }
      , rt = (C, P=p) => {
        const D = C.points
          , s = C.isFilled
          , h = C.fillColor || "white";
        let o = D[0].x
          , l = D[0].y;
        P.save(),
        P.beginPath(),
        P.moveTo(o, l);
        for (let c = 1; c < D.length; c++) {
            const m = D[c];
            let f = m.x
              , y = m.y;
            P.lineTo(f, y)
        }
        s ? (P.fillStyle = h,
        P.fill(),
        C.strokeColor && (P.strokeStyle = C.strokeColor,
        P.stroke())) : P.stroke(),
        P.restore()
    }
      , pt = () => {
        F.clearRect(0, 0, e, n),
        F.fillStyle = "white",
        F.fillRect(0, 0, e, n);
        for (let C = 0; C < yt.length; C++)
            rt(yt[C], F)
    }
      , Dt = () => {
        p.clearRect(0, 0, e, n),
        p.fillStyle = "white",
        p.fillRect(0, 0, e, n),
        p.lineWidth = 4;
        for (let C = 0; C < L.length; C++)
            p.save(),
            L[C].mask && d.masks && t.bool(d.maskChance) && (rt(L[C].mask),
            p.clip()),
            rt(L[C]),
            p.restore();
        p.save(),
        p.strokeStyle = "black",
        p.fillStyle = "white",
        p.lineWidth = 4,
        p.beginPath(),
        p.rect(0, 0, e, n),
        p.stroke(),
        p.restore(),
        pt()
    }
      , It = () => {
        Dt()
    }
      , Lt = () => L;
    return et(),
    {
        getCanvas: Mt,
        getShapes: Lt,
        getMasksCanvas: ot,
        pause: vt,
        render: It
    }
}
  , To = () => {
    let e = d.dimensions.base[0]
      , n = d.dimensions.base[1]
      , r = null
      , a = [];
    const p = (L, yt) => {
        const vt = L / e
          , Mt = yt / n;
        let ot = !1;
        const mt = 5.5;
        return t.n2D(vt * mt, Mt * mt) > d.neg && (ot = !0),
        ot
    }
      , R = (L, yt) => {
        const vt = L / e
          , Mt = yt / n;
        let ot = t.pick(d.palette);
        if (d.colorrep == "n") {
            const mt = t.bool(.85) ? 5.5 : 1.5;
            let j = t.n2D(vt * mt, Mt * mt);
            const st = Math.floor(Bt(j, -1, 1, 0, d.palette.length - 1));
            ot = d.palette[st]
        }
        return ot
    }
      , F = () => {
        let L = [];
        const yt = e * t.range(.07, .1);
        L = new Bn({
            shape: [e, n],
            radius: yt,
            tries: 20
        },t.random.bind(t));
        var vt = L.fill();
        for (let Mt = 0; Mt < vt.length; Mt++) {
            const ot = vt[Mt];
            let mt = R(ot[0], ot[1]);
            const j = t.bool(.5);
            let st = {
                skip: t.bool(d.skipContour),
                opacity: t.range(.03, .08) * .8,
                strokeWidth: j ? .2 : t.range(.07, .2)
            }
              , W = p(ot[0], ot[1]);
            W && (mt = d.backgroundColor),
            a.push({
                x: ot[0],
                y: ot[1],
                radius: yt * .5,
                color: mt,
                neg: W,
                contour: st
            })
        }
    }
      , U = () => {
        F()
    }
      , H = () => r
      , Q = () => a;
    return U(),
    {
        getCanvas: H,
        getZones: Q
    }
}
;
var Go = function() {
    function e(S, I) {
        this.x = S,
        this.y = I
    }
    e.prototype.copy = function() {
        return new e(this.x,this.y)
    }
    ;
    function n(S, I) {
        this.w = S,
        this.h = I,
        this.size = S * I,
        this.arraybuffer = new ArrayBuffer(this.size),
        this.data = new Int8Array(this.arraybuffer)
    }
    n.prototype.at = function(S, I) {
        return S >= 0 && S < this.w && I >= 0 && I < this.h && this.data[this.w * I + S] === 1
    }
    ,
    n.prototype.index = function(S) {
        var I = new e;
        return I.y = Math.floor(S / this.w),
        I.x = S - I.y * this.w,
        I
    }
    ,
    n.prototype.flip = function(S, I) {
        this.at(S, I) ? this.data[this.w * I + S] = 0 : this.data[this.w * I + S] = 1
    }
    ,
    n.prototype.copy = function() {
        var S = new n(this.w,this.h), I;
        for (I = 0; I < this.size; I++)
            S.data[I] = this.data[I];
        return S
    }
    ;
    function r() {
        this.area = 0,
        this.len = 0,
        this.curve = {},
        this.pt = [],
        this.minX = 1e5,
        this.minY = 1e5,
        this.maxX = -1,
        this.maxY = -1
    }
    function a(S) {
        this.n = S,
        this.tag = new Array(S),
        this.c = new Array(S * 3),
        this.alphaCurve = 0,
        this.vertex = new Array(S),
        this.alpha = new Array(S),
        this.alpha0 = new Array(S),
        this.beta = new Array(S)
    }
    var p = document.createElement("img"), R = document.createElement("canvas"), F = null, U = [], H, Q = {
        isReady: !1,
        turnpolicy: "minority",
        turdsize: 2,
        optcurve: !0,
        alphamax: 1,
        opttolerance: .2
    };
    p.onload = L;
    function L() {
        mt(),
        j()
    }
    function yt(S) {
        Q.isReady && J(),
        p.file = S;
        var I = new FileReader;
        I.onload = function(i) {
            return function(k) {
                i.src = k.target.result
            }
        }(p),
        I.readAsDataURL(S)
    }
    function vt(S) {
        Q.isReady && J(),
        p.src = S
    }
    function Mt(S) {
        var I;
        for (I in S)
            S.hasOwnProperty(I) && (Q[I] = S[I])
    }
    function ot(S) {
        p = S
    }
    function mt() {
        R.width = p.width,
        R.height = p.height;
        var S = R.getContext("2d");
        S.drawImage(p, 0, 0)
    }
    function j() {
        var S = R.getContext("2d");
        F = new n(R.width,R.height);
        var I = S.getImageData(0, 0, F.w, F.h), i = I.data.length, k, M, A;
        for (k = 0,
        M = 0; k < i; k += 4,
        M++)
            A = .2126 * I.data[k] + .7153 * I.data[k + 1] + .0721 * I.data[k + 2],
            F.data[M] = A < 128 ? 1 : 0;
        Q.isReady = !0
    }
    function st() {
        var S = F.copy(), I = new e(0,0), i;
        function k(Y) {
            for (var w = S.w * Y.y + Y.x; w < S.size && S.data[w] !== 1; )
                w++;
            return w < S.size && S.index(w)
        }
        function M(Y, w) {
            var X, V, N;
            for (X = 2; X < 5; X++) {
                for (N = 0,
                V = -X + 1; V <= X - 1; V++)
                    N += S.at(Y + V, w + X - 1) ? 1 : -1,
                    N += S.at(Y + X - 1, w + V - 1) ? 1 : -1,
                    N += S.at(Y + V - 1, w - X) ? 1 : -1,
                    N += S.at(Y - X, w + V) ? 1 : -1;
                if (N > 0)
                    return 1;
                if (N < 0)
                    return 0
            }
            return 0
        }
        function A(Y) {
            var w = new r, X = Y.x, V = Y.y, N = 0, T = 1, lt;
            for (w.sign = F.at(Y.x, Y.y) ? "+" : "-"; w.pt.push(new e(X,V)),
            X > w.maxX && (w.maxX = X),
            X < w.minX && (w.minX = X),
            V > w.maxY && (w.maxY = V),
            V < w.minY && (w.minY = V),
            w.len++,
            X += N,
            V += T,
            w.area -= X * T,
            !(X === Y.x && V === Y.y); ) {
                var dt = S.at(X + (N + T - 1) / 2, V + (T - N - 1) / 2)
                  , et = S.at(X + (N - T - 1) / 2, V + (T + N - 1) / 2);
                et && !dt ? Q.turnpolicy === "right" || Q.turnpolicy === "black" && w.sign === "+" || Q.turnpolicy === "white" && w.sign === "-" || Q.turnpolicy === "majority" && M(X, V) || Q.turnpolicy === "minority" && !M(X, V) ? (lt = N,
                N = -T,
                T = lt) : (lt = N,
                N = T,
                T = -lt) : et ? (lt = N,
                N = -T,
                T = lt) : dt || (lt = N,
                N = T,
                T = -lt)
            }
            return w
        }
        function nt(Y) {
            var w = Y.pt[0].y, X = Y.len, V, N, T, lt, dt, et;
            for (dt = 1; dt < X; dt++)
                if (V = Y.pt[dt].x,
                N = Y.pt[dt].y,
                N !== w) {
                    for (lt = w < N ? w : N,
                    T = Y.maxX,
                    et = V; et < T; et++)
                        S.flip(et, lt);
                    w = N
                }
        }
        for (; I = k(I); )
            i = A(I),
            nt(i),
            i.area > Q.turdsize && U.push(i)
    }
    function W() {
        function S() {
            this.data = [0, 0, 0, 0, 0, 0, 0, 0, 0]
        }
        S.prototype.at = function(s, h) {
            return this.data[s * 3 + h]
        }
        ;
        function I(s, h, o, l, c) {
            this.x = s,
            this.y = h,
            this.xy = o,
            this.x2 = l,
            this.y2 = c
        }
        function i(s, h) {
            return s >= h ? s % h : s >= 0 ? s : h - 1 - (-1 - s) % h
        }
        function k(s, h) {
            return s.x * h.y - s.y * h.x
        }
        function M(s, h, o) {
            return s <= o ? s <= h && h < o : s <= h || h < o
        }
        function A(s) {
            return s > 0 ? 1 : s < 0 ? -1 : 0
        }
        function nt(s, h) {
            var o = new Array(3), l, c, m;
            for (o[0] = h.x,
            o[1] = h.y,
            o[2] = 1,
            m = 0,
            l = 0; l < 3; l++)
                for (c = 0; c < 3; c++)
                    m += o[l] * s.at(l, c) * o[c];
            return m
        }
        function Y(s, h, o) {
            var l = new e;
            return l.x = h.x + s * (o.x - h.x),
            l.y = h.y + s * (o.y - h.y),
            l
        }
        function w(s, h) {
            var o = new e;
            return o.y = A(h.x - s.x),
            o.x = -A(h.y - s.y),
            o
        }
        function X(s, h) {
            var o = w(s, h);
            return o.y * (h.x - s.x) - o.x * (h.y - s.y)
        }
        function V(s, h, o) {
            var l, c, m, f;
            return l = h.x - s.x,
            c = h.y - s.y,
            m = o.x - s.x,
            f = o.y - s.y,
            l * f - m * c
        }
        function N(s, h, o, l) {
            var c, m, f, y;
            return c = h.x - s.x,
            m = h.y - s.y,
            f = l.x - o.x,
            y = l.y - o.y,
            c * y - f * m
        }
        function T(s, h, o) {
            var l, c, m, f;
            return l = h.x - s.x,
            c = h.y - s.y,
            m = o.x - s.x,
            f = o.y - s.y,
            l * m + c * f
        }
        function lt(s, h, o, l) {
            var c, m, f, y;
            return c = h.x - s.x,
            m = h.y - s.y,
            f = l.x - o.x,
            y = l.y - o.y,
            c * f + m * y
        }
        function dt(s, h) {
            return Math.sqrt((s.x - h.x) * (s.x - h.x) + (s.y - h.y) * (s.y - h.y))
        }
        function et(s, h, o, l, c) {
            var m = 1 - s
              , f = new e;
            return f.x = m * m * m * h.x + 3 * (m * m * s) * o.x + 3 * (s * s * m) * l.x + s * s * s * c.x,
            f.y = m * m * m * h.y + 3 * (m * m * s) * o.y + 3 * (s * s * m) * l.y + s * s * s * c.y,
            f
        }
        function ft(s, h, o, l, c, m) {
            var f, y, u, v, _, g, b, E, z, G;
            return f = N(s, h, c, m),
            y = N(h, o, c, m),
            u = N(o, l, c, m),
            v = f - 2 * y + u,
            _ = -2 * f + 2 * y,
            g = f,
            b = _ * _ - 4 * v * g,
            v === 0 || b < 0 ? -1 : (E = Math.sqrt(b),
            z = (-_ + E) / (2 * v),
            G = (-_ - E) / (2 * v),
            z >= 0 && z <= 1 ? z : G >= 0 && G <= 1 ? G : -1)
        }
        function xt(s) {
            var h, o, l;
            s.x0 = s.pt[0].x,
            s.y0 = s.pt[0].y,
            s.sums = [];
            var c = s.sums;
            for (c.push(new I(0,0,0,0,0)),
            h = 0; h < s.len; h++)
                o = s.pt[h].x - s.x0,
                l = s.pt[h].y - s.y0,
                c.push(new I(c[h].x + o,c[h].y + l,c[h].xy + o * l,c[h].x2 + o * o,c[h].y2 + l * l))
        }
        function rt(s) {
            var h = s.len, o = s.pt, l, c = new Array(h), m = new Array(h), f = new Array(4);
            s.lon = new Array(h);
            var y = [new e, new e], u = new e, v = new e, _ = new e, g, b, E, z, G, $, Z, O, B = 0;
            for (b = h - 1; b >= 0; b--)
                o[b].x != o[B].x && o[b].y != o[B].y && (B = b + 1),
                m[b] = B;
            for (b = h - 1; b >= 0; b--) {
                for (f[0] = f[1] = f[2] = f[3] = 0,
                l = (3 + 3 * (o[i(b + 1, h)].x - o[b].x) + (o[i(b + 1, h)].y - o[b].y)) / 2,
                f[l]++,
                y[0].x = 0,
                y[0].y = 0,
                y[1].x = 0,
                y[1].y = 0,
                B = m[b],
                z = b; ; ) {
                    if (g = 0,
                    l = (3 + 3 * A(o[B].x - o[z].x) + A(o[B].y - o[z].y)) / 2,
                    f[l]++,
                    f[0] && f[1] && f[2] && f[3]) {
                        c[b] = z,
                        g = 1;
                        break
                    }
                    if (u.x = o[B].x - o[b].x,
                    u.y = o[B].y - o[b].y,
                    k(y[0], u) < 0 || k(y[1], u) > 0 || (Math.abs(u.x) <= 1 && Math.abs(u.y) <= 1 || (v.x = u.x + (u.y >= 0 && (u.y > 0 || u.x < 0) ? 1 : -1),
                    v.y = u.y + (u.x <= 0 && (u.x < 0 || u.y < 0) ? 1 : -1),
                    k(y[0], v) >= 0 && (y[0].x = v.x,
                    y[0].y = v.y),
                    v.x = u.x + (u.y <= 0 && (u.y < 0 || u.x < 0) ? 1 : -1),
                    v.y = u.y + (u.x >= 0 && (u.x > 0 || u.y < 0) ? 1 : -1),
                    k(y[1], v) <= 0 && (y[1].x = v.x,
                    y[1].y = v.y)),
                    z = B,
                    B = m[z],
                    !M(B, b, z)))
                        break
                }
                g === 0 && (_.x = A(o[B].x - o[z].x),
                _.y = A(o[B].y - o[z].y),
                u.x = o[z].x - o[b].x,
                u.y = o[z].y - o[b].y,
                G = k(y[0], u),
                $ = k(y[0], _),
                Z = k(y[1], u),
                O = k(y[1], _),
                E = 1e7,
                $ < 0 && (E = Math.floor(G / -$)),
                O > 0 && (E = Math.min(E, Math.floor(-Z / O))),
                c[b] = i(z + E, h))
            }
            for (E = c[h - 1],
            s.lon[h - 1] = E,
            b = h - 2; b >= 0; b--)
                M(b + 1, c[b], E) && (E = c[b]),
                s.lon[b] = E;
            for (b = h - 1; M(i(b + 1, h), E, s.lon[b]); b--)
                s.lon[b] = E
        }
        function pt(s) {
            function h($, Z, O) {
                var B = $.len, bt = $.pt, ut = $.sums, Tt, Et, Ft, wt, Gt, Rt, Ht, Nt, Ot, Yt, tt, at, ct, Ct, Zt = 0;
                return O >= B && (O -= B,
                Zt = 1),
                Zt === 0 ? (Tt = ut[O + 1].x - ut[Z].x,
                Et = ut[O + 1].y - ut[Z].y,
                wt = ut[O + 1].x2 - ut[Z].x2,
                Ft = ut[O + 1].xy - ut[Z].xy,
                Gt = ut[O + 1].y2 - ut[Z].y2,
                Rt = O + 1 - Z) : (Tt = ut[O + 1].x - ut[Z].x + ut[B].x,
                Et = ut[O + 1].y - ut[Z].y + ut[B].y,
                wt = ut[O + 1].x2 - ut[Z].x2 + ut[B].x2,
                Ft = ut[O + 1].xy - ut[Z].xy + ut[B].xy,
                Gt = ut[O + 1].y2 - ut[Z].y2 + ut[B].y2,
                Rt = O + 1 - Z + B),
                tt = (bt[Z].x + bt[O].x) / 2 - bt[0].x,
                at = (bt[Z].y + bt[O].y) / 2 - bt[0].y,
                Ct = bt[O].x - bt[Z].x,
                ct = -(bt[O].y - bt[Z].y),
                Ht = (wt - 2 * Tt * tt) / Rt + tt * tt,
                Nt = (Ft - Tt * at - Et * tt) / Rt + tt * at,
                Ot = (Gt - 2 * Et * at) / Rt + at * at,
                Yt = ct * ct * Ht + 2 * ct * Ct * Nt + Ct * Ct * Ot,
                Math.sqrt(Yt)
            }
            var o, l, c, m, f = s.len, y = new Array(f + 1), u = new Array(f + 1), v = new Array(f), _ = new Array(f + 1), g = new Array(f + 1), b = new Array(f + 1), E, z, G;
            for (o = 0; o < f; o++)
                G = i(s.lon[i(o - 1, f)] - 1, f),
                G == o && (G = i(o + 1, f)),
                G < o ? v[o] = f : v[o] = G;
            for (l = 1,
            o = 0; o < f; o++)
                for (; l <= v[o]; )
                    _[l] = o,
                    l++;
            for (o = 0,
            l = 0; o < f; l++)
                g[l] = o,
                o = v[o];
            for (g[l] = f,
            c = l,
            o = f,
            l = c; l > 0; l--)
                b[l] = o,
                o = _[o];
            for (b[0] = 0,
            y[0] = 0,
            l = 1; l <= c; l++)
                for (o = b[l]; o <= g[l]; o++) {
                    for (z = -1,
                    m = g[l - 1]; m >= _[o]; m--)
                        E = h(s, m, o) + y[m],
                        (z < 0 || E < z) && (u[o] = m,
                        z = E);
                    y[o] = z
                }
            for (s.m = c,
            s.po = new Array(c),
            o = f,
            l = c - 1; o > 0; l--)
                o = u[o],
                s.po[l] = o
        }
        function Dt(s) {
            function h(Ht, Nt, Ot, Yt, tt) {
                for (var at = Ht.len, ct = Ht.sums, Ct, Zt, Xt, ee, ne, zt, ht, gt, St, At, Pt, Vt = 0; Ot >= at; )
                    Ot -= at,
                    Vt += 1;
                for (; Nt >= at; )
                    Nt -= at,
                    Vt -= 1;
                for (; Ot < 0; )
                    Ot += at,
                    Vt -= 1;
                for (; Nt < 0; )
                    Nt += at,
                    Vt += 1;
                Ct = ct[Ot + 1].x - ct[Nt].x + Vt * ct[at].x,
                Zt = ct[Ot + 1].y - ct[Nt].y + Vt * ct[at].y,
                Xt = ct[Ot + 1].x2 - ct[Nt].x2 + Vt * ct[at].x2,
                ee = ct[Ot + 1].xy - ct[Nt].xy + Vt * ct[at].xy,
                ne = ct[Ot + 1].y2 - ct[Nt].y2 + Vt * ct[at].y2,
                zt = Ot + 1 - Nt + Vt * at,
                Yt.x = Ct / zt,
                Yt.y = Zt / zt,
                ht = (Xt - Ct * Ct / zt) / zt,
                gt = (ee - Ct * Zt / zt) / zt,
                St = (ne - Zt * Zt / zt) / zt,
                At = (ht + St + Math.sqrt((ht - St) * (ht - St) + 4 * gt * gt)) / 2,
                ht -= At,
                St -= At,
                Math.abs(ht) >= Math.abs(St) ? (Pt = Math.sqrt(ht * ht + gt * gt),
                Pt !== 0 && (tt.x = -gt / Pt,
                tt.y = ht / Pt)) : (Pt = Math.sqrt(St * St + gt * gt),
                Pt !== 0 && (tt.x = -St / Pt,
                tt.y = gt / Pt)),
                Pt === 0 && (tt.x = tt.y = 0)
            }
            var o = s.m, l = s.po, c = s.len, m = s.pt, f = s.x0, y = s.y0, u = new Array(o), v = new Array(o), _ = new Array(o), g = new Array(3), b, E, z, G, $, Z = new e;
            for (s.curve = new a(o),
            E = 0; E < o; E++)
                z = l[i(E + 1, o)],
                z = i(z - l[E], c) + l[E],
                u[E] = new e,
                v[E] = new e,
                h(s, l[E], z, u[E], v[E]);
            for (E = 0; E < o; E++)
                if (_[E] = new S,
                b = v[E].x * v[E].x + v[E].y * v[E].y,
                b === 0)
                    for (z = 0; z < 3; z++)
                        for (G = 0; G < 3; G++)
                            _[E].data[z * 3 + G] = 0;
                else
                    for (g[0] = v[E].y,
                    g[1] = -v[E].x,
                    g[2] = -g[1] * u[E].y - g[0] * u[E].x,
                    $ = 0; $ < 3; $++)
                        for (G = 0; G < 3; G++)
                            _[E].data[$ * 3 + G] = g[$] * g[G] / b;
            var O, B, bt, ut, Tt, Et, Ft, wt, Gt, Rt;
            for (E = 0; E < o; E++) {
                for (O = new S,
                B = new e,
                Z.x = m[l[E]].x - f,
                Z.y = m[l[E]].y - y,
                z = i(E - 1, o),
                $ = 0; $ < 3; $++)
                    for (G = 0; G < 3; G++)
                        O.data[$ * 3 + G] = _[z].at($, G) + _[E].at($, G);
                for (; ; ) {
                    if (Tt = O.at(0, 0) * O.at(1, 1) - O.at(0, 1) * O.at(1, 0),
                    Tt !== 0) {
                        B.x = (-O.at(0, 2) * O.at(1, 1) + O.at(1, 2) * O.at(0, 1)) / Tt,
                        B.y = (O.at(0, 2) * O.at(1, 0) - O.at(1, 2) * O.at(0, 0)) / Tt;
                        break
                    }
                    for (O.at(0, 0) > O.at(1, 1) ? (g[0] = -O.at(0, 1),
                    g[1] = O.at(0, 0)) : O.at(1, 1) ? (g[0] = -O.at(1, 1),
                    g[1] = O.at(1, 0)) : (g[0] = 1,
                    g[1] = 0),
                    b = g[0] * g[0] + g[1] * g[1],
                    g[2] = -g[1] * Z.y - g[0] * Z.x,
                    $ = 0; $ < 3; $++)
                        for (G = 0; G < 3; G++)
                            O.data[$ * 3 + G] += g[$] * g[G] / b
                }
                if (bt = Math.abs(B.x - Z.x),
                ut = Math.abs(B.y - Z.y),
                bt <= .5 && ut <= .5) {
                    s.curve.vertex[E] = new e(B.x + f,B.y + y);
                    continue
                }
                if (Et = nt(O, Z),
                wt = Z.x,
                Gt = Z.y,
                O.at(0, 0) !== 0)
                    for (Rt = 0; Rt < 2; Rt++)
                        B.y = Z.y - .5 + Rt,
                        B.x = -(O.at(0, 1) * B.y + O.at(0, 2)) / O.at(0, 0),
                        bt = Math.abs(B.x - Z.x),
                        Ft = nt(O, B),
                        bt <= .5 && Ft < Et && (Et = Ft,
                        wt = B.x,
                        Gt = B.y);
                if (O.at(1, 1) !== 0)
                    for (Rt = 0; Rt < 2; Rt++)
                        B.x = Z.x - .5 + Rt,
                        B.y = -(O.at(1, 0) * B.x + O.at(1, 2)) / O.at(1, 1),
                        ut = Math.abs(B.y - Z.y),
                        Ft = nt(O, B),
                        ut <= .5 && Ft < Et && (Et = Ft,
                        wt = B.x,
                        Gt = B.y);
                for ($ = 0; $ < 2; $++)
                    for (G = 0; G < 2; G++)
                        B.x = Z.x - .5 + $,
                        B.y = Z.y - .5 + G,
                        Ft = nt(O, B),
                        Ft < Et && (Et = Ft,
                        wt = B.x,
                        Gt = B.y);
                s.curve.vertex[E] = new e(wt + f,Gt + y)
            }
        }
        function It(s) {
            var h = s.curve, o = h.n, l = h.vertex, c, m, f;
            for (c = 0,
            m = o - 1; c < m; c++,
            m--)
                f = l[c],
                l[c] = l[m],
                l[m] = f
        }
        function Lt(s) {
            var h = s.curve.n, o = s.curve, l, c, m, f, y, u, v, _, g;
            for (l = 0; l < h; l++)
                c = i(l + 1, h),
                m = i(l + 2, h),
                g = Y(1 / 2, o.vertex[m], o.vertex[c]),
                y = X(o.vertex[l], o.vertex[m]),
                y !== 0 ? (f = V(o.vertex[l], o.vertex[c], o.vertex[m]) / y,
                f = Math.abs(f),
                u = f > 1 ? 1 - 1 / f : 0,
                u = u / .75) : u = 4 / 3,
                o.alpha0[c] = u,
                u >= Q.alphamax ? (o.tag[c] = "CORNER",
                o.c[3 * c + 1] = o.vertex[c],
                o.c[3 * c + 2] = g) : (u < .55 ? u = .55 : u > 1 && (u = 1),
                v = Y(.5 + .5 * u, o.vertex[l], o.vertex[c]),
                _ = Y(.5 + .5 * u, o.vertex[m], o.vertex[c]),
                o.tag[c] = "CURVE",
                o.c[3 * c + 0] = v,
                o.c[3 * c + 1] = _,
                o.c[3 * c + 2] = g),
                o.alpha[c] = u,
                o.beta[c] = .5;
            o.alphacurve = 1
        }
        function C(s) {
            function h() {
                this.pen = 0,
                this.c = [new e, new e],
                this.t = 0,
                this.s = 0,
                this.alpha = 0
            }
            function o(Ft, wt, Gt, Rt, Ht, Nt, Ot) {
                var Yt = Ft.curve.n, tt = Ft.curve, at = tt.vertex, ct, Ct, Zt, Xt, ee, ne, zt, ht, gt, St, At, Pt, Vt, oe, ue, Ue, Ke, Ae, ge, De, tn, Xe, se;
                if (wt == Gt || (ct = wt,
                ee = i(wt + 1, Yt),
                Ct = i(ct + 1, Yt),
                Xt = Nt[Ct],
                Xt === 0))
                    return 1;
                for (ht = dt(at[wt], at[ee]),
                ct = Ct; ct != Gt; ct = Ct)
                    if (Ct = i(ct + 1, Yt),
                    Zt = i(ct + 2, Yt),
                    Nt[Ct] != Xt || A(N(at[wt], at[ee], at[Ct], at[Zt])) != Xt || lt(at[wt], at[ee], at[Ct], at[Zt]) < ht * dt(at[Ct], at[Zt]) * -.999847695156)
                        return 1;
                if (At = tt.c[i(wt, Yt) * 3 + 2].copy(),
                Pt = at[i(wt + 1, Yt)].copy(),
                Vt = at[i(Gt, Yt)].copy(),
                oe = tt.c[i(Gt, Yt) * 3 + 2].copy(),
                ne = Ot[Gt] - Ot[wt],
                ne -= V(at[0], tt.c[wt * 3 + 2], tt.c[Gt * 3 + 2]) / 2,
                wt >= Gt && (ne += Ot[Yt]),
                Ae = V(At, Pt, Vt),
                ge = V(At, Pt, oe),
                De = V(At, Vt, oe),
                tn = Ae + De - ge,
                ge == Ae || (se = De / (De - tn),
                Xe = ge / (ge - Ae),
                Ue = ge * se / 2,
                Ue === 0))
                    return 1;
                for (Ke = ne / Ue,
                zt = 2 - Math.sqrt(4 - Ke / .3),
                Rt.c[0] = Y(se * zt, At, Pt),
                Rt.c[1] = Y(Xe * zt, oe, Vt),
                Rt.alpha = zt,
                Rt.t = se,
                Rt.s = Xe,
                Pt = Rt.c[0].copy(),
                Vt = Rt.c[1].copy(),
                Rt.pen = 0,
                ct = i(wt + 1, Yt); ct != Gt; ct = Ct) {
                    if (Ct = i(ct + 1, Yt),
                    se = ft(At, Pt, Vt, oe, at[ct], at[Ct]),
                    se < -.5 || (ue = et(se, At, Pt, Vt, oe),
                    ht = dt(at[ct], at[Ct]),
                    ht === 0) || (gt = V(at[ct], at[Ct], ue) / ht,
                    Math.abs(gt) > Ht) || T(at[ct], at[Ct], ue) < 0 || T(at[Ct], at[ct], ue) < 0)
                        return 1;
                    Rt.pen += gt * gt
                }
                for (ct = wt; ct != Gt; ct = Ct) {
                    if (Ct = i(ct + 1, Yt),
                    se = ft(At, Pt, Vt, oe, tt.c[ct * 3 + 2], tt.c[Ct * 3 + 2]),
                    se < -.5 || (ue = et(se, At, Pt, Vt, oe),
                    ht = dt(tt.c[ct * 3 + 2], tt.c[Ct * 3 + 2]),
                    ht === 0) || (gt = V(tt.c[ct * 3 + 2], tt.c[Ct * 3 + 2], ue) / ht,
                    St = V(tt.c[ct * 3 + 2], tt.c[Ct * 3 + 2], at[Ct]) / ht,
                    St *= .75 * tt.alpha[Ct],
                    St < 0 && (gt = -gt,
                    St = -St),
                    gt < St - Ht))
                        return 1;
                    gt < St && (Rt.pen += (gt - St) * (gt - St))
                }
                return 0
            }
            var l = s.curve, c = l.n, m = l.vertex, f = new Array(c + 1), y = new Array(c + 1), u = new Array(c + 1), v = new Array(c + 1), _, g, b, E, z = new h, G, $, Z, O, B, bt, ut, Tt = new Array(c), Et = new Array(c + 1);
            for (g = 0; g < c; g++)
                l.tag[g] == "CURVE" ? Tt[g] = A(V(m[i(g - 1, c)], m[g], m[i(g + 1, c)])) : Tt[g] = 0;
            for (Z = 0,
            Et[0] = 0,
            G = l.vertex[0],
            g = 0; g < c; g++)
                $ = i(g + 1, c),
                l.tag[$] == "CURVE" && (O = l.alpha[$],
                Z += .3 * O * (4 - O) * V(l.c[g * 3 + 2], m[$], l.c[$ * 3 + 2]) / 2,
                Z += V(G, l.c[g * 3 + 2], l.c[$ * 3 + 2]) / 2),
                Et[g + 1] = Z;
            for (f[0] = -1,
            y[0] = 0,
            u[0] = 0,
            b = 1; b <= c; b++)
                for (f[b] = b - 1,
                y[b] = y[b - 1],
                u[b] = u[b - 1] + 1,
                g = b - 2; g >= 0 && (E = o(s, g, i(b, c), z, Q.opttolerance, Tt, Et),
                !E); g--)
                    (u[b] > u[g] + 1 || u[b] == u[g] + 1 && y[b] > y[g] + z.pen) && (f[b] = g,
                    y[b] = y[g] + z.pen,
                    u[b] = u[g] + 1,
                    v[b] = z,
                    z = new h);
            for (_ = u[c],
            B = new a(_),
            bt = new Array(_),
            ut = new Array(_),
            b = c,
            g = _ - 1; g >= 0; g--)
                f[b] == b - 1 ? (B.tag[g] = l.tag[i(b, c)],
                B.c[g * 3 + 0] = l.c[i(b, c) * 3 + 0],
                B.c[g * 3 + 1] = l.c[i(b, c) * 3 + 1],
                B.c[g * 3 + 2] = l.c[i(b, c) * 3 + 2],
                B.vertex[g] = l.vertex[i(b, c)],
                B.alpha[g] = l.alpha[i(b, c)],
                B.alpha0[g] = l.alpha0[i(b, c)],
                B.beta[g] = l.beta[i(b, c)],
                bt[g] = ut[g] = 1) : (B.tag[g] = "CURVE",
                B.c[g * 3 + 0] = v[b].c[0],
                B.c[g * 3 + 1] = v[b].c[1],
                B.c[g * 3 + 2] = l.c[i(b, c) * 3 + 2],
                B.vertex[g] = Y(v[b].s, l.c[i(b, c) * 3 + 2], m[i(b, c)]),
                B.alpha[g] = v[b].alpha,
                B.alpha0[g] = v[b].alpha,
                bt[g] = v[b].s,
                ut[g] = v[b].t),
                b = f[b];
            for (g = 0; g < _; g++)
                $ = i(g + 1, _),
                B.beta[g] = bt[g] / (bt[g] + ut[$]);
            B.alphacurve = 1,
            s.curve = B
        }
        for (var P = 0; P < U.length; P++) {
            var D = U[P];
            xt(D),
            rt(D),
            pt(D),
            Dt(D),
            D.sign === "-" && It(D),
            Lt(D),
            Q.optcurve && C(D)
        }
    }
    function K(S) {
        if (S && (H = S),
        !Q.isReady) {
            setTimeout(K, 100);
            return
        }
        st(),
        W(),
        H(),
        H = null
    }
    function J() {
        F = null,
        U = [],
        H = null,
        Q.isReady = !1
    }
    function it(S, I) {
        function i(T) {
            function lt(rt) {
                var pt = "C " + (T.c[rt * 3 + 0].x * S).toFixed(3) + " " + (T.c[rt * 3 + 0].y * S).toFixed(3) + ",";
                return pt += (T.c[rt * 3 + 1].x * S).toFixed(3) + " " + (T.c[rt * 3 + 1].y * S).toFixed(3) + ",",
                pt += (T.c[rt * 3 + 2].x * S).toFixed(3) + " " + (T.c[rt * 3 + 2].y * S).toFixed(3) + " ",
                pt
            }
            function dt(rt) {
                var pt = "L " + (T.c[rt * 3 + 1].x * S).toFixed(3) + " " + (T.c[rt * 3 + 1].y * S).toFixed(3) + " ";
                return pt += (T.c[rt * 3 + 2].x * S).toFixed(3) + " " + (T.c[rt * 3 + 2].y * S).toFixed(3) + " ",
                pt
            }
            var et = T.n, ft, xt = "M" + (T.c[(et - 1) * 3 + 2].x * S).toFixed(3) + " " + (T.c[(et - 1) * 3 + 2].y * S).toFixed(3) + " ";
            for (ft = 0; ft < et; ft++)
                T.tag[ft] === "CURVE" ? xt += lt(ft) : T.tag[ft] === "CORNER" && (xt += dt(ft));
            return xt
        }
        var k = F.w * S, M = F.h * S, A = U.length, nt, Y, w, X, V, N = '<svg id="svg" version="1.1" width="' + k + '" height="' + M + '" xmlns="http://www.w3.org/2000/svg">';
        for (N += '<path d="',
        Y = 0; Y < A; Y++)
            nt = U[Y].curve,
            N += i(nt);
        return I === "curve" ? (w = "black",
        X = "none",
        V = "") : (w = "none",
        X = "black",
        V = ' fill-rule="evenodd"'),
        N += '" stroke="' + w + '" fill="' + X + '"' + V + "/></svg>",
        N
    }
    return {
        loadImageFromFile: yt,
        loadImageFromUrl: vt,
        setParameter: Mt,
        process: K,
        getSVG: it,
        setImg: ot,
        setImg: ot,
        onImgLoaded: L,
        img: p
    }
};
const re = (e, n) => {
    const r = e[0]
      , a = e[1];
    let p = !1;
    for (let R = 0, F = n.length - 2; R < n.length; F = R,
    R += 2) {
        const U = n[R]
          , H = n[R + 1]
          , Q = n[F]
          , L = n[F + 1];
        H > a != L > a && r < (Q - U) * (a - H) / (L - H) + U && (p = !p)
    }
    return p
}
  , rn = e => {
    if (e.length === 0)
        return console.warn("[geom-utils:computeBoundingBox] No points to compute bounding box"),
        null;
    const n = L => Array.isArray(L) ? L[0] : L.x
      , r = L => Array.isArray(L) ? L[1] : L.y;
    let a = n(e[0])
      , p = r(e[0])
      , R = n(e[0])
      , F = r(e[0]);
    e.forEach(L => {
        const yt = n(L)
          , vt = r(L);
        yt < a && (a = yt),
        yt > R && (R = yt),
        vt < p && (p = vt),
        vt > F && (F = vt)
    }
    );
    const U = R - a
      , H = F - p
      , Q = U * H || .01;
    return {
        minX: a,
        maxX: R,
        minY: p,
        maxY: F,
        area: Q
    }
}
  , an = e => {
    let n = 0;
    for (let r = 0; r < e.length; r += 2) {
        const a = (r + 2) % e.length;
        n += e[r] * e[a + 1],
        n -= e[r + 1] * e[a]
    }
    return Math.abs(n) / 2
}
  , Bo = ["green", "purple", "#F48484", "brown", "#00337C", "orange"];
let cn = null
  , ce = null
  , Uo = null;
const hn = ["color"]
  , fn = []
  , Oe = []
  , Ee = 1
  , Xo = () => {
    let e = d.dimensions.base[0]
      , n = d.dimensions.base[1]
      , r = []
      , a = [];
    const p = j => {
        cn = j,
        F()
    }
      , R = () => L("color").cvs
      , F = () => {
        const j = new Go;
        j.setImg(cn),
        j.onImgLoaded(),
        j.process(function() {
            const st = j.getSVG(1);
            ce = new DOMParser().parseFromString(st, "image/svg+xml").querySelector("svg"),
            document.body.appendChild(ce),
            ce.style.visibility = "hidden",
            ce.style.position = "absolute",
            ce.style.top = ce.style.left = "0px",
            U()
        })
    }
      , U = () => {
        H(),
        Q(),
        vt()
    }
      , H = () => {
        const j = ce.querySelector("path");
        j.getBoundingClientRect();
        const st = j.getAttribute("d") + ""
          , W = [...st.matchAll(new RegExp("M","gi"))].map(K => K.index);
        for (let K = 0; K < W.length; K++) {
            const J = st.substring(W[K], W[K + 1])
              , it = t.pick(Bo)
              , S = document.createElementNS("http://www.w3.org/2000/svg", "path");
            S.setAttributeNS(null, "d", J),
            S.setAttributeNS(null, "fill", it),
            S.setAttributeNS(null, "fill-rull", "even-odd"),
            S.setAttributeNS(null, "stroke", "none");
            let I = 0;
            const i = {
                path: S,
                color: it,
                points: [],
                area: 0,
                bounds: {
                    minX: 1 / 0,
                    minY: 1 / 0,
                    maxX: -1 / 0,
                    maxY: -1 / 0
                }
            }
              , k = S.getTotalLength();
            let M = d.rough ? t.pick([60, 100, 150]) : 5
              , A = t.pick(d.geomOffset.normOffsetOpts);
            for (let Y = 0; Y < k - M; Y += M) {
                const w = S.getPointAtLength(Y)
                  , X = S.getPointAtLength(Y + M);
                w.x *= Ee,
                w.y *= Ee,
                X.x *= Ee,
                X.y *= Ee;
                const V = X.x - w.x
                  , N = X.y - w.y
                  , T = Math.atan2(N, V)
                  , lt = T + Math.PI / 2
                  , dt = w.x / e
                  , et = w.y / n
                  , ft = d.geomOffset.noiseScl
                  , xt = d.geomOffset.noiseAmp
                  , rt = 10
                  , pt = t.n2D(dt * ft * 2 + K, et * ft * 2 + K)
                  , Dt = rt * pt
                  , It = K * 10;
                let Lt = Math.round(t.n2D(dt * ft + It, et * ft + It) * xt / Dt) * Dt;
                const C = A + Lt;
                w.x += Math.cos(lt) * C,
                w.y += Math.sin(lt) * C,
                i.bounds.minX = Math.min(i.bounds.minX, w.x),
                i.bounds.minY = Math.min(i.bounds.minY, w.y),
                i.bounds.maxX = Math.max(i.bounds.maxX, w.x),
                i.bounds.maxY = Math.max(i.bounds.maxY, w.y);
                const P = {
                    pt: w,
                    a: T,
                    color: it,
                    islandIdx: K
                };
                i.points.push(P)
            }
            if (i.bounds.width = i.bounds.maxX - i.bounds.minX,
            i.bounds.height = i.bounds.maxY - i.bounds.minY,
            i.bounds.diag = Math.sqrt(i.bounds.width * i.bounds.width + i.bounds.height * i.bounds.height),
            i.points.length > 0) {
                for (let X = 0; X < i.points.length; X++) {
                    const V = i.points[X].pt
                      , N = i.points[(X + 1) % i.points.length].pt;
                    I += V.x * N.y - N.x * V.y
                }
                i.area = Math.abs(I / 2);
                let Y = 0
                  , w = 0;
                i.points.forEach(X => {
                    Y += X.pt.x,
                    w += X.pt.y
                }
                ),
                i.center = {
                    x: Y / i.points.length,
                    y: w / i.points.length
                }
            }
            let nt = !1;
            for (const Y of a)
                if (re([i.center.x, i.center.y], Y.flatPoints)) {
                    nt = !0;
                    break
                }
            if (i.bounds.diag < 100) {
                if (!d.smalls && !nt)
                    continue;
                const Y = -1;
                i.points.forEach( (w, X) => {
                    const V = w.pt.x / e
                      , N = w.pt.y / n
                      , T = t.range(1, 3)
                      , lt = 5
                      , dt = t.n2D(V * T * 2 + X, N * T * 2 + X)
                      , et = Y * dt;
                    Math.round(t.n2D(V * T + X, N * T + X) * lt / et) * et,
                    w.a + Math.PI / 2
                }
                )
            }
            Oe.push(i)
        }
        Oe.length < 45 && (d.press = 1)
    }
      , Q = () => {
        const j = e
          , st = n;
        for (let W = 0; W < hn.length; W++) {
            const K = hn[W]
              , J = document.createElement("canvas")
              , it = J.getContext("2d");
            J.style.width = `${j * d.dimensions.debugScl}px`,
            J.style.height = `${st * d.dimensions.debugScl}px`,
            J.width = j,
            J.height = st,
            fn.push({
                id: K,
                cvs: J,
                ctx: it
            })
        }
    }
      , L = j => {
        const st = fn.find(W => W.id == j);
        if (!st) {
            console.error("[Tracer _getCanvasById] no canvas found for id", j);
            return
        }
        return st
    }
      , yt = () => {
        const {ctx: j, cvs: st} = L("color");
        j.save(),
        j.fillStyle = "black",
        j.strokeStyle = "black",
        j.lineWidth = 2,
        Oe.forEach(W => {
            W.color;
            const K = W.points;
            if (K.length !== 0) {
                j.beginPath(),
                j.moveTo(K[0].pt.x, K[0].pt.y);
                for (let J = 1; J < K.length; J++) {
                    const it = K[J].pt;
                    j.lineTo(it.x, it.y)
                }
                j.closePath(),
                j.stroke()
            }
        }
        ),
        j.restore()
    }
      , vt = () => {
        const {cvs: j, ctx: st} = L("color");
        st.clearRect(0, 0, e, n),
        st.fillStyle = "#F48484",
        st.fillRect(0, 0, e, n),
        yt()
    }
    ;
    return {
        fromImage: p,
        getColor: R,
        getGeoms: () => Oe,
        getCanvas: () => Uo,
        setBaseShapes: j => {
            r = j;
            for (let st = 0; st < r.length; st++) {
                const W = r[st];
                if (W.func == x.ROTATEDGRID) {
                    const K = [];
                    for (let J = 0; J < W.points.length; J++) {
                        const it = W.points[J];
                        K.push(it.x, it.y)
                    }
                    W.flatPoints = K,
                    a.push(W)
                }
            }
        }
    }
}
;
let Vo = () => ({
    emit(e, ...n) {
        let r = this.events[e] || [];
        for (let a = 0, p = r.length; a < p; a++)
            r[a](...n)
    },
    events: {},
    on(e, n) {
        return this.events[e]?.push(n) || (this.events[e] = [n]),
        () => {
            this.events[e] = this.events[e]?.filter(r => n !== r)
        }
    }
});
const Un = Vo()
  , Xn = {
    RENDER_COMPLETE: "render_complete"
};
let ye = [];
const Yo = () => {
    let e = d.dimensions.base[0]
      , n = d.dimensions.base[1]
      , r = null
      , a = null
      , p = null
      , R = null
      , F = 0
      , U = 5;
    const H = () => {
        r = document.createElement("canvas"),
        r.width = e,
        r.height = n,
        r.id = "colorize",
        a = r.getContext("2d"),
        p = document.createElement("canvas"),
        p.width = d.dimensions.final[0],
        p.height = d.dimensions.final[1],
        p.id = "artwork",
        R = p.getContext("2d");
        const st = d.dimensions.final[0] / d.dimensions.final[1]
          , W = 20
          , K = Math.min(window.innerWidth - W, d.dimensions.final[0])
          , J = Math.min(window.innerHeight - W, d.dimensions.final[1]);
        let it = Math.min(d.dimensions.final[0], K)
          , S = it / st;
        S > J && (S = J,
        it = S * st),
        p.style.width = `${it}px`,
        p.style.height = `${S}px`,
        p.style.position = "absolute",
        p.style.left = "50%",
        p.style.top = "50%",
        p.style.transform = "translate(-50%, -50%)",
        p.style.border = "none"
    }
      , Q = () => {
        F += U
    }
      , L = () => {
        F <= U && (a.clearRect(0, 0, e, n),
        a.fillStyle = d.backgroundColor,
        a.fillRect(0, 0, e, n));
        const st = F
          , W = Math.min(ye.length - 1, F + U);
        for (let K = st; K <= W; K++) {
            const J = ye[K];
            a.save(),
            a.lineJoin = "round";
            let it = 5;
            d.density == "l" && (it = 8),
            a.globalAlpha = J.style.opacity * it,
            a.lineWidth = J.style.strokeWidth * 2,
            a.strokeStyle = J.style.strokeColor,
            a.fillStyle = J.style.strokeColor,
            a.globalCompositeOperation = J.style.blendingMode;
            const S = J.path.split(" ")
              , I = S[0].slice(1).split(",").map(Number);
            a.beginPath(),
            a.moveTo(I[0], I[1]);
            for (let i = 1; i < S.length; i++) {
                const k = S[i].slice(1).split(",").map(Number);
                a.lineTo(k[0], k[1])
            }
            a.stroke(),
            a.restore()
        }
    }
      , yt = () => {
        R.clearRect(0, 0, p.width, p.height),
        R.fillStyle = d.backgroundColor,
        R.drawImage(r, 0, 0, p.width, p.height)
    }
      , vt = () => {
        Q(),
        L(),
        yt(),
        F < ye.length && requestAnimationFrame(vt),
        F >= ye.length && Un.emit(Xn.RENDER_COMPLETE)
    }
      , Mt = () => r
      , ot = () => p
      , mt = st => {
        ye = st.strokesData,
        st.strokePoints;
        let W = d.density == "h" ? 90 : 270
          , K = d.density == "h" ? .5 : 1;
        U = Math.ceil(ye.length / W * K)
    }
      , j = st => {}
    ;
    return H(),
    {
        setRawIslandsData: j,
        setStrokesData: mt,
        play: vt,
        getCanvas: Mt,
        getFinalCanvas: ot
    }
}
;
let dn = []
  , he = [];
const _o = () => {
    let e = d.dimensions.base[0]
      , n = d.dimensions.base[1]
      , r = null
      , a = null;
    const p = Mt => {
        dn = Mt,
        F()
    }
      , R = () => r
      , F = () => {
        he = [],
        dn.forEach(Mt => {
            const ot = Mt.points;
            for (let mt = 0; mt < ot.length; mt++) {
                const j = ot[mt]
                  , st = ot[mt + 1] || ot[0]
                  , W = {
                    x: st.pt.x - j.pt.x,
                    y: st.pt.y - j.pt.y
                }
                  , K = Math.sqrt(W.x * W.x + W.y * W.y);
                W.x /= K,
                W.y /= K,
                he.push({
                    x: j.pt.x,
                    y: j.pt.y,
                    tangent: W
                })
            }
        }
        )
    }
      , U = () => {
        r = document.createElement("canvas"),
        r.width = e,
        r.height = n,
        r.style.width = `${e * .5}px`,
        r.style.height = `${n * .5}px`,
        r.id = "flow",
        a = r.getContext("2d")
    }
      , H = () => {
        a.clearRect(0, 0, e, n),
        a.fillStyle = "white",
        a.fillRect(0, 0, e, n);
        for (let Mt = 0; Mt < he.length; Mt++) {
            const ot = he[Mt]
              , mt = ot.tangent;
            a.save(),
            a.fillStyle = "black",
            a.translate(ot.x, ot.y),
            a.beginPath(),
            a.arc(0, 0, 2, 0, Math.PI * 2),
            a.closePath(),
            a.fill(),
            a.restore(),
            a.save(),
            a.strokeStyle = "red",
            a.translate(ot.x, ot.y),
            a.beginPath(),
            a.moveTo(0, 0),
            a.lineTo(mt.x * 30, mt.y * 30),
            a.stroke(),
            a.restore()
        }
    }
      , Q = () => {
        H()
    }
      , L = (Mt, ot) => {
        let mt = null
          , j = 1 / 0;
        return he.forEach(st => {
            const W = st.x - Mt
              , K = st.y - ot
              , J = W * W + K * K;
            J < j && (j = J,
            mt = st)
        }
        ),
        mt ? j : 0
    }
      , yt = (Mt, ot, mt=1, j=1 / 0) => {
        let W = Array(mt).fill().map( () => ({
            point: null,
            distance: 1 / 0
        }));
        if (he.forEach(I => {
            const i = I.x - Mt
              , k = I.y - ot
              , M = i * i + k * k;
            if (!(M > j * j)) {
                for (let A = 0; A < W.length; A++)
                    if (M < W[A].distance) {
                        for (let nt = W.length - 1; nt > A; nt--)
                            W[nt] = {
                                ...W[nt - 1]
                            };
                        W[A] = {
                            point: I,
                            distance: M
                        };
                        break
                    }
            }
        }
        ),
        !W[0].point)
            return null;
        const K = W.filter(I => I.point !== null).length;
        if (K === 1)
            return W[0].point.tangent;
        const J = {
            x: 0,
            y: 0
        };
        let it = 0;
        for (let I = 0; I < K; I++) {
            const i = 1 / (W[I].distance + 1e-4);
            it += i,
            J.x += W[I].point.tangent.x * i,
            J.y += W[I].point.tangent.y * i
        }
        J.x /= it,
        J.y /= it;
        const S = Math.sqrt(J.x * J.x + J.y * J.y);
        return J.x /= S,
        J.y /= S,
        J
    }
      , vt = () => he;
    return U(),
    {
        getCanvas: R,
        getPoints: vt,
        getTangentAtPosition: yt,
        getDistanceFromGeomAtPosition: L,
        setGeoms: p,
        render: Q
    }
}
;
let pe = []
  , te = []
  , me = []
  , be = []
  , Pe = []
  , le = []
  , _e = []
  , Jt = d.palette
  , un = d.tangentModeOpts;
const zo = () => {
    let e = 0
      , n = d.dimensions.base[0]
      , r = d.dimensions.base[1] - e;
    const a = n / r;
    let p = null
      , R = [];
    t.int(0, Jt.length - 1);
    const F = t.pick(We)
      , U = .005 * n
      , H = I => {
        const i = I.min.x + I.dimensions.width / 2
          , k = I.min.y + I.dimensions.height / 2
          , M = Math.sqrt(Math.pow(I.dimensions.width / 2, 2) + Math.pow(I.dimensions.height / 2, 2));
        return {
            center: {
                x: i,
                y: k
            },
            radius: M
        }
    }
      , Q = (I, i, k) => {
        let M = !1;
        for (let A = 0; A < le.length; A++) {
            const nt = le[A].points;
            re([I, i], nt) && (M = !0)
        }
        return !M
    }
      , L = (I, i) => {
        let k = !1;
        for (let M = 0; M < _e.length; M++) {
            const A = _e[M];
            !d.lightSides.includes(A.side) || re([I, i], A.points) && (k = !0)
        }
        return k
    }
      , yt = () => {
        for (let I = 0; I < me.length; I++) {
            const i = me[I]
              , k = i.x
              , M = i.y;
            k + i.tangent.x * i.tangentScl,
            M + i.tangent.y * i.tangentScl;
            const A = i.geomIdx
              , nt = i.geom ? i.geom : pe[A]
              , Y = i.isInBackground
              , w = i.isFirstGeom
              , X = nt.points;
            i.fillProgress;
            const V = i.fuziness || 1
              , N = {
                x: -i.tangent.y,
                y: i.tangent.x
            };
            let T = `M${k},${M}`;
            const lt = t.int(5, 15)
              , dt = t.range(.001, .003) * n
              , et = t.range(-.3, .3) * i.tangentScl * .3;
            for (let pt = 0; pt < lt; pt++) {
                const Dt = pt / lt;
                let It = k + i.tangent.x * i.tangentScl * Dt
                  , Lt = M + i.tangent.y * i.tangentScl * Dt;
                const C = Math.sin(Dt * Math.PI) * et;
                It += N.x * C,
                Lt += N.y * C;
                let P = It / n
                  , D = Lt / r;
                const s = .004
                  , h = (Dt + t.random()) % 1
                  , o = t.n2D(h + P * s, h + D * s)
                  , l = t.n2D(h + P * s + 50, h + D * s + 50);
                It += N.x * o * dt,
                Lt += N.y * l * dt,
                !!re([It, Lt], X) && It > U && It < n - U && Lt > U && Lt < r - U && (T += ` L${It},${Lt}`)
            }
            let ft = Bt(t.n2D(k / n * 3, M / r * 3), -1, 1, 1, 10);
            d.density == "h" && (ft = 3);
            let xt = Bt(t.n2D(k / n * 2, M / r * 2), -1, 1, 1, ft)
              , rt = i.tangentScl * Bt(Math.abs(t.n2D(k / n * 1.5 + 60, M / r * 1.5 + 60)), -1, 1, .01, .05);
            Y && (rt *= t.range(.2, .4)),
            t.bool(.2) && (rt *= d.baseEllipseWidthScl),
            t.bool(.2) && (rt *= 2),
            d.isLandscape && M / r > .7 && (xt = 1,
            rt *= .5);
            for (let pt = 0; pt < xt; pt++) {
                const Dt = k / n
                  , It = M / r
                  , Lt = pt * i.thickness * Bt(t.n2D(Dt * .7 + 1e3 + pt, It * .7 + 1e3 + pt), -1, 1, .2, 1)
                  , C = t.range(-.005, .005) * n
                  , P = t.range(-.005, .005) * r;
                t.int(50, 50);
                const D = t.range(rt * .5, rt * 2)
                  , s = i.tangentScl * Bt(t.n2D(Dt * 1.3 + 50, It * 1.3 + 50), -1, 1, .1, 1);
                Math.PI * t.range(.1, 2);
                const h = t.random() * Math.PI
                  , o = t.range(h, Math.PI)
                  , l = t.range(.05, .1);
                let c = t.range(.005, .008) * n;
                const m = t.range(-.1, .1) * i.tangentScl * 0;
                for (let f = h; f <= o; f += l) {
                    let y = Math.cos(f * Math.PI * 2) * D + N.x * f * 5
                      , u = Math.sin(f * Math.PI * 2) * s + N.y * f * 5;
                    const v = (f - h) / (o - h)
                      , _ = Math.sin(v * Math.PI) * m;
                    y += N.x * _,
                    u += N.y * _;
                    let g = Math.atan2(i.tangent.y, i.tangent.x) + Math.PI / 2 + t.range(-.1, .1) * V;
                    const b = y * Math.cos(g) - u * Math.sin(g)
                      , E = y * Math.sin(g) + u * Math.cos(g);
                    y = b + k,
                    u = E + M,
                    y += N.x * Lt * t.range(.5, 1),
                    u += N.y * Lt * t.range(.5, 1),
                    y += C,
                    u += P,
                    y += t.n2D(Dt * 1e3, It * 1e3) * c,
                    u += t.n2D(Dt * 1e3 + 500, It * 1e3 + 500) * c,
                    re([y, u], X) && (y < U || y > n - U || u < U || u > r - U || (T += ` L${y},${u}`))
                }
            }
            be.push({
                path: T,
                geom: nt,
                style: {
                    opacity: i.opacity,
                    strokeWidth: i.thickness,
                    strokeColor: i.color,
                    strokeMixedColor: i.mixedColor,
                    blendingMode: i.blendingMode
                },
                info: {
                    layer: "main",
                    isInBackground: Y,
                    isFirstGeom: w,
                    brushType: "crayon",
                    isOtherColor: i.isOtherColor
                }
            })
        }
    }
      , vt = () => {
        const I = Pe;
        for (let i = 0; i < I.length; i++) {
            const k = I[i]
              , M = k.points
              , A = ot(le[i]).contour;
            if (A.skip)
                continue;
            const nt = A.opacity
              , Y = A.strokeWidth;
            let w = `M${M[0].x},${M[0].y}`;
            for (let X = 1; X < M.length; X++) {
                let V = M[X].x
                  , N = M[X].y;
                V += t.range(-1, 1) * .001 * n,
                N += t.range(-1, 1) * .001 * r,
                !(V < 0 || V > n || N < 0 || N > r) && (w += ` L${V},${N}`)
            }
            be.push({
                path: w,
                geom: k,
                style: {
                    opacity: nt,
                    strokeWidth: Y,
                    strokeColor: "#111111",
                    strokeMixedColor: "#111111",
                    blendingMode: "multiply"
                },
                info: {
                    layer: "contour",
                    isInBackground: !1,
                    isFirstGeom: !1,
                    brushType: "crayon",
                    isContour: !0
                }
            })
        }
    }
      , Mt = () => {
        if (d.rough || !d.vstrokes || d.density !== "h" && d.comps.length == 1 && d.comps[0] == x.GRIBOUILLIS)
            return;
        const I = te;
        let i = 5;
        i = 5;
        let k = d.density == "l" ? .01 : .04;
        d.tScl < .6 && (k *= .3);
        for (let M = 0; M < I.length; M++) {
            const A = I[M];
            A.points;
            const nt = M == 0;
            if (nt || !A.isFilled)
                continue;
            const Y = A.color
              , w = A.bb.dimensions.width
              , X = A.bb.dimensions.height;
            if (!(w > n / 1.5 && X > r / 1.5 && nt))
                for (let V = A.bb.min.x; V <= A.bb.max.x; V += i) {
                    let N = []
                      , T = [];
                    const lt = t.range(-i, i) * .1
                      , dt = t.range(-i, i) * .1;
                    for (let et = A.bb.min.y; et <= A.bb.max.y; et += 1) {
                        let ft = Q(V, et);
                        pe.length > 1 && (ft = !1);
                        let xt = L(V, et) && d.light;
                        if (re([V, et], A.points) && !ft) {
                            const rt = V + lt
                              , pt = et + dt;
                            if (rt < U || rt > n - U || pt < U || pt > r - U || xt)
                                continue;
                            T.length === 0 || Math.abs(pt - T[T.length - 1][1]) <= 1 ? T.push([rt, pt]) : (T.length > 0 && N.push([...T]),
                            T = [[rt, pt]])
                        }
                    }
                    T.length > 0 && N.push(T),
                    N.forEach(et => {
                        if (et.length > 1) {
                            let ft = `M${et[0][0]},${et[0][1]}`;
                            for (let xt = 1; xt < et.length; xt++)
                                ft += ` L${et[xt][0]},${et[xt][1]}`;
                            be.push({
                                path: ft,
                                geom: A,
                                style: {
                                    opacity: k,
                                    strokeWidth: .5,
                                    strokeColor: Y,
                                    strokeMixedColor: Y,
                                    blendingMode: "multiply"
                                },
                                info: {
                                    layer: "texture",
                                    isInBackground: !1,
                                    isFirstGeom: !1,
                                    brushType: "crayon",
                                    isContour: !1,
                                    isTextureStroke: !0
                                }
                            })
                        }
                    }
                    )
                }
        }
    }
      , ot = I => {
        let i = null
          , k = 1 / 0
          , M = R[0];
        return R.forEach(A => {
            const nt = I.bb.center.x - A.x
              , Y = I.bb.center.y - A.y
              , w = Math.sqrt(nt * nt + Y * Y);
            w < k && (k = w,
            i = A)
        }
        ),
        i && (M = i),
        M
    }
      , mt = () => {
        if (!t.bool(d.sim))
            return;
        const I = le;
        let i = 0;
        i = .5,
        I.forEach( (k, M) => {
            k.bb.dimensions.width,
            k.bb.dimensions.height,
            k.bb.center.x,
            k.bb.center.y,
            an(k.points);
            const A = H(k.bb);
            let nt = k.color;
            const Y = 10;
            if (!t.bool(.5))
                for (let X = 0; X < Y; X++) {
                    const V = t.range(k.bb.min.x, k.bb.max.x)
                      , N = t.range(k.bb.min.y, k.bb.max.y);
                    let T = {
                        x: V,
                        y: N
                    }
                      , lt = `M${T.x},${T.y}`;
                    for (let xt = 0; xt < 40; xt++) {
                        const rt = p.getTangentAtPosition(T.x, T.y, 1, A.radius);
                        if (!re([T.x, T.y], k.points)) {
                            T.x = t.range(k.bb.min.x, k.bb.max.x),
                            T.y = t.range(k.bb.min.y, k.bb.max.y),
                            lt = `M${T.x},${T.y}`;
                            continue
                        }
                        if (!rt?.x || !rt?.y)
                            continue;
                        rt.x *= t.range(.2, 2),
                        rt.y *= t.range(.2, 2);
                        let pt = 10;
                        T.x += rt.x * pt,
                        T.y += rt.y * pt,
                        lt += ` L${T.x},${T.y}`
                    }
                    let dt = t.range(.05, .15) * i
                      , et = t.range(.1, .3) * 1.5
                      , ft = t.bool(.5) ? "multiply" : "source-over";
                    be.push({
                        path: lt,
                        geom: k,
                        style: {
                            opacity: dt,
                            strokeWidth: et,
                            strokeColor: nt,
                            strokeMixedColor: nt,
                            blendingMode: ft
                        },
                        info: {
                            layer: "sim",
                            isInBackground: !1,
                            isFirstGeom: !1,
                            brushType: "crayon",
                            isOtherColor: !1
                        }
                    })
                }
        }
        )
    }
      , j = I => {
        const i = I == "c" ? te : le
          , k = d.layers.length > 1 && I == "c" ? d.neg : 0;
        i.forEach( (M, A) => {
            const nt = []
              , Y = A;
            let w = A == 0;
            const X = me.length
              , V = t.pick(["c", "v", "h", "n"]);
            let N = d.density;
            if (d.layers.length > 1 && I == "c" && (N = "h"),
            A / i.length,
            !M.isFilled || t.bool(k))
                return;
            const lt = M.bb.dimensions.width
              , dt = M.bb.dimensions.height
              , et = M.bb.center.x
              , ft = M.bb.center.y;
            an(M.points);
            let xt = Math.sqrt(lt * lt + dt * dt);
            if (lt > n / 1.5 && dt > r / 1.5 && w)
                return;
            let rt = w ? F : M.color
              , pt = w ? F : t.pick(Jt);
            d.colorrep == "n" && (pt = Jt[~~Bt(t.n2D(M.bb.center.x / n * 1 * a + A, M.bb.center.y / r * 1 + A), -1, 1, 0, Jt.length - 1)]);
            let Dt = .015;
            N == "l" ? Dt *= n * 1.2 : N == "m" ? Dt *= n * .8 * t.range(.75, 1) : N == "h" && (Dt *= n * .25 * t.range(1, 1)),
            N !== "h" && d.tScl == 1 && (Dt *= 1.3);
            let It = []
              , Lt = 0;
            if (d.density !== "h") {
                It = new Bn({
                    shape: [lt, dt],
                    radius: Dt,
                    tries: 20
                },t.random.bind(t));
                var C = It.fill();
                Lt = C.length
            }
            let P = d.gridSpacing;
            xt < 100 && (P = 1.5),
            t.n2D(et, ft) < .2;
            const D = Math.ceil(lt / P)
              , s = Math.ceil(dt / P);
            d.density == "h" && (Lt = D * s);
            let h = rt == "#000000" ? 0 : t.range(d.othercolor * .8, d.othercolor * 1.2)
              , o = t.range(.05, .25) * 0
              , l = t.bool(o)
              , c = !0
              , m = t.bool(d.contained);
            const f = t.range(.05, .15)
              , y = t.bool(d.gradient)
              , u = t.bool(.5) ? 0 : t.range(-.1, .1) * 0
              , v = t.pick(d.fuzinessOpts)
              , _ = t.range(-.2, .2) * .1;
            let g = t.random() * 10
              , b = !1
              , E = t.range(.07, .2);
            d.tangentModeOpts.length == 1 && (d.tangentModeOpts[0] == "n" || d.tangentModeOpts[0] == "c") && (b = t.bool(.5));
            for (let z = 0; z < Lt; z++) {
                let G = 0
                  , $ = 0;
                const Z = z % D
                  , O = Math.floor(z / D);
                d.density !== "h" ? (G = C[z][0] + M.bb.min.x,
                $ = C[z][1] + M.bb.min.y) : (G = M.bb.min.x + Z * P,
                $ = M.bb.min.y + O * P);
                let B = G / n
                  , bt = $ / r;
                const ut = Bt(G, M.bb.min.x, M.bb.max.x, 0, 1)
                  , Tt = Bt($, M.bb.min.y, M.bb.max.y, 0, 1);
                let Et = 0;
                d.density == "h" ? Et = z / Lt : Et = bt,
                Bt(G, M.bb.min.x, M.bb.max.x, 0, 1);
                const Ft = Bt($, M.bb.min.y, M.bb.max.y, 0, 1)
                  , wt = H(M.bb);
                if (!re([G, $], M.points))
                    continue;
                const Rt = Q(G, $)
                  , Ht = L(G, $);
                let Nt = Rt && d.density !== "h" ? t.bool(0) : t.bool(h);
                if (h == 1 && (Nt = !0,
                h = .8),
                d.layers.length > 1 && I == "c" && Rt || d.bonly && !Rt)
                    continue;
                let Ot = Y > -1 ? i[Y].tangentMode : V;
                const Yt = 20;
                let tt = p.getTangentAtPosition(G, $, Yt, wt.radius);
                if (!tt || isNaN(tt.x) || isNaN(tt.y))
                    continue;
                p.getDistanceFromGeomAtPosition(G, $);
                let at = Bt(t.n2D(B * 1.3, bt * 1.3), -1, 1, xt / n * .01, xt / n * .3);
                if (t.bool(1.5)) {
                    const ht = t.bool(.5) ? .2 : .25
                      , gt = t.bool(.5) ? .05 : .1;
                    let St = d.tScl;
                    d.comps.length == 1 && d.comps[0] == x.GRIBOUILLIS && (St = t.pick([.3, .5, 1])),
                    at = Bt(t.n2D(B * 1.3, bt * 1.3), -1, 1, gt, ht) * St,
                    (Ot == "n" || Ot == "c" && b) && (at = E * d.tScl)
                }
                if (t.bool(.5) && (tt.x = 0,
                tt.y = 1),
                (Ot == "h" || t.bool(.05) && !Nt) && (tt.x = 1,
                tt.y = t.range(-.1, .1)),
                Ot == "v" && (tt.x = 0 + _,
                tt.y = 1),
                Ot == "n" && (!Rt || i.length > 1)) {
                    const ht = d.compNseScl
                      , gt = Y / i.length * .15;
                    t.n2D(B * ht + gt + g, bt * ht + gt + g) * Math.PI * 2,
                    tt.x = t.n2D(B * ht + gt + g, bt * ht + gt + g) * Math.PI * 2,
                    tt.y = t.n2D(B * ht + gt + g * 2, bt * ht + gt + g * 2) * Math.PI * 2
                }
                if (Ot == "c") {
                    let ht = .7;
                    d.comps.length == 1 && d.comps[0] == x.FIELD && (ht = d.compNseScl);
                    const gt = 180
                      , St = A
                      , At = t.curl2D(ut * a * ht + St, Tt * a * ht + St, 1);
                    tt.x = Math.sign(At[0]) * (Math.floor(Math.abs(At[0]) * gt) / gt),
                    tt.y = Math.sign(At[1]) * (Math.floor(Math.abs(At[1]) * gt) / gt)
                }
                if (Ot == "oc") {
                    const St = A
                      , At = .1
                      , Pt = t.curl2D(ut * a * .7 + St, Tt * a * .7 + St, 1);
                    Pt[0] = Math.sign(Pt[0]) * (Math.floor(Math.abs(Pt[0]) * 180) / 180),
                    Pt[1] = Math.sign(Pt[1]) * (Math.floor(Math.abs(Pt[1]) * 180) / 180),
                    tt.x = Me(tt.x, Pt[0], At),
                    tt.y = Me(tt.y, Pt[1], At)
                }
                if (!tt || isNaN(tt.x) || isNaN(tt.y))
                    continue;
                if (Ot !== "o" && Ot !== "v" && d.rotateSkew) {
                    const ht = u + Math.PI / 4 * Et
                      , gt = tt.x * Math.cos(ht) - tt.y * Math.sin(ht)
                      , St = tt.x * Math.sin(ht) + tt.y * Math.cos(ht);
                    tt.x = gt,
                    tt.y = St
                }
                d.isLandscape && bt > .7 && (tt.x = 1,
                tt.y = 0),
                at *= n;
                let ct = f * t.range(.5, 1);
                const Ct = 1e-4 * n * t.range(1, 2.3)
                  , Zt = t.bool(d.multiplyAmount) ? "multiply" : "source-over";
                let Xt = rt
                  , ee = rt
                  , ne = 1 / 0
                  , zt = -1;
                for (let ht = 0; ht < le.length; ht++) {
                    const gt = le[ht].points;
                    if (re([G, $], gt)) {
                        let St = 1 / 0;
                        for (let At = 0; At < gt.length; At += 2) {
                            const Pt = gt[At]
                              , Vt = gt[At + 1]
                              , oe = Math.sqrt(Math.pow(G - Pt, 2) + Math.pow($ - Vt, 2));
                            St = Math.min(St, oe)
                        }
                        St < ne && (ne = St,
                        ht % Jt.length,
                        zt = ht)
                    }
                }
                if (zt > -1 && t.bool(d.isStrokeColorFromB) && (Xt = le[zt].color),
                Nt) {
                    if (Xt = t.pick(Jt),
                    t.bool(.5) && (Xt = Jt[~~Bt(t.n2D(G / n, $ / r), -1, 1, 0, Jt.length - 1)]),
                    t.bool(.5) && d.dirtyBgColor) {
                        const ht = t.pick(Jt)
                          , gt = Ve(ht)
                          , St = t.range(.3, .7)
                          , At = Ve(Xt);
                        At.h = Me(At.h, gt.h, St),
                        At.s = Me(At.s, gt.s, St),
                        At.l = Me(At.l, gt.l, St),
                        Xt = nn(At)
                    }
                    if (ct *= t.range(.4, .7),
                    (!M.canUseGradient || rt == F) && (ct *= d.othercolorScl,
                    d.darkOtherColorInBg)) {
                        const ht = Ve(Xt);
                        ht.l *= t.range(.4, .7),
                        Xt = nn(ht),
                        ct *= .5
                    }
                }
                if (l) {
                    const ht = ~~Bt(t.n2D(G / n, $ / r), -1, 1, 0, Jt.length - 1);
                    Xt = Jt[ht]
                }
                Ot == "h" && !m && (c = t.bool(Math.pow(Et * .5, 2))),
                !(Rt && (d.uniformBg && (Xt = F),
                !d.bfill)) && (I == "b" && (c = !0),
                t.bool(Ft) && y && M.canUseGradient && (Xt = pt),
                t.bool(1 - d.press) && (Xt = d.backgroundColor,
                ct *= .7),
                d.light && t.bool(.9) && Ht && !Nt && (Xt = "#FECD1A"),
                nt.push({
                    x: G,
                    y: $,
                    tangent: tt,
                    tangentScl: at,
                    opacity: ct,
                    thickness: Ct,
                    color: Xt,
                    mixedColor: ee,
                    geomIdx: Y,
                    geom: M,
                    blendingMode: Zt,
                    stayWithinGeom: c,
                    isFirstGeom: w,
                    fillProgress: Et,
                    isOtherColor: Nt,
                    fuziness: v,
                    isInBackground: Rt
                }),
                me.push({
                    x: G,
                    y: $,
                    tangent: tt,
                    tangentScl: at,
                    opacity: ct,
                    thickness: Ct,
                    color: Xt,
                    mixedColor: ee,
                    geomIdx: Y,
                    geom: M,
                    blendingMode: Zt,
                    stayWithinGeom: c,
                    isFirstGeom: w,
                    fillProgress: Et,
                    isOtherColor: Nt,
                    fuziness: v,
                    isInBackground: Rt
                }))
            }
            for (let z = X; z < me.length; z++)
                ;
        }
        )
    }
    ;
    return {
        getStrokeData: () => ({
            strokePoints: me,
            strokesData: be
        }),
        getPalette: () => Jt,
        setGeoms: I => {
            pe = I,
            p = _o(),
            p.setGeoms(pe),
            p.render();
            for (let i = 0; i < pe.length; i++) {
                const k = t.pick(un)
                  , M = pe[i]
                  , A = {
                    points: [],
                    color: "0x000000",
                    tangentMode: k,
                    isFilled: !0,
                    canUseGradient: !0
                }
                  , nt = M.points
                  , Y = [];
                for (let et = 0; et < nt.length; et++) {
                    let ft = nt[et].pt.x
                      , xt = nt[et].pt.y;
                    A.points.push(ft, xt),
                    Y.push([ft, xt])
                }
                if (!Y.length)
                    continue;
                const w = rn(Y)
                  , X = w.maxX - w.minX
                  , V = w.maxY - w.minY
                  , N = w.minX + X / 2
                  , T = w.minY + V / 2;
                A.bb = {
                    center: {
                        x: N,
                        y: T
                    },
                    dimensions: {
                        width: X,
                        height: V
                    },
                    min: {
                        x: w.minX,
                        y: w.minY
                    },
                    max: {
                        x: w.maxX,
                        y: w.maxY
                    }
                },
                A.area = X * V;
                const lt = ot(A)
                  , dt = lt.color;
                A.color = dt,
                A.neg = lt.neg,
                A.neg && (A.canUseGradient = !1),
                te.push(A)
            }
            if (d.isolation) {
                te.sort( (k, M) => {
                    const A = M.area - k.area;
                    return A === 0 ? te.indexOf(k) - te.indexOf(M) : A
                }
                );
                const i = t.pick(Jt);
                for (let k = 0; k < te.length; k++)
                    k <= d.nbIsolated ? te[k].color = i : (te[k].canUseGradient = !1,
                    d.negMode == "e" ? te[k].isFilled = !1 : te[k].color = d.backgroundColor)
            }
            for (let i = 0; i < d.layers.length; i++) {
                const k = d.layers[i];
                j(k)
            }
            yt(),
            mt(),
            vt(),
            Mt()
        }
        ,
        getStrokesData: () => be,
        setBaseShapes: I => {
            Pe = I,
            le = [];
            for (let i = 0; i < Pe.length; i++) {
                const k = t.pick(un)
                  , M = Pe[i]
                  , A = {
                    points: [],
                    color: "0x000000",
                    tangentMode: k,
                    isFilled: !0
                }
                  , nt = M.points
                  , Y = [];
                for (let lt = 0; lt < nt.length; lt++) {
                    let dt = nt[lt].x
                      , et = nt[lt].y;
                    A.points.push(dt, et),
                    Y.push([dt, et])
                }
                if (!Y.length)
                    continue;
                const w = rn(Y)
                  , X = w.maxX - w.minX
                  , V = w.maxY - w.minY
                  , N = w.minX + X / 2
                  , T = w.minY + V / 2;
                A.bb = {
                    center: {
                        x: N,
                        y: T
                    },
                    dimensions: {
                        width: X,
                        height: V
                    },
                    min: {
                        x: w.minX,
                        y: w.minY
                    },
                    max: {
                        x: w.maxX,
                        y: w.maxY
                    }
                },
                M.isDoorSide && (A.side = M.side),
                A.color = ot(A).color,
                t.n2D(N, T) < .05,
                le.push(A),
                M.isDoorSide && _e.push(A)
            }
        }
        ,
        setDataZones: I => {
            R = I
        }
    }
}
  , $o = () => ({
    init: () => {}
});
let Ce = null
  , gn = null
  , Re = null
  , ke = null
  , ve = null
  , yn = null;
const Wo = async e => {
    const n = document.createElement("div");
    n.textContent = "generating",
    n.style.marginLeft = "10px",
    n.style.marginTop = "10px",
    document.body.appendChild(n),
    performance.now(),
    Ce = Lo();
    const r = Ce.getCanvas();
    await new Promise(a => setTimeout(a, 100)),
    Ce.render(),
    gn = To(),
    ke = Xo(),
    ke.setBaseShapes(Ce.getShapes()),
    ke.fromImage(r),
    ve = zo(),
    ve.setDataZones(gn.getZones()),
    ve.setBaseShapes(Ce.getShapes()),
    ve.setGeoms(ke.getGeoms()),
    Re = Yo(),
    Re.setRawIslandsData(ke.getGeoms()),
    Re.setStrokesData(ve.getStrokeData()),
    Re.play?.(),
    document.body.appendChild(Re.getFinalCanvas()),
    Un.on(Xn.RENDER_COMPLETE, () => {
        console.log("render complete"),
        capturePreview()
    }
    ),
    d.export.batching && (yn = $o(),
    yn.init()),
    document.body.removeChild(n),
    document.querySelectorAll("svg").forEach(p => document.body.removeChild(p))
}
;
Wo();