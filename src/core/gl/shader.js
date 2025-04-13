export const vsSource = `#version 300 es
    out vec2 p;void main(){vec3 v=vec3(-1);v[gl_VertexID]=3.;gl_Position=vec4(p=v.xy,0,1);}`;

export const fsSource = `#version 300 es
precision highp float;uniform vec4 u_addColor;uniform bool u_isErase,u_isImage,u_isBrush;uniform sampler2D u_source,u_mask;in vec2 p;out vec4 outColor;float x(float v){return v<.04045?v/12.92:pow((v+.055)/1.055,2.4);}float f(float v){return v<.0031308?v*12.92:1.055*pow(v,1./2.4)-.055;}vec3 v(vec3 v){return vec3(x(v[0]),x(v[1]),x(v[2]));}vec3 n(vec3 v){return clamp(vec3(f(v[0]),f(v[1]),f(v[2])),0.,1.);}void f(vec3 e,out float m,out float f,out float v,out float u,out float i,out float r,out float z){m=min(e.x,min(e.y,e.z));e-=m;f=min(e.y,e.z);v=min(e.x,e.z);u=min(e.x,e.y);i=min(max(0.,e.x-e.z),max(0.,e.x-e.y));r=min(max(0.,e.y-e.z),max(0.,e.y-e.x));z=min(max(0.,e.z-e.y),max(0.,e.z-e.x));}void f(vec3 v,inout float u[38]){float e,o,m,x,k,z,y;f(v,e,o,m,x,k,z,y);u[0]=max(1e-4,e+o*.96853629+m*.51567122+x*.02055257+k*.03147571+z*.49108579+y*.97901834);u[1]=max(1e-4,e+o*.96855103+m*.5401552+x*.02059936+k*.03146636+z*.46944057+y*.97901649);u[2]=max(1e-4,e+o*.96859338+m*.62645502+x*.02062723+k*.03140624+z*.4016578+y*.97901118);u[3]=max(1e-4,e+o*.96877345+m*.75595012+x*.02073387+k*.03119611+z*.2449042+y*.97892146);u[4]=max(1e-4,e+o*.96942204+m*.92826996+x*.02114202+k*.03053888+z*.0682688+y*.97858555);u[5]=max(1e-4,e+o*.97143709+m*.97223624+x*.02233154+k*.02856855+z*.02732883+y*.97743705);u[6]=max(1e-4,e+o*.97541862+m*.98616174+x*.02556857+k*.02459485+z*.013606+y*.97428075);u[7]=max(1e-4,e+o*.98074186+m*.98955255+x*.03330189+k*.0192952+z*.01000187+y*.96663223);u[8]=max(1e-4,e+o*.98580992+m*.98676237+x*.05185294+k*.01423112+z*.01284127+y*.94822893);u[9]=max(1e-4,e+o*.98971194+m*.97312575+x*.10087639+k*.01033111+z*.02636635+y*.89937713);u[10]=max(1e-4,e+o*.99238027+m*.91944277+x*.24000413+k*.00765876+z*.07058713+y*.76070164);u[11]=max(1e-4,e+o*.99409844+m*.32564851+x*.53589066+k*.00593693+z*.70421692+y*.4642044);u[12]=max(1e-4,e+o*.995172+m*.13820628+x*.79874659+k*.00485616+z*.85473994+y*.20123039);u[13]=max(1e-4,e+o*.99576545+m*.05015143+x*.91186529+k*.00426186+z*.95081565+y*.08808402);u[14]=max(1e-4,e+o*.99593552+m*.02912336+x*.95399623+k*.00409039+z*.9717037+y*.04592894);u[15]=max(1e-4,e+o*.99564041+m*.02421691+x*.97137099+k*.00438375+z*.97651888+y*.02860373);u[16]=max(1e-4,e+o*.99464769+m*.02660696+x*.97939505+k*.00537525+z*.97429245+y*.02060067);u[17]=max(1e-4,e+o*.99229579+m*.03407586+x*.98345207+k*.00772962+z*.97012917+y*.01656701);u[18]=max(1e-4,e+o*.98638762+m*.04835936+x*.98553736+k*.0136612+z*.9425863+y*.01451549);u[19]=max(1e-4,e+o*.96829712+m*.0001172+x*.98648905+k*.03181352+z*.99989207+y*.01357964);u[20]=max(1e-4,e+o*.89228016+m*8.554e-5+x*.98674535+k*.10791525+z*.99989891+y*.01331243);u[21]=max(1e-4,e+o*.53740239+m*.85267882+x*.98657555+k*.46249516+z*.13823139+y*.01347661);u[22]=max(1e-4,e+o*.15360445+m*.93188793+x*.98611877+k*.84604333+z*.06968113+y*.01387181);u[23]=max(1e-4,e+o*.05705719+m*.94810268+x*.98559942+k*.94275572+z*.05628787+y*.01435472);u[24]=max(1e-4,e+o*.03126539+m*.94200977+x*.98507063+k*.96860996+z*.06111561+y*.01479836);u[25]=max(1e-4,e+o*.02205445+m*.91478045+x*.98460039+k*.97783966+z*.08987709+y*.0151525);u[26]=max(1e-4,e+o*.01802271+m*.87065445+x*.98425301+k*.98187757+z*.13656016+y*.01540513);u[27]=max(1e-4,e+o*.0161346+m*.78827548+x*.98403909+k*.98377315+z*.22169624+y*.01557233);u[28]=max(1e-4,e+o*.01520947+m*.65738359+x*.98388535+k*.98470202+z*.32176956+y*.0156571);u[29]=max(1e-4,e+o*.01475977+m*.59909403+x*.98376116+k*.98515481+z*.36157329+y*.01571025);u[30]=max(1e-4,e+o*.01454263+m*.56817268+x*.98368246+k*.98537114+z*.4836192+y*.01571916);u[31]=max(1e-4,e+o*.01444459+m*.54031997+x*.98365023+k*.98546685+z*.46488579+y*.01572133);u[32]=max(1e-4,e+o*.01439897+m*.52110241+x*.98361309+k*.98550011+z*.47440306+y*.01572502);u[33]=max(1e-4,e+o*.0143762+m*.51041094+x*.98357259+k*.98551031+z*.4857699+y*.01571717);u[34]=max(1e-4,e+o*.01436343+m*.50526577+x*.98353856+k*.98550741+z*.49267971+y*.01571905);u[35]=max(1e-4,e+o*.01435687+m*.5025508+x*.98351247+k*.98551323+z*.49625685+y*.01571059);u[36]=max(1e-4,e+o*.0143537+m*.50126452+x*.98350101+k*.98551563+z*.49807754+y*.01569728);u[37]=max(1e-4,e+o*.01435408+m*.50083021+x*.98350852+k*.98551547+z*.49889859+y*.0157002);}vec3 w(vec3 e){mat3 u;u[0]=vec3(3.24306333,-1.53837619,-.49893282);u[1]=vec3(-.96896309,1.87542451,.04154303);u[2]=vec3(.05568392,-.20417438,1.05799454);float v=dot(u[0],e),o=dot(u[1],e),z=dot(u[2],e);return n(vec3(v,o,z));}vec3 m(float u[38]){return vec3(0)+u[0]*vec3(6.469e-5,1.84e-6,.00030502)+u[1]*vec3(.00021941,6.21e-6,.00103681)+u[2]*vec3(.00112057,3.101e-5,.00531314)+u[3]*vec3(.00376661,.00010475,.01795439)+u[4]*vec3(.01188055,.00035364,.05707758)+u[5]*vec3(.02328644,.00095147,.11365162)+u[6]*vec3(.03455942,.00228226,.17335873)+u[7]*vec3(.03722379,.00420733,.19620658)+u[8]*vec3(.03241838,.0066888,.18608237)+u[9]*vec3(.02123321,.0098884,.13995048)+u[10]*vec3(.01049099,.01524945,.08917453)+u[11]*vec3(.00329584,.02141831,.04789621)+u[12]*vec3(.00050704,.03342293,.02814563)+u[13]*vec3(.00094867,.05131001,.01613766)+u[14]*vec3(.00627372,.07040208,.0077591)+u[15]*vec3(.01686462,.08783871,.00429615)+u[16]*vec3(.02868965,.09424905,.00200551)+u[17]*vec3(.04267481,.09795667,.00086147)+u[18]*vec3(.05625475,.09415219,.00036904)+u[19]*vec3(.0694704,.08678102,.00019143)+u[20]*vec3(.08305315,.07885653,.00014956)+u[21]*vec3(.0861261,.0635267,9.231e-5)+u[22]*vec3(.09046614,.05374142,6.813e-5)+u[23]*vec3(.08500387,.04264606,2.883e-5)+u[24]*vec3(.07090667,.03161735,1.577e-5)+u[25]*vec3(.05062889,.02088521,3.94e-6)+u[26]*vec3(.03547396,.01386011,1.58e-6)+u[27]*vec3(.02146821,.00810264,0)+u[28]*vec3(.01251646,.0046301,0)+u[29]*vec3(.00680458,.00249138,0)+u[30]*vec3(.00346457,.0012593,0)+u[31]*vec3(.00149761,.00054165,0)+u[32]*vec3(.0007697,.00027795,0)+u[33]*vec3(.00040737,.00014711,0)+u[34]*vec3(.00016901,6.103e-5,0)+u[35]*vec3(9.522e-5,3.439e-5,0)+u[36]*vec3(4.903e-5,1.771e-5,0)+u[37]*vec3(2e-5,7.22e-6,0);}float f(float m,float z,float v){z*=pow(v,2.);return z/(m*pow(1.-v,2.)+z);}vec3 m(vec3 e,vec3 u,float z){float o[38],p[38];f(v(e),o);f(v(u),p);float x=m(o)[1],k=m(p)[1];z=f(x,k,z);float i[38];for(int u=0;u<38;u++){float v=(1.-z)*(pow(1.-o[u],2.)/(2.*o[u]))+z*(pow(1.-p[u],2.)/(2.*p[u]));i[u]=1.+v-sqrt(pow(v,2.)+2.*v);}return w(m(i));}void main(){vec2 e=.5*vec2(p)+.5;vec4 v=texture(u_source,e);if(u_isImage)outColor=texture(u_mask,e);else{vec4 u=texture(u_mask,e);if(u.x>0.){vec4 o=vec4(u_addColor.xyz,1);if(u.w>.7&&!u_isErase){float v=.5*(u.w-.7);o=o*(1.-v)-vec4(.5)*v;}float f=u.w;if(!u_isBrush){vec2 v=1./vec2(textureSize(u_mask,0));float z=0.,m=0.;for(int u=-2;u<=2;u++)for(int f=-2;f<=2;f++){vec2 o=vec2(float(u),float(f))*v;float p=texture(u_mask,e+o).w*15.;z+=smoothstep(.05,.35,length(vec2(dFdx(p),dFdy(p))));m+=1.;}z/=m;f=clamp(u.w+z*.2,0.,1.);}vec3 z=m(v.xyz,o.xyz,f);outColor=vec4(z,1);}else outColor=v;}}`;