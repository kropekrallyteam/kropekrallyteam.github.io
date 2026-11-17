// Karetka i wóz strażacki w stylu ilustracji – wg arkuszy rzutów od użytkownika (wersja 2: zaokrąglone bryły, malowanie w wysokiej rozdzielczości).
// Każda bryła = profil boczny (z,y) wyciągnięty na szerokość z zaokrąglonymi krawędziami; boki, dach, przód i tył to naklejki z płótna
// przycięte do kształtu profilu. Przód pojazdu w stronę -z, x = szerokość, y = wysokość (m). Kontur: bufor szablonu (jak Kropek).
const POJ_ST={stencilWrite:true,stencilRef:1,stencilFunc:THREE.AlwaysStencilFunc,stencilZPass:THREE.ReplaceStencilOp};
const POJ_OBRYS=new THREE.MeshBasicMaterial({color:0x1c1814,side:THREE.DoubleSide,stencilWrite:true,stencilRef:1,stencilFunc:THREE.NotEqualStencilFunc,stencilZPass:THREE.KeepStencilOp});
const pojLak=(c,o={})=>new THREE.MeshPhongMaterial(Object.assign({color:c,shininess:40,specular:0x3a3a3a},POJ_ST,o));
function pojPlotno(w,h,rys){const cv=document.createElement('canvas');cv.width=w;cv.height=h;const c=cv.getContext('2d');rys(c,w,h);const t=new THREE.CanvasTexture(cv);t.anisotropy=16;return t;}
function pojObrys(g,mesh,d=.05){const geo=mesh.geometry;geo.computeBoundingBox();const sz=geo.boundingBox.getSize(new THREE.Vector3()),c=geo.boundingBox.getCenter(new THREE.Vector3());
  const g2=geo.clone().translate(-c.x,-c.y,-c.z);const o=new THREE.Mesh(g2,POJ_OBRYS);o.position.copy(mesh.position).add(c);o.rotation.copy(mesh.rotation);o.scale.set(1+d/sz.x,1+d/sz.y,1+d/sz.z);o.renderOrder=2;g.add(o);}
function pojBryla(g,pts,W,r,mat){const s=new THREE.Shape();s.moveTo(-pts[0][0],pts[0][1]);for(const p of pts.slice(1))s.lineTo(-p[0],p[1]);s.closePath();
  const geo=new THREE.ExtrudeGeometry(s,{depth:W-2*r,bevelEnabled:true,bevelThickness:r,bevelSize:r*.8,bevelSegments:4,curveSegments:6});geo.rotateY(Math.PI/2);geo.translate(-(W-2*r)/2,0,0);
  const m=new THREE.Mesh(geo,mat);m.castShadow=m.receiveShadow=true;g.add(m);pojObrys(g,m);return m;}
// naklejka boczna: płótno na prostokącie z∈[z0,z1], y∈[y0,y1]; rys(c,zx,yy): metry → piksele (przód zawsze po właściwej stronie, napisy nie lustrzane)
function pojBok(g,strona,x,z0,z1,y0,y1,pts,rys,px=1600){const L=z1-z0,Hh=y1-y0,ph=Math.round(px*Hh/L);
  const t=pojPlotno(px,ph,(c,w,h)=>{const zx=z=>strona>0?(z1-z)/L*w:(z-z0)/L*w,yy=y=>h-(y-y0)/Hh*h;
    if(pts){c.beginPath();pts.forEach(([z,y],i)=>i?c.lineTo(zx(z),yy(y)):c.moveTo(zx(z),yy(y)));c.closePath();c.clip();}rys(c,zx,yy,w,h);});
  const m=new THREE.Mesh(new THREE.PlaneGeometry(L,Hh),new THREE.MeshPhongMaterial({map:t,transparent:true,depthWrite:false,shininess:35,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}));
  m.rotation.y=strona*Math.PI/2;m.position.set(strona*x,(y0+y1)/2,(z0+z1)/2);g.add(m);return m;}
function pojPlaska(g,w,h,tex,pos,rot,o={}){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshPhongMaterial(Object.assign({map:tex,transparent:true,depthWrite:false,shininess:35,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3},o)));
  m.position.set(...pos);m.rotation.order='YXZ';m.rotation.set(...rot);g.add(m);return m;}
const POJ_FELGA=pojPlotno(256,256,(c,w,h)=>{const R=w/2;c.fillStyle='#c9cdd3';c.beginPath();c.arc(R,R,R*.98,0,7);c.fill();c.fillStyle='#3a3d42';c.beginPath();c.arc(R,R,R*.8,0,7);c.fill();
  c.fillStyle='#d9dde2';for(let k=0;k<6;k++){c.save();c.translate(R,R);c.rotate(k*Math.PI/3);c.beginPath();c.moveTo(-R*.11,-R*.2);c.lineTo(R*.11,-R*.2);c.lineTo(R*.17,-R*.79);c.lineTo(-R*.17,-R*.79);c.fill();c.restore();}
  c.fillStyle='#e4e7eb';c.beginPath();c.arc(R,R,R*.27,0,7);c.fill();c.fillStyle='#55595f';for(let k=0;k<6;k++){const a=k*Math.PI/3+.5;c.beginPath();c.arc(R+Math.cos(a)*R*.17,R+Math.sin(a)*R*.17,R*.035,0,7);c.fill();}});
