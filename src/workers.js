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

// Worker for webGL shaders
export const gl_worker = () =>
  Worker.create(function (e) {
    let canvas, gl;
    const sh = {};

    const vsSource = `#version 300 es
    out vec2 p;void main(){vec3 v=vec3(-1);v[gl_VertexID]=3.;gl_Position=vec4(p=v.xy,0,1);}`;

    const fsSource = `#version 300 es
    precision highp float;uniform vec4 u_addColor;uniform bool u_isErase;uniform float u_flip;uniform bool u_isFBO;uniform sampler2D u_source,u_mask;in vec2 p;out vec4 outColor;float m(vec2 f,float v,float x,float p){return fract(sin(dot(f,vec2(v,x)))*p);}
    #ifndef SPECTRAL
    #define SPECTRAL
    float m(float f){return f<.04045?f/12.92:pow((f+.055)/1.055,2.4);}float x(float f){return f<.0031308?f*12.92:1.055*pow(f,1./2.4)-.055;}vec3 f(vec3 f){return vec3(m(f[0]),m(f[1]),m(f[2]));}vec3 n(vec3 f){return clamp(vec3(x(f[0]),x(f[1]),x(f[2])),0.,1.);}void f(vec3 e,out float m,out float f,out float u,out float v,out float x,out float r,out float z){m=min(e.x,min(e.y,e.z));e-=m;f=min(e.y,e.z);u=min(e.x,e.z);v=min(e.x,e.y);x=min(max(0.,e.x-e.z),max(0.,e.x-e.y));r=min(max(0.,e.y-e.z),max(0.,e.y-e.x));z=min(max(0.,e.z-e.y),max(0.,e.z-e.x));}void f(vec3 v,inout float u[38]){float e,x,o,m,y,z,p;f(v,e,x,o,m,y,z,p);u[0]=max(1e-4,e+x*.96853629+o*.51567122+m*.02055257+y*.03147571+z*.49108579+p*.97901834);u[1]=max(1e-4,e+x*.96855103+o*.5401552+m*.02059936+y*.03146636+z*.46944057+p*.97901649);u[2]=max(1e-4,e+x*.96859338+o*.62645502+m*.02062723+y*.03140624+z*.4016578+p*.97901118);u[3]=max(1e-4,e+x*.96877345+o*.75595012+m*.02073387+y*.03119611+z*.2449042+p*.97892146);u[4]=max(1e-4,e+x*.96942204+o*.92826996+m*.02114202+y*.03053888+z*.0682688+p*.97858555);u[5]=max(1e-4,e+x*.97143709+o*.97223624+m*.02233154+y*.02856855+z*.02732883+p*.97743705);u[6]=max(1e-4,e+x*.97541862+o*.98616174+m*.02556857+y*.02459485+z*.013606+p*.97428075);u[7]=max(1e-4,e+x*.98074186+o*.98955255+m*.03330189+y*.0192952+z*.01000187+p*.96663223);u[8]=max(1e-4,e+x*.98580992+o*.98676237+m*.05185294+y*.01423112+z*.01284127+p*.94822893);u[9]=max(1e-4,e+x*.98971194+o*.97312575+m*.10087639+y*.01033111+z*.02636635+p*.89937713);u[10]=max(1e-4,e+x*.99238027+o*.91944277+m*.24000413+y*.00765876+z*.07058713+p*.76070164);u[11]=max(1e-4,e+x*.99409844+o*.32564851+m*.53589066+y*.00593693+z*.70421692+p*.4642044);u[12]=max(1e-4,e+x*.995172+o*.13820628+m*.79874659+y*.00485616+z*.85473994+p*.20123039);u[13]=max(1e-4,e+x*.99576545+o*.05015143+m*.91186529+y*.00426186+z*.95081565+p*.08808402);u[14]=max(1e-4,e+x*.99593552+o*.02912336+m*.95399623+y*.00409039+z*.9717037+p*.04592894);u[15]=max(1e-4,e+x*.99564041+o*.02421691+m*.97137099+y*.00438375+z*.97651888+p*.02860373);u[16]=max(1e-4,e+x*.99464769+o*.02660696+m*.97939505+y*.00537525+z*.97429245+p*.02060067);u[17]=max(1e-4,e+x*.99229579+o*.03407586+m*.98345207+y*.00772962+z*.97012917+p*.01656701);u[18]=max(1e-4,e+x*.98638762+o*.04835936+m*.98553736+y*.0136612+z*.9425863+p*.01451549);u[19]=max(1e-4,e+x*.96829712+o*.0001172+m*.98648905+y*.03181352+z*.99989207+p*.01357964);u[20]=max(1e-4,e+x*.89228016+o*8.554e-5+m*.98674535+y*.10791525+z*.99989891+p*.01331243);u[21]=max(1e-4,e+x*.53740239+o*.85267882+m*.98657555+y*.46249516+z*.13823139+p*.01347661);u[22]=max(1e-4,e+x*.15360445+o*.93188793+m*.98611877+y*.84604333+z*.06968113+p*.01387181);u[23]=max(1e-4,e+x*.05705719+o*.94810268+m*.98559942+y*.94275572+z*.05628787+p*.01435472);u[24]=max(1e-4,e+x*.03126539+o*.94200977+m*.98507063+y*.96860996+z*.06111561+p*.01479836);u[25]=max(1e-4,e+x*.02205445+o*.91478045+m*.98460039+y*.97783966+z*.08987709+p*.0151525);u[26]=max(1e-4,e+x*.01802271+o*.87065445+m*.98425301+y*.98187757+z*.13656016+p*.01540513);u[27]=max(1e-4,e+x*.0161346+o*.78827548+m*.98403909+y*.98377315+z*.22169624+p*.01557233);u[28]=max(1e-4,e+x*.01520947+o*.65738359+m*.98388535+y*.98470202+z*.32176956+p*.0156571);u[29]=max(1e-4,e+x*.01475977+o*.59909403+m*.98376116+y*.98515481+z*.36157329+p*.01571025);u[30]=max(1e-4,e+x*.01454263+o*.56817268+m*.98368246+y*.98537114+z*.4836192+p*.01571916);u[31]=max(1e-4,e+x*.01444459+o*.54031997+m*.98365023+y*.98546685+z*.46488579+p*.01572133);u[32]=max(1e-4,e+x*.01439897+o*.52110241+m*.98361309+y*.98550011+z*.47440306+p*.01572502);u[33]=max(1e-4,e+x*.0143762+o*.51041094+m*.98357259+y*.98551031+z*.4857699+p*.01571717);u[34]=max(1e-4,e+x*.01436343+o*.50526577+m*.98353856+y*.98550741+z*.49267971+p*.01571905);u[35]=max(1e-4,e+x*.01435687+o*.5025508+m*.98351247+y*.98551323+z*.49625685+p*.01571059);u[36]=max(1e-4,e+x*.0143537+o*.50126452+m*.98350101+y*.98551563+z*.49807754+p*.01569728);u[37]=max(1e-4,e+x*.01435408+o*.50083021+m*.98350852+y*.98551547+z*.49889859+p*.0157002);}vec3 w(vec3 e){mat3 u;u[0]=vec3(3.24306333,-1.53837619,-.49893282);u[1]=vec3(-.96896309,1.87542451,.04154303);u[2]=vec3(.05568392,-.20417438,1.05799454);float f=dot(u[0],e),x=dot(u[1],e),o=dot(u[2],e);return n(vec3(f,x,o));}vec3 v(float u[38]){vec3 e=vec3(0);e+=u[0]*vec3(6.469e-5,1.84e-6,.00030502);e+=u[1]*vec3(.00021941,6.21e-6,.00103681);e+=u[2]*vec3(.00112057,3.101e-5,.00531314);e+=u[3]*vec3(.00376661,.00010475,.01795439);e+=u[4]*vec3(.01188055,.00035364,.05707758);e+=u[5]*vec3(.02328644,.00095147,.11365162);e+=u[6]*vec3(.03455942,.00228226,.17335873);e+=u[7]*vec3(.03722379,.00420733,.19620658);e+=u[8]*vec3(.03241838,.0066888,.18608237);e+=u[9]*vec3(.02123321,.0098884,.13995048);e+=u[10]*vec3(.01049099,.01524945,.08917453);e+=u[11]*vec3(.00329584,.02141831,.04789621);e+=u[12]*vec3(.00050704,.03342293,.02814563);e+=u[13]*vec3(.00094867,.05131001,.01613766);e+=u[14]*vec3(.00627372,.07040208,.0077591);e+=u[15]*vec3(.01686462,.08783871,.00429615);e+=u[16]*vec3(.02868965,.09424905,.00200551);e+=u[17]*vec3(.04267481,.09795667,.00086147);e+=u[18]*vec3(.05625475,.09415219,.00036904);e+=u[19]*vec3(.0694704,.08678102,.00019143);e+=u[20]*vec3(.08305315,.07885653,.00014956);e+=u[21]*vec3(.0861261,.0635267,9.231e-5);e+=u[22]*vec3(.09046614,.05374142,6.813e-5);e+=u[23]*vec3(.08500387,.04264606,2.883e-5);e+=u[24]*vec3(.07090667,.03161735,1.577e-5);e+=u[25]*vec3(.05062889,.02088521,3.94e-6);e+=u[26]*vec3(.03547396,.01386011,1.58e-6);e+=u[27]*vec3(.02146821,.00810264,0);e+=u[28]*vec3(.01251646,.0046301,0);e+=u[29]*vec3(.00680458,.00249138,0);e+=u[30]*vec3(.00346457,.0012593,0);e+=u[31]*vec3(.00149761,.00054165,0);e+=u[32]*vec3(.0007697,.00027795,0);e+=u[33]*vec3(.00040737,.00014711,0);e+=u[34]*vec3(.00016901,6.103e-5,0);e+=u[35]*vec3(9.522e-5,3.439e-5,0);e+=u[36]*vec3(4.903e-5,1.771e-5,0);e+=u[37]*vec3(2e-5,7.22e-6,0);return e;}float f(float x,float m,float f){float z=m*pow(f,2.);return z/(x*pow(1.-f,2.)+z);}vec3 m(vec3 x,vec3 e,float o){vec3 u=f(x),m=f(e);float p[38],z[38];f(u,p);f(m,z);float y=v(p)[1],r=v(z)[1];o=f(y,r,o);float i[38];for(int S=0;S<38;S++){float b=(1.-o)*(pow(1.-p[S],2.)/(2.*p[S]))+o*(pow(1.-z[S],2.)/(2.*z[S]));i[S]=1.+b-sqrt(pow(b,2.)+2.*b);}return w(v(i));}
    #endif
    void main(){vec2 e=.5*vec2(p.x,u_flip*p.y)+.5;vec4 u=texture(u_source,e);if(u_isFBO)outColor=u;else{vec4 f=texture(u_mask,e);if(f.x>0.){vec2 o=vec2(12.9898,78.233),x=vec2(7.9898,58.233),r=vec2(17.9898,3.233);float v=m(e,o.x,o.y,43358.5453)*2.-1.,y=m(e,x.x,x.y,43213.5453)*2.-1.,z=m(e,r.x,r.y,33358.5453)*2.-1.;vec4 i=vec4(u_addColor.xyz,1);if(f.w>.7&&!u_isErase){float b=.5*(f.w-.7);i=i*(1.-b)-vec4(.5)*b;}vec3 b=m(u.xyz,i.xyz,f.w);outColor=vec4(b+.01*vec3(v,y,z),1);}else outColor=u;}}`;

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

      // Define uniform locations for fragment shader
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

      // Use shader
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
      // Create and bind the framebuffer
      const fb = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      // attach the texture as the first color attachment
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

      // Fix Safari Memory Leak
      if (isSafari()) {
        const offscreen = new OffscreenCanvas(
          data.mask.width,
          data.mask.height
        );
        const offctx = offscreen.getContext("2d");
        // Draw the ImageBitmap onto the canvas
        offctx.drawImage(data.mask, 0, 0);
        // Extract the pixel data
        imageData = offctx.getImageData(
          0,
          0,
          data.mask.width,
          data.mask.height
        );
      }

      // Draw mask to texture
      gl.texSubImage2D(
        gl.TEXTURE_2D,
        0,
        0,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        isSafari() ? imageData : data.mask
      );

      // Close imagebitmap
      data.mask.close();

      // Draw to framebuffer
      gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, sh.target.fbo);

      // Uniforms
      gl.uniform1f(sh.u_flip, 1);
      gl.uniform1i(sh.u_isFBO, false);
      gl.uniform1i(sh.u_isImage, data.isImage ? true : false);

      if (!data.isImage) {
        gl.uniform1i(sh.u_isImage, false);
        gl.uniform4f(sh.u_addColor, ...data.addColor);
        gl.uniform1i(sh.u_isErase, data.isErase ? true : false);
      }

      // Composite image to frameBuffer
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      // Copy framebuffer to source
      gl.bindFramebuffer(gl.READ_FRAMEBUFFER, sh.target.fbo); // Read from target
      gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, sh.source.fbo); // Draw to source
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

      // Display framebuffer on canvas
      if (data.isLast) {
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
      } else if (event.data.isBG) {
        gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, sh.source.fbo);
        gl.clearColor(...event.data.color);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      } else if (event.data.mask) {
        applyShader(event.data);
      }
    };
  });
