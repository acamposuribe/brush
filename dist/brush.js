var t,e;t=this,e=function(t){const e={};let n,i,o,s=!1;const r={},a=.5*(Math.sqrt(3)-1),c=(3-Math.sqrt(3))/6,l=t=>0|Math.floor(t),u=new Float64Array([1,1,-1,1,1,-1,-1,-1,1,0,-1,0,1,0,-1,0,0,1,0,-1,0,1,0,-1]);function h(t=Math.random){const e=function(t){const e=new Uint8Array(512);for(let t=0;t<256;t++)e[t]=t;for(let n=0;n<255;n++){const i=n+~~(t()*(256-n)),o=e[n];e[n]=e[i],e[i]=o}for(let t=256;t<512;t++)e[t]=e[t-256];return e}(t),n=new Float64Array(e).map((t=>u[t%12*2])),i=new Float64Array(e).map((t=>u[t%12*2+1]));return function(t,o){let s=0,r=0,u=0;const h=(t+o)*a,f=l(t+h),x=l(o+h),m=(f+x)*c,d=t-(f-m),g=o-(x-m);let v,p;d>g?(v=1,p=0):(v=0,p=1);const y=d-v+c,w=g-p+c,b=d-1+2*c,_=g-1+2*c,k=255&f,M=255&x;let A=.5-d*d-g*g;if(A>=0){const t=k+e[M];A*=A,s=A*A*(n[t]*d+i[t]*g)}let z=.5-y*y-w*w;if(z>=0){const t=k+v+e[M+p];z*=z,r=z*z*(n[t]*y+i[t]*w)}let I=.5-b*b-_*_;if(I>=0){const t=k+1+e[M+1];I*=I,u=I*I*(n[t]*b+i[t]*_)}return 70*(s+r+u)}}function f(t,e){let n=new x(t),i=()=>n.next();return i.double=()=>i()+11102230246251565e-32*(2097152*i()|0),i.int32=()=>4294967296*n.next()|0,i.quick=i,function(t,e,n){let i=n&&n.state;i&&("object"==typeof i&&e.copy(i,e),t.state=()=>e.copy(e,{}))}(i,n,e),i}class x{constructor(t){null==t&&(t=+new Date);let e=4022871197;function n(t){t=String(t);for(let n=0;n<t.length;n++){e+=t.charCodeAt(n);let i=.02519603282416938*e;e=i>>>0,i-=e,i*=e,e=i>>>0,i-=e,e+=4294967296*i}return 2.3283064365386963e-10*(e>>>0)}this.c=1,this.s0=n(" "),this.s1=n(" "),this.s2=n(" "),this.s0-=n(t),this.s0<0&&(this.s0+=1),this.s1-=n(t),this.s1<0&&(this.s1+=1),this.s2-=n(t),this.s2<0&&(this.s2+=1)}next(){let{c:t,s0:e,s1:n,s2:i}=this,o=2091639*e+2.3283064365386963e-10*t;return this.s0=n,this.s1=i,this.s2=o-(this.c=0|o)}copy(t,e){return e.c=t.c,e.s0=t.s0,e.s1=t.s1,e.s2=t.s2,e}}let m=f(Math.random()),d=f(Math.random());t.noise=h(d);const g=(t=0,e=1)=>t+m()*(e-t),v=(t,e)=>~~g(t,e);function p(t=0,e=1){const n=1-m(),i=m();return Math.sqrt(-2*Math.log(n))*k(360*i)*e+t}function y(t){let e,n,i=[];for(e in t)for(n=0;n<10*t[e];n++)i.push(e);let o=i[Math.floor(m()*i.length)];return isNaN(o)?o:parseInt(o)}function w(t,e,n,i,o,s=!1){let r=i+(t-e)/(n-e)*(o-i);return s?i<o?b(r,i,o):b(r,o,i):r}function b(t,e,n){return Math.max(Math.min(t,n),e)}function _(t){return(t%=360)<0?t+360:t}function k(t){return I[~~(4*_(t))]}function M(t){return E[~~(4*_(t))]}const A=1440,z=2*Math.PI/A,I=new Float32Array(A),E=new Float32Array(A);for(let t=0;t<A;t++){const e=t*z;I[t]=Math.cos(e),E[t]=Math.sin(e)}const T=t=>{let e=180*t/Math.PI%360;return e<0?e+360:e},F=(t,e,n,i)=>Math.sqrt((n-t)*(n-t)+(i-e)*(i-e)),R=(t,e,n,i)=>T(Math.atan2(-(i-e),n-t));function C(t,e,n,i,o=!1){let s=t.x,r=t.y,a=e.x,c=e.y,l=n.x,u=n.y,h=i.x,f=i.y;if(s===a&&r===c||l===h&&u===f)return!1;let x=a-s,m=c-r,d=h-l,g=f-u,v=g*x-d*m;if(0===v)return!1;let p=(d*(r-u)-g*(s-l))/v,y=(x*(r-u)-m*(s-l))/v;return!(!o&&(y<0||y>1))&&{x:s+p*x,y:r+p*m}}function B(t,e,n,i,o){let s=k(o),r=M(o);return{x:s*(n-t)+r*(i-e)+t,y:s*(i-e)-r*(n-t)+e}}function P(t){return t.map((function(t){return t.slice()}))}Worker.createURL=function(t){const e="function"==typeof t?t.toString():t,n=new Blob(["'use strict';\nself.onmessage ="+e],{type:"text/javascript"});return window.URL.createObjectURL(n)},Worker.create=function(t){return new Worker(Worker.createURL(t))};const S=document.createElement("canvas");S.width=1,S.height=1;const X=S.getContext("2d");class U{constructor(t,e,n){if(isNaN(t)){this.hex=this.standardize(t);let e=this.hexToRgb(this.hex);this.r=e.r,this.g=e.g,this.b=e.b}else t=b(t,0,255),e=b(e,0,255),n=b(n,0,255),this.r=t,this.g=isNaN(e)?t:e,this.b=isNaN(n)?t:n,this.hex=this.rgbToHex(this.r,this.g,this.b);this.gl=[this.r/255,this.g/255,this.b/255,1]}rgbToHex(t,e,n){return"#"+(1<<24|t<<16|e<<8|n).toString(16).slice(1)}hexToRgb(t){t=t.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i,(function(t,e,n,i){return e+e+n+n+i+i}));let e=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(t);return e?{r:parseInt(e[1],16),g:parseInt(e[2],16),b:parseInt(e[3],16)}:null}standardize(t){return X.fillStyle=t,X.fillStyle}}function D(){!function(){if(!s)throw new Error("Canvas system is not ready. Call `load()` first.")}(),O.load()}const O={loaded:!1,isBlending:!1,currentColor:new U("white").gl,load(){if(!e[n].worker){const t=e[n];t.mask=new OffscreenCanvas(i,o),t.ctx=t.mask.getContext("2d"),t.ctx.lineWidth=0,t.offscreen=e[n].canvas.transferControlToOffscreen(),t.worker=Worker.create((function(t){let e,n;const i={};function o(){let t=s();const e=n.createFramebuffer();return n.bindFramebuffer(n.FRAMEBUFFER,e),n.framebufferTexture2D(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,t,0),{texture:t,fbo:e}}function s(){const t=n.createTexture();return n.bindTexture(n.TEXTURE_2D,t),n.texStorage2D(n.TEXTURE_2D,1,n.RGBA8,e.width,e.height),t}function r(){return self.navigator&&/Safari/.test(self.navigator.userAgent)&&!/Chrome/.test(self.navigator.userAgent)}onmessage=async t=>{if(t.data.canvas)e=t.data.canvas,function(){n=e.getContext("webgl2");const t=((t,e,n)=>{const i=t.createProgram();for(let[e,n]of[[t.VERTEX_SHADER,"#version 300 es\n    out vec2 p;void main(){vec3 v=vec3(-1);v[gl_VertexID]=3.;gl_Position=vec4(p=v.xy,0,1);}"],[t.FRAGMENT_SHADER,"#version 300 es\nprecision highp float;\nuniform vec4 u_addColor;\nuniform bool u_isErase;\nuniform bool u_isImage;\nuniform float u_flip;\nuniform bool u_isFBO;\nuniform sampler2D u_source,u_mask;\nin vec2 p;\nout vec4 outColor;\nfloat x(float v)\n{\n  return v<.04045?\n    v/12.92:\n    pow((v+.055)/1.055,2.4);\n}\nfloat f(float v)\n{\n  return v<.0031308?\n    v*12.92:\n    1.055*pow(v,1./2.4)-.055;\n}\nvec3 v(vec3 v)\n{\n  return vec3(x(v[0]),x(v[1]),x(v[2]));\n}\nvec3 n(vec3 v)\n{\n  return clamp(vec3(f(v[0]),f(v[1]),f(v[2])),0.,1.);\n}\nvoid f(vec3 e,out float m,out float f,out float v,out float u,out float r,out float x,out float z)\n{\n  m=min(e.x,min(e.y,e.z));\n  e-=m;\n  f=min(e.y,e.z);\n  v=min(e.x,e.z);\n  u=min(e.x,e.y);\n  r=min(max(0.,e.x-e.z),max(0.,e.x-e.y));\n  x=min(max(0.,e.y-e.z),max(0.,e.y-e.x));\n  z=min(max(0.,e.z-e.y),max(0.,e.z-e.x));\n}\nvoid f(vec3 v,inout float u[38])\n{\n  float e,o,x,m,z,w,y;\n  f(v,e,o,x,m,z,w,y);\n  u[0]=max(1e-4,e+o*.96853629+x*.51567122+m*.02055257+z*.03147571+w*.49108579+y*.97901834);\n  u[1]=max(1e-4,e+o*.96855103+x*.5401552+m*.02059936+z*.03146636+w*.46944057+y*.97901649);\n  u[2]=max(1e-4,e+o*.96859338+x*.62645502+m*.02062723+z*.03140624+w*.4016578+y*.97901118);\n  u[3]=max(1e-4,e+o*.96877345+x*.75595012+m*.02073387+z*.03119611+w*.2449042+y*.97892146);\n  u[4]=max(1e-4,e+o*.96942204+x*.92826996+m*.02114202+z*.03053888+w*.0682688+y*.97858555);\n  u[5]=max(1e-4,e+o*.97143709+x*.97223624+m*.02233154+z*.02856855+w*.02732883+y*.97743705);\n  u[6]=max(1e-4,e+o*.97541862+x*.98616174+m*.02556857+z*.02459485+w*.013606+y*.97428075);\n  u[7]=max(1e-4,e+o*.98074186+x*.98955255+m*.03330189+z*.0192952+w*.01000187+y*.96663223);\n  u[8]=max(1e-4,e+o*.98580992+x*.98676237+m*.05185294+z*.01423112+w*.01284127+y*.94822893);\n  u[9]=max(1e-4,e+o*.98971194+x*.97312575+m*.10087639+z*.01033111+w*.02636635+y*.89937713);\n  u[10]=max(1e-4,e+o*.99238027+x*.91944277+m*.24000413+z*.00765876+w*.07058713+y*.76070164);\n  u[11]=max(1e-4,e+o*.99409844+x*.32564851+m*.53589066+z*.00593693+w*.70421692+y*.4642044);\n  u[12]=max(1e-4,e+o*.995172+x*.13820628+m*.79874659+z*.00485616+w*.85473994+y*.20123039);\n  u[13]=max(1e-4,e+o*.99576545+x*.05015143+m*.91186529+z*.00426186+w*.95081565+y*.08808402);\n  u[14]=max(1e-4,e+o*.99593552+x*.02912336+m*.95399623+z*.00409039+w*.9717037+y*.04592894);\n  u[15]=max(1e-4,e+o*.99564041+x*.02421691+m*.97137099+z*.00438375+w*.97651888+y*.02860373);\n  u[16]=max(1e-4,e+o*.99464769+x*.02660696+m*.97939505+z*.00537525+w*.97429245+y*.02060067);\n  u[17]=max(1e-4,e+o*.99229579+x*.03407586+m*.98345207+z*.00772962+w*.97012917+y*.01656701);\n  u[18]=max(1e-4,e+o*.98638762+x*.04835936+m*.98553736+z*.0136612+w*.9425863+y*.01451549);\n  u[19]=max(1e-4,e+o*.96829712+x*.0001172+m*.98648905+z*.03181352+w*.99989207+y*.01357964);\n  u[20]=max(1e-4,e+o*.89228016+x*8.554e-5+m*.98674535+z*.10791525+w*.99989891+y*.01331243);\n  u[21]=max(1e-4,e+o*.53740239+x*.85267882+m*.98657555+z*.46249516+w*.13823139+y*.01347661);\n  u[22]=max(1e-4,e+o*.15360445+x*.93188793+m*.98611877+z*.84604333+w*.06968113+y*.01387181);\n  u[23]=max(1e-4,e+o*.05705719+x*.94810268+m*.98559942+z*.94275572+w*.05628787+y*.01435472);\n  u[24]=max(1e-4,e+o*.03126539+x*.94200977+m*.98507063+z*.96860996+w*.06111561+y*.01479836);\n  u[25]=max(1e-4,e+o*.02205445+x*.91478045+m*.98460039+z*.97783966+w*.08987709+y*.0151525);\n  u[26]=max(1e-4,e+o*.01802271+x*.87065445+m*.98425301+z*.98187757+w*.13656016+y*.01540513);\n  u[27]=max(1e-4,e+o*.0161346+x*.78827548+m*.98403909+z*.98377315+w*.22169624+y*.01557233);\n  u[28]=max(1e-4,e+o*.01520947+x*.65738359+m*.98388535+z*.98470202+w*.32176956+y*.0156571);\n  u[29]=max(1e-4,e+o*.01475977+x*.59909403+m*.98376116+z*.98515481+w*.36157329+y*.01571025);\n  u[30]=max(1e-4,e+o*.01454263+x*.56817268+m*.98368246+z*.98537114+w*.4836192+y*.01571916);\n  u[31]=max(1e-4,e+o*.01444459+x*.54031997+m*.98365023+z*.98546685+w*.46488579+y*.01572133);\n  u[32]=max(1e-4,e+o*.01439897+x*.52110241+m*.98361309+z*.98550011+w*.47440306+y*.01572502);\n  u[33]=max(1e-4,e+o*.0143762+x*.51041094+m*.98357259+z*.98551031+w*.4857699+y*.01571717);\n  u[34]=max(1e-4,e+o*.01436343+x*.50526577+m*.98353856+z*.98550741+w*.49267971+y*.01571905);\n  u[35]=max(1e-4,e+o*.01435687+x*.5025508+m*.98351247+z*.98551323+w*.49625685+y*.01571059);\n  u[36]=max(1e-4,e+o*.0143537+x*.50126452+m*.98350101+z*.98551563+w*.49807754+y*.01569728);\n  u[37]=max(1e-4,e+o*.01435408+x*.50083021+m*.98350852+z*.98551547+w*.49889859+y*.0157002);\n}\nvec3 w(vec3 e)\n{\n  mat3 u;\n  u[0]=vec3(3.24306333,-1.53837619,-.49893282);\n  u[1]=vec3(-.96896309,1.87542451,.04154303);\n  u[2]=vec3(.05568392,-.20417438,1.05799454);\n  float v=dot(u[0],e),x=dot(u[1],e),o=dot(u[2],e);\n  return n(vec3(v,x,o));\n}\nvec3 m(float u[38])\n{\n  return vec3(0)+u[0]*vec3(6.469e-5,1.84e-6,.00030502)+u[1]*vec3(.00021941,6.21e-6,.00103681)+u[2]*vec3(.00112057,3.101e-5,.00531314)+u[3]*vec3(.00376661,.00010475,.01795439)+u[4]*vec3(.01188055,.00035364,.05707758)+u[5]*vec3(.02328644,.00095147,.11365162)+u[6]*vec3(.03455942,.00228226,.17335873)+u[7]*vec3(.03722379,.00420733,.19620658)+u[8]*vec3(.03241838,.0066888,.18608237)+u[9]*vec3(.02123321,.0098884,.13995048)+u[10]*vec3(.01049099,.01524945,.08917453)+u[11]*vec3(.00329584,.02141831,.04789621)+u[12]*vec3(.00050704,.03342293,.02814563)+u[13]*vec3(.00094867,.05131001,.01613766)+u[14]*vec3(.00627372,.07040208,.0077591)+u[15]*vec3(.01686462,.08783871,.00429615)+u[16]*vec3(.02868965,.09424905,.00200551)+u[17]*vec3(.04267481,.09795667,.00086147)+u[18]*vec3(.05625475,.09415219,.00036904)+u[19]*vec3(.0694704,.08678102,.00019143)+u[20]*vec3(.08305315,.07885653,.00014956)+u[21]*vec3(.0861261,.0635267,9.231e-5)+u[22]*vec3(.09046614,.05374142,6.813e-5)+u[23]*vec3(.08500387,.04264606,2.883e-5)+u[24]*vec3(.07090667,.03161735,1.577e-5)+u[25]*vec3(.05062889,.02088521,3.94e-6)+u[26]*vec3(.03547396,.01386011,1.58e-6)+u[27]*vec3(.02146821,.00810264,0)+u[28]*vec3(.01251646,.0046301,0)+u[29]*vec3(.00680458,.00249138,0)+u[30]*vec3(.00346457,.0012593,0)+u[31]*vec3(.00149761,.00054165,0)+u[32]*vec3(.0007697,.00027795,0)+u[33]*vec3(.00040737,.00014711,0)+u[34]*vec3(.00016901,6.103e-5,0)+u[35]*vec3(9.522e-5,3.439e-5,0)+u[36]*vec3(4.903e-5,1.771e-5,0)+u[37]*vec3(2e-5,7.22e-6,0);\n}\nfloat f(float x,float z,float v)\n{\n  z*=pow(v,2.);\n  return z/(x*pow(1.-v,2.)+z);\n}\nvec3 m(vec3 e,vec3 z,float u)\n{\n  float o[38],x[38];\n  f(v(e),o);\n  f(v(z),x);\n  float r=m(o)[1],y=m(x)[1];\n  u=f(r,y,u);\n  float i[38];\n  for(int e=0;e<38;e++)\n    {\n      float v=(1.-u)*(pow(1.-o[e],2.)/(2.*o[e]))+u*(pow(1.-x[e],2.)/(2.*x[e]));\n      i[e]=1.+v-sqrt(pow(v,2.)+2.*v);\n    }\n  return w(m(i));\n}\nvec4 m(vec4 v,vec4 e,float f)\n{\n  return vec4(m(v.xyz,e.xyz,f),mix(v.w,e.w,f));\n}\nvoid main()\n{\n  vec2 e=.5*vec2(p.x,u_flip*p.y)+.5;\n  vec4 v=texture(u_source,e);\n  if(u_isFBO)\n    outColor=v;\n  else if(u_isImage) \n    {\n    outColor = texture(u_mask,e);\n    }\n  else\n    {\n      vec4 f=texture(u_mask,e);\n      if(f.x>0.)\n        {\n          vec4 e=vec4(u_addColor.xyz,1);\n          if(f.w>.7&&!u_isErase)\n            {\n              float v=.5*(f.w-.7);\n              e=e*(1.-v)-vec4(.5)*v;\n            }\n          vec3 u=m(v.xyz,e.xyz,f.w);\n          outColor=vec4(u,1);\n        }\n      else\n         outColor=v;\n    }\n}"]]){const o=t.createShader(e);t.shaderSource(o,n),t.compileShader(o),t.attachShader(i,o)}return t.linkProgram(i),i})(n);let r=["u_flip","u_addColor","u_isErase","u_isFBO","u_source","u_mask","u_isImage"];for(let e of r)i[e]=n.getUniformLocation(t,e);n.useProgram(t),i.mask=s(),i.source=o(),i.target=o(),n.activeTexture(n.TEXTURE0),n.bindTexture(n.TEXTURE_2D,i.source.texture),n.activeTexture(n.TEXTURE1),n.bindTexture(n.TEXTURE_2D,i.mask),n.uniform1i(i.u_source,0),n.uniform1i(i.u_mask,1)}(),n.bindFramebuffer(n.DRAW_FRAMEBUFFER,i.source.fbo),n.clearColor(1,1,1,0),n.clear(n.COLOR_BUFFER_BIT|n.DEPTH_BUFFER_BIT);else if(t.data.isBG)n.bindFramebuffer(n.DRAW_FRAMEBUFFER,i.source.fbo),n.clearColor(...t.data.color),n.clear(n.COLOR_BUFFER_BIT|n.DEPTH_BUFFER_BIT);else if(t.data.mask)!function(t){let o;if(r()){const e=new OffscreenCanvas(t.mask.width,t.mask.height).getContext("2d");e.drawImage(t.mask,0,0),o=e.getImageData(0,0,t.mask.width,t.mask.height)}n.texSubImage2D(n.TEXTURE_2D,0,0,0,n.RGBA,n.UNSIGNED_BYTE,r()?o:t.mask),t.mask.close(),n.bindFramebuffer(n.DRAW_FRAMEBUFFER,i.target.fbo),n.uniform1f(i.u_flip,1),n.uniform1i(i.u_isFBO,!1),n.uniform1i(i.u_isImage,!!t.isImage),t.isImage||(n.uniform1i(i.u_isImage,!1),n.uniform4f(i.u_addColor,...t.addColor),n.uniform1i(i.u_isErase,!!t.isErase)),n.drawArrays(n.TRIANGLES,0,3),n.bindFramebuffer(n.READ_FRAMEBUFFER,i.target.fbo),n.bindFramebuffer(n.DRAW_FRAMEBUFFER,i.source.fbo),n.blitFramebuffer(0,0,e.width,e.height,0,0,e.width,e.height,n.COLOR_BUFFER_BIT,n.NEAREST),n.invalidateFramebuffer(n.READ_FRAMEBUFFER,[n.COLOR_ATTACHMENT0]),t.isLast&&!t.sp&&(n.bindFramebuffer(n.FRAMEBUFFER,null),n.uniform1i(i.u_isImage,!1),n.uniform1i(i.u_isFBO,!0),n.uniform1f(i.u_flip,-1),n.drawArrays(n.TRIANGLES,0,3))}(t.data);else if(t.data.get){let t=await createImageBitmap(e);postMessage({canvas:t},[t]),t.close()}}})),t.worker.postMessage("init"),t.worker.postMessage({canvas:t.offscreen},[t.offscreen])}this.mask=e[n].mask,this.ctx=e[n].ctx,this.worker=e[n].worker},blend(t=!1,e=!1,n=!1,i=!1){D(),!this.isBlending&&t&&(this.currentColor=t.gl,this.isBlending=!0);const o=t?t.gl:this.currentColor;if(e||n||o.toString()!==this.currentColor.toString()){const o=n||this.mask.transferToImageBitmap();this.worker.postMessage({addColor:this.currentColor,mask:o,isLast:e,isErase:this.isErase,isImage:Boolean(n),sp:i},[o]),this.isErase=!1,e||(this.currentColor=t.gl),e&&!i&&(this.isBlending=!1)}}};let Y=new U("white");const W={x:0,y:0};let N=!1;function L(){N||(D(),H=.01*i,G=-.5*i,j=-.5*o,$=Math.round(2*i/H),V=Math.round(2*o/H),Q("curved",(function(e,n){const i=v(-20,-10)*(v(0,100)%2==0?-1:1),o=.03*e;for(let e=0;e<$;e++){const s=.01*e+o;for(let r=0;r<V;r++){const a=t.noise(s,.01*r+o);n[e][r]=w(a,0,1,-i,i)}}return n})),Q("hand",(function(e,n){const i=g(.2,.8),o=v(5,10),s=.1*e;for(let r=0;r<$;r++){const a=.1*r+s;for(let c=0;c<V;c++){const l=o*M(i*c*r+v(15,25)),u=t.noise(a,.1*c+s);n[r][c]=.5*l*k(e)+u*o*.5}}return n})),Q("seabed",(function(t,e){const n=g(.4,.8),i=v(18,26);for(let o=0;o<$;o++)for(let s=0;s<V;s++){const r=i*M(n*s*o+v(15,20));e[o][s]=1.1*r*k(t)}return e})),Z.genField(),N=!0)}class q{constructor(t,e){this.update(t,e),this.plotted=0}update(t,e){this.x=t,this.y=e,this.column_index=q.getColIndex(t),this.row_index=q.getRowIndex(e)}reset(){this.plotted=0}isIn(){return r.field.isActive?q.isIn(this.column_index,this.row_index):this.isInCanvas(this.x,this.y)}isInCanvas(){const t=i,e=o,n=this.x+W.x,s=this.y+W.y;return n>=-.3*t&&n<=1.3*t&&s>=-.3*e&&s<=1.3*e}angle(){return this.isIn()&&r.field.isActive?J.get(r.field.current).field[this.column_index][this.row_index]:0}moveTo(t,e,n,i=!0){if(!this.isIn())return void(this.plotted+=n);let o,s;for(let r=0;r<t/n;r++){if(i){const t=this.angle();o=k(t-e),s=M(t-e)}else o=k(-e),s=M(-e);const t=n*o,r=n*s;this.plotted+=n,this.update(this.x+t,this.y+r)}}plotTo(t,e,n,i){if(!this.isIn())return void(this.plotted+=n/i);const o=1/i;for(let i=0;i<e/n;i++){const e=this.angle(),i=t.angle(this.plotted),s=n*k(e-i),r=n*M(e-i);this.plotted+=n*o,this.update(this.x+s,this.y+r)}}static getRowIndex(t){const e=t+W.y-j;return Math.round(e/H)}static getColIndex(t){const e=t+W.x-G;return Math.round(e/H)}static isIn(t,e){return t>=0&&e>=0&&t<$&&e<V}}r.field={isActive:!1,current:null};let H,G,j,$,V,J=new Map;function K(){return new Array($).fill(null).map((()=>new Float32Array(V)))}function Q(t,e){J.set(t,{gen:e}),J.get(t).field=J.get(t).gen(0,K())}const Z={genField(){this.field=K(),this.fieldTemp=K()},get(t,e,n=!1){const i=q.getColIndex(t),o=q.getRowIndex(e),s=this.field?.[i]?.[o]??0;if(n){const t=Math.max(s,n),e=.75*(this.fieldTemp[i]?.[o]??0);return this.fieldTemp[i][o]=Math.max(t,e),t}return s},update(){for(let t=0;t<$;t++)for(let e=0;e<V;e++)this.field[t][e]=this.fieldTemp[t][e]},save(){this.A=P(this.field),this.B=P(this.fieldTemp)},restore(){this.field=this.A,this.fieldTemp=this.B}};let tt={};function et(t){O.ctx.beginPath(),t.forEach(((t,e)=>{0===e?O.ctx.moveTo(t.x,t.y):O.ctx.lineTo(t.x,t.y)})),O.ctx.closePath()}function nt(t,e,n){const i=n/1.2;O.ctx.rect(t-i/2,e-i/2,i,i)}const it=2*Math.PI;function ot(t,e,n){const i=n/2;O.ctx.moveTo(t+i,e),O.ctx.arc(t,e,i,0,it)}const st={isActive:!1,c:null,a:255};function rt(t){Mix.blend(st.c),Mix.isErase=!0,Mix.ctx.save(),Mix.ctx.fillStyle="rgb(255 0 0 / "+st.a+"%)",et(t),Mix.ctx.fill(),Mix.ctx.restore()}class at{constructor(t,e=!1){this.a=t,this.vertices=e?t:t.map((([t,e])=>({x:t,y:e}))),this.sides=this.vertices.map(((t,e,n)=>[t,n[(e+1)%n.length]])),this._intersectionCache={}}intersect(t){const e=`${t.point1.x},${t.point1.y}-${t.point2.x},${t.point2.y}`;if(this._intersectionCache[e])return this._intersectionCache[e];const n=[];for(const[e,i]of this.sides){const o=C(t.point1,t.point2,e,i);o&&n.push(o)}return this._intersectionCache[e]=n,n}erase(){st.isActive&&rt(this.vertices)}show(){r.draw&&this.draw(),r.hatch&&this.hatch(),r.fill&&this.fill(),this.erase()}}class ct{constructor(t){this.segments=[],this.angles=[],this.pres=[],this.type=t,this.dir=0,this.calcIndex(0),this.pol=!1}addSegment(t=0,e=0,n=1,i=!1){this.angles.length>0&&this.angles.pop(),t=i?(t%360+360)%360:T(t),this.angles.push(t,t),this.pres.push(n),this.segments.push(e),this.length=this.segments.reduce(((t,e)=>t+e),0)}endPlot(t=0,e=1,n=!1){t=n?(t%360+360)%360:T(t),this.angles[this.angles.length-1]=t,this.pres.push(e)}rotate(t){this.dir=T(t)}pressure(t){return t>this.length?this.pres[this.pres.length-1]:this.curving(this.pres,t)}angle(t){return t>this.length?this.angles[this.angles.length-1]:(this.calcIndex(t),"curve"===this.type?this.curving(this.angles,t)+this.dir:this.angles[this.index]+this.dir)}curving(t,e){let n=t[this.index],i=t[this.index+1]??n;return Math.abs(i-n)>180&&(i>n?i=-(360-i):n=-(360-n)),w(e-this.suma,0,this.segments[this.index],n,i,!0)}calcIndex(t){this.index=-1,this.suma=0;let e=0;for(;e<=t;)this.suma=e,e+=this.segments[this.index+1],this.index++;return this.index}genPol(t,e,n=1,i){L();const o=.5,s=[],r=Math.round(this.length/o),a=new q(t,e);let c=0,l=0;for(let t=0;t<r;t++){a.plotTo(this,o,o,1);const t=this.calcIndex(a.plotted);c+=o,(c>=this.segments[t]*i*g(.7,1.3)||t>=l)&&a.x&&(s.push([a.x,a.y]),c=0,t>=l&&l++)}return new at(s)}erase(t,e,n){st.isActive&&(this.origin&&([t,e,n]=[...this.origin,1]),this.pol=this.genPol(t,e,n,.15),rt(this.pol.vertices))}show(t,e,n=1){r.stroke&&this.draw(t,e,n),r.hatch&&this.hatch(t,e,n),r.fill&&this.fill(t,e,n),this.erase(t,e,n)}}let lt,ut,ht,ft,xt;class mt{constructor(){this.isClosed=!1,this.curvature=ht,this.vert=[]}vertex(t,e,n){this.vert.push([t,e,n])}show(){bt(this.vert,this.curvature,this.isClosed).show()}}function dt(t=0){ht=b(t,0,1),lt=[]}function gt(t,e,n=1){ut=new mt,lt.push(ut),ut.vertex(t,e,n)}function vt(t,e,n=1){ut.vertex(t,e,n)}function pt(){ut.vertex(...ut.vert[0]),ut.isClosed=!0}function yt(){for(let t of lt)t.show();lt=!1}const wt=2*Math.PI;function bt(t,e=.5,n=!1){const i=new ct(0===e?"segments":"curve");if(n&&0!==e&&t.push(t[1]),t&&t.length>0){let o,s,r,a=0;for(let c=0;c<t.length-1;c++)if(e>0&&c<t.length-2){const l=t[c],u=t[c+1],h=t[c+2],f=F(l[0],l[1],u[0],u[1]),x=F(u[0],u[1],h[0],h[1]),m=R(l[0],l[1],u[0],u[1]),d=R(u[0],u[1],h[0],h[1]),g=e*Math.min(f,x,.5*Math.min(f,x)),v=Math.max(f,x),p=f-g,y=x-g;if(Math.floor(m)===Math.floor(d)){const e=n&&0===c?0:f-a,h=n?0===c?0:x-r:x;i.addSegment(m,e,l[2],!0),c===t.length-3&&i.addSegment(d,h,u[2],!0),a=0,0===c&&(o=f,r=g,s=t[1],a=0)}else{const e={x:u[0]-g*k(-m),y:u[1]-g*M(-m)},h={x:e.x+v*k(90-m),y:e.y+v*M(90-m)},f={x:u[0]+g*k(-d),y:u[1]+g*M(-d)},x=C(e,h,f,{x:f.x+v*k(90-d),y:f.y+v*M(90-d)},!0),w=F(e.x,e.y,x.x,x.y),b=F(e.x,e.y,f.x,f.y)/2,_=2*Math.asin(b/w)*(180/Math.PI),A=wt*w*_/360,z=n&&0===c?0:p-a,I=c===t.length-3?n?o-g:y:0;i.addSegment(m,z,l[2],!0),i.addSegment(m,isNaN(A)?0:A,l[2],!0),i.addSegment(d,I,u[2],!0),a=g,0===c&&(o=p,r=g,s=[e.x,e.y])}c===t.length-3&&i.endPlot(d,u[2],!0)}else if(0===e){const e=t[c],n=t[c+1],o=F(e[0],e[1],n[0],n[1]),s=R(e[0],e[1],n[0],n[1]);i.addSegment(s,o,n[2],!0),c===t.length-2&&i.endPlot(s,1,!0)}i.origin=n&&0!==e?s:t[0]}return i}let _t,kt=0,Mt=!0,At=30;t.frameCount=0;let zt=t=>(t&&(At=t),At);function It(e){Mt&&(e>kt+1e3/zt()||0===e)&&(kt=e,t.frameCount++,_t&&_t(),Et()),requestAnimationFrame(It)}function Et(){O.blend(!1,!0)}const Tt=2*Math.PI;r.stroke={color:new U("black"),weight:1,clipWindow:null,type:"HB",isActive:!1};let Ft,Rt,Ct,Bt,Pt,St,Xt=new Map;function Ut(){return{...r.stroke}}function Dt(t){r.stroke={...t}}function Ot(t,e){e.type=["marker","custom","image","spray"].includes(e.type)?e.type:"default",Xt.set(t,{param:e,colors:[],buffers:[]})}function Yt(t){Xt.has(t)&&(r.stroke.type=t)}function Wt(t,e,n){r.stroke.color=new U(...arguments),r.stroke.isActive=!0}function Nt(t){r.stroke.weight=t}function Lt(t,e,n=1){Yt(t),Wt(e),Nt(n)}function qt(t,e,n,i,o){Ft=new q(t,e),Rt=n,Ct=i,Bt=o,Bt&&Bt.calcIndex(0)}function Ht(t,e){e||(Pt=t),function(){Gt.seed=99999*g();const{param:t}=Xt.get(r.stroke.type)??{};if(!t)return;Gt.p=t;const{pressure:e}=t;var n;Gt.a="custom"!==e.type?g(-1,1):0,Gt.b="custom"!==e.type?g(1,1.5):0,Gt.cp="custom"!==e.type?g(3,3.5):g(-.2,.2),[Gt.min,Gt.max]=e.min_max,O.blend(r.stroke.color),O.ctx.save(),te(),St=Kt(),n=St,O.ctx.fillStyle="rgb(255 0 0 / "+n+"%)",O.ctx.beginPath()}();const n=function(){const{param:t}=Xt.get(r.stroke.type)??{};return t?"default"===t.type||"spray"===t.type?t.spacing/r.stroke.weight:t.spacing:1}(),i=Math.round(Rt*(e?t:1)/n);for(let o=0;o<i;o++)jt(),e?Ft.plotTo(Bt,n,n,t,o<10):Ft.moveTo(n,t,n,Ct);O.ctx.fill(),te(),O.ctx.restore()}const Gt={};function jt(e=!1){if(!Qt())return;let n=e||$t();switch(n*=1-.3*t.noise(.007*Ft.x+Gt.seed,.007*Ft.y+Gt.seed)-.1*t.noise(.002*Ft.x,.002*Ft.y),Gt.p.type){case"spray":!function(t){const e=r.stroke.weight*Gt.p.vibration*t+r.stroke.weight*p()*Gt.p.vibration/3,n=r.stroke.weight*g(.9,1.1),i=Math.ceil(Gt.p.quality/t);for(let t=0;t<i;t++){const t=g(.9,1.1),i=t*e*g(-1,1),o=g(-1,1),s=Math.sqrt((t*e)**2-i**2);nt(Ft.x+i,Ft.y+o*s,n)}}(n);break;case"marker":Zt(n);break;case"custom":case"image":!function(t,e,n=!0){O.ctx.save();const i=n?r.stroke.weight*Gt.p.vibration:0,o=n?i*g(-1,1):0,s=n?i*g(-1,1):0;O.ctx.translate(Ft.x+o,Ft.y+s),function(t,e){O.ctx.scale(t,t);let n=0;"random"===Gt.p.rotate?n=v(0,Tt):"natural"===Gt.p.rotate&&(n=(Bt?-Bt.angle(Ft.plotted):-Pt)+(Ct?Ft.angle():0),n=n*Math.PI/180),O.ctx.rotate(n)}(r.stroke.weight*t),Gt.p.tip(O.ctx),O.ctx.restore()}(n);break;default:!function(t){const e=r.stroke.weight*Gt.p.vibration*(Gt.p.definition+(1-Gt.p.definition)*p()*Jt(.5,.9,5,.2,1.2)/t);g(0,Gt.p.quality*t)>.4&&nt(Ft.x+.7*e*g(-1,1),Ft.y+e*g(-1,1),t*Gt.p.weight*g(.85,1.15))}(n)}}function $t(){return Bt?Vt()*Bt.pressure(Ft.plotted):Vt()}function Vt(){return"custom"===Gt.p.pressure.type?w(Gt.p.pressure.curve(Ft.plotted/Rt)+Gt.cp,0,1,Gt.min,Gt.max,!0):Jt()}function Jt(t=.5+Gt.p.pressure.curve[0]*Gt.a,e=1-Gt.p.pressure.curve[1]*Gt.b,n=Gt.cp,i=Gt.min,o=Gt.max){return w(1/(1+Math.pow(Math.abs((Ft.plotted-t*Rt)/(e*Rt/2)),2*n)),0,1,i,o)}function Kt(){return["default","spray"].includes(Gt.p.type)?Gt.p.opacity:Gt.p.opacity/r.stroke.weight}function Qt(){if(r.stroke.clipWindow)return Ft.x>=r.stroke.clipWindow[0]&&Ft.x<=r.stroke.clipWindow[2]&&Ft.y>=r.stroke.clipWindow[1]&&Ft.y<=r.stroke.clipWindow[3];{let t=i,e=o,n=.05*i,s=Ft.x+W.x,r=Ft.y+W.y;return s>=-n&&s<=t+n&&r>=-n&&r<=e+n}}function Zt(t,e=!0){const n=e?r.stroke.weight*Gt.p.vibration:0,i=e?n*g(-1,1):0,o=e?n*g(-1,1):0;ot(Ft.x+i,Ft.y+o,r.stroke.weight*Gt.p.weight*t)}function te(){if(Qt()){let t=$t(),e=Kt();if(O.ctx.fillStyle="rgb(255 0 0 / "+e/3+"%)","marker"===Gt.p.type)for(let e=1;e<5;e++)O.ctx.beginPath(),Zt(t*e/5,!1),O.ctx.fill();else if("custom"===Gt.p.type||"image"===Gt.p.type)for(let n=1;n<5;n++)O.ctx.beginPath(),Gt.drawCustomOrImage(t*n/5,e,!1),O.ctx.fill()}}function ee(t,e,n,i){L();let o=F(t,e,n,i);0!=o&&(qt(t,e,o,!0,!1),Ht(R(t,e,n,i),!1))}const ne=["weight","vibration","definition","quality","opacity","spacing","pressure","type","tip","rotate"],ie=[["pen",[.35,.12,.5,8,88,.3,{curve:[.15,.2],min_max:[1.4,.9]}]],["rotring",[.2,.05,.5,30,115,.15,{curve:[.35,.2],min_max:[1.3,.9]}]],["2B",[.35,.6,.1,8,140,.2,{curve:[.15,.2],min_max:[1.5,1]}]],["HB",[.3,.5,.4,4,130,.25,{curve:[.15,.2],min_max:[1.2,.9]}]],["2H",[.2,.4,.3,2,60,.2,{curve:[.15,.2],min_max:[1.2,.9]}]],["cpencil",[.4,.55,.8,7,70,.15,{curve:[.15,.2],min_max:[.95,1.2]}]],["charcoal",[.35,1.5,.65,300,80,.06,{curve:[.15,.2],min_max:[1.3,.9]}]],["crayon",[.25,2,.8,300,60,.06,{curve:[.35,.2],min_max:[.9,1.1]}]],["spray",[.2,12,15,40,35,.65,{curve:[0,.1],min_max:[1,1]},"spray"]],["marker",[2.5,.12,null,null,25,.4,{curve:[.35,.25],min_max:[1.5,1]},"marker"]]];for(let t of ie){let e={};for(let n=0;n<t[1].length;n++)e[ne[n]]=t[1][n];Ot(t[0],e)}function oe(){return{...r.hatch}}function se(t=5,e=45,n={rand:!1,continuous:!1,gradient:!1}){let i=r.hatch;i.isActive=!0,i.dist=t,i.angle=e,i.options=n}function re(t){let e=r.hatch.dist,n=r.hatch.angle,i=r.hatch.options,o=Ut();r.hatch.hBrush&&Lt(...Object.values(r.hatch.hBrush)),n=T(n)%180,Array.isArray(t)||(t=[t]);const s=function(t){let e={minX:Infinity,minY:Infinity,maxX:-Infinity,maxY:-Infinity};for(let n of t){const t=ae(n);e.minX=Math.min(e.minX,t.minX),e.minY=Math.min(e.minY,t.minY),e.maxX=Math.max(e.maxX,t.maxX),e.maxY=Math.max(e.maxY,t.maxY)}return e}(t);let a=new at([[s.minX,s.minY],[s.maxX,s.minY],[s.maxX,s.maxY],[s.minX,s.maxY]]),c=n<=90&&n>=0?s.minY:s.maxY,l=i.gradient?w(i.gradient,0,1,1,1.1,!0):1,u=[],h=0,f=e,x=t=>({point1:{x:s.minX+f*t*k(90-n),y:c+f*t*M(90-n)},point2:{x:s.minX+f*t*k(90-n)+k(-n),y:c+f*t*M(90-n)+M(-n)}});for(;a.intersect(x(h)).length>0;){let e=[];for(let n of t)e.push(n.intersect(x(h)));u[h]=e.flat().sort(((t,e)=>t.x===e.x?t.y-e.y:t.x-e.x)),f*=l,h++}let m=[];for(let t of u)void 0!==t[0]&&m.push(t);let d=i.rand?i.rand:0;for(let t=0;t<m.length;t++){let n=m[t],o=t>0&&i.continuous;for(let i=0;i<n.length-1;i+=2)0!==d&&(n[i].x+=d*e*g(-10,10),n[i].y+=d*e*g(-10,10),n[i+1].x+=d*e*g(-10,10),n[i+1].y+=d*e*g(-10,10)),ee(n[i].x,n[i].y,n[i+1].x,n[i+1].y),o&&ee(m[t-1][1].x,m[t-1][1].y,n[i].x,n[i].y)}Dt(o)}function ae(t){if(t._boundingBox)return t._boundingBox;let e=Infinity,n=Infinity,i=-Infinity,o=-Infinity;for(let s=0;s<t.a.length;s++){const[r,a]=t.a[s];r<e&&(e=r),r>i&&(i=r),a<n&&(n=a),a>o&&(o=a)}return t._boundingBox={minX:e,minY:n,maxX:i,maxY:o},t._boundingBox}function ce(){return{...r.fill}}function le(t,e,n,i){r.fill.opacity=arguments.length<4?e:i,r.fill.color=arguments.length<3?new U(t):new U(t,e,n),r.fill.isActive=!0}function ue(t,e="out"){r.fill.bleed_strength=b(t,0,1),r.fill.direction=e}function he(t=.4,e=.4){r.fill.texture_strength=b(t,0,1),r.fill.border_strength=b(e,0,1)}let fe;at.prototype.draw=function(t=!1,e,n){let i=Ut();if(t&&Lt(t,e,n),i.isActive)for(let t of this.sides)ee(t[0].x,t[0].y,t[1].x,t[1].y);Dt(i)},ct.prototype.draw=function(t,e,n){Ut().isActive&&(this.origin&&(t=this.origin[0],e=this.origin[1],n=1),function(t,e,n,i){L(),qt(e,n,t.length,!0,t),Ht(i,!0)}(this,t,e,n))},r.hatch={isActive:!1,dist:5,angle:45,options:{},hBrush:!1},at.prototype.hatch=function(t=!1,e,n){let i=oe();t&&se(t,e,n),i.isActive&&re(this),function(t){r.hatch={...t}}(i)},ct.prototype.hatch=function(t,e,n){oe().isActive&&(this.origin&&(t=this.origin[0],e=this.origin[1],n=1),this.pol=this.genPol(t,e,n,.25),this.pol.hatch())},r.fill={color:new U("#002185"),opacity:60,bleed_strength:.07,texture_strength:.4,border_strength:.4,direction:"out",isActive:!1};class xe{constructor(t,e,n,i,o=!1){this.v=t,this.dir=i,this.m=e,this.midP=n,this.sizeX=-Infinity,this.sizeY=-Infinity;for(let t of this.v)this.sizeX=Math.max(Math.abs(this.midP.x-t.x),this.sizeX),this.sizeY=Math.max(Math.abs(this.midP.y-t.y),this.sizeY);if(o)for(let t=0;t<this.v.length;t++){const e=this.v[t],n=this.v[(t+1)%this.v.length],i={x:n.x-e.x,y:n.y-e.y},o=B(0,0,i.x,i.y,90);let s={point1:{x:e.x+i.x/2,y:e.y+i.y/2},point2:{x:e.x+i.x/2+o.x,y:e.y+i.y/2+o.y}};const r=(t,e,n)=>(e.x-t.x)*(n.y-t.y)-(e.y-t.y)*(n.x-t.x)>.01;let a=0;for(let t of fe.intersect(s))r(e,n,t)&&a++;this.dir[t]=a%2==0}}trim(t=1){let e=[...this.v],n=[...this.m],i=[...this.dir];if(this.v.length>8&&t>=0&&1!==t){let o=~~((1-t)*this.v.length),s=~~this.v.length/2-~~o/2;e.splice(s,o),n.splice(s,o),i.splice(s,o)}return{v:e,m:n,dir:i}}grow(t=1,e){const n=[],i=[],o=[],s=this.trim(t),a=s.v,c=s.m,l=s.dir,u=a.length,h=e?-.5:1,f="out"===r.fill.direction?-90:90;let x=!1;switch(t){case 999:x=g(.2,.4);break;case 997:x=r.fill.bleed_strength/1.7}for(let t=0;t<u;t++){const e=a[t],s=a[(t+1)%u];let r=x||Z.get(e.x,e.y,c[t]);r*=h;let d={x:s.x-e.x,y:s.y-e.y},v=(l[t]?f:-f)+45*g(-.4,.4),y=B(0,0,d.x,d.y,v),w=g(.35,.65),b=p(.5,.2)*g(.65,1.35)*r,_={x:e.x+d.x*w+y.x*b,y:e.y+d.y*w+y.y*b};n.push(e,_),i.push(c[t],c[t]+function(t=0,e=1){return t-2*e+(m()+m()+m())/3*e*4}(0,.02)),o.push(l[t],l[t])}return new xe(n,i,this.midP,o)}fill(t,e,n){const i=3*n,o=1.5*e;O.blend(t),O.ctx.save(),O.ctx.fillStyle="rgb(255 0 0 / "+o+"%)",O.ctx.strokeStyle="rgb(255 0 0 / "+.008*r.fill.border_strength+")";let s,a=this.grow();for(let n=0;n<24;n++){n%4==0&&(a=a.grow()),s=[a.grow(1-.0125*n),a.grow(.7-.0125*n),a.grow(.4-.0125*n)];for(let t of s)t.grow(997).grow().layer(n);a.grow(.1).grow(999).layer(n),0!==i&&n%2==0&&a.erase(5*i,e),n%6==0&&O.blend(t,!0,!1,!0)}Z.update(),O.ctx.restore()}layer(t){const e=Math.max(this.sizeX,this.sizeY);O.ctx.lineWidth=w(t,0,24,e/30,e/45,!0),et(this.v),O.ctx.stroke(),O.ctx.fill()}erase(t,e){O.ctx.save();const n=g(40,60)*w(t,0,1,2,3),i=this.sizeX/2,o=this.sizeY/2,s=Math.min(this.sizeX,this.sizeY)*(1.4-r.fill.bleed_strength),a=.03*s,c=.25*s,l=this.midP.x,u=this.midP.y;O.ctx.globalCompositeOperation="destination-out";let h=(5-w(e,80,120,.3,2,!0))*t;O.ctx.fillStyle="rgb(255 0 0 / "+h/255+")",O.ctx.lineWidth=0;for(let t=0;t<n;t++){const e=l+p(0,i),n=u+p(0,o),s=g(a,c);O.ctx.beginPath(),ot(e,n,s),t%4!=0&&O.ctx.fill()}O.ctx.globalCompositeOperation="source-over",O.ctx.restore()}}at.prototype.fill=function(t=!1,e,n,i,o,s){let a=ce();t&&(le(t,e),ue(n,s),he(i,o)),a.isActive&&(L(),function(t){fe=t;let e=[...t.vertices];const n=e.length,i=.25*n*y({1:5,2:10,3:60}),o=r.fill.bleed_strength;let s=e.map(((t,e)=>{let n=g(.85,1.2)*o;return e>i?n:.2*n})),a=v(0,n);e=[...e.slice(a),...e.slice(0,a)],new xe(e,s,function(t){var e=(t=[...t])[0],n=t[t.length-1];e.x==n.x&&e.y==n.y||t.push(e);for(var i,o,s,r=0,a=0,c=0,l=t.length,u=0,h=l-1;u<l;h=u++)i=t[u],o=t[h],r+=s=(i.y-e.y)*(o.x-e.x)-(o.y-e.y)*(i.x-e.x),a+=(i.x+o.x-2*e.x)*s,c+=(i.y+o.y-2*e.y)*s;return{x:a/(s=3*r)+e.x,y:c/s+e.y}}(e),[],!0).fill(r.fill.color,w(r.fill.opacity,0,100,0,1,!0),r.fill.texture_strength,!0)}(this)),function(t){r.fill={...t}}(a)},ct.prototype.fill=function(t,e,n){ce().isActive&&(this.origin&&(t=this.origin[0],e=this.origin[1],n=1),this.pol=this.genPol(t,e,n,3*r.fill.bleed_strength),this.pol.fill())},t.Color=U,t.Plot=ct,t.Polygon=at,t.Position=q,t.add=Ot,t.addField=Q,t.arc=function(t,e,n,i,o){const s=new ct("curve"),r=270-T(i),a=270-T(o),c=T(o-i),l=Math.PI*n*c/180;s.addSegment(r,l,1,!0),s.endPlot(a,1,!0);const u=t+n*k(-r-90),h=e+n*M(-r-90);s.draw(u,h,1)},t.background=function(t,e,n){D(),Y=new U(...arguments),O.worker.postMessage({color:Y.gl,isBG:!0})},t.beginPath=dt,t.beginStroke=function(t,e,n){xt=[e,n],ft=new ct(t)},t.box=function(){return[...Xt.keys()]},t.circle=function(t,e,n,i=!1){const o=new ct("curve"),s=Math.PI*n,r=g(0,360),a=i?()=>1+.2*g():()=>1;for(let t=0;t<4;t++){const e=-90*t+r;o.addSegment(e*a(),s/2*a(),1,!0)}if(i){const t=v(-5,5);o.addSegment(r,Math.abs(t)*(Math.PI/180)*n,1,!0),o.endPlot(t+r,1,!0)}else o.endPlot(r,1,!0);const c=t-n*M(r),l=e-n*k(-r);o.show(c,l,1)},t.clip=function(t){r.stroke.clipWindow=t},t.closePath=pt,t.draw=Et,t.drawImage=function(t,e=0,n=0,i=t.width,o=t.height){D(),"[object ImageBitmap]"===Object.prototype.toString.call(t)&&0===e||(O.ctx.drawImage(t,e,n,i,o),t=O.mask.transferToImageBitmap()),O.blend(!1,!1,t)},t.endPath=yt,t.endStroke=function(t,e){ft.endPlot(t,e),ft.draw(xt[0],xt[1],1),ft=!1},t.erase=function(t=_bg_Color,e=255){st.isActive=!0,st.c=new U(t),st.a=e},t.field=function(t){if(!J.has(t))throw new Error(`Field "${name}" does not exist.`);r.field.isActive=!0,r.field.current=t},t.fillBleed=ue,t.fillStyle=le,t.fillTexture=he,t.frameRate=zt,t.getCanvas=async function(){return D(),new Promise((t=>{O.worker.postMessage({get:!0}),O.worker.onmessage=e=>{0!==e.data&&t(e.data.canvas)}}))},t.hatch=se,t.hatchArray=re,t.hatchStyle=function(t,e="black",n=1){r.hatch.hBrush={brush:t,color:e,weight:n}},t.line=ee,t.lineTo=vt,t.lineWidth=Nt,t.listFields=function(){return Array.from(J.keys())},t.load=function(t,r){n=t,e[n]||(e[n]={canvas:r}),i=e[n].canvas.width,o=e[n].canvas.height,s||(s=!0)},t.loop=function(t=!1){t&&(_t=t),Mt=!0,requestAnimationFrame(It)},t.move=function(t,e,n){ft.addSegment(t,e,n)},t.moveTo=gt,t.noClip=function(){r.stroke.clipWindow=null},t.noErase=function(){st.isActive=!1},t.noField=function(){r.field.isActive=!1},t.noFill=function(){r.fill.isActive=!1},t.noHatch=function(){r.hatch.isActive=!1,r.hatch.hBrush=!1},t.noLoop=function(){Mt=!1},t.noStroke=function(){r.stroke.isActive=!1},t.noiseSeed=function(e){t.noise=h(f(e))},t.pick=Yt,t.polygon=function(t){new at(t).show()},t.random=function(t=0,e=1){return Array.isArray(t)?t[~~(m()*t.length)]:1===arguments.length?m()*t:g(...arguments)},t.rect=function(t,e,n,i,o="corner"){"center"===o&&(t-=n/2,e-=i/2),dt(0),gt(t,e),vt(t+n,e),vt(t+n,e+i),vt(t,e+i),pt(),yt()},t.refreshField=function(t=0){J.get(r.field.current).field=J.get(r.field.current).gen(t,K())},t.restore=function(){O.ctx.restore();let t=O.ctx.getTransform();W.x=t.e,W.y=t.f,r.stroke={...tt.stroke},r.field={...tt.field},r.hatch={...tt.hatch},r.fill={...tt.fill},Z.restore()},t.rotate=function(t=0){L(),O.ctx.rotate(t)},t.save=function(){L(),O.ctx.save(),tt.fill={...r.fill},tt.stroke={...r.stroke},tt.hatch={...r.hatch},tt.field={...r.field},Z.save()},t.scale=function(t){L(),O.ctx.scale(t,t)},t.scaleBrushes=function(t){for(const{param:e}of Xt.values())e&&(e.weight*=t,e.vibration*=t,e.spacing*=t)},t.seed=function(t){m=f(t)},t.set=Lt,t.spline=function(t,e=.5){bt(t,e).draw()},t.stroke=function(t,e,n,i){L(),qt(t,e,n,!0,!1),Ht(T(i),!1)},t.strokeStyle=Wt,t.translate=function(t,e){L(),O.ctx.translate(t,e);let n=O.ctx.getTransform();W.x=n.e,W.y=n.f},t.wRand=y},"object"==typeof exports&&"undefined"!=typeof module?e(exports):"function"==typeof define&&define.amd?define(["exports"],e):e((t="undefined"!=typeof globalThis?globalThis:t||self).brush={});