function pojKolo(g,x,z,R,sz){const w=new THREE.Mesh(new THREE.CylinderGeometry(R,R,sz,32),pojLak(0x18191b,{shininess:10}));w.rotation.z=Math.PI/2;w.position.set(x,R,z);w.castShadow=true;g.add(w);pojObrys(g,w,.04);
  for(const k of [-1,1]){const f=new THREE.Mesh(new THREE.CircleGeometry(R*.66,32),new THREE.MeshPhongMaterial({map:POJ_FELGA,shininess:60}));f.rotation.y=k*Math.PI/2;f.position.set(x+k*(sz/2+.004),R,z);g.add(f);}}
function pojGwiazda(c,cx,cy,R,kol){c.save();c.translate(cx,cy);c.fillStyle=kol;for(let k=0;k<3;k++){c.save();c.rotate(k*Math.PI/3);c.fillRect(-R*.21,-R,R*.42,R*2);c.restore();}
  c.strokeStyle='#fff';c.lineWidth=Math.max(2,R*.075);c.lineCap='round';c.beginPath();c.moveTo(0,-R*.8);c.lineTo(0,R*.84);c.stroke();c.lineWidth=Math.max(2,R*.06);c.beginPath();for(let t=0;t<=1.0001;t+=.04){const y=-R*.62+t*R*1.34,x=Math.sin(t*Math.PI*3)*R*.15;t?c.lineTo(x,y):c.moveTo(x,y);}c.stroke();c.restore();}
function pojP(c,cx,cy,R){c.save();c.strokeStyle='#d8141c';c.lineWidth=R*.17;c.beginPath();c.arc(cx,cy,R,0,7);c.stroke();c.fillStyle='#d8141c';c.font=`bold ${R*1.35}px Arial`;c.textAlign='center';c.textBaseline='middle';c.fillText('P',cx,cy+R*.07);c.restore();}
function pojRR(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.lineTo(x+w-r,y);c.quadraticCurveTo(x+w,y,x+w,y+r);c.lineTo(x+w,y+h-r);c.quadraticCurveTo(x+w,y+h,x+w-r,y+h);c.lineTo(x+r,y+h);c.quadraticCurveTo(x,y+h,x,y+h-r);c.lineTo(x,y+r);c.quadraticCurveTo(x,y,x+r,y);c.closePath();}
function pojTel(c,cx,cy,R,kol){c.save();c.translate(cx,cy);c.rotate(-.5);c.strokeStyle=kol;c.lineWidth=R*.34;c.lineCap='round';c.beginPath();c.arc(0,0,R*.85,Math.PI*.62,Math.PI*1.38);c.stroke();
  c.fillStyle=kol;c.beginPath();c.ellipse(-R*.52,-R*.72,R*.26,R*.18,-.6,0,7);c.fill();c.beginPath();c.ellipse(-R*.52,R*.72,R*.26,R*.18,.6,0,7);c.fill();c.restore();}   /* ikona słuchawki */
const NIEB=()=>pojLak(0x1648d8,{emissive:0x061c70,shininess:70,specular:0x8899ff});
const POJ_BELKA=pojPlotno(512,64,(c,w,h)=>{c.fillStyle='#1b1d22';c.fillRect(0,0,w,h);const seg=[['#1d5cff',.0,.3],['#e8ecf2',.31,.69],['#1d5cff',.7,1]];
  for(const [k,a,b] of seg){const g2=c.createLinearGradient(0,4,0,h-4);g2.addColorStop(0,'#ffffff');g2.addColorStop(.25,k);g2.addColorStop(1,k);c.fillStyle=g2;pojRR(c,a*w+6,6,(b-a)*w-12,h-12,10);c.fill();}
  c.strokeStyle='rgba(0,0,0,.35)';c.lineWidth=3;for(let x=.1;x<1;x+=.1){c.beginPath();c.moveTo(x*w,8);c.lineTo(x*w,h-8);c.stroke();}});   /* belka świetlna: niebieskie klosze po bokach, biała środek, segmenty */
