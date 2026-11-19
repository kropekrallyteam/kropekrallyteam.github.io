// Kropek – bryła z modelu S1600 (GR Team) uproszczona i zwężona do Punto II Sporting (kropek_mesh.js)
// kropek(duch, malowanie) – malowanie: 'janusz' | 'andrzej'
// Malowania odczytane z klatek filmu „Brzyska Załogi” (montaż na Instagram/FB):
//  Janusz  KGR 11761: żółty, logo IR BUD na masce i na boku, pas ABARTH na górze szyby, chlapacze FIAT, antena z przodu dachu
//  Andrzej SH 5583F : żółty, owalna naklejka na masce, czarny skorpion na drzwiach, pas w barwach Włoch na progach, antena z tyłu dachu
// Na dachu żadnych naklejek, brak wlotów na dachu i masce (wygładzone w narzedzia/uprosc_s1600.html).
const MALOWANIA={janusz:{nadwozie:0xe6aa12,antena:'przod'},andrzej:{nadwozie:0xe6aa12,antena:'tyl'}};
function pojLakW(){return new THREE.MeshPhongMaterial({color:0x121214,shininess:30});}
function kropek(ghost,malowanie){
  const KTO=malowanie||'janusz', MAL=MALOWANIA[KTO];
  const KM=KROPEK_MESH, g=new THREE.Group();
  const kol=ghost?[0x7ff3ff,0x7ff3ff,0x7ff3ff,0x7ff3ff,0x7ff3ff,0x7ff3ff]:[MAL.nadwozie,0x1b2230,0xc8121a,0xf2efe0,MAL.nadwozie,0x1a1b1e];
  // części siatki: 0 lakier, 1 szyby, 2 lampy (z przodu reflektory, z tyłu tylne), 3 rajdowe lampy S1600 na masce (USUWANE), 4 zderzaki, 5 czarne wloty
  const pos=[], col=[], c=new THREE.Color(), REFL=[];
  for(let t=0;t<KM.f.length/3;t++){const cz=KM.p[t];if(cz===3)continue;   // Kropki nie mają dodatkowych lamp rajdowych
    const a=KM.f[t*3]*3,xc=KM.v[a]/1000,yc=KM.v[a+1]/1000,zc=KM.v[a+2]/1000;
    c.set(kol[cz]);
    if(!ghost){if(cz===5&&zc<0)c.set(MAL.nadwozie);if(cz===5&&zc>0)c.set(0x141416);   /* zagłębienia w tylnym zderzaku: czarne kratki */                 // czarne wloty S1600 z przodu → lakier (Sporting ich nie ma)
      if(cz===2&&zc<0){if(yc>0.5){c.set(0xe4e8ec);REFL.push(t);}else c.set(MAL.nadwozie);}
      if(cz===1&&zc<-1.3&&yc<0.85)c.set(0xd6dce2);}               // klosze reflektorów (w S1600 materiał szyby) → jasne
    for(let k=0;k<3;k++){const vi=KM.f[t*3+[0,2,1][k]]*3;   // odbicie osi z odwraca kolejność wierzchołków
      pos.push(KM.v[vi]/1000,KM.v[vi+1]/1000-0.04,KM.v[vi+2]/1000);col.push(c.r,c.g,c.b);}}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));geo.computeVertexNormals();
  // gładkie cieniowanie z zachowaniem ostrych krawędzi (próg 62°: siatka po uproszczeniu ma drobne załamania): normalne uśredniane tylko między podobnie ustawionymi ściankami
  if(!ghost){const P2=geo.attributes.position,Nn=geo.attributes.normal,mapa=new Map(),key=i=>Math.round(P2.getX(i)*500)+','+Math.round(P2.getY(i)*500)+','+Math.round(P2.getZ(i)*500);
    for(let i=0;i<P2.count;i++){const k=key(i);if(!mapa.has(k))mapa.set(k,[]);mapa.get(k).push(i);}
    const nowe=new Float32Array(P2.count*3),cosP=Math.cos(80*Math.PI/180);
    for(let i=0;i<P2.count;i++){const nx=Nn.getX(i),ny=Nn.getY(i),nz=Nn.getZ(i);let sx=0,sy=0,sz=0;
      for(const j of mapa.get(key(i))){const ax=Nn.getX(j),ay=Nn.getY(j),az=Nn.getZ(j);if(ax*nx+ay*ny+az*nz>cosP){sx+=ax;sy+=ay;sz+=az;}}
      const l=Math.hypot(sx,sy,sz)||1;nowe[i*3]=sx/l;nowe[i*3+1]=sy/l;nowe[i*3+2]=sz/l;}
    {const C2=geo.attributes.color;for(let i=0;i<P2.count;i++){const ny=nowe[i*3+1];if(ny<0.25)continue;const lak=C2.getX(i)>.8&&C2.getY(i)>.6&&C2.getZ(i)<.3;if(!lak)continue;   /* lakier na górnych powierzchniach: wygładzone, równe cieniowanie (styl ilustracji, bez „pogniecionej” maski) */
      const k=Math.min(.7,(ny-.25)*1.4);let x=nowe[i*3]*(1-k),y=ny*(1-k)+k,z=nowe[i*3+2]*(1-k);const l=Math.hypot(x,y,z);nowe[i*3]=x/l;nowe[i*3+1]=y/l;nowe[i*3+2]=z/l;}}
    {const C2=geo.attributes.color,R=.2,siatka=new Map(),kl=(x,y,z)=>Math.floor(x/R)+','+Math.floor(y/R)+','+Math.floor(z/R);   /* przód: maska wygładzona – normalne uśrednione w promieniu 20 cm (bez wgnieceń siatki) */
     const lak=i=>C2.getX(i)>.8&&C2.getY(i)>.6&&C2.getZ(i)<.3,maska=i=>lak(i)&&P2.getZ(i)<-.75&&P2.getY(i)>.62&&Math.abs(P2.getX(i))<.66;
     for(let i=0;i<P2.count;i++)if(maska(i)){const k=kl(P2.getX(i),P2.getY(i),P2.getZ(i));if(!siatka.has(k))siatka.set(k,[]);siatka.get(k).push(i);}
     const nn=nowe.slice();for(let i=0;i<P2.count;i++){if(!maska(i))continue;const x=P2.getX(i),y=P2.getY(i),z=P2.getZ(i);let sx=0,sy=0,sz=0;
       for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)for(let c=-1;c<=1;c++){const L=siatka.get((Math.floor(x/R)+a)+','+(Math.floor(y/R)+b)+','+(Math.floor(z/R)+c));if(!L)continue;
         for(const j of L){const d=Math.hypot(P2.getX(j)-x,P2.getY(j)-y,P2.getZ(j)-z);if(d>R)continue;const w=1-d/R;sx+=nowe[j*3]*w;sy+=nowe[j*3+1]*w;sz+=nowe[j*3+2]*w;}}
       {const l0=Math.hypot(sx,sy,sz)||1;sx/=l0;sy/=l0;sz/=l0;sx*=.45;sy=sy*.45+.55;sz=sz*.45-.12;}const l=Math.hypot(sx,sy,sz)||1;nn[i*3]=sx/l;nn[i*3+1]=sy/l;nn[i*3+2]=sz/l;}   /* + dociągnięcie do gładkiej, lekko pochylonej powierzchni maski */
     const fy=t=>{const a=t*3,b=a+1,c=a+2;const ux=P2.getX(b)-P2.getX(a),uy=P2.getY(b)-P2.getY(a),uz=P2.getZ(b)-P2.getZ(a),vx=P2.getX(c)-P2.getX(a),vy=P2.getY(c)-P2.getY(a),vz=P2.getZ(c)-P2.getZ(a);return uz*vx-ux*vz;};   /* składowa y normalnej ściany */
     nowe.set(nn);}
    {const C3=geo.attributes.color,N3=nowe.length,zew=new Float32Array(N3);
     const ox=i=>P2.getX(i),oy=i=>P2.getY(i)-.55,oz=i=>P2.getZ(i)*.3;   /* kierunek „na zewnątrz” od środka bryły (oś długa ściśnięta) */
     for(let i=0;i<P2.count;i++){let x=nowe[i*3],y=nowe[i*3+1],z=nowe[i*3+2];if(x*ox(i)+y*oy(i)+z*oz(i)<0){x=-x;y=-y;z=-z;}zew[i*3]=x;zew[i*3+1]=y;zew[i*3+2]=z;}
     for(let i=0;i<P2.count;i++){const ny=zew[i*3+1];const k=.66+.4*Math.max(0,Math.min(1,ny*.5+.5))**1.3;C3.setXYZ(i,C3.getX(i)*Math.min(1.08,k*1.05),C3.getY(i)*Math.min(1.06,k),C3.getZ(i)*Math.min(1.04,k*.95));}C3.needsUpdate=true;   /* malarskie cieniowanie: boki ciemniejsze, dach jaśniejszy – liczone z normalnych na zewnątrz (bez ciemnych łat na masce) */
     for(let t=0;t<P2.count/3;t++){const a=t*3,b=a+1,c=a+2;const ux=P2.getX(b)-P2.getX(a),uy=P2.getY(b)-P2.getY(a),uz=P2.getZ(b)-P2.getZ(a),vx=P2.getX(c)-P2.getX(a),vy=P2.getY(c)-P2.getY(a),vz=P2.getZ(c)-P2.getZ(a);
       const fx=uy*vz-uz*vy,fy2=uz*vx-ux*vz,fz=ux*vy-uy*vx,cx=(ox(a)+ox(b)+ox(c)),cy=(oy(a)+oy(b)+oy(c)),cz=(oz(a)+oz(b)+oz(c));
       const sg=(fx*cx+fy2*cy+fz*cz)<0?-1:1;   /* ściana o odwróconym nawinięciu jest rysowana tyłem (DoubleSide odwraca normalną) – zapisujemy ją do środka, żeby świeciła na zewnątrz */
       for(const k of [a,b,c]){nowe[k*3]=zew[k*3]*sg;nowe[k*3+1]=zew[k*3+1]*sg;nowe[k*3+2]=zew[k*3+2]*sg;}}}
    geo.setAttribute('normal',new THREE.BufferAttribute(nowe,3));}
  const mat=ghost?new THREE.MeshLambertMaterial({vertexColors:true,flatShading:true,transparent:true,opacity:.4}):new THREE.MeshPhongMaterial({vertexColors:true,side:THREE.DoubleSide,shininess:45,specular:0x4a4230,stencilWrite:true,stencilRef:1,stencilFunc:THREE.AlwaysStencilFunc,stencilZPass:THREE.ReplaceStencilOp})   /* styl ilustracji wg wzoru: złocisty żółty, miękkie szerokie odblaski */;
  const body=new THREE.Mesh(geo,mat);body.castShadow=true;g.add(body);
  // koła 185/55 R15 w miejscach osi z modelu
  const tg=new THREE.CylinderGeometry(.29,.29,.2,10);tg.rotateZ(Math.PI/2);
  const rg=new THREE.CylinderGeometry(.19,.19,.21,8);rg.rotateZ(Math.PI/2);
  // felgi Sportinga wg zdjęcia: srebrne, 5 podwójnych ramion w kształcie V, 4 śruby, ciemne prześwity
  const TX_FELGA=(()=>{const S=256,cv=document.createElement('canvas');cv.width=cv.height=S;const c=cv.getContext('2d'),R=S/2;   /* felga wg rysunku Kropka: 5 podwójnych ramion, 4 śruby, niebieski FIAT */
    c.fillStyle='#2b2d31';c.beginPath();c.arc(R,R,R*.99,0,7);c.fill();                                   // opona (obrzeże)
    const gr=c.createRadialGradient(R,R,R*.82,R,R,R*.95);gr.addColorStop(0,'#9ea3aa');gr.addColorStop(.5,'#eef0f3');gr.addColorStop(1,'#8d9299');c.fillStyle=gr;c.beginPath();c.arc(R,R,R*.95,0,7);c.fill();   // rant
    c.fillStyle='#24262a';c.beginPath();c.arc(R,R,R*.83,0,7);c.fill();                                   // prześwity
    for(let k=0;k<5;k++){const a=k*Math.PI*2/5-Math.PI/2;for(const d of [-1,1]){c.save();c.translate(R,R);c.rotate(a);   // każde ramię = dwa smukłe klinowe pręty, jasna i ciemna połowa
      c.beginPath();c.moveTo(R*.22,d*R*.02);c.lineTo(R*.84,d*R*.04);c.lineTo(R*.84,d*R*.24);c.lineTo(R*.22,d*R*.12);c.closePath();c.fillStyle=d>0?'#c9cdd3':'#eef0f3';c.fill();
      c.strokeStyle='#5f646b';c.lineWidth=2;c.stroke();c.restore();}
      c.save();c.translate(R,R);c.rotate(a);c.strokeStyle='#7a7f86';c.lineWidth=2;c.beginPath();c.moveTo(R*.22,0);c.lineTo(R*.82,0);c.stroke();c.restore();}   // grań między prętami
    const gp=c.createRadialGradient(R-8,R-8,4,R,R,R*.3);gp.addColorStop(0,'#f4f6f8');gp.addColorStop(1,'#a9aeb5');c.fillStyle=gp;c.beginPath();c.arc(R,R,R*.28,0,7);c.fill();c.strokeStyle='#6a6f76';c.lineWidth=2;c.stroke();   // piasta
    c.fillStyle='#3a3d42';for(let k=0;k<4;k++){const a=k*Math.PI/2+Math.PI/4;c.beginPath();c.arc(R+Math.cos(a)*R*.19,R+Math.sin(a)*R*.19,R*.035,0,7);c.fill();}   // 4 śruby
    c.fillStyle='#1f4fa8';c.beginPath();c.arc(R,R,R*.1,0,7);c.fill();c.strokeStyle='#d8dbe0';c.lineWidth=3;c.stroke();c.fillStyle='#fff';c.font='bold '+Math.round(R*.08)+'px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText('FIAT',R,R+1);
    const t=new THREE.CanvasTexture(cv);t.anisotropy=8;t.minFilter=THREE.LinearMipmapLinearFilter;return new THREE.MeshBasicMaterial({map:t,transparent:true,color:0xe6e6e6});})();   // bez cienia – srebro widać zawsze
  // koło = grupa skrętu (obrót wokół osi pionowej, tylko przód) → grupa toczenia (obrót wokół osi koła); g.userData.kola do animacji
  g.userData.kola=[];
  KM.kola.forEach(([x,y,z])=>{const skr=new THREE.Group();skr.position.set(Math.sign(x)*.73,.29,z/1000);const w=new THREE.Group();skr.add(w);
    {const op=new THREE.Mesh(tg,ghost?mat:M(0x151515));op.castShadow=!ghost;w.add(op);}   /* opona rzuca cień */if(!ghost){const sd=Math.sign(x);const fc=new THREE.Mesh(new THREE.CircleGeometry(.235,32),TX_FELGA);fc.rotation.y=sd*Math.PI/2;fc.position.x=sd*.103;w.add(fc);}
    g.add(skr);g.userData.kola.push({skret:skr,toczenie:w,przod:z<0});});
  // animacja kół: kąt skrętu przednich (rad) i przejechana droga (m) → obrót (promień 0,29 m)
  g.userData.ustawKola=(katSkretu,droga)=>{for(const k of g.userData.kola){if(k.przod)k.skret.rotation.y=katSkretu;k.toczenie.rotation.x=-droga/0.29;}};
  if(ghost){scene.add(g);return g;}

  // obrys sylwetki (jak sprite'y w grach z automatów)
  const ol=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:0x2a1c0c,side:THREE.DoubleSide,stencilWrite:true,stencilRef:1,stencilFunc:THREE.NotEqualStencilFunc,stencilZPass:THREE.KeepStencilOp}));ol.scale.set(1.075,1.055,1.035);ol.position.y=-0.02;ol.renderOrder=2;   /* obrys tylko poza sylwetką (bufor szablonu) */g.add(ol);

  // pomiary powierzchni z siatki
  const VV=[];for(let i=0;i<KM.v.length;i+=3)VV.push([KM.v[i]/1000,KM.v[i+1]/1000-0.04,KM.v[i+2]/1000]);
  const gora=(z,r=.12,xm=.3)=>{let y=0;VV.forEach(p=>{if(Math.abs(p[0])<xm&&Math.abs(p[2]-z)<r)y=Math.max(y,p[1]);});return y;};
  const bokX=(y,z)=>{let x=0;VV.forEach(p=>{if(Math.abs(p[1]-y)<.1&&Math.abs(p[2]-z)<.15)x=Math.max(x,Math.abs(p[0]));});return x||.83;};
  const szyby=[];for(let t=0;t<KM.p.length;t++)if(KM.p[t]===1)for(let k=0;k<3;k++){const vi=KM.f[t*3+k];const p=VV[vi];if(Math.abs(p[0])<.35&&p[2]<.2)szyby.push(p);}
  let sDol=szyby.reduce((a,p)=>p[2]<a[2]?p:a,[0,0,9]), sGora=szyby.reduce((a,p)=>p[1]>a[1]?p:a,[0,-9,0]);

  // naklejki: tekstury z płótna (ostre piksele)
  function plotno(w,h,rys){const cv=document.createElement('canvas');cv.width=w;cv.height=h;const cx=cv.getContext('2d');rys(cx,w,h);const t=new THREE.CanvasTexture(cv);t.magFilter=THREE.NearestFilter;t.minFilter=THREE.LinearFilter;t.generateMipmaps=false;return new THREE.MeshLambertMaterial({map:t,transparent:true,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});}
  // logo IR BUD wg pliku od użytkownika, bez tła (przezroczyste): czarna linia dachów, czerwony domek pod „UD”, czarne litery
  const logoIrbud=plotno(1000,422,(c,w,h)=>{const k=w/2000;c.scale(k,k);   /* logo IR BUD przerysowane wg pliku użytkownika (układ 2000×844) */
    c.fillStyle='#e1000f';c.beginPath();c.moveTo(1237,466);c.lineTo(1618,155);c.lineTo(2000,466);c.lineTo(2000,844);c.lineTo(1237,844);c.closePath();c.fill();   // czerwony domek
    c.fillStyle='#000';c.beginPath();   // linia dachów (pas grubości ok. 30)
    const L=[[2,351],[357,56],[698,339],[898,174],[1098,339],[1507,0]];const T=30;
    c.moveTo(2,351);c.lineTo(357,56);c.lineTo(698,339);c.lineTo(898,174);c.lineTo(1098,339);c.lineTo(1507,0);c.lineTo(1507,29);c.lineTo(1098,368);c.lineTo(898,202);c.lineTo(698,368);c.lineTo(357,85);c.lineTo(34,351);c.closePath();c.fill();
    const rr=(x,y,w2,h2,r)=>{c.moveTo(x+r,y);c.lineTo(x+w2-r,y);c.quadraticCurveTo(x+w2,y,x+w2,y+r);c.lineTo(x+w2,y+h2-r);c.quadraticCurveTo(x+w2,y+h2,x+w2-r,y+h2);c.lineTo(x+r,y+h2);c.quadraticCurveTo(x,y+h2,x,y+h2-r);c.lineTo(x,y+r);c.quadraticCurveTo(x,y,x+r,y);c.closePath();};
    c.fillRect(0,454,36,35);c.fillRect(0,562,36,212);   // i (kwadratowa kropka)
    c.beginPath();c.moveTo(146,562);c.lineTo(318,562);c.quadraticCurveTo(362,562,362,604);c.lineTo(362,650);c.quadraticCurveTo(362,691,318,691);c.lineTo(287,691);c.lineTo(383,774);c.lineTo(330,774);c.lineTo(244,691);c.lineTo(181,691);c.lineTo(181,774);c.lineTo(146,774);c.closePath();   // R
    c.moveTo(181,589);c.lineTo(181,664);c.lineTo(303,664);c.quadraticCurveTo(327,664,327,640);c.lineTo(327,613);c.quadraticCurveTo(327,589,303,589);c.closePath();c.fill('evenodd');
    c.beginPath();c.moveTo(605,455);c.lineTo(862,455);c.quadraticCurveTo(931,455,931,518);c.lineTo(931,553);c.quadraticCurveTo(931,600,878,607);c.quadraticCurveTo(933,614,933,665);c.lineTo(933,712);c.quadraticCurveTo(933,774,848,774);c.lineTo(605,774);c.closePath();   // B
    c.moveTo(658,497);c.lineTo(658,586);c.lineTo(845,586);c.quadraticCurveTo(876,586,876,556);c.lineTo(876,525);c.quadraticCurveTo(876,497,847,497);c.closePath();
    c.moveTo(658,628);c.lineTo(658,731);c.lineTo(845,731);c.quadraticCurveTo(878,731,878,697);c.lineTo(878,663);c.quadraticCurveTo(878,628,845,628);c.closePath();c.fill('evenodd');
    c.beginPath();c.moveTo(1081,455);c.lineTo(1135,455);c.lineTo(1135,731);c.lineTo(1369,731);c.lineTo(1369,455);c.lineTo(1421,455);c.lineTo(1421,700);c.quadraticCurveTo(1421,774,1350,774);c.lineTo(1155,774);c.quadraticCurveTo(1081,774,1081,700);c.closePath();c.fill();   // U
    c.beginPath();c.moveTo(1589,455);c.lineTo(1760,455);c.quadraticCurveTo(1955,455,1955,614);c.quadraticCurveTo(1955,774,1760,774);c.lineTo(1589,774);c.closePath();   // D
    c.moveTo(1643,498);c.lineTo(1643,731);c.lineTo(1757,731);c.quadraticCurveTo(1900,731,1900,614);c.quadraticCurveTo(1900,498,1757,498);c.closePath();c.fill('evenodd');});
  const naMaske=(mt,szer,dl,z)=>{const y=gora(z,.1,.25);const m=new THREE.Mesh(new THREE.PlaneGeometry(szer,dl),mt);m.rotation.x=-Math.PI/2+0.16;m.rotation.z=Math.PI;m.position.set(0,y+.012,z);g.add(m);};
  const naBok=(mt,szer,wys,y,z,dwustr)=>{for(const k of [-1,1]){const x=Math.max(bokX(y,z),bokX(y,z-szer*.45),bokX(y,z+szer*.45),bokX(y+wys*.4,z),bokX(y-wys*.4,z))+.012;const m=new THREE.Mesh(new THREE.PlaneGeometry(szer,wys),mt);m.position.set(k*x,y,z);m.rotation.y=k*Math.PI/2;if(dwustr){m.rotateZ(-k*dwustr);}g.add(m);}};   /* dwustr: pochylenie naklejki (wznosi się ku tyłowi) */
  // światła stop: jasnoczerwone nakładki na tylnych lampach (z siatki: lampy tylne = część 2 z tyłu), włączane przy hamowaniu
  {const ST=[];for(let t=0;t<KM.p.length;t++)if(KM.p[t]===2&&KM.v[KM.f[t*3]*3+2]>1000)for(let k=0;k<3;k++)ST.push(VV[KM.f[t*3+k]]);
   const grupa=new THREE.Group();grupa.visible=false;g.add(grupa);
   for(const sd of [-1,1]){const L=ST.filter(p=>Math.sign(p[0])===sd);if(!L.length)continue;let x0=9,x1=-9,y0=9,y1=-9,z1=-9;L.forEach(p=>{x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1]);z1=Math.max(z1,p[2]);});
     const m=new THREE.Mesh(new THREE.CylinderGeometry(.065,.065,.03,12).rotateX(Math.PI/2),new THREE.MeshBasicMaterial({color:0xff2a14}));{let zz=-9;VV.forEach(p=>{if(Math.abs(p[0]-sd*.56)<.09&&Math.abs(p[1]-.86)<.09)zz=Math.max(zz,p[2]);});m.position.set(sd*.56,.86,(zz>-9?zz:z1)-.1);}m.visible=false;grupa.add(m);}   /* poświata na powierzchni lampy */   /* na górnej części czerwonej lampy */   /* małe, okrągłe światło stopu na lampie */
   // trzecie światło stop: na środku tylnej szyby, przy jej górnej krawędzi (szyba = część 1 siatki, tył auta)
   {let gy=-9,gz=0;for(let t=0;t<KM.p.length;t++)if(KM.p[t]===1)for(let k=0;k<3;k++){const p=VV[KM.f[t*3+k]];if(p[2]>0.9&&Math.abs(p[0])<0.25&&p[1]>gy){gy=p[1];gz=p[2];}}
    const trzecie=new THREE.Mesh(new THREE.BoxGeometry(.26,.035,.03),new THREE.MeshBasicMaterial({color:0xff2a14}));trzecie.position.set(0,gy-.05,gz+.03);grupa.add(trzecie);}
   {const tg=(()=>{const cv=document.createElement('canvas');cv.width=cv.height=64;const c=cv.getContext('2d');const gr=c.createRadialGradient(32,32,2,32,32,32);gr.addColorStop(0,'rgba(255,235,215,1)');gr.addColorStop(.18,'rgba(255,70,40,.95)');gr.addColorStop(.5,'rgba(255,30,10,.35)');gr.addColorStop(1,'rgba(255,0,0,0)');c.fillStyle=gr;c.fillRect(0,0,64,64);return new THREE.CanvasTexture(cv);})();
    const SM=new THREE.SpriteMaterial({map:tg,transparent:true,depthWrite:false});
    for(const m of grupa.children.slice()){const sp=new THREE.Sprite(SM);sp.position.copy(m.position);sp.position.z+=.16;const szer=m.geometry.parameters.width?.6:.5;sp.scale.set(m.geometry.parameters.width?.36:.5,m.geometry.parameters.width?.12:.5,1);if(m.geometry.parameters.width)sp.position.z-=.1;grupa.add(sp);
      m.material.transparent=true;m.material.opacity=.85;}}   /* światła stop: miękka, rozmyta poświata zamiast ostrej plamki */
   g.userData.ustawStop=on=>{grupa.visible=!!on;};}
  // przód wg zdjęcia: okrągłe halogeny z jasnym pierścieniem i czarna kratka w plaster miodu w dolnym wlocie
  {const zP=(x,y)=>{let z=9;VV.forEach(p=>{if(Math.abs(p[0]-x)<.05&&Math.abs(p[1]-y)<.04)z=Math.min(z,p[2]);});return z<9?z:-1.9;};
   const hal=plotno(32,32,(c,w,h)=>{c.fillStyle="#141416";c.beginPath();c.arc(16,16,15,0,7);c.fill();c.strokeStyle="#e8f4ff";c.lineWidth=4;c.beginPath();c.arc(16,16,10,0,7);c.stroke();c.fillStyle="#cfd6dc";c.beginPath();c.arc(16,16,6,0,7);c.fill();});
   for(const k of [-1,1]){const x=k*.52,y=.31;const m=new THREE.Mesh(new THREE.CircleGeometry(.075,16),hal);m.position.set(x,y,Math.min(zP(x-.06,y),zP(x,y),zP(x+.06,y))-.03);m.rotation.y=Math.PI-k*.35;g.add(m);}
   const kr=plotno(64,16,(c,w,h)=>{c.fillStyle="#141518";c.fillRect(0,0,w,h);c.strokeStyle="#3a3d44";for(let yy=0;yy<h;yy+=4)for(let xx=(yy/4)%2*3;xx<w;xx+=6){c.beginPath();c.moveTo(xx,yy+2);c.lineTo(xx+2,yy);c.lineTo(xx+4,yy+2);c.lineTo(xx+2,yy+4);c.closePath();c.stroke();}});
   const m2=new THREE.Mesh(new THREE.PlaneGeometry(.62,.12),kr);m2.position.set(0,.29,zP(0,.29)-.012);m2.rotation.y=Math.PI;g.add(m2);}
  // lusterka: żółta obudowa na czarnej stopce, przy przednim rogu szyby bocznej (wg zdjęć)
  for(const k of [-1,1]){const zl=-.5,yl=.86,xb=bokX(yl,zl);const st=new THREE.Mesh(new THREE.BoxGeometry(.07,.06,.1),M(0x141416));st.position.set(k*(xb+.02),yl,zl);g.add(st);
    const ob=new THREE.Mesh(new THREE.BoxGeometry(.13,.1,.07),KTO==='andrzej'&&!ghost?plotno(24,8,(c,w,h)=>{c.fillStyle='#1d9a3a';c.fillRect(0,0,w/3,h);c.fillStyle='#f4f4f4';c.fillRect(w/3,0,w/3,h);c.fillStyle='#d8261c';c.fillRect(2*w/3,0,w/3,h);}):M(MAL.nadwozie));   /* Andrzej: obudowy lusterek w barwach Włoch */ob.position.set(k*(xb+.055),yl+.02,zl+.07);ob.rotation.y=k*1.3;   /* lusterka złożone do tyłu, przy szybie */ob.castShadow=true;g.add(ob);}
  // antena: Janusz z przodu dachu, Andrzej z tyłu
  const za=MAL.antena==='przod'?-0.18:0.95;const ya=gora(za,.12,.2);
  const ant=new THREE.Mesh(new THREE.CylinderGeometry(.011,.017,.5,4),M(0x111111));const ka=0.75;ant.rotation.x=ka;ant.position.set(0,ya+Math.cos(ka)*.3,za+Math.sin(ka)*.3);   // pochylona do tyłu auta
  g.add(ant);
  // atrapa: ciemnoszara kratka między prawdziwymi reflektorami (Punto II FL Sporting) ze znaczkiem
  {const L=[];REFL.forEach(t=>{for(let k=0;k<3;k++)L.push(VV[KM.f[t*3+k]]);});
   if(L.length){let y0=9,y1=-9,xin=9;L.forEach(p=>{y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1]);xin=Math.min(xin,Math.abs(p[0]));});
    const hh=Math.max(.09,(y1-y0)*.5),yc=y0+hh*.55+.035,ww=Math.max(.38,xin*2*.82);   // atrapa (nieco węższa niż odstęp lamp), w dolnej części wysokości reflektorów
    let zf=9;VV.forEach(p=>{if(Math.abs(p[0])<ww/2&&Math.abs(p[1]-yc)<hh)zf=Math.min(zf,p[2]);});
    {const ta=plotno(256,96,(c,w,h)=>{c.clearRect(0,0,w,h);const r=26;c.beginPath();c.moveTo(r,2);c.lineTo(w-r,2);c.quadraticCurveTo(w-2,2,w-2,r);c.lineTo(w-2,h-r);c.quadraticCurveTo(w-2,h-2,w-r,h-2);c.lineTo(r,h-2);c.quadraticCurveTo(2,h-2,2,h-r);c.lineTo(2,r);c.quadraticCurveTo(2,2,r,2);c.closePath();
       const gr=c.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#4a4e55');gr.addColorStop(.5,'#2c2f34');gr.addColorStop(1,'#1c1e22');c.fillStyle=gr;c.fill();c.save();c.clip();c.strokeStyle='rgba(0,0,0,.35)';c.lineWidth=3;for(let y=h*.28;y<h;y+=h*.24){c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke();}c.restore();
       c.strokeStyle='#8a8e94';c.lineWidth=3;c.stroke();});   /* atrapa gładka: zaokrąglona, z delikatnymi listwami (zamiast pudełka) */
     const at=new THREE.Mesh(new THREE.PlaneGeometry(ww,hh),ta);at.position.set(0,yc,zf-.012);at.rotation.y=Math.PI;at.rotation.x=.12;g.add(at);}
    const zn=new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,.02,10),M(0x1f4fa8));zn.rotation.x=Math.PI/2;zn.position.set(0,yc,zf-.02);g.add(zn);}}
  // przód Sportinga wg zdjęcia: tablica rejestracyjna pod atrapą
  {const przodZ=(y,xw)=>{let z=9;VV.forEach(p=>{if(Math.abs(p[0])<xw&&Math.abs(p[1]-y)<.05)z=Math.min(z,p[2]);});return z<9?z:-1.9;};
   const tab=plotno(128,28,(c,w,h)=>{c.fillStyle='#f4f4f4';c.fillRect(0,0,w,h);c.fillStyle='#1f4fa8';c.fillRect(0,0,10,h);c.fillStyle='#111';c.font='bold 18px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText(KTO==='janusz'?'KGR 11761':'SH 5583F',w/2+5,h/2+1);});
   const yt=.47,pl=new THREE.Mesh(new THREE.PlaneGeometry(.52,.11),tab);pl.position.set(0,yt,przodZ(yt,.3)-.02);pl.rotation.y=Math.PI;g.add(pl);}
  // tył: tablica na zderzaku (czarne plastiki w rogach zderzaka są pomalowane w samej bryle)
  {const tylZ=(y,xw)=>{let z=-9;VV.forEach(p=>{if(Math.abs(p[0])<xw&&Math.abs(p[1]-y)<.05)z=Math.max(z,p[2]);});return z>-9?z:1.9;};
   const tabT=plotno(128,28,(c,w,h)=>{c.fillStyle='#f4f4f4';c.fillRect(0,0,w,h);c.fillStyle='#1f4fa8';c.fillRect(0,0,10,h);c.fillStyle='#111';c.font='bold 18px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText(KTO==='janusz'?'KGR 11761':'SH 5583F',w/2+5,h/2+1);});
   const yp=.5,pt=new THREE.Mesh(new THREE.PlaneGeometry(.52,.11),tabT);pt.position.set(0,yp,tylZ(yp,.3)+.02);g.add(pt);}
  // tylny zderzak Sportinga wg zdjęcia: czarne kratki w plaster miodu po bokach z czerwonymi odblaskami, pod tablicą czarne szczeliny (płasko na powierzchni)
  {const tylZx=(x,y)=>{let z=-9;VV.forEach(p=>{if(Math.abs(p[0]-x)<.1&&Math.abs(p[1]-y)<.06)z=Math.max(z,p[2]);});return z>-9?z:1.88;};
   const kratka=plotno(48,36,(c,w,h)=>{c.fillStyle='#16171a';c.fillRect(0,0,w,h);c.strokeStyle='#3a3d44';c.lineWidth=1;
     for(let yy=0;yy<26;yy+=5)for(let xx=(yy/5)%2*3;xx<w;xx+=6){c.beginPath();c.moveTo(xx,yy+2);c.lineTo(xx+2,yy);c.lineTo(xx+4,yy+2);c.lineTo(xx+2,yy+4);c.closePath();c.stroke();}
     c.fillStyle='#c8141c';c.fillRect(4,h-9,w-8,7);});
   // kratki dopasowane do krzywizny zderzaka: zawijają się na rogach w stronę boków auta
   const tylZc=(x,y)=>{let z=-9;VV.forEach(p=>{if(Math.abs(p[0]-x)<.035&&Math.abs(p[1]-y)<.06)z=Math.max(z,p[2]);});return z>-9?z:1.7;};
   for(const k of [-1,1]){const m=new THREE.Mesh(new THREE.PlaneGeometry(.21,.15),kratka);m.position.set(k*.455,.337,1.882);g.add(m);}   /* czarne kratki dokładnie w zagłębieniach zderzaka (wymiary z bryły) */
   const szcz=plotno(64,8,(c,w,h)=>{c.fillStyle='#f8cc00';c.fillRect(0,0,w,h);c.fillStyle='#141518';c.fillRect(0,1,w,h-2);c.fillStyle='#f8cc00';c.fillRect(20,0,3,h);c.fillRect(41,0,3,h);});
   const ys=.33,sz=new THREE.Mesh(new THREE.PlaneGeometry(.6,.07),szcz);sz.position.set(0,ys,tylZx(0,ys)+.008);g.add(sz);}

  // wspólne dla obu Kropków: znaczki na klapie, szczeliny drzwi, wlew, przyciemniona szyba i wycieraczki
    // emblematy na klapie (wg zdjęcia): okrągły znaczek FIAT pod szybą, „Punto” z lewej i „Sporting” z prawej
    {const zKl=(x,y)=>{let z=-9;VV.forEach(p=>{if(Math.abs(p[0]-x)<.05&&Math.abs(p[1]-y)<.04)z=Math.max(z,p[2]);});return z>-9?z:1.8;};
     const zn=KTO==="andrzej"?plotno(32,32,(c,w,h)=>{c.fillStyle="#c9cdd3";c.beginPath();c.arc(16,16,15,0,7);c.fill();c.fillStyle="#d01c1c";c.beginPath();c.arc(16,16,12,Math.PI,0);c.fill();c.fillStyle="#f2f2f2";c.fillRect(4,13,24,4);c.fillStyle="#e8b400";c.beginPath();c.arc(16,16,12,0,Math.PI);c.fill();c.fillStyle="#111";c.beginPath();c.ellipse(16,23,3,4,0,0,7);c.fill();}):plotno(32,32,(c,w,h)=>{c.fillStyle="#c9cdd3";c.beginPath();c.arc(16,16,15,0,7);c.fill();c.fillStyle="#1f3f9a";c.beginPath();c.arc(16,16,12,0,7);c.fill();c.fillStyle="#fff";c.font="bold 8px Arial";c.textAlign="center";c.textBaseline="middle";c.fillText("FIAT",16,17);});
     const m1=new THREE.Mesh(new THREE.CircleGeometry(.055,16),zn);m1.position.set(0,.84,zKl(0,.84)+.014);g.add(m1);
     const napis=(t)=>plotno(128,32,(c,w,h)=>{c.font="italic bold 25px Georgia,serif";c.textAlign="center";c.textBaseline="middle";c.lineWidth=3;c.strokeStyle="#3a3c42";c.strokeText(t,w/2,h/2+1);c.fillStyle="#dfe3e8";c.fillText(t,w/2,h/2+1);});   /* chromowany napis z ciemną obwódką */
     for(const [t,x] of [["Punto",-.3],["Sporting",.3]]){const m=new THREE.Mesh(new THREE.PlaneGeometry(.26,.065),napis(t));const zz=Math.max(zKl(x-.1,.62),zKl(x,.62),zKl(x+.1,.62));m.position.set(x,.62,zz+.02);m.rotation.y=Math.sign(x)*.12;g.add(m);}}
    // szczeliny drzwi i wlew paliwa (cienkie ciemne linie na boku)
    {const dz=plotno(256,128,(c,w,h)=>{c.clearRect(0,0,w,h);c.strokeStyle='rgba(20,16,10,.55)';c.lineWidth=3;c.beginPath();c.moveTo(6,10);c.lineTo(6,h-8);c.quadraticCurveTo(6,h-2,16,h-2);c.lineTo(w-14,h-2);c.quadraticCurveTo(w-4,h-2,w-6,h-14);c.lineTo(w-10,8);c.stroke();
       c.fillStyle='rgba(20,16,10,.6)';c.fillRect(w*.72,h*.18,30,7);});
     naBok(dz,1.2,.6,.58,-.08);
     const wl=plotno(32,32,(c,w,h)=>{c.clearRect(0,0,w,h);c.strokeStyle='rgba(20,16,10,.6)';c.lineWidth=3;c.beginPath();c.arc(16,16,12,0,7);c.stroke();});
     {const x=bokX(.82,1.25)+.012;const m=new THREE.Mesh(new THREE.PlaneGeometry(.17,.17),wl);m.position.set(x,.82,1.25);m.rotation.y=Math.PI/2;g.add(m);}}   /* wlew paliwa – prawy tył */
    // wycieraczki: dwie na dole przedniej szyby, jedna na tylnej (jak na zdjęciach)
    {const WY=pojLakW();const sw=szyby.filter(p=>p[2]>-1.25&&p[2]<.2);const D2=sw.reduce((a,p)=>p[2]<a[2]?p:a,[0,0,9]);   /* dolna krawędź samej szyby (bez kloszy reflektorów) */
     const kat=Math.atan2(sGora[1]-D2[1],sGora[2]-D2[2]),Ls=Math.hypot(sGora[1]-D2[1],sGora[2]-D2[2]);
     {const tP=plotno(256,256,(c,w,h)=>{const gr=c.createLinearGradient(0,0,w,h);gr.addColorStop(0,'rgba(28,36,50,.92)');gr.addColorStop(.45,'rgba(40,52,70,.9)');gr.addColorStop(.5,'rgba(110,125,145,.75)');gr.addColorStop(.56,'rgba(36,46,62,.9)');gr.addColorStop(1,'rgba(20,26,36,.93)');c.fillStyle=gr;c.fillRect(0,0,w,h);});
      const ps=new THREE.Mesh(new THREE.PlaneGeometry(.9,Ls*.66),tP);const tm=.4;ps.position.set(0,D2[1]+(sGora[1]-D2[1])*tm+.018,D2[2]+(sGora[2]-D2[2])*tm-.012);ps.renderOrder=-1;ps.rotation.x=-(Math.PI/2+kat);g.add(ps);}   /* przyciemniona szyba z odblaskiem */
     const dz=sGora[2]-D2[2],dy=sGora[1]-D2[1];const nz=-dy/Ls,ny=dz/Ls;   /* normalna szyby (do przodu i w górę) */
     for(const [x,r,dl] of [[-.26,.1,.58],[.2,.06,.5]]){const w=new THREE.Mesh(new THREE.BoxGeometry(dl,.03,.04),WY);w.position.set(x,D2[1]+dy*.1+ny*.045,D2[2]+dz*.1+nz*.045);w.rotation.order='XYZ';w.rotation.x=-kat;w.rotation.z=r;g.add(w);}
     const tw=new THREE.Mesh(new THREE.BoxGeometry(.42,.022,.03),WY);tw.position.set(0,.95,1.70);tw.rotation.x=.74;tw.rotation.z=-.25;g.add(tw);}
  if(KTO==='janusz'){
    naMaske(logoIrbud,.7,.3,-1.38);
    naBok(logoIrbud,1.15,.485,.82,.98,.2);   /* pochylone jak na aucie */   /* wg rysunku: duże, od tylnych drzwi do lampy, nad łukiem koła */   /* wg zdjęcia: na tylnym błotniku, nad tylnym kołem */
    const listwa=plotno(64,4,(c,w,h)=>{c.fillStyle="#141416";c.fillRect(0,0,w,h);});naBok(listwa,1.5,.035,.5,-.05);   /* czarna listwa na drzwiach */
    const numer=plotno(96,40,(c,w,h)=>{c.fillStyle="#f4f4f4";c.fillRect(0,0,w,h);c.fillStyle="#1d2d8a";c.fillRect(3,4,62,32);c.fillStyle="#fff";c.fillRect(8,12,52,3);c.fillRect(8,19,44,3);c.fillRect(8,26,48,3);c.fillStyle="#ffd21f";c.fillRect(67,4,26,32);c.fillStyle="#111";c.font="bold 22px Arial";c.textAlign="center";c.textBaseline="middle";c.fillText("25",80,21);});naBok(numer,.5,.2,.66,-.15);   /* tabliczka rajdu z numerem startowym */
    // tylna szyba: AUTOMOBILKLUB BIECKI / CAMKRAFT.pl (białe litery)
    {const tsz=plotno(256,96,(c,w,h)=>{c.fillStyle="rgba(14,18,26,.92)";c.beginPath();c.moveTo(22,2);c.lineTo(w-22,2);c.lineTo(w-2,h-2);c.lineTo(2,h-2);c.closePath();c.fill();c.fillStyle="#fff";c.textAlign="center";c.textBaseline="middle";c.font="bold 17px Arial";c.fillText("AUTOMOBILKLUB BIECKI",w/2,26);c.font="bold 21px Arial Black,Arial";c.fillText("CAMKRAFT",w/2-10,56);c.font="bold 14px Arial";c.fillText(".pl",w/2+58,60);});
     const yd=.917,zd=1.693,yg=1.31,zg=1.335,L=Math.hypot(yg-yd,zg-zd),th=Math.atan2(zg-zd,yg-yd);const m=new THREE.Mesh(new THREE.PlaneGeometry(.9,L*.92),tsz);m.rotation.x=th;m.position.set(0,(yd+yg)/2+.673*.055,(zd+zg)/2+.739*.055);g.add(m);}
    // wg zdjęcia z boku: nazwiska załogi z flagami na tylnej szybie bocznej, okrągła naklejka klubu przy słupku, panel MKT SERWIS przy przednim błotniku
    const zaloga=plotno(128,64,(c,w,h)=>{c.fillStyle="rgba(0,0,0,0)";c.fillRect(0,0,w,h);for(const [i,t] of [[0,"J.SMOŁA"],[1,"A.SMOŁA"]]){const y=10+i*22;c.fillStyle="#fff";c.fillRect(6,y,16,12);c.fillStyle="#d8141c";c.fillRect(6,y+6,16,6);c.fillStyle="#fff";c.font="bold 15px Arial";c.textBaseline="top";c.fillText(t,28,y-1);}c.fillStyle="#3a7cff";c.font="bold 8px Arial";c.fillText("KROPEK RALLY TEAM",28,54);});
    naBok(zaloga,.42,.21,1.0,.78);
    const klub=plotno(32,32,(c,w,h)=>{c.fillStyle="#141414";c.beginPath();c.arc(16,16,15,0,7);c.fill();c.fillStyle="#e8b82a";c.beginPath();c.arc(16,16,12,0,7);c.fill();c.fillStyle="#141414";c.beginPath();c.arc(16,16,6,0,7);c.fill();});
    naBok(klub,.15,.15,.96,1.32);
    const mkt=plotno(32,48,(c,w,h)=>{c.fillStyle="#f4f4f4";c.fillRect(0,0,w,h);c.fillStyle="#111";c.font="bold 7px Arial";c.textAlign="center";c.fillText("MKT SERWIS",16,9);c.fillStyle="#888";c.fillRect(8,16,16,3);c.fillRect(8,25,16,3);c.fillRect(8,34,16,3);});
    naBok(mkt,.16,.24,.56,-.62);
    // pas ABARTH na górze przedniej szyby
    const ab=plotno(256,32,(c,w,h)=>{c.fillStyle='#0d0d0f';c.fillRect(0,0,w,h);c.fillStyle='#ffffff';c.font='bold 24px Arial Black,Arial';c.textAlign='center';c.textBaseline='middle';c.fillText('ABARTH',w/2,h/2+2);c.fillStyle='#e07a14';c.fillRect(18,9,14,14);c.fillRect(w-32,9,14,14);});
    const t=.97,px=sDol[2]+(sGora[2]-sDol[2])*t,py=sDol[1]+(sGora[1]-sDol[1])*t,kat=Math.atan2(sGora[1]-sDol[1],sGora[2]-sDol[2]);
    const pas=new THREE.Mesh(new THREE.PlaneGeometry(1.1,.17),ab);pas.position.set(0,py+.015,px);pas.rotation.x=-(Math.PI/2+kat);pas.rotation.z=Math.PI;g.add(pas);
    // chlapacze FIAT za tylnymi kołami
    const fiat=plotno(64,48,(c,w,h)=>{c.fillStyle="#2448a8";c.fillRect(0,0,w,h);c.fillStyle="#ffffff";c.font='bold 22px Arial Black,Arial';c.textAlign='center';c.textBaseline='middle';c.fillText('FIAT',w/2,h/2+2);});
    const zt=Math.max(...KM.kola.map(k=>k[2]))/1000+.33;
    for(const k of [-1,1]){const m=new THREE.Mesh(new THREE.PlaneGeometry(.28,.24),fiat);m.position.set(k*.72,.2,zt);m.rotation.y=Math.PI;g.add(m);}
  }else{
    // logo BUDMAX METAL na masce: srebrny owal z kulą w czarne pasy, czerwony napis z białą obwódką
    const owal=plotno(192,104,(c,w,h)=>{const cx=w/2,cy=h/2;
      c.fillStyle='#5a5e66';c.beginPath();c.ellipse(cx,cy,w/2-1,h/2-1,0,0,7);c.fill();                 // ciemny brzeg
      const gr=c.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#f2f3f5');gr.addColorStop(.5,'#a9adb4');gr.addColorStop(1,'#e4e6ea');
      c.fillStyle=gr;c.beginPath();c.ellipse(cx,cy,w/2-5,h/2-5,0,0,7);c.fill();                       // srebrna obręcz
      c.save();c.beginPath();c.ellipse(cx,cy,w/2-12,h/2-11,0,0,7);c.clip();
      c.fillStyle='#d9dce0';c.fillRect(0,0,w,h);c.fillStyle='#111214';
      for(let yy=14;yy<h;yy+=26)c.fillRect(0,yy,w,13);                                               // czarne pasy kuli (grube – czytelne w pikselach)
      c.strokeStyle='#c9ccd1';c.lineWidth=3;for(let k=-1;k<=1;k++){c.beginPath();c.ellipse(cx,cy,Math.abs(k)*14+1,h/2,0,0,7);c.stroke();}   // południki
      c.restore();
      c.fillStyle='#ffffff';c.fillRect(14,cy-16,w-28,32);c.font='bold 25px Arial Black,Arial';c.textAlign='center';c.textBaseline='middle';c.lineJoin='round';
      {const szer=w-40,m=c.measureText('BUDMAXMETAL').width;if(m>szer){c.save();c.translate(cx,cy+1);c.scale(szer/m,1);c.lineWidth=5;c.strokeStyle='#ffffff';c.strokeText('BUDMAXMETAL',0,0);c.fillStyle='#d8141c';c.fillText('BUDMAXMETAL',0,0);c.restore();}
       else{c.lineWidth=5;c.strokeStyle='#ffffff';c.strokeText('BUDMAXMETAL',cx,cy+1);c.fillStyle='#d8141c';c.fillText('BUDMAXMETAL',cx,cy+1);}}});   /* napis ściśnięty do szerokości pasa – mieści się cały */
    naMaske(owal,.62,.34,-1.4);
    // czarny skorpion Abarth (pionowy, ogon zawinięty u góry, szczypce na dole) na tylnym błotniku za drzwiami, wg zdjęć
    const skorp=plotno(96,128,(c,w,h)=>{c.fillStyle=c.strokeStyle='#101010';c.lineCap='round';c.lineJoin='round';
      c.beginPath();c.ellipse(46,74,12,20,0,0,7);c.fill();
      c.beginPath();c.ellipse(46,98,9,7,0,0,7);c.fill();
      [[46,54],[49,42],[56,31],[66,23],[77,20],[86,25],[88,35]].forEach(([x,y],i)=>{c.beginPath();c.arc(x,y,7-i*.5,0,7);c.fill();});
      c.beginPath();c.moveTo(86,38);c.lineTo(80,50);c.lineTo(92,44);c.fill();
      c.lineWidth=4;for(const sd of [-1,1]){c.beginPath();c.moveTo(46+sd*6,102);c.lineTo(46+sd*16,112);c.lineTo(46+sd*13,122);c.stroke();
        c.beginPath();c.ellipse(46+sd*13,123,5,4,0,0,7);c.fill();
        for(let k=0;k<3;k++){c.beginPath();c.moveTo(46+sd*10,66+k*9);c.lineTo(46+sd*24,60+k*12);c.lineTo(46+sd*28,70+k*12);c.stroke();}}});
    naBok(skorp,.38,.5,.62,.86);
    // czarne pasy na drzwiach z napisem Punto / ABARTH (wg zdjęcia z lewego boku)
    const pasy=plotno(256,64,(c,w,h)=>{c.fillStyle='#101010';
      c.fillRect(30,10,w-34,4);                                                     // długa cienka linia przez drzwi
      c.beginPath();c.moveTo(4,20);c.lineTo(84,20);c.lineTo(96,46);c.lineTo(16,46);c.closePath();c.fill();   // skośny blok z przodu
      c.fillStyle='#000';c.globalCompositeOperation='destination-out';for(let x=40;x<96;x+=9)c.fillRect(x,22,4,22);c.globalCompositeOperation='source-over';   // grzebień
      c.fillStyle='#101010';c.fillRect(96,40,62,3);                                  // linia pod napisem
      c.font='italic bold 30px Arial Black,Arial';c.textBaseline='alphabetic';c.fillText('Punto',150,40);
      c.font='bold 12px Arial';c.fillText('ABARTH',176,56);});
    naBok(pasy,1.0,.25,.42,.0);
    // czarna lotka na tylnej krawędzi dachu (wg zdjęć), lekko nachylona, wystaje nad tylną szybę
    {let yR=-9;VV.forEach(p=>{if(Math.abs(p[0])<.3)yR=Math.max(yR,p[1]);});let zR=-9,yK=yR;VV.forEach(p=>{if(Math.abs(p[0])<.3&&p[1]>yR-.08&&p[2]>zR){zR=p[2];yK=p[1];}});
     const MC=new THREE.MeshLambertMaterial({color:0x121214});
     const l=new THREE.Mesh(new THREE.BoxGeometry(.9,.03,.16),MC);l.position.set(0,yK+.015,zR+.03);l.rotation.x=.14;l.castShadow=true;g.add(l);
     for(const k of [-1,1]){const b=new THREE.Mesh(new THREE.BoxGeometry(.025,.05,.14),MC);b.position.set(k*.44,yK+.005,zR+.02);g.add(b);}}
    // pas w barwach Włoch na dole tylnego zderzaka (patrząc od tyłu: z lewej zielony, z prawej czerwony)
    {const zB=x=>{let z=-9;VV.forEach(p=>{if(Math.abs(p[0]-x)<.06&&Math.abs(p[1]-.2)<.05)z=Math.max(z,p[2]);});return z;};
     const N=12,X0=-.74,X1=.74;for(let i=0;i<N;i++){const xa=X0+(X1-X0)*i/N,xb=X0+(X1-X0)*(i+1)/N,za=zB(xa),zb=zB(xb);if(za<1||zb<1)continue;
       const t=(i+.5)/N,kol=t<1/3?0x1d9a3a:t<2/3?0xf4f4f4:0xd8261c;const dl=Math.hypot(xb-xa,zb-za);
       const m=new THREE.Mesh(new THREE.PlaneGeometry(dl+.004,.045),new THREE.MeshLambertMaterial({color:kol}));m.position.set((xa+xb)/2,.2,(za+zb)/2+.012);m.rotation.y=-Math.atan2(zb-za,xb-xa);g.add(m);}}
    // pas w barwach Włoch na progach
    const tri=plotno(96,8,(c,w,h)=>{c.fillStyle='#1d9a3a';c.fillRect(0,0,w/3,h);c.fillStyle='#ffffff';c.fillRect(w/3,0,w/3,h);c.fillStyle='#d8261c';c.fillRect(2*w/3,0,w/3,h);});
    naBok(tri,1.75,.1,.2,.12);   // pas na samym progu
  }
  scene.add(g);return g;}
