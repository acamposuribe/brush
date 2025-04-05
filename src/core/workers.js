

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
