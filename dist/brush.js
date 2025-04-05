(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.brush = {}));
})(this, (function (exports) { 'use strict';

  const Canvases = {};
  let cID, Cwidth, Cheight;
  let _isReady = false;
  function load(canvasID, canvas) {
    cID = canvasID;
    if (!Canvases[cID]) {
      Canvases[cID] = { canvas };
    }
    Cwidth = Canvases[cID].canvas.width;
    Cheight = Canvases[cID].canvas.height;
    if (!_isReady) _isReady = true;
  }
  function isCanvasReady() {
    if (!_isReady) {
      throw new Error("Canvas system is not ready. Call `load()` first.");
    }
  }
  const State = {};

  const SQRT3 =  Math.sqrt(3.0);
  const F2 = 0.5 * (SQRT3 - 1.0);
  const G2 = (3.0 - SQRT3) / 6.0;
  const fastFloor = (x) => Math.floor(x) | 0;
  const grad2 =  new Float64Array([1, 1,
      -1, 1,
      1, -1,
      -1, -1,
      1, 0,
      -1, 0,
      1, 0,
      -1, 0,
      0, 1,
      0, -1,
      0, 1,
      0, -1]);
  function createNoise2D(random = Math.random) {
      const perm = buildPermutationTable(random);
      const permGrad2x = new Float64Array(perm).map(v => grad2[(v % 12) * 2]);
      const permGrad2y = new Float64Array(perm).map(v => grad2[(v % 12) * 2 + 1]);
      return function noise2D(x, y) {
          let n0 = 0;
          let n1 = 0;
          let n2 = 0;
          const s = (x + y) * F2;
          const i = fastFloor(x + s);
          const j = fastFloor(y + s);
          const t = (i + j) * G2;
          const X0 = i - t;
          const Y0 = j - t;
          const x0 = x - X0;
          const y0 = y - Y0;
          let i1, j1;
          if (x0 > y0) {
              i1 = 1;
              j1 = 0;
          }
          else {
              i1 = 0;
              j1 = 1;
          }
          const x1 = x0 - i1 + G2;
          const y1 = y0 - j1 + G2;
          const x2 = x0 - 1.0 + 2.0 * G2;
          const y2 = y0 - 1.0 + 2.0 * G2;
          const ii = i & 255;
          const jj = j & 255;
          let t0 = 0.5 - x0 * x0 - y0 * y0;
          if (t0 >= 0) {
              const gi0 = ii + perm[jj];
              const g0x = permGrad2x[gi0];
              const g0y = permGrad2y[gi0];
              t0 *= t0;
              n0 = t0 * t0 * (g0x * x0 + g0y * y0);
          }
          let t1 = 0.5 - x1 * x1 - y1 * y1;
          if (t1 >= 0) {
              const gi1 = ii + i1 + perm[jj + j1];
              const g1x = permGrad2x[gi1];
              const g1y = permGrad2y[gi1];
              t1 *= t1;
              n1 = t1 * t1 * (g1x * x1 + g1y * y1);
          }
          let t2 = 0.5 - x2 * x2 - y2 * y2;
          if (t2 >= 0) {
              const gi2 = ii + 1 + perm[jj + 1];
              const g2x = permGrad2x[gi2];
              const g2y = permGrad2y[gi2];
              t2 *= t2;
              n2 = t2 * t2 * (g2x * x2 + g2y * y2);
          }
          return 70.0 * (n0 + n1 + n2);
      };
  }
  function buildPermutationTable(random) {
      const tableSize = 512;
      const p = new Uint8Array(tableSize);
      for (let i = 0; i < tableSize / 2; i++) {
          p[i] = i;
      }
      for (let i = 0; i < tableSize / 2 - 1; i++) {
          const r = i + ~~(random() * (256 - i));
          const aux = p[i];
          p[i] = p[r];
          p[r] = aux;
      }
      for (let i = 256; i < tableSize; i++) {
          p[i] = p[i - 256];
      }
      return p;
  }

  function prng_alea(seed, opts) {
    let xg = new AleaGen(seed);
    let prng = () => xg.next();
    prng.double = () =>
      prng() + (prng() * 0x200000 | 0) * 1.1102230246251565e-16;
    prng.int32 = () => (xg.next() * 0x100000000) | 0;
    prng.quick = prng;
    return prng
  }
  class AleaGen {
    constructor(seed) {
      if (seed == null) seed = +(new Date);
      let n = 0xefc8249d;
      this.c = 1;
      this.s0 = mash(' ');
      this.s1 = mash(' ');
      this.s2 = mash(' ');
      this.s0 -= mash(seed);
      if (this.s0 < 0) { this.s0 += 1; }
      this.s1 -= mash(seed);
      if (this.s1 < 0) { this.s1 += 1; }
      this.s2 -= mash(seed);
      if (this.s2 < 0) { this.s2 += 1; }
      function mash(data) {
        data = String(data);
        for (let i = 0; i < data.length; i++) {
          n += data.charCodeAt(i);
          let h = 0.02519603282416938 * n;
          n = h >>> 0;
          h -= n;
          h *= n;
          n = h >>> 0;
          h -= n;
          n += h * 0x100000000;
        }
        return (n >>> 0) * 2.3283064365386963e-10;
      }
    }
    next() {
      let {c,s0,s1,s2} = this;
      let t = 2091639 * s0 + c * 2.3283064365386963e-10;
      this.s0 = s1;
      this.s1 = s2;
      return this.s2 = t - (this.c = t | 0);
    }
    copy(f, t) {
      t.c = f.c;
      t.s0 = f.s0;
      t.s1 = f.s1;
      t.s2 = f.s2;
      return t;
    }
  }

  let rng = prng_alea(Math.random());
  function seed(s) {
    rng = prng_alea(s);
  }
  let noise_rng = prng_alea(Math.random());
  exports.noise = createNoise2D(noise_rng);
  function noiseSeed(s) {
    exports.noise = createNoise2D(prng_alea(s));
  }
  function random(e = 0, r = 1) {
    if (Array.isArray(e)) return e[~~(rng() * e.length)];
    if (arguments.length === 1) return rng() * e;
    return rr(...arguments);
  }
  const rr = (e = 0, r = 1) => e + rng() * (r - e);
  const randInt = (e, r) => ~~rr(e, r);
  function gaussian(mean = 0, stdev = 1) {
    const u = 1 - rng();
    const v = rng();
    const z = Math.sqrt(-2 * Math.log(u)) * cos(360 * v);
    return z * stdev + mean;
  }
  function pseudoGaussian(mean = 0, stdev = 1) {
    return mean - stdev * 2 + ((rng() + rng() + rng()) / 3) * stdev * 4;
  }
  function weightedRand(weights) {
    let totalWeight = 0;
    const entries = [];
    for (const key in weights) {
      totalWeight += weights[key];
      entries.push({ key, cumulative: totalWeight });
    }
    const rnd = rng() * totalWeight;
    for (const entry of entries) {
      if (rnd < entry.cumulative) {
        return isNaN(entry.key) ? entry.key : parseInt(entry.key);
      }
    }
  }
  function map(value, a, b, c, d, withinBounds = false) {
    let r = c + ((value - a) / (b - a)) * (d - c);
    if (!withinBounds) return r;
    if (c < d) {
      return constrain(r, c, d);
    } else {
      return constrain(r, d, c);
    }
  }
  function constrain(n, low, high) {
    return Math.max(Math.min(n, high), low);
  }
  function nAngle(angle) {
    angle = angle % 360;
    return angle < 0 ? angle + 360 : angle;
  }
  function cos(angle) {
    return c[~~(4 * nAngle(angle))];
  }
  function sin(angle) {
    return s[~~(4 * nAngle(angle))];
  }
  const totalDegrees = 1440;
  const radiansPerIndex = (2 * Math.PI) / totalDegrees;
  const c = new Float32Array(totalDegrees);
  const s = new Float32Array(totalDegrees);
  for (let i = 0; i < totalDegrees; i++) {
    const radians = i * radiansPerIndex;
    c[i] = Math.cos(radians);
    s[i] = Math.sin(radians);
  }
  const toDegrees = (a) => {
    let angle = ((a * 180) / Math.PI) % 360;
    return angle < 0 ? angle + 360 : angle;
  };
  const dist = (x1, y1, x2, y2) =>
    Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
  const calcAngle = (x1, y1, x2, y2) =>
    toDegrees(Math.atan2(-(y2 - y1), x2 - x1));
  function intersectLines(
    s1a,
    s1b,
    s2a,
    s2b,
    includeSegmentExtension = false
  ) {
    let x1 = s1a.x,
      y1 = s1a.y;
    let x2 = s1b.x,
      y2 = s1b.y;
    let x3 = s2a.x,
      y3 = s2a.y;
    let x4 = s2b.x,
      y4 = s2b.y;
    if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
      return false;
    }
    let deltaX1 = x2 - x1,
      deltaY1 = y2 - y1;
    let deltaX2 = x4 - x3,
      deltaY2 = y4 - y3;
    let denominator = deltaY2 * deltaX1 - deltaX2 * deltaY1;
    if (denominator === 0) {
      return false;
    }
    let ua = (deltaX2 * (y1 - y3) - deltaY2 * (x1 - x3)) / denominator;
    let ub = (deltaX1 * (y1 - y3) - deltaY1 * (x1 - x3)) / denominator;
    if (!includeSegmentExtension && (ub < 0 || ub > 1)) {
      return false;
    }
    let x = x1 + ua * deltaX1;
    let y = y1 + ua * deltaY1;
    return { x: x, y: y };
  }
  function rotate$1(cx, cy, x, y, angle) {
    let coseno = cos(angle),
      seno = sin(angle),
      nx = coseno * (x - cx) + seno * (y - cy) + cx,
      ny = coseno * (y - cy) - seno * (x - cx) + cy;
    return { x: nx, y: ny };
  }
  function cloneArray(array) {
    return array.map(function (arr) {
      return arr.slice();
    });
  }

  Worker.createURL = function (func_or_string) {
    const str =
      typeof func_or_string === "function"
        ? func_or_string.toString()
        : func_or_string;
    const blob = new Blob(["'use strict';\nself.onmessage =" + str], {
      type: "text/javascript",
    });
    return window.URL.createObjectURL(blob);
  };
  Worker.create = function (func_or_string) {
    return new Worker(Worker.createURL(func_or_string));
  };
  const gl_worker = () =>
    Worker.create(function (e) {
      const vsSource = `#version 300 es
    out vec2 p;void main(){vec3 v=vec3(-1);v[gl_VertexID]=3.;gl_Position=vec4(p=v.xy,0,1);}`;
  const fsSource = `#version 300 es
precision highp float;
uniform vec4 u_addColor;
uniform bool u_isErase;
uniform bool u_isImage;
uniform float u_flip;
uniform bool u_isFBO;
uniform sampler2D u_source,u_mask;
in vec2 p;
out vec4 outColor;
float x(float v)
{
  return v<.04045?
    v/12.92:
    pow((v+.055)/1.055,2.4);
}
float f(float v)
{
  return v<.0031308?
    v*12.92:
    1.055*pow(v,1./2.4)-.055;
}
vec3 v(vec3 v)
{
  return vec3(x(v[0]),x(v[1]),x(v[2]));
}
vec3 n(vec3 v)
{
  return clamp(vec3(f(v[0]),f(v[1]),f(v[2])),0.,1.);
}
void f(vec3 e,out float m,out float f,out float v,out float u,out float r,out float x,out float z)
{
  m=min(e.x,min(e.y,e.z));
  e-=m;
  f=min(e.y,e.z);
  v=min(e.x,e.z);
  u=min(e.x,e.y);
  r=min(max(0.,e.x-e.z),max(0.,e.x-e.y));
  x=min(max(0.,e.y-e.z),max(0.,e.y-e.x));
  z=min(max(0.,e.z-e.y),max(0.,e.z-e.x));
}
void f(vec3 v,inout float u[38])
{
  float e,o,x,m,z,w,y;
  f(v,e,o,x,m,z,w,y);
  u[0]=max(1e-4,e+o*.96853629+x*.51567122+m*.02055257+z*.03147571+w*.49108579+y*.97901834);
  u[1]=max(1e-4,e+o*.96855103+x*.5401552+m*.02059936+z*.03146636+w*.46944057+y*.97901649);
  u[2]=max(1e-4,e+o*.96859338+x*.62645502+m*.02062723+z*.03140624+w*.4016578+y*.97901118);
  u[3]=max(1e-4,e+o*.96877345+x*.75595012+m*.02073387+z*.03119611+w*.2449042+y*.97892146);
  u[4]=max(1e-4,e+o*.96942204+x*.92826996+m*.02114202+z*.03053888+w*.0682688+y*.97858555);
  u[5]=max(1e-4,e+o*.97143709+x*.97223624+m*.02233154+z*.02856855+w*.02732883+y*.97743705);
  u[6]=max(1e-4,e+o*.97541862+x*.98616174+m*.02556857+z*.02459485+w*.013606+y*.97428075);
  u[7]=max(1e-4,e+o*.98074186+x*.98955255+m*.03330189+z*.0192952+w*.01000187+y*.96663223);
  u[8]=max(1e-4,e+o*.98580992+x*.98676237+m*.05185294+z*.01423112+w*.01284127+y*.94822893);
  u[9]=max(1e-4,e+o*.98971194+x*.97312575+m*.10087639+z*.01033111+w*.02636635+y*.89937713);
  u[10]=max(1e-4,e+o*.99238027+x*.91944277+m*.24000413+z*.00765876+w*.07058713+y*.76070164);
  u[11]=max(1e-4,e+o*.99409844+x*.32564851+m*.53589066+z*.00593693+w*.70421692+y*.4642044);
  u[12]=max(1e-4,e+o*.995172+x*.13820628+m*.79874659+z*.00485616+w*.85473994+y*.20123039);
  u[13]=max(1e-4,e+o*.99576545+x*.05015143+m*.91186529+z*.00426186+w*.95081565+y*.08808402);
  u[14]=max(1e-4,e+o*.99593552+x*.02912336+m*.95399623+z*.00409039+w*.9717037+y*.04592894);
  u[15]=max(1e-4,e+o*.99564041+x*.02421691+m*.97137099+z*.00438375+w*.97651888+y*.02860373);
  u[16]=max(1e-4,e+o*.99464769+x*.02660696+m*.97939505+z*.00537525+w*.97429245+y*.02060067);
  u[17]=max(1e-4,e+o*.99229579+x*.03407586+m*.98345207+z*.00772962+w*.97012917+y*.01656701);
  u[18]=max(1e-4,e+o*.98638762+x*.04835936+m*.98553736+z*.0136612+w*.9425863+y*.01451549);
  u[19]=max(1e-4,e+o*.96829712+x*.0001172+m*.98648905+z*.03181352+w*.99989207+y*.01357964);
  u[20]=max(1e-4,e+o*.89228016+x*8.554e-5+m*.98674535+z*.10791525+w*.99989891+y*.01331243);
  u[21]=max(1e-4,e+o*.53740239+x*.85267882+m*.98657555+z*.46249516+w*.13823139+y*.01347661);
  u[22]=max(1e-4,e+o*.15360445+x*.93188793+m*.98611877+z*.84604333+w*.06968113+y*.01387181);
  u[23]=max(1e-4,e+o*.05705719+x*.94810268+m*.98559942+z*.94275572+w*.05628787+y*.01435472);
  u[24]=max(1e-4,e+o*.03126539+x*.94200977+m*.98507063+z*.96860996+w*.06111561+y*.01479836);
  u[25]=max(1e-4,e+o*.02205445+x*.91478045+m*.98460039+z*.97783966+w*.08987709+y*.0151525);
  u[26]=max(1e-4,e+o*.01802271+x*.87065445+m*.98425301+z*.98187757+w*.13656016+y*.01540513);
  u[27]=max(1e-4,e+o*.0161346+x*.78827548+m*.98403909+z*.98377315+w*.22169624+y*.01557233);
  u[28]=max(1e-4,e+o*.01520947+x*.65738359+m*.98388535+z*.98470202+w*.32176956+y*.0156571);
  u[29]=max(1e-4,e+o*.01475977+x*.59909403+m*.98376116+z*.98515481+w*.36157329+y*.01571025);
  u[30]=max(1e-4,e+o*.01454263+x*.56817268+m*.98368246+z*.98537114+w*.4836192+y*.01571916);
  u[31]=max(1e-4,e+o*.01444459+x*.54031997+m*.98365023+z*.98546685+w*.46488579+y*.01572133);
  u[32]=max(1e-4,e+o*.01439897+x*.52110241+m*.98361309+z*.98550011+w*.47440306+y*.01572502);
  u[33]=max(1e-4,e+o*.0143762+x*.51041094+m*.98357259+z*.98551031+w*.4857699+y*.01571717);
  u[34]=max(1e-4,e+o*.01436343+x*.50526577+m*.98353856+z*.98550741+w*.49267971+y*.01571905);
  u[35]=max(1e-4,e+o*.01435687+x*.5025508+m*.98351247+z*.98551323+w*.49625685+y*.01571059);
  u[36]=max(1e-4,e+o*.0143537+x*.50126452+m*.98350101+z*.98551563+w*.49807754+y*.01569728);
  u[37]=max(1e-4,e+o*.01435408+x*.50083021+m*.98350852+z*.98551547+w*.49889859+y*.0157002);
}
vec3 w(vec3 e)
{
  mat3 u;
  u[0]=vec3(3.24306333,-1.53837619,-.49893282);
  u[1]=vec3(-.96896309,1.87542451,.04154303);
  u[2]=vec3(.05568392,-.20417438,1.05799454);
  float v=dot(u[0],e),x=dot(u[1],e),o=dot(u[2],e);
  return n(vec3(v,x,o));
}
vec3 m(float u[38])
{
  return vec3(0)+u[0]*vec3(6.469e-5,1.84e-6,.00030502)+u[1]*vec3(.00021941,6.21e-6,.00103681)+u[2]*vec3(.00112057,3.101e-5,.00531314)+u[3]*vec3(.00376661,.00010475,.01795439)+u[4]*vec3(.01188055,.00035364,.05707758)+u[5]*vec3(.02328644,.00095147,.11365162)+u[6]*vec3(.03455942,.00228226,.17335873)+u[7]*vec3(.03722379,.00420733,.19620658)+u[8]*vec3(.03241838,.0066888,.18608237)+u[9]*vec3(.02123321,.0098884,.13995048)+u[10]*vec3(.01049099,.01524945,.08917453)+u[11]*vec3(.00329584,.02141831,.04789621)+u[12]*vec3(.00050704,.03342293,.02814563)+u[13]*vec3(.00094867,.05131001,.01613766)+u[14]*vec3(.00627372,.07040208,.0077591)+u[15]*vec3(.01686462,.08783871,.00429615)+u[16]*vec3(.02868965,.09424905,.00200551)+u[17]*vec3(.04267481,.09795667,.00086147)+u[18]*vec3(.05625475,.09415219,.00036904)+u[19]*vec3(.0694704,.08678102,.00019143)+u[20]*vec3(.08305315,.07885653,.00014956)+u[21]*vec3(.0861261,.0635267,9.231e-5)+u[22]*vec3(.09046614,.05374142,6.813e-5)+u[23]*vec3(.08500387,.04264606,2.883e-5)+u[24]*vec3(.07090667,.03161735,1.577e-5)+u[25]*vec3(.05062889,.02088521,3.94e-6)+u[26]*vec3(.03547396,.01386011,1.58e-6)+u[27]*vec3(.02146821,.00810264,0)+u[28]*vec3(.01251646,.0046301,0)+u[29]*vec3(.00680458,.00249138,0)+u[30]*vec3(.00346457,.0012593,0)+u[31]*vec3(.00149761,.00054165,0)+u[32]*vec3(.0007697,.00027795,0)+u[33]*vec3(.00040737,.00014711,0)+u[34]*vec3(.00016901,6.103e-5,0)+u[35]*vec3(9.522e-5,3.439e-5,0)+u[36]*vec3(4.903e-5,1.771e-5,0)+u[37]*vec3(2e-5,7.22e-6,0);
}
float f(float x,float z,float v)
{
  z*=pow(v,2.);
  return z/(x*pow(1.-v,2.)+z);
}
vec3 m(vec3 e,vec3 z,float u)
{
  float o[38],x[38];
  f(v(e),o);
  f(v(z),x);
  float r=m(o)[1],y=m(x)[1];
  u=f(r,y,u);
  float i[38];
  for(int e=0;e<38;e++)
    {
      float v=(1.-u)*(pow(1.-o[e],2.)/(2.*o[e]))+u*(pow(1.-x[e],2.)/(2.*x[e]));
      i[e]=1.+v-sqrt(pow(v,2.)+2.*v);
    }
  return w(m(i));
}
vec4 m(vec4 v,vec4 e,float f)
{
  return vec4(m(v.xyz,e.xyz,f),mix(v.w,e.w,f));
}
void main()
{
  vec2 e=.5*vec2(p.x,u_flip*p.y)+.5;
  vec4 v=texture(u_source,e);
  if(u_isFBO)
    outColor=v;
  else if(u_isImage) 
    {
    outColor = texture(u_mask,e);
    }
  else
    {
      vec4 f=texture(u_mask,e);
      if(f.x>0.)
        {
          vec4 e=vec4(u_addColor.xyz,1);
          if(f.w>.7&&!u_isErase)
            {
              float v=.5*(f.w-.7);
              e=e*(1.-v)-vec4(.5)*v;
            }
          vec3 u=m(v.xyz,e.xyz,f.w);
          outColor=vec4(u,1);
        }
      else
         outColor=v;
    }
}`;
      let canvas, gl;
      const sh = {};
      const createProgram = (gl, vert, frag) => {
        const p = gl.createProgram();
        for (let [t, src] of [
          [gl.VERTEX_SHADER, vert],
          [gl.FRAGMENT_SHADER, frag],
        ]) {
          const s = gl.createShader(t);
          gl.shaderSource(s, src);
          gl.compileShader(s);
          gl.attachShader(p, s);
        }
        gl.linkProgram(p);
        return p;
      };
      function prepareGL() {
        gl = canvas.getContext("webgl2");
        const pr = createProgram(gl, vsSource, fsSource);
        let uniforms = [
          "u_flip",
          "u_addColor",
          "u_isErase",
          "u_isFBO",
          "u_source",
          "u_mask",
          "u_isImage",
        ];
        for (let u of uniforms) sh[u] = gl.getUniformLocation(pr, u);
        gl.useProgram(pr);
        sh.mask = createTexture();
        sh.source = createFBO();
        sh.target = createFBO();
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, sh.source.texture);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, sh.mask);
        gl.uniform1i(sh.u_source, 0);
        gl.uniform1i(sh.u_mask, 1);
      }
      function createFBO() {
        let targetTexture = createTexture();
        const fb = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
        gl.framebufferTexture2D(
          gl.FRAMEBUFFER,
          gl.COLOR_ATTACHMENT0,
          gl.TEXTURE_2D,
          targetTexture,
          0
        );
        return { texture: targetTexture, fbo: fb };
      }
      function createTexture() {
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA8, canvas.width, canvas.height);
        return texture;
      }
      function isSafari() {
        return (
          self.navigator &&
          /Safari/.test(self.navigator.userAgent) &&
          !/Chrome/.test(self.navigator.userAgent)
        );
      }
      function applyShader(data) {
        let imageData;
        if (isSafari()) {
          const offscreen = new OffscreenCanvas(
            data.mask.width,
            data.mask.height
          );
          const offctx = offscreen.getContext("2d");
          offctx.drawImage(data.mask, 0, 0);
          imageData = offctx.getImageData(
            0,
            0,
            data.mask.width,
            data.mask.height
          );
        }
        gl.texSubImage2D(
          gl.TEXTURE_2D,
          0,
          0,
          0,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          isSafari() ? imageData : data.mask
        );
        data.mask.close();
        gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, sh.target.fbo);
        gl.uniform1f(sh.u_flip, 1);
        gl.uniform1i(sh.u_isFBO, false);
        gl.uniform1i(sh.u_isImage, data.isImage ? true : false);
        if (!data.isImage) {
          gl.uniform1i(sh.u_isImage, false);
          gl.uniform4f(sh.u_addColor, ...data.addColor);
          gl.uniform1i(sh.u_isErase, data.isErase ? true : false);
        }
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        gl.bindFramebuffer(gl.READ_FRAMEBUFFER, sh.target.fbo);
        gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, sh.source.fbo);
        gl.blitFramebuffer(
          0,
          0,
          canvas.width,
          canvas.height,
          0,
          0,
          canvas.width,
          canvas.height,
          gl.COLOR_BUFFER_BIT,
          gl.NEAREST
        );
        gl.invalidateFramebuffer(gl.READ_FRAMEBUFFER, [gl.COLOR_ATTACHMENT0]);
        if (data.isLast && !data.sp) {
          gl.bindFramebuffer(gl.FRAMEBUFFER, null);
          gl.uniform1i(sh.u_isImage, false);
          gl.uniform1i(sh.u_isFBO, true);
          gl.uniform1f(sh.u_flip, -1);
          gl.drawArrays(gl.TRIANGLES, 0, 3);
        }
      }
      onmessage = async (event) => {
        if (event.data.canvas) {
          canvas = event.data.canvas;
          prepareGL();
          gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, sh.source.fbo);
          gl.clearColor(1, 1, 1, 0);
          gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        } else if (event.data.isBG) {
          gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, sh.source.fbo);
          gl.clearColor(...event.data.color);
          gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        } else if (event.data.mask) {
          applyShader(event.data);
        } else if (event.data.get) {
          let imgbitmap = await createImageBitmap(canvas);
          postMessage({ canvas: imgbitmap }, [imgbitmap]);
          imgbitmap.close();
        }
      };
    });

  const colorCanvas = document.createElement("canvas");
  colorCanvas.width = 1;
  colorCanvas.height = 1;
  const colorCtx = colorCanvas.getContext("2d");
  class Color {
    constructor(r, g, b) {
      if (isNaN(r)) {
        this.hex = this.standardize(r);
        let rgb = this.hexToRgb(this.hex);
        this.r = rgb.r;
        this.g = rgb.g;
        this.b = rgb.b;
      } else {
        r = constrain(r, 0, 255);
        g = constrain(g, 0, 255);
        b = constrain(b, 0, 255);
        this.r = r;
        this.g = isNaN(g) ? r : g;
        this.b = isNaN(b) ? r : b;
        this.hex = this.rgbToHex(this.r, this.g, this.b);
      }
      this.gl = [this.r / 255, this.g / 255, this.b / 255, 1];
    }
    rgbToHex(r, g, b) {
      return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
    }
    hexToRgb(hex) {
      let shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
      hex = hex.replace(shorthandRegex, function (m, r, g, b) {
        return r + r + g + g + b + b;
      });
      let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : null;
    }
    standardize(str) {
      colorCtx.fillStyle = str;
      return colorCtx.fillStyle;
    }
  }
  function isMixReady() {
    {
      isCanvasReady();
      Mix$1.load();
    }
  }
  const Mix$1 = {
    loaded: false,
    isBlending: false,
    currentColor: new Color("white").gl,
    load() {
      if (!Canvases[cID].worker) {
        const ca = Canvases[cID];
        ca.mask = new OffscreenCanvas(Cwidth, Cheight);
        ca.glMask = new OffscreenCanvas(Cwidth, Cheight);
        ca.ctx = ca.mask.getContext("2d");
        ca.gl = ca.glMask.getContext("webgl2");
        ca.ctx.lineWidth = 0;
        ca.offscreen = Canvases[cID].canvas.transferControlToOffscreen();
        ca.worker = gl_worker();
        ca.worker.postMessage("init");
        ca.worker.postMessage({ canvas: ca.offscreen }, [ca.offscreen]);
      }
      this.mask = Canvases[cID].mask;
      this.glMask = Canvases[cID].glMask;
      this.ctx = Canvases[cID].ctx;
      this.gl = Canvases[cID].gl;
      this.worker = Canvases[cID].worker;
    },
    blend(_color = false, _isLast = false, _isImg = false, _isFillLayer = false) {
      isMixReady();
      if (!this.isBlending && _color) {
        this.currentColor = _color.gl;
        this.isBlending = true;
      }
      const newColor = !_color ? this.currentColor : _color.gl;
      const shouldBlend =
        _isLast || _isImg || newColor.toString() !== this.currentColor.toString();
      if (shouldBlend) {
        const imageData = _isImg || this.isBrush ? this.glMask.transferToImageBitmap() : this.mask.transferToImageBitmap();
        this.worker.postMessage(
          {
            addColor: this.currentColor,
            mask: imageData,
            isLast: _isLast,
            isErase: this.isErase,
            isImage: Boolean(_isImg),
            sp: _isFillLayer,
          },
          [imageData]
        );
        this.isErase = false;
        this.isBrush = false;
        if (!_isLast) this.currentColor = _color.gl;
        if (_isLast && !_isFillLayer) this.isBlending = false;
      }
    },
  };
  let _bg_Color$1 = new Color("white");
  function background(r, g, b) {
    isMixReady();
    _bg_Color$1 = new Color(...arguments);
    Mix$1.worker.postMessage({
      color: _bg_Color$1.gl,
      isBG: true,
    });
  }
  function drawImage(img, x = 0, y = 0, w = img.width, h = img.height) {
    isMixReady();
    if (
      Object.prototype.toString.call(img) !== "[object ImageBitmap]" ||
      x !== 0
    ) {
      Mix$1.ctx.drawImage(img, x, y, w, h);
      img = Mix$1.mask.transferToImageBitmap();
    }
    Mix$1.blend(false, false, img);
  }
  async function getCanvas() {
    isMixReady();
    return new Promise((resolve) => {
      Mix$1.worker.postMessage({ get: true });
      Mix$1.worker.onmessage = (event) => {
        if (event.data !== 0) {
          resolve(event.data.canvas);
        }
      };
    });
  }

  const Matrix = { x: 0, y: 0 };
  function translate(x, y) {
    isFieldReady();
    Mix$1.ctx.translate(x, y);
    let m = Mix$1.ctx.getTransform();
    Matrix.x = m.e;
    Matrix.y = m.f;
  }
  function rotate(a = 0) {
    isFieldReady();
    Mix$1.ctx.rotate(a);
  }
  function scale(a) {
    isFieldReady();
    Mix$1.ctx.scale(a, a);
  }
  let isLoaded$1 = false;
  function isFieldReady() {
    if (!isLoaded$1) {
      isMixReady();
      createField();
      isLoaded$1 = true;
    }
  }
  class Position {
    constructor(x, y) {
      this.update(x, y);
      this.plotted = 0;
    }
    update(x, y) {
      this.x = x;
      this.y = y;
      this.column_index = Position.getColIndex(x);
      this.row_index = Position.getRowIndex(y);
    }
    reset() {
      this.plotted = 0;
    }
    isIn() {
      return State.field.isActive
        ? Position.isIn(this.column_index, this.row_index)
        : this.isInCanvas(this.x, this.y);
    }
    isInCanvas() {
      const margin = 0.3;
      const w = Cwidth;
      const h = Cheight;
      const x = this.x + Matrix.x;
      const y = this.y + Matrix.y;
      return (
        x >= -0.3 * w &&
        x <= (1 + margin) * w &&
        y >= -0.3 * h &&
        y <= (1 + margin) * h
      );
    }
    angle() {
      return this.isIn() && State.field.isActive
        ? flow_field()[this.column_index][this.row_index]
        : 0;
    }
    moveTo(_length, _dir, _step_length, isFlow = true) {
      if (!this.isIn()) {
        this.plotted += _step_length;
        return;
      }
      let a, b;
      for (let i = 0; i < _length / _step_length; i++) {
        if (isFlow) {
          const angle = this.angle();
          a = cos(angle - _dir);
          b = sin(angle - _dir);
        } else {
          a = cos(-_dir);
          b = sin(-_dir);
        }
        const x_step = _step_length * a;
        const y_step = _step_length * b;
        this.plotted += _step_length;
        this.update(this.x + x_step, this.y + y_step);
      }
    }
    plotTo(_plot, _length, _step_length, _scale) {
      if (!this.isIn()) {
        this.plotted += _step_length / _scale;
        return;
      }
      const inverse_scale = 1 / _scale;
      for (let i = 0; i < _length / _step_length; i++) {
        const current_angle = this.angle();
        const plot_angle = _plot.angle(this.plotted);
        const x_step = _step_length * cos(current_angle - plot_angle);
        const y_step = _step_length * sin(current_angle - plot_angle);
        this.plotted += _step_length * inverse_scale;
        this.update(this.x + x_step, this.y + y_step);
      }
    }
    static getRowIndex(y) {
      const y_offset = y + Matrix.y - top_y;
      return Math.round(y_offset / resolution);
    }
    static getColIndex(x) {
      const x_offset = x + Matrix.x - left_x;
      return Math.round(x_offset / resolution);
    }
    static isIn(col, row) {
      return col >= 0 && row >= 0 && col < num_columns && row < num_rows;
    }
  }
  State.field = {
    isActive: false,
    current: null,
  };
  let list$1 = new Map();
  let resolution, left_x, top_y, num_columns, num_rows;
  function createField() {
    resolution = Cwidth * 0.01;
    left_x = -0.5 * Cwidth;
    top_y = -0.5 * Cheight;
    num_columns = Math.round((2 * Cwidth) / resolution);
    num_rows = Math.round((2 * Cheight) / resolution);
    addStandard();
    BleedField.genField();
  }
  function flow_field() {
    return list$1.get(State.field.current).field;
  }
  function refreshField(t = 0) {
    list$1.get(State.field.current).field = list$1
      .get(State.field.current)
      .gen(t, genField());
  }
  function genField() {
    return new Array(num_columns)
      .fill(null)
      .map(() => new Float32Array(num_rows));
  }
  function field(a) {
    if (!list$1.has(a)) {
      throw new Error(`Field "${name}" does not exist.`);
    }
    State.field.isActive = true;
    State.field.current = a;
  }
  function noField() {
    State.field.isActive = false;
  }
  function addField(name, funct) {
    list$1.set(name, { gen: funct });
    list$1.get(name).field = list$1.get(name).gen(0, genField());
  }
  function listFields() {
    return Array.from(list$1.keys());
  }
  function addStandard() {
    addField("curved", function (t, field) {
      const angleRange = randInt(-20, -10) * (randInt(0, 100) % 2 === 0 ? -1 : 1);
      const noiseFactor = 0.01;
      const timeFactor = t * 0.03;
      for (let column = 0; column < num_columns; column++) {
        const columnNoise = column * noiseFactor + timeFactor;
        for (let row = 0; row < num_rows; row++) {
          const noise_val = exports.noise(columnNoise, row * noiseFactor + timeFactor);
          field[column][row] = map(noise_val, 0.0, 1.0, -angleRange, angleRange);
        }
      }
      return field;
    });
    addField("hand", function (t, field) {
      const baseSize = rr(0.2, 0.8);
      const baseAngle = randInt(5, 10);
      const timeFactor = t * 0.1;
      for (let column = 0; column < num_columns; column++) {
        const columnNoise = column * 0.1 + timeFactor;
        for (let row = 0; row < num_rows; row++) {
          const addition = randInt(15, 25);
          const angle = baseAngle * sin(baseSize * row * column + addition);
          const noise_val = exports.noise(columnNoise, row * 0.1 + timeFactor);
          field[column][row] = 0.5 * angle * cos(t) + noise_val * baseAngle * 0.5;
        }
      }
      return field;
    });
    addField("seabed", function (t, field) {
      const baseSize = rr(0.4, 0.8);
      const baseAngle = randInt(18, 26);
      for (let column = 0; column < num_columns; column++) {
        for (let row = 0; row < num_rows; row++) {
          const addition = randInt(15, 20);
          const angle = baseAngle * sin(baseSize * row * column + addition);
          field[column][row] = 1.1 * angle * cos(t);
        }
      }
      return field;
    });
  }
  const BleedField = {
    genField() {
      this.field = genField();
      this.fieldTemp = genField();
    },
    get(x, y, value = false) {
      const col = Position.getColIndex(x);
      const row = Position.getRowIndex(y);
      const current = this.field?.[col]?.[row] ?? 0;
      if (value) {
        const biggest = Math.max(current, value);
        const tempValue = (this.fieldTemp[col]?.[row] ?? 0) * 0.75;
        this.fieldTemp[col][row] = Math.max(biggest, tempValue);
        return biggest;
      }
      return current;
    },
    update() {
      for (let col = 0; col < num_columns; col++) {
        for (let row = 0; row < num_rows; row++) {
          this.field[col][row] = this.fieldTemp[col][row];
        }
      }
    },
    save() {
      this.A = cloneArray(this.field);
      this.B = cloneArray(this.fieldTemp);
    },
    restore() {
      this.field = this.A;
      this.fieldTemp = this.B;
    },
  };

  let _saveState = {};
  function save() {
    isFieldReady();
    Mix$1.ctx.save();
    _saveState.fill = { ...State.fill };
    _saveState.stroke = { ...State.stroke };
    _saveState.hatch = { ...State.hatch };
    _saveState.field = { ...State.field };
    BleedField.save();
  }
  function restore() {
    Mix$1.ctx.restore();
    let m = Mix$1.ctx.getTransform();
    Matrix.x = m.e;
    Matrix.y = m.f;
    State.stroke = { ..._saveState.stroke };
    State.field = { ..._saveState.field };
    State.hatch = { ..._saveState.hatch };
    State.fill = { ..._saveState.fill };
    BleedField.restore();
  }

  function drawPolygon(vertices) {
    Mix$1.ctx.beginPath();
    vertices.forEach((v, i) => {
      if (i === 0) Mix$1.ctx.moveTo(v.x, v.y);
      else Mix$1.ctx.lineTo(v.x, v.y);
    });
    Mix$1.ctx.closePath();
  }
  function circle$2(x, y, d) {
    const PI2 = Math.PI * 2;
    const radius = d / 2;
    Mix$1.ctx.moveTo(x + radius, y);
    Mix$1.ctx.arc(x, y, radius, 0, PI2);
  }

  const E = {
    isActive: false,
    c: null,
    a: 255,
  };
  function erase(color = _bg_Color, alpha = 255) {
    E.isActive = true;
    E.c = new Color(color);
    E.a = alpha;
  }
  function noErase() {
    E.isActive = false;
  }
  function drawErase(vertices) {
    Mix.blend(E.c);
    Mix.isErase = true;
    Mix.ctx.save();
    Mix.ctx.fillStyle = "rgb(255 0 0 / " + E.a + "%)";
    drawPolygon(vertices);
    Mix.ctx.fill();
    Mix.ctx.restore();
  }

  class Polygon {
    constructor(pointsArray, useRawVertices = false) {
      this.a = pointsArray;
      this.vertices = useRawVertices
        ? pointsArray
        : pointsArray.map(([x, y]) => ({ x, y }));
      this.sides = this.vertices.map((v, i, arr) => [
        v,
        arr[(i + 1) % arr.length],
      ]);
      this._intersectionCache = {};
    }
    intersect(line) {
      const cacheKey = `${line.point1.x},${line.point1.y}-${line.point2.x},${line.point2.y}`;
      if (this._intersectionCache[cacheKey]) {
        return this._intersectionCache[cacheKey];
      }
      const points = [];
      for (const [start, end] of this.sides) {
        const intersection = intersectLines(line.point1, line.point2, start, end);
        if (intersection) points.push(intersection);
      }
      this._intersectionCache[cacheKey] = points;
      return points;
    }
    erase() {
      if (E.isActive) drawErase(this.vertices);
    }
    show() {
      if (State.draw) this.draw();
      if (State.hatch) this.hatch();
      if (State.fill) this.fill();
      this.erase();
    }
  }

  class Plot {
    constructor(_type) {
      this.segments = [];
      this.angles = [];
      this.pres = [];
      this.type = _type;
      this.dir = 0;
      this.calcIndex(0);
      this.pol = false;
    }
    addSegment(_a = 0, _length = 0, _pres = 1, _degrees = false) {
      if (this.angles.length > 0) this.angles.pop();
      _a = _degrees ? ((_a % 360) + 360) % 360 : toDegrees(_a);
      this.angles.push(_a, _a);
      this.pres.push(_pres);
      this.segments.push(_length);
      this.length = this.segments.reduce((sum, len) => sum + len, 0);
    }
    endPlot(_a = 0, _pres = 1, _degrees = false) {
      _a = _degrees ? ((_a % 360) + 360) % 360 : toDegrees(_a);
      this.angles[this.angles.length - 1] = _a;
      this.pres.push(_pres);
    }
    rotate(_a) {
      this.dir = toDegrees(_a);
    }
    pressure(_d) {
      if (_d > this.length) return this.pres[this.pres.length - 1];
      return this.curving(this.pres, _d);
    }
    angle(_d) {
      if (_d > this.length) return this.angles[this.angles.length - 1];
      this.calcIndex(_d);
      return this.type === "curve"
        ? this.curving(this.angles, _d) + this.dir
        : this.angles[this.index] + this.dir;
    }
    curving(array, _d) {
      let map0 = array[this.index];
      let map1 = array[this.index + 1] ?? map0;
      if (Math.abs(map1 - map0) > 180) {
        if (map1 > map0) map1 = -(360 - map1);
        else map0 = -(360 - map0);
      }
      return map(_d - this.suma, 0, this.segments[this.index], map0, map1, true);
    }
    calcIndex(_d) {
      this.index = -1;
      this.suma = 0;
      let d = 0;
      while (d <= _d) {
        this.suma = d;
        d += this.segments[this.index + 1];
        this.index++;
      }
      return this.index;
    }
    genPol(_x, _y, _scale = 1, _side) {
      isFieldReady();
      const step = 0.5;
      const vertices = [];
      const numSteps = Math.round(this.length / step);
      const pos = new Position(_x, _y);
      let pside = 0;
      let prevIdx = 0;
      for (let i = 0; i < numSteps; i++) {
        pos.plotTo(this, step, step, 1);
        const idx = this.calcIndex(pos.plotted);
        pside += step;
        if (
          (pside >= this.segments[idx] * _side * rr(0.7, 1.3) ||
            idx >= prevIdx) &&
          pos.x
        ) {
          vertices.push([pos.x, pos.y]);
          pside = 0;
          if (idx >= prevIdx) prevIdx++;
        }
      }
      return new Polygon(vertices);
    }
    erase(x, y, scale) {
      if (E.isActive) {
        if (this.origin) [x, y, scale] = [...this.origin, 1];
        this.pol = this.genPol(x, y, scale, 0.15);
        drawErase(this.pol.vertices);
      }
    }
    show(x, y, scale = 1) {
      if (State.stroke) this.draw(x, y, scale);
      if (State.hatch) this.hatch(x, y, scale);
      if (State.fill) this.fill(x, y, scale);
      this.erase(x, y, scale);
    }
  }

  function polygon(pointsArray) {
    const polygon = new Polygon(pointsArray);
    polygon.show();
  }
  function rect(x, y, w, h, mode = "corner") {
    if (mode === "center") {
      x -= w / 2;
      y -= h / 2;
    }
    beginPath(0);
    moveTo(x, y);
    lineTo(x + w, y);
    lineTo(x + w, y + h);
    lineTo(x, y + h);
    closePath();
    endPath();
  }
  function circle$1(x, y, radius, r = false) {
    const p = new Plot("curve");
    const arcLength = Math.PI * radius;
    const angleOffset = rr(0, 360);
    const randomFactor = r ? () => 1 + 0.2 * rr() : () => 1;
    for (let i = 0; i < 4; i++) {
      const angle = -90 * i + angleOffset;
      p.addSegment(
        angle * randomFactor(),
        (arcLength / 2) * randomFactor(),
        1,
        true
      );
    }
    if (r) {
      const randomAngle = randInt(-5, 5);
      p.addSegment(
        angleOffset,
        Math.abs(randomAngle) * (Math.PI / 180) * radius,
        1,
        true
      );
      p.endPlot(randomAngle + angleOffset, 1, true);
    } else {
      p.endPlot(angleOffset, 1, true);
    }
    const offsetX = x - radius * sin(angleOffset);
    const offsetY = y - radius * cos(-angleOffset);
    p.show(offsetX, offsetY, 1);
  }
  function arc(x, y, radius, start, end) {
    const p = new Plot("curve");
    const startAngle = 270 - toDegrees(start);
    const endAngle = 270 - toDegrees(end);
    const arcAngle = toDegrees(end - start);
    const arcLength = (Math.PI * radius * arcAngle) / 180;
    p.addSegment(startAngle, arcLength, 1, true);
    p.endPlot(endAngle, 1, true);
    const startX = x + radius * cos(-startAngle - 90);
    const startY = y + radius * sin(-startAngle - 90);
    p.draw(startX, startY, 1);
  }
  let _pathArray;
  let _current;
  let _curvature;
  class SubPath {
    constructor() {
      this.isClosed = false;
      this.curvature = _curvature;
      this.vert = [];
    }
    vertex(x, y, pressure) {
      this.vert.push([x, y, pressure]);
    }
    show() {
      let plot = _createSpline(this.vert, this.curvature, this.isClosed);
      plot.show();
    }
  }
  function beginPath(curvature = 0) {
    _curvature = constrain(curvature, 0, 1);
    _pathArray = [];
  }
  function moveTo(x, y, pressure = 1) {
    _current = new SubPath();
    _pathArray.push(_current);
    _current.vertex(x, y, pressure);
  }
  function lineTo(x, y, pressure = 1) {
    _current.vertex(x, y, pressure);
  }
  function closePath() {
    _current.vertex(..._current.vert[0]);
    _current.isClosed = true;
  }
  function endPath() {
    for (let sub of _pathArray) {
      sub.show();
    }
    _pathArray = false;
  }
  let _strokeArray, _strokeOrigin;
  function beginStroke(type, x, y) {
    _strokeOrigin = [x, y];
    _strokeArray = new Plot(type);
  }
  function move(angle, length, pressure) {
    _strokeArray.addSegment(angle, length, pressure);
  }
  function endStroke(angle, pressure) {
    _strokeArray.endPlot(angle, pressure);
    _strokeArray.draw(_strokeOrigin[0], _strokeOrigin[1], 1);
    _strokeArray = false;
  }
  function spline(_array_points, _curvature = 0.5) {
    let p = _createSpline(_array_points, _curvature);
    p.draw();
  }
  function _createSpline(points, curvature = 0.5, close = false) {
    const plotType = curvature === 0 ? "segments" : "curve";
    const p = new Plot(plotType);
    const PI2 = Math.PI * 2;
    if (close && curvature !== 0) {
      points.push(points[1]);
    }
    if (points && points.length > 0) {
      let done = 0;
      let pep, tep, pep2;
      for (let i = 0; i < points.length - 1; i++) {
        if (curvature > 0 && i < points.length - 2) {
          const p1 = points[i];
          const p2 = points[i + 1];
          const p3 = points[i + 2];
          const d1 = dist(p1[0], p1[1], p2[0], p2[1]);
          const d2 = dist(p2[0], p2[1], p3[0], p3[1]);
          const a1 = calcAngle(p1[0], p1[1], p2[0], p2[1]);
          const a2 = calcAngle(p2[0], p2[1], p3[0], p3[1]);
          const curvAdjust = curvature * Math.min(d1, d2, 0.5 * Math.min(d1, d2));
          const dmax = Math.max(d1, d2);
          const s1 = d1 - curvAdjust;
          const s2 = d2 - curvAdjust;
          if (Math.floor(a1) === Math.floor(a2)) {
            const temp = close ? (i === 0 ? 0 : d1 - done) : d1 - done;
            const temp2 = close ? (i === 0 ? 0 : d2 - pep2) : d2;
            p.addSegment(a1, temp, p1[2], true);
            if (i === points.length - 3) {
              p.addSegment(a2, temp2, p2[2], true);
            }
            done = 0;
            if (i === 0) {
              pep = d1;
              pep2 = curvAdjust;
              tep = points[1];
              done = 0;
            }
          } else {
            const point1 = {
              x: p2[0] - curvAdjust * cos(-a1),
              y: p2[1] - curvAdjust * sin(-a1),
            };
            const point2 = {
              x: point1.x + dmax * cos(-a1 + 90),
              y: point1.y + dmax * sin(-a1 + 90),
            };
            const point3 = {
              x: p2[0] + curvAdjust * cos(-a2),
              y: p2[1] + curvAdjust * sin(-a2),
            };
            const point4 = {
              x: point3.x + dmax * cos(-a2 + 90),
              y: point3.y + dmax * sin(-a2 + 90),
            };
            const intPt = intersectLines(point1, point2, point3, point4, true);
            const radius = dist(point1.x, point1.y, intPt.x, intPt.y);
            const halfDist = dist(point1.x, point1.y, point3.x, point3.y) / 2;
            const arcAngle = 2 * Math.asin(halfDist / radius) * (180 / Math.PI);
            const arcLength = (PI2 * radius * arcAngle) / 360;
            const temp = close ? (i === 0 ? 0 : s1 - done) : s1 - done;
            const temp2 =
              i === points.length - 3 ? (close ? pep - curvAdjust : s2) : 0;
            p.addSegment(a1, temp, p1[2], true);
            p.addSegment(a1, isNaN(arcLength) ? 0 : arcLength, p1[2], true);
            p.addSegment(a2, temp2, p2[2], true);
            done = curvAdjust;
            if (i === 0) {
              pep = s1;
              pep2 = curvAdjust;
              tep = [point1.x, point1.y];
            }
          }
          if (i === points.length - 3) {
            p.endPlot(a2, p2[2], true);
          }
        } else if (curvature === 0) {
          const p1 = points[i];
          const p2 = points[i + 1];
          const d = dist(p1[0], p1[1], p2[0], p2[1]);
          const a = calcAngle(p1[0], p1[1], p2[0], p2[1]);
          p.addSegment(a, d, p2[2], true);
          if (i === points.length - 2) {
            p.endPlot(a, 1, true);
          }
        }
      }
      p.origin = close && curvature !== 0 ? tep : points[0];
    }
    return p;
  }

  let _time = 0,
    _isLoop = true,
    _drawingLoop,
    _fps = 30;
  exports.frameCount = 0;
  function loop(drawingLoop = false) {
    if (drawingLoop) _drawingLoop = drawingLoop;
    _isLoop = true;
    requestAnimationFrame(drawLoop);
  }
  function noLoop() {
    _isLoop = false;
  }
  let frameRate = (fps) => {
    if (fps) _fps = fps;
    return _fps;
  };
  function drawLoop(timeStamp) {
    if (_isLoop) {
      if (timeStamp > _time + 1000 / frameRate() || timeStamp === 0) {
        _time = timeStamp;
        exports.frameCount++;
        if (_drawingLoop) _drawingLoop();
        endFrame();
      }
    }
    requestAnimationFrame(drawLoop);
  }
  function endFrame() {
    Mix$1.blend(false, true);
  }

  let isLoaded = false;
  function isReady() {
    if (!isLoaded) {
      isMixReady();
      gl = Mix$1.gl;
      matrix = createOrthographicMatrix(Cwidth, Cheight);
      prepareGL();
      isLoaded = true;
    }
  }
  const vsSource = `#version 300 es
in vec2 a_position;
in float a_radius;
in float a_alpha;
uniform mat4 u_matrix;
out float v_alpha;
void main() {
  gl_Position = u_matrix * vec4(a_position, 0, 1);
  v_alpha = a_alpha;
  gl_PointSize = a_radius * 2.0;
}
`;
  const fsSource = `#version 300 es
precision highp float;
uniform bool u_drawSquare;
in float v_alpha;
out vec4 outColor;
void main() {
    if(u_drawSquare) {
      outColor = vec4(vec3(1.,0.,0.) * v_alpha, v_alpha);
    } else {
      vec2 coord = gl_PointCoord - vec2(0.5);
      float d = length(coord);
      if (d > 0.5) {
        discard;
      }
      float edgeFactor = smoothstep(0.45, 0.5, d);
      outColor = vec4(vec3(1.,0.,0.) * v_alpha, v_alpha * (1.0 - edgeFactor));
    }
}
`;
  function createProgram(gl, vert, frag) {
    const p = gl.createProgram();
    for (let [t, src] of [
      [gl.VERTEX_SHADER, vert],
      [gl.FRAGMENT_SHADER, frag],
    ]) {
      const s = gl.createShader(t);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      gl.attachShader(p, s);
    }
    gl.linkProgram(p);
    return p;
  }
  let gl, matrix;
  const Attr = {};
  const Frag = {};
  function prepareGL() {
    const program = createProgram(gl, vsSource, fsSource);
    gl.useProgram(program);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE_MINUS_DST_ALPHA, gl.ONE);
      gl.blendEquation(gl.FUNC_ADD);
    let attr = [
      "a_position",
      "a_radius",
      "a_alpha",
    ];
    for (let a of attr) Attr[a] = gl.getAttribLocation(program, a);
    let uniforms = [
      "u_matrix",
      "u_drawSquare",
    ];
    for (let u of uniforms) Frag[u] = gl.getUniformLocation(program, u);
  }
  function createOrthographicMatrix(width, height) {
    return new Float32Array([
      2 / width,
      0,
      0,
      0,
      0,
      -2 / height,
      0,
      0,
      0,
      0,
      1,
      0,
      -1,
      1,
      0,
      1,
    ]);
  }
  function glDraw() {
    const vao = gl.createVertexArray(isSquare);
    gl.bindVertexArray(vao);
    const circleData = new Float32Array(circles.length * 4);
    for (let i = 0; i < circles.length; i++) {
      const offset = i * 4;
      circleData[offset + 0] = circles[i].x;
      circleData[offset + 1] = circles[i].y;
      circleData[offset + 2] = circles[i].radius;
      circleData[offset + 3] = circles[i].alpha;
    }
    circles = [];
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, circleData, gl.STATIC_DRAW);
    const stride = 4 * Float32Array.BYTES_PER_ELEMENT;
    gl.enableVertexAttribArray(Attr.a_position);
    gl.vertexAttribPointer(Attr.a_position, 2, gl.FLOAT, false, stride, 0);
    gl.enableVertexAttribArray(Attr.a_radius);
    gl.vertexAttribPointer(
      Attr.a_radius,
      1,
      gl.FLOAT,
      false,
      stride,
      2 * Float32Array.BYTES_PER_ELEMENT
    );
    gl.enableVertexAttribArray(Attr.a_alpha);
    gl.vertexAttribPointer(
      Attr.a_alpha,
      1,
      gl.FLOAT,
      false,
      stride,
      3 * Float32Array.BYTES_PER_ELEMENT
    );
    gl.uniformMatrix4fv(Frag.u_matrix, false, matrix);
    gl.uniform1i(Frag.u_drawSquare, isSquare ? 1 : 0);
    const circleCount = circleData.length / 4;
    gl.bindVertexArray(vao);
    gl.drawArrays(gl.POINTS, 0, circleCount);
    gl.bindVertexArray(null);
  }
  let circles = [];
  let isSquare = false;
  function circle(x, y, diameter, alpha) {
    isReady();
    const radius = diameter / 2;
    circles.push({
      x: x + Matrix.x,
      y: y + Matrix.y,
      radius,
      alpha: alpha / 100,
    });
    isSquare = false;
  }
  function square(x, y, size, alpha) {
    isReady();
    const radius = size / 2 / 1.2;
    circles.push({
      x: x + Matrix.x,
      y: y + Matrix.y,
      radius,
      alpha: alpha / 100,
    });
    isSquare = true;
  }

  const PI2 = Math.PI * 2;
  State.stroke = {
    color: new Color("black"),
    weight: 1,
    clipWindow: null,
    type: "HB",
    isActive: false,
  };
  let list = new Map();
  function BrushState() {
    return { ...State.stroke };
  }
  function BrushSetState(state) {
    State.stroke = { ...state };
  }
  function add(name, params) {
    const validTypes = ["marker", "custom", "image", "spray"];
    params.type = validTypes.includes(params.type) ? params.type : "default";
    list.set(name, { param: params, colors: [], buffers: [] });
  }
  function box() {
    return [...list.keys()];
  }
  function scaleBrushes(scaleFactor) {
    for (const { param } of list.values()) {
      if (param) {
        param.weight *= scaleFactor;
        param.vibration *= scaleFactor;
        param.spacing *= scaleFactor;
      }
    }
  }
  function pick(brushName) {
    if (list.has(brushName)) State.stroke.type = brushName;
  }
  function strokeStyle(r, g, b) {
    State.stroke.color = new Color(...arguments);
    State.stroke.isActive = true;
  }
  function lineWidth(weight) {
    State.stroke.weight = weight;
  }
  function set(brushName, color, weight = 1) {
    pick(brushName);
    strokeStyle(color);
    lineWidth(weight);
  }
  function noStroke() {
    State.stroke.isActive = false;
  }
  function clip(region) {
    State.stroke.clipWindow = region;
  }
  function noClip() {
    State.stroke.clipWindow = null;
  }
  function spacing() {
    const { param } = list.get(State.stroke.type) ?? {};
    if (!param) return 1;
    return param.type === "default" || param.type === "spray"
      ? param.spacing / State.stroke.weight
      : param.spacing;
  }
  let _position;
  let _length;
  let _flow;
  let _plot;
  let _dir;
  function initializeDrawingState(x, y, length, flow, plot) {
    _position = new Position(x, y);
    _length = length;
    _flow = flow;
    _plot = plot;
    if (_plot) _plot.calcIndex(0);
  }
  function draw(angleScale, isPlot) {
    if (!isPlot) _dir = angleScale;
    saveState();
    const stepSize = spacing();
    const totalSteps = Math.round(
      (_length * (isPlot ? angleScale : 1)) / stepSize
    );
    for (let i = 0; i < totalSteps; i++) {
      tip();
      isPlot
        ? _position.plotTo(
            _plot,
            stepSize,
            stepSize,
            angleScale,
            i < 10 ? true : false
          )
        : _position.moveTo(stepSize, angleScale, stepSize, _flow);
    }
    restoreState();
  }
  const current = {};
  function saveState() {
    current.seed = rr() * 99999;
    const { param } = list.get(State.stroke.type) ?? {};
    if (!param) return;
    current.p = param;
    const { pressure } = param;
    current.a = pressure.type !== "custom" ? rr(-1, 1) : 0;
    current.b = pressure.type !== "custom" ? rr(1, 1.5) : 0;
    current.cp = pressure.type !== "custom" ? rr(3, 3.5) : rr(-0.2, 0.2);
    [current.min, current.max] = pressure.min_max;
    isReady();
    Mix$1.blend(State.stroke.color);
    Mix$1.isBrush = true;
    current.alpha = calculateAlpha();
    markerTip();
  }
  function restoreState() {
    glDraw(State.stroke.color);
    markerTip();
  }
  function tip(customPressure = false) {
    if (!isInsideClippingArea()) return;
    let pressure = customPressure || calculatePressure();
    pressure *=
      1 -
      0.3 *
        exports.noise(
          _position.x * 0.007 + current.seed,
          _position.y * 0.007 + current.seed
        ) -
      0.1 * exports.noise(_position.x * 0.002, _position.y * 0.002);
    switch (current.p.type) {
      case "spray":
        drawSpray(pressure);
        break;
      case "marker":
        drawMarker(pressure);
        break;
      case "custom":
      case "image":
        drawCustomOrImage(pressure);
        break;
      default:
        drawDefault(pressure);
        break;
    }
  }
  function calculatePressure() {
    return _plot
      ? simPressure() * _plot.pressure(_position.plotted)
      : simPressure();
  }
  function simPressure() {
    return current.p.pressure.type === "custom"
      ? map(
          current.p.pressure.curve(_position.plotted / _length) + current.cp,
          0,
          1,
          current.min,
          current.max,
          true
        )
      : gauss();
  }
  function gauss(
    a = 0.5 + current.p.pressure.curve[0] * current.a,
    b = 1 - current.p.pressure.curve[1] * current.b,
    c = current.cp,
    min = current.min,
    max = current.max
  ) {
    return map(
      1 /
        (1 +
          Math.pow(
            Math.abs((_position.plotted - a * _length) / ((b * _length) / 2)),
            2 * c
          )),
      0,
      1,
      min,
      max
    );
  }
  function calculateAlpha() {
    return ["default", "spray"].includes(current.p.type)
      ? current.p.opacity
      : current.p.opacity / State.stroke.weight;
  }
  function isInsideClippingArea() {
    if (State.stroke.clipWindow)
      return (
        _position.x >= State.stroke.clipWindow[0] &&
        _position.x <= State.stroke.clipWindow[2] &&
        _position.y >= State.stroke.clipWindow[1] &&
        _position.y <= State.stroke.clipWindow[3]
      );
    else {
      let w = Cwidth,
        h = Cheight,
        o = Cwidth * 0.05;
      let x = _position.x + Matrix.x;
      let y = _position.y + Matrix.y;
      return x >= -o && x <= w + o && y >= -o && y <= h + o;
    }
  }
  function drawSpray(pressure) {
    const vibration =
      State.stroke.weight * current.p.vibration * pressure +
      (State.stroke.weight * gaussian() * current.p.vibration) / 3;
    const sw = State.stroke.weight * rr(0.9, 1.1);
    const iterations = Math.ceil(current.p.quality / pressure);
    for (let j = 0; j < iterations; j++) {
      const r = rr(0.9, 1.1);
      const rX = r * vibration * rr(-1, 1);
      const yRandomFactor = rr(-1, 1);
      const sqrtPart = Math.sqrt((r * vibration) ** 2 - rX ** 2);
      square(
        _position.x + rX,
        _position.y + yRandomFactor * sqrtPart,
        sw,
        current.alpha
      );
    }
  }
  function drawMarker(pressure, vibrate = true, alpha = current.alpha) {
    const vibration = vibrate ? State.stroke.weight * current.p.vibration : 0;
    const rx = vibrate ? vibration * rr(-1, 1) : 0;
    const ry = vibrate ? vibration * rr(-1, 1) : 0;
    circle(
      _position.x + rx,
      _position.y + ry,
      State.stroke.weight * current.p.weight * pressure,
      alpha
    );
  }
  function drawCustomOrImage(pressure, alpha, vibrate = true) {
    Mix$1.ctx.save();
    const vibration = vibrate ? State.stroke.weight * current.p.vibration : 0;
    const rx = vibrate ? vibration * rr(-1, 1) : 0;
    const ry = vibrate ? vibration * rr(-1, 1) : 0;
    Mix$1.ctx.translate(_position.x + rx, _position.y + ry);
    adjustSizeAndRotation(State.stroke.weight * pressure);
    current.p.tip(Mix$1.ctx);
    Mix$1.ctx.restore();
  }
  function drawDefault(pressure) {
    const vibration =
      State.stroke.weight *
      current.p.vibration *
      (current.p.definition +
        ((1 - current.p.definition) * gaussian() * gauss(0.5, 0.9, 5, 0.2, 1.2)) /
          pressure);
    if (rr(0, current.p.quality * pressure) > 0.4) {
      square(
        _position.x + 0.7 * vibration * rr(-1, 1),
        _position.y + vibration * rr(-1, 1),
        pressure * current.p.weight * rr(0.85, 1.15),
        current.alpha
      );
    }
  }
  function adjustSizeAndRotation(pressure, alpha) {
    Mix$1.ctx.scale(pressure, pressure);
    let angle = 0;
    if (current.p.rotate === "random") angle = randInt(0, PI2);
    else if (current.p.rotate === "natural") {
      angle =
        (_plot ? -_plot.angle(_position.plotted) : -_dir) +
        (_flow ? _position.angle() : 0);
      angle = (angle * Math.PI) / 180;
    }
    Mix$1.ctx.rotate(angle);
  }
  function markerTip() {
    if (isInsideClippingArea()) {
      let pressure = calculatePressure();
      let alpha = calculateAlpha();
      if (current.p.type === "marker") {
        for (let s = 1; s < 10; s++) {
          drawMarker((pressure * s) / 10, false, alpha * 5);
        }
        glDraw(State.stroke.color);
      } else if (current.p.type === "custom" || current.p.type === "image") {
        for (let s = 1; s < 5; s++) {
          Mix$1.ctx.beginPath();
          current.drawCustomOrImage((pressure * s) / 5, alpha, false);
          Mix$1.ctx.fill();
        }
      }
    }
  }
  function line(x1, y1, x2, y2) {
    isFieldReady();
    let d = dist(x1, y1, x2, y2);
    if (d == 0) return;
    initializeDrawingState(x1, y1, d, true, false);
    let angle = calcAngle(x1, y1, x2, y2);
    draw(angle, false);
  }
  function stroke(x, y, length, dir) {
    isFieldReady();
    initializeDrawingState(x, y, length, true, false);
    draw(toDegrees(dir), false);
  }
  function plot(p, x, y, scale) {
    isFieldReady();
    initializeDrawingState(x, y, p.length, true, p);
    draw(scale, true);
  }
  const _vals = [
    "weight",
    "vibration",
    "definition",
    "quality",
    "opacity",
    "spacing",
    "pressure",
    "type",
    "tip",
    "rotate",
  ];
  const _standard_brushes = [
    [
      "pen",
      [0.35, 0.12, 0.5, 8, 88, 0.3, { curve: [0.15, 0.2], min_max: [1.4, 0.9] }],
    ],
    [
      "rotring",
      [
        0.2,
        0.05,
        0.5,
        30,
        115,
        0.15,
        { curve: [0.35, 0.2], min_max: [1.3, 0.9] },
      ],
    ],
    [
      "2B",
      [0.35, 0.6, 0.1, 8, 140, 0.2, { curve: [0.15, 0.2], min_max: [1.5, 1] }],
    ],
    [
      "HB",
      [0.3, 0.5, 0.4, 4, 130, 0.25, { curve: [0.15, 0.2], min_max: [1.2, 0.9] }],
    ],
    [
      "2H",
      [0.2, 0.4, 0.3, 2, 60, 0.2, { curve: [0.15, 0.2], min_max: [1.2, 0.9] }],
    ],
    [
      "cpencil",
      [0.4, 0.55, 0.8, 7, 70, 0.15, { curve: [0.15, 0.2], min_max: [0.95, 1.2] }],
    ],
    [
      "charcoal",
      [
        0.35,
        1.5,
        0.65,
        300,
        60,
        0.06,
        { curve: [0.15, 0.2], min_max: [1.3, 0.9] },
      ],
    ],
    [
      "crayon",
      [0.25, 2, 0.8, 300, 60, 0.06, { curve: [0.35, 0.2], min_max: [0.9, 1.1] }],
    ],
    [
      "spray",
      [0.2, 12, 15, 40, 35, 0.65, { curve: [0, 0.1], min_max: [1, 1] }, "spray"],
    ],
    [
      "marker",
      [
        2.5,
        0.12,
        null,
        null,
        0.4,
        0.04,
        { curve: [0.35, 0.25], min_max: [1.5, 1] },
        "marker",
      ],
    ],
  ];
  for (let s of _standard_brushes) {
    let obj = {};
    for (let i = 0; i < s[1].length; i++) obj[_vals[i]] = s[1][i];
    add(s[0], obj);
  }
  Polygon.prototype.draw = function (_brush = false, _color, _weight) {
    let state = BrushState();
    if (_brush) set(_brush, _color, _weight);
    if (state.isActive) {
      for (let s of this.sides) {
        line(s[0].x, s[0].y, s[1].x, s[1].y);
      }
    }
    BrushSetState(state);
  };
  Plot.prototype.draw = function (x, y, scale) {
    if (BrushState().isActive) {
      if (this.origin) (x = this.origin[0]), (y = this.origin[1]), (scale = 1);
      plot(this, x, y, scale);
    }
  };

  State.hatch = {
    isActive: false,
    dist: 5,
    angle: 45,
    options: {},
    hBrush: false,
  };
  function HatchState() {
    return { ...State.hatch };
  }
  function HatchSetState(state) {
    State.hatch = { ...state };
  }
  function hatch(
    dist = 5,
    angle = 45,
    options = { rand: false, continuous: false, gradient: false }
  ) {
    let s = State.hatch;
    s.isActive = true;
    s.dist = dist;
    s.angle = angle;
    s.options = options;
  }
  function hatchStyle(brush, color = "black", weight = 1) {
    State.hatch.hBrush = { brush, color, weight };
  }
  function noHatch() {
    State.hatch.isActive = false;
    State.hatch.hBrush = false;
  }
  function createHatch(polygons) {
    let dist = State.hatch.dist;
    let angle = State.hatch.angle;
    let options = State.hatch.options;
    let save = BrushState();
    if (State.hatch.hBrush) set(...Object.values(State.hatch.hBrush));
    angle = toDegrees(angle) % 180;
    if (!Array.isArray(polygons)) polygons = [polygons];
    const overallBB = computeOverallBoundingBox(polygons);
    let ventana = new Polygon([
      [overallBB.minX, overallBB.minY],
      [overallBB.maxX, overallBB.minY],
      [overallBB.maxX, overallBB.maxY],
      [overallBB.minX, overallBB.maxY],
    ]);
    let startY = angle <= 90 && angle >= 0 ? overallBB.minY : overallBB.maxY;
    let gradient = options.gradient
      ? map(options.gradient, 0, 1, 1, 1.1, true)
      : 1;
    let dots = [];
    let i = 0;
    let dist1 = dist;
    let linea = (i) => {
      return {
        point1: {
          x: overallBB.minX + dist1 * i * cos(-angle + 90),
          y: startY + dist1 * i * sin(-angle + 90),
        },
        point2: {
          x: overallBB.minX + dist1 * i * cos(-angle + 90) + cos(-angle),
          y: startY + dist1 * i * sin(-angle + 90) + sin(-angle),
        },
      };
    };
    while (ventana.intersect(linea(i)).length > 0) {
      let tempArray = [];
      for (let p of polygons) {
        tempArray.push(p.intersect(linea(i)));
      }
      dots[i] = tempArray
        .flat()
        .sort((a, b) => (a.x === b.x ? a.y - b.y : a.x - b.x));
      dist1 *= gradient;
      i++;
    }
    let gdots = [];
    for (let dd of dots) {
      if (typeof dd[0] !== "undefined") {
        gdots.push(dd);
      }
    }
    let r = options.rand ? options.rand : 0;
    for (let j = 0; j < gdots.length; j++) {
      let dd = gdots[j];
      let shouldDrawContinuousLine = j > 0 && options.continuous;
      for (let i = 0; i < dd.length - 1; i += 2) {
        if (r !== 0) {
          dd[i].x += r * dist * rr(-10, 10);
          dd[i].y += r * dist * rr(-10, 10);
          dd[i + 1].x += r * dist * rr(-10, 10);
          dd[i + 1].y += r * dist * rr(-10, 10);
        }
        line(dd[i].x, dd[i].y, dd[i + 1].x, dd[i + 1].y);
        if (shouldDrawContinuousLine) {
          line(gdots[j - 1][1].x, gdots[j - 1][1].y, dd[i].x, dd[i].y);
        }
      }
    }
    BrushSetState(save);
  }
  function computeBoundingBoxForPolygon(polygon) {
    if (polygon._boundingBox) return polygon._boundingBox;
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    for (let i = 0; i < polygon.a.length; i++) {
      const [x, y] = polygon.a[i];
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
    polygon._boundingBox = { minX, minY, maxX, maxY };
    return polygon._boundingBox;
  }
  function computeOverallBoundingBox(polygons) {
    let overall = {
      minX: Infinity,
      minY: Infinity,
      maxX: -Infinity,
      maxY: -Infinity,
    };
    for (let poly of polygons) {
      const bb = computeBoundingBoxForPolygon(poly);
      overall.minX = Math.min(overall.minX, bb.minX);
      overall.minY = Math.min(overall.minY, bb.minY);
      overall.maxX = Math.max(overall.maxX, bb.maxX);
      overall.maxY = Math.max(overall.maxY, bb.maxY);
    }
    return overall;
  }
  Polygon.prototype.hatch = function (_dist = false, _angle, _options) {
    let state = HatchState();
    if (_dist) hatch(_dist, _angle, _options);
    if (state.isActive) {
      createHatch(this);
    }
    HatchSetState(state);
  };
  Plot.prototype.hatch = function (x, y, scale) {
    if (HatchState().isActive) {
      if (this.origin) (x = this.origin[0]), (y = this.origin[1]), (scale = 1);
      this.pol = this.genPol(x, y, scale, 0.25);
      this.pol.hatch();
    }
  };

  State.fill = {
    color: new Color("#002185"),
    opacity: 60,
    bleed_strength: 0.07,
    texture_strength: 0.8,
    border_strength: 0.5,
    direction: "out",
    isActive: false,
  };
  function FillState() {
    return { ...State.fill };
  }
  function FillSetState(state) {
    State.fill = { ...state };
  }
  function fillStyle(a, b, c, d) {
    State.fill.opacity = (arguments.length < 4 ? b : d) || 60;
    State.fill.color = arguments.length < 3 ? new Color(a) : new Color(a, b, c);
    State.fill.isActive = true;
  }
  function fillBleed(_i, _direction = "out") {
    State.fill.bleed_strength = constrain(_i, 0, 1);
    State.fill.direction = _direction;
  }
  function fillTexture(_texture = 0.4, _border = 0.4) {
    State.fill.texture_strength = constrain(_texture, 0, 1);
    State.fill.border_strength = constrain(_border, 0, 1);
  }
  function noFill() {
    State.fill.isActive = false;
  }
  let fillPolygon;
  function createFill(polygon) {
    fillPolygon = polygon;
    let v = [...polygon.vertices];
    const vLength = v.length;
    const fluid = vLength * 0.25 * weightedRand({ 1: 5, 2: 10, 3: 60 });
    const strength = State.fill.bleed_strength;
    let modifiers = v.map((_, i) => {
      let multiplier = rr(0.85, 1.2) * strength;
      return i > fluid ? multiplier : multiplier * 0.2;
    });
    let shift = randInt(0, vLength);
    v = [...v.slice(shift), ...v.slice(0, shift)];
    let pol = new FillPolygon(v, modifiers, calcCenter(v), [], true);
    pol.fill(
      State.fill.color,
      map(State.fill.opacity, 0, 100, 0, 1, true),
      State.fill.texture_strength,
      true,
    );
  }
  function calcCenter(pts) {
    pts = [...pts];
    var first = pts[0],
      last = pts[pts.length - 1];
    if (first.x != last.x || first.y != last.y) pts.push(first);
    var twicearea = 0,
      x = 0,
      y = 0,
      nPts = pts.length,
      p1,
      p2,
      f;
    for (var i = 0, j = nPts - 1; i < nPts; j = i++) {
      p1 = pts[i];
      p2 = pts[j];
      f =
        (p1.y - first.y) * (p2.x - first.x) - (p2.y - first.y) * (p1.x - first.x);
      twicearea += f;
      x += (p1.x + p2.x - 2 * first.x) * f;
      y += (p1.y + p2.y - 2 * first.y) * f;
    }
    f = twicearea * 3;
    return { x: x / f + first.x, y: y / f + first.y };
  }
  class FillPolygon {
    constructor(_v, _m, _center, dir, isFirst) {
      this.v = _v;
      this.dir = dir;
      this.m = _m;
      this.midP = _center;
      this.sizeX = -Infinity;
      this.sizeY = -Infinity;
      for (let v of this.v) {
        this.sizeX = Math.max(Math.abs(this.midP.x - v.x), this.sizeX);
        this.sizeY = Math.max(Math.abs(this.midP.y - v.y), this.sizeY);
      }
      if (isFirst) {
        for (let i = 0; i < this.v.length; i++) {
          const v1 = this.v[i];
          const v2 = this.v[(i + 1) % this.v.length];
          const side = { x: v2.x - v1.x, y: v2.y - v1.y };
          const rt = rotate$1(0, 0, side.x, side.y, 90);
          let linea = {
            point1: { x: v1.x + side.x / 2, y: v1.y + side.y / 2 },
            point2: { x: v1.x + side.x / 2 + rt.x, y: v1.y + side.y / 2 + rt.y },
          };
          const isLeft = (a, b, c) => {
            return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x) > 0.01;
          };
          let d1 = 0;
          for (let int of fillPolygon.intersect(linea)) {
            if (isLeft(v1, v2, int)) d1++;
          }
          this.dir[i] = d1 % 2 === 0 ? true : false;
        }
      }
    }
    trim(factor = 1) {
      let v = [...this.v],
        m = [...this.m],
        dir = [...this.dir];
      if (this.v.length > 8 && factor >= 0 && factor !== 1) {
        let numTrim = ~~((1 - factor) * this.v.length);
        let sp = ~~this.v.length / 2 - ~~numTrim / 2;
        v.splice(sp, numTrim);
        m.splice(sp, numTrim);
        dir.splice(sp, numTrim);
      }
      return { v: v, m: m, dir: dir };
    }
    grow(growthFactor = 1) {
      const newVerts = [];
      const newMods = [];
      const newDirs = [];
      const trimmed = this.trim(growthFactor);
      const tr_v = trimmed.v;
      const tr_m = trimmed.m;
      const tr_dir = trimmed.dir;
      const len = tr_v.length;
      const bleedDirection = State.fill.direction === "out" ? -90 : 90;
      let cond = false;
      switch (growthFactor) {
        case 999:
          cond = rr(0.2, 0.6);
          break;
        case 997:
          cond = State.fill.bleed_strength / 1.7;
      }
      for (let i = 0; i < len; i++) {
        const currentVertex = tr_v[i];
        const nextVertex = tr_v[(i + 1) % len];
        let mod =
          cond || BleedField.get(currentVertex.x, currentVertex.y, tr_m[i]);
        let side = {
          x: nextVertex.x - currentVertex.x,
          y: nextVertex.y - currentVertex.y,
        };
        let rotationDegrees =
          (tr_dir[i] ? bleedDirection : -bleedDirection) + rr(-1,1) * 5;
        let direction = rotate$1(0, 0, side.x, side.y, rotationDegrees);
        let lerp = rr(0.35, 0.65);
        let mult = gaussian(0.5, 0.2) * rr(0.65, 1.35) * mod;
        let newVertex = {
          x: currentVertex.x + side.x * lerp + direction.x * mult,
          y: currentVertex.y + side.y * lerp + direction.y * mult,
        };
        newVerts.push(currentVertex, newVertex);
        newMods.push(tr_m[i], tr_m[i] + pseudoGaussian(0, 0.02));
        newDirs.push(tr_dir[i], tr_dir[i]);
      }
      return new FillPolygon(newVerts, newMods, this.midP, newDirs);
    }
    fill(color, intensity, tex) {
      const numLayers = 24;
      const texture = tex * 3;
      const int = intensity * (1 + tex/2);
      Mix$1.blend(color);
      Mix$1.ctx.save();
      Mix$1.ctx.fillStyle = "rgb(255 0 0 / " + int + "%)";
      Mix$1.ctx.strokeStyle =
        "rgb(255 0 0 / " + 0.008 * State.fill.border_strength + ")";
      let pol = this.grow();
      let pols;
      for (let i = 0; i < numLayers; i++) {
        if (i % 4 === 0) {
          pol = pol.grow();
        }
        pols = [
          pol.grow(1 - 0.0125 * i),
          pol.grow(0.7 - 0.0125 * i),
          pol.grow(0.4 - 0.0125 * i),
        ];
        for (let p of pols) p.grow(997).grow().layer(i, int);
        pol.grow(0.1).grow(999).layer(i, int);
        if (i % 4 === 0 || i === numLayers - 1) {
          if (texture !== 0) pol.erase(texture * 5, intensity);
          Mix$1.blend(color, true, false, true);
        }
      }
      BleedField.update();
      Mix$1.ctx.restore();
    }
    layer(i) {
      const size = Math.max(this.sizeX, this.sizeY);
      Mix$1.ctx.lineWidth = map(i, 0, 24, size / 30, size / 45, true);
      drawPolygon(this.v);
      Mix$1.ctx.stroke();
      Mix$1.ctx.fill();
    }
    erase(texture, intensity) {
      Mix$1.ctx.save();
      let numCircles = rr(60, 100) * map(texture, 0, 1, 2, 3);
      const halfSizeX = this.sizeX / 1.8;
      const halfSizeY = this.sizeY / 1.8;
      const minSize =
        Math.min(this.sizeX, this.sizeY) * (1.4 - State.fill.bleed_strength);
      const minSizeFactor = 0.03 * minSize;
      const maxSizeFactor = 0.3 * minSize;
      const midX = this.midP.x;
      const midY = this.midP.y;
      Mix$1.ctx.globalCompositeOperation = "destination-out";
      let i = (5 - map(intensity, 80, 120, 0.3, 2, true)) * texture;
      Mix$1.ctx.fillStyle = "rgb(255 0 0 / " + i / 255 + ")";
      Mix$1.ctx.lineWidth = 0;
      for (let i = 0; i < numCircles; i++) {
        const x = midX + gaussian(0, halfSizeX);
        const y = midY + gaussian(0, halfSizeY);
        const size = rr(minSizeFactor, maxSizeFactor);
        Mix$1.ctx.beginPath();
        circle$2(x, y, size);
        if (i % 4 !== 0) Mix$1.ctx.fill();
      }
      Mix$1.ctx.globalCompositeOperation = "source-over";
      Mix$1.ctx.restore();
    }
  }
  Polygon.prototype.fill = function (
    _color = false,
    _opacity,
    _bleed,
    _texture,
    _border,
    _direction
  ) {
    let state = FillState();
    if (_color) {
      fillStyle(_color, _opacity);
      fillBleed(_bleed, _direction);
      fillTexture(_texture, _border);
    }
    if (state.isActive) {
      isFieldReady();
      createFill(this);
    }
    FillSetState(state);
  };
  Plot.prototype.fill = function (x, y, scale) {
    if (FillState().isActive) {
      if (this.origin) (x = this.origin[0]), (y = this.origin[1]), (scale = 1);
      this.pol = this.genPol(x, y, scale, State.fill.bleed_strength * 3);
      this.pol.fill();
    }
  };

  exports.Color = Color;
  exports.Plot = Plot;
  exports.Polygon = Polygon;
  exports.Position = Position;
  exports.add = add;
  exports.addField = addField;
  exports.arc = arc;
  exports.background = background;
  exports.beginPath = beginPath;
  exports.beginStroke = beginStroke;
  exports.box = box;
  exports.circle = circle$1;
  exports.clip = clip;
  exports.closePath = closePath;
  exports.draw = endFrame;
  exports.drawImage = drawImage;
  exports.endPath = endPath;
  exports.endStroke = endStroke;
  exports.erase = erase;
  exports.field = field;
  exports.fillBleed = fillBleed;
  exports.fillStyle = fillStyle;
  exports.fillTexture = fillTexture;
  exports.frameRate = frameRate;
  exports.getCanvas = getCanvas;
  exports.hatch = hatch;
  exports.hatchArray = createHatch;
  exports.hatchStyle = hatchStyle;
  exports.line = line;
  exports.lineTo = lineTo;
  exports.lineWidth = lineWidth;
  exports.listFields = listFields;
  exports.load = load;
  exports.loop = loop;
  exports.move = move;
  exports.moveTo = moveTo;
  exports.noClip = noClip;
  exports.noErase = noErase;
  exports.noField = noField;
  exports.noFill = noFill;
  exports.noHatch = noHatch;
  exports.noLoop = noLoop;
  exports.noStroke = noStroke;
  exports.noiseSeed = noiseSeed;
  exports.pick = pick;
  exports.polygon = polygon;
  exports.random = random;
  exports.rect = rect;
  exports.refreshField = refreshField;
  exports.restore = restore;
  exports.rotate = rotate;
  exports.save = save;
  exports.scale = scale;
  exports.scaleBrushes = scaleBrushes;
  exports.seed = seed;
  exports.set = set;
  exports.spline = spline;
  exports.stroke = stroke;
  exports.strokeStyle = strokeStyle;
  exports.translate = translate;
  exports.wRand = weightedRand;

}));
