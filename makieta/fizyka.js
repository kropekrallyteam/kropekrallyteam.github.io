// Fizyka Kropka – WSPÓLNA dla gry i pośrednika (Google Apps Script).
// Bez biblioteki 3D i bez strony (DOM): ten sam plik liczy przejazd w przeglądarce i na serwerze,
// więc te same klawisze (powtórka) dają dokładnie ten sam czas.
// Uwaga: każda zmiana, która wpływa na czas przejazdu, wymaga podniesienia KRT_FIZYKA_WERSJA.
var KRT_FIZYKA_WERSJA = 2;
var KRT_DT = 1 / 60;
var KRT_P = Object.freeze({vmax:160,przysp:6.48,hamulec:19,skret:2.5,przyczep:7.0,przyczepDrift:1.9,przyczepReczny:0.9,progDriftu:0.22,odzysk:0.3,pobocze:1.2,bandaStrata:0.15});

// T – dane trasy (np. TRASA_BRZYSKA_2026), zd – zdarzenia dla gry (dźwięk, komunikaty); pośrednik może ich nie podawać
function KRT_SYMULACJA(T, zd) {
  zd = zd || {};
  var P = KRT_P, DT = KRT_DT;
  var N = T.N, DS = T.DS, START_I = T.START_I, META_I = T.META_I, IB = T.IB, CH_I = T.CH_I, SZ_ODST = T.SZ_ODST, SZ_GLEB = T.SZ_GLEB, RD0 = T.RD0, MOST_POL = T.MOST_POL, MOST_ZWEZ = T.MOST_ZWEZ, IB2 = T.IB2 == null ? -1 : T.IB2, H2 = T.H2 || 0, TRAWA = T.trawa == null ? 0.7 : T.trawa, SYF = T.syf || [], SYF_G = T.syfG || 0.8, PODB = T.podbicia || [], SZ_ODWR = T.SZ_ODWR ? -1 : 1, SZ0 = T.szer ? T.szer[0] : 1, SZ1 = T.szer ? T.szer[1] : 0.5;   // SYF: [[od_i,do_i,strona]] żwir po wewnętrznej (przyczepność -10%); SZ_ODWR: szykana z pierwszymi oponami po prawej   // TRAWA: przyczepność boczna na trawie (domyślnie 0,7 jak na poboczu; zawody – ślisko)   // IB2/H2: opcjonalna druga, delikatna hopka (trasy bez niej – bez zmian)
  var PX = T.px, PZ = T.pz, DX = T.dx, DZ = T.dz;
  // normalne drogi liczone jak w grze (wektor (-dz,0,dx) znormalizowany)
  var NX = new Array(N + 1), NZ = new Array(N + 1);
  for (var i = 0; i <= N; i++) { var x = -DZ[i], z = DX[i]; var L = Math.sqrt(x * x + 0 * 0 + z * z) || 1; var k = 1 / L; NX[i] = x * k; NZ[i] = z * k; }
  function wDrogi(i) { var t = Math.max(0, Math.min(1, (i - START_I) / (META_I - START_I))); return RD0 * (SZ0 + (SZ1 - SZ0) * t); }   // szerokość: SZ0 na starcie, SZ1 na mecie (domyślnie 1 i 0,5)
  function hy(i) { var d = (i - IB) * DS, H = 1.0, y = 0; if (d > -10 && d < 8) y = d < 0 ? H * (d + 10) / 10 : H * (1 - d / 8);
    if (IB2 >= 0) { var e = (i - IB2) * DS; if (e > -12 && e < 9) y += e < 0 ? H2 * (e + 12) / 12 : H2 * (1 - e / 9); }
    for (var b = 0; b < PODB.length; b++) { var f = (i - PODB[b]) * DS; if (f > -3 && f < 3) y += 0.15 * (1 - Math.abs(f) / 3); }   // krótkie podbicia 15 cm z akcelerometru GoPro
    return y; }
  function ev(n, a) { if (zd[n]) zd[n](a); }

  var S = {
    stan: 'menu', czas: 0, kara: 0, meta: false,
    A: {x:0,z:0,y:0,h:0,vx:0,vz:0,vy:0,skretW:0,dryf:false,poslizg:0,idx:0,wPowietrzu:false,lastGy:0,lastVyG:0,blokHopy:0,droga:0,we:null},
    START: {faza:'czeka', t:0, trzymaj:false, falstart:false},
    trafione: new Set(),
    SEP: T.separatory.map(function (s) { return {x:s[0], z:s[1], t:-9}; }),
    ost: {v:0, fx:0, fz:0, rx:0, rz:0, we:null},   // dane ostatniego kroku – dla efektów w grze (ślady, kurz)
    wDrogi: wDrogi, hy: hy, NX: NX, NZ: NZ
  };
  var A = S.A, START = S.START;

  S.nowyPrzejazd = function () {
    var i = START_I - 5;
    A.x = PX[i]; A.z = PZ[i]; A.y = 0; A.h = Math.atan2(-DX[i], -DZ[i]); A.vx = A.vz = A.vy = 0; A.skretW = 0; A.dryf = false; A.poslizg = 0; A.idx = i; A.wPowietrzu = false; A.lastGy = 0; A.lastVyG = 0; A.blokHopy = 0; A.droga = 0; A.we = null;
    S.czas = 0; S.kara = 0; S.trafione.clear(); for (var j = 0; j < S.SEP.length; j++) S.SEP[j].t = -9;
    START.faza = 'czeka'; START.t = 0; START.trzymaj = false; START.falstart = false; S.meta = false; S.stan = 'odliczanie';
  };

  // procedura startu: ręczny → 5 czerwonych co 1 s → zielone po 6 s; puszczenie ręcznego z gazem przed zielonym = falstart (+10 s)
  S.startKrok = function (we) {
    if (S.stan !== 'odliczanie') return;
    if (START.faza === 'czeka') { if (we.reczny) { START.faza = 'swiatla'; START.t = 0; } return; }
    START.t += DT;
    if (!we.reczny && we.gaz) { START.falstart = true; S.kara += 10; S.stan = 'jazda'; S.czas = 0; START.trzymaj = false; ev('falstart'); }
    else if (START.t >= 6) { S.stan = 'jazda'; S.czas = 0; START.trzymaj = we.reczny; ev('zielone'); }
  };

  S.krok = function (WE) {
    if (S.stan === 'odliczanie' || (S.stan === 'jazda' && START.trzymaj)) {
      A.vx = A.vz = 0; if (START.trzymaj && !WE.reczny) START.trzymaj = false;
      if (S.stan === 'jazda') S.czas += DT;   // czas biegnie od zapalenia zielonego, także gdy kierowca jeszcze trzyma ręczny
      return;
    }
    // po mecie sterowanie dalej z wejścia (gra podaje dojazd do mety STOP); wynik i powtórka kończą się na linii mety
    var we = (S.stan === 'jazda' || S.stan === 'meta') ? WE : {gaz:false, ham:true, skret:0, reczny:false}; A.we = we;
    var vmax = P.vmax / 3.6;
    A.skretW += Math.max(-DT * 7, Math.min(DT * 7, we.skret - A.skretW));
    var fx = -Math.sin(A.h), fz = -Math.cos(A.h), rx = -fz, rz = fx;
    var vL = A.vx * fx + A.vz * fz, vB = A.vx * rx + A.vz * rz;
    var v = Math.hypot(A.vx, A.vz);
    var si = A.idx; var off = (A.x - PX[si]) * NX[si] + (A.z - PZ[si]) * NZ[si]; var poza = Math.abs(off) > wDrogi(A.idx) / 2 + 0.8, trawa = Math.abs(off) > wDrogi(A.idx) / 2 + 2.2;
    if (!A.wPowietrzu) {
      var ks = Math.min(1, v / 7) * (1 - 0.35 * Math.min(1, v / vmax)) * (we.reczny ? 1.35 : 1) * (A.dryf ? 1.15 : 1);
      A.h += A.skretW * P.skret * ks * DT * (vL < -0.5 ? -1 : 1);
      if (we.gaz) vL += P.przysp * Math.max(0, 1 - Math.max(0, vL) / vmax) * (poza ? 0.6 : 1) * DT;
      if (we.ham) { if (vL > 0.3) vL -= P.hamulec * DT; else if (S.stan === 'jazda') vL = Math.max(-8, vL - 5 * DT); else vL = 0; }
      if (!we.gaz && !we.ham) vL *= 1 - 0.25 * DT;
      if (!we.gaz) vL *= 1 - 0.012 * DT * Math.abs(vL) / 10;
      if (poza) { var kp = P.pobocze / 1.2, vlim = (trawa ? 45 : 80) / 3.6, dec = (trawa ? 9 : 4.5) * kp; if (Math.abs(vL) > vlim) vL -= Math.sign(vL) * Math.min(Math.abs(vL) - vlim, dec * 1.6 * DT); vL -= Math.sign(vL) * Math.min(Math.abs(vL), dec * 0.35 * DT); }
      A.poslizg = Math.atan2(vB, Math.max(1, Math.abs(vL)));
      if (Math.abs(A.poslizg) > P.progDriftu || we.reczny) A.dryf = v > 6; else if (Math.abs(A.poslizg) < 0.07) A.dryf = false;
      var g = we.reczny ? P.przyczepReczny : A.dryf ? P.przyczepDrift : P.przyczep;
      if (A.dryf && A.skretW * Math.sign(-vB) > 0.3) g *= 1.6;
      if (A.dryf && we.gaz) g *= 0.85;
      if (poza) g *= trawa ? TRAWA : 0.7;
      // żwir od pobocza: zewnętrzne ~60% wewnętrznej połowy drogi; przyczepność ×0,8 (−20%)
      for (var q = 0; q < SYF.length; q++) { if (A.idx >= SYF[q][0] && A.idx <= SYF[q][1] && off * SYF[q][2] > wDrogi(A.idx) * 0.2) { g *= SYF_G; break; } }
      var vB2 = vB * Math.exp(-g * DT); var vPrzed = Math.hypot(vL, vB); vL += Math.sign(vL || 1) * Math.abs(vB - vB2) * P.odzysk; vB = vB2;
      var vPo = Math.hypot(vL, vB); if (vPo > vPrzed && vPo > 0.01) { var kk = vPrzed / vPo; vL *= kk; vB *= kk; }
      if (A.dryf || we.reczny) vL *= 1 - Math.min(0.6, Math.abs(A.poslizg)) * 0.45 * DT;
      A.vx = fx * vL + rx * vB; A.vz = fz * vL + rz * vB;
    }
    A.x += A.vx * DT; A.z += A.vz * DT; A.droga = (A.droga || 0) + (A.vx * (-Math.sin(A.h)) + A.vz * (-Math.cos(A.h))) * DT;
    // śledzenie najbliższej próbki trasy
    var b = A.idx, bd = 1e9; for (var i2 = Math.max(0, A.idx - 30); i2 <= Math.min(N, A.idx + 60); i2++) { var d = (PX[i2] - A.x) ** 2 + (PZ[i2] - A.z) ** 2; if (d < bd) { bd = d; b = i2; } } A.idx = b;
    // banda (opony / rów)
    var s2 = A.idx; var off2 = (A.x - PX[s2]) * NX[s2] + (A.z - PZ[s2]) * NZ[s2]; var GR = wDrogi(A.idx) / 2 + 3.2;
    if (Math.abs(off2) > GR) { var sg = Math.sign(off2); A.x -= NX[s2] * (off2 - sg * GR); A.z -= NZ[s2] * (off2 - sg * GR); var vn = A.vx * NX[s2] + A.vz * NZ[s2]; if (vn * sg > 0) { ev('uderzenie', Math.abs(vn)); A.vx -= NX[s2] * vn * 1.3; A.vz -= NZ[s2] * vn * 1.3; var kb = 1 - P.bandaStrata; A.vx *= kb; A.vz *= kb; } }
    // zwężenie na mostku
    var dm = Math.abs(A.idx - IB) * DS;
    if (dm < MOST_POL + 7) { var sc = dm <= MOST_POL ? MOST_ZWEZ : MOST_ZWEZ + (wDrogi(IB) / 2 + 0.3 - MOST_ZWEZ) * (dm - MOST_POL) / 7; var GW = sc - 0.85; var sm = A.idx; var om = (A.x - PX[sm]) * NX[sm] + (A.z - PZ[sm]) * NZ[sm];
      if (Math.abs(om) > GW) { var sgm = Math.sign(om); A.x -= NX[sm] * (om - sgm * GW); A.z -= NZ[sm] * (om - sgm * GW); var vnm = A.vx * NX[sm] + A.vz * NZ[sm]; if (vnm * sgm > 0) { ev('uderzenie', Math.abs(vnm)); A.vx -= NX[sm] * vnm * 1.3; A.vz -= NZ[sm] * vnm * 1.3; var km = 1 - P.bandaStrata; A.vx *= km; A.vz *= km; } } }
    // separatory i opony: spowalniają i delikatnie odbijają (raz na 0,5 s dla danej przeszkody)
    for (var j = 0; j < S.SEP.length; j++) { var sp = S.SEP[j]; var ddx = A.x - sp.x, ddz = A.z - sp.z; if (Math.abs(ddx) > 1.6 || Math.abs(ddz) > 1.6) continue; var dd = Math.hypot(ddx, ddz);
      if (dd < 1.15 && S.czas - sp.t > 0.5) { sp.t = S.czas; var nx = ddx / (dd || 1), nz = ddz / (dd || 1); var vv = Math.hypot(A.vx, A.vz);
        A.vx = A.vx * 0.88 + nx * Math.min(2.5, vv * 0.08); A.vz = A.vz * 0.88 + nz * Math.min(2.5, vv * 0.08); ev('uderzenie', Math.max(2, vv * 0.3)); } }
    // szykana: bramki z opon zajmujące pół drogi (+5 s za każdą trafioną)
    for (var gk = -1; gk <= 1; gk++) { var gi = CH_I + gk * SZ_ODST; if (Math.abs(A.idx - gi) * DS > 1.3) continue; var sgs = (gk === 0 ? 1 : -1) * SZ_ODWR; var o = (A.x - PX[gi]) * NX[gi] + (A.z - PZ[gi]) * NZ[gi]; var kraw = wDrogi(gi) / 2 - wDrogi(gi) * SZ_GLEB - 0.2 - 0.9;
      if (o * sgs > kraw) { if (S.stan === 'jazda' && !S.trafione.has(gi)) { S.trafione.add(gi); S.kara += 5; ev('szykana'); } A.x -= NX[gi] * (o - sgs * kraw); A.z -= NZ[gi] * (o - sgs * kraw); var vns = A.vx * NX[gi] + A.vz * NZ[gi]; if (vns * sgs > 0) { ev('uderzenie', Math.abs(vns) + 3); A.vx -= NX[gi] * vns; A.vz -= NZ[gi] * vns; } A.vx *= 0.985; A.vz *= 0.985; } }
    // wysokość: garb mostka = hopa
    var s0 = A.idx, fIdx = A.idx + ((A.x - PX[s0]) * DX[s0] + (A.z - PZ[s0]) * DZ[s0]) / DS;
    var gy = hy(fIdx), vyG = (gy - A.lastGy) / DT;
    if (A.wPowietrzu) { A.vy -= 9.81 * DT; A.y += A.vy * DT; if (A.y <= gy) { A.y = gy; A.wPowietrzu = false; A.vx *= 0.97; A.vz *= 0.97; } }
    else { A.blokHopy = Math.max(0, (A.blokHopy || 0) - DT); if (!A.blokHopy && A.lastVyG > 0.8 && vyG < A.lastVyG - 1.2 && v > 12) { A.wPowietrzu = true; A.blokHopy = 1.0; A.vy = A.lastVyG * 1.0; A.y = gy; } else A.y = gy; }
    A.lastGy = gy; A.lastVyG = vyG;
    S.ost.v = v; S.ost.fx = fx; S.ost.fz = fz; S.ost.rx = rx; S.ost.rz = rz; S.ost.we = we;
    // czas i meta
    if (S.stan === 'jazda') { S.czas += DT; if (A.idx >= META_I && !S.meta) { S.meta = true; S.stan = 'meta'; ev('meta'); } }
  };

  // przeliczenie całego przejazdu z powtórki: z = [[nr kroku, bity gaz1/ham2/ręczny4, skręt], ...]
  S.odtworz = function (z, maxKrokow) {
    maxKrokow = maxKrokow || 60 * 600;
    S.nowyPrzejazd(); var i = 0, k = 0, we = {gaz:false, ham:false, skret:0, reczny:false};
    for (k = 0; k < maxKrokow; k++) {
      while (i < z.length && z[i][0] <= k) { we = {gaz:!!(z[i][1] & 1), ham:!!(z[i][1] & 2), reczny:!!(z[i][1] & 4), skret:z[i][2]}; i++; }
      S.startKrok(we); S.krok(we); if (S.meta) break;
    }
    return {meta:S.meta, czas:S.czas, kara:S.kara, razem:S.czas + S.kara, krokow:k + 1, x:A.x, z:A.z, h:A.h, wersja:KRT_FIZYKA_WERSJA};
  };
  return S;
}
