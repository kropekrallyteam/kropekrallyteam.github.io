// Sprawdzanie nicku gracza – WSPÓLNE dla gry i pośrednika (Google Apps Script), bez strony (DOM).
// Gra sprawdza nick przy wpisywaniu, pośrednik sprawdza go jeszcze raz przy zgłoszeniu przejazdu.
var KRT_NICK_MIN = 3, KRT_NICK_MAX = 16;

// rdzenie słów niedozwolonych (sprawdzane po sprowadzeniu nicku do małych liter bez ogonków, cyfr-zamienników i separatorów)
var KRT_NICK_ZAKAZANE = ['kurw', 'kurew', 'chuj', 'huj', 'pizd', 'jeb', 'pierdol', 'pierdal', 'cipa', 'cipk', 'cipe', 'kutas', 'fiut', 'dziwk', 'szmat',
  'pedal', 'pedzi', 'ciot', 'cwel', 'sukinsyn', 'skurw', 'dupa', 'dupe', 'dupk', 'gowno', 'gowna', 'srac', 'sraj', 'zasra', 'debil', 'kretyn', 'idiot',
  'fuck', 'shit', 'bitch', 'cunt', 'dick', 'nigg', 'whore', 'porn', 'penis', 'vagin', 'hitler', 'nazi', 'admin', 'moderator'];

// nick nie rozróżnia małych i wielkich liter: zawsze zapisywany WIELKIMI (ten sam nick = ten sam gracz bez względu na wielkość liter)
function KRT_NICK_NORMUJ(n) { return String(n == null ? '' : n).replace(/\s+/g, ' ').trim().toUpperCase(); }

function KRT_NICK_WULGARNY(n) {
  var s = String(n).toLowerCase();
  var ogonki = {'ą':'a','ć':'c','ę':'e','ł':'l','ń':'n','ó':'o','ś':'s','ź':'z','ż':'z'};
  var leet = {'0':'o','1':'i','3':'e','4':'a','5':'s','7':'t','8':'b','$':'s','@':'a','!':'i'};
  var w = '';
  for (var i = 0; i < s.length; i++) { var c = s[i]; c = ogonki[c] || leet[c] || c; if (c >= 'a' && c <= 'z') w += c; }   // k.u.r.w.a → kurwa
  var bezPowt = w.replace(/(.)\1+/g, '$1');                                                                                // kuuurwa → kurwa
  for (var j = 0; j < KRT_NICK_ZAKAZANE.length; j++) { var z = KRT_NICK_ZAKAZANE[j]; if (w.indexOf(z) >= 0 || bezPowt.indexOf(z) >= 0) return true; }
  return false;
}

// wynik: {ok:true, nick} albo {ok:false, blad}
function KRT_NICK_SPRAWDZ(n) {
  n = KRT_NICK_NORMUJ(n);
  if (n.length < KRT_NICK_MIN) return {ok:false, blad:'NICK MUSI MIEĆ CO NAJMNIEJ ' + KRT_NICK_MIN + ' ZNAKI'};
  if (n.length > KRT_NICK_MAX) return {ok:false, blad:'NICK JEST ZA DŁUGI (MAKS. ' + KRT_NICK_MAX + ')'};
  if (!/^[0-9A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż _.\-]+$/.test(n)) return {ok:false, blad:'DOZWOLONE: LITERY, CYFRY, SPACJA, _ - .'};
  if (!/[A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż]/.test(n)) return {ok:false, blad:'NICK MUSI ZAWIERAĆ LITERĘ'};
  if (KRT_NICK_WULGARNY(n)) return {ok:false, blad:'TEN NICK JEST NIEDOZWOLONY'};
  return {ok:true, nick:n};
}
