(function(){
/* ---------- sound: synthesised in the browser (no audio files) ---------- */
var SFX=(function(){
  var ctx=null,master=null,amb=null,noiseBuf=null,on=true,started=false,ambT=0,ringT=0,scene="ldn",ngBus=null,ldnBus=null,birdT=0;
  try{var sv=localStorage.getItem("jo-sound");if(sv==="off")on=false;}catch(e){}
  function init(){
    if(ctx)return true;
    var AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;
    try{ctx=new AC();}catch(e){return false;}
    master=ctx.createGain();master.gain.value=on?0.7:0;master.connect(ctx.destination);
    var len=ctx.sampleRate*2;noiseBuf=ctx.createBuffer(1,len,ctx.sampleRate);var d=noiseBuf.getChannelData(0),b=0;
    for(var i=0;i<len;i++){var w=Math.random()*2-1;b=(b+0.02*w)/1.02;d[i]=w*0.5+b*2.6;}
    return true;
  }
  function noise(){var s=ctx.createBufferSource();s.buffer=noiseBuf;s.loop=true;return s;}
  function env(g,t,a,peak,dcy){g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(0.0001,t+a+dcy);}
  function tone(type,f0,f1,t,dur,peak,dest){var o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(f0,t);if(f1)o.frequency.exponentialRampToValueAtTime(f1,t+dur);
    env(g,t,0.01,peak,dur);o.connect(g);g.connect(dest||master);o.start(t);o.stop(t+dur+0.05);return o;}
  /* night city outside the window: low traffic rumble, air, cars passing, a distant horn now and then */
  function startAmbience(){
    if(amb)return;amb=ctx.createGain();amb.gain.value=0;amb.connect(master);
    amb.gain.linearRampToValueAtTime(1,ctx.currentTime+3);
    ldnBus=ctx.createGain();ldnBus.gain.value=scene==="ldn"?1:0;ldnBus.connect(amb);
    ngBus=ctx.createGain();ngBus.gain.value=scene==="ng"?1:0;ngBus.connect(amb);
    /* Lagos daytime: a generator humming down the street, the ceiling fan, birds, the odd danfo horn */
    var gen=ctx.createOscillator(),gf=ctx.createBiquadFilter(),gg=ctx.createGain();gen.type="sawtooth";gen.frequency.value=50;gf.type="lowpass";gf.frequency.value=140;gg.gain.value=0.018;gen.connect(gf);gf.connect(gg);gg.connect(ngBus);gen.start();
    var fn=noise(),ff=ctx.createBiquadFilter(),fg=ctx.createGain(),fl=ctx.createOscillator(),flg=ctx.createGain();ff.type="lowpass";ff.frequency.value=700;fg.gain.value=0.02;fl.frequency.value=3.2;flg.gain.value=0.008;fl.connect(flg);flg.connect(fg.gain);fn.connect(ff);ff.connect(fg);fg.connect(ngBus);fn.start();fl.start();
    function bird(){
      if(!amb)return;if(scene==="ng"){var t=ctx.currentTime,n=3+Math.floor(Math.random()*4),base=2400+Math.random()*1600;
        for(var i=0;i<n;i++){tone("sine",base,base*(1.25+Math.random()*.3),t+i*0.11,0.07,0.035,ngBus);}
        if(Math.random()<0.18){var ht=t+0.8;tone("square",330,null,ht,0.16,0.012,ngBus);tone("square",330,null,ht+0.24,0.22,0.012,ngBus);}}
      birdT=setTimeout(bird,1200+Math.random()*3600);
    }
    birdT=setTimeout(bird,800);
    /* busy street: a crowd murmuring (noise shaped by shifting vowel-like bands) */
    [ [420,0.9],[1100,1.3],[2300,0.7] ].forEach(function(b,i){
      var cn=noise(),cf=ctx.createBiquadFilter(),cg=ctx.createGain(),cl=ctx.createOscillator(),clg=ctx.createGain();
      cf.type="bandpass";cf.frequency.value=b[0];cf.Q.value=3;cg.gain.value=0.012/(i+1);
      cl.frequency.value=b[1];clg.gain.value=b[0]*0.25;cl.connect(clg);clg.connect(cf.frequency);
      cn.connect(cf);cf.connect(cg);cg.connect(ngBus);cn.start();cl.start();
    });
    /* danfo and okada horns from the road */
    function horn(){
      if(!amb)return;
      if(scene==="ng"){var t=ctx.currentTime,p=ctx.createStereoPanner?ctx.createStereoPanner():null,out=ngBus;
        if(p){p.pan.value=Math.random()*1.6-0.8;p.connect(ngBus);out=p;}
        var kind=Math.random();
        if(kind<0.55){/* danfo: two-tone honks, "poh-poh-pooooh" */
          var f=300+Math.random()*80,pat=[[0,0.14],[0.2,0.14],[0.42,0.5]];if(Math.random()<.4)pat=[[0,0.12],[0.16,0.12],[0.32,0.12],[0.5,0.4]];
          pat.forEach(function(q){tone("square",f,null,t+q[0],q[1],0.022,out);tone("square",f*1.26,null,t+q[0],q[1],0.016,out);});}
        else if(kind<0.85){/* okada: thin high beeps */
          var f2=900+Math.random()*300;for(var k=0;k<2+Math.floor(Math.random()*3);k++)tone("square",f2,null,t+k*0.13,0.08,0.01,out);}
        else{/* a lorry, low and long */tone("sawtooth",180,null,t,0.9,0.02,out);tone("sawtooth",226,null,t,0.9,0.016,out);}}
      hornT=setTimeout(horn,1800+Math.random()*4200);
    }
    var hornT=setTimeout(horn,1200);
    var n1=noise(),lp=ctx.createBiquadFilter();lp.type="lowpass";lp.frequency.value=320;var g1=ctx.createGain();g1.gain.value=0.05;n1.connect(lp);lp.connect(g1);g1.connect(ldnBus);n1.start();
    var n2=noise(),bp=ctx.createBiquadFilter();bp.type="bandpass";bp.frequency.value=1400;bp.Q.value=0.6;var g2=ctx.createGain();g2.gain.value=0.006;n2.connect(bp);bp.connect(g2);g2.connect(ldnBus);n2.start();
    var lfo=ctx.createOscillator(),lg=ctx.createGain();lfo.frequency.value=0.07;lg.gain.value=0.02;lfo.connect(lg);lg.connect(g1.gain);lfo.start();
    function car(){
      if(!amb)return;var t=ctx.currentTime,dur=2.6+Math.random()*2.2,s=noise(),f=ctx.createBiquadFilter(),g=ctx.createGain(),p=ctx.createStereoPanner?ctx.createStereoPanner():null;
      f.type="bandpass";f.Q.value=1.2;f.frequency.setValueAtTime(260,t);f.frequency.linearRampToValueAtTime(820,t+dur*0.5);f.frequency.linearRampToValueAtTime(240,t+dur);
      g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(0.06+Math.random()*0.04,t+dur*0.5);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
      s.connect(f);f.connect(g);if(p){var dir=Math.random()<.5?-1:1;p.pan.setValueAtTime(-0.8*dir,t);p.pan.linearRampToValueAtTime(0.8*dir,t+dur);g.connect(p);p.connect(ldnBus);}else g.connect(ldnBus);
      s.start(t);s.stop(t+dur+0.1);
      if(Math.random()<0.12){var ht=t+dur*0.4;tone("sawtooth",392,null,ht,0.28,0.012,ldnBus);tone("sawtooth",494,null,ht,0.28,0.01,ldnBus);}
      ambT=setTimeout(car,4000+Math.random()*9000);
    }
    ambT=setTimeout(car,1500);
  }
  function start(){if(!init())return;if(ctx.state==="suspended")ctx.resume();if(!started){started=true;startAmbience();}}
  function ready(){if(!on)return false;start();return !!ctx;}
  var api={
    isOn:function(){return on;},
    toggle:function(){on=!on;try{localStorage.setItem("jo-sound",on?"on":"off");}catch(e){}
      if(on){start();}if(master)master.gain.setTargetAtTime(on?0.7:0,ctx.currentTime,0.08);if(!on)api.stopRing();return on;},
    wake:function(){if(on)start();},
    click:function(){if(!ready())return;var t=ctx.currentTime,s=noise(),f=ctx.createBiquadFilter(),g=ctx.createGain();f.type="highpass";f.frequency.value=2200;
      s.connect(f);f.connect(g);g.connect(master);env(g,t,0.002,0.35,0.03);s.start(t);s.stop(t+0.06);tone("sine",180,90,t,0.06,0.25);},
    drawer:function(opening){if(!ready())return;var t=ctx.currentTime,s=noise(),f=ctx.createBiquadFilter(),g=ctx.createGain(),d=0.32;
      f.type="bandpass";f.Q.value=2.5;f.frequency.setValueAtTime(opening?500:1100,t);f.frequency.linearRampToValueAtTime(opening?1100:500,t+d);
      g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(0.12,t+0.04);g.gain.linearRampToValueAtTime(0.08,t+d*0.8);g.gain.exponentialRampToValueAtTime(0.0001,t+d);
      s.connect(f);f.connect(g);g.connect(master);s.start(t);s.stop(t+d+0.05);tone("sine",110,70,t+d-0.02,0.14,0.32);},
    bark:function(){if(!ready())return;var t=ctx.currentTime;[0,0.2].forEach(function(o){
      var osc=ctx.createOscillator(),f=ctx.createBiquadFilter(),g=ctx.createGain();osc.type="sawtooth";osc.frequency.setValueAtTime(560,t+o);osc.frequency.exponentialRampToValueAtTime(320,t+o+0.11);
      f.type="bandpass";f.frequency.value=950;f.Q.value=1.6;osc.connect(f);f.connect(g);g.connect(master);env(g,t+o,0.008,0.4,0.12);osc.start(t+o);osc.stop(t+o+0.16);
      var s=noise(),nf=ctx.createBiquadFilter(),ng=ctx.createGain();nf.type="bandpass";nf.frequency.value=1600;s.connect(nf);nf.connect(ng);ng.connect(master);env(ng,t+o,0.005,0.12,0.06);s.start(t+o);s.stop(t+o+0.1);});},
    snore:function(){if(!ready())return;var t=ctx.currentTime,s=noise(),f=ctx.createBiquadFilter(),g=ctx.createGain();f.type="lowpass";f.frequency.value=380;
      s.connect(f);f.connect(g);g.connect(master);g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(0.18,t+0.7);g.gain.exponentialRampToValueAtTime(0.0001,t+1.5);s.start(t);s.stop(t+1.6);
      var o=ctx.createOscillator(),og=ctx.createGain();o.type="triangle";o.frequency.value=70;o.connect(og);og.connect(master);og.gain.setValueAtTime(0.0001,t);og.gain.exponentialRampToValueAtTime(0.05,t+0.7);og.gain.exponentialRampToValueAtTime(0.0001,t+1.4);o.start(t);o.stop(t+1.5);},
    yawn:function(){if(!ready())return;var t=ctx.currentTime,o=ctx.createOscillator(),v=ctx.createOscillator(),vg=ctx.createGain(),g=ctx.createGain();
      o.type="triangle";o.frequency.setValueAtTime(720,t);o.frequency.exponentialRampToValueAtTime(380,t+0.7);v.frequency.value=7;vg.gain.value=18;v.connect(vg);vg.connect(o.frequency);
      o.connect(g);g.connect(master);env(g,t,0.08,0.12,0.7);o.start(t);v.start(t);o.stop(t+0.85);v.stop(t+0.85);},
    buzz:function(){if(!ready())return;var t=ctx.currentTime;for(var k=0;k<3;k++){var st=t+k*0.56,o=ctx.createOscillator(),f=ctx.createBiquadFilter(),g=ctx.createGain();
      o.type="square";o.frequency.value=148;f.type="lowpass";f.frequency.value=420;o.connect(f);f.connect(g);g.connect(master);
      g.gain.setValueAtTime(0.0001,st);g.gain.exponentialRampToValueAtTime(0.16,st+0.02);g.gain.setValueAtTime(0.16,st+0.32);g.gain.exponentialRampToValueAtTime(0.0001,st+0.34);o.start(st);o.stop(st+0.36);}},
    ring:function(){if(!ready())return;api.stopRing();
      var play=function(){if(!on||!ctx)return;var t=ctx.currentTime,notes=[659,988,1319,988,659,988,1319,988];
        notes.forEach(function(fq,i){tone("sine",fq,null,t+i*0.13,0.22,0.1);tone("triangle",fq*2,null,t+i*0.13,0.08,0.02);});};
      play();ringT=setInterval(play,2200);},
    stopRing:function(){clearInterval(ringT);ringT=0;},
    pickup:function(){if(!ready())return;var t=ctx.currentTime;tone("sine",880,null,t,0.08,0.12);tone("sine",1320,null,t+0.09,0.12,0.1);},
    ctx:function(){return ctx;},master:function(){return master;},
    setScene:function(sc){scene=sc;if(ctx&&ngBus){var t=ctx.currentTime;ngBus.gain.setTargetAtTime(sc==="ng"?1:0,t,0.6);ldnBus.gain.setTargetAtTime(sc==="ldn"?1:0,t,0.6);}},
    plane:function(){if(!ready())return;var t=ctx.currentTime,o=ctx.createOscillator(),f=ctx.createBiquadFilter(),g=ctx.createGain(),l=ctx.createOscillator(),lg=ctx.createGain();
      o.type="sawtooth";o.frequency.setValueAtTime(70,t);o.frequency.exponentialRampToValueAtTime(190,t+1.4);f.type="lowpass";f.frequency.value=900;
      l.frequency.value=28;lg.gain.value=0.06;l.connect(lg);lg.connect(g.gain);o.connect(f);f.connect(g);g.connect(master);
      g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(0.12,t+0.3);g.gain.exponentialRampToValueAtTime(0.0001,t+1.9);o.start(t);l.start(t);o.stop(t+2);l.stop(t+2);
      var s=noise(),nf=ctx.createBiquadFilter(),ng=ctx.createGain();nf.type="bandpass";nf.Q.value=0.8;nf.frequency.setValueAtTime(300,t+0.3);nf.frequency.exponentialRampToValueAtTime(2200,t+1.5);
      s.connect(nf);nf.connect(ng);ng.connect(master);ng.gain.setValueAtTime(0.0001,t+0.3);ng.gain.exponentialRampToValueAtTime(0.16,t+1.1);ng.gain.exponentialRampToValueAtTime(0.0001,t+2);s.start(t+0.3);s.stop(t+2.1);},
    hangup:function(){if(!ready())return;var t=ctx.currentTime;tone("sine",660,null,t,0.1,0.1);tone("sine",440,null,t+0.11,0.16,0.1);}
  };
  /* the browser only allows sound after the visitor interacts: start the room on the first click or key */
  var first=function(){window.removeEventListener("pointerdown",first,true);window.removeEventListener("keydown",first,true);api.wake();};
  window.addEventListener("pointerdown",first,true);window.addEventListener("keydown",first,true);
  return api;
})();

(function(){var b=document.getElementById("sndbtn");
  function ui(){var o=SFX.isOn();b.setAttribute("aria-pressed",o?"true":"false");b.setAttribute("aria-label",o?"Mute sound":"Turn sound on");}
  ui();b.addEventListener("click",function(){SFX.toggle();ui();});})();
/* ---------- dark interface only ---------- */
var root=document.documentElement;root.setAttribute("data-theme","dark");
/* ---------- bulb switch: turns on the floor lamp and the desk lamp ---------- */
var lightBtn=document.getElementById("lightbtn");
function setLights(on){
  document.body.classList.toggle("lit",on);
  lightBtn.setAttribute("aria-pressed",on?"true":"false");
  lightBtn.setAttribute("aria-label",on?"Turn off the lamps":"Turn on the lamps");
  lightBtn.setAttribute("aria-checked",on?"true":"false");
  if(window.lampTo)lampTo(on);
  if(window.dogTo)dogTo(on);
  SFX.click();
}
lightBtn.addEventListener("click",function(){setLights(!document.body.classList.contains("lit"));if(window.curFlash&&document.body.classList.contains("lit"))curFlash("💡",900);});

/* ================= content ================= */
/* DRAWERS, INTRO, CS_IMG, CASES, PROJECTS and ARTICLES live in src/data/*.js (loaded before this file) */

/* ================= helpers ================= */
var NS="http://www.w3.org/2000/svg";
var C=Math.cos(Math.PI/6),S=0.5;
/* view: yaw turns the cabinet about its own centre, tilt changes how far you look down on it */
var VIEW={yaw:0,tilt:S,ty:0,tt:S},CX=0,CY=0;
var YAWMAX=Infinity,TMIN=0.1,TMAX=1.05;
function P(x,y,z){var c=Math.cos(VIEW.yaw),sn=Math.sin(VIEW.yaw),dx=x-CX,dy=y-CY,X=CX+dx*c-dy*sn,Y=CY+dx*sn+dy*c;return[(X-Y)*C,(X+Y)*VIEW.tilt-z];}
function r1(n){return Math.round(n*10)/10;}
function poly(pts){return "M"+pts.map(function(p){var q=P(p[0],p[1],p[2]);return r1(q[0])+" "+r1(q[1]);}).join("L")+"Z";}
function line(a,b){var p=P(a[0],a[1],a[2]),q=P(b[0],b[1],b[2]);return "M"+r1(p[0])+" "+r1(p[1])+"L"+r1(q[0])+" "+r1(q[1]);}
function pth(d,c,extra){return '<path class="'+c+'" d="'+d+'"'+(extra||"")+'/>';}
function rr(o,u,v,w,h,r){
  r=Math.min(r,w/2,h/2);var out=[];
  var cs=[[w-r,r,-90],[w-r,h-r,0],[r,h-r,90],[r,r,180]];
  cs.forEach(function(c){for(var k=0;k<=8;k++){var a=(c[2]+k*11.25)*Math.PI/180;var A=c[0]+r*Math.cos(a),B=c[1]+r*Math.sin(a);
    out.push([o[0]+A*u[0]+B*v[0],o[1]+A*u[1]+B*v[1],o[2]+A*u[2]+B*v[2]]);}});
  return out;
}
function txt(x,y,z,s,size,anchor){var p=P(x,y,z),q=P(x+1,y,z),a=Math.round((q[0]-p[0])*1000)/1000,b=Math.round((q[1]-p[1])*1000)/1000;
  return '<text class="tx" font-size="'+size+'" text-anchor="'+(anchor||"middle")+'" dominant-baseline="central" transform="matrix('+a+','+b+',0,1,'+r1(p[0])+','+r1(p[1])+')">'+s+'</text>';}
function box(x0,y0,z0,x1,y1,z1,c,r){
  if(r)return pth(poly(rr([x0,y0,z1],[1,0,0],[0,1,0],x1-x0,y1-y0,r)),c)+
    pth(poly(rr([x1,y0,z1],[0,1,0],[0,0,-1],y1-y0,z1-z0,r)),c)+
    pth(poly(rr([x0,y1,z1],[1,0,0],[0,0,-1],x1-x0,z1-z0,r)),c);
  return pth(poly([[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]]),c)+
         pth(poly([[x1,y0,z1],[x1,y1,z1],[x1,y1,z0],[x1,y0,z0]]),c)+
         pth(poly([[x0,y1,z1],[x1,y1,z1],[x1,y1,z0],[x0,y1,z0]]),c);
}
/* round every corner of a 2D outline (quadratic fillet) */
function soften(pts,r){var out=[],n=pts.length;
  for(var i=0;i<n;i++){var A=pts[(i+n-1)%n],V=pts[i],B=pts[(i+1)%n];
    var la=Math.hypot(A[0]-V[0],A[1]-V[1]),lb=Math.hypot(B[0]-V[0],B[1]-V[1]);
    var ta=Math.min(r/la,.5),tb=Math.min(r/lb,.5);
    var p0=[V[0]+(A[0]-V[0])*ta,V[1]+(A[1]-V[1])*ta],p2=[V[0]+(B[0]-V[0])*tb,V[1]+(B[1]-V[1])*tb];
    for(var k=0;k<=4;k++){var t=k/4,u=1-t;out.push([u*u*p0[0]+2*u*t*V[0]+t*t*p2[0],u*u*p0[1]+2*u*t*V[1]+t*t*p2[1]]);}}
  return out;}
/* a standing index card in the x–z plane, tab on top */
function card(xa,yc,zbot,xb,ztop,k,label,tw,th,fs){
  var w=xb-xa,h=ztop-zbot,t=6+((k*37)%Math.max(1,(w-tw-12)));
  var p2=[[0,th],[t,th],[t+3,0],[t+tw-3,0],[t+tw,th],[w,th],[w,h],[0,h]];
  var s=pth(poly(soften(p2,3.5).map(function(q){return[xa+q[0],yc,ztop-q[1]];})),"s");
  s+=pth(line([xa+8,yc,ztop-th-11],[xb-8,yc,ztop-th-11]),"fa");
  s+=pth(line([xa+8,yc,ztop-th-19],[xb-30,yc,ztop-th-19]),"fa");
  if(label)s+=txt(xa+t+tw/2,yc,ztop-th/2,label,fs);
  return s;
}

/* ================= cabinet (real 3D, three.js) ================= */
/* pedestal style: flush full-overlay fronts, finger-pull notches cut into each top edge, recessed plinth, thin top slab */
var W=236,D=210,BASE=16,TOPT=8,FG=3,TH=7,OPEN=128,HOVER=9;
var DHS=[64,64,64,104];
/* colour code for the files: the same colour marks the same file on the card and in the pinned note */
var FILE_COLORS=["#8fb3ff","#7fd8b4","#ffcf70","#ff9c87","#c4b0ff"];
var FILE_LINKS={home:["#home","#home","#home"],projects:["#project-firstchekout","#project-fundall","#project-keys-community","#project-aptap","#project-baci"],
  about:["#about","#about","#about"],articles:["#article-designing-for-growth","#article-checkout-is-a-trust-problem","#article-ask-why-before-figma","#article-ai-that-explains-money"]};
var CARDHOV=null,LIFT=18;
var Z1=BASE+FG/2+DHS.reduce(function(a,b){return a+b;},0)+FG*(DHS.length-1)+FG/2;
var svg=document.getElementById("cab"),hits=document.getElementById("hits");
var JIG=0,HOV=null;
var state=DRAWERS.map(function(){return{cur:0,target:0};});
var open=null,raf=0,lastDrawer=-1;
var reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var T3=window.THREE,G=null;
function drawerTop(i){var y=Z1-0.6;for(var j=0;j<i;j++)y-=DHS[j]+FG;return y;}

function tok(n){return(getComputedStyle(document.documentElement).getPropertyValue(n)||"").trim()||"#999";}
function isDark(){return true;}

/* rounded box (adapted from three.js RoundedBoxGeometry, MIT) */
var RAD=5;
function RBox(w,h,d,seg,r){
  seg=seg*2+1;r=Math.min(w/2,h/2,d/2,r);
  var g=new T3.BoxGeometry(1,1,1,seg,seg,seg).toNonIndexed();
  var pos=g.attributes.position.array,nor=g.attributes.normal.array;
  var bx=w/2-r,by=h/2-r,bz=d/2-r,half=0.5/seg,p=new T3.Vector3(),n=new T3.Vector3();
  for(var i=0;i<pos.length;i+=3){
    p.fromArray(pos,i);n.copy(p);
    n.x-=Math.sign(n.x)*half;n.y-=Math.sign(n.y)*half;n.z-=Math.sign(n.z)*half;n.normalize();
    pos[i]=bx*Math.sign(p.x)+n.x*r;pos[i+1]=by*Math.sign(p.y)+n.y*r;pos[i+2]=bz*Math.sign(p.z)+n.z*r;
    nor[i]=n.x;nor[i+1]=n.y;nor[i+2]=n.z;
  }
  g.attributes.position.needsUpdate=true;g.attributes.normal.needsUpdate=true;
  return g;
}
/* round each corner of a 2D outline with its own radius */
function filletR(pts,radii){var out=[],n=pts.length;
  for(var i=0;i<n;i++){var A=pts[(i+n-1)%n],V=pts[i],B=pts[(i+1)%n],r=radii[i];
    if(!r){out.push(V);continue;}
    var la=Math.hypot(A[0]-V[0],A[1]-V[1]),lb=Math.hypot(B[0]-V[0],B[1]-V[1]),ta=Math.min(r/la,.5),tb=Math.min(r/lb,.5);
    var p0=[V[0]+(A[0]-V[0])*ta,V[1]+(A[1]-V[1])*ta],p2=[V[0]+(B[0]-V[0])*tb,V[1]+(B[1]-V[1])*tb];
    for(var k=0;k<=6;k++){var t=k/6,u=1-t;out.push([u*u*p0[0]+2*u*t*V[0]+t*t*p2[0],u*u*p0[1]+2*u*t*V[1]+t*t*p2[1]]);}}
  return out;}
function shapeOf(pts){var sh=new T3.Shape();pts.forEach(function(q,j){if(j)sh.lineTo(q[0],q[1]);else sh.moveTo(q[0],q[1]);});return sh;}
function canvasTex(wu,hu,ppu,draw){
  var c=document.createElement("canvas");c.width=Math.round(wu*ppu);c.height=Math.round(hu*ppu);
  var x=c.getContext("2d"),t=new T3.CanvasTexture(c);
  t.anisotropy=G?G.renderer.capabilities.getMaxAnisotropy():1;
  var o={tex:t,redraw:function(){x.setTransform(ppu,0,0,ppu,0,0);x.clearRect(0,0,wu,hu);draw(x);t.needsUpdate=true;}};
  o.redraw();return o;
}

function build3d(){
  var renderer;
  try{renderer=new T3.WebGLRenderer({antialias:true,alpha:true});}catch(e){return false;}
  G={renderer:renderer,decals:[],drawers:[],pick:[],cards:[]};
  renderer.setPixelRatio(Math.min(2,window.devicePixelRatio||1));
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=T3.VSMShadowMap;
  renderer.domElement.setAttribute("aria-hidden","true");
  svg.insertBefore(renderer.domElement,svg.firstChild);

  var scene=new T3.Scene(),camera=new T3.PerspectiveCamera(26,1,20,6000);
  G.scene=scene;G.camera=camera;

  /* studio light: sky fill, a soft key from up-left that casts the floor shadow, and a cool rim from behind to pick out edges */
  G.hemi=new T3.HemisphereLight(0xffffff,0xdde0e6,0.75);scene.add(G.hemi);
  var key=new T3.DirectionalLight(0xffffff,0.5);key.position.set(-130,1000,210);
  key.castShadow=true;key.shadow.mapSize.set(2048,2048);
  var sc=key.shadow.camera;sc.left=-700;sc.right=700;sc.top=700;sc.bottom=-700;sc.near=100;sc.far=2400;
  key.shadow.bias=-0.0004;key.shadow.radius=14;key.shadow.blurSamples=16;
  scene.add(key);scene.add(key.target);G.key=key;
  /* warm lamp light from the floor lamp beside the cabinet, off until the bulb switch is pressed */
  G.lamp=new T3.PointLight(0xffc27a,0,1800,1);G.lamp.position.set(-300,380,330);scene.add(G.lamp);G.lampT=0;
  var rim=new T3.DirectionalLight(0xdfe6ff,0.3);rim.position.set(600,500,-700);scene.add(rim);G.rim=rim;
  var fill=new T3.DirectionalLight(0xffffff,0.18);fill.position.set(500,200,600);scene.add(fill);G.fill=fill;

  /* floor: cast shadow plus a soft contact shadow */
  G.floorMat=new T3.ShadowMaterial({opacity:0.16});
  var floor=new T3.Mesh(new T3.PlaneGeometry(4000,4000),G.floorMat);floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);
  var blob=document.createElement("canvas");blob.width=blob.height=128;
  var bx=blob.getContext("2d"),gr=bx.createRadialGradient(64,64,10,64,64,64);
  gr.addColorStop(0,"rgba(0,0,0,0.6)");gr.addColorStop(0.55,"rgba(0,0,0,0.25)");gr.addColorStop(1,"rgba(0,0,0,0)");bx.fillStyle=gr;bx.fillRect(0,0,128,128);
  G.blobMat=new T3.MeshBasicMaterial({map:new T3.CanvasTexture(blob),transparent:true,depthWrite:false,opacity:0.5});
  var bl=new T3.Mesh(new T3.PlaneGeometry(W+100,D+100),G.blobMat);bl.rotation.x=-Math.PI/2;bl.position.y=0.3;scene.add(bl);

  /* matte finish */
  G.body=new T3.MeshStandardMaterial({color:0xffffff,roughness:0.78,metalness:0});
  G.inner=new T3.MeshStandardMaterial({color:0xffffff,roughness:0.9,metalness:0});
  G.paper=new T3.MeshStandardMaterial({color:0xffffff,roughness:0.95,metalness:0});
  G.cardLine=new T3.LineBasicMaterial({color:0x1a1d23,transparent:true,opacity:0.22});

  var cab=new T3.Group();cab.position.z=-D/2;scene.add(cab);G.cab=cab;
  function mesh(geo,mat,x,y,z,parent,di){
    var m=new T3.Mesh(geo,mat||G.body);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;
    m.userData.di=di==null?-1:di;(parent||cab).add(m);G.pick.push(m);return m;
  }
  function rb(w,h,d,x,y,z,parent,di,r,mat){return mesh(RBox(w,h,d,3,r==null?RAD:r),mat,x,y,z,parent,di);}

  /* carcass: sides, back, base, thin top; open front so an open drawer shows the inside */
  var Hb=Z1-BASE,IW=W-12;
  rb(W-24,BASE,D-24,0,BASE/2,D/2-6,null,null,2,G.inner);          /* recessed plinth */
  rb(6,Hb,D,-W/2+3,BASE+Hb/2,D/2);rb(6,Hb,D,W/2-3,BASE+Hb/2,D/2);
  rb(IW,Hb,6,0,BASE+Hb/2,3,null,null,2,G.inner);
  rb(IW,6,D-8,0,BASE+3,D/2,null,null,2,G.inner);
  for(var i=0;i<DHS.length-1;i++){var yb=drawerTop(i)-DHS[i]-FG/2;rb(IW,3,D-12,0,yb,D/2-4,null,null,1.5,G.inner);}
  rb(IW,5,D-8,0,Z1-2.5,D/2-4,null,null,1.5,G.inner);              /* inner ceiling */
  rb(W,TOPT,D+TH,0,Z1+TOPT/2,(D+TH)/2);                          /* top slab, flush with the fronts */

  /* drawers */
  var w=W-3,Dd=D-26,nw=74,nd=15,ns=10;
  DRAWERS.forEach(function(d,i){
    var H=DHS[i],zt=drawerTop(i),zb=zt-H;
    var grp=new T3.Group();grp.position.set(0,zb,D);cab.add(grp);
    /* front with a finger-pull notch cut into its top edge */
    var nx=-nw/2-6;
    var pts=[[-w/2,0],[w/2,0],[w/2,H],[nx+nw,H],[nx+nw-ns,H-nd],[nx+ns,H-nd],[nx,H],[-w/2,H]];
    var shape=shapeOf(filletR(pts,[RAD,RAD,RAD,3,4,4,3,RAD]));
    var fgeo=new T3.ExtrudeGeometry(shape,{depth:TH-1.6,bevelEnabled:true,bevelThickness:0.8,bevelSize:0.8,bevelSegments:3,curveSegments:6});
    mesh(fgeo,G.body,0,0,0.8,grp,i);
    /* recess behind the notch */
    rb(nw+6,nd+4,3,nx+nw/2,H-nd/2-2,-1.4,grp,i,1.5,G.inner);
    /* drawer box */
    var bh=H-14;
    rb(w-20,3,Dd,0,4.5,-Dd/2-1,grp,i,1,G.inner);
    rb(3,bh,Dd,-(w/2-11.5),3+bh/2,-Dd/2-1,grp,i,1,G.inner);
    rb(3,bh,Dd,(w/2-11.5),3+bh/2,-Dd/2-1,grp,i,1,G.inner);
    rb(w-20,bh,3,0,3+bh/2,-Dd-0.5,grp,i,1,G.inner);
    /* printed label under the pull, file count in the corner */
    var fd=canvasTex(w,H,4,function(x){
      var act=open===i;
      x.textAlign="center";x.textBaseline="middle";x.fillStyle=act?tok("--accent"):tok("--muted");
      x.font='600 8px "Inter Tight", "Helvetica Neue", Arial, sans-serif';try{x.letterSpacing="1.4px";}catch(e){}
      x.fillText(d.label,nx+nw/2+w/2,nd+12);
      x.textAlign="right";x.fillStyle=tok("--muted");x.font='500 5.5px "Inter Tight", "Helvetica Neue", Arial, sans-serif';try{x.letterSpacing="0.6px";}catch(e){}
      x.fillText(d.count,w-12,H-9);
    });
    var dm=new T3.MeshBasicMaterial({map:fd.tex,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
    var dp=new T3.Mesh(new T3.PlaneGeometry(w,H),dm);dp.position.set(0,H/2,TH+0.25);grp.add(dp);G.decals.push(fd);
    /* index cards with tabs */
    var cw=w-36,bodyH=H-22,tw=60,th=10,cards=[];
    d.cards.forEach(function(label,k){
      var t=6+((k*37)%(cw-tw-12));
      var cp=[[0,0],[cw,0],[cw,bodyH],[t+tw,bodyH],[t+tw-3,bodyH+th],[t+3,bodyH+th],[t,bodyH],[0,bodyH]];
      var geo=new T3.ExtrudeGeometry(shapeOf(filletR(cp,[3,3,3,2,2.5,2.5,2,3])),{depth:0.8,bevelEnabled:false});
      var cg=new T3.Group();cg.position.set(-cw/2,6,-16-k*32);grp.add(cg);
      var cmat=new T3.MeshStandardMaterial({color:FILE_COLORS[k%FILE_COLORS.length],roughness:0.9,metalness:0});
      var m=new T3.Mesh(geo,cmat);m.castShadow=true;m.receiveShadow=true;m.userData.di=i;m.userData.ck=k;cg.add(m);G.pick.push(m);cg.userData.lift={cur:0,target:0};
      m.add(new T3.LineSegments(new T3.EdgesGeometry(geo,30),G.cardLine));
      var hh=bodyH+th;
      var cd=canvasTex(cw,hh,3,function(x){
        var act=open===i;
        x.strokeStyle="rgba(26,29,35,0.16)";x.lineWidth=0.6;x.beginPath();
        x.moveTo(8,th+11);x.lineTo(cw-8,th+11);x.moveTo(8,th+19);x.lineTo(cw-30,th+19);x.stroke();
        x.fillStyle="#1a1d23";x.textAlign="center";x.textBaseline="middle";
        x.font='600 5.6px "Inter Tight", "Helvetica Neue", Arial, sans-serif';x.fillText(label,t+tw/2,th/2+0.5);
      });
      var cm=new T3.MeshBasicMaterial({map:cd.tex,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
      var pl=new T3.Mesh(new T3.PlaneGeometry(cw,hh),cm);pl.position.set(cw/2,hh/2,1.05);cg.add(pl);G.decals.push(cd);
      cards.push(cg);
    });
    G.drawers.push(grp);G.cards.push(cards);
  });
  /* ---------- props on top: a flower vase and a gallery book ---------- */
  var TOP=Z1+TOPT;
  /* vase: turned ceramic body, dark water line, stems, leaves and blooms in the file colours */
  var vase=new T3.Group();vase.position.set(60,TOP,D*0.34);cab.add(vase);G.vase=vase;
  /* sculptural speckled ceramic: flared foot, round body, slim neck with three stacked rings */
  var spk=document.createElement("canvas");spk.width=1024;spk.height=1100;var sx=spk.getContext("2d");
  sx.fillStyle="#ece6dc";sx.fillRect(0,0,1024,1100);
  var rnd=(function(sd){return function(){sd=(sd*16807)%2147483647;return(sd-1)/2147483646;};})(7);
  for(var q=0;q<3400;q++){var r0=0.8+Math.pow(rnd(),3)*2.6;sx.globalAlpha=0.55+rnd()*0.45;
    sx.fillStyle=["#26345f","#3d4a72","#5f646e","#1d2230","#8a7f70"][Math.floor(rnd()*5)];
    sx.beginPath();sx.ellipse(rnd()*1024,rnd()*1100,r0,r0*(0.75+rnd()*0.3),rnd()*3,0,Math.PI*2);sx.fill();}
  sx.globalAlpha=1;
  var spkTex=new T3.CanvasTexture(spk);spkTex.wrapS=T3.RepeatWrapping;spkTex.anisotropy=renderer.capabilities.getMaxAnisotropy();
  G.ceramic=new T3.MeshStandardMaterial({color:0xffffff,map:spkTex,roughness:0.42,metalness:0});
  var prof=[[0,0],[8.5,0],[9.5,1.2],[8,3],[5.2,5.5],[5,7.5]];
  for(var a=-80;a<=82;a+=6){var rad=a*Math.PI/180;prof.push([Math.max(4.6,16.5*Math.cos(rad)),24+16.5*Math.sin(rad)]);}
  for(var yy=40;yy<=64;yy+=0.75){var ring=0;[45,51,57].forEach(function(c){var t=(yy-c)/2.2;if(Math.abs(t)<1)ring=Math.max(ring,Math.cos(t*Math.PI/2));});prof.push([4.5+3.3*ring,yy]);}
  prof.push([5.4,65.2],[5.6,66.4],[4.9,67],[3.8,66.4],[3.6,62]);
  prof=prof.map(function(p){return new T3.Vector2(p[0],p[1]);});
  var vb=new T3.Mesh(new T3.LatheGeometry(prof,48),G.ceramic);vb.castShadow=true;vb.receiveShadow=true;vb.userData.obj="vase";vase.add(vb);G.pick.push(vb);
  var water=new T3.Mesh(new T3.CircleGeometry(3.7,24),new T3.MeshStandardMaterial({color:0x1d2a22,roughness:0.4}));water.rotation.x=-Math.PI/2;water.position.y=64;vase.add(water);
  var bouquet=new T3.Group();bouquet.position.y=64;vase.add(bouquet);G.bouquet=bouquet;
  var stemMat=new T3.MeshStandardMaterial({color:0x5f8f5a,roughness:0.8}),leafMat=new T3.MeshStandardMaterial({color:0x6fa368,roughness:0.75,side:T3.DoubleSide});
  var blooms=[[-8,44,3,"#e8553e"],[6,54,-3,"#e89a1c"],[1,62,4,"#3f6ff0"],[9,38,6,"#e8553e"]];
  var up=new T3.Vector3(0,1,0);
  blooms.forEach(function(b,bi){
    var tipV=new T3.Vector3(b[0],b[1],b[2]),len=tipV.length();
    var st=new T3.Mesh(new T3.CylinderGeometry(0.7,0.9,len,6),stemMat);st.position.copy(tipV.clone().multiplyScalar(0.5));
    st.quaternion.setFromUnitVectors(up,tipV.clone().normalize());st.castShadow=true;bouquet.add(st);
    var head=new T3.Group();head.position.copy(tipV);head.quaternion.setFromUnitVectors(up,tipV.clone().normalize());bouquet.add(head);
    var pm=new T3.MeshStandardMaterial({color:b[3],roughness:0.7});
    for(var p=0;p<6;p++){var pet=new T3.Mesh(new T3.SphereGeometry(5,12,8),pm);pet.scale.set(1,0.32,0.55);var a=p/6*Math.PI*2;
      pet.position.set(Math.cos(a)*5,0,Math.sin(a)*5);pet.rotation.y=-a;pet.castShadow=true;pet.userData.obj="vase";head.add(pet);G.pick.push(pet);}
    var ctr=new T3.Mesh(new T3.SphereGeometry(2.2,12,10),new T3.MeshStandardMaterial({color:0x3a2a1c,roughness:0.9}));ctr.position.y=0.8;head.add(ctr);
    if(bi%2===0){var lf=new T3.Mesh(new T3.SphereGeometry(5,10,6),leafMat);lf.scale.set(1,0.12,0.42);lf.position.copy(tipV.clone().multiplyScalar(0.45));
      lf.rotation.set(0.3,bi,0.9*(bi%4?-1:1));lf.castShadow=true;bouquet.add(lf);}
  });
  /* book: hardback lying on the top, cover opens on a hinge at the spine */
  var book=new T3.Group();book.position.set(-50,TOP,D*0.64);book.rotation.y=0.24;cab.add(book);G.book=book;
  G.coverMat=new T3.MeshStandardMaterial({color:0x172046,roughness:0.6,metalness:0});
  var pageMat=new T3.MeshStandardMaterial({color:0xf3efe6,roughness:0.95});
  var BW=74,BD=96,BT=2.2,PT=7;
  function bm(geo,mat,x,y,z,parent){var m=new T3.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;m.userData.obj="book";parent.add(m);G.pick.push(m);return m;}
  bm(RBox(BW,BT,BD,2,1),G.coverMat,0,BT/2,0,book);
  bm(RBox(BW-5,PT,BD-5,1,0.6),pageMat,1,BT+PT/2,0,book);
  bm(RBox(4,BT*2+PT,BD,2,1.6),G.coverMat,-BW/2+1,(BT*2+PT)/2,0,book);
  var hinge=new T3.Group();hinge.position.set(-BW/2+1,BT+PT,0);book.add(hinge);G.hinge=hinge;
  var cover=bm(RBox(BW,BT,BD,2,1),G.coverMat,BW/2-1,BT/2,0,hinge);
  var inner=new T3.Mesh(new T3.PlaneGeometry(BW-6,BD-6),pageMat);inner.rotation.x=Math.PI/2;inner.position.set(BW/2-1,-0.05,0);hinge.add(inner);
  var ct=canvasTex(BW,BD,5,function(x){
    x.strokeStyle="rgba(255,214,140,0.85)";x.lineWidth=0.5;x.strokeRect(6,6,BW-12,BD-12);
    x.fillStyle="#ffd68c";x.textAlign="center";x.textBaseline="middle";
    x.font='600 7.5px "Inter Tight", "Helvetica Neue", Arial, sans-serif';try{x.letterSpacing="2.4px";}catch(e){}x.fillText("GALLERY",BW/2,BD/2-4);
    x.font='500 4px "Inter Tight", "Helvetica Neue", Arial, sans-serif';try{x.letterSpacing="1px";}catch(e){}x.fillText("J. OLUWATOSIN",BW/2,BD/2+7);
  });
  var cd=new T3.Mesh(new T3.PlaneGeometry(BW,BD),new T3.MeshBasicMaterial({map:ct.tex,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));
  cd.rotation.x=-Math.PI/2;cd.position.set(0,BT/2+0.15,0);cover.add(cd);G.decals.push(ct);
  G.bookTop=TOP;G.bookOpen={cur:0,target:0};G.bookLift={cur:0,target:0};G.wiggle=0;
  /* speaker: fabric-front bookshelf speaker; woofer pumps and sound rings ripple while the playlist panel is open */
  var spk3=new T3.Group();spk3.position.set(-58,TOP,D*0.22);spk3.rotation.y=0.38;cab.add(spk3);G.spk=spk3;
  G.spkBody=new T3.MeshStandardMaterial({color:0x2b2d31,roughness:0.88,metalness:0});
  var gc=document.createElement("canvas");gc.width=gc.height=256;var gx=gc.getContext("2d");gx.fillStyle="#fff";gx.fillRect(0,0,256,256);
  gx.fillStyle="#000";for(var gy=4;gy<256;gy+=8)for(var gxx=4+((gy/8)%2)*4;gxx<256;gxx+=8){gx.globalAlpha=0.28;gx.beginPath();gx.arc(gxx,gy,1.6,0,Math.PI*2);gx.fill();}
  var grTex=new T3.CanvasTexture(gc);grTex.wrapS=grTex.wrapT=T3.RepeatWrapping;grTex.repeat.set(3,4);
  G.spkGrille=new T3.MeshStandardMaterial({color:0x2b2d31,roughness:0.95,map:grTex});
  var SW=40,SH=58,SD=32;
  function sm(geo,mat,x,y,z,par){var m=new T3.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;m.userData.obj="speaker";(par||spk3).add(m);G.pick.push(m);return m;}
  sm(RBox(SW,SH,SD,3,6),G.spkBody,0,SH/2,0);
  sm(RBox(SW-6,SH-6,1.2,2,4),G.spkGrille,0,SH/2,SD/2-0.2);
  var ringMat=new T3.MeshStandardMaterial({color:0x9aa0a8,roughness:0.3,metalness:0.7});
  var coneMat=new T3.MeshStandardMaterial({color:0x141518,roughness:0.55,side:T3.DoubleSide});
  sm(new T3.TorusGeometry(11.2,1.3,12,48),ringMat,0,20,SD/2+0.9);
  var woof=new T3.Group();woof.position.set(0,20,SD/2+0.4);spk3.add(woof);G.woof=woof;
  var cone=sm(new T3.CylinderGeometry(10.2,3.4,4.2,40,1,true),coneMat,0,0,-1.8,woof);cone.rotation.x=Math.PI/2;
  var cap=sm(new T3.SphereGeometry(3.6,20,12,0,Math.PI*2,0,Math.PI/2),coneMat,0,0,-0.4,woof);cap.rotation.x=Math.PI/2;
  sm(new T3.TorusGeometry(4.6,0.9,10,32),ringMat,0,44,SD/2+0.7);
  var dome=sm(new T3.SphereGeometry(3.1,16,10,0,Math.PI*2,0,Math.PI/2),new T3.MeshStandardMaterial({color:0x1d1e22,roughness:0.3,metalness:0.4}),0,44,SD/2+0.2);dome.rotation.x=Math.PI/2;
  G.led=new T3.Mesh(new T3.SphereGeometry(1.1,12,10),new T3.MeshBasicMaterial({color:0x3a3d44}));G.led.position.set(13.5,51,SD/2+0.6);spk3.add(G.led);
  G.rings=[];for(var ri=0;ri<3;ri++){var rg=new T3.Mesh(new T3.TorusGeometry(11.5,0.45,8,48),new T3.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0,depthWrite:false}));
    rg.position.set(0,20,SD/2+2);rg.visible=false;spk3.add(rg);G.rings.push(rg);}
  G.music={on:false,t0:0};G.SD=SD;
  /* iPhone lying face up on the top; buzzes and lights up when clicked */
  var ph=new T3.Group();ph.position.set(58,TOP,D*0.74);ph.rotation.y=-0.32;cab.add(ph);G.phone=ph;
  var PW=38,PL=78,PT=3.4;
  var phMat=new T3.MeshStandardMaterial({color:0x3a3c42,roughness:0.35,metalness:0.75});
  var glass=new T3.MeshStandardMaterial({color:0x0b0c0f,roughness:0.15,metalness:0.2});
  function pm(geo,mat,x,y,z){var m=new T3.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;m.userData.obj="phone";ph.add(m);G.pick.push(m);return m;}
  pm(RBox(PW,PT,PL,3,6),phMat,0,PT/2,0);
  pm(RBox(PW-1.6,0.4,PL-1.6,2,5.4),glass,0,PT+0.1,0);
  G.phoneScreen=canvasTex(PW-3,PL-3,10,function(x){
    var on=G&&G.phoneOn,W2=PW-3,H2=PL-3;
    x.fillStyle=on?"#10131c":"#07080a";x.beginPath();x.roundRect?x.roundRect(0,0,W2,H2,4.6):x.rect(0,0,W2,H2);x.fill();
    if(!on)return;
    var gr=x.createLinearGradient(0,0,W2,H2);gr.addColorStop(0,"#2b3a7a");gr.addColorStop(.55,"#5a2f6e");gr.addColorStop(1,"#b45a3c");
    x.fillStyle=gr;x.beginPath();x.roundRect?x.roundRect(0,0,W2,H2,4.6):x.rect(0,0,W2,H2);x.fill();
    x.fillStyle="#000";x.beginPath();x.roundRect?x.roundRect(W2/2-5,1.6,10,2.6,1.3):x.rect(W2/2-5,1.6,10,2.6);x.fill();
    var d=new Date(),hh=String(d.getHours()).padStart(2,"0"),mm=String(d.getMinutes()).padStart(2,"0");
    x.fillStyle="#fff";x.textAlign="center";x.textBaseline="alphabetic";
    x.font='500 3px "Inter Tight", Arial, sans-serif';x.fillText(d.toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"}),W2/2,11);
    x.font='600 11px "Inter Tight", Arial, sans-serif';x.fillText(hh+":"+mm,W2/2,22.5);
    x.fillStyle="rgba(255,255,255,.82)";x.beginPath();x.roundRect?x.roundRect(2,31,W2-4,19,3):x.rect(2,31,W2-4,19);x.fill();
    x.fillStyle="#2d45d2";x.beginPath();x.roundRect?x.roundRect(4,33.2,5,5,1.4):x.rect(4,33.2,5,5);x.fill();
    x.fillStyle="#fff";x.font='700 3px "Inter Tight", Arial';x.fillText("J",6.5,36.8);
    x.textAlign="left";x.fillStyle="#111";x.font='700 2.6px "Inter Tight", Arial, sans-serif';x.fillText("OJ · Assistant",10.5,36.4);
    x.fillStyle="#666";x.font='500 2.2px "Inter Tight", Arial';x.textAlign="right";x.fillText("now",W2-4,36.4);
    x.textAlign="left";x.fillStyle="#222";x.font='500 2.4px "Inter Tight", Arial, sans-serif';
    x.fillText("📞 Incoming call…",4,42);x.fillText("Answer to hear about",4,45.2);x.fillText("Jesutofunmi's work.",4,48.4);
    x.fillStyle="rgba(255,255,255,.9)";x.beginPath();x.roundRect?x.roundRect(W2/2-6,H2-3,12,1,0.5):x.rect(W2/2-6,H2-3,12,1);x.fill();
  });
  var scr=new T3.Mesh(new T3.PlaneGeometry(PW-3,PL-3),new T3.MeshBasicMaterial({map:G.phoneScreen.tex,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4}));
  scr.rotation.x=-Math.PI/2;scr.position.y=PT+0.8;scr.userData.obj="phone";ph.add(scr);G.pick.push(scr);
  var bump=pm(RBox(14,1.2,14,2,3.5),phMat,-PW/2+9,-0.4,-PL/2+9);
  G.phoneOn=false;G.buzz={until:0,t0:0};G.phoneBase={x:58,z:D*0.74,ry:-0.32};
  G.ray=new T3.Raycaster();G.ndc=new T3.Vector2();
  applyTheme();
  sizeTo();
  if(window.ResizeObserver)new ResizeObserver(function(){sizeTo();render3d();}).observe(svg);
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",function(){applyTheme();render3d();});
  new MutationObserver(function(){applyTheme();render3d();}).observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]});
  if(document.fonts&&document.fonts.load){Promise.all([document.fonts.load('600 16px "Inter Tight"'),document.fonts.load('500 16px "Inter Tight"')]).then(function(){redrawDecals();render3d();},function(){});}
  return true;
}
function redrawDecals(){if(G)G.decals.forEach(function(d){d.redraw();});}
function applyTheme(){
  if(!G)return;
  var dark=isDark();
  G.body.color.set(dark?0x222428:0xf4f4f2);
  G.inner.color.set(dark?0x1a1c1f:0xe9e9e6);
  G.hemi.color.set(0xffffff);G.hemi.groundColor.set(dark?0x0e0f12:0xd8dbe1);
  G.hemi.intensity=dark?0.9:0.78;G.key.intensity=dark?0.75:0.5;G.rim.intensity=dark?0.55:0.25;G.fill.intensity=dark?0.25:0.18;
  if(G.spkBody){G.spkBody.color.set(dark?0x2b2d31:0xd8d2c7);G.spkGrille.color.set(dark?0x2b2d31:0xd8d2c7);}
  G.floorMat.opacity=dark?0.45:0.11;G.blobMat.opacity=dark?0.8:0.4;
  redrawDecals();
}
function sizeTo(){
  if(!G)return;var r=G.renderer.domElement.getBoundingClientRect();if(!r.width||!r.height)return;
  G.renderer.setSize(r.width,r.height,false);G.camera.aspect=r.width/r.height;G.camera.updateProjectionMatrix();
}
function render3d(){
  if(!G)return;
  var th=Math.PI/4-VIEW.yaw,ph=VIEW.tilt,R=1330,ty=Z1*0.5+34;
  G.camera.position.set(R*Math.sin(th)*Math.cos(ph),ty+R*Math.sin(ph),R*Math.cos(th)*Math.cos(ph));
  G.camera.lookAt(0,ty-6,0);
  var now=performance.now();
  G.drawers.forEach(function(g,i){
    g.position.z=D+state[i].cur;
    G.cards[i].forEach(function(cg,k){cg.rotation.x=JIG*0.11*Math.sin(now/42+k*1.9);cg.position.y=6+cg.userData.lift.cur;});
  });
  if(G.hinge){G.hinge.rotation.z=G.bookOpen.cur*2.75;G.book.position.y=G.bookTop+G.bookLift.cur;
    if(G.phone){var BZ=G.buzz,pb=G.phoneBase;
      if(now<BZ.until){var tt=now-BZ.t0,on=(tt%560)<340,a=on?1:0;
        G.phone.position.x=pb.x+a*(Math.sin(now/9)*1.3);G.phone.position.z=pb.z+a*(Math.cos(now/11)*1.0);G.phone.rotation.y=pb.ry+a*Math.sin(now/13)*0.05;
        BZ.drift=(BZ.drift||0)+a*0.04;G.phone.position.x+=BZ.drift*0.6;}
      else{G.phone.position.set(pb.x+(BZ.drift||0)*0.6,G.bookTop,pb.z);G.phone.rotation.y=pb.ry;}}
    if(G.music){var M=G.music;
      if(M.on){var t=now-M.t0,beat=t%469,env=Math.exp(-beat/85);G.woof.position.z=G.SD/2+0.4+env*1.6;G.woof.scale.setScalar(1+env*0.03);
        G.led.material.color.set(0x7fd8b4);
        G.rings.forEach(function(rg,ri){var ph=((t/1400)+ri/3)%1;rg.visible=true;rg.scale.setScalar(1+ph*2.4);rg.position.z=G.SD/2+2+ph*26;rg.material.opacity=(1-ph)*0.45;});}
      else{G.woof.position.z=G.SD/2+0.4;G.woof.scale.setScalar(1);G.led.material.color.set(0x3a3d44);G.rings.forEach(function(rg){rg.visible=false;});}}
    var sw=Math.max(G.wiggle,JIG*0.6);G.bouquet.rotation.z=sw*0.14*Math.sin(now/120);G.bouquet.rotation.x=sw*0.09*Math.sin(now/150+1);}
  G.renderer.render(G.scene,G.camera);
}
function renderArt(){render3d();}
function pickAt(cx,cy){
  if(!G)return null;var r=G.renderer.domElement.getBoundingClientRect();
  G.ndc.set(((cx-r.left)/r.width)*2-1,-((cy-r.top)/r.height)*2+1);
  G.ray.setFromCamera(G.ndc,G.camera);
  var hit=G.ray.intersectObjects(G.pick,false)[0];
  return hit&&hit.object.userData.di>=0?hit.object.userData.di:null;
}
function pickObj(cx,cy){
  if(!G)return null;var r=G.renderer.domElement.getBoundingClientRect();
  G.ndc.set(((cx-r.left)/r.width)*2-1,-((cy-r.top)/r.height)*2+1);G.ray.setFromCamera(G.ndc,G.camera);
  var hit=G.ray.intersectObjects(G.pick,false)[0];return hit?hit.object.userData.obj||null:null;
}
var OBJHOV=null,VASE_TIPS=["Fresh from the garden.","They match the files, on purpose.","Careful, that vase is ceramic!","A little colour for the desk."];
function setObjHover(o){
  if(o===OBJHOV)return;OBJHOV=o;
  if(G&&G.hinge){G.bookLift.target=o==="book"&&G.bookOpen.target===0?5:0;if(o==="vase")G.wiggle=Math.max(G.wiggle,0.7);}
  svg.classList.toggle("card",!!o||!!CARDHOV);if(window.curObj)curObj(o);kick();
}
function pickCard(cx,cy){
  if(!G)return null;var r=G.renderer.domElement.getBoundingClientRect();
  G.ndc.set(((cx-r.left)/r.width)*2-1,-((cy-r.top)/r.height)*2+1);G.ray.setFromCamera(G.ndc,G.camera);
  var hit=G.ray.intersectObjects(G.pick,false)[0];if(!hit)return null;var u=hit.object.userData;
  if(u.ck==null||u.di!==open||state[u.di].cur<OPEN*0.7)return null;return{di:u.di,ck:u.ck};
}
function setCardHover(c){
  var same=(c&&CARDHOV&&c.di===CARDHOV.di&&c.ck===CARDHOV.ck)||(!c&&!CARDHOV);if(same)return;
  if(CARDHOV)G.cards[CARDHOV.di][CARDHOV.ck].userData.lift.target=0;
  CARDHOV=c;if(c)G.cards[c.di][c.ck].userData.lift.target=LIFT;
  svg.classList.toggle("card",!!c);if(window.curCard)curCard(!!c);kick();
}
function setHover(i){
  if(i===HOV)return;
  if(HOV!=null&&open!==HOV)state[HOV].target=0;
  HOV=i;if(i!=null&&open!==i)state[i].target=HOVER;
  svg.classList.toggle("over",i!=null);
  if(window.curHover)curHover(i);
  kick();
}
function tick(){
  var moving=false;
  state.forEach(function(st){var df=st.target-st.cur;if(reduce||Math.abs(df)<0.4){st.cur=st.target;}else{st.cur+=df*0.17;moving=true;}});
  if(G&&G.lamp){var dl=G.lampT-G.lamp.intensity;if(reduce||Math.abs(dl)<0.01)G.lamp.intensity=G.lampT;else{G.lamp.intensity+=dl*0.12;moving=true;}}
  if(G&&G.hinge){[G.bookOpen,G.bookLift].forEach(function(L){var df=L.target-L.cur;if(reduce||Math.abs(df)<0.002)L.cur=L.target;else{L.cur+=df*0.14;moving=true;}});
    if(G.wiggle>0.01){G.wiggle*=0.975;moving=true;}else G.wiggle=0;
    if(G.music&&G.music.on){moving=true;if(G.wiggle<0.25)G.wiggle=0.25;}
    if(G.buzz&&performance.now()<G.buzz.until+40)moving=true;}
  if(G)G.cards.forEach(function(cs){cs.forEach(function(cg){var L=cg.userData.lift,df=L.target-L.cur;if(reduce||Math.abs(df)<0.2)L.cur=L.target;else{L.cur+=df*0.22;moving=true;}});});
  var dy=VIEW.ty-VIEW.yaw,dt=VIEW.tt-VIEW.tilt,turned=Math.abs(dy)>1e-4||Math.abs(dt)>1e-4;
  JIG=reduce?0:Math.min(1,JIG*0.9+Math.abs(dy)*0.9);if(JIG>0.02)moving=true;else JIG=0;
  if(turned){if(reduce||(Math.abs(dy)<0.001&&Math.abs(dt)<0.0005)){VIEW.yaw=VIEW.ty;VIEW.tilt=VIEW.tt;}else{VIEW.yaw+=dy*0.2;VIEW.tilt+=dt*0.2;moving=true;}}
  render3d();
  raf=moving?requestAnimationFrame(tick):0;
}
function kick(){if(!raf)raf=requestAnimationFrame(tick);}
window.lampTo=function(on){if(G&&G.lamp){G.lampT=on?2.4:0;kick();}};
if(!(T3&&build3d())){
  svg.classList.add("nogl");
  var msg=document.createElement("p");msg.className="nogl-msg";msg.textContent="Your browser can't draw the 3D cabinet. Use the email below to get in touch.";svg.appendChild(msg);
}

/* ================= pinned note ================= */
var note=document.getElementById("note"),mq=window.matchMedia("(max-width:800px)");
var ME='img/about/me-note.jpg';
var PIN='<svg class="pin" viewBox="0 0 22 30" aria-hidden="true"><line x1="11" y1="14" x2="11" y2="29" stroke="var(--line)" stroke-width="1.5" stroke-linecap="round"/><ellipse cx="11" cy="15" rx="7" ry="2.4" fill="var(--accent)" opacity=".55"/><circle cx="11" cy="8" r="7" fill="var(--accent)"/><circle cx="8.6" cy="5.6" r="2" fill="var(--sheet)" opacity=".55"/></svg>';
/* ---------- voice intro ---------- */
var PITCH="Hi, I'm Jesutofunmi, a product designer based in the UK. I've spent over three years designing fintech products, from Firstchekout at FirstBank to Fundall, and more recently residential platforms at Keys in London. I studied finance before I studied design, so I start with how the money moves and work outwards to the screen. I also hold an MSc in project management with data analytics, so I like my design decisions backed by evidence. Open a drawer to see the work.";
/* to use your own recording, set VOICE_SRC to an audio file or data: URI */
var VOICES={ldn:{src:"audio/voice-london.mp3",dur:87,bars:[0.55, 0.56, 0.53, 0.7, 0.23, 0.47, 0.46, 0.19, 0.48, 0.6, 0.21, 0.66, 0.39, 0.41, 0.27, 0.35, 0.59, 0.38, 0.14, 0.46, 0.36, 0.35, 0.55, 0.48, 0.43, 0.21, 0.27, 0.17, 0.72, 0.46, 0.16, 0.17, 0.59, 1.0, 0.45, 0.32, 0.35, 0.16, 0.46, 0.39, 0.38, 0.28, 0.41, 0.38, 0.29, 0.34, 0.2, 0.3, 0.31, 0.19, 0.79, 0.26, 0.36, 0.24, 0.2, 0.28, 0.15, 0.19, 0.21, 0.13, 0.41, 0.47, 0.23, 0.26, 0.21, 0.29, 0.25, 0.1, 0.19, 0.65, 0.36, 0.1]},
 ng:{src:"audio/voice-lagos.mp3",dur:68,bars:[0.34, 0.46, 0.28, 0.23, 0.1, 0.74, 0.4, 0.33, 0.28, 0.24, 0.45, 0.27, 0.37, 0.2, 0.19, 0.19, 0.28, 0.16, 0.24, 0.21, 0.15, 0.21, 0.34, 0.38, 0.29, 0.24, 0.21, 0.29, 0.19, 0.54, 0.47, 0.26, 0.33, 0.27, 0.29, 0.17, 0.36, 0.25, 0.5, 0.4, 0.3, 0.24, 0.32, 0.24, 0.33, 0.18, 0.4, 0.21, 0.41, 0.23, 0.45, 0.25, 1.0, 0.32, 0.28, 0.18, 0.36, 0.22, 0.42, 0.26, 0.25, 0.25, 0.19, 0.6, 0.3, 0.25, 0.25, 0.11, 0.31, 0.26, 0.1, 0.1]}};
var VOICE_SRC=VOICES.ldn.src;
/* paste the words of your recording here to show a transcript */
var VOICE_TRANSCRIPT="";
var SENTS=PITCH.match(/[^.!?]+[.!?]+/g).map(function(t){return t.trim();});
var VDUR=VOICE_SRC?VOICES.ldn.dur:Math.round(PITCH.split(/\s+/).length/2.6);
var CANSPEAK=!!VOICE_SRC||("speechSynthesis" in window);
var V={state:"idle",el:0,t0:0,raf:0,tok:0,audio:null};
/* waveform of the recording, measured from the audio (72 bins) */
var BARS=VOICES.ldn.bars.slice();
var ICO={play:'<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3.2v9.6c0 .5.5.8.9.5l7-4.8a.6.6 0 0 0 0-1L5.9 2.7c-.4-.3-.9 0-.9.5z" fill="currentColor"/></svg>',
 pause:'<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="4" y="3" width="3" height="10" rx="1" fill="currentColor"/><rect x="9" y="3" width="3" height="10" rx="1" fill="currentColor"/></svg>',
 x:'<svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>',
 replay:'<svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8a5 5 0 1 0 1.5-3.6"/><path d="M3 2.8v2.6h2.6"/></svg>'};
function fmt(t){t=Math.max(0,Math.round(t));return Math.floor(t/60)+":"+String(t%60).padStart(2,"0");}
function voiceHTML(){
  return '<div class="voice" id="voice"><button type="button" class="vplay" id="vplay" aria-label="Play voice intro"'+(CANSPEAK?'':' disabled')+'>'+ICO.play+'</button>'+
   '<div class="vwave" id="vwave" role="slider" tabindex="0" aria-label="Voice intro position" aria-valuemin="0" aria-valuemax="'+VDUR+'" aria-valuenow="0" aria-valuetext="0:00 of '+fmt(VDUR)+'">'+
   BARS.map(function(h){return'<i style="height:'+Math.round(h*100)+'%"></i>';}).join("")+'</div>'+
   '<button type="button" class="vx" id="vx" aria-label="Stop voice intro">'+ICO.x+'</button></div>'+
   (VOICE_SRC&&!VOICE_TRANSCRIPT?'':'<details class="vtrans"><summary class="mono">Transcript</summary><p>'+(VOICE_TRANSCRIPT||PITCH)+'</p></details>');
}
function vSeek(frac){
  if(!VOICE_SRC)return;
  frac=Math.max(0,Math.min(1,frac));
  if(V.state==="idle"||V.state==="done")vPlay();
  var go=function(){var d=V.audio.duration||VDUR;V.audio.currentTime=frac*d;vUI();};
  if(V.audio.readyState>=1)go();else V.audio.addEventListener("loadedmetadata",go,{once:true});
}
function elapsed(){return V.audio&&!isNaN(V.audio.currentTime)?V.audio.currentTime:V.el+(V.state==="playing"?(performance.now()-V.t0)/1000:0);}
function vUI(){
  var box=document.getElementById("voice");if(!box)return;
  var dur=V.audio&&V.audio.duration?V.audio.duration:VDUR,el=elapsed();
  var p=V.state==="done"?1:V.state==="idle"?0:Math.min(0.98,el/dur);
  var bars=box.querySelectorAll(".vwave i"),on=Math.round(p*bars.length);
  for(var k=0;k<bars.length;k++)bars[k].classList.toggle("on",k<on);
  var w=document.getElementById("vwave");w.setAttribute("aria-valuenow",Math.round(V.state==="done"?dur:el));w.setAttribute("aria-valuetext",fmt(V.state==="done"?dur:el)+" of "+fmt(dur));
  box.classList.toggle("playing",V.state==="playing");
  var b=document.getElementById("vplay");
  b.innerHTML=V.state==="playing"?ICO.pause:V.state==="done"?ICO.replay:ICO.play;
  b.setAttribute("aria-label",V.state==="playing"?"Pause voice intro":V.state==="done"?"Replay voice intro":"Play voice intro");
}
function vLoop(){vUI();if(V.state==="playing")V.raf=requestAnimationFrame(vLoop);}
function pickVoice(){
  var vs=window.speechSynthesis?speechSynthesis.getVoices():[],en=vs.filter(function(v){return/^en/i.test(v.lang);});
  if(!en.length)return null;
  var male=/daniel|arthur|george|ryan|thomas|oliver|male|guy|aaron|rishi|alex|fred/i;
  return en.filter(function(v){return/en-GB/i.test(v.lang)&&male.test(v.name);})[0]||en.filter(function(v){return male.test(v.name);})[0]||en.filter(function(v){return/en-GB/i.test(v.lang);})[0]||en[0];
}
if(window.speechSynthesis){try{speechSynthesis.getVoices();speechSynthesis.onvoiceschanged=function(){};}catch(e){}}
function vPlay(){
  if(V.state==="playing"){
    if(V.audio)V.audio.pause();else{speechSynthesis.pause();V.el+=(performance.now()-V.t0)/1000;}
    V.state="paused";vUI();return;
  }
  if(V.state==="paused"){
    if(V.audio)V.audio.play();else{speechSynthesis.resume();V.t0=performance.now();}
    V.state="playing";vLoop();return;
  }
  var tok=++V.tok;V.el=0;V.t0=performance.now();V.state="playing";
  if(VOICE_SRC){
    if(!V.audio){V.audio=new Audio(VOICE_SRC);V.audio.addEventListener("ended",function(){V.state="done";vUI();});}
    V.audio.currentTime=0;V.audio.play().catch(function(){V.state="idle";vUI();});
  }else{
    speechSynthesis.cancel();
    var voice=pickVoice();
    SENTS.forEach(function(t,k){
      var u=new SpeechSynthesisUtterance(t);
      if(voice){u.voice=voice;u.lang=voice.lang;}else u.lang="en-GB";
      u.rate=1;u.pitch=0.95;
      if(k===SENTS.length-1)u.onend=function(){if(tok===V.tok&&V.state==="playing"){V.state="done";vUI();}};
      u.onerror=function(ev){if(tok===V.tok&&ev.error!=="interrupted"&&ev.error!=="canceled"){V.state="idle";vUI();}};
      speechSynthesis.speak(u);
    });
  }
  vLoop();
}
function setVoiceScene(ng){
  var c=ng?VOICES.ng:VOICES.ldn;if(VOICE_SRC===c.src)return;
  vStop();if(V.audio){V.audio.pause();V.audio=null;}
  VOICE_SRC=c.src;VDUR=c.dur;BARS=c.bars.slice();
  var box=document.getElementById("voice");
  if(box){var t=document.createElement("div");t.innerHTML=voiceHTML();box.replaceWith.apply(box,Array.prototype.slice.call(t.childNodes));vUI();}
}
function vStop(){
  if(V.state==="idle")return;
  V.tok++;V.state="idle";V.el=0;cancelAnimationFrame(V.raf);
  if(V.audio){V.audio.pause();V.audio.currentTime=0;}else if(window.speechSynthesis)speechSynthesis.cancel();
}
function setNote(i){vStop();
  var d=i==null?INTRO:DRAWERS[i];
  var h=PIN+(i==null?'<figure class="photo"><img src="'+ME+'" alt="Portrait of Jesutofunmi Oluwatosin" width="480" height="480"></figure>':'')+'<h2>'+d.title+'</h2><p>'+d.text+'</p>';
  if(i!=null){
    h+='<ul>'+d.items.map(function(t,k){return'<li><a href="'+FILE_LINKS[d.id][k]+'" data-file="'+k+'"><i style="background:'+FILE_COLORS[k%FILE_COLORS.length]+'"></i>'+t+'</a></li>';}).join("")+'</ul>';
    h+='<div class="note-actions"><a class="btn" href="#'+d.id+'">'+d.cta+' <span aria-hidden="true">→</span></a><button type="button" class="linkbtn" data-close>Close drawer</button></div>';
  }
  if(i==null)h+=voiceHTML();
  note.innerHTML=h;note.classList.remove("drop");void note.offsetWidth;note.classList.add("drop");
  placeNote(i);
}
function placeNote(i){
  if(mq.matches){note.style.removeProperty("--nt");return;}
  var r=svg.getBoundingClientRect();if(!r.width)return;
  /* pin the card near the top of the stage */
  var y=24;
  note.style.setProperty("--nt",r1(y)+"px");
}
function toggle(i){
  if(G)setCardHover(null);
  if(open===i){open=null;state[i].target=0;SFX.drawer(false);}
  else{if(open!=null)state[open].target=0;open=i;state[i].target=OPEN;SFX.drawer(true);}
  DRAWERS.forEach(function(d,j){d.hit.setAttribute("aria-expanded",open===j?"true":"false");});
  setNote(open);applyTheme();kick();
  if(window.curFlash)curFlash(open===i?"🤩":"😌",900);
}
DRAWERS.forEach(function(d,i){
  var b=document.createElement("button");b.type="button";b.className="sr-btn mono";b.textContent=d.title+" drawer";b.setAttribute("aria-expanded","false");
  b.addEventListener("click",function(){toggle(i);});
  b.addEventListener("keydown",function(e){if(e.key==="ArrowLeft"||e.key==="ArrowRight"){e.preventDefault();turnBy(e.key==="ArrowLeft"?-0.25:0.25,0);}});
  b.addEventListener("focus",function(){setHover(i);});b.addEventListener("blur",function(){setHover(null);});
  hits.appendChild(b);d.hit=b;
});
(function(){var p=document.createElement("button");p.type="button";p.className="sr-btn mono";p.textContent="Call OJ, Jesutofunmi's assistant";p.addEventListener("click",function(){ringPhone();});hits.appendChild(p);})();
(function(){var m=document.createElement("button");m.type="button";m.className="sr-btn mono";m.textContent="Open music speaker";m.addEventListener("click",function(){openMusic();});hits.appendChild(m);})();
(function(){var b=document.createElement("button");b.type="button";b.className="sr-btn mono";b.textContent="Open gallery book";
  b.addEventListener("click",function(){openGallery();});hits.appendChild(b);})();
note.addEventListener("pointerover",function(e){var a=e.target.closest("a[data-file]");if(open!=null&&G)setCardHover(a&&state[open].cur>OPEN*0.7?{di:open,ck:+a.getAttribute("data-file")}:null);});
note.addEventListener("pointerleave",function(){if(G)setCardHover(null);});
note.addEventListener("focusin",function(e){var a=e.target.closest("a[data-file]");if(a&&open!=null&&G)setCardHover({di:open,ck:+a.getAttribute("data-file")});});
note.addEventListener("focusout",function(){if(G)setCardHover(null);});
note.addEventListener("click",function(e){if(e.target.closest("#vplay")){vPlay();return;}
  if(e.target.closest("#vx")){vStop();vUI();return;}
  var wv=e.target.closest("#vwave");if(wv){var r=wv.getBoundingClientRect();vSeek((e.clientX-r.left)/r.width);return;}if(e.target.closest("[data-close]")&&open!=null){var i=open;toggle(i);DRAWERS[i].hit.focus();}});
document.addEventListener("keydown",function(e){if(e.key==="Escape"&&open!=null&&!document.getElementById("cabView").hidden)toggle(open);});
window.addEventListener("resize",function(){placeNote(open);});
note.addEventListener("keydown",function(e){if(!e.target.closest("#vwave")||!VOICE_SRC)return;
  if(e.key==="ArrowRight"||e.key==="ArrowLeft"){e.preventDefault();var d=(V.audio&&V.audio.duration)||VDUR;vSeek((elapsed()+(e.key==="ArrowRight"?5:-5))/d);}
  else if(e.key===" "||e.key==="Enter"){e.preventDefault();vPlay();}});

/* ---- drag to turn, in place ---- */
var drag=null,dragged=false;
var stage=document.getElementById("stage"),tip=document.createElement("div");
tip.className="tip";tip.setAttribute("aria-hidden","true");stage.appendChild(tip);
var TIPS=["Easy, it's heavier than it looks.","Mind your toes!","Careful, don't hit your leg on the corner.","Lift with your knees, not your back.","Steady now, the drawers are full.","Slowly, three years of work in there.","Watch the corner!","Don't scratch the floor.","Keep it level."];
var OPENTIPS=["A drawer's open, the files might slide out!","Careful, don't let the files drop!","Hold the drawer, the cards are wobbling.","Maybe close that drawer first?"];
var FAST=["Whoa, slow down!","Too fast, the files are flying!","Easy, easy!"];
var DONE=["Phew, nothing dropped.","Nice, all files safe.","Parked. Good lifting."];
var tipTimer=0,tipHide=0,lastTip="",lastFast=0;
function sayTip(list){var t;do{t=list[Math.floor(Math.random()*list.length)];}while(t===lastTip&&list.length>1);lastTip=t;
  tip.textContent=t;tip.classList.remove("pop");void tip.offsetWidth;tip.classList.add("show","pop");}
function pickList(){return open!=null&&Math.random()<0.65?OPENTIPS:TIPS;}
function moveTip(e){var r=stage.getBoundingClientRect(),half=Math.min(tip.offsetWidth/2+4,r.width/2);
  tip.style.left=r1(Math.max(half,Math.min(r.width-half,e.clientX-r.left)))+"px";tip.style.top=r1(Math.max(52,e.clientY-r.top))+"px";}
function turnBy(dyaw,dtilt){VIEW.ty=Math.max(-YAWMAX,Math.min(YAWMAX,VIEW.ty+dyaw));VIEW.tt=Math.max(TMIN,Math.min(TMAX,VIEW.tt+dtilt));kick();}
svg.addEventListener("pointerdown",function(e){if(e.button>0)return;drag={x:e.clientX,y:e.clientY,id:e.pointerId,live:false};dragged=false;});
svg.addEventListener("pointermove",function(e){
  if(!drag||e.pointerId!==drag.id)return;
  var dx=e.clientX-drag.x,dy=e.clientY-drag.y;
  if(!drag.live){if(Math.abs(dx)+Math.abs(dy)<5)return;drag.live=true;dragged=true;svg.setPointerCapture(e.pointerId);svg.classList.add("turning");
    clearTimeout(tipHide);clearInterval(tipTimer);sayTip(pickList());tipTimer=setInterval(function(){sayTip(pickList());},1700);}
  moveTip(e);
  if(Math.abs(dx)>22&&Date.now()-lastFast>1500){lastFast=Date.now();sayTip(FAST);}
  drag.x=e.clientX;drag.y=e.clientY;
  turnBy(dx*0.008,e.pointerType==="touch"?0:dy*0.005);
});
function endDrag(){if(!drag)return;var wasLive=drag.live;drag=null;clearInterval(tipTimer);tipTimer=0;
  if(wasLive){if(window.curFlash)curFlash("😮‍💨",1000);sayTip(DONE);clearTimeout(tipHide);tipHide=setTimeout(function(){tip.classList.remove("show");},1300);}svg.classList.remove("turning");setTimeout(function(){dragged=false;},0);}
svg.addEventListener("pointermove",function(e){if((drag&&drag.live)||e.pointerType==="touch")return;
  var c=pickCard(e.clientX,e.clientY),o=c?null:pickObj(e.clientX,e.clientY);setCardHover(c);setObjHover(o);setHover(c||o?(c?c.di:null):pickAt(e.clientX,e.clientY));
  if(o){tip.textContent=o==="book"?"Open my gallery →":o==="speaker"?"Play my playlist →":o==="phone"?"Call OJ, my assistant →":(tip.dataset.vase||(tip.dataset.vase=VASE_TIPS[Math.floor(Math.random()*VASE_TIPS.length)]));tip.classList.add("show");moveTip(e);}
  else{delete tip.dataset.vase;}
  if(c){var d=DRAWERS[c.di];tip.textContent="Open "+d.items[c.ck].split(" · ")[0]+" →";tip.classList.remove("pop");tip.classList.add("show");moveTip(e);}
  else if(!o&&!(drag&&drag.live)&&!tipTimer){tip.classList.remove("show");}
  [].forEach.call(note.querySelectorAll("a[data-file]"),function(a){a.classList.toggle("lit",!!c&&+a.getAttribute("data-file")===c.ck);});});
svg.addEventListener("pointerleave",function(){if(!(drag&&drag.live)){setHover(null);setCardHover(null);setObjHover(null);if(!tipTimer)tip.classList.remove("show");}});
svg.addEventListener("click",function(e){if(dragged)return;var o=pickObj(e.clientX,e.clientY);
  if(o==="book"){tip.classList.remove("show");openGallery();return;}
  if(o==="speaker"){tip.classList.remove("show");openMusic();return;}
  if(o==="phone"){ringPhone(e);return;}
  if(o==="vase"){G.wiggle=1.6;tip.textContent=VASE_TIPS[Math.floor(Math.random()*VASE_TIPS.length)];tip.classList.remove("pop");void tip.offsetWidth;tip.classList.add("show","pop");if(window.curFlash)curFlash("🌸",1100);kick();return;}
  var c=pickCard(e.clientX,e.clientY);if(c){setCardHover(null);tip.classList.remove("show");location.hash=FILE_LINKS[DRAWERS[c.di].id][c.ck].slice(1);return;}var i=pickAt(e.clientX,e.clientY);if(i!=null)toggle(i);});
svg.addEventListener("pointerup",endDrag);svg.addEventListener("pointercancel",endDrag);
svg.addEventListener("dblclick",function(){VIEW.ty=Math.round(VIEW.ty/(2*Math.PI))*2*Math.PI;VIEW.tt=S;kick();if(window.curFlash)curFlash("😄",800);});

/* ---- emoji cursor: its face reacts to what you do with the cabinet ---- */
(function(){
  if(!window.matchMedia("(pointer:fine)").matches)return;
  var cur=document.createElement("div");cur.className="cur";cur.setAttribute("aria-hidden","true");cur.innerHTML="<span>🙂</span>";stage.appendChild(cur);
  var K={x:0,y:0,tx:0,ty:0,px:0,face:"🙂",hov:null,flash:null,until:0,speed:0,raf:0,inside:false};
  function face(){
    var now=Date.now();
    if(drag&&drag.live){if(K.speed>14)return"😵‍💫";return open!=null?"😰":"😬";}
    if(K.flash&&now<K.until)return K.flash;
    if(drag&&K.hov!=null)return"😯";
    if(K.obj==="book")return"📖";
    if(K.obj==="speaker")return"🎧";
    if(K.obj==="phone")return"📱";
    if(K.obj==="vase")return"🌷";
    if(K.card)return"🤓";
    if(K.hov!=null)return open===K.hov?"😊":"👀";
    return open!=null?"🙂":"🙂";
  }
  function frame(){
    var a=reduce?1:0.38;K.x+=(K.tx-K.x)*a;K.y+=(K.ty-K.y)*a;K.speed*=0.88;
    var f=face();
    if(f!==K.face){K.face=f;cur.firstChild.textContent=f;cur.classList.remove("pop");void cur.offsetWidth;cur.classList.add("pop");}
    var rot=reduce?0:Math.max(-20,Math.min(20,(K.tx-K.x)*0.7));
    cur.style.transform="translate("+r1(K.x)+"px,"+r1(K.y)+"px) rotate("+r1(rot)+"deg)";
    var busy=Math.abs(K.tx-K.x)>0.3||Math.abs(K.ty-K.y)>0.3||K.speed>0.4||(K.flash&&Date.now()<K.until+60)||(drag&&drag.live);
    K.raf=(K.inside&&busy)?requestAnimationFrame(frame):0;
  }
  function go(){if(K.inside&&!K.raf)K.raf=requestAnimationFrame(frame);}
  window.curFlash=function(f,ms){K.flash=f;K.until=Date.now()+ms;go();};
  function at(e,snap){var r=stage.getBoundingClientRect();K.tx=e.clientX-r.left;K.ty=e.clientY-r.top;if(snap){K.x=K.tx;K.y=K.ty;}}
  svg.addEventListener("pointerenter",function(e){if(e.pointerType!=="mouse"&&e.pointerType!=="pen")return;K.inside=true;at(e,true);
    svg.classList.add("ecur");stage.classList.add("ecur");cur.classList.add("show");go();});
  svg.addEventListener("pointerleave",function(){if(drag&&drag.live)return;K.inside=false;K.hov=null;
    svg.classList.remove("ecur");stage.classList.remove("ecur");cur.classList.remove("show");});
  svg.addEventListener("pointermove",function(e){if(!K.inside)return;var ox=K.tx;at(e,false);
    if(drag&&drag.live)K.speed=Math.max(K.speed,Math.abs(K.tx-ox));go();});
  window.curHover=function(i){K.hov=i;go();};
  window.curCard=function(on){K.card=on;go();};
  window.curObj=function(o){K.obj=o;go();};
  svg.addEventListener("pointerdown",go);
  window.addEventListener("pointerup",function(){setTimeout(function(){
    if(!K.inside)return;
    var el=document.elementFromPoint(K.tx+stage.getBoundingClientRect().left,K.ty+stage.getBoundingClientRect().top);
    if(!el||!svg.contains(el)){K.inside=false;K.hov=null;svg.classList.remove("ecur");stage.classList.remove("ecur");cur.classList.remove("show");}
    go();},0);});
})();

/* ================= pages ================= */
function F(s){return String(s).replace(/\{([^}]+)\}/g,'<span class="fill">$1</span>');}
function mini(k,label){
  var sv={yaw:VIEW.yaw,tilt:VIEW.tilt};VIEW.yaw=0;VIEW.tilt=S;
  var s="",X=96,Y=54,Z=18;
  s+=pth(poly([[X+4,-2,0],[X+22,-2,0],[X+22,Y+2,0],[X+4,Y+2,0]]),"sh");
  s+=pth(poly([[0,0,Z],[X,0,Z],[X,Y,Z],[0,Y,Z]]),"in");
  for(var c=2;c>=0;c--){s+=card(6,14+c*14,3,X-6,58,c===0?k:k+c+1,c===0?label:"",42,8,5.5);}
  s+=pth(poly([[X,0,Z],[X,Y,Z],[X,Y,0],[X,0,0]]),"s");
  s+=pth(poly(rr([0,Y,Z],[1,0,0],[0,0,-1],X,Z,3)),"s");
  var xs=[],ys=[];[0,X+22].forEach(function(x){[-2,Y+2].forEach(function(y){[0,62].forEach(function(z){var p=P(x,y,z);xs.push(p[0]);ys.push(p[1]);});});});
  var mx=Math.min.apply(0,xs)-4,my=Math.min.apply(0,ys)-4;
  VIEW.yaw=sv.yaw;VIEW.tilt=sv.tilt;
  return '<svg viewBox="'+[r1(mx),r1(my),r1(Math.max.apply(0,xs)-mx+4),r1(Math.max.apply(0,ys)-my+4)].join(" ")+'" aria-hidden="true">'+s+'</svg>';
}
var CABICON='<svg viewBox="0 0 22 22" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"><rect x="4" y="2.5" width="14" height="17" rx="2"/><path d="M4 8.2h14M4 13.8h14"/><path d="M9.5 5.4h3M9.5 11h3M9.5 16.6h3" stroke-linecap="round"/></svg>';
var audit=false;
function shell(active,inner){
  return '<div class="bar"><a class="back" href="#cabinet">'+CABICON+'<span>Cabinet</span></a><span class="bar-name">Jesutofunmi Oluwatosin</span>'+
    '</div>'+
    '<nav class="tabs" aria-label="Sections">'+DRAWERS.map(function(d){return'<a class="tab mono" href="#'+d.id+'"'+(d.id===active?' aria-current="page"':'')+'>'+d.title+'</a>';}).join("")+'</nav>'+
    '<main class="sheet">'+inner+
    '<footer class="foot mono">© 2026 Jesutofunmi Oluwatosin</footer></main>';
}
function fileStats(p){
  var x=SELECTED.filter(function(y){return PROJECTS[y.i]===p;})[0];
  if(!x||!x.stats.length)return'';
  return'<dl class="sel-stats file-stats">'+x.stats.map(function(t){return'<div><dt>'+t[0]+'</dt><dd>'+t[1]+'</dd></div>';}).join("")+'</dl>';
}
function fileCard(p,i){
  return '<a class="file" href="#project-'+p.slug+'">'+mini(i,p.name.split(" ")[0])+'<span class="mono">'+p.org+' · '+p.kind+'</span><div class="tags">'+p.tags.map(function(t){return'<span>'+t+'</span>';}).join("")+'</div><h3>'+p.name+'</h3><p>'+F(p.summary)+'</p>'+fileStats(p)+'</a>';
}
var SELECTED=[
 {i:0,line:"FirstBank | Fintech | 2021",title:"Designing an all-round payment infrastructure for merchants across West Africa",blurb:"FirstBank\u2019s payment gateway for online merchants: onboarding, storefronts, payouts and a dashboard merchants actually check.",stats:[["\u20a685M+","Transaction value"],["760+","Transactions"]]},
 {i:1,line:"Fundall Technologies | Fintech | 2023",title:"Tackling the increasing rate of inactive users",blurb:"A super app for the unbanked. I rebuilt onboarding around the one field users kept abandoning on and turned it into a 1-minute flow.",stats:[["10%","Rise in active users"],["5 min \u2192 1 min","Onboarding time"]]},
 {i:4,line:"AI-induced workflow | 2026",title:"Ensuring Financial awareness and control with AI",blurb:"Baci is an AI-powered personal finance product that connects all of a user\u2019s bank and financial accounts, builds one consolidated picture of their money, and puts a financial intelligence agent on top of it that can explain, forecast and model decisions in plain language.",stats:[]}
];
function selCard(x){
  var p=PROJECTS[x.i];
  return '<a class="sel" href="#project-'+p.slug+'"><div class="sel-fig">'+mini(x.i,p.name.split(" ")[0])+'</div><div class="sel-body"><span class="mono">'+x.line+'</span><h3>'+x.title+'</h3><p>'+x.blurb+'</p>'+
   (x.stats.length?'<dl class="sel-stats">'+x.stats.map(function(t){return'<div><dt>'+t[0]+'</dt><dd>'+t[1]+'</dd></div>';}).join("")+'</dl>':'')+
   '<span class="sel-go mono">Open '+p.name+' \u2192</span></div></a>';
}
function homePage(){
  return '<section class="hero"><h1>With intentionality, I design products people can understand.</h1>'+
  '<p class="lede">I\'m Jesutofunmi, a product designer with 3+ years of experience designing secure, scalable, and accessible digital products across fintech and financial services. Experienced in designing end-to-end customer journeys, improving onboarding and transactional flows, and building design systems for complex, data-driven platforms. Strong focus on usability, accessibility (WCAG), and regulated environment constraints.</p>'+
  '</section>'+
  '<section><h2>My process</h2><ol class="proc"><li><h3>Frame</h3><p>Establish the business problem, user problem, goals, evidence, assumptions, constraints and success criteria.</p></li><li><h3>Discover</h3><p>Research synthesis, an evidence map, what is known, what is unknown and potential areas of opportunity.</p></li><li><h3>Model</h3><p>Understand the journey, system, business rules, dependencies, edge cases, service relationships, concepts, alternatives, trade-offs and the chosen direction.</p></li><li><h3>Explore</h3><p>Generate multiple solution directions, then converge using product and design judgement.</p></li><li><h3>Design</h3><p>Define the information architecture, interaction model, visual hierarchy, UI, responsive behaviour and accessibility.</p></li><li><h3>Simulate</h3><p>Turn the static design into realistic, functional experiences with real content, states and behaviours.</p></li><li><h3>Validate</h3><p>Test desirability, usability, viability and feasibility against the hypothesis.</p></li><li><h3>Build</h3><p>Translate the decisions into executable requirements and collaborate tightly with Engineering.</p></li><li><h3>Measure</h3><p>Look through the metrics and understand the progress.</p></li><li><h3>Learn</h3><p>Retrospect on what worked, what didn\'t and how to improve the experience.</p></li></ol></section>'+
  '<section><div class="sel-head"><h2>Selected files</h2><a class="sel-more mono" href="#projects">View more projects \u2192</a></div><div class="sels">'+SELECTED.map(selCard).join("")+'</div></section>';
}
function projectsPage(){
  return '<section class="hero"><h1>Case files</h1><p class="lede">Five projects from fintech, residential platforms and AI-supported workflows. Each one runs the same way: context and evidence, what was known and assumed, the decisions, the design, how it was validated and what changed.</p></section>'+
  '<div class="files">'+PROJECTS.map(fileCard).join("")+'</div>';
}
var CS_SECTIONS=[
 ["Context","Product, role, team, timeline and constraints."],
 ["Business problem","Why the organisation needed to act."],
 ["User problem","What users were struggling to accomplish or understand."],
 ["Evidence","Research, analytics, feedback, market evidence and observed behaviour."],
 ["Known, assumed, unknown","What was certain, what was a bet, and what we still didn't know."],
 ["Hypotheses","What I believed might improve the experience, and why."],
 ["Exploration","The directions considered, and what was rejected."],
 ["Decision rationale","Why the chosen approach won: user, business and technical trade-offs."],
 ["Design","Flows, IA, UI, interactions, states, accessibility and responsive behaviour."],
 ["Functional simulation","The experience working, not just static screens."],
 ["Validation","What was tested, what happened and what changed."],
 ["Build collaboration","How design became executable requirements and engineering work."],
 ["Outcome","Measured impact where available; intended measurement where not yet launched."],
 ["Learning","What I would improve next, and what the evidence taught me."]];
function csAsk(t){return F("{Add: "+t.charAt(0).toLowerCase()+t.slice(1)+"}");}
function csParas(a,t){return(a&&a.length?a:[null]).map(function(x){return'<p>'+(x?F(x):csAsk(t))+'</p>';}).join("");}
function csList(a,ph){return'<ul class="cs-list">'+(a&&a.length?a:[ph]).map(function(x){return'<li>'+F(x)+'</li>';}).join("")+'</ul>';}
function csNum(i){return String(i+1).padStart(2,"0");}
function projectPage(p){
  var i=PROJECTS.indexOf(p),nx=PROJECTS[(i+1)%PROJECTS.length],c=p.cs||{},S=CS_SECTIONS;
  var meta=p.meta.slice();meta.splice(0,0,["Product",c.product||"{Add the product}"]);
  meta.push(["Constraints",c.constraints||"{Add constraints}"]);
  var body=[
   '<dl class="meta cs-meta">'+meta.map(function(m){return'<div'+(m[0]==="Product"||m[0]==="Constraints"||m[0]==="Team"?' class="wide"':'')+'><dt class="mono">'+m[0]+'</dt><dd>'+F(m[1])+'</dd></div>';}).join("")+'</dl>'+
     (c.stats?'<div class="cs-stats">'+(c.statsNote?'<p class="mono">'+c.statsNote+'</p>':"")+c.stats.map(function(x){return'<div><strong>'+x[0]+'</strong><span>'+x[1]+'</span></div>';}).join("")+'</div>':"")+
     (c.heroImg?'<figure class="cs-shot"><img src="'+(CS_IMG[c.heroImg.src]||c.heroImg.src)+'" alt="'+c.heroImg.alt+'" width="'+c.heroImg.w+'" height="'+c.heroImg.h+'" loading="lazy" decoding="async">'+(c.heroImg.cap?'<figcaption>'+c.heroImg.cap+'</figcaption>':'')+'</figure>':'<div class="slot"><span class="mono">'+F(c.hero||"{Add hero image}")+'</span></div>'),
   csParas(c.business,S[1][1]),
   csParas(c.user,S[2][1]),
   '<dl class="cs-ev">'+(c.evidence&&c.evidence.length?c.evidence:[["Evidence","{Add: research, analytics, feedback, market evidence and observed behaviour.}"]]).map(function(e){return'<div><dt>'+F(e[0])+'</dt><dd>'+F(e[1])+'</dd></div>';}).join("")+'</dl>',
   '<div class="cs-kau">'+[["Known","known","{Add what you knew for certain.}"],["Assumed","assumed","{Add what you believed but had not proven.}"],["Unknown","unknown","{Add what you still didn't know.}"]].map(function(k){
     return'<div class="kau-'+k[1]+'"><h3><span class="kau-dot" aria-hidden="true"></span>'+k[0]+'</h3>'+csList(c[k[1]],k[2])+'</div>';}).join("")+'</div>',
   '<ol class="cs-hyp">'+(c.hyp&&c.hyp.length?c.hyp:[["{Add what you believed might improve the experience.}","{Add why.}"]]).map(function(h,j){
     return'<li><span class="mono">H'+(j+1)+'</span><p class="hyp-b">'+F(h[0])+'</p>'+(h[1]?'<p class="hyp-w"><span>Because</span> '+F(h[1])+'</p>':'')+'</li>';}).join("")+'</ol>',
   '<ul class="cs-exp">'+(c.explore&&c.explore.length?c.explore:[["{Direction 1}","{Add the directions you explored.}","Method"],["{Direction you rejected}","{What it was and why it lost.}","Rejected"]]).map(function(e){
     return'<li><div><h3>'+F(e[0])+'</h3><p>'+F(e[1])+'</p></div><span class="pill pill-'+e[2].toLowerCase()+'">'+e[2]+'</span></li>';}).join("")+'</ul>',
   '<div class="cs-why">'+[["User","user"],["Business","business"],["Technical","technical"]].map(function(k){var w=c.why||{};
     return'<div><h3>'+k[0]+'</h3><p>'+F(w[k[1]]||"{Add the "+k[1]+" trade-off.}")+'</p></div>';}).join("")+'</div>',
   '<dl class="cs-design">'+(function(){var hide=c.hideDesign||[],d=(c.design||[]).filter(function(x){return hide.indexOf(x[0])<0;}),have={};hide.forEach(function(k){have[k]=1;});d.forEach(function(x){have[x[0]]=1;});
     var all=d.slice();["Flows","IA","UI","Interactions","States","Accessibility","Responsive"].forEach(function(k){if(!have[k])all.push([k,"{Add "+{Flows:"the key user flows",IA:"information architecture decisions",UI:"UI decisions",Interactions:"interaction decisions",States:"loading, empty, error and success states",Accessibility:"accessibility decisions",Responsive:"responsive behaviour"}[k]+".}"]);});
     var order=["Flows","Consent","IA","UI","Interactions","Insights","Trust","Services","Reassurance","Transfers","Configuration","Developers","States","Accessibility","Responsive"];all.sort(function(x,y){return order.indexOf(x[0])-order.indexOf(y[0]);});
     return all.map(function(x){var gs=x[2]?[].concat(x[2]):[];return'<div'+(gs.length?' class="has-shot"':'')+'><dt class="mono">'+x[0]+'</dt><dd>'+F(x[1])+gs.map(function(g){return'<figure class="cs-shot cs-row-shot"><a href="'+g.src+'" target="_blank" rel="noopener noreferrer" aria-label="Open full size: '+g.cap+' (opens in a new tab)"><img src="'+g.src+'" alt="'+g.alt+'" width="'+g.w+'" height="'+g.h+'" loading="lazy" decoding="async"></a><figcaption>'+g.cap+'</figcaption></figure>';}).join("")+'</dd></div>';}).join("");})()+'</dl>'+
     (c.shotsInline?'':c.shotImgs?'<div class="cs-gallery">'+c.shotImgs.map(function(g,k){return'<figure class="cs-shot'+(g.wide?' wide':'')+'"><a href="'+g.src+'" target="_blank" rel="noopener noreferrer" aria-label="Open full size: '+g.cap+' (opens in a new tab)"><img src="'+g.src+'" alt="'+g.alt+'" width="'+g.w+'" height="'+g.h+'" loading="lazy" decoding="async"></a><figcaption><span class="mono">'+String(k+1).padStart(2,"0")+'</span> '+g.cap+'</figcaption></figure>';}).join("")+'</div>':'<div class="slot slim"><span class="mono">'+F(c.shots||"{Add 2–3 final screens}")+'</span></div>'),
   (c.simUrl&&c.simMode==="link"?'<a class="cs-launch" href="'+c.simUrl+'" target="_blank" rel="noopener noreferrer"><span class="cs-launch-phone" aria-hidden="true"><span class="cs-play"></span></span><span class="cs-launch-txt"><span class="mono">Live prototype</span><strong>'+(c.simTitle||"Open the prototype")+'</strong><span class="cs-launch-desc">'+F(c.sim||"")+'</span><span class="cs-launch-url">'+c.simUrl.replace(/^https?:\/\//,'')+' \u2197</span></span><span class="sr-only"> (opens in a new tab)</span></a>':c.simUrl?'<div class="cs-proto"><div class="cs-proto-bar"><span class="cs-proto-dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="cs-proto-url">'+c.simUrl.replace(/^https?:\/\//,'').replace(/\/#\/$|\/$/,'')+'</span><a class="cs-proto-open" href="'+c.simUrl+'" target="_blank" rel="noopener noreferrer">Open in new tab<span class="sr-only"> (opens in a new tab)</span><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M4 2.5h5.5V8M9.5 2.5 3 9"/></svg></a></div><div class="cs-proto-stage"><p class="cs-proto-fallback">Loading the prototype. If it doesn\'t appear, <a href="'+c.simUrl+'" target="_blank" rel="noopener noreferrer">open it in a new tab</a>.</p><iframe src="'+(c.simEmbed||c.simUrl)+'" title="'+(c.simTitle||"Interactive prototype")+'" loading="lazy" referrerpolicy="no-referrer" sandbox="allow-scripts allow-same-origin allow-forms allow-popups"></iframe></div></div>'+(c.sim?'<p class="cs-proto-note">'+F(c.sim)+'</p>':''):'<div class="slot cs-sim"><span class="cs-play" aria-hidden="true"></span><span class="mono">'+F(c.sim||"{Add a prototype video or clickable link that shows the experience working.}")+'</span></div>'),
   '<ol class="cs-val">'+[["Tested","tested","{Add what was tested.}"],["What happened","happened","{Add what happened.}"],["What changed","changed","{Add what changed.}"]].map(function(k){var v=c.valid||{};
     return'<li><h3>'+k[0]+'</h3><p>'+F(v[k[1]]||k[2])+'</p></li>';}).join("")+'</ol>',
   csList(c.build,"{Add how the design became requirements and engineering work: specs, states, edge cases, acceptance criteria.}"),
   '<div class="cs-out'+(((c.outcome||{}).hide||[]).length?' one':'')+'">'+[["Measured impact","measured","{Add measured impact where available.}"],["Intended measurement","intended","{Add how success will be measured where not yet launched.}"]].filter(function(k){return((c.outcome||{}).hide||[]).indexOf(k[1])<0;}).map(function(k){var o=c.outcome||{};
     return'<div><h3 class="mono">'+k[0]+'</h3><p>'+F(o[k[1]]||k[2])+'</p></div>';}).join("")+'</div>',
   '<div class="cs-out">'+[["What I'd improve next","next","{Add what you would improve next.}"],["What the evidence taught me","taught","{Add what the evidence taught you.}"]].map(function(k){var l=c.learn||{};
     return'<div><h3 class="mono">'+k[0]+'</h3><p>'+F(l[k[1]]||k[2])+'</p></div>';}).join("")+'</div>'
  ];
  var vis=S.map(function(x,j){return j;}).filter(function(j){return (c.hideSections||[]).indexOf(j)<0;});
  return '<a class="crumb mono" href="#projects">← All projects</a>'+
  '<header class="case-head" lang="en-GB"><h1>'+p.name+'</h1><p class="lede">'+F(p.summary)+'</p></header>'+
  '<div class="cs" lang="en-GB"><nav class="cs-toc" aria-label="Case study sections"><ol>'+vis.map(function(j,n){
     return'<li><button type="button" data-cs="'+j+'"><span class="mono">'+csNum(n)+'</span>'+S[j][0]+'</button></li>';}).join("")+'</ol></nav>'+
  '<div class="cs-body">'+vis.map(function(j,n){var h=body[j];
     return'<section class="cs-sec" id="cs-'+j+'" aria-labelledby="cs-h-'+j+'"><header class="cs-sh"><span class="mono">'+csNum(n)+'</span><h2 id="cs-h-'+j+'">'+S[j][0]+'</h2><p>'+S[j][1]+'</p></header>'+h+((c.secImgs||{})[j]||[]).map(function(g){return'<figure class="cs-shot cs-sec-shot"><a href="'+g.src+'" target="_blank" rel="noopener noreferrer" aria-label="Open full size: '+g.cap+' (opens in a new tab)"><img src="'+g.src+'" alt="'+g.alt+'" width="'+g.w+'" height="'+g.h+'" loading="lazy" decoding="async"></a><figcaption>'+g.cap+'</figcaption></figure>';}).join('')+'</section>';}).join("")+'</div></div>'+
  '<a class="next" href="#project-'+nx.slug+'"><span class="mono">Next file</span><strong>'+nx.name+' →</strong></a>';
}
var csSecs=null,csBtns=null,csRaf=0;
function csMark(){csRaf=0;if(!csSecs||!csSecs.length||!csSecs[0].isConnected)return;var y=window.innerHeight*0.3,cur=0;
  csSecs.forEach(function(x,k){if(x.getBoundingClientRect().top<=y)cur=k;});
  if(window.innerHeight+window.scrollY>=document.documentElement.scrollHeight-2)cur=csSecs.length-1;
  csBtns.forEach(function(b,k){if(k===cur)b.setAttribute("aria-current","true");else b.removeAttribute("aria-current");});}
function csInit(){var toc=document.querySelector(".cs-toc");csSecs=toc?[].slice.call(document.querySelectorAll(".cs-sec")):null;csBtns=toc?[].slice.call(toc.querySelectorAll("button")):null;if(toc)csMark();}
window.addEventListener("scroll",function(){if(csSecs&&!csRaf)csRaf=requestAnimationFrame(csMark);},{passive:true});
document.addEventListener("click",function(e){var b=e.target.closest(".cs-toc button");if(!b)return;
  var t=document.getElementById("cs-"+b.getAttribute("data-cs"));if(!t)return;
  t.scrollIntoView({behavior:reduce?"auto":"smooth",block:"start"});var h=t.querySelector("h2");if(h){h.setAttribute("tabindex","-1");h.focus({preventScroll:true});}});
var PORTRAIT="img/about/portrait.webp";
function aboutPage(){
  return '<section class="hero about-hero"><span class="eyebrow mono">Meet Jesutofunmi Oluwatosin</span><h1>My journey as a designer</h1>'+
  '<div class="about-row"><div class="bio">'+
  '<p class="lede">Over the past 3 years, I\'ve worked as a UX and interaction designer across fintech, residential tech, and enterprise platforms, taking end-to-end ownership of products from initial concept through to developer hand-off. I studied finance at the University of Lagos, then moved into product design at FirstBank Nigeria, where I designed Firstchekout. Since then I\'ve worked at Fundall and Keys in London, completed an MSc in project management with data analytics, and gone independent.</p>'+
  '<p class="lede">My approach as a product designer is to proactively dig into complex problems and identify the solutions worth pursuing. This is rooted in a design philosophy centred on one word: \u201cWHY.\u201d Asking it relentlessly is what turns a vague problem into a clear, well-understood one, and clarity is where good design starts.</p>'+
  '<p class="lede">Outside of client work, I stay engaged with the design community. <a class="inline-link" href="https://hellosections.framer.website/" target="_blank" rel="noopener noreferrer">Sections<span class="sr-only"> (opens in a new tab)</span><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M4 2.5h5.5V8M9.5 2.5 3 9"/></svg></a>, a community I\'ve long been part of, has hosted professionals including Harrison Wheeler and Suraj Soren, among others. Beyond our sessions, we organise group trips where designers can unwind, connect, and build relationships outside the usual work context.</p>'+
  '<p class="lede">In my free time, I enjoy travelling, cooking, meeting new people, and having good conversations.</p>'+
  '</div>'+
  '<figure class="portrait" tabindex="0" aria-label="Portrait of Jesutofunmi Oluwatosin"><div class="portrait-card"><img src="'+PORTRAIT+'" alt="Jesutofunmi Oluwatosin in a grey T-shirt" width="364" height="549" decoding="async"><span class="portrait-glare" aria-hidden="true"></span></div>'+
  '<figcaption class="portrait-tag mono"><span class="portrait-dot" aria-hidden="true"></span>Product designer · UK</figcaption></figure>'+
  '</div></section>'+
  '<section><h2>How I work</h2><div class="principles">'+
  '<div><h3>Ask why before what</h3><p>I keep asking why until the answer is about a person, not a feature.</p></div>'+
  '<div><h3>Evidence over opinion</h3><p>Research and data settle debates faster than taste does.</p></div>'+
  '<div><h3>Make handoff boring</h3><p>States, edge cases and content agreed before engineers start.</p></div></div></section>'+
  '<section><h2>Community</h2><ul class="now">'+
  '<li><span>Community manager, <a class="inline-link" href="https://hellosections.framer.website/" target="_blank" rel="noopener noreferrer">Sections UK<span class="sr-only"> (opens in a new tab)</span><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M4 2.5h5.5V8M9.5 2.5 3 9"/></svg></a></span><span>UK–Nigeria designers</span></li>'+
  '<li><span>Volunteer mentor, <a class="inline-link" href="https://app.digitalboost.org.uk/mentor-details?id=9fa1cf2a-cdad-4e68-8fe8-d6d065decb4c" target="_blank" rel="noopener noreferrer">Digital Boost<span class="sr-only"> (opens in a new tab)</span><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M4 2.5h5.5V8M9.5 2.5 3 9"/></svg></a></span><span>Founders</span></li>'+
  '<li><span>Event operations, <a class="inline-link" href="https://www.tedxwibsey.com/" target="_blank" rel="noopener noreferrer">TEDxWibsey<span class="sr-only"> (opens in a new tab)</span><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M4 2.5h5.5V8M9.5 2.5 3 9"/></svg></a></span><span>Volunteer</span></li></ul></section>'+
  '<section><h2>Skills</h2><div class="skillgrid">'+
  '<div><h3>UX/UI design</h3><div class="tags"><span>User-centred design</span><span>Interaction design</span><span>Wireframing</span><span>User flows</span><span>High-fidelity prototyping</span><span>Information architecture</span><span>Component-based design</span><span>Components, variants, tokens & auto-layout</span></div></div>'+
  '<div><h3>Discovery & concepting</h3><div class="tags"><span>Journey mapping</span><span>HMW framework</span><span>Experience maps</span><span>Concept development</span><span>MoSCoW prioritisation</span></div></div>'+
  '<div><h3>Facilitation & collaboration</h3><div class="tags"><span>Ideation workshops</span><span>User feedback sessions</span><span>Stakeholder management</span><span>Cross-functional partnership</span><span>Agile / sprint delivery</span></div></div>'+
  '<div><h3>Research & evidence</h3><div class="tags"><span>User research</span><span>Usability testing</span><span>Data- and analytics-informed design</span><span>Task success rate</span><span>Completion time</span><span>NPS analysis</span></div></div>'+
  '<div><h3>Accessibility & inclusion</h3><div class="tags"><span>Accessible & inclusive design</span><span>WCAG 2.1 / 2.2</span></div></div>'+
  '<div><h3>Design systems & hand-off</h3><div class="tags"><span>Reusable pattern libraries</span><span>Design standards & documentation</span><span>Design enablement</span></div></div>'+
  '<div><h3>AI-enabled design</h3><div class="tags"><span>Concept-to-prototype with Claude</span><span>AI-assisted ideation</span><span>Figma Make</span><span>Codex</span></div></div>'+
  '</div></section>'+
  '<section><h2>Tools</h2><div class="tags"><span>Figma</span><span>Figma Make</span><span>FigJam</span><span>Miro</span><span>Notion</span><span>Hotjar</span><span>Claude</span><span>ChatGPT</span><span>Codex</span><span>ElevenLabs</span><span>Perplexity</span><span>GitHub</span><span>React prototyping</span></div></section>';
}
function articlesPage(){
  return '<section class="hero"><h1>Minds on paper</h1><p class="lede">Short pieces on growth, payments, research habits and AI.</p></section>'+
  '<ul class="alist">'+ARTICLES.map(function(a){return'<li><a href="#article-'+a.slug+'"><h3>'+a.title+'</h3><p>'+a.dek+'</p><span class="mono">'+a.tag+'</span></a></li>';}).join("")+'</ul>';
}
function articlePage(a){
  var i=ARTICLES.indexOf(a),nx=ARTICLES[(i+1)%ARTICLES.length];
  return '<a class="crumb mono" href="#articles">← All articles</a>'+
  '<header class="art-head"><span class="eyebrow mono">'+a.tag+(a.published?' · '+a.published:' · Draft')+'</span><h1>'+a.title+'</h1><p class="lede">'+a.dek+'</p><span class="mono">'+F(a.mins)+'</span></header>'+
  '<div class="prose">'+a.body.map(function(b){return b[0]==="h"?'<h3>'+b[1]+'</h3>':b[0]==="ol"?'<ol>'+b[1].map(function(t){return'<li>'+t+'</li>';}).join("")+'</ol>':'<p>'+F(b[1])+'</p>';}).join("")+(a.source?'<p class="art-src">Originally published on <a class="inline-link" href="'+a.source+'" target="_blank" rel="noopener noreferrer">Medium<span class="sr-only"> (opens in a new tab)</span><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M4 2.5h5.5V8M9.5 2.5 3 9"/></svg></a>'+(a.published?' on '+a.published:'')+'.</p>':'')+'</div>'+
  '<a class="next" href="#article-'+nx.slug+'"><span class="mono">Next article</span><strong>'+nx.title+' →</strong></a>';
}

/* ================= router ================= */
var cabView=document.getElementById("cabView"),pageView=document.getElementById("pageView");
(function(){
  var rm=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.addEventListener("pointermove",function(e){
    var f=e.target.closest&&e.target.closest(".portrait");
    if(!f||rm||e.pointerType==="touch")return;
    var c=f.querySelector(".portrait-card"),r=c.getBoundingClientRect();
    var x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
    f.classList.add("tilting");
    c.style.setProperty("--ry",((x-.5)*12).toFixed(2)+"deg");
    c.style.setProperty("--rx",((.5-y)*10).toFixed(2)+"deg");
    c.style.setProperty("--gx",(x*100).toFixed(1)+"%");
    c.style.setProperty("--gy",(y*100).toFixed(1)+"%");
  });
  document.addEventListener("pointerout",function(e){
    var f=e.target.closest&&e.target.closest(".portrait");
    if(!f||(e.relatedTarget&&f.contains(e.relatedTarget)))return;
    var c=f.querySelector(".portrait-card");f.classList.remove("tilting");
    c.style.setProperty("--rx","0deg");c.style.setProperty("--ry","0deg");
  });
})();
function route(){
  var h=decodeURIComponent(location.hash.slice(1)),html=null,act=null,p;
  if(h==="home"){act="home";html=homePage();}
  else if(h==="projects"){act="projects";html=projectsPage();}
  else if(h.indexOf("project-")===0&&(p=PROJECTS.filter(function(x){return x.slug===h.slice(8);})[0])){act="projects";html=projectPage(p);}
  else if(h==="about"){act="about";html=aboutPage();}
  else if(h==="articles"){act="articles";html=articlesPage();}
  else if(h.indexOf("article-")===0&&(p=ARTICLES.filter(function(x){return x.slug===h.slice(8);})[0])){act="articles";html=articlePage(p);}
  if(html){
    pageView.innerHTML=shell(act,html);pageView.hidden=false;cabView.hidden=false;document.body.classList.add("paged");cabView.inert=true;cabView.setAttribute("aria-hidden","true");
    lastDrawer=DRAWERS.map(function(d){return d.id;}).indexOf(act);window.scrollTo(0,0);csInit();
  }else{
    pageView.hidden=true;cabView.hidden=false;document.body.classList.remove("paged");cabView.inert=false;cabView.removeAttribute("aria-hidden");
    if(lastDrawer>=0&&open!==lastDrawer)toggle(lastDrawer);else placeNote(open);
    lastDrawer=-1;
  }
}
document.addEventListener("click",function(e){
  var b=e.target.closest("#auditBtn");
  if(b){audit=!audit;document.body.classList.toggle("audit",audit);b.setAttribute("aria-pressed",audit);b.textContent="Review marks "+(audit?"on":"off");}
  var c=e.target.closest("[data-copy]");
  if(c){var el=document.getElementById(c.getAttribute("data-copy"));var t=el.textContent;
    var done=function(){c.textContent="Copied";setTimeout(function(){c.textContent="Copy email";},1600);};
    var sel=function(){var r=document.createRange();r.selectNodeContents(el);var s=window.getSelection();s.removeAllRanges();s.addRange(r);c.textContent="Selected, press copy";};
    try{navigator.clipboard.writeText(t).then(done,sel);}catch(err){sel();}}
});
document.body.classList.toggle("audit",audit);
window.addEventListener("hashchange",route);
/* ---------- CV folder ---------- */
var CV_PAGES=["img/cv/page-1.webp", "img/cv/page-2.webp"];
var CV_PDF="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n/XoJTmScvnOC9gSvdz+ZIleJED88XMLN6d8QfG87gLIcF49u/7Bnz789sO/Lr/9/wD2ggcoCmVuZHN0cmVhbQplbmRvYmoKMiAwIG9iago8PC9UeXBlIC9QYWdlCi9SZXNvdXJjZXMgPDwvUHJvY1NldCBbL1BERiAvVGV4dCAvSW1hZ2VCIC9JbWFnZUMgL0ltYWdlSV0KL0V4dEdTdGF0ZSA8PC9HMyAzIDAgUgovRzQgNCAwIFI+PgovRm9udCA8PC9GNSA1IDAgUgovRjYgNiAwIFIKL0Y3IDcgMCBSPj4+PgovTWVkaWFCb3ggWzAgMCA1OTYgODQyXQovQW5ub3RzIFs4IDAgUiA5IDAgUl0KL0NvbnRlbnRzIDEwIDAgUgovU3RydWN0UGFyZW50cyAwCi9UYWJzIC9TCi9QYXJlbnQgMTQgMCBSPj4KZW5kb2JqCjExIDAgb2JqCjw8L1R5cGUgL1BhZ2UKL1Jlc291cmNlcyA8PC9Qcm9jU2V0IFsvUERGIC9UZXh0IC9JbWFnZUIgL0ltYWdlQyAvSW1hZ2VJXQovRXh0R1N0YXRlIDw8L0czIDMgMCBSCi9HNCA0IDAgUj4+Ci9Gb250IDw8L0Y1IDUgMCBSCi9GNiA2IDAgUgovRjcgNyAwIFI+Pj4+Ci9NZWRpYUJveCBbMCAwIDU5NiA4NDJdCi9Bbm5vdHMgWzEyIDAgUl0KL0NvbnRlbnRzIDEzIDAgUgovU3RydWN0UGFyZW50cyAzCi9UYWJzIC9TCi9QYXJlbnQgMTQgMCBSPj4KZW5kb2JqCjE0IDAgb2JqCjw8L1R5cGUgL1BhZ2VzCi9Db3VudCAyCi9LaWRzIFsyIDAgUiAxMSAwIFJdPj4KZW5kb2JqCjE3IDAgb2JqCjw8L1R5cGUgL1N0cnVjdEVsZW0KL1MgL1AKL1AgMTYgMCBSCi9QZyAyIDAgUgovSyAzPj4KZW5kb2JqCjE4IDAgb2JqCjw8L1R5cGUgL1N0cnVjdEVsZW0KL1MgL1AKL1AgMTYgMCBSCi9QZyAyIDAgUgovSyA0Pj4KZW5kb2JqCjE5IDAgb2JqCjw8L1R5cGUgL1N0cnVjdEVsZW0KL1MgL1AKL1AgMTYgMCBSCi9QZyAyIDAgUgovSyA1Pj4KZW5kb2JqCjIxIDAgb2JqCjw8L1R5cGUgL1N0cnVjdEVsZW0KL1MgL1NwYW4KL1AgMjAgMCBSCi9QZyAyIDAgUgovSyA2Pj4KZW5kb2JqCjIzIDAgb2JqCjw8L1R5cGUgL1N0cnVjdEVsZW0KL1MgL1NwYW4KL1AgMjIgMCBSCi9QZyAyIDAgUgovSyA3Pj4KZW5kb2JqCjIyIDAgb2JqCjw8L1R5cGUgL1N0cnVjdEVsZW0KL1MgL0xpbmsKL1AgMjAgMCBSCi9LIFsyMyAwIFIgPDwvVHlwZSAvT0JKUgovT2JqIDggMCBSCi9QZyAyIDAgUj4+XT4+CmVuZG9iagoyNCAwIG9iago8PC9UeXBlIC9TdHJ1Y3RFbGVtCi9TIC9TcGFuCi9QIDIwIDAgUgovUGcgMiAwIFIKL0sgOD4+CmVuZG9iagoyNiAwIG9iago8PC9UeXBlIC9TdHJ1Y3RFbGVtCi9TIC9TcGFuCi9QIDI1IDAgUgovUGcgMiAwIFIKL0sgOT4+CmVuZG9iagoyNSAwIG9iago8PC9UeXBlIC9TdHJ1Y3RFbGVtCi9TIC9MaW5rCi9QIDIwIDAgUgovSyBbMjYgMCBSIDw8L1R5cGUgL09CSlIKL09iaiA5IDAgUgovUGcgMiAwIFI+Pl0+PgplbmRvYmoKMjcgMCBvYmoKPDwvVHlwZSAvU3RydWN0RWxlbQovUyAvU3BhbgovUCAyMCAwIFIKL1BnIDIgMCBSCi9LIDEwPj4KZW5kb2JqCjIwIDAgb2JqCjw8L1R5cGUgL1N0cnVjdEVsZW0KL1MgL1AKL1AgMTYgMCBSCi9QZyAyIDAgUgovSyBbMjEgMCBSIDIyIDAgUiAyNCAwIFIgMjUgMCBSIDI3IDAgUiAzN10+PgplbmRvYmoKMjggMCBvYmoKPDwvVHlwZSAvU3RydWN0RWxlbQovUyAvUAovUCAxNiAwIFIKL1BnIDIgMCBSCi9LIFswIDExXT4+CmVuZG9iagoyOSAwIG9iago8PC9UeXBlIC9TdHJ1Y3RFbGVtCi9TIC9QCi9QIDE2IDAgUgovUGcgMiAwIFIKL0sgMTI+PgplbmRvYmoKMzAgMCBvYmoKPDwvVHlwZSAvU3RydWN0RWxlbQovUyAvUAovUCAxNiAwIFIKL1BnIDIgMCBSCi9LIFsxIDEzXT4+CmVuZG9iagozMSAwIG9iago8PC9UeXBlIC9TdHJ1Y3RFbGVtCi9TIC9QCi9QIDE2IDAgUgovUGcgMiAwIFIKL0sgMTQ+PgplbmRvYmoKMzIgMCBvYmoKPDwvVHlwZSAvU3RydWN0RWxlbQovUyAvUAovUCAxNiAwIFIKL1BnIDIgMCBSCi9LIDE1Pj4KZW5kb2JqCjMzIDAgb2JqCjw8L1R5cGUgL1N0cnVjdEVsZW0KL1MgL1AKL1AgMTYgMCBSCi9QZyAyIDAgUgovSyAxNj4+CmVuZG9iagozNCAwIG9iago8PC9UeXBlIC9TdHJ1Y3RFbGVtCi9TIC9QCi9QIDE2IDAgUgovUGcgMiAwIFIKL0sgMTc+PgplbmRvYmoKMzUgMCBvYmoKPDwvVHlwZSAvU3RydWN0RWxlbQovUyAvUAovUCAxNiAwIFIKL1BnIDIgMCBSCi9LIDE4Pj4KZW5kb2JqCjM2IDAgb2JqCjw8L1R5cGUgL1N0cnVjdEVsZW0KL1MgL1AKL1AgMTYgMCBSCi9QZyAyIDAgUgovSyAxOT4+CmVuZG9iagozNyAwIG9iago8PC9UeXBlIC9TdHJ1Y3RFbGVtCi9TIC9QCi9QIDE2IDAgUgovUGcgMiAwIFIKL0sgMjA+PgplbmRvYmoKMzggMCBvYmoKPDwvVHlwZSAvU3RydWN0RWxlbQovUyAvUAovUCAxNiAwIFIKL1BnIDIgMCBSCi9LIDIxPj4KZW5kb2JqCjM5IDAgb2JqCjw8L1R5cGUgL1N0cnVjdEVsZW0KL1MgL1AKL1AgMTYgMCBSCi9QZyAyIDAgUgovSyBbMiAyMl0+PgplbmRvYmoKNDAgMCBvYmoKPDwvVHlwZSAvU3RydWN0RWxlbQovUyAvUAovUCAxNiAwIFIKL1BnIDIgMCBSCi9LIDIzPj4KZW5kb2JqCjQxIDAgb2JqCjw8L1R5cGUgL1N0cnVjdEVsZW0KL1MgL1AKL1AgMTYgMCBSCi9QZyAyIDAgUgovSyAyND4+CmVuZG9iago0MyAwIG9iago8PC9UeXBlIC9TdHJ1Y3RFbGVtCi9TIC9MSQovUCA0MiAwIFIKL1BnIDIgMCBSCi9LIDI1Pj4KZW5kb2JqCjQ0IDAgb2JqCjw8L1R5cGUgL1N0cnVjdEVsZW0KL1MgL0xJCi9QIDQyIDAgUgovUGcgMiAwIFIKL0sgMjY+PgplbmRvYmoKNDUgMCBvYmoKPDwvVHlwZSAvU3RydWN0RWxlbQovUyAvTEkKL1AgNDIgMCBSCi9QZyAyIDAgUgovSyAyNz4+CmVuZG9iago0NiAwIG9iago8PC9UeXBlIC9TdHJ1Y3RFbGVtCi9TIC9MSQovUCA0MiAwIFIKL1BnIDIgMCBSCi9LIDI4Pj4KZW5kb2JqCjQ3IDAgb2JqCjw8L1R5cGUgL1N0cnVjdEVsZW0KL1MgL0xJCi9QIDQyIDAgUgovUGcgMiAwIFIKL0sgMjk+PgplbmRvYmoKNDggMCBvYmoKPDwvVHlwZSAvU3RydWN0RWxlbQovUyAvTEkKL1AgNDIgMCBSCi9QZyAyIDAgUgovSyAzMD4+CmVuZG9iago0MiAwIG9iago8PC9UeXBlIC9TdHJ1Y3RFbGVtCi9TIC9MCi9QIDE2IDAgUgovSyBbNDMgMCBSIDQ0IDAgUiA0NSAwIFIgNDYgMCBSIDQ3IDAgUiA0OCAwIFJdPj4KZW5kb2JqCjQ5IDAgb2JqCjw8L1R5cGUgL1N0cnVjdEVsZW0KL1MgL1AKL1AgMTYgMCBSCi9QZyAyIDAgUgovSyAzMT4+CmVuZG9iago1MCAwIG9iago8PC9UeXBlIC9TdHJ1Y3RFbGVtCi9TIC9QCi9QIDE2IDAgUgovUGcgMiAwIFIKL0sgMzI+PgplbmRvYmoKNTIgMCBvYmoKPDwvVHlwZSAvU3RydWN0RWxlbQovUyAvTEkKL1AgNTEgMCBSCi9QZyAyIDAgUgovSyAzMz4+CmVuZG9iago1MyAwIG9iago8PC9UeXBlIC9TdHJ1Y3RFbGVtCi9TIC9MSQovUCA1MSAwIFIKL1BnIDIgMCBSCi9LIDM0Pj4KZW5kb2JqCjU0IDAgb2JqCjw8L1R5cGUgL1N0cnVjdEVsZW0KL1MgL0xJCi9QIDUxIDAgUgovUGcgMiAwIFIKL0sgMzU+PgplbmRvYmoKNTUgMCBvYmoKPDwvVHlwZSAvU3RydWN0RWxlbQovUyAvTEkKL1AgNTEgMCBSCi9QZyAyIDAgUgovSyAzNj4+CmVuZG9iago1NiAwIG9iago8PC9UeXBlIC9TdHJ1Y3RFbGVtCi9TIC9MSQovUCA1MSAwIFIKL1BnIDExIDAgUgovSyAzPj4KZW5kb2JqCjU3IDAgb2JqCjw8L1R5cGUgL1N0cnVjdEVsZW0KL1MgL0xJCi9QIDUxIDAgUgovUGcgMTEgMCBSCi9LIDQ+PgplbmRvYmoKNTEgMCBvYmoKPDwvVHlwZSAvU3RydWN0RWxlbQovUyAvTAovUCAxNiAwIFIKL0sgWzUyIDAgUiA1MyAwIFIgNTQgMCBSIDU1IDAgUiA1NiAwIFIgNTcgMCBSXT4+CmVuZG9iago1OCAwIG9iago8PC9UeXBlIC9TdHJ1Y3RFbGVtCi9TIC9QCi9QIDE2IDAgUgovUGcgMTEgMCBSCi9LIFswIDVdPj4KZW5kb2JqCjYwIDAgb2JqCjw8L1R5cGUgL1N0cnVjdEVsZW0KL1MgL1NwYW4KL1AgNTkgMCBSCi9QZyAxMSAwIFIKL0sgNj4+CmVuZG9iago2MiAwIG9iago8PC9UeXBlIC9TdHJ1Y3RFbGVtCi9TIC9TcGFuCi9QIDYxIDAgUgovUGcgMTEgMCBSCi9LIDc+PgplbmRvYmoKNjEgMCBvYmoKPDwvVHlwZSAvU3RydWN0RWxlbQovUyAvTGluawovUCA1OSAwIFIKL0sgWzYyIDAgUiA8PC9UeXBlIC9PQkpSCi9PYmogMTIgMCBSCi9QZyAxMSAwIFI+Pl0+PgplbmRvYmoKNjMgMCBvYmoKPDwvVHlwZSAvU3RydWN0RWxlbQovUyAvU3BhbgovUCA1OSAwIFIKL1BnIDExIDAgUgovSyA4Pj4KZW5kb2JqCjU5IDAgb2JqCjw8L1R5cGUgL1N0cnVjdEVsZW0KL1MgL1AKL1AgMTYgMCBSCi9QZyAxMSAwIFIKL0sgWzYwIDAgUiA2MSAwIFIgNjMgMCBSIDMwXT4+CmVuZG9iago2NSAwIG9iago8PC9UeXBlIC9TdHJ1Y3RFbGVtCi9TIC9MSQovUCA2NCAwIFIKL1BnIDExIDAgUgovSyA5Pj4KZW5kb2JqCjY0IDAgb2JqCjw8L1R5cGUgL1N0cnVjdEVsZW0KL1MgL0wKL1AgMTYgMCBSCi9LIDY1IDAgUj4+CmVuZG9iago2NiAwIG9iago8PC9UeXBlIC9TdHJ1Y3RFbGVtCi9TIC9QCi9QIDE2IDAgUgovUGcgMTEgMCBSCi9LIDEwPj4KZW5kb2JqCjY4IDAgb2JqCjw8L1R5cGUgL1N0cnVjdEVsZW0KL1MgL0xJCi9QIDY3IDAgUgovUGcgMTEgMCBSCi9LIDExPj4KZW5kb2JqCjY3IDAgb2JqCjw8L1R5cGUgL1N0cnVjdEVsZW0KL1MgL0wKL1AgMTYgMCBSCi9LIDY4IDAgUj4+CmVuZG9iago2OSAwIG9iago8PC9UeXBlIC9TdHJ1Y3RFbGVtCi9TIC9QCi9QIDE2IDAgUgovUGcgMTEgMCBSCi9LIDEyPj4KZW5kb2JqCjcxIDAgb2JqCjw8L1R5cGUgL1N0cnVjdEVsZW0KL1MgL0xJCi9QIDcwIDAgUgovUGcgMTEgMCBSCi9LIDEzPj4KZW5kb2JqCjcyIDAgb2JqCjw8L1R5cGUgL1N0cnVjdEVsZW0KL1MgL0xJCi9QIDcwIDAgUgovUGcgMTEgMCBSCi9LIDE0Pj4KZW5kb2JqCjczIDAgb2JqCjw8L1R5cGUgL1N0cnVjdEVsZW0KL1MgL0xJCi9QIDcwIDAgUgovUGcgMTEgMCBSCi9LIDE1Pj4KZW5kb2JqCjcwIDAgb2JqCjw8L1R5cGUgL1N0cnVjdEVsZW0KL1MgL0wKL1AgMTYgMCBSCi9LIFs3MSAwIFIgNzIgMCBSIDczIDAgUl0+PgplbmRvYmoKNzQgMCBvYmoKPDwvVHlwZSAvU3RydWN0RWxlbQovUyAvUAovUCAxNiAwIFIKL1BnIDExIDAgUgovSyAxNj4+CmVuZG9iago3NSAwIG9iago8PC9UeXBlIC9TdHJ1Y3RFbGVtCi9TIC9QCi9QIDE2IDAgUgovUGcgMTEgMCBSCi9LIDE3Pj4KZW5kb2JqCjc3IDAgb2JqCjw8L1R5cGUgL1N0cnVjdEVsZW0KL1MgL0xJCi9QIDc2IDAgUgovUGcgMTEgMCBSCi9LIDE4Pj4KZW5kb2JqCjc2IDAgb2JqCjw8L1R5cGUgL1N0cnVjdEVsZW0KL1MgL0wKL1AgMTYgMCBSCi9LIDc3IDAgUj4+CmVuZG9iago3OCAwIG9iago8PC9UeXBlIC9TdHJ1Y3RFbGVtCi9TIC9QCi9QIDE2IDAgUgovUGcgMTEgMCBSCi9LIDE5Pj4KZW5kb2JqCjc5IDAgb2JqCjw8L1R5cGUgL1N0cnVjdEVsZW0KL1MgL1AKL1AgMTYgMCBSCi9QZyAxMSAwIFIKL0sgWzEgMjBdPj4KZW5kb2JqCjgwIDAgb2JqCjw8L1R5cGUgL1N0cnVjdEVsZW0KL1MgL1AKL1AgMTYgMCBSCi9QZyAxMSAwIFIKL0sgMjE+PgplbmRvYmoKODEgMCBvYmoKPDwvVHlwZSAvU3RydWN0RWxlbQovUyAvUAovUCAxNiAwIFIKL1BnIDExIDAgUgovSyAyMj4+CmVuZG9iago4MiAwIG9iago8PC9UeXBlIC9TdHJ1Y3RFbGVtCi9TIC9QCi9QIDE2IDAgUgovUGcgMTEgMCBSCi9LIDIzPj4KZW5kb2JqCjgzIDAgb2JqCjw8L1R5cGUgL1N0cnVjdEVsZW0KL1MgL1AKL1AgMTYgMCBSCi9QZyAxMSAwIFIKL0sgMjQ+PgplbmRvYmoKODQgMCBvYmoKPDwvVHlwZSAvU3RydWN0RWxlbQovUyAvUAovUCAxNiAwIFIKL1BnIDExIDAgUgovSyBbMiAyNV0+PgplbmRvYmoKODYgMCBvYmoKPDwvVHlwZSAvU3RydWN0RWxlbQovUyAvTEkKL1AgODUgMCBSCi9QZyAxMSAwIFIKL0sgMjY+PgplbmRvYmoKODcgMCBvYmoKPDwvVHlwZSAvU3RydWN0RWxlbQovUyAvTEkKL1AgODUgMCBSCi9QZyAxMSAwIFIKL0sgMjc+PgplbmRvYmoKODggMCBvYmoKPDwvVHlwZSAvU3RydWN0RWxlbQovUyAvTEkKL1AgODUgMCBSCi9QZyAxMSAwIFIKL0sgMjg+PgplbmRvYmoKODkgMCBvYmoKPDwvVHlwZSAvU3RydWN0RWxlbQovUyAvTEkKL1AgODUgMCBSCi9QZyAxMSAwIFIKL0sgMjk+PgplbmRvYmoKODUgMCBvYmoKPDwvVHlwZSAvU3RydWN0RWxlbQovUyAvTAovUCAxNiAwIFIKL0sgWzg2IDAgUiA4NyAwIFIgODggMCBSIDg5IDAgUl0+PgplbmRvYmoKMTYgMCBvYmoKPDwvVHlwZSAvU3RydWN0RWxlbQovUyAvRG9jdW1lbnQKL1AgMTUgMCBSCi9LIFsxNyAwIFIgMTggMCBSIDE5IDAgUiAyMCAwIFIgMjggMCBSIDI5IDAgUiAzMCAwIFIgMzEgMCBSIDMyIDAgUiAzMyAwIFIgMzQgMCBSIDM1IDAgUiAzNiAwIFIgMzcgMCBSIDM4IDAgUiAzOSAwIFIgNDAgMCBSIDQxIDAgUiA0MiAwIFIgNDkgMCBSIDUwIDAgUiA1MSAwIFIgNTggMCBSIDU5IDAgUiA2NCAwIFIgNjYgMCBSIDY3IDAgUiA2OSAwIFIgNzAgMCBSIDc0IDAgUiA3NSAwIFIgNzYgMCBSIDc4IDAgUiA3OSAwIFIgODAgMCBSIDgxIDAgUiA4MiAwIFIgODMgMCBSIDg0IDAgUiA4NSAwIFJdPj4KZW5kb2JqCjkwIDAgb2JqClsyOCAwIFIgMzAgMCBSIDM5IDAgUiAxNyAwIFIgMTggMCBSIDE5IDAgUiAyMSAwIFIgMjMgMCBSIDI0IDAgUiAyNiAwIFIgMjcgMCBSIDI4IDAgUiAyOSAwIFIgMzAgMCBSIDMxIDAgUiAzMiAwIFIgMzMgMCBSIDM0IDAgUiAzNSAwIFIgMzYgMCBSIDM3IDAgUiAzOCAwIFIgMzkgMCBSIDQwIDAgUiA0MSAwIFIgNDMgMCBSIDQ0IDAgUiA0NSAwIFIgNDYgMCBSIDQ3IDAgUiA0OCAwIFIgNDkgMCBSIDUwIDAgUiA1MiAwIFIgNTMgMCBSIDU0IDAgUiA1NSAwIFIgMjAgMCBSXQplbmRvYmoKOTEgMCBvYmoKWzU4IDAgUiA3OSAwIFIgODQgMCBSIDU2IDAgUiA1NyAwIFIgNTggMCBSIDYwIDAgUiA2MiAwIFIgNjMgMCBSIDY1IDAgUiA2NiAwIFIgNjggMCBSIDY5IDAgUiA3MSAwIFIgNzIgMCBSIDczIDAgUiA3NCAwIFIgNzUgMCBSIDc3IDAgUiA3OCAwIFIgNzkgMCBSIDgwIDAgUiA4MSAwIFIgODIgMCBSIDgzIDAgUiA4NCAwIFIgODYgMCBSIDg3IDAgUiA4OCAwIFIgODkgMCBSIDU5IDAgUl0KZW5kb2JqCjkyIDAgb2JqCjw8L1R5cGUgL1BhcmVudFRyZWUKL051bXMgWzAgOTAgMCBSIDEgMjIgMCBSIDIgMjUgMCBSIDMgOTEgMCBSIDQgNjEgMCBSXT4+CmVuZG9iagoxNSAwIG9iago8PC9UeXBlIC9TdHJ1Y3RUcmVlUm9vdAovSyAxNiAwIFIKL1BhcmVudFRyZWVOZXh0S2V5IDUKL1BhcmVudFRyZWUgOTIgMCBSPj4KZW5kb2JqCjkzIDAgb2JqCjw8L1R5cGUgL0NhdGFsb2cKL1BhZ2VzIDE0IDAgUgovTWFy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MjkuODgyODEzCi9DYXBIZWlnaHQgNzE1LjgyMDMxCi9JdGFsaWNBbmdsZSAtMTIKL0ZvbnRCQm94IFstNTE3LjA4OTg0IC0zMjQuNzA3MDMgMTM1OC44ODY3MiA5OTcuNTU4NTldCi9Gb250RmlsZTIgMTAyIDAgUj4+CmVuZG9iagoxMDQgMCBvYmoKPDwvVHlwZSAvRm9udAovRm9udERlc2NyaXB0b3IgMTAzIDAgUgovQmFzZUZvbnQgL0NBQUFBQStBcmlhbC1JdGFsaWNNVAovU3VidHlwZSAvQ0lERm9udFR5cGUyCi9DSURUb0dJRE1hcCAvSWRlbnRpdHkKL0NJRFN5c3RlbUluZm8gPDwvUmVnaXN0cnkgKEFkb2JlKQovT3JkZXJpbmcgKElkZW50aXR5KQovU3VwcGxlbWVudCAwPj4KL1cgWzAgWzc1MCAwIDAgMjc3LjgzMjAzXSAxMSAxMiAzMzMuMDA3ODEgMTUgWzI3Ny44MzIwMyAzMzMuMDA3ODEgMjc3LjgzMjAzIDI3Ny44MzIwMyA1NTYuMTUyMzQgMCAwIDU1Ni4xNTIzNF0gMjkgWzI3Ny44MzIwM10gMzYgMzcgNjY2Ljk5MjE5IDM4IDM5IDcyMi4xNjc5NyA0MSBbNjEwLjgzOTg0XSA0NiBbNjY2Ljk5MjE5IDAgODMzLjAwNzgxIDAgMCA2NjYuOTkyMTkgMCA3MjIuMTY3OTcgNjY2Ljk5MjE5IDAgNzIyLjE2Nzk3XSA2OCA2OSA1NTYuMTUyMzQgNzEgNzIgNTU2LjE1MjM0IDczIFsyNzcuODMyMDMgNTU2LjE1MjM0IDU1Ni4xNTIzNCAyMjIuMTY3OTcgMjIyLjE2Nzk3XSA3OSBbMjIyLjE2Nzk3IDgzMy4wMDc4MV0gODEgODMgNTU2LjE1MjM0IDg1IFszMzMuMDA3ODFdIDg3IFsyNzcuODMyMDMgNTU2LjE1MjM0XSA5MCBbNzIyLjE2Nzk3XV0KL0RXIDUwMD4+CmVuZG9iagoxMDUgMCBvYmoKPDwvRmlsdGVyIC9GbGF0ZURlY29kZQovTGVuZ3RoIDMyND4+IHN0cmVhbQp4nF2Sy26DMBRE9/4KL5tFZPMwSSWElECRWPSh0nwAsS/UUjGWcRb8fYUvTaQusHTwjGfwhZVN1RjtKftwk2zB014b5WCebk4CvcKgDYliqrT0G4VVjp0lrGyqdpk9jI3pJ5LnlLJPGPTs3UKfTmq6wo6wd6fAaTPQp0vZ7ghrb9b+wAjGU06KgiroCStfO/vWjUBZsO0bBcZrv+wvZftQfC0WaBw4wjZyUjDbToLrzAAk55zzguZ1XdcFAaP+7R/Rde3ld+eCOiloznnMi5WiLFCSIFVIp0Dxc6A0Q3pBOgdK1kzO0woJzxR4ZnJEEqHPlpz99XjUPgcZL7HPMXh5HSjaSpYYnSIdMDPCFIFd8QNEHF6mqBRoz1ApUCkw6BBvtbDIemPrZO/jkDfnwPgw/jCC9fK1gfsfYie7utbnF5AGpDEKZW5kc3RyZWFtCmVuZG9iago3IDAgb2JqCjw8L1R5cGUgL0ZvbnQKL1N1YnR5cGUgL1R5cGUwCi9CYXNlRm9udCAvQ0FBQUFBK0FyaWFsLUl0YWxpY01UCi9FbmNvZGluZyAvSWRlbnRpdHktSAovRGVzY2VuZGFudEZvbnRzIFsxMDQgMCBSXQovVG9Vbmljb2RlIDEwNSAwIFI+PgplbmRvYmoKeHJlZgowIDEwNgowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMTUgMDAwMDAgbiAKMDAwMDAyNzA3MiAwMDAwMCBuIAowMDAwMDAwMTE5IDAwMDAwIG4gCjAwMDAwMDAxNTYgMDAwMDAgbiAKMDAwMDA1OTU3MSAwMDAwMCBuIAowMDAwMDkzNzE5IDAwMDAwIG4gCjAwMDAxMTE4NzUgMDAwMDAgbiAKMDAwMDAwMDI0MiAwMDAwMCBuIAowMDAwMDAwNDMzIDAwMDAwIG4gCjAwMDAwMDA2NjMgMDAwMDAgbiAKMDAwMDAyNzM0MyAwMDAwMCBuIAowMDAwMDE1NDUzIDAwMDAwIG4gCjAwMDAwMTU2NTAgMDAwMDAgbiAKMDAwMDAyNzYxMCAwMDAwMCBuIAowMDAwMDM0MDY0IDAwMDAwIG4gCjAwMDAwMzMxMDggMDAwMDAgbiAKMDAwMDAyNzY3MyAwMDAwMCBuIAowMDAwMDI3NzQyIDAwMDAwIG4gCjAwMDAwMjc4MTEgMDAwMDAgbiAKMDAwMDAyODQ1MyAwMDAwMCBuIAowMDAwMDI3ODgwIDAwMDAwIG4gCjAwMDAwMjgwMjQgMDAwMDAgbiAKMDAwMDAyNzk1MiAwMDAwMCBuIAowMDAwMDI4MTMwIDAwMDAwIG4gCjAwMDAwMjgyNzQgMDAwMDAgbiAKMDAwMDAyODIwMiAwMDAwMCBuIAowMDAwMDI4MzgwIDAwMDAwIG4gCjAwMDAwMjg1NjAgMDAwMDAgbiAKMDAwMDAyODYzNCAwMDAwMCBuIAowMDAwMDI4NzA0IDAwMDAwIG4gCjAwMDAwMjg3NzggMDAwMDAgbiAKMDAwMDAyODg0OCAwMDAwMCBuIAowMDAwMDI4OTE4IDAwMDAwIG4gCjAwMDAwMjg5ODggMDAwMDAgbiAKMDAwMDAyOTA1OCAwMDAwMCBuIAowMDAwMDI5MTI4IDAwMDAwIG4gCjAwMDAwMjkxOTggMDAwMDAgbiAKMDAwMDAyOTI2OCAwMDAwMCBuIAowMDAwMDI5MzM4IDAwMDAwIG4gCjAwMDAwMjk0MTIgMDAwMDAgbiAKMDAwMDAyOTQ4MiAwMDAwMCBuIAowMDAwMDI5OTc4IDAwMDAwIG4gCjAwMDAwMjk1NTIgMDAwMDAgbiAKMDAwMDAyOTYyMyAwMDAwMCBuIAowMDAwMDI5Njk0IDAwMDAwIG4gCjAwMDAwMjk3NjUgMDAwMDAgbiAKMDAwMDAyOTgzNiAwMDAwMCBuIAowMDAwMDI5OTA3IDAwMDAwIG4gCjAwMDAwMzAwNzkgMDAwMDAgbiAKMDAwMDAzMDE0OSAwMDAwMCBuIAowMDAwMDMwNjQ1IDAwMDAwIG4gCjAwMDAwMzAyMTkgMDAwMDAgbiAKMDAwMDAzMDI5MCAwMDAwMCBuIAowMDAwMDMwMzYxIDAwMDAwIG4gCjAwMDAwMzA0MzIgMDAwMDAgbiAKMDAwMDAzMDUwMyAwMDAwMCBuIAowMDAwMDMwNTc0IDAwMDAwIG4gCjAwMDAwMzA3NDYgMDAwMDAgbiAKMDAwMDAzMTE0NyAwMDAwMCBuIAowMDAwMDMwODIwIDAwMDAwIG4gCjAwMDAwMzA5NjYgMDAwMDAgbiAKMDAwMDAzMDg5MyAwMDAwMCBuIAowMDAwMDMxMDc0IDAwMDAwIG4gCjAwMDAwMzEzMTIgMDAwMDAgbiAKMDAwMDAzMTI0MSAwMDAwMCBuIAowMDAwMDMxMzc2IDAwMDAwIG4gCjAwMDAwMzE1MTkgMDAwMDAgbiAKMDAwMDAzMTQ0NyAwMDAwMCBuIAowMDAwMDMxNTgzIDAwMDAwIG4gCjAwMDAwMzE4NzAgMDAwMDAgbiAKMDAwMDAzMTY1NCAwMDAwMCBuIAowMDAwMDMxNzI2IDAwMDAwIG4gCjAwMDAwMzE3OTggMDAwMDAgbiAKMDAwMDAzMTk1MCAwMDAwMCBuIAowMDAwMDMyMDIxIDAwMDAwIG4gCjAwMDAwMzIxNjQgMDAwMDAgbiAKMDAwMDAzMjA5MiAwMDAwMCBuIAowMDAwMDMyMjI4IDAwMDAwIG4gCjAwMDAwMzIyOTkgMDAwMDAgbiAKMDAwMDAzMjM3NCAwMDAwMCBuIAowMDAwMDMyNDQ1IDAwMDAwIG4gCjAwMDAwMzI1MTYgMDAwMDAgbiAKMDAwMDAzMjU4NyAwMDAwMCBuIAowMDAwMDMyNjU4IDAwMDAwIG4gCjAwMDAwMzMwMjEgMDAwMDAgbiAKMDAwMDAzMjczMyAwMDAwMCBuIAowMDAwMDMyODA1IDAwMDAwIG4gCjAwMDAwMzI4NzcgMDAwMDAgbiAKMDAwMDAzMjk0OSAwMDAwMCBuIAowMDAwMDMzNDU0IDAwMDAwIG4gCjAwMDAwMzM3MzggMDAwMDAgbiAKMDAwMDAzMzk3MyAwMDAwMCBuIAowMDAwMDM0MTU2IDAwMDAwIG4gCjAwMDAwMzQzNDEgMDAwMDAgbiAKMDAwMDA1ODE1NCAwMDAwMCBuIAowMDAwMDU4Mzk1IDAwMDAwIG4gCjAwMDAwNTkxNjcgMDAwMDAgbiAKMDAwMDA1OTcxNSAwMDAwMCBuIAowMDAwMDkyMjAwIDAwMDAwIG4gCjAwMDAwOTI0MzYgMDAwMDAgbiAKMDAwMDA5MzMzMSAwMDAwMCBuIAowMDAwMDkzODYwIDAwMDAwIG4gCjAwMDAxMTA1NzcgMDAwMDAgbiAKMDAwMDExMDgzMSAwMDAwMCBuIAowMDAwMTExNDc5IDAwMDAwIG4gCnRyYWlsZXIKPDwvU2l6ZSAxMDYKL1Jvb3QgOTMgMCBSCi9JbmZvIDEgMCBSPj4Kc3RhcnR4cmVmCjExMjAyMwolJUVPRgo=";
var CV_TEXT="                              JESUTOFUNMI OLUWATOSIN\n                                             Product & UX Designer\n                      United Kingdom | +44 7831 559455 | oluwatosinjesutofunmi@gmail.com\n                            Portfolio: erastus.design | LinkedIn: Jesutofunmi Oluwatosin\n\nPROFILE\nProduct & UX Designer with 3+ years' experience across fintech and residential platforms, turning ambiguous\nproblems into development-ready journeys and prototypes. Owned end-to-end design for a regulated payments\nproduct at FirstBank, using live data to lift onboarding conversion by 10%. Works closely with Product, Engineering,\nResearch, Brand and Compliance, and presents design rationale clearly to non-design stakeholders. Designs for AI\nand prototypes quickly with Claude, Codex and Figma Make, including a conversational AI finance agent concept.\nDesigns to WCAG 2.1/2.2 standards and holds an MSc in Project Management with Data Analytics (2026).\n\nCORE SKILLS\nUX/UI Design: User-Centred Design, Interaction Design, Wireframing, User Flows, High-Fidelity Prototyping,\nInformation Architecture, Component-Based Design (Figma: Components, Variants, Tokens, Auto-Layout)\nDiscovery & Concepting: Journey Mapping, HMW Framework, Experience Maps, Concept Development,\nMoSCoW Prioritisation\nFacilitation & Collaboration: Ideation Workshops, User Feedback Sessions, Stakeholder Management,\nCross-Functional Partnership with Product, Engineering, Compliance, Brand and Research, Agile / Sprint Delivery\nResearch & Evidence: User Research, Usability Testing, Journey Mapping, Data- and Analytics-Informed Design\n(Hotjar), Task Success Rate, Completion Time and NPS Analysis\nAccessibility & Inclusion: Accessibility & Inclusive Design, WCAG 2.1 / 2.2\nDesign Systems & Hand-off: Reusable Pattern Libraries, Design Standards and Documentation, Design\nEnablement\nAI-Enabled Design: Claude for concept-to-prototype workflows and AI-assisted ideation; working familiarity with\nFigma Make and Codex\nTools: Figma, Miro, Notion, Hotjar, Claude, ChatGPT, ElevenLabs\n\nEXPERIENCE\nKeys - Product Designer                                                                       Feb 2025 \u2013 Feb 2026\nResidential community platform, UK\n \u2022 Mapped user journeys and interaction models using the HMW framework to surface usability gaps and\n    non-negotiable requirements, shaping design direction ahead of build.\n \u2022 Facilitated co-creation and ideation workshops with residents and stakeholders to generate and validate\n    concepts, and synthesised feedback into design recommendations.\n \u2022 Translated business, user and technical requirements into scalable, implementation-ready solutions within an\n    agile delivery environment.\n \u2022 Reviewed live product experiences against accessibility and inclusive design principles, identifying optimisation\n    opportunities throughout the design lifecycle.\n \u2022 Partnered closely with engineering to translate design intent into clear specifications and rationale, reducing\n    development friction and time to task completion.\n \u2022 Mapped end-to-end service journeys across app, community and support touchpoints, identifying where\n    operational processes broke the resident experience.\nFirst Bank - Product Designer                                                                 Oct 2021 \u2013 Feb 2024\nMerchant-facing payment experiences within a regulated banking environment\n \u2022 Owned end-to-end design for the flagship payments products, Firstchekout, from concept and interaction\n    design through to developer hand-off; Firstchekout processed over \u20a685 million (approx. \u00a345,000) in transaction\n    value within 3 months of launch, with an early-stage completion rate that shaped a continuous post-launch\n    improvement roadmap.\n \u2022 Balanced usability with regulatory, compliance and brand requirements when shaping merchant onboarding\n    and identity-verification flows.\n \u2022 Reviewed live experiences against task success rate, average completion time and Net Promoter Score,\n    translating findings into a 10% improvement in onboarding conversion.\n \u2022 Partnered with Product, Engineering and Compliance stakeholders on EPICs and requirements so design\n    intent was clearly communicated and accurately implemented.\n\f \u2022 Built and documented a reusable component library and design rationale, strengthening consistency,\n    development speed and knowledge-sharing across product and engineering teams.\n \u2022 Designed merchant onboarding and identity verification across the digital journey and the backstage\n    compliance checks behind it, balancing usability with regulatory requirements.\n\nSELECTED CONCEPT, INNOVATION WORK & OTHER IMPACTFUL ENGAGEMENTS\nApTap Switching Funnel - Design case study (https://erastus.design/aptap)                              Sep 2026\n \u2022 Diagnosed and redesigned a multi-stage broadband and utilities switching funnel for UK banking-app partners:\n    produced a PRD with personas and epics, two strategically distinct concepts (choice reduction vs. confidence\n    signals) and a three-arm A/B test plan with falsification criteria, working within FCA / Consumer Duty and\n    accessibility constraints.\nTechnology, Education and Design (TEDxWibsey)                                                            Sep 2026\n \u2022 I drafted a comprehensive event management plan, ensuring the programme started and ended on schedule,\n    and oversaw the attendee experience from registration through catering to the event's close. Also, I developed\n    the MC plan and communication protocols between speakers and the audience. In addition, I received an\n    award recognising my outstanding contribution to Bradford's technology, education and design community.\nBACI (financial Intelligence Agent), conversational AI case study                                       Jul 2026\n \u2022 Designed and built a bank-agnostic AI agent that analyses Open Banking transaction data, scores financial\n    health and explains it through a conversational chat interface.\n \u2022 Designed conversation flows, (fallback and error states when the AI can't answer), and ways to show how\n    confident the AI is in its insights, so users know when to trust it.\n \u2022 Prototyped in React using AI-assisted development [Claude / Codex], taking it from concept to working product\n    without a dedicated engineer.\nSections - Community Manager                                                                 Feb 2026 \u2013 Present\nCommunity for Designers in UK with over 300 members\n \u2022 I organised educational sessions with senior designers, including Harrison Wheeler (former Design Lead,\n    LinkedIn) and Suraj Soren (Design Lead, BT Group), covering how designers can adopt AI as a core part of\n    their process. Also, I organised end-of-year retreats in Albania, Wales and Montenegro to help members\n    recharge after the year's work. Alongside this, I ran one-to-one sessions with members on practical\n    product-improvement cases, helping them build sharper problem-solving approaches.\n\n\nEDUCATION\nBedfordshire University, United Kingdom, 2024 \u2013 2026\nMSc Project Management with Data Analytics (Completed)\nUniversity of Lagos, 2019\nBSc Finance\n\nCERTIFICATIONS\n \u2022 Certified Product Designer, Utiva Design School - 2020\n \u2022 Certified Product Designer, Tech4Dev - 2021\n \u2022 IBM Enterprise Design Thinking - 2021\n \u2022 Product Management Programme, Bright Network Technology on Demand - 2024\n\f";
var cvm=null,cvLast=null,DL=null;
function escH(t){return t.replace(/[&<>]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;"}[c];});}
if(window.claude&&window.claude.use){window.claude.use("downloads").then(function(d){DL=d;var b=document.getElementById("cvdl");if(b&&d)b.hidden=false;},function(){});}
function openCV(){
  var btn=document.getElementById("cvbtn");cvLast=btn;btn.classList.add("pull");setTimeout(function(){btn.classList.remove("pull");},500);
  if(!cvm){
    cvm=document.createElement("div");cvm.className="cvm";cvm.hidden=true;
    cvm.setAttribute("role","dialog");cvm.setAttribute("aria-modal","true");cvm.setAttribute("aria-labelledby","cvm-t");
    cvm.innerHTML='<div class="cvm-box"><div class="cvm-head"><h2 id="cvm-t">Jesutofunmi Oluwatosin · CV</h2>'+
      '<button type="button" class="btn ghost" id="cvdl"'+(DL?'':' hidden')+'>Download PDF</button>'+
      '<button type="button" class="cvm-x" id="cvx" aria-label="Close CV">'+ICO.x+'</button></div>'+
      '<div class="cvm-body" tabindex="0">'+CV_PAGES.map(function(src,i){return'<img src="'+src+'" alt="CV page '+(i+1)+' of '+CV_PAGES.length+'" width="1242" height="1755" decoding="async">';}).join("")+
      '<div class="sr-only">'+escH(CV_TEXT)+'</div></div></div>';
    document.body.appendChild(cvm);
    cvm.addEventListener("click",function(e){
      if(e.target===cvm||e.target.closest("#cvx"))closeCV();
      else if(e.target.closest("#cvdl"))saveCV(e.target.closest("#cvdl"));
    });
  }
  setTimeout(function(){cvm.hidden=false;document.body.style.overflow="hidden";
    requestAnimationFrame(function(){cvm.classList.add("show");});document.getElementById("cvx").focus();},reduce?0:200);
}
function closeCV(){
  if(!cvm||cvm.hidden)return;cvm.classList.remove("show");document.body.style.overflow="";
  setTimeout(function(){cvm.hidden=true;},reduce?0:260);if(cvLast)cvLast.focus();
}
function saveCV(b){
  if(!DL)return;
  var bin=atob(CV_PDF),u=new Uint8Array(bin.length);for(var i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
  DL.save({filename:"Jesutofunmi_Oluwatosin_CV.pdf",data:new Blob([u])}).then(function(){
    b.textContent="Saved";setTimeout(function(){b.textContent="Download PDF";},1800);
  },function(err){var c=err&&err.code;if(c==="declined"||c==="rate_limited")return;if(c!=="bad_request")b.hidden=true;});
}
document.getElementById("cvbtn").addEventListener("click",openCV);
document.addEventListener("keydown",function(e){
  if(!cvm||cvm.hidden)return;
  if(e.key==="Escape"){e.stopPropagation();closeCV();}
  else if(e.key==="Tab"){var f=[].slice.call(cvm.querySelectorAll("button:not([hidden]),[tabindex='0']"));if(!f.length)return;
    var i=f.indexOf(document.activeElement);if(e.shiftKey&&i<=0){e.preventDefault();f[f.length-1].focus();}else if(!e.shiftKey&&i===f.length-1){e.preventDefault();f[0].focus();}}
},true);

/* ---------- gallery book: opens to a scattered photo collage ---------- */
var GALLERY=[{"cap": "Night out with the community", "src": "img/gallery/01-night-out-with-the-community.webp", "x": 8.02, "y": 7.15, "w": 24.28, "h": 15.54, "r": -2}, {"cap": "Designing on the go", "src": "img/gallery/02-designing-on-the-go.webp", "x": 32.3, "y": 4.44, "w": 19.01, "h": 26.39, "r": 1.5}, {"cap": "A walk in the countryside", "src": "img/gallery/03-a-walk-in-the-countryside.webp", "x": 55.9, "y": 5.67, "w": 19.24, "h": 26.39, "r": 2}, {"cap": "Community meetup", "src": "img/gallery/04-community-meetup.webp", "x": 74.46, "y": 14.8, "w": 23.6, "h": 15.54, "r": -2.5}, {"cap": "The Principles of Design Thinking, my talk", "src": "img/gallery/05-the-principles-of-design-thinking-my-tal.webp", "x": 7.1, "y": 20.96, "w": 22.45, "h": 24.17, "r": -1.5}, {"cap": "Community dinner", "src": "img/gallery/06-community-dinner.webp", "x": 49.94, "y": 21.7, "w": 28.64, "h": 17.02, "r": 1}, {"cap": "Neon nights", "src": "img/gallery/07-neon-nights.webp", "x": 30.01, "y": 26.39, "w": 20.39, "h": 29.1, "r": 0}, {"cap": "Lunch break", "src": "img/gallery/08-lunch-break.webp", "x": 51.09, "y": 34.53, "w": 11.91, "h": 16.77, "r": -3}, {"cap": "Work in progress", "src": "img/gallery/09-work-in-progress.webp", "x": 63.69, "y": 36.99, "w": 15.81, "h": 21.95, "r": 1.5}, {"cap": "On stage at TEDxWibsey", "src": "img/gallery/10-on-stage-at-tedxwibsey.webp", "x": 80.18, "y": 30.83, "w": 13.97, "h": 22.19, "r": 2.5}, {"cap": "Graduation day", "src": "img/gallery/11-graduation-day.webp", "x": 6.41, "y": 43.65, "w": 14.66, "h": 22.93, "r": -2}, {"cap": "Rice and stew", "src": "img/gallery/12-rice-and-stew.webp", "x": 20.39, "y": 44.39, "w": 14.66, "h": 20.96, "r": 1.5}, {"cap": "An award for my community work", "src": "img/gallery/13-an-award-for-my-community-work.webp", "x": 46.05, "y": 50.55, "w": 14.43, "h": 20.47, "r": -2}, {"cap": "TEDxWibsey with the team", "src": "img/gallery/14-tedxwibsey-with-the-team.webp", "x": 59.56, "y": 57.95, "w": 21.76, "h": 17.26, "r": -1}, {"cap": "Spotlight of the week at Sections", "src": "img/gallery/15-spotlight-of-the-week-at-sections.webp", "x": 8.02, "y": 66.58, "w": 23.6, "h": 25.4, "r": 3}, {"cap": "The crew", "src": "img/gallery/16-the-crew.webp", "x": 31.62, "y": 72.5, "w": 22.45, "h": 18.0, "r": 2}, {"cap": "Non Stop Live Music", "src": "img/gallery/17-non-stop-live-music.webp", "x": 53.84, "y": 73.98, "w": 15.12, "h": 21.21, "r": -1}, {"cap": "Fundall: B2B Payments App of the Year", "src": "img/gallery/18-fundall-b2b-payments-app-of-the-year.webp", "x": 70.1, "y": 74.72, "w": 14.2, "h": 20.47, "r": 1.5}];
var gal=null,galLast=null,gView=-1,gOpenT=0;
function collageHTML(){
  return GALLERY.map(function(g,i){
    return '<button type="button" class="ph-card" data-i="'+i+'" style="left:'+g.x+'%;top:'+g.y+'%;width:'+g.w+'%;height:'+g.h+'%;--r:'+g.r+'deg;z-index:'+(i+1)+';animation-delay:'+(i*40)+'ms" aria-label="'+escH(g.cap)+'">'+
      '<img src="'+g.src+'" alt="" loading="lazy" decoding="async"><span class="ph-cap">'+escH(g.cap)+'</span></button>';
  }).join("");
}
function showPhoto(i){
  gView=(i+GALLERY.length)%GALLERY.length;var g=GALLERY[gView],v=document.getElementById("gview");
  v.querySelector("img").src=g.src;v.querySelector("img").alt=g.cap;v.querySelector("figcaption").textContent=g.cap;
  document.getElementById("gcount").textContent=(gView+1)+" / "+GALLERY.length;
  v.hidden=false;document.getElementById("gvx").focus();
}
function hidePhoto(){var v=document.getElementById("gview");if(v.hidden)return false;v.hidden=true;
  var c=gal.querySelector('.ph-card[data-i="'+gView+'"]');gView=-1;if(c)c.focus();return true;}
function openGallery(){
  galLast=document.activeElement;
  if(G&&G.hinge){G.bookOpen.target=1;G.bookLift.target=0;kick();}
  if(window.curFlash)curFlash("🤩",900);
  if(!gal){
    gal=document.createElement("div");gal.className="gal";gal.hidden=true;
    gal.setAttribute("role","dialog");gal.setAttribute("aria-modal","true");gal.setAttribute("aria-labelledby","gal-t");
    gal.innerHTML='<div class="gal-box"><div class="gal-head"><h2 id="gal-t">Gallery</h2><span class="mono">'+GALLERY.length+' moments · tap one to look closer</span>'+
      '<button type="button" class="gbtn" id="gx" aria-label="Close gallery">'+ICO.x+'</button></div>'+
      '<div class="collage" id="collage">'+collageHTML()+'</div></div>'+
      '<figure class="gview" id="gview" hidden><img alt=""><figcaption></figcaption>'+
      '<div class="gal-bar"><button type="button" class="gbtn" id="gprev" aria-label="Previous photo">'+GICO.prev+'</button><span class="mono" id="gcount"></span>'+
      '<button type="button" class="gbtn" id="gnext" aria-label="Next photo">'+GICO.next+'</button><button type="button" class="gbtn" id="gvx" aria-label="Back to all photos">'+GICO.grid+'</button></div></figure>';
    document.body.appendChild(gal);
    gal.addEventListener("click",function(e){
      var c=e.target.closest(".ph-card");
      if(c){showPhoto(+c.getAttribute("data-i"));return;}
      if(e.target.closest("#gx"))closeGallery();
      else if(e.target.closest("#gprev"))showPhoto(gView-1);
      else if(e.target.closest("#gnext"))showPhoto(gView+1);
      else if(e.target.closest("#gvx")||e.target.id==="gview")hidePhoto();
      else if(e.target===gal)closeGallery();
    });
  }
  document.getElementById("gview").hidden=true;gView=-1;
  var col=document.getElementById("collage");col.classList.remove("in");void col.offsetWidth;
  clearTimeout(gOpenT);gOpenT=setTimeout(function(){gOpenT=0;gal.hidden=false;document.body.style.overflow="hidden";
    requestAnimationFrame(function(){gal.classList.add("show");col.classList.add("in");});document.getElementById("gx").focus();},(G&&!reduce)?620:0);
}
function closeGallery(){
  if(gOpenT){clearTimeout(gOpenT);gOpenT=0;if(G&&G.hinge){G.bookOpen.target=0;kick();}return;}
  if(!gal||gal.hidden)return;gal.classList.remove("show");document.body.style.overflow="";
  setTimeout(function(){gal.hidden=true;if(G&&G.hinge){G.bookOpen.target=0;kick();}},reduce?0:260);
  if(galLast&&galLast.focus)galLast.focus();
}
var GICO={prev:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 3L5 8l5 5"/></svg>',
 next:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3l5 5-5 5"/></svg>',
 grid:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="2.5" width="4.5" height="4.5" rx="1"/><rect x="9" y="2.5" width="4.5" height="4.5" rx="1"/><rect x="2.5" y="9" width="4.5" height="4.5" rx="1"/><rect x="9" y="9" width="4.5" height="4.5" rx="1"/></svg>'};
document.addEventListener("keydown",function(e){
  if(gOpenT&&e.key==="Escape"){closeGallery();return;}
  if(!gal||gal.hidden)return;
  var viewing=!document.getElementById("gview").hidden;
  if(e.key==="Escape"){e.stopPropagation();if(!hidePhoto())closeGallery();}
  else if(viewing&&e.key==="ArrowRight"){e.preventDefault();showPhoto(gView+1);}
  else if(viewing&&e.key==="ArrowLeft"){e.preventDefault();showPhoto(gView-1);}
  else if(e.key==="Tab"){var f=[].slice.call(gal.querySelectorAll(viewing?"#gview button":".gal-head button,.ph-card"));if(!f.length)return;
    var i=f.indexOf(document.activeElement);if(e.shiftKey&&i<=0){e.preventDefault();f[f.length-1].focus();}else if(!e.shiftKey&&i===f.length-1){e.preventDefault();f[0].focus();}}
},true);

/* ---------- music speaker ---------- */
var PLAYLIST_URL="https://open.spotify.com/playlist/3Bta05AiZebspR4nmm30dd";
var TRACKS=[["Nostalgia","Sammy Virji, Issey Cross"],["I Guess We're Not The Same","Sammy Virji"],["on & on (Sammy Virji Remix)","piri & tommy, Sammy Virji"],["JOY (By My Side)","Joy Anonymous, Sammy Virji"],
 ["I Spy","Skepta"],["Summertime Blues","Chris Lake, Sammy Virji, Nathan Nicholson"],["In My Head","Chris Lake, Amber Mark"],["Hold On","MPH"],["Rendezvous","PAWSA"],
 ["Nocturnal (Disclosure V.I.P.)","Disclosure, The Weeknd"],["AWGAZI","Palm Monkey, RUSSI, The Palm Tree Boy"],["Say No Prayer","oskar med k, Izzy Bizu"],["Fire Fire","Shimza, AR/CO, Kasango"],
 ["Enjoy The Silence","ROMANTIK."],["Desire","Ian Asher, Olly Alexander"],["In The Morning","Maxomar"]];
var GENRES=["UK garage","House","Deep house","Melodic house","Afro house","UK rap"];
var ARTISTS=["Sammy Virji","Skepta","Chris Lake","MPH","oskar med k","Crunkz","ROMANTIK.","MIND","Maxomar"];
var mus=null,musLast=null;
function spSearch(t){return"https://open.spotify.com/search/"+encodeURIComponent(t[0].replace(/\s*\(.*\)$/,"")+" "+t[1].split(",")[0]);}
function openMusic(){
  musLast=document.activeElement;
  if(G&&G.music){G.music.on=true;G.music.t0=performance.now();kick();}
  if(window.curFlash)curFlash("🕺",1200);
  if(!mus){
    var play='<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3.2v9.6c0 .5.5.8.9.5l7-4.8a.6.6 0 0 0 0-1L5.9 2.7c-.4-.3-.9 0-.9.5z" fill="currentColor"/></svg>';
    mus=document.createElement("div");mus.className="mus";mus.hidden=true;
    mus.setAttribute("role","dialog");mus.setAttribute("aria-modal","true");mus.setAttribute("aria-labelledby","mus-t");
    mus.innerHTML='<div class="mus-box"><div class="mus-head"><div class="mus-art" aria-hidden="true"><span class="eq"><i></i><i></i><i></i><i></i><i></i></span><b>EDMs</b></div>'+
      '<div class="mus-meta"><span class="mono">On my speaker</span><h2 id="mus-t">EDMs</h2><p>My playlist · 100+ tracks of garage, house and UK rap</p>'+
      '<div class="mus-actions"><a class="btn spot" id="musplay" href="'+PLAYLIST_URL+'" target="_blank" rel="noopener">'+play+' Play on Spotify</a><span class="small">Opens in Spotify</span></div></div>'+
      '<button type="button" class="cvm-x" id="musx" aria-label="Close playlist">'+ICO.x+'</button></div>'+
      '<div class="mus-body"><h3 class="mono">What I listen to</h3><div class="chips">'+GENRES.map(function(g){return'<span>'+g+'</span>';}).join("")+'</div>'+
      '<h3 class="mono">Artists on repeat</h3><p class="artists">'+ARTISTS.join(" · ")+'</p>'+
      '<h3 class="mono">From the playlist</h3><ol class="tracks">'+TRACKS.map(function(t,k){return'<li><a href="'+spSearch(t)+'" target="_blank" rel="noopener" aria-label="Play '+escH(t[0])+' by '+escH(t[1])+' on Spotify"><span class="n">'+String(k+1).padStart(2,"0")+'</span><span class="tt"><b>'+escH(t[0])+'</b><small>'+escH(t[1])+'</small></span><span class="pl">'+play+'</span></a></li>';}).join("")+'</ol>'+
      '<a class="more" href="'+PLAYLIST_URL+'" target="_blank" rel="noopener">See all tracks on Spotify →</a></div></div>';
    document.body.appendChild(mus);
    mus.addEventListener("click",function(e){if(e.target===mus||e.target.closest("#musx"))closeMusic();});
  }
  mus.hidden=false;document.body.style.overflow="hidden";requestAnimationFrame(function(){mus.classList.add("show");});document.getElementById("musplay").focus();
}
function closeMusic(){
  if(!mus||mus.hidden)return;mus.classList.remove("show");document.body.style.overflow="";
  setTimeout(function(){mus.hidden=true;},reduce?0:260);
  if(G&&G.music){G.music.on=false;kick();}
  if(musLast&&musLast.focus)musLast.focus();
}
document.addEventListener("keydown",function(e){
  if(!mus||mus.hidden)return;
  if(e.key==="Escape"){e.stopPropagation();closeMusic();}
  else if(e.key==="Tab"){var f=[].slice.call(mus.querySelectorAll("a,button"));var i=f.indexOf(document.activeElement);
    if(e.shiftKey&&i<=0){e.preventDefault();f[f.length-1].focus();}else if(!e.shiftKey&&i===f.length-1){e.preventDefault();f[0].focus();}}
},true);

/* ---------- night city through the bedroom window (canvas, animated) ---------- */
(function(){
  var cv=document.getElementById("city");if(!cv||!cv.getContext)return;
  var CW=579,CH=344,VX=292,VY=250,DPR=Math.min(2,window.devicePixelRatio||1);
  cv.width=CW*DPR;cv.height=CH*DPR;
  var ctx=cv.getContext("2d");
  var seed=11;function rnd(){seed=(seed*16807)%2147483647;return(seed-1)/2147483646;}
  function layer(){var c=document.createElement("canvas");c.width=CW*DPR;c.height=CH*DPR;var x=c.getContext("2d");x.scale(DPR,DPR);return{c:c,x:x};}
  function sc(d){return 1-d*0.9;}
  function hw(d){return 10+150*sc(d);}
  function gy(d){return VY+(CH-VY)*sc(d);}
  var WARM=["#ffcf7a","#ffb35c","#ffe2a8","#f6a04d","#ffd99a"];
  var base=layer(),lit=layer(),wins=[];
  /* sky */
  var b=base.x,g=b.createLinearGradient(0,0,0,VY);
  g.addColorStop(0,"#0c1220");g.addColorStop(.55,"#1d2740");g.addColorStop(1,"#3a3d58");
  b.fillStyle=g;b.fillRect(0,0,CW,CH);
  var stars=[];for(var i=0;i<46;i++)stars.push({x:rnd()*CW,y:rnd()*120,p:rnd()*6.28,r:.5+rnd()*.7});
  /* light beams behind the tower */
  for(var i=0;i<9;i++){var bx=VX-60+i*15,bg=b.createLinearGradient(0,0,0,VY);bg.addColorStop(0,"rgba(170,190,235,0)");bg.addColorStop(1,"rgba(170,190,235,.08)");b.fillStyle=bg;b.fillRect(bx,0,4+rnd()*6,VY);}
  /* tower at the end of the street */
  function tower(x){
    var t=b.createLinearGradient(0,40,0,VY);t.addColorStop(0,"#d9dbe6");t.addColorStop(.5,"#c9a574");t.addColorStop(1,"#a8743f");
    b.fillStyle="#5c5a68";b.fillRect(x-34,74,68,VY-74);
    b.fillStyle=t;b.fillRect(x-30,74,60,VY-74);
    b.fillStyle="#cfd2de";b.fillRect(x-24,52,48,22);
    b.beginPath();b.moveTo(x-25,52);b.lineTo(x,30);b.lineTo(x+25,52);b.closePath();b.fillStyle="#e6e8f1";b.fill();
    b.fillStyle="#cfd2de";b.fillRect(x-1,16,2,14);b.fillRect(x-2.5,12,5,5);
    for(var yy=80;yy<VY-6;yy+=6)for(var xx=x-27;xx<x+26;xx+=5){
      var on=rnd()<.62;b.fillStyle=on?"rgba(255,236,190,.9)":"rgba(60,55,70,.9)";b.fillRect(xx,yy,3,4);
      if(on)wins.push({x:xx,y:yy,w:3,h:4,on:true,c:"rgba(255,236,190,.95)",tower:1});}
    for(var xx=x-20;xx<x+20;xx+=5){b.fillStyle="rgba(255,240,205,.85)";b.fillRect(xx,56,3,14);}
  }
  /* buildings flanking the street, far to near */
  var CLR=["#2a2830","#33282a","#2b3140","#3a2f2c","#262a35","#3b3236","#2f3546"];
  function block(side,d){
    var s=sc(d),edge=VX+side*(hw(d)+4*s),w=(70+rnd()*90)*s,h=(150+rnd()*330)*s,gyy=gy(d);
    var x0=side<0?edge-w:edge,top=gyy-h,col=CLR[Math.floor(rnd()*CLR.length)];
    b.fillStyle=col;b.fillRect(x0,top,w,h);
    var sx=side<0?x0+w:x0,sd=8*s;b.beginPath();b.moveTo(sx,top);b.lineTo(sx-side*sd*-1,top+sd*.6);b.lineTo(sx-side*sd*-1,gyy);b.lineTo(sx,gyy);b.closePath();
    b.fillStyle="rgba(0,0,0,.25)";b.fill();
    b.fillStyle="rgba(255,255,255,.04)";b.fillRect(x0,top,w,2*s+1);
    var cw=Math.max(1.8,4.6*s),ch=Math.max(2.2,6.4*s),gx=Math.max(4.4,11*s),gyv=Math.max(5.2,14*s),p=.1+rnd()*.18;
    for(var yy=top+gyv*.8;yy<gyy-gyv*1.6;yy+=gyv)for(var xx=x0+gx*.6;xx<x0+w-cw-gx*.3;xx+=gx){
      b.fillStyle="rgba(14,16,24,.85)";b.fillRect(xx,yy,cw,ch);
      wins.push({x:xx,y:yy,w:cw,h:ch,on:rnd()<p,c:WARM[Math.floor(rnd()*WARM.length)]});}
    /* shop front glow at street level */
    if(s>.35){var sg=b.createLinearGradient(0,gyy-14*s,0,gyy);sg.addColorStop(0,"rgba(255,170,90,0)");sg.addColorStop(1,"rgba(255,170,90,.35)");b.fillStyle=sg;b.fillRect(x0,gyy-14*s,w,14*s);}
  }
  b.fillStyle="#2a2a38";for(var i=0;i<7;i++){var hx=VX-120+rnd()*240,hh=40+rnd()*90;b.fillRect(hx,VY-hh,18+rnd()*26,hh);}
  tower(VX);
  for(var d=.95;d>=0;d-=.07){block(-1,d+rnd()*.03);block(1,d+rnd()*.03);}
  /* street and pavements */
  b.beginPath();b.moveTo(VX-hw(1),VY);b.lineTo(VX+hw(1),VY);b.lineTo(VX+hw(0),CH);b.lineTo(VX-hw(0),CH);b.closePath();
  var rg=b.createLinearGradient(0,VY,0,CH);rg.addColorStop(0,"#3a3036");rg.addColorStop(1,"#17171c");b.fillStyle=rg;b.fill();
  b.strokeStyle="rgba(255,220,160,.25)";b.lineWidth=1;b.setLineDash([6,8]);b.beginPath();b.moveTo(VX,VY);b.lineTo(VX,CH);b.stroke();b.setLineDash([]);
  /* street lamps and traffic lights */
  var lamps=[];[.06,.18,.3,.42,.54,.66,.78,.88].forEach(function(d){[-1,1].forEach(function(side){
    var s=sc(d),x=VX+side*(hw(d)+6*s),y=gy(d),hgt=48*s;
    b.strokeStyle="rgba(10,10,14,.9)";b.lineWidth=Math.max(.6,2*s);b.beginPath();b.moveTo(x,y);b.lineTo(x,y-hgt);b.stroke();
    lamps.push({x:x,y:y-hgt,r:Math.max(.9,3.6*s),dbl:s>.45,s:s,p:rnd()*6.28});});});
  var signals=[{d:.36,side:-1},{d:.36,side:1},{d:.62,side:1}].map(function(o){var s=sc(o.d);return{x:VX+o.side*(hw(o.d)-2*s),y:gy(o.d)-30*s,r:Math.max(.8,2*s)};});
  function drawLit(){var x=lit.x;x.clearRect(0,0,CW,CH);
    wins.forEach(function(w){if(!w.on)return;x.fillStyle=w.c;x.fillRect(w.x,w.y,w.w,w.h);});}
  drawLit();
  /* traffic */
  var cars=[];function car(away,init){var lane=away?(rnd()<.5?-.55:-.25):(rnd()<.5?.25:.55);
    return{away:away,lane:lane,d:init?rnd():(away?0:1),v:.05+rnd()*.05};}
  for(var i=0;i<6;i++)cars.push(car(true,true));for(var i=0;i<6;i++)cars.push(car(false,true));
  var plane={x:-20,y:40,on:false,next:4000};
  var last=performance.now(),t0=last,acc=0,flickT=0,raf=0,visible=true;
  function frame(now){
    var dt=Math.min(.1,(now-last)/1000);last=now;acc+=dt;
    if(acc<1/30){raf=requestAnimationFrame(frame);return;}var step=acc;acc=0;var t=(now-t0)/1000;
    ctx.setTransform(DPR,0,0,DPR,0,0);ctx.drawImage(base.c,0,0,CW,CH);
    stars.forEach(function(st){ctx.globalAlpha=.35+.35*Math.sin(t*1.3+st.p);ctx.fillStyle="#dfe6ff";ctx.fillRect(st.x,st.y,st.r,st.r);});ctx.globalAlpha=1;
    ctx.drawImage(lit.c,0,0,CW,CH);
    /* beacon on the spire */
    if(Math.sin(t*2.4)>.6){ctx.fillStyle="#ff5a4a";ctx.beginPath();ctx.arc(VX,11,1.6,0,6.28);ctx.fill();ctx.fillStyle="rgba(255,90,74,.25)";ctx.beginPath();ctx.arc(VX,11,5,0,6.28);ctx.fill();}
    /* plane */
    if(plane.on){plane.x+=28*step;if(plane.x>CW+20){plane.on=false;plane.next=t*1000+16000+rnd()*14000;}
      if(Math.sin(t*8)>0){ctx.fillStyle="#fff";ctx.fillRect(plane.x,plane.y,1.6,1.6);}ctx.fillStyle="#ff5a4a";ctx.fillRect(plane.x-4,plane.y+1,1.2,1.2);}
    else if(t*1000>plane.next){plane.on=true;plane.x=-10;plane.y=18+rnd()*50;}
    /* lamps */
    lamps.forEach(function(L){var pulse=.9+.1*Math.sin(t*1.7+L.p),R=(14*L.s+4)*pulse;
      var gg=ctx.createRadialGradient(L.x,L.y,0,L.x,L.y,R);gg.addColorStop(0,"rgba(255,214,150,.55)");gg.addColorStop(1,"rgba(255,180,100,0)");
      ctx.fillStyle=gg;ctx.fillRect(L.x-R,L.y-R,R*2,R*2);
      ctx.fillStyle="#ffe9c4";ctx.beginPath();ctx.arc(L.x,L.y,L.r,0,6.28);ctx.fill();
      if(L.dbl){ctx.beginPath();ctx.arc(L.x-L.r*2.2,L.y+L.r*.8,L.r*.9,0,6.28);ctx.fill();ctx.beginPath();ctx.arc(L.x+L.r*2.2,L.y+L.r*.8,L.r*.9,0,6.28);ctx.fill();}});
    var green=(t%12)<7;signals.forEach(function(sg){ctx.fillStyle=green?"#5be3a0":"#ff5a4a";ctx.beginPath();ctx.arc(sg.x,sg.y,sg.r,0,6.28);ctx.fill();
      var g2=ctx.createRadialGradient(sg.x,sg.y,0,sg.x,sg.y,sg.r*4);g2.addColorStop(0,green?"rgba(91,227,160,.4)":"rgba(255,90,74,.4)");g2.addColorStop(1,"rgba(0,0,0,0)");ctx.fillStyle=g2;ctx.fillRect(sg.x-sg.r*4,sg.y-sg.r*4,sg.r*8,sg.r*8);});
    /* cars: far ones first */
    cars.sort(function(a,b2){return b2.d-a.d;});
    cars.forEach(function(c,i){
      c.d+=(c.away?1:-1)*c.v*step*(green||c.d<.3||c.d>.42?1:.15);
      if(c.d>1||c.d<0){cars[i]=car(c.away,false);return;}
      var s=sc(c.d),x=VX+c.lane*hw(c.d),y=gy(c.d)-1.5*s,w=16*s+2,h=7*s+1.4,lr=Math.max(.7,1.6*s);
      ctx.fillStyle="rgba(10,10,14,.92)";ctx.fillRect(x-w/2,y-h,w,h);
      var col=c.away?"255,70,60":"255,246,220",ry=y-h*.45;
      [x-w*.34,x+w*.34].forEach(function(lx){ctx.fillStyle="rgb("+col+")";ctx.beginPath();ctx.arc(lx,ry,lr,0,6.28);ctx.fill();
        var g3=ctx.createRadialGradient(lx,ry,0,lx,ry,lr*5);g3.addColorStop(0,"rgba("+col+",.45)");g3.addColorStop(1,"rgba("+col+",0)");ctx.fillStyle=g3;ctx.fillRect(lx-lr*5,ry-lr*5,lr*10,lr*10);});
      ctx.fillStyle="rgba("+col+",.08)";ctx.fillRect(x-w*.45,y,w*.9,Math.min(26,22*s));});
    /* window lights switching on and off */
    flickT+=step;if(flickT>.35){flickT=0;for(var k=0;k<4;k++){var w=wins[Math.floor(rnd()*wins.length)];if(!w.tower)w.on=!w.on;}drawLit();}
    /* sit it back into the dark room */
    ctx.fillStyle="rgba(8,9,13,.34)";ctx.fillRect(0,0,CW,CH);
    raf=visible?requestAnimationFrame(frame):0;
  }
  function start(){if(!raf&&visible){last=performance.now();raf=requestAnimationFrame(frame);}}
  function check(){var cab=document.getElementById("cabView");visible=!document.hidden&&cab&&!cab.hidden&&getComputedStyle(cv).display!=="none";if(visible)start();}
  if(reduce){acc=1;visible=false;frame(performance.now());return;}
  document.addEventListener("visibilitychange",check);window.addEventListener("hashchange",function(){setTimeout(check,0);});window.addEventListener("resize",check);
  check();
})();

/* ---------- Biscuit the dog: sleeps in the dark, wakes when the lamps come on ---------- */
(function(){
  var dog=document.getElementById("dog"),say=document.getElementById("dogsay");if(!dog)return;
  var sayT=0,happyT=0;
  var AWAKE=["Woof!","Hi! Pet me more!","Who's a good boy? Me!","Did you open the Projects drawer yet?","Wag wag wag","Treat? 🦴"];
  var SLEEPY=["zzz… five more minutes","*snores softly*","Shh… dreaming of treats","Turn the light on if you want to play"];
  function speak(t,ms){say.textContent=t;say.classList.add("show");clearTimeout(sayT);sayT=setTimeout(function(){say.classList.remove("show");},ms||1800);}
  function pick(a){return a[Math.floor(Math.random()*a.length)];}
  window.dogTo=function(on){
    var was=dog.classList.contains("awake");
    dog.classList.toggle("awake",on);
    dog.setAttribute("aria-label",on?"Biscuit the dog is awake. Pet him":"Biscuit the dog is asleep. Pet him");
    if(on&&!was){setTimeout(SFX.yawn,300);dog.classList.remove("waking");void dog.offsetWidth;dog.classList.add("waking");setTimeout(function(){dog.classList.remove("waking");},950);setTimeout(function(){speak("*yawn* Oh, hi!",1600);},400);}
    if(!on&&was)speak("Night night…",1400);
  };
  dog.addEventListener("click",function(){
    if(dog.classList.contains("awake")){
      dog.classList.remove("happy");void dog.offsetWidth;dog.classList.add("happy");clearTimeout(happyT);happyT=setTimeout(function(){dog.classList.remove("happy");},1300);
      speak(pick(AWAKE));SFX.bark();
    }else{SFX.snore();
      dog.classList.remove("twitch");void dog.offsetWidth;dog.classList.add("twitch");setTimeout(function(){dog.classList.remove("twitch");},520);
      speak(pick(SLEEPY),2200);
    }
  });
  dog.addEventListener("mouseenter",function(){if(dog.classList.contains("awake")&&!say.classList.contains("show"))speak("🐾",900);});
})();

/* ---------- iPhone on the cabinet: buzzes, lights up, second tap copies the email ---------- */
var phoneOffT=0;
function phoneSay(t,e){tip.textContent=t;tip.classList.remove("pop");void tip.offsetWidth;tip.classList.add("show","pop");if(e)moveTip(e);
  clearTimeout(tipHide);tipHide=setTimeout(function(){tip.classList.remove("show");},1800);}
function ringPhone(e){
  if(!G||!G.phone)return;
  var now=performance.now();G.buzz.t0=now;G.buzz.until=now+1700;G.buzz.drift=0;
  G.phoneOn=true;G.phoneScreen.redraw();render3d();kick();
  try{if(navigator.vibrate)navigator.vibrate([340,220,340,220,340]);}catch(err){}
  SFX.buzz();
  if(window.curFlash)curFlash("😲",1200);
  if(e)phoneSay("Bzzz bzzz… OJ is calling",e);
  clearTimeout(phoneOffT);
  setTimeout(callIncoming,650);
}

/* ---------- OJ: call Jesutofunmi's ElevenLabs voice agent from the phone ---------- */
var OJ_AGENT="agent_5101m456pm8effssyn8jqz3v8fef";
var OJ_FIRST="Hello! Thank you for calling. I'm OJ, Jesutofunmi's assistant. I will provide relevant information you need to know. What would you love to know?";
var OJ_EMAIL="oluwatosinjesutofunmi@gmail.com";
/* approved facts for when the live line can't connect (e.g. inside a sandboxed preview) */
var OJ_FACTS=[
 {k:/who|about|intro|tell me|what does he do|background|himself|designer/,a:"Jesutofunmi, also known as Erastus, is a product and UX designer based in the UK. He has over three years of experience across fintech and residential platforms, turning messy problems into clear, development-ready journeys and prototypes."},
 {k:/firstchekout|first ?bank|payment|checkout|best|proud|impact|result|number/,a:"His flagship project is Firstchekout at First Bank. He owned the design end to end, from concept to developer hand-off. It processed over 85 million naira, about 45 thousand pounds, within three months of launch. He also lifted onboarding conversion by 10 percent using live data."},
 {k:/aptap|broadband|switching|utilit/,a:"Aptap is an AI-supported workflow project. He redesigned the broadband and utilities switching funnel that Aptap embeds in UK banking apps, taking it from diagnosis to a PRD, two Figma variants of the deal results page and a three-arm A/B test plan."},
 {k:/keys|residential|community platform/,a:"At Keys, a residential community platform in the UK, he mapped resident journeys, ran co-creation workshops with residents, and worked closely with engineering to ship accessible, implementation-ready designs."},
 {k:/\bai\b|baci|buddy|agent|claude|codex|prototype|react/,a:"He designs for AI too. He built Baci, a bank-agnostic AI finance agent that reads Open Banking data, scores financial health, and explains it in a chat. He prototyped it in React with Claude and Codex, without a dedicated engineer."},
 {k:/project|portfolio|work|case stud|example/,a:"There are five case files in the cabinet: Firstchekout at First Bank, Fundall, Keys, Aptap, an AI-supported workflow project, and Baci, an AI financial buddy. Open the Projects drawer to read them. Would you like me to tell you about one?"},
 {k:/process|how does he|approach|method|research|work with/,a:"He starts by asking why. He uses journey mapping, How Might We framing, MoSCoW prioritisation and usability testing, and designs to WCAG accessibility standards. He works closely with product, engineering and compliance."},
 {k:/hire|hiring|available|availability|freelance|job|role|open to|collab/,a:"Yes. He's open to freelance product design work and to product design roles in fintech in the UK. The best next step is a short call with him directly."},
 {k:/contact|email|reach|meet|meeting|call him|next step|book|schedule/,a:"You can email him at oluwatosinjesutofunmi at gmail dot com. I've put the address on screen so you can copy it. He'll be happy to set up a call."},
 {k:/educat|degree|study|msc|university|prince|certif/,a:"He holds an MSc in Project Management with Data Analytics from the University of Bedfordshire, a BSc in Finance from the University of Lagos, and he's PRINCE2 certified."},
 {k:/sections|tedx|award|mentor|volunteer|speak/,a:"He's the community manager of Sections, a community of over 300 designers in the UK. He also helped run TEDxWibsey and received an award for his contribution to Bradford's technology, education and design community."},
 {k:/skill|tool|figma|design system|accessib/,a:"He works in Figma with components, variants and tokens, builds reusable design systems, designs to WCAG 2.1 and 2.2, and uses tools like Hotjar, Miro and Notion. He also prototypes quickly with AI tools."},
 {k:/thank|bye|that's all|nothing else|goodbye/,a:"It was a pleasure. Thanks for calling, and have a lovely day!"}
];
var OJ_CHIPS=["Who is Jesutofunmi?","What's his best project?","Is he available to hire?","How do I contact him?"];
function ojAnswer(q){q=q.toLowerCase();for(var i=0;i<OJ_FACTS.length;i++)if(OJ_FACTS[i].k.test(q))return OJ_FACTS[i].a;
  return "That's a good question. I don't have that detail, but Jesutofunmi can answer it directly. Would you like his email?";}

var CALL={el:null,state:"idle",ws:null,ctx:null,stream:null,proc:null,src:null,muted:false,playEnd:0,level:0,raf:0,live:false,ringT:0,speaking:false,ended:false};
var CI={mic:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/></svg>',
 micoff:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M4 4l16 16"/></svg>',
 phone:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z"/></svg>',
 send:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'};
function callBuild(){
  var c=document.createElement("div");c.className="call";c.hidden=true;
  c.setAttribute("role","dialog");c.setAttribute("aria-modal","true");c.setAttribute("aria-labelledby","call-t");
  c.innerHTML='<div class="call-card" style="--bg:url('+ME+')">'+
   '<div class="call-top"><div><p class="call-k" id="call-k">Incoming call</p><h2 id="call-t">OJ · Jesutofunmi\'s assistant</h2></div>'+
   '<span class="call-wave" aria-hidden="true">'+Array.apply(null,Array(14)).map(function(_,i){return'<i style="--h:'+(.35+.65*((i*7)%11)/11).toFixed(2)+'"></i>';}).join("")+'</span></div>'+
   '<div class="call-mid"><div class="call-rings" id="call-rings"><span></span><span></span><span></span>'+
   '<button type="button" class="call-mic" id="call-mic" aria-label="Mute microphone">'+CI.mic+'</button></div>'+
   '<p class="call-status" id="call-status" aria-live="polite">Ringing…</p><p class="call-sub" id="call-sub">OJ can tell you about Jesutofunmi\'s work</p>'+
   '<p class="call-line" id="call-line" aria-live="polite"></p></div>'+
   '<div class="call-ask" id="call-ask" hidden><div class="call-chips" id="call-chips">'+OJ_CHIPS.map(function(q){return'<button type="button" class="call-chip">'+q+'</button>';}).join("")+'</div>'+
   '<form class="call-form" id="call-form"><label class="sr-only" for="call-q">Ask OJ a question</label><input id="call-q" type="text" autocomplete="off" placeholder="Ask OJ anything…"><button type="submit" aria-label="Ask">'+CI.send+'</button></form></div>'+
   '<div class="call-btns" id="call-btns-in"><button type="button" class="call-dec" id="call-dec">Decline</button><button type="button" class="call-acc" id="call-acc">'+CI.phone+' Answer</button></div>'+
   '<div class="call-btns" id="call-btns-on" hidden><button type="button" class="call-end" id="call-end">End call</button></div>'+
   '</div>';
  document.body.appendChild(c);CALL.el=c;
  c.addEventListener("click",function(e){
    if(e.target.closest("#call-acc"))callAnswer();
    else if(e.target.closest("#call-dec"))callClose("Declined");
    else if(e.target.closest("#call-end"))callClose("Call ended");
    else if(e.target.closest("#call-mic"))callMute();
    else{var ch=e.target.closest(".call-chip");if(ch)callAsk(ch.textContent);}
  });
  c.querySelector("#call-form").addEventListener("submit",function(e){e.preventDefault();var i=document.getElementById("call-q");if(i.value.trim()){callAsk(i.value.trim());i.value="";}});
}
function $c(id){return document.getElementById(id);}
function callSet(state,status,sub){
  CALL.state=state;CALL.el.setAttribute("data-state",state);
  if(status!=null)$c("call-status").textContent=status;if(sub!=null)$c("call-sub").textContent=sub;
}
function callIncoming(){
  if(!CALL.el)callBuild();
  if(!CALL.el.hidden)return;
  CALL.ended=false;CALL.live=false;CALL.muted=false;$c("call-line").textContent="";
  $c("call-k").textContent="Incoming call";$c("call-btns-in").hidden=false;$c("call-btns-on").hidden=true;$c("call-ask").hidden=true;
  callSet("ringing","Ringing…","OJ can tell you about Jesutofunmi's work");
  CALL.el.hidden=false;document.body.style.overflow="hidden";requestAnimationFrame(function(){CALL.el.classList.add("show");});
  $c("call-acc").focus({preventScroll:true});
  SFX.ring();
  clearInterval(CALL.ringT);CALL.ringT=setInterval(function(){SFX.buzz();if(G&&G.buzz){var n=performance.now();G.buzz.t0=n;G.buzz.until=n+1100;kick();}},2200);
  callLoop();
}
function callClose(msg){
  clearInterval(CALL.ringT);SFX.stopRing();if(CALL.state!=="ringing")SFX.hangup();CALL.ended=true;
  try{if(CALL.ws){CALL.ws.onclose=null;CALL.ws.close();}}catch(e){}CALL.ws=null;
  try{if(CALL.proc)CALL.proc.disconnect();if(CALL.src)CALL.src.disconnect();}catch(e){}
  if(CALL.stream)CALL.stream.getTracks().forEach(function(t){t.stop();});CALL.stream=null;
  try{if(CALL.ctx)CALL.ctx.close();}catch(e){}CALL.ctx=null;
  try{speechSynthesis.cancel();}catch(e){}
  callSet("ended",msg||"Call ended","");
  setTimeout(function(){CALL.el.classList.remove("show");document.body.style.overflow="";setTimeout(function(){CALL.el.hidden=true;cancelAnimationFrame(CALL.raf);CALL.raf=0;},260);},msg?500:0);
  if(G){G.phoneOn=false;G.phoneScreen.redraw();render3d();kick();}
}
function callAnswer(){
  clearInterval(CALL.ringT);SFX.stopRing();SFX.pickup();
  $c("call-k").textContent="On a call";$c("call-btns-in").hidden=true;$c("call-btns-on").hidden=false;
  callSet("connecting","Connecting…","Picking up the line");
  $c("call-end").focus({preventScroll:true});
  callLive().catch(function(){if(!CALL.ended)callFallback();});
}
/* --- live: ElevenLabs Conversational AI over WebSocket, 16 kHz PCM both ways --- */
function b64ToF32(b){var s=atob(b),n=s.length>>1,o=new Float32Array(n);for(var i=0;i<n;i++){var v=s.charCodeAt(2*i)|(s.charCodeAt(2*i+1)<<8);if(v>=32768)v-=65536;o[i]=v/32768;}return o;}
function f32ToB64(f){var s="";for(var i=0;i<f.length;i++){var v=Math.max(-1,Math.min(1,f[i]));v=v<0?v*32768:v*32767;v=v&0xffff;s+=String.fromCharCode(v&255,v>>8);}return btoa(s);}
function callLive(){
  return new Promise(function(resolve,reject){
    if(!window.WebSocket||!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){reject();return;}
    var done=false,to=setTimeout(function(){if(!done){done=true;try{ws.close();}catch(e){}reject();}},6000);
    var ws;try{ws=new WebSocket("wss://api.elevenlabs.io/v1/convai/conversation?agent_id="+OJ_AGENT);}catch(e){clearTimeout(to);reject();return;}
    ws.onerror=function(){if(!done){done=true;clearTimeout(to);reject();}};
    ws.onopen=function(){
      navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,channelCount:1}}).then(function(stream){
        if(done){stream.getTracks().forEach(function(t){t.stop();});return;}
        done=true;clearTimeout(to);
        CALL.ws=ws;CALL.stream=stream;CALL.live=true;
        var AC=window.AudioContext||window.webkitAudioContext,ctx;
        try{ctx=new AC({sampleRate:16000});}catch(e){ctx=new AC();}
        CALL.ctx=ctx;CALL.playEnd=0;
        var src=ctx.createMediaStreamSource(stream),proc=ctx.createScriptProcessor(4096,1,1),ratio=ctx.sampleRate/16000;
        proc.onaudioprocess=function(ev){
          var d=ev.inputBuffer.getChannelData(0),sum=0;for(var i=0;i<d.length;i+=8)sum+=d[i]*d[i];CALL.level=Math.sqrt(sum/(d.length/8));
          if(CALL.muted||!CALL.ws||CALL.ws.readyState!==1)return;
          var out=d;if(ratio!==1){var n=Math.floor(d.length/ratio);out=new Float32Array(n);for(var j=0;j<n;j++)out[j]=d[Math.floor(j*ratio)];}
          CALL.ws.send(JSON.stringify({user_audio_chunk:f32ToB64(out)}));
        };
        var mute=ctx.createGain();mute.gain.value=0;src.connect(proc);proc.connect(mute);mute.connect(ctx.destination);
        CALL.src=src;CALL.proc=proc;
        ws.send(JSON.stringify({type:"conversation_initiation_client_data"}));
        callSet("listening","Listening…","Speak naturally — ask about his work");
        resolve();
      },function(){if(!done){done=true;clearTimeout(to);try{ws.close();}catch(e){}reject();}});
    };
    ws.onmessage=function(ev){
      var m;try{m=JSON.parse(ev.data);}catch(e){return;}
      if(m.type==="ping"){var pe=m.ping_event||{};setTimeout(function(){if(ws.readyState===1)ws.send(JSON.stringify({type:"pong",event_id:pe.event_id}));},pe.ping_ms||0);}
      else if(m.type==="audio"&&m.audio_event&&CALL.ctx){
        var f=b64ToF32(m.audio_event.audio_base_64),ctx=CALL.ctx,buf=ctx.createBuffer(1,f.length,16000);buf.getChannelData(0).set(f);
        var s=ctx.createBufferSource();s.buffer=buf;s.connect(ctx.destination);var t=Math.max(ctx.currentTime,CALL.playEnd);s.start(t);CALL.playEnd=t+buf.duration;
        (CALL.srcs=CALL.srcs||[]).push(s);s.onended=function(){CALL.srcs.splice(CALL.srcs.indexOf(s),1);};
      }
      else if(m.type==="interruption"){(CALL.srcs||[]).forEach(function(s){try{s.stop();}catch(e){}});CALL.srcs=[];if(CALL.ctx)CALL.playEnd=CALL.ctx.currentTime;}
      else if(m.type==="agent_response"&&m.agent_response_event){$c("call-line").textContent=m.agent_response_event.agent_response.replace(/\[[^\]]+\]\s*/g,"");}
      else if(m.type==="user_transcript"&&m.user_transcription_event){$c("call-line").textContent="You: "+m.user_transcription_event.user_transcript;}
    };
    ws.onclose=function(){if(CALL.live&&!CALL.ended)callClose("Call ended");};
  });
}
/* --- fallback: OJ answers from approved facts with the browser's voice --- */
function callFallback(){
  CALL.live=false;$c("call-ask").hidden=false;
  callSet("speaking","Speaking…","Live voice isn't available in this preview, so tap a question or type one");
  ojSay(OJ_FIRST);
}
function ojSay(t){
  $c("call-line").textContent=t;callSet("speaking","Speaking…",null);
  var finish=function(){if(!CALL.ended&&CALL.state==="speaking")callSet("listening","Your turn",null);};
  try{
    speechSynthesis.cancel();var u=new SpeechSynthesisUtterance(t);var v=typeof pickVoice==="function"?pickVoice():null;
    if(v){u.voice=v;u.lang=v.lang;}else u.lang="en-GB";u.rate=1.02;
    u.onend=finish;u.onerror=finish;speechSynthesis.speak(u);
    setTimeout(function(){if(!speechSynthesis.speaking)finish();},Math.max(2500,t.length*62));
  }catch(e){setTimeout(finish,Math.max(2500,t.length*62));}
}
function callAsk(q){
  if(CALL.live||CALL.ended)return;
  $c("call-line").textContent="You: "+q;callSet("thinking","Thinking…",null);
  var a=ojAnswer(q);
  setTimeout(function(){if(CALL.ended)return;ojSay(a);
    if(/contact|email|reach|meet|next step|hire|available/i.test(q)){try{navigator.clipboard.writeText(OJ_EMAIL);}catch(e){}$c("call-sub").textContent=OJ_EMAIL+" · copied to your clipboard";}},700);
}
function callMute(){
  if(!CALL.live){$c("call-q")&&$c("call-q").focus();return;}
  CALL.muted=!CALL.muted;var b=$c("call-mic");b.innerHTML=CALL.muted?CI.micoff:CI.mic;b.setAttribute("aria-label",CALL.muted?"Unmute microphone":"Mute microphone");
  callSet(CALL.muted?"muted":"listening",CALL.muted?"Muted":"Listening…",null);
}
function callLoop(){
  if(!CALL.el||CALL.el.hidden){CALL.raf=0;return;}
  var lvl=0,st=CALL.state;
  if(CALL.live&&CALL.ctx){var playing=CALL.playEnd>CALL.ctx.currentTime+0.05;
    if(playing&&st!=="speaking"&&!CALL.muted)callSet("speaking","Speaking…",null);
    if(!playing&&st==="speaking")callSet(CALL.muted?"muted":"listening",CALL.muted?"Muted":"Listening…",null);
    lvl=playing?0.45+0.35*Math.abs(Math.sin(performance.now()/140)):Math.min(1,CALL.level*7);}
  else if(st==="speaking")lvl=0.4+0.4*Math.abs(Math.sin(performance.now()/130)*Math.sin(performance.now()/310));
  else if(st==="ringing")lvl=0.5+0.5*Math.sin(performance.now()/260);
  else lvl=0.12+0.06*Math.sin(performance.now()/500);
  CALL.el.style.setProperty("--lvl",lvl.toFixed(3));
  CALL.raf=requestAnimationFrame(callLoop);
}
document.addEventListener("keydown",function(e){if(e.key==="Escape"&&CALL.el&&!CALL.el.hidden){e.stopPropagation();callClose(CALL.state==="ringing"?"Declined":"Call ended");}},true);

/* ---------- Lagos voices: a bus conductor calling Ṣọ́mọ́lú, and a mum sending Tọ́funmi on an errand ---------- */
/* To use real recordings, set these to an audio file or a data: URI. Until then the browser's voice stands in. */
var LAGOS_CLIPS={somolu:"",mama:""};
var NGV=(function(){
  var lines={
    somolu:{text:"Ṣọ́mọ́lú! Ṣọ́mọ́lú! Ṣọ́mọ́lú!",sub:"A bus conductor calling for passengers",speak:"Shaw-maw-loo! Shaw-maw-loo! Shaw-maw-loo!",who:"male",rate:1.25,pitch:0.85,cls:"ngsay-bus"},
    mama:{text:"Tọ́funmi! Lọ bá mi ra oúnjẹ wá!",sub:"“Tofunmi! Go and buy food for me!”",speak:"Taw-foon-mee! Law bah mee rah oh-oon-jay wah!",who:"female",rate:1.0,pitch:1.15,cls:"ngsay-mama"}
  };
  var els={},timers=[];
  function bubble(key){
    var L=lines[key],el=els[key];
    if(!el){el=document.createElement("div");el.className="ngsay "+L.cls;el.setAttribute("aria-hidden","true");
      el.innerHTML='<b></b><small></small>';document.getElementById("cabView").appendChild(el);els[key]=el;}
    el.querySelector("b").textContent=L.text;el.querySelector("small").textContent=L.sub;
    el.classList.remove("show");void el.offsetWidth;el.classList.add("show");
    clearTimeout(el._t);el._t=setTimeout(function(){el.classList.remove("show");},4200);
  }
  function pick(who){
    var vs=window.speechSynthesis?speechSynthesis.getVoices():[];
    var yo=vs.filter(function(v){return/^yo/i.test(v.lang);})[0];if(yo&&who==="female")return yo;
    var en=vs.filter(function(v){return/^en/i.test(v.lang);});
    var re=who==="female"?/female|samantha|victoria|karen|moira|serena|zira|susan|hazel|libby|sonia|tessa|fiona|kate/i:/male|daniel|david|alex|george|ryan|thomas|fred|arthur|guy/i;
    return en.filter(function(v){return re.test(v.name);})[0]||en[0]||null;
  }
  function say(key){
    if(!document.body.classList.contains("ng"))return;
    bubble(key);
    if(!SFX.isOn())return;
    var L=lines[key],src=LAGOS_CLIPS[key];
    if(src){try{var a=new Audio(src);a.volume=0.55;a.play().catch(function(){});}catch(e){}return;}
    try{var u=new SpeechSynthesisUtterance(L.speak),v=pick(L.who);if(v){u.voice=v;u.lang=v.lang;}
      u.rate=L.rate;u.pitch=L.pitch;u.volume=key==="somolu"?0.45:0.6;speechSynthesis.speak(u);}catch(e){}
  }
  function loop(key,min,max){timers.push(setTimeout(function tick(){say(key);timers.push(setTimeout(tick,min+Math.random()*(max-min)));},min*0.5+Math.random()*min*0.5));}
  return{
    start:function(){this.stop();timers.push(setTimeout(function(){say("somolu");},1800));timers.push(setTimeout(function(){say("mama");},5200));
      loop("somolu",14000,24000);loop("mama",30000,45000);},
    stop:function(){timers.forEach(clearTimeout);timers=[];try{speechSynthesis.cancel();}catch(e){}Object.keys(els).forEach(function(k){els[k].classList.remove("show");});}
  };
})();

/* ---------- toy plane: a trip home to Lagos and back ---------- */
(function(){
  var pl=document.getElementById("plane"),tipEl=document.getElementById("planetip");if(!pl)return;
  var trip=document.createElement("div");trip.className="trip";trip.setAttribute("aria-hidden","true");
  trip.innerHTML='<i style="left:10%;top:20%"></i><i style="right:8%;top:30%"></i><i style="left:30%;bottom:18%"></i><b></b>';document.body.appendChild(trip);
  var busy=false,live=document.createElement("p");live.className="sr-only";live.setAttribute("aria-live","polite");document.body.appendChild(live);
  function label(){var ng=document.body.classList.contains("ng");
    tipEl.textContent=ng?"Take me back to London ✈️":"Let me take you to where I'm from ✈️";
    pl.setAttribute("aria-label",ng?"Fly back to London":"Let me take you to where I'm from: fly to Lagos, Nigeria");}
  pl.addEventListener("click",function(){
    if(busy)return;busy=true;var toNg=!document.body.classList.contains("ng");
    SFX.plane();if(window.curFlash)curFlash("🛫",1400);
    trip.querySelector("b").innerHTML=toNg?'<small>Now arriving</small>Lagos, Nigeria 🇳🇬':'<small>Now arriving</small>London, UK 🇬🇧';
    pl.classList.add("fly");trip.classList.remove("go");void trip.offsetWidth;trip.classList.add("go");
    setTimeout(function(){document.body.classList.toggle("ng",toNg);setVoiceScene(toNg);SFX.setScene(toNg?"ng":"ldn");label();
      live.textContent=toNg?"You're in a Nigerian living room in Lagos, where Jesutofunmi grew up.":"Back in the London bedroom.";},1000);
    setTimeout(function(){pl.classList.remove("fly");pl.classList.add("land");},1900);
    setTimeout(function(){pl.classList.remove("land");busy=false;},3100);
  });
  label();
})();

/* ---------- Lagos street through the window: a busy market road (canvas, animated) ---------- */
(function(){
  var cv=document.getElementById("ngcity");if(!cv||!cv.getContext)return;
  var CW=196,CH=368,DPR=Math.min(2,window.devicePixelRatio||1);cv.width=CW*DPR;cv.height=CH*DPR;
  var x=cv.getContext("2d"),seed=23;function rnd(){seed=(seed*16807)%2147483647;return(seed-1)/2147483646;}
  /* static backdrop: sky, multi-storey buildings with AC units, a billboard */
  var bg=document.createElement("canvas");bg.width=CW*DPR;bg.height=CH*DPR;var b=bg.getContext("2d");b.scale(DPR,DPR);
  var sky=b.createLinearGradient(0,0,0,150);sky.addColorStop(0,"#6fb2e6");sky.addColorStop(1,"#cfe7f5");b.fillStyle=sky;b.fillRect(0,0,CW,CH);b.translate(0,-44);
  var BCOL=["#e6c46a","#e9a77c","#f1d59a","#d98a8a","#c9b28a","#eab36b","#d7c3a5"];
  function building(x0,w,top,col){b.fillStyle=col;b.fillRect(x0,top,w,250-top);b.fillStyle="rgba(0,0,0,.08)";b.fillRect(x0+w-4,top,4,250-top);
    for(var yy=top+8;yy<236;yy+=16)for(var xx=x0+5;xx<x0+w-9;xx+=12){b.fillStyle="#3e4a5a";b.fillRect(xx,yy,7,9);b.fillStyle="rgba(255,255,255,.35)";b.fillRect(xx,yy,7,2);
      if(rnd()<.18){b.fillStyle="#e8e8e8";b.fillRect(xx,yy+10,8,4);}}
    b.fillStyle="rgba(0,0,0,.18)";b.fillRect(x0,top,w,3);}
  building(-6,58,72,BCOL[0]);building(50,46,96,BCOL[1]);building(94,60,60,BCOL[2]);building(152,52,84,BCOL[3]);
  b.fillStyle="#7a5232";b.fillRect(118,40,2,22);b.fillRect(150,40,2,22);
  b.fillStyle="#fff";b.fillRect(104,18,62,26);b.fillStyle="#2b8a3e";b.fillRect(104,18,62,9);
  b.fillStyle="#fff";b.font='700 6px "Inter Tight",Arial,sans-serif';b.textAlign="center";b.fillText("Ẹ KÁÀBỌ̀",135,25.5);
  b.fillStyle="#9b2d3a";b.font='800 9px "Inter Tight",Arial,sans-serif';b.fillText("LAGOS",135,39);
  /* corrugated roofs and stall canopies */
  b.fillStyle="#8a8f96";for(var i=0;i<6;i++){b.beginPath();b.moveTo(i*36-6,226);b.lineTo(i*36+30,214);b.lineTo(i*36+34,236);b.lineTo(i*36-4,240);b.fill();}
  b.fillStyle="#6e6a4a";b.beginPath();b.moveTo(60,222);b.lineTo(140,222);b.lineTo(150,240);b.lineTo(50,240);b.fill();
  /* road */
  var rd=b.createLinearGradient(0,280,0,CH);rd.addColorStop(0,"#8d8a86");rd.addColorStop(1,"#6e6b67");b.fillStyle=rd;b.fillRect(0,282,CW,CH-282+44);
  b.fillStyle="#b9b2a5";b.fillRect(0,272,CW,10);
  b.strokeStyle="rgba(255,255,255,.55)";b.setLineDash([10,9]);b.lineWidth=1.5;b.beginPath();b.moveTo(0,326);b.lineTo(CW,326);b.stroke();b.setLineDash([]);
  /* umbrellas over the traders, people on the pavement, traffic, clouds */
  var UCOL=["#e8559a","#3f6ff0","#f3c623","#8c52d6","#ff7a3d","#2bb3a3","#e33b3b"];
  var umb=[];for(var i=0;i<9;i++)umb.push({x:-10+i*25+rnd()*10,y:246+rnd()*10,r:13+rnd()*5,c:UCOL[i%UCOL.length],p:rnd()*6});
  var ppl=[];function person(init){return{x:init?rnd()*CW:(rnd()<.5?-8:CW+8),y:258+rnd()*16,v:(rnd()<.5?-1:1)*(6+rnd()*10),c:["#9b2d3a","#2b8a3e","#3f6ff0","#e3a63a","#7a3fa0","#e8559a","#fff"][Math.floor(rnd()*7)],tray:rnd()<.25,p:rnd()*6};}
  for(var i=0;i<18;i++)ppl.push(person(true));ppl.forEach(function(p){if(p.x<0||p.x>CW)p.v=Math.abs(p.v)*(p.x<0?1:-1);});
  var cars=[];function car(lane,init){var kind=rnd(),w=kind<.75?46:kind<.9?84:26;
    return{lane:lane,x:init?rnd()*(CW+160)-80:(lane?CW+w+rnd()*60:-w-rnd()*60),w:w,kind:kind<.75?"danfo":kind<.9?"brt":"okada",v:(lane?-1:1)*(18+rnd()*16),stop:0};}
  for(var i=0;i<3;i++){cars.push(car(0,true));cars.push(car(1,true));}
  var clouds=[{x:20,y:20,s:1},{x:120,y:44,s:.7},{x:-60,y:8,s:.8}];
  function danfo(cx,y,w,dir){
    x.save();x.translate(cx,y);if(dir<0){x.scale(-1,1);}
    x.fillStyle="#f6c21a";x.beginPath();x.moveTo(-w/2,0);x.lineTo(-w/2,-20);x.quadraticCurveTo(-w/2,-24,-w/2+4,-24);x.lineTo(w/2-10,-24);x.lineTo(w/2,-12);x.lineTo(w/2,0);x.closePath();x.fill();
    x.fillStyle="#1d1d1d";x.fillRect(-w/2,-9,w,2.6);x.fillRect(-w/2,-4,w,1.4);
    x.fillStyle="#9fc7da";for(var k=0;k<3;k++)x.fillRect(-w/2+3+k*10,-21,8,8);x.beginPath();x.moveTo(w/2-9,-21);x.lineTo(w/2-2,-13);x.lineTo(w/2-9,-13);x.fill();
    x.fillStyle="#222";x.beginPath();x.arc(-w/2+9,0,4.4,0,6.28);x.arc(w/2-9,0,4.4,0,6.28);x.fill();
    x.fillStyle="#999";x.beginPath();x.arc(-w/2+9,0,1.6,0,6.28);x.arc(w/2-9,0,1.6,0,6.28);x.fill();
    x.restore();}
  function brt(cx,y,w,dir){
    x.save();x.translate(cx,y);if(dir<0)x.scale(-1,1);
    x.fillStyle="#f4f4f4";x.fillRect(-w/2,-30,w,30);x.fillStyle="#2b3f8f";x.fillRect(-w/2,-8,w,5);x.fillStyle="#d9342b";x.fillRect(-w/2,-3,w,2);
    x.fillStyle="#7fa7c4";for(var k=0;k<6;k++)x.fillRect(-w/2+4+k*13,-26,10,11);
    x.fillStyle="#222";x.beginPath();x.arc(-w/2+14,0,5,0,6.28);x.arc(w/2-14,0,5,0,6.28);x.fill();x.restore();}
  function okada(cx,y,dir){
    x.save();x.translate(cx,y);if(dir<0)x.scale(-1,1);
    x.strokeStyle="#222";x.lineWidth=2;x.beginPath();x.arc(-8,0,4.5,0,6.28);x.moveTo(12.5,0);x.arc(8,0,4.5,0,6.28);x.stroke();
    x.fillStyle="#c23b2b";x.fillRect(-7,-8,14,4);x.fillStyle="#3b2a1e";x.fillRect(-4,-20,5,12);x.fillStyle="#f3c623";x.beginPath();x.arc(-1.5,-23,3.6,0,6.28);x.fill();
    x.fillStyle="#2b8a3e";x.fillRect(-10,-17,5,9);x.fillStyle="#222";x.beginPath();x.arc(-7.5,-20,3,0,6.28);x.fill();x.restore();}
  var raf=0,last=0,acc=0,t0=performance.now(),visible=false;
  function frame(now){
    var dt=Math.min(.1,(now-last)/1000);last=now;acc+=dt;if(acc<1/30){raf=requestAnimationFrame(frame);return;}var st=acc;acc=0;var t=(now-t0)/1000;
    x.setTransform(DPR,0,0,DPR,0,0);x.drawImage(bg,0,0,CW,CH);x.translate(0,-44);
    clouds.forEach(function(c){c.x+=4*st*c.s;if(c.x>CW+40)c.x=-60;x.fillStyle="rgba(255,255,255,.85)";x.beginPath();x.ellipse(c.x,c.y,22*c.s,7*c.s,0,0,6.28);x.ellipse(c.x+14*c.s,c.y-4*c.s,13*c.s,7*c.s,0,0,6.28);x.fill();});
    /* pedestrians and traders */
    ppl.forEach(function(p){p.x+=p.v*st;if(p.x<-10||p.x>CW+10){Object.assign(p,person(false));}
      var bob=Math.abs(Math.sin(t*6+p.p))*1.4;x.fillStyle=p.c;x.fillRect(p.x-2.6,p.y-11-bob,5.2,9);x.fillStyle="#3b2416";x.beginPath();x.arc(p.x,p.y-14-bob,2.6,0,6.28);x.fill();
      x.fillStyle="#2a1a10";x.fillRect(p.x-2,p.y-2-bob,1.6,4);x.fillRect(p.x+.6,p.y-2-bob,1.6,4);
      if(p.tray){x.fillStyle="#c9a24a";x.beginPath();x.ellipse(p.x,p.y-17-bob,6,1.8,0,0,6.28);x.fill();x.fillStyle="#e74c3c";x.beginPath();x.arc(p.x-2,p.y-19-bob,1.4,0,6.28);x.arc(p.x+2,p.y-19-bob,1.4,0,6.28);x.fill();}});
    umb.forEach(function(u){var sw=Math.sin(t*1.2+u.p)*.04;x.save();x.translate(u.x,u.y);x.rotate(sw);
      x.fillStyle=u.c;x.beginPath();x.moveTo(-u.r,0);x.quadraticCurveTo(0,-u.r*.9,u.r,0);x.closePath();x.fill();
      x.fillStyle="rgba(255,255,255,.25)";x.beginPath();x.moveTo(-u.r*.3,-.5);x.quadraticCurveTo(0,-u.r*.8,u.r*.3,-.5);x.fill();
      x.strokeStyle="#444";x.lineWidth=1;x.beginPath();x.moveTo(0,0);x.lineTo(0,14);x.stroke();x.restore();});
    /* traffic: two lanes, stop-start like a Lagos go-slow */
    var jam=Math.sin(t*.35)>.35;
    cars.sort(function(a,c){return a.lane-c.lane;});
    cars.forEach(function(c,i){
      var sp=c.v*(jam&&c.kind!=="okada"?.15:1);c.x+=sp*st;
      if((c.v>0&&c.x>CW+c.w)||(c.v<0&&c.x<-c.w))cars[i]=car(c.lane,false);
      var y=c.lane?312:350;
      if(c.kind==="danfo")danfo(c.x,y,c.w,c.v);else if(c.kind==="brt")brt(c.x,y,c.w,c.v);else okada(c.x,y,c.v);});
    /* warm haze so it reads as bright afternoon through a window */
    x.fillStyle="rgba(255,236,200,.08)";x.fillRect(0,0,CW,CH+44);
    raf=visible?requestAnimationFrame(frame):0;
  }
  function check(){var cab=document.getElementById("cabView");visible=document.body.classList.contains("ng")&&!document.hidden&&cab&&!cab.hidden&&getComputedStyle(cv).display!=="none";
    if(visible&&!raf){last=performance.now();raf=requestAnimationFrame(frame);}}
  if(reduce){visible=false;last=performance.now()-100;acc=1;frame(performance.now());}
  else{document.addEventListener("visibilitychange",check);window.addEventListener("hashchange",function(){setTimeout(check,0);});window.addEventListener("resize",check);
    new MutationObserver(check).observe(document.body,{attributes:true,attributeFilter:["class"]});check();}
})();

/* ---------- the TV in Lagos: Pawpaw, with sound on hover ---------- */
(function(){
  var tv=document.getElementById("ngtv");if(!tv)return;
  var clip=new Audio("audio/pawpaw-clip.mp3");clip.preload="auto";clip.volume=0.8;
  function play(){if(!document.body.classList.contains("ng"))return;tv.classList.add("on");if(!SFX.isOn())return;try{clip.currentTime=0;clip.play().catch(function(){});}catch(e){}}
  function stop(){tv.classList.remove("on");try{clip.pause();}catch(e){}}
  tv.addEventListener("pointerenter",function(e){if(e.pointerType==="mouse"||e.pointerType==="pen")play();});
  tv.addEventListener("pointerleave",stop);
  tv.addEventListener("click",function(){if(tv.classList.contains("on")&&!clip.paused)stop();else play();});
  tv.addEventListener("blur",stop);
  clip.addEventListener("ended",function(){tv.classList.remove("on");});
  new MutationObserver(function(){if(!document.body.classList.contains("ng"))stop();}).observe(document.body,{attributes:true,attributeFilter:["class"]});
  document.getElementById("sndbtn").addEventListener("click",function(){if(!SFX.isOn())try{clip.pause();}catch(e){}});
})();

/* ---------- footer email ---------- */
document.getElementById("mailcopy").addEventListener("click",function(){
  var el=document.getElementById("footmail"),msg=document.getElementById("mailmsg");
  var done=function(){msg.textContent="Copied";setTimeout(function(){msg.textContent="";},1600);};
  var sel=function(){var r=document.createRange();r.selectNodeContents(el);var w=window.getSelection();w.removeAllRanges();w.addRange(r);msg.textContent="Selected";};
  try{navigator.clipboard.writeText(el.textContent).then(done,sel);}catch(err){sel();}
});

renderArt();setNote(null);route();
})();

/* ---------- mobile gate: copy the link to open later on a computer ---------- */
(function(){var b=document.getElementById("mgatecopy"),m=document.getElementById("mgatemsg");if(!b)return;
b.addEventListener("click",function(){var u=location.href.split("#")[0];
  var ok=function(){m.textContent="Link copied. Open it on your computer.";},no=function(){m.textContent=u;};
  try{if(navigator.share){navigator.share({title:document.title,url:u}).catch(function(){});return;}navigator.clipboard.writeText(u).then(ok,no);}catch(e){no();}});})();
