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
 {i:0,line:"FirstBank | Fintech | 2021",title:"Designing an all-round payment infrastructure for merchants across West Africa",blurb:"FirstBank\u2019s payment gateway for online merchants: onboarding, storefronts, payouts and a dashboard merchants actually check.",stats:[["\u20a63B+","Transaction value"],["650+","Merchants"]]},
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
var CV_FILE="cv/Jesutofunmi_Oluwatosin_CV.pdf";
var CV_TEXT="JESUTOFUNMI OLUWATOSIN\nProduct & UX Designer\nUnited Kingdom | +44 7831 559455 | oluwatosinjesutofunmi@gmail.com\nPortfolio: erastus.design | LinkedIn: Jesutofunmi Oluwatosin\nPROFILE\nProduct & UX Designer with 3+ years' experience across fintech and residential platforms, turning ambiguous\nproblems into development-ready journeys and prototypes. Owned end-to-end design for a regulated payments\nproduct at FirstBank, using live data to lift onboarding conversion by 10%. Works closely with Product, Engineering,\nResearch, Brand and Compliance, and presents design rationale clearly to non-design stakeholders. Designs for AI\nand prototypes quickly with Claude, Codex and Figma Make, including a conversational AI finance agent concept.\nDesigns to WCAG 2.1/2.2 standards and holds an MSc in Project Management with Data Analytics (2026).\nCORE SKILLS\nUX/UI Design: User-Centred Design, Interaction Design, Wireframing, User Flows, High-Fidelity Prototyping,\nInformation Architecture, Component-Based Design (Figma: Components, Variants, Tokens, Auto-Layout)\nDiscovery & Concepting: Journey Mapping, HMW Framework, Experience Maps, Concept Development,\nMoSCoW Prioritisation\nFacilitation & Collaboration: Ideation Workshops, User Feedback Sessions, Stakeholder Management,\nCross-Functional Partnership with Product, Engineering, Compliance, Brand and Research, Agile / Sprint Delivery\nResearch & Evidence: User Research, Usability Testing, Journey Mapping, Data- and Analytics-Informed Design\n(Hotjar), Task Success Rate, Completion Time and NPS Analysis\nAccessibility & Inclusion: Accessibility & Inclusive Design, WCAG 2.1 / 2.2\nDesign Systems & Hand-off: Reusable Pattern Libraries, Design Standards and Documentation, Design\nEnablement\nAI-Enabled Design: Claude for concept-to-prototype workflows and AI-assisted ideation; working familiarity with\nFigma Make and Codex\nTools: Figma, Miro, Notion, Hotjar, Claude, ChatGPT, ElevenLabs\nEXPERIENCE\nKeys - Product Designer Feb 2025 – Feb 2026\nResidential community platform, UK\n• Mapped user journeys and interaction models using the HMW framework to surface usability gaps and\nnon-negotiable requirements, shaping design direction ahead of build.\n• Facilitated co-creation and ideation workshops with residents and stakeholders to generate and validate\nconcepts, and synthesised feedback into design recommendations.\n• Translated business, user and technical requirements into scalable, implementation-ready solutions within an\nagile delivery environment.\n• Reviewed live product experiences against accessibility and inclusive design principles, identifying optimisation\nopportunities throughout the design lifecycle.\n• Partnered closely with engineering to translate design intent into clear specifications and rationale, reducing\ndevelopment friction and time to task completion.\n• Mapped end-to-end service journeys across app, community and support touchpoints, identifying where\noperational processes broke the resident experience.\nFirst Bank - Product Designer Oct 2021 – Feb 2024\nMerchant-facing payment experiences within a regulated banking environment\n• Owned end-to-end design for the flagship payments products, Firstchekout, from concept and interaction\ndesign through to developer hand-off; Firstchekout processed over ₦3billion (approx. £1,700,000) in\ntransaction value within the first year of launch with over 650+ merchants onboarded, with an early-stage\ncompletion rate that shaped a continuous post-launch improvement roadmap.\n• Balanced usability with regulatory, compliance and brand requirements when shaping merchant onboarding\nand identity-verification flows.\n• Assessed compliance and fraud risk in identity verification flows alongside the business team and product\nmanager, ensuring ethical use of the platform and a 5% reduction in fraud risk.\n• Reviewed live experiences against task success rate, average completion time and Net Promoter Score,\ntranslating findings into a 10% improvement in onboarding conversion.\n• Partnered with Product, Engineering and Compliance stakeholders on EPICs and requirements so design\nintent was clearly communicated and accurately implemented.\n• Built and documented a reusable component library and design rationale, strengthening consistency,\ndevelopment speed and knowledge-sharing across product and engineering teams.\n• Designed merchant onboarding and identity verification across the digital journey and the backstage\ncompliance checks behind it, balancing usability with regulatory requirements.\nSELECTED CONCEPT, INNOVATION WORK & OTHER IMPACTFUL ENGAGEMENTS\nApTap Switching Funnel - Design case study Sep 2026\n• Diagnosed and redesigned a multi-stage broadband and utilities switching funnel for UK banking-app partners:\nproduced a PRD with personas and epics, two strategically distinct concepts (choice reduction vs. confidence\nsignals) and a three-arm A/B test plan with falsification criteria, working within FCA / Consumer Duty and\naccessibility constraints.\nTechnology, Education and Design (TEDxWibsey) Sep 2026\n• I drafted a comprehensive event management plan, ensuring the programme started and ended on schedule,\nand oversaw the attendee experience from registration through catering to the event's close. Also, I developed\nthe MC plan and communication protocols between speakers and the audience. In addition, I received an\naward recognising my outstanding contribution to Bradford's technology, education and design community.\nBACI (Financial Intelligence Agent), conversational AI case study Jul 2026\n• Designed and built a bank-agnostic AI agent that analyses Open Banking transaction data, scores financial\nhealth and explains it through a conversational chat interface.\n• Designed conversation flows, (fallback and error states when the AI can't answer), and ways to show how\nconfident the AI is in its insights, so users know when to trust it.\n• Prototyped in React using AI-assisted development Claude code, taking it from concept to working product\nwithout a dedicated engineer.\nSections - Community Manager Feb 2026 – Present\nCommunity for Designers in UK with over 300 members\n• I organised educational sessions with senior designers, including Harrison Wheeler (former Design Lead,\nLinkedIn) and Suraj Soren (Design Lead, BT Group), covering how designers can adopt AI as a core part of\ntheir process. Also, I organised end-of-year retreats in Albania, Wales and Montenegro to help members\nrecharge after the year's work. Alongside this, I ran one-to-one sessions with members on practical\nproduct-improvement cases, helping them build sharper problem-solving approaches.\nEDUCATION\nBedfordshire University, United Kingdom, 2024 – 2026\nMSc Project Management with Data Analytics (Completed)\nUniversity of Lagos, 2019\nBSc Finance\nCERTIFICATIONS\n• Certified Product Designer, Utiva Design School - 2020\n• Certified Product Designer, Tech4Dev - 2021\n• IBM Enterprise Design Thinking - 2021\n• Product Management Programme, Bright Network Technology on Demand - 2024";
var cvm=null,cvLast=null;
function escH(t){return t.replace(/[&<>]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;"}[c];});}
function openCV(){
  var btn=document.getElementById("cvbtn");cvLast=btn;btn.classList.add("pull");setTimeout(function(){btn.classList.remove("pull");},500);
  if(!cvm){
    cvm=document.createElement("div");cvm.className="cvm";cvm.hidden=true;
    cvm.setAttribute("role","dialog");cvm.setAttribute("aria-modal","true");cvm.setAttribute("aria-labelledby","cvm-t");
    cvm.innerHTML='<div class="cvm-box"><div class="cvm-head"><h2 id="cvm-t">Jesutofunmi Oluwatosin · CV</h2>'+
      '<a class="btn ghost" id="cvdl" href="'+CV_FILE+'" download="Jesutofunmi_Oluwatosin_CV.pdf">Download PDF</a>'+
      '<button type="button" class="cvm-x" id="cvx" aria-label="Close CV">'+ICO.x+'</button></div>'+
      '<div class="cvm-body" tabindex="0">'+CV_PAGES.map(function(src,i){return'<img src="'+src+'" alt="CV page '+(i+1)+' of '+CV_PAGES.length+'" width="1242" height="1755" decoding="async">';}).join("")+
      '<div class="sr-only">'+escH(CV_TEXT)+'</div></div></div>';
    document.body.appendChild(cvm);
    cvm.addEventListener("click",function(e){
      if(e.target===cvm||e.target.closest("#cvx"))closeCV();
    });
  }
  setTimeout(function(){cvm.hidden=false;document.body.style.overflow="hidden";
    requestAnimationFrame(function(){cvm.classList.add("show");});document.getElementById("cvx").focus();},reduce?0:200);
}
function closeCV(){
  if(!cvm||cvm.hidden)return;cvm.classList.remove("show");document.body.style.overflow="";
  setTimeout(function(){cvm.hidden=true;},reduce?0:260);if(cvLast)cvLast.focus();
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