function pojBelka(g,szer,gl,x,y,z){const m=new THREE.Mesh(new THREE.BoxGeometry(szer,.13,gl),[pojLak(0x1b1d22),pojLak(0x1b1d22),new THREE.MeshPhongMaterial(Object.assign({map:POJ_BELKA,emissiveMap:POJ_BELKA,emissive:0x555555,shininess:80},POJ_ST)),pojLak(0x1b1d22),new THREE.MeshPhongMaterial(Object.assign({map:POJ_BELKA,emissiveMap:POJ_BELKA,emissive:0x777777},POJ_ST)),new THREE.MeshPhongMaterial(Object.assign({map:POJ_BELKA,emissiveMap:POJ_BELKA,emissive:0x777777},POJ_ST))]);   /* przód i tył belki: niebieskie końce, biały środek (jak na wzorcu) */
  m.position.set(x,y,z);m.castShadow=true;g.add(m);pojObrys(g,m,.03);return m;}

// ================= KARETKA =================
function karetka(){const g=new THREE.Group();const W=2.05,X=W/2;
  const PR=[[2.95,.42],[2.95,2.66],[-1.12,2.66],[-1.3,2.56],[-2.12,1.32],[-2.78,1.08],[-2.98,.92],[-2.98,.42]];
  pojBryla(g,PR,W,.09,pojLak(0xf8f8f5));
  pojBryla(g,[[3.08,.34],[3.08,.64],[-3.08,.64],[-3.08,.34]],W+.04,.04,pojLak(0x24262a));
  const CZ='#d8141c',NB='#1d3fa0',CR='#212327';
  for(const st of [1,-1])pojBok(g,st,X+.005,-2.98,2.95,.42,2.66,PR,(c,zx,yy,w,h)=>{
    const pas=(y0,y1,k)=>{c.fillStyle=k;c.fillRect(0,yy(y1),w,yy(y0)-yy(y1));};
    pas(2.3,2.52,CZ);pas(1.12,1.32,NB);pas(.84,1.06,CZ);pas(.42,.7,CR);
    c.fillStyle=NB;c.beginPath();c.moveTo(zx(-2.98),yy(1.0));c.lineTo(zx(-2.1),yy(1.42));c.lineTo(zx(-1.9),yy(1.42));c.lineTo(zx(-2.98),yy(.9));c.fill();c.fillStyle=CZ;c.beginPath();c.moveTo(zx(-2.98),yy(1.12));c.lineTo(zx(-2.25),yy(1.47));c.lineTo(zx(-2.15),yy(1.47));c.lineTo(zx(-2.98),yy(1.05));c.fill();
    c.fillStyle='#1b2330';c.beginPath();c.moveTo(zx(-1.95),yy(1.42));c.lineTo(zx(-1.32),yy(2.38));c.lineTo(zx(-.98),yy(2.38));c.lineTo(zx(-.98),yy(1.42));c.closePath();c.fill();
    c.strokeStyle='rgba(0,0,0,.35)';c.lineWidth=3;for(const z of [-.92,.05,1.72]){c.beginPath();c.moveTo(zx(z),yy(2.55));c.lineTo(zx(z),yy(.5));c.stroke();}
    c.beginPath();c.moveTo(zx(-2.15),yy(1.36));c.lineTo(zx(-.92),yy(1.36));c.stroke();
    c.fillStyle='#2a2c30';for(const z of [-1.1,-.2]){const x=zx(z);pojRR(c,x-14,yy(1.5)-6,28,12,5);c.fill();}
    c.fillStyle='#16171a';for(const z of [-2.2,1.95]){c.beginPath();c.arc(zx(z),yy(.4),Math.abs(zx(z+.5)-zx(z)),Math.PI,0);c.fill();}
    pojP(c,zx(.62),yy(1.84),h*.12);pojGwiazda(c,zx(2.15),yy(1.84),h*.16,NB);
    c.fillStyle='#e7a018';c.fillRect(zx(2.6)-6,yy(.95),12,8);
  },2048);
  const tD=pojPlotno(512,1024,(c,w,h)=>{c.fillStyle='#f8f8f5';c.fillRect(0,0,w,h);c.strokeStyle='rgba(0,0,0,.13)';c.lineWidth=5;for(const x of [110,190,322,402]){c.beginPath();c.moveTo(x,30);c.lineTo(x,h-30);c.stroke();}
    c.fillStyle=CZ;c.fillRect(0,0,26,h);c.fillRect(w-26,0,26,h);pojGwiazda(c,w/2,h*.47,170,NB);c.fillStyle='#dfe3e8';pojRR(c,w*.38,h*.83,w*.24,h*.07,10);c.fill();});
  pojPlaska(g,W-.12,2.95+1.12-.1,tD,[0,2.66+.085,(2.95-1.12)/2],[-Math.PI/2,0,0]);
  {const L=Math.hypot(2.12-1.3,2.56-1.32),a=Math.atan2(2.56-1.32,2.12-1.3);
   const tS=pojPlotno(512,512,(c,w,h)=>{c.fillStyle='#1a222e';pojRR(c,8,8,w-16,h-16,40);c.fill();c.fillStyle='rgba(255,255,255,.08)';c.beginPath();c.moveTo(w*.15,h*.1);c.lineTo(w*.45,h*.1);c.lineTo(w*.25,h*.9);c.lineTo(w*.05,h*.9);c.fill();});
   pojPlaska(g,W-.3,L*.86,tS,[0,(2.56+1.32)/2+.05,-(1.3+2.12)/2-.075],[-(Math.PI/2+a),0,0]);}
  {const L=Math.hypot(2.78-2.12,1.32-1.08),a=Math.atan2(1.32-1.08,2.78-2.12);
   const tM=pojPlotno(1024,512,(c,w,h)=>{c.clearRect(0,0,w,h);c.save();c.translate(w/2,h*.58);c.scale(-1,1);c.fillStyle=CZ;c.font='bold 150px Arial Black,Arial';c.textAlign='center';c.textBaseline='middle';c.fillText('AMBULANS',0,0);c.restore();
     c.fillStyle=NB;c.beginPath();c.moveTo(0,0);c.lineTo(150,0);c.lineTo(0,260);c.fill();c.beginPath();c.moveTo(w,0);c.lineTo(w-150,0);c.lineTo(w,260);c.fill();
     c.fillStyle=CZ;c.beginPath();c.moveTo(0,270);c.lineTo(0,350);c.lineTo(210,0);c.lineTo(160,0);c.fill();c.beginPath();c.moveTo(w,270);c.lineTo(w,350);c.lineTo(w-210,0);c.lineTo(w-160,0);c.fill();});
   pojPlaska(g,W-.14,L,tM,[0,(1.32+1.08)/2+.085,-(2.12+2.78)/2-.035],[-Math.PI/2-a,Math.PI,0]);}
  {const tP=pojPlotno(1024,512,(c,w,h)=>{const yy=y=>h-(y-.45)/(.95-.45)*h;c.fillStyle='#f8f8f5';c.fillRect(0,0,w,h);   /* przód jak w Ducato: reflektory, AMBULANS, czarny zderzak z atrapą */
     c.fillStyle=NB;c.beginPath();c.moveTo(0,0);c.lineTo(120,0);c.lineTo(0,yy(.72));c.fill();c.beginPath();c.moveTo(w,0);c.lineTo(w-120,0);c.lineTo(w,yy(.72));c.fill();
     for(const x of [.07,.73]){c.fillStyle='#dfe6ee';pojRR(c,x*w,yy(.94),w*.2,yy(.8)-yy(.94),22);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(x*w+w*.06,(yy(.94)+yy(.8))/2,22,0,7);c.fill();c.beginPath();c.arc(x*w+w*.135,(yy(.94)+yy(.8))/2,17,0,7);c.fill();}
     c.fillStyle=CZ;c.font='bold 84px Arial Black,Arial';c.textAlign='center';c.textBaseline='middle';c.fillText('AMBULANS',w/2,(yy(.94)+yy(.8))/2+2);
     c.fillStyle='#26282c';c.fillRect(0,yy(.78),w,h-yy(.78));c.fillStyle='#3a3d43';pojRR(c,w*.28,yy(.76),w*.44,yy(.56)-yy(.76),14);c.fill();
     c.strokeStyle='#55585f';c.lineWidth=4;for(let y=yy(.74);y<yy(.58);y+=13){c.beginPath();c.moveTo(w*.3,y);c.lineTo(w*.7,y);c.stroke();}
     c.fillStyle='#c0c4ca';c.beginPath();c.arc(w/2,(yy(.76)+yy(.56))/2,22,0,7);c.fill();c.fillStyle='#d01818';c.beginPath();c.arc(w/2,(yy(.76)+yy(.56))/2,13,0,7);c.fill();
     c.fillStyle='#f4f4f4';c.fillRect(w*.4,yy(.54),w*.2,yy(.47)-yy(.54));});
   pojPlaska(g,W-.12,.5,tP,[0,.7,-2.98-.1],[0,Math.PI,0]);}
  {const tT=pojPlotno(1024,1024,(c,w,h)=>{const yy=y=>h-(y-.62)/(2.66-.62)*h;c.fillStyle='#f8f8f5';c.fillRect(0,0,w,h);c.fillStyle=CZ;c.fillRect(0,yy(2.64),w,yy(2.56)-yy(2.64));c.fillRect(0,yy(2.3),w,yy(2.26)-yy(2.3));
     c.fillStyle=CZ;c.font='bold 118px Arial Black,Arial';c.textAlign='center';c.textBaseline='middle';c.fillText('AMBULANS',w/2,(yy(2.55)+yy(2.3))/2+4);
     c.fillStyle='#161a20';pojRR(c,w*.08,yy(2.2),w*.4,yy(1.45)-yy(2.2),16);c.fill();pojRR(c,w*.52,yy(2.2),w*.4,yy(1.45)-yy(2.2),16);c.fill();
     pojGwiazda(c,w*.28,(yy(2.2)+yy(1.45))/2,h*.12,NB);pojP(c,w*.72,(yy(2.2)+yy(1.45))/2,h*.09);
     c.fillStyle=NB;c.fillRect(0,yy(1.32),w,yy(1.12)-yy(1.32));c.fillStyle=CZ;c.fillRect(0,yy(1.06),w,yy(.84)-yy(1.06));
     c.fillStyle='#c81414';pojRR(c,0,yy(1.7),w*.07,yy(.9)-yy(1.7),8);c.fill();pojRR(c,w*.93,yy(1.7),w*.07,yy(.9)-yy(1.7),8);c.fill();c.fillStyle='#212327';c.fillRect(0,yy(.8),w,h);   /* czarny zderzak tylny */
     c.strokeStyle='rgba(0,0,0,.4)';c.lineWidth=5;c.beginPath();c.moveTo(w/2,yy(2.28));c.lineTo(w/2,yy(.66));c.stroke();c.fillStyle='#2a2c30';pojRR(c,w*.46,yy(1.42),w*.08,30,8);c.fill();});
   pojPlaska(g,W-.12,2.04,tT,[0,1.64,2.95+.095],[0,0,0]);}
  pojBelka(g,1.78,.3,0,2.66+.15,-.98);   /* przednia belka świetlna przez całą szerokość (jak na rzucie z góry) */
  pojBelka(g,1.8,.22,0,2.66+.15,2.82);   /* tylna belka: niebieskie klosze w rogach, biały środek */
  for(const k of [-1,1]){const ar=new THREE.Mesh(new THREE.BoxGeometry(.22,.05,.05),pojLak(0x1b1c1f));ar.position.set(k*(X+.1),1.6,-1.95);g.add(ar);
    const ob=new THREE.Mesh(new THREE.BoxGeometry(.1,.46,.24),pojLak(0x1b1c1f));ob.position.set(k*(X+.24),1.72,-1.95);g.add(ob);pojObrys(g,ob,.03);}
  for(const k of [-1,1]){const lm=new THREE.Mesh(new THREE.BoxGeometry(.13,.62,.06),new THREE.MeshPhongMaterial({color:0xe01818,emissive:0x5a0606,shininess:80}));lm.position.set(k*.94,1.3,2.98);g.add(lm);pojObrys(g,lm,.02);
    const kier=new THREE.Mesh(new THREE.BoxGeometry(.13,.12,.06),new THREE.MeshPhongMaterial({color:0xffa21c,emissive:0x5a3000}));kier.position.set(k*.94,1.7,2.98);g.add(kier);}   /* tylne lampy */
  {const tb=pojPlotno(256,64,(c,w,h)=>{c.fillStyle='#f4f4f4';c.fillRect(0,0,w,h);c.fillStyle='#1f4fa8';c.fillRect(0,0,22,h);c.fillStyle='#111';c.font='bold 40px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText('KGR 112',w/2+10,h/2+2);});
   pojPlaska(g,.48,.11,tb,[-.5,.5,3.125],[0,0,0]);}   /* tablica rejestracyjna */
  /* klimatyzatora nie ma na wzorcu – usunięty */
  for(const [x,z,h] of [[-.45,-.3,.42],[.35,.2,.28]]){const an=new THREE.Mesh(new THREE.CylinderGeometry(.012,.02,h,5),pojLak(0x151515));an.position.set(x,2.66+.08+h/2,z);g.add(an);}   /* anteny */
  {const st=new THREE.Mesh(new THREE.BoxGeometry(1.5,.08,.35),pojLak(0x2a2c30));st.position.set(.25,.3,3.06);g.add(st);pojObrys(g,st,.02);}   /* tylny stopień */
  for(const [x,z] of [[-.9,-2.2],[.9,-2.2],[-.9,1.95],[.9,1.95]])pojKolo(g,x*1.04,z,.37,.25);
  return g;}

// ================= WÓZ STRAŻACKI =================
function straz(){const g=new THREE.Group();const W=2.5,X=W/2,Y0=.62;const k0=-3.8,k1=-1.55,b0=-1.48,b1=3.75,YK=3.0,YB=3.15;const CZ='#c8141a',ZO='#ffd21f';
  const PK=[[k1,Y0],[k1,YK],[k0+.3,YK],[k0+.12,2.0],[k0,1.9],[k0,Y0]];
  pojBryla(g,PK,W,.1,pojLak(0xc8141a));
  pojBryla(g,[[b1,Y0],[b1,YB],[b0,YB],[b0,Y0]],W,.06,pojLak(0xc8141a));
  pojBryla(g,[[b1-.05,.45],[b1-.05,Y0+.04],[k0+.15,Y0+.04],[k0+.15,.45]],W-.2,.03,pojLak(0x26282c));
  pojBryla(g,[[k0+.6,.5],[k0+.6,1.12],[k0-.04,1.12],[k0-.04,.5]],W+.02,.05,pojLak(0xf2f2ee));
  for(const st of [1,-1]){
    pojBok(g,st,X+.005,k0,k1,Y0,YK,PK,(c,zx,yy,w,h)=>{
      for(const [z0,z1] of [[k0+.32,k0+1.12],[k0+1.28,k1-.12]]){const x0=Math.min(zx(z0),zx(z1)),x1=Math.max(zx(z0),zx(z1));c.fillStyle='#1a2028';pojRR(c,x0,yy(2.8),x1-x0,yy(1.98)-yy(2.8),10);c.fill();}
      c.fillStyle=ZO;c.fillRect(0,yy(1.36),w,yy(1.26)-yy(1.36));c.fillStyle='#f2f2ee';c.fillRect(0,yy(1.0),w,h);
      c.fillStyle='#fff';c.font='bold 120px Arial Black,Arial';c.textAlign='center';c.textBaseline='middle';c.fillText('STRAŻ',zx(k0+.8),yy(1.65));
      c.strokeStyle='rgba(0,0,0,.35)';c.lineWidth=4;for(const z of [k0+1.2,k1-.04]){c.beginPath();c.moveTo(zx(z),yy(2.9));c.lineTo(zx(z),yy(1.0));c.stroke();}
      c.fillStyle='#2a2c30';for(const z of [k0+1.0,k1-.25]){const x=zx(z);pojRR(c,x-22,yy(1.62)-8,44,16,6);c.fill();}   /* klamki */
      c.fillStyle='#26282c';for(const z of [k0+.75,k0+1.75]){const x=zx(z);c.fillRect(x-60,yy(.92),120,14);c.fillRect(x-60,yy(.72),120,14);}   /* stopnie */
      c.fillStyle='#f2f2ee';c.beginPath();c.arc(zx(-2.75),yy(.55),Math.abs(zx(-2.08)-zx(-2.75)),Math.PI,0);c.fill();
      c.fillStyle='#16171a';c.beginPath();c.arc(zx(-2.75),yy(.55),Math.abs(zx(-2.17)-zx(-2.75)),Math.PI,0);c.fill();},1024);
    pojBok(g,st,X+.005,b0,b1,Y0,YB,null,(c,zx,yy,w,h)=>{c.fillStyle=CZ;c.fillRect(0,0,w,h);
      for(const [z0,z1,sr] of [[b0+.12,b0+1.8,1],[b0+1.88,b0+3.38,0],[b0+3.46,b1-.12,1]]){const x0=Math.min(zx(z0),zx(z1)),x1=Math.max(zx(z0),zx(z1));
        if(sr){c.fillStyle='#ced3d9';c.fillRect(x0,yy(2.95),x1-x0,yy(1.5)-yy(2.95));c.strokeStyle='rgba(0,0,0,.16)';c.lineWidth=2;for(let y=yy(2.95);y<yy(1.5);y+=10){c.beginPath();c.moveTo(x0,y);c.lineTo(x1,y);c.stroke();}c.fillStyle='#7d838b';c.fillRect(x0,yy(1.62),x1-x0,8);}
        else{c.fillStyle='#b81016';c.fillRect(x0,yy(2.95),x1-x0,yy(1.5)-yy(2.95));c.fillStyle='#fff';c.font='bold 150px Arial Black,Arial';c.textAlign='center';c.textBaseline='middle';c.fillText('998',(x0+x1)/2+28,yy(2.3));pojTel(c,(x0+x1)/2-150,yy(2.3),52,'#fff');}}
      c.fillStyle=ZO;for(const y of [3.06,1.48,.78])c.fillRect(0,yy(y),w,yy(y-.08)-yy(y));
      c.strokeStyle='rgba(0,0,0,.35)';c.lineWidth=4;for(const z of [b0+1.84,b0+3.42]){c.beginPath();c.moveTo(zx(z),yy(1.42));c.lineTo(zx(z),yy(.7));c.stroke();}
      c.fillStyle='#f2f2ee';c.beginPath();c.arc(zx(2.0),yy(.62),Math.abs(zx(2.7)-zx(2.0)),Math.PI,0);c.fill();c.fillStyle='#16171a';c.beginPath();c.arc(zx(2.0),yy(.62),Math.abs(zx(2.6)-zx(2.0)),Math.PI,0);c.fill();},2048);}
  {const tP=pojPlotno(1024,1024,(c,w,h)=>{const yy=y=>h-(y-1.12)/(YK-1.12)*h;c.fillStyle=CZ;c.fillRect(0,0,w,h);c.fillStyle='#1a2028';pojRR(c,w*.06,yy(2.9),w*.88,yy(2.02)-yy(2.9),24);c.fill();
     c.fillStyle='rgba(255,255,255,.07)';c.beginPath();c.moveTo(w*.2,yy(2.88));c.lineTo(w*.4,yy(2.88));c.lineTo(w*.28,yy(2.05));c.lineTo(w*.1,yy(2.05));c.fill();
     c.fillStyle='#fff';c.font='bold 130px Arial Black,Arial';c.textAlign='center';c.textBaseline='middle';c.fillText('STRAŻ',w/2,yy(1.75));
     c.fillStyle='#20242c';pojRR(c,w*.2,yy(1.55),w*.6,yy(1.16)-yy(1.55),18);c.fill();c.strokeStyle='#8a9098';c.lineWidth=5;pojRR(c,w*.2,yy(1.55),w*.6,yy(1.16)-yy(1.55),18);c.stroke();
     c.fillStyle='#2f6cff';for(const x of [.24,.69]){pojRR(c,x*w,yy(1.42),w*.07,yy(1.3)-yy(1.42),6);c.fill();}c.fillStyle='#cfd3d8';pojRR(c,w*.42,yy(1.46),w*.16,yy(1.3)-yy(1.46),8);c.fill();c.fillStyle='#333';c.font='bold 34px Arial';c.textAlign='center';c.fillText('MAN',w/2,(yy(1.46)+yy(1.3))/2+2);});
   pojPlaska(g,W-.2,YK-1.12,tP,[0,(YK+1.12)/2,k0-.105],[0,Math.PI,0]);}
  {const tZ=pojPlotno(1024,256,(c,w,h)=>{c.fillStyle='#f2f2ee';c.fillRect(0,0,w,h);c.fillStyle='#2a2d33';c.fillRect(w*.3,h*.35,w*.4,h*.4);for(const x of [.03,.78]){c.fillStyle='#e6ecf3';pojRR(c,x*w,h*.15,w*.19,h*.5,16);c.fill();}});
   pojPlaska(g,W-.06,.6,tZ,[0,.81,k0-.1],[0,Math.PI,0]);}
  {const tT=pojPlotno(1024,1024,(c,w,h)=>{const yy=y=>h-(y-Y0)/(YB-Y0)*h;c.fillStyle=CZ;c.fillRect(0,0,w,h);
     c.save();c.beginPath();c.rect(0,0,w*.14,h*.82);c.rect(w*.86,0,w*.14,h*.82);c.clip();for(let i=-4;i<16;i++){c.fillStyle=i%2?ZO:CZ;c.beginPath();c.moveTo(0,i*80);c.lineTo(w,i*80+w*.6);c.lineTo(w,i*80+80+w*.6);c.lineTo(0,i*80+80);c.fill();}c.restore();
     c.fillStyle='#ced3d9';c.fillRect(w*.17,yy(3.0),w*.5,yy(1.2)-yy(3.0));c.strokeStyle='rgba(0,0,0,.16)';c.lineWidth=2;for(let y=yy(3.0);y<yy(1.2);y+=10){c.beginPath();c.moveTo(w*.17,y);c.lineTo(w*.67,y);c.stroke();}
     c.fillStyle='#d01818';c.font='bold 150px Arial Black,Arial';c.textAlign='center';c.textBaseline='middle';c.fillText('998',w*.45,yy(2.4));pojTel(c,w*.24,yy(2.4),48,'#d01818');
     c.fillStyle='#222';c.fillRect(0,yy(1.0),w,h);c.fillStyle='#d01818';pojRR(c,w*.03,yy(.95),w*.14,yy(.78)-yy(.95),8);c.fill();pojRR(c,w*.83,yy(.95),w*.14,yy(.78)-yy(.95),8);c.fill();c.fillStyle='#f4f4f4';c.fillRect(w*.38,yy(.92),w*.24,yy(.8)-yy(.92));});
   pojPlaska(g,W-.1,YB-Y0,tT,[0,(YB+Y0)/2,b1+.065],[0,0,0]);}
  {const tD=pojPlotno(512,1024,(c,w,h)=>{c.fillStyle='#bfc4cb';c.fillRect(0,0,w,h);c.fillStyle='rgba(255,255,255,.35)';for(let y=6;y<h;y+=16)for(let x=((y/16)|0)%2*8;x<w;x+=16){c.save();c.translate(x,y);c.rotate(.6);c.fillRect(-4,-1.5,8,3);c.restore();}
     c.fillStyle='#e3e6ea';c.fillRect(w*.26,h*.06,w*.38,h*.66);c.strokeStyle='#8a9098';c.lineWidth=5;c.strokeRect(w*.26,h*.06,w*.38,h*.66);c.fillStyle='#d01818';c.beginPath();c.arc(w*.47,h*.4,24,0,7);c.fill();c.strokeStyle='#7a1010';c.lineWidth=3;c.stroke();
     c.fillStyle=CZ;c.fillRect(0,0,18,h);c.fillRect(w-18,0,18,h);});
   pojPlaska(g,W-.1,b1-b0-.08,tD,[0,YB+.06,(b0+b1)/2],[-Math.PI/2,0,0]);}
  const AL=pojLak(0xd8dce0,{shininess:80});for(const dx of [.36,.86]){const r=new THREE.Mesh(new THREE.BoxGeometry(.06,.09,4.9),AL);r.position.set(dx,YB+.2,1.15);g.add(r);pojObrys(g,r,.025);}
  for(let z=-1.25;z<=3.55;z+=.32){const s=new THREE.Mesh(new THREE.BoxGeometry(.5,.04,.05),AL);s.position.set(.61,YB+.2,z);g.add(s);}
  for(const dx of [.38,.88]){const r=new THREE.Mesh(new THREE.BoxGeometry(.05,2.4,.05),AL);r.position.set(dx,1.95,b1+.14);g.add(r);}for(let y=.9;y<=3.05;y+=.3){const s2=new THREE.Mesh(new THREE.BoxGeometry(.5,.04,.04),AL);s2.position.set(.63,y,b1+.14);g.add(s2);}   /* drabina na tylnej ścianie (jak na wzorze) */
  for(const dx of [-1.12,1.12]){const p=new THREE.Mesh(new THREE.BoxGeometry(.05,.05,5.0),AL);p.position.set(dx,YB+.13,1.15);g.add(p);}
  pojBelka(g,2.0,.36,0,YK+.15,k0+.6);   /* belka świetlna kabiny */
  {const tk=pojPlotno(256,256,(c,w,h)=>{c.clearRect(0,0,w,h);c.fillStyle='rgba(90,0,0,.22)';pojRR(c,w*.12,h*.18,w*.76,h*.62,16);c.fill();c.fillStyle='#8a1014';pojRR(c,w*.36,h*.36,w*.28,h*.26,10);c.fill();c.strokeStyle='#5a0a0c';c.lineWidth=4;pojRR(c,w*.36,h*.36,w*.28,h*.26,10);c.stroke();});
   pojPlaska(g,W-.3,(k1-k0)-.5,tk,[0,YK+.11,(k0+.3+k1)/2+.1],[-Math.PI/2,0,0]);}   /* dach kabiny: przetłoczenie i właz */
  for(const k of [-1,1]){const r=new THREE.Mesh(new THREE.CylinderGeometry(.12,.13,.2,16),NIEB());r.position.set(k*1.05,YB+.1,b1-.18);g.add(r);pojObrys(g,r,.03);}
  for(const k of [-1,1]){const ar=new THREE.Mesh(new THREE.BoxGeometry(.3,.05,.05),pojLak(0x1b1c1f));ar.position.set(k*(X+.14),2.3,k0+.25);g.add(ar);const ob=new THREE.Mesh(new THREE.BoxGeometry(.12,.72,.3),pojLak(0x1b1c1f));ob.position.set(k*(X+.32),2.3,k0+.25);const ob2=new THREE.Mesh(new THREE.BoxGeometry(.1,.26,.22),pojLak(0x1b1c1f));ob2.position.set(k*(X+.32),1.8,k0+.25);g.add(ob2);g.add(ob);pojObrys(g,ob,.03);}
  for(const st of [1,-1])for(const z of [b0+.96,b1-.96]){const u=new THREE.Mesh(new THREE.BoxGeometry(.04,.06,.7),pojLak(0x3a3d42));u.position.set(st*(X+.03),1.68,z);g.add(u);}   /* uchwyty żaluzji */
  {const bo=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,4.4,8),pojLak(0x2a2c30));bo.rotation.x=Math.PI/2;bo.position.set(-.82,YB+.12,1.2);g.add(bo);pojObrys(g,bo,.02);
   const ws=new THREE.Mesh(new THREE.BoxGeometry(.16,.1,3.6),pojLak(0x3a3d42));ws.position.set(-.95,YB+.08,1.0);g.add(ws);}   /* bosak i wąż wzdłuż lewej krawędzi dachu */   /* zwijadło węża */
  for(const k of [-1,1]){const l=new THREE.Mesh(new THREE.BoxGeometry(.32,.18,.05),new THREE.MeshPhongMaterial({color:0xd01818,emissive:0x400000}));l.position.set(k*.95,.88,b1+.09);g.add(l);
    const c2=new THREE.Mesh(new THREE.BoxGeometry(.14,.12,.05),new THREE.MeshPhongMaterial({color:0xf4f4f4,emissive:0x222222}));c2.position.set(k*.7,.88,b1+.09);g.add(c2);}
  {const wb=new THREE.Mesh(new THREE.BoxGeometry(W-.1,.1,.1),pojLak(0xf2f2ee));wb.position.set(0,.5,b1+.08);g.add(wb);pojObrys(g,wb,.02);}   /* biały pas pod zderzakiem */
  for(const [x,z] of [[-1.0,-2.75],[1.0,-2.75],[-1.0,2.0],[1.0,2.0]])pojKolo(g,x*1.08,z,.56,.42);
  return g;}
