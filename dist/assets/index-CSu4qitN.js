(function(){const i=document.createElement("link").relList;if(i&&i.supports&&i.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))r(e);new MutationObserver(e=>{for(const n of e)if(n.type==="childList")for(const a of n.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&r(a)}).observe(document,{childList:!0,subtree:!0});function o(e){const n={};return e.integrity&&(n.integrity=e.integrity),e.referrerPolicy&&(n.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?n.credentials="include":e.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function r(e){if(e.ep)return;e.ep=!0;const n=o(e);fetch(e.href,n)}})();function mt(t){return t&&t.__esModule&&Object.prototype.hasOwnProperty.call(t,"default")?t.default:t}var Q={},x,Ie;function pt(){return Ie||(Ie=1,x=function(){return typeof Promise=="function"&&Promise.prototype&&Promise.prototype.then}),x}var ee={},U={},Me;function F(){if(Me)return U;Me=1;let t;const i=[0,26,44,70,100,134,172,196,242,292,346,404,466,532,581,655,733,815,901,991,1085,1156,1258,1364,1474,1588,1706,1828,1921,2051,2185,2323,2465,2611,2761,2876,3034,3196,3362,3532,3706];return U.getSymbolSize=function(r){if(!r)throw new Error('"version" cannot be null or undefined');if(r<1||r>40)throw new Error('"version" should be in range from 1 to 40');return r*4+17},U.getSymbolTotalCodewords=function(r){return i[r]},U.getBCHDigit=function(o){let r=0;for(;o!==0;)r++,o>>>=1;return r},U.setToSJISFunction=function(r){if(typeof r!="function")throw new Error('"toSJISFunc" is not a valid function.');t=r},U.isKanjiModeEnabled=function(){return typeof t<"u"},U.toSJIS=function(r){return t(r)},U}var te={},Ne;function Re(){return Ne||(Ne=1,(function(t){t.L={bit:1},t.M={bit:0},t.Q={bit:3},t.H={bit:2};function i(o){if(typeof o!="string")throw new Error("Param is not a string");switch(o.toLowerCase()){case"l":case"low":return t.L;case"m":case"medium":return t.M;case"q":case"quartile":return t.Q;case"h":case"high":return t.H;default:throw new Error("Unknown EC Level: "+o)}}t.isValid=function(r){return r&&typeof r.bit<"u"&&r.bit>=0&&r.bit<4},t.from=function(r,e){if(t.isValid(r))return r;try{return i(r)}catch{return e}}})(te)),te}var ne,Le;function wt(){if(Le)return ne;Le=1;function t(){this.buffer=[],this.length=0}return t.prototype={get:function(i){const o=Math.floor(i/8);return(this.buffer[o]>>>7-i%8&1)===1},put:function(i,o){for(let r=0;r<o;r++)this.putBit((i>>>o-r-1&1)===1)},getLengthInBits:function(){return this.length},putBit:function(i){const o=Math.floor(this.length/8);this.buffer.length<=o&&this.buffer.push(0),i&&(this.buffer[o]|=128>>>this.length%8),this.length++}},ne=t,ne}var re,qe;function yt(){if(qe)return re;qe=1;function t(i){if(!i||i<1)throw new Error("BitMatrix size must be defined and greater than 0");this.size=i,this.data=new Uint8Array(i*i),this.reservedBit=new Uint8Array(i*i)}return t.prototype.set=function(i,o,r,e){const n=i*this.size+o;this.data[n]=r,e&&(this.reservedBit[n]=!0)},t.prototype.get=function(i,o){return this.data[i*this.size+o]},t.prototype.xor=function(i,o,r){this.data[i*this.size+o]^=r},t.prototype.isReserved=function(i,o){return this.reservedBit[i*this.size+o]},re=t,re}var ie={},ke;function vt(){return ke||(ke=1,(function(t){const i=F().getSymbolSize;t.getRowColCoords=function(r){if(r===1)return[];const e=Math.floor(r/7)+2,n=i(r),a=n===145?26:Math.ceil((n-13)/(2*e-2))*2,c=[n-7];for(let s=1;s<e-1;s++)c[s]=c[s-1]-a;return c.push(6),c.reverse()},t.getPositions=function(r){const e=[],n=t.getRowColCoords(r),a=n.length;for(let c=0;c<a;c++)for(let s=0;s<a;s++)c===0&&s===0||c===0&&s===a-1||c===a-1&&s===0||e.push([n[c],n[s]]);return e}})(ie)),ie}var oe={},De;function bt(){if(De)return oe;De=1;const t=F().getSymbolSize,i=7;return oe.getPositions=function(r){const e=t(r);return[[0,0],[e-i,0],[0,e-i]]},oe}var ae={},Ue;function Ct(){return Ue||(Ue=1,(function(t){t.Patterns={PATTERN000:0,PATTERN001:1,PATTERN010:2,PATTERN011:3,PATTERN100:4,PATTERN101:5,PATTERN110:6,PATTERN111:7};const i={N1:3,N2:3,N3:40,N4:10};t.isValid=function(e){return e!=null&&e!==""&&!isNaN(e)&&e>=0&&e<=7},t.from=function(e){return t.isValid(e)?parseInt(e,10):void 0},t.getPenaltyN1=function(e){const n=e.size;let a=0,c=0,s=0,l=null,f=null;for(let b=0;b<n;b++){c=s=0,l=f=null;for(let g=0;g<n;g++){let u=e.get(b,g);u===l?c++:(c>=5&&(a+=i.N1+(c-5)),l=u,c=1),u=e.get(g,b),u===f?s++:(s>=5&&(a+=i.N1+(s-5)),f=u,s=1)}c>=5&&(a+=i.N1+(c-5)),s>=5&&(a+=i.N1+(s-5))}return a},t.getPenaltyN2=function(e){const n=e.size;let a=0;for(let c=0;c<n-1;c++)for(let s=0;s<n-1;s++){const l=e.get(c,s)+e.get(c,s+1)+e.get(c+1,s)+e.get(c+1,s+1);(l===4||l===0)&&a++}return a*i.N2},t.getPenaltyN3=function(e){const n=e.size;let a=0,c=0,s=0;for(let l=0;l<n;l++){c=s=0;for(let f=0;f<n;f++)c=c<<1&2047|e.get(l,f),f>=10&&(c===1488||c===93)&&a++,s=s<<1&2047|e.get(f,l),f>=10&&(s===1488||s===93)&&a++}return a*i.N3},t.getPenaltyN4=function(e){let n=0;const a=e.data.length;for(let s=0;s<a;s++)n+=e.data[s];return Math.abs(Math.ceil(n*100/a/5)-10)*i.N4};function o(r,e,n){switch(r){case t.Patterns.PATTERN000:return(e+n)%2===0;case t.Patterns.PATTERN001:return e%2===0;case t.Patterns.PATTERN010:return n%3===0;case t.Patterns.PATTERN011:return(e+n)%3===0;case t.Patterns.PATTERN100:return(Math.floor(e/2)+Math.floor(n/3))%2===0;case t.Patterns.PATTERN101:return e*n%2+e*n%3===0;case t.Patterns.PATTERN110:return(e*n%2+e*n%3)%2===0;case t.Patterns.PATTERN111:return(e*n%3+(e+n)%2)%2===0;default:throw new Error("bad maskPattern:"+r)}}t.applyMask=function(e,n){const a=n.size;for(let c=0;c<a;c++)for(let s=0;s<a;s++)n.isReserved(s,c)||n.xor(s,c,o(e,s,c))},t.getBestMask=function(e,n){const a=Object.keys(t.Patterns).length;let c=0,s=1/0;for(let l=0;l<a;l++){n(l),t.applyMask(l,e);const f=t.getPenaltyN1(e)+t.getPenaltyN2(e)+t.getPenaltyN3(e)+t.getPenaltyN4(e);t.applyMask(l,e),f<s&&(s=f,c=l)}return c}})(ae)),ae}var J={},Fe;function rt(){if(Fe)return J;Fe=1;const t=Re(),i=[1,1,1,1,1,1,1,1,1,1,2,2,1,2,2,4,1,2,4,4,2,4,4,4,2,4,6,5,2,4,6,6,2,5,8,8,4,5,8,8,4,5,8,11,4,8,10,11,4,9,12,16,4,9,16,16,6,10,12,18,6,10,17,16,6,11,16,19,6,13,18,21,7,14,21,25,8,16,20,25,8,17,23,25,9,17,23,34,9,18,25,30,10,20,27,32,12,21,29,35,12,23,34,37,12,25,34,40,13,26,35,42,14,28,38,45,15,29,40,48,16,31,43,51,17,33,45,54,18,35,48,57,19,37,51,60,19,38,53,63,20,40,56,66,21,43,59,70,22,45,62,74,24,47,65,77,25,49,68,81],o=[7,10,13,17,10,16,22,28,15,26,36,44,20,36,52,64,26,48,72,88,36,64,96,112,40,72,108,130,48,88,132,156,60,110,160,192,72,130,192,224,80,150,224,264,96,176,260,308,104,198,288,352,120,216,320,384,132,240,360,432,144,280,408,480,168,308,448,532,180,338,504,588,196,364,546,650,224,416,600,700,224,442,644,750,252,476,690,816,270,504,750,900,300,560,810,960,312,588,870,1050,336,644,952,1110,360,700,1020,1200,390,728,1050,1260,420,784,1140,1350,450,812,1200,1440,480,868,1290,1530,510,924,1350,1620,540,980,1440,1710,570,1036,1530,1800,570,1064,1590,1890,600,1120,1680,1980,630,1204,1770,2100,660,1260,1860,2220,720,1316,1950,2310,750,1372,2040,2430];return J.getBlocksCount=function(e,n){switch(n){case t.L:return i[(e-1)*4+0];case t.M:return i[(e-1)*4+1];case t.Q:return i[(e-1)*4+2];case t.H:return i[(e-1)*4+3];default:return}},J.getTotalCodewordsCount=function(e,n){switch(n){case t.L:return o[(e-1)*4+0];case t.M:return o[(e-1)*4+1];case t.Q:return o[(e-1)*4+2];case t.H:return o[(e-1)*4+3];default:return}},J}var se={},H={},$e;function Et(){if($e)return H;$e=1;const t=new Uint8Array(512),i=new Uint8Array(256);return(function(){let r=1;for(let e=0;e<255;e++)t[e]=r,i[r]=e,r<<=1,r&256&&(r^=285);for(let e=255;e<512;e++)t[e]=t[e-255]})(),H.log=function(r){if(r<1)throw new Error("log("+r+")");return i[r]},H.exp=function(r){return t[r]},H.mul=function(r,e){return r===0||e===0?0:t[i[r]+i[e]]},H}var _e;function St(){return _e||(_e=1,(function(t){const i=Et();t.mul=function(r,e){const n=new Uint8Array(r.length+e.length-1);for(let a=0;a<r.length;a++)for(let c=0;c<e.length;c++)n[a+c]^=i.mul(r[a],e[c]);return n},t.mod=function(r,e){let n=new Uint8Array(r);for(;n.length-e.length>=0;){const a=n[0];for(let s=0;s<e.length;s++)n[s]^=i.mul(e[s],a);let c=0;for(;c<n.length&&n[c]===0;)c++;n=n.slice(c)}return n},t.generateECPolynomial=function(r){let e=new Uint8Array([1]);for(let n=0;n<r;n++)e=t.mul(e,new Uint8Array([1,i.exp(n)]));return e}})(se)),se}var ce,Qe;function Rt(){if(Qe)return ce;Qe=1;const t=St();function i(o){this.genPoly=void 0,this.degree=o,this.degree&&this.initialize(this.degree)}return i.prototype.initialize=function(r){this.degree=r,this.genPoly=t.generateECPolynomial(this.degree)},i.prototype.encode=function(r){if(!this.genPoly)throw new Error("Encoder not initialized");const e=new Uint8Array(r.length+this.degree);e.set(r);const n=t.mod(e,this.genPoly),a=this.degree-n.length;if(a>0){const c=new Uint8Array(this.degree);return c.set(n,a),c}return n},ce=i,ce}var le={},ue={},de={},Oe;function it(){return Oe||(Oe=1,de.isValid=function(i){return!isNaN(i)&&i>=1&&i<=40}),de}var L={},Ve;function ot(){if(Ve)return L;Ve=1;const t="[0-9]+",i="[A-Z $%*+\\-./:]+";let o="(?:[u3000-u303F]|[u3040-u309F]|[u30A0-u30FF]|[uFF00-uFFEF]|[u4E00-u9FAF]|[u2605-u2606]|[u2190-u2195]|u203B|[u2010u2015u2018u2019u2025u2026u201Cu201Du2225u2260]|[u0391-u0451]|[u00A7u00A8u00B1u00B4u00D7u00F7])+";o=o.replace(/u/g,"\\u");const r="(?:(?![A-Z0-9 $%*+\\-./:]|"+o+`)(?:.|[\r
]))+`;L.KANJI=new RegExp(o,"g"),L.BYTE_KANJI=new RegExp("[^A-Z0-9 $%*+\\-./:]+","g"),L.BYTE=new RegExp(r,"g"),L.NUMERIC=new RegExp(t,"g"),L.ALPHANUMERIC=new RegExp(i,"g");const e=new RegExp("^"+o+"$"),n=new RegExp("^"+t+"$"),a=new RegExp("^[A-Z0-9 $%*+\\-./:]+$");return L.testKanji=function(s){return e.test(s)},L.testNumeric=function(s){return n.test(s)},L.testAlphanumeric=function(s){return a.test(s)},L}var ze;function $(){return ze||(ze=1,(function(t){const i=it(),o=ot();t.NUMERIC={id:"Numeric",bit:1,ccBits:[10,12,14]},t.ALPHANUMERIC={id:"Alphanumeric",bit:2,ccBits:[9,11,13]},t.BYTE={id:"Byte",bit:4,ccBits:[8,16,16]},t.KANJI={id:"Kanji",bit:8,ccBits:[8,10,12]},t.MIXED={bit:-1},t.getCharCountIndicator=function(n,a){if(!n.ccBits)throw new Error("Invalid mode: "+n);if(!i.isValid(a))throw new Error("Invalid version: "+a);return a>=1&&a<10?n.ccBits[0]:a<27?n.ccBits[1]:n.ccBits[2]},t.getBestModeForData=function(n){return o.testNumeric(n)?t.NUMERIC:o.testAlphanumeric(n)?t.ALPHANUMERIC:o.testKanji(n)?t.KANJI:t.BYTE},t.toString=function(n){if(n&&n.id)return n.id;throw new Error("Invalid mode")},t.isValid=function(n){return n&&n.bit&&n.ccBits};function r(e){if(typeof e!="string")throw new Error("Param is not a string");switch(e.toLowerCase()){case"numeric":return t.NUMERIC;case"alphanumeric":return t.ALPHANUMERIC;case"kanji":return t.KANJI;case"byte":return t.BYTE;default:throw new Error("Unknown mode: "+e)}}t.from=function(n,a){if(t.isValid(n))return n;try{return r(n)}catch{return a}}})(ue)),ue}var He;function At(){return He||(He=1,(function(t){const i=F(),o=rt(),r=Re(),e=$(),n=it(),a=7973,c=i.getBCHDigit(a);function s(g,u,B){for(let T=1;T<=40;T++)if(u<=t.getCapacity(T,B,g))return T}function l(g,u){return e.getCharCountIndicator(g,u)+4}function f(g,u){let B=0;return g.forEach(function(T){const M=l(T.mode,u);B+=M+T.getBitsLength()}),B}function b(g,u){for(let B=1;B<=40;B++)if(f(g,B)<=t.getCapacity(B,u,e.MIXED))return B}t.from=function(u,B){return n.isValid(u)?parseInt(u,10):B},t.getCapacity=function(u,B,T){if(!n.isValid(u))throw new Error("Invalid QR Code version");typeof T>"u"&&(T=e.BYTE);const M=i.getSymbolTotalCodewords(u),S=o.getTotalCodewordsCount(u,B),I=(M-S)*8;if(T===e.MIXED)return I;const R=I-l(T,u);switch(T){case e.NUMERIC:return Math.floor(R/10*3);case e.ALPHANUMERIC:return Math.floor(R/11*2);case e.KANJI:return Math.floor(R/13);case e.BYTE:default:return Math.floor(R/8)}},t.getBestVersionForData=function(u,B){let T;const M=r.from(B,r.M);if(Array.isArray(u)){if(u.length>1)return b(u,M);if(u.length===0)return 1;T=u[0]}else T=u;return s(T.mode,T.getLength(),M)},t.getEncodedBits=function(u){if(!n.isValid(u)||u<7)throw new Error("Invalid QR Code version");let B=u<<12;for(;i.getBCHDigit(B)-c>=0;)B^=a<<i.getBCHDigit(B)-c;return u<<12|B}})(le)),le}var fe={},Ke;function Bt(){if(Ke)return fe;Ke=1;const t=F(),i=1335,o=21522,r=t.getBCHDigit(i);return fe.getEncodedBits=function(n,a){const c=n.bit<<3|a;let s=c<<10;for(;t.getBCHDigit(s)-r>=0;)s^=i<<t.getBCHDigit(s)-r;return(c<<10|s)^o},fe}var he={},ge,je;function Tt(){if(je)return ge;je=1;const t=$();function i(o){this.mode=t.NUMERIC,this.data=o.toString()}return i.getBitsLength=function(r){return 10*Math.floor(r/3)+(r%3?r%3*3+1:0)},i.prototype.getLength=function(){return this.data.length},i.prototype.getBitsLength=function(){return i.getBitsLength(this.data.length)},i.prototype.write=function(r){let e,n,a;for(e=0;e+3<=this.data.length;e+=3)n=this.data.substr(e,3),a=parseInt(n,10),r.put(a,10);const c=this.data.length-e;c>0&&(n=this.data.substr(e),a=parseInt(n,10),r.put(a,c*3+1))},ge=i,ge}var me,Je;function Pt(){if(Je)return me;Je=1;const t=$(),i=["0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"," ","$","%","*","+","-",".","/",":"];function o(r){this.mode=t.ALPHANUMERIC,this.data=r}return o.getBitsLength=function(e){return 11*Math.floor(e/2)+6*(e%2)},o.prototype.getLength=function(){return this.data.length},o.prototype.getBitsLength=function(){return o.getBitsLength(this.data.length)},o.prototype.write=function(e){let n;for(n=0;n+2<=this.data.length;n+=2){let a=i.indexOf(this.data[n])*45;a+=i.indexOf(this.data[n+1]),e.put(a,11)}this.data.length%2&&e.put(i.indexOf(this.data[n]),6)},me=o,me}var pe,Ye;function It(){if(Ye)return pe;Ye=1;const t=$();function i(o){this.mode=t.BYTE,typeof o=="string"?this.data=new TextEncoder().encode(o):this.data=new Uint8Array(o)}return i.getBitsLength=function(r){return r*8},i.prototype.getLength=function(){return this.data.length},i.prototype.getBitsLength=function(){return i.getBitsLength(this.data.length)},i.prototype.write=function(o){for(let r=0,e=this.data.length;r<e;r++)o.put(this.data[r],8)},pe=i,pe}var we,Ge;function Mt(){if(Ge)return we;Ge=1;const t=$(),i=F();function o(r){this.mode=t.KANJI,this.data=r}return o.getBitsLength=function(e){return e*13},o.prototype.getLength=function(){return this.data.length},o.prototype.getBitsLength=function(){return o.getBitsLength(this.data.length)},o.prototype.write=function(r){let e;for(e=0;e<this.data.length;e++){let n=i.toSJIS(this.data[e]);if(n>=33088&&n<=40956)n-=33088;else if(n>=57408&&n<=60351)n-=49472;else throw new Error("Invalid SJIS character: "+this.data[e]+`
Make sure your charset is UTF-8`);n=(n>>>8&255)*192+(n&255),r.put(n,13)}},we=o,we}var ye={exports:{}},We;function Nt(){return We||(We=1,(function(t){var i={single_source_shortest_paths:function(o,r,e){var n={},a={};a[r]=0;var c=i.PriorityQueue.make();c.push(r,0);for(var s,l,f,b,g,u,B,T,M;!c.empty();){s=c.pop(),l=s.value,b=s.cost,g=o[l]||{};for(f in g)g.hasOwnProperty(f)&&(u=g[f],B=b+u,T=a[f],M=typeof a[f]>"u",(M||T>B)&&(a[f]=B,c.push(f,B),n[f]=l))}if(typeof e<"u"&&typeof a[e]>"u"){var S=["Could not find a path from ",r," to ",e,"."].join("");throw new Error(S)}return n},extract_shortest_path_from_predecessor_list:function(o,r){for(var e=[],n=r;n;)e.push(n),o[n],n=o[n];return e.reverse(),e},find_path:function(o,r,e){var n=i.single_source_shortest_paths(o,r,e);return i.extract_shortest_path_from_predecessor_list(n,e)},PriorityQueue:{make:function(o){var r=i.PriorityQueue,e={},n;o=o||{};for(n in r)r.hasOwnProperty(n)&&(e[n]=r[n]);return e.queue=[],e.sorter=o.sorter||r.default_sorter,e},default_sorter:function(o,r){return o.cost-r.cost},push:function(o,r){var e={value:o,cost:r};this.queue.push(e),this.queue.sort(this.sorter)},pop:function(){return this.queue.shift()},empty:function(){return this.queue.length===0}}};t.exports=i})(ye)),ye.exports}var Ze;function Lt(){return Ze||(Ze=1,(function(t){const i=$(),o=Tt(),r=Pt(),e=It(),n=Mt(),a=ot(),c=F(),s=Nt();function l(S){return unescape(encodeURIComponent(S)).length}function f(S,I,R){const C=[];let N;for(;(N=S.exec(R))!==null;)C.push({data:N[0],index:N.index,mode:I,length:N[0].length});return C}function b(S){const I=f(a.NUMERIC,i.NUMERIC,S),R=f(a.ALPHANUMERIC,i.ALPHANUMERIC,S);let C,N;return c.isKanjiModeEnabled()?(C=f(a.BYTE,i.BYTE,S),N=f(a.KANJI,i.KANJI,S)):(C=f(a.BYTE_KANJI,i.BYTE,S),N=[]),I.concat(R,C,N).sort(function(y,w){return y.index-w.index}).map(function(y){return{data:y.data,mode:y.mode,length:y.length}})}function g(S,I){switch(I){case i.NUMERIC:return o.getBitsLength(S);case i.ALPHANUMERIC:return r.getBitsLength(S);case i.KANJI:return n.getBitsLength(S);case i.BYTE:return e.getBitsLength(S)}}function u(S){return S.reduce(function(I,R){const C=I.length-1>=0?I[I.length-1]:null;return C&&C.mode===R.mode?(I[I.length-1].data+=R.data,I):(I.push(R),I)},[])}function B(S){const I=[];for(let R=0;R<S.length;R++){const C=S[R];switch(C.mode){case i.NUMERIC:I.push([C,{data:C.data,mode:i.ALPHANUMERIC,length:C.length},{data:C.data,mode:i.BYTE,length:C.length}]);break;case i.ALPHANUMERIC:I.push([C,{data:C.data,mode:i.BYTE,length:C.length}]);break;case i.KANJI:I.push([C,{data:C.data,mode:i.BYTE,length:l(C.data)}]);break;case i.BYTE:I.push([{data:C.data,mode:i.BYTE,length:l(C.data)}])}}return I}function T(S,I){const R={},C={start:{}};let N=["start"];for(let h=0;h<S.length;h++){const y=S[h],w=[];for(let d=0;d<y.length;d++){const E=y[d],m=""+h+d;w.push(m),R[m]={node:E,lastCount:0},C[m]={};for(let v=0;v<N.length;v++){const p=N[v];R[p]&&R[p].node.mode===E.mode?(C[p][m]=g(R[p].lastCount+E.length,E.mode)-g(R[p].lastCount,E.mode),R[p].lastCount+=E.length):(R[p]&&(R[p].lastCount=E.length),C[p][m]=g(E.length,E.mode)+4+i.getCharCountIndicator(E.mode,I))}}N=w}for(let h=0;h<N.length;h++)C[N[h]].end=0;return{map:C,table:R}}function M(S,I){let R;const C=i.getBestModeForData(S);if(R=i.from(I,C),R!==i.BYTE&&R.bit<C.bit)throw new Error('"'+S+'" cannot be encoded with mode '+i.toString(R)+`.
 Suggested mode is: `+i.toString(C));switch(R===i.KANJI&&!c.isKanjiModeEnabled()&&(R=i.BYTE),R){case i.NUMERIC:return new o(S);case i.ALPHANUMERIC:return new r(S);case i.KANJI:return new n(S);case i.BYTE:return new e(S)}}t.fromArray=function(I){return I.reduce(function(R,C){return typeof C=="string"?R.push(M(C,null)):C.data&&R.push(M(C.data,C.mode)),R},[])},t.fromString=function(I,R){const C=b(I,c.isKanjiModeEnabled()),N=B(C),h=T(N,R),y=s.find_path(h.map,"start","end"),w=[];for(let d=1;d<y.length-1;d++)w.push(h.table[y[d]].node);return t.fromArray(u(w))},t.rawSplit=function(I){return t.fromArray(b(I,c.isKanjiModeEnabled()))}})(he)),he}var Xe;function qt(){if(Xe)return ee;Xe=1;const t=F(),i=Re(),o=wt(),r=yt(),e=vt(),n=bt(),a=Ct(),c=rt(),s=Rt(),l=At(),f=Bt(),b=$(),g=Lt();function u(h,y){const w=h.size,d=n.getPositions(y);for(let E=0;E<d.length;E++){const m=d[E][0],v=d[E][1];for(let p=-1;p<=7;p++)if(!(m+p<=-1||w<=m+p))for(let A=-1;A<=7;A++)v+A<=-1||w<=v+A||(p>=0&&p<=6&&(A===0||A===6)||A>=0&&A<=6&&(p===0||p===6)||p>=2&&p<=4&&A>=2&&A<=4?h.set(m+p,v+A,!0,!0):h.set(m+p,v+A,!1,!0))}}function B(h){const y=h.size;for(let w=8;w<y-8;w++){const d=w%2===0;h.set(w,6,d,!0),h.set(6,w,d,!0)}}function T(h,y){const w=e.getPositions(y);for(let d=0;d<w.length;d++){const E=w[d][0],m=w[d][1];for(let v=-2;v<=2;v++)for(let p=-2;p<=2;p++)v===-2||v===2||p===-2||p===2||v===0&&p===0?h.set(E+v,m+p,!0,!0):h.set(E+v,m+p,!1,!0)}}function M(h,y){const w=h.size,d=l.getEncodedBits(y);let E,m,v;for(let p=0;p<18;p++)E=Math.floor(p/3),m=p%3+w-8-3,v=(d>>p&1)===1,h.set(E,m,v,!0),h.set(m,E,v,!0)}function S(h,y,w){const d=h.size,E=f.getEncodedBits(y,w);let m,v;for(m=0;m<15;m++)v=(E>>m&1)===1,m<6?h.set(m,8,v,!0):m<8?h.set(m+1,8,v,!0):h.set(d-15+m,8,v,!0),m<8?h.set(8,d-m-1,v,!0):m<9?h.set(8,15-m-1+1,v,!0):h.set(8,15-m-1,v,!0);h.set(d-8,8,1,!0)}function I(h,y){const w=h.size;let d=-1,E=w-1,m=7,v=0;for(let p=w-1;p>0;p-=2)for(p===6&&p--;;){for(let A=0;A<2;A++)if(!h.isReserved(E,p-A)){let D=!1;v<y.length&&(D=(y[v]>>>m&1)===1),h.set(E,p-A,D),m--,m===-1&&(v++,m=7)}if(E+=d,E<0||w<=E){E-=d,d=-d;break}}}function R(h,y,w){const d=new o;w.forEach(function(A){d.put(A.mode.bit,4),d.put(A.getLength(),b.getCharCountIndicator(A.mode,h)),A.write(d)});const E=t.getSymbolTotalCodewords(h),m=c.getTotalCodewordsCount(h,y),v=(E-m)*8;for(d.getLengthInBits()+4<=v&&d.put(0,4);d.getLengthInBits()%8!==0;)d.putBit(0);const p=(v-d.getLengthInBits())/8;for(let A=0;A<p;A++)d.put(A%2?17:236,8);return C(d,h,y)}function C(h,y,w){const d=t.getSymbolTotalCodewords(y),E=c.getTotalCodewordsCount(y,w),m=d-E,v=c.getBlocksCount(y,w),p=d%v,A=v-p,D=Math.floor(d/v),z=Math.floor(m/v),ft=z+1,Be=D-z,ht=new s(Be);let G=0;const j=new Array(v),Te=new Array(v);let W=0;const gt=new Uint8Array(h.buffer);for(let _=0;_<v;_++){const X=_<A?z:ft;j[_]=gt.slice(G,G+X),Te[_]=ht.encode(j[_]),G+=X,W=Math.max(W,X)}const Z=new Uint8Array(d);let Pe=0,q,k;for(q=0;q<W;q++)for(k=0;k<v;k++)q<j[k].length&&(Z[Pe++]=j[k][q]);for(q=0;q<Be;q++)for(k=0;k<v;k++)Z[Pe++]=Te[k][q];return Z}function N(h,y,w,d){let E;if(Array.isArray(h))E=g.fromArray(h);else if(typeof h=="string"){let D=y;if(!D){const z=g.rawSplit(h);D=l.getBestVersionForData(z,w)}E=g.fromString(h,D||40)}else throw new Error("Invalid data");const m=l.getBestVersionForData(E,w);if(!m)throw new Error("The amount of data is too big to be stored in a QR Code");if(!y)y=m;else if(y<m)throw new Error(`
The chosen QR Code version cannot contain this amount of data.
Minimum version required to store current data is: `+m+`.
`);const v=R(y,w,E),p=t.getSymbolSize(y),A=new r(p);return u(A,y),B(A),T(A,y),S(A,w,0),y>=7&&M(A,y),I(A,v),isNaN(d)&&(d=a.getBestMask(A,S.bind(null,A,w))),a.applyMask(d,A),S(A,w,d),{modules:A,version:y,errorCorrectionLevel:w,maskPattern:d,segments:E}}return ee.create=function(y,w){if(typeof y>"u"||y==="")throw new Error("No input text");let d=i.M,E,m;return typeof w<"u"&&(d=i.from(w.errorCorrectionLevel,i.M),E=l.from(w.version),m=a.from(w.maskPattern),w.toSJISFunc&&t.setToSJISFunction(w.toSJISFunc)),N(y,E,d,m)},ee}var ve={},be={},xe;function at(){return xe||(xe=1,(function(t){function i(o){if(typeof o=="number"&&(o=o.toString()),typeof o!="string")throw new Error("Color should be defined as hex string");let r=o.slice().replace("#","").split("");if(r.length<3||r.length===5||r.length>8)throw new Error("Invalid hex color: "+o);(r.length===3||r.length===4)&&(r=Array.prototype.concat.apply([],r.map(function(n){return[n,n]}))),r.length===6&&r.push("F","F");const e=parseInt(r.join(""),16);return{r:e>>24&255,g:e>>16&255,b:e>>8&255,a:e&255,hex:"#"+r.slice(0,6).join("")}}t.getOptions=function(r){r||(r={}),r.color||(r.color={});const e=typeof r.margin>"u"||r.margin===null||r.margin<0?4:r.margin,n=r.width&&r.width>=21?r.width:void 0,a=r.scale||4;return{width:n,scale:n?4:a,margin:e,color:{dark:i(r.color.dark||"#000000ff"),light:i(r.color.light||"#ffffffff")},type:r.type,rendererOpts:r.rendererOpts||{}}},t.getScale=function(r,e){return e.width&&e.width>=r+e.margin*2?e.width/(r+e.margin*2):e.scale},t.getImageWidth=function(r,e){const n=t.getScale(r,e);return Math.floor((r+e.margin*2)*n)},t.qrToImageData=function(r,e,n){const a=e.modules.size,c=e.modules.data,s=t.getScale(a,n),l=Math.floor((a+n.margin*2)*s),f=n.margin*s,b=[n.color.light,n.color.dark];for(let g=0;g<l;g++)for(let u=0;u<l;u++){let B=(g*l+u)*4,T=n.color.light;if(g>=f&&u>=f&&g<l-f&&u<l-f){const M=Math.floor((g-f)/s),S=Math.floor((u-f)/s);T=b[c[M*a+S]?1:0]}r[B++]=T.r,r[B++]=T.g,r[B++]=T.b,r[B]=T.a}}})(be)),be}var et;function kt(){return et||(et=1,(function(t){const i=at();function o(e,n,a){e.clearRect(0,0,n.width,n.height),n.style||(n.style={}),n.height=a,n.width=a,n.style.height=a+"px",n.style.width=a+"px"}function r(){try{return document.createElement("canvas")}catch{throw new Error("You need to specify a canvas element")}}t.render=function(n,a,c){let s=c,l=a;typeof s>"u"&&(!a||!a.getContext)&&(s=a,a=void 0),a||(l=r()),s=i.getOptions(s);const f=i.getImageWidth(n.modules.size,s),b=l.getContext("2d"),g=b.createImageData(f,f);return i.qrToImageData(g.data,n,s),o(b,l,f),b.putImageData(g,0,0),l},t.renderToDataURL=function(n,a,c){let s=c;typeof s>"u"&&(!a||!a.getContext)&&(s=a,a=void 0),s||(s={});const l=t.render(n,a,s),f=s.type||"image/png",b=s.rendererOpts||{};return l.toDataURL(f,b.quality)}})(ve)),ve}var Ce={},tt;function Dt(){if(tt)return Ce;tt=1;const t=at();function i(e,n){const a=e.a/255,c=n+'="'+e.hex+'"';return a<1?c+" "+n+'-opacity="'+a.toFixed(2).slice(1)+'"':c}function o(e,n,a){let c=e+n;return typeof a<"u"&&(c+=" "+a),c}function r(e,n,a){let c="",s=0,l=!1,f=0;for(let b=0;b<e.length;b++){const g=Math.floor(b%n),u=Math.floor(b/n);!g&&!l&&(l=!0),e[b]?(f++,b>0&&g>0&&e[b-1]||(c+=l?o("M",g+a,.5+u+a):o("m",s,0),s=0,l=!1),g+1<n&&e[b+1]||(c+=o("h",f),f=0)):s++}return c}return Ce.render=function(n,a,c){const s=t.getOptions(a),l=n.modules.size,f=n.modules.data,b=l+s.margin*2,g=s.color.light.a?"<path "+i(s.color.light,"fill")+' d="M0 0h'+b+"v"+b+'H0z"/>':"",u="<path "+i(s.color.dark,"stroke")+' d="'+r(f,l,s.margin)+'"/>',B='viewBox="0 0 '+b+" "+b+'"',M='<svg xmlns="http://www.w3.org/2000/svg" '+(s.width?'width="'+s.width+'" height="'+s.width+'" ':"")+B+' shape-rendering="crispEdges">'+g+u+`</svg>
`;return typeof c=="function"&&c(null,M),M},Ce}var nt;function Ut(){if(nt)return Q;nt=1;const t=pt(),i=qt(),o=kt(),r=Dt();function e(n,a,c,s,l){const f=[].slice.call(arguments,1),b=f.length,g=typeof f[b-1]=="function";if(!g&&!t())throw new Error("Callback required as last argument");if(g){if(b<2)throw new Error("Too few arguments provided");b===2?(l=c,c=a,a=s=void 0):b===3&&(a.getContext&&typeof l>"u"?(l=s,s=void 0):(l=s,s=c,c=a,a=void 0))}else{if(b<1)throw new Error("Too few arguments provided");return b===1?(c=a,a=s=void 0):b===2&&!a.getContext&&(s=c,c=a,a=void 0),new Promise(function(u,B){try{const T=i.create(c,s);u(n(T,a,s))}catch(T){B(T)}})}try{const u=i.create(c,s);l(null,n(u,a,s))}catch(u){l(u)}}return Q.create=i.create,Q.toCanvas=e.bind(null,o.render),Q.toDataURL=e.bind(null,o.renderToDataURL),Q.toString=e.bind(null,function(n,a,c){return r.render(n,c)}),Q}var Ft=Ut();const $t=mt(Ft),Y={breakfast:{label:"Breakfast Menu",badge:"6:30 AM - 10:30 AM",title:"Millenium Aqeeq Breakfast",subtitle:"Fresh bakery, Arabic coffee, eggs, fruit bowls, and morning specials.",items:[["Arabic Breakfast Platter","SAR 42"],["Omelette Station","SAR 28"],["Date Pancakes","SAR 24"],["Fresh Juice Flight","SAR 18"]],accent:"#0f766e"},lunch:{label:"Lunch Menu",badge:"12:30 PM - 4:00 PM",title:"Lunch Dining",subtitle:"Rice dishes, grilled mains, salads, soups, and chef recommendations.",items:[["Chicken Kabsa","SAR 48"],["Mixed Grill","SAR 64"],["Lentil Soup","SAR 20"],["Fattoush Salad","SAR 22"]],accent:"#b45309"},roomService:{label:"Room Service",badge:"24 hours",title:"In-Room Dining",subtitle:"Late-night meals, drinks, desserts, and comfort food delivered to the room.",items:[["Club Sandwich","SAR 38"],["Margherita Pizza","SAR 44"],["Chocolate Fondant","SAR 26"],["Mint Lemonade","SAR 16"]],accent:"#1d4ed8"}},K={qrId:"MAH-TABLE-12",tableName:"Table 12",destination:"breakfast",active:!0,announcement:"Welcome. Scan, browse the menu, and place your order with the waiter.",scans:0,lastUpdated:new Date().toISOString()};let P={...K};async function _t(){try{const t=await fetch("/api/state",{cache:"no-store"});if(!t.ok)throw new Error("bad response");return await t.json()}catch{return{...K}}}async function st(t){try{const i=await fetch("/api/state",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)});if(!i.ok)throw new Error("bad response");P=await i.json()}catch{P={...P,...t,lastUpdated:new Date().toISOString()}}return P}async function Qt(){try{const t=await fetch("/api/state",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({scans:0})});if(!t.ok)throw new Error("bad response");P=await t.json()}catch{P={...K,scans:0}}return P}function ct(){const t=new URL(window.location.href);return t.search="",t.hash="",t}function V(){const t=ct();return t.searchParams.set("scan",P.qrId),t.toString()}function Ee(){const t=ct();return t.searchParams.set("demo","admin"),t.toString()}function lt(t){return new Intl.DateTimeFormat(void 0,{dateStyle:"medium",timeStyle:"short"}).format(new Date(t))}function Se(){const t=new URLSearchParams(window.location.search);if(t.has("scan")){zt(t.get("scan"));return}if(t.get("demo")==="admin"){Vt();return}Ot()}function Ot(){const t=document.querySelector("#app"),i=Y[P.destination];t.innerHTML=`
    <main class="presentation-shell">
      <nav class="presentation-nav" aria-label="Presentation navigation">
        <div>
          <strong>Dynamic QR Ordering</strong>
          <span>Tech demo for hotel restaurant operations</span>
        </div>
        <div class="nav-actions">
          <button class="secondary-button" id="openWalkthrough" type="button">View flow</button>
          <a class="primary-button" href="${Ee()}">Open live admin</a>
        </div>
      </nav>

      <section class="presentation-hero">
        <div class="hero-copy">
          <p class="eyebrow">Client preview</p>
          <h1>Update the guest menu without reprinting QR codes.</h1>
          <p class="hero-lede">
            This demo shows one permanent QR code connected to a live destination that hotel staff can change any time.
          </p>
          <div class="hero-actions">
            <button class="primary-button" id="openScanFromPresentation" type="button">Open guest view</button>
            <button class="secondary-button" id="copyPresentationQr" type="button">Copy scan link</button>
          </div>
        </div>

        <div class="presentation-board">
          <div class="qr-showcase">
            <div>
              <p class="eyebrow">Printed QR remains same</p>
              <h2>${P.qrId}</h2>
            </div>
            <canvas id="presentationQr" width="250" height="250" aria-label="Dynamic QR code"></canvas>
            <span class="showcase-note">Current target: ${i.label}</span>
          </div>

          <div class="guest-mini" style="--accent:${i.accent}">
            <div class="phone-bar"></div>
            <div class="menu-hero">
              <span>${i.badge}</span>
              <h3>${i.title}</h3>
              <p>${i.subtitle}</p>
            </div>
            <div class="notice">${O(P.announcement)}</div>
            <div class="menu-list">
              ${Ae(i.items.slice(0,3),"div")}
            </div>
          </div>
        </div>
      </section>

      <section class="compare-section" aria-label="Static QR vs dynamic QR">
        <div class="section-head">
          <p class="eyebrow">What is a dynamic QR code?</p>
          <h2>Same printed code. Content the restaurant keeps changing.</h2>
          <p>A static QR code has its destination baked into the black-and-white pattern forever. A dynamic QR code
          points to one short, permanent link on our server, and that link's destination can be changed anytime —
          so the printed code itself never has to change.</p>
        </div>
        <div class="compare-grid">
          <article class="compare-card static">
            <h3>Static QR</h3>
            <ul>
              <li>Destination is encoded directly into the QR image</li>
              <li>Any content change means printing a brand-new code</li>
              <li>Old codes left on tables can quietly go stale</li>
            </ul>
          </article>
          <article class="compare-card dynamic">
            <h3>Dynamic QR <span>This demo</span></h3>
            <ul>
              <li>QR always points to one stable link, e.g. <em>yoursite.com/?scan=${P.qrId}</em></li>
              <li>Staff change what that link shows from the admin panel</li>
              <li>Same printed code, always up to date — nothing to reprint</li>
            </ul>
          </article>
        </div>
      </section>

      <section class="value-grid" aria-label="Demo highlights">
        <article>
          <span>1</span>
          <h2>Guest scans fixed QR</h2>
          <p>The QR can be printed for tables, rooms, reception counters, or restaurant entrances.</p>
        </article>
        <article>
          <span>2</span>
          <h2>System checks live target</h2>
          <p>The same QR ID can open breakfast, lunch, room service, offers, or a paused page.</p>
        </article>
        <article>
          <span>3</span>
          <h2>Admin updates instantly</h2>
          <p>Staff change the destination from the dashboard. No QR reprint is needed.</p>
        </article>
      </section>

      <section class="client-summary">
        <div>
          <p class="eyebrow">What this proves</p>
          <h2>Dynamic QR logic is ready to demonstrate</h2>
        </div>
        <dl>
          <div>
            <dt>Status</dt>
            <dd>${P.active?"Active":"Paused"}</dd>
          </div>
          <div>
            <dt>Destination</dt>
            <dd>${i.label}</dd>
          </div>
          <div>
            <dt>Scan count</dt>
            <dd>${P.scans}</dd>
          </div>
          <div>
            <dt>Last update</dt>
            <dd>${lt(P.lastUpdated)}</dd>
          </div>
        </dl>
      </section>

      <div class="modal-backdrop" id="walkthroughModal" hidden>
        <section class="modal" role="dialog" aria-modal="true" aria-labelledby="walkthroughTitle">
          <div class="modal-head">
            <div>
              <p class="eyebrow">Presentation flow</p>
              <h2 id="walkthroughTitle">How to explain this to the client</h2>
            </div>
            <button class="icon-button" id="closeWalkthrough" type="button" aria-label="Close walkthrough">x</button>
          </div>
          <ol class="walkthrough-list">
            <li>
              <strong>Show the QR first.</strong>
              <span>Explain that the printed code contains only a stable QR ID, not a hardcoded menu.</span>
            </li>
            <li>
              <strong>Open the guest view.</strong>
              <span>The guest sees the current live destination for that table or room.</span>
            </li>
            <li>
              <strong>Open live admin.</strong>
              <span>Change the target to lunch or room service and save it.</span>
            </li>
            <li>
              <strong>Scan again.</strong>
              <span>The same QR now opens the new destination, proving the dynamic behavior.</span>
            </li>
          </ol>
          <div class="modal-actions">
            <a class="primary-button" href="${Ee()}">Go to live admin</a>
            <button class="secondary-button" id="modalScan" type="button">Open guest view</button>
          </div>
        </section>
      </div>
    </main>
  `,dt("#presentationQr",250),Ht()}function Vt(){const t=document.querySelector("#app"),i=Y[P.destination];t.innerHTML=`
    <main class="shell">
      <section class="topbar" aria-label="Demo header">
        <div>
          <p class="eyebrow">Live admin demo</p>
          <h1>One QR code, changeable destination</h1>
        </div>
        <div class="nav-actions">
          <a class="secondary-button" href="${window.location.pathname}">Presentation</a>
          <button class="ghost-button" id="resetDemo" type="button">Reset demo</button>
        </div>
      </section>

      <section class="layout">
        <article class="panel qr-panel">
          <div class="panel-heading">
            <div>
              <p class="eyebrow">Fixed QR</p>
              <h2>${P.qrId}</h2>
            </div>
            <span class="status ${P.active?"active":"paused"}">
              ${P.active?"Active":"Paused"}
            </span>
          </div>

          <div class="qr-frame">
            <canvas id="qrCanvas" width="280" height="280" aria-label="Dynamic QR code"></canvas>
          </div>

          <div class="readonly-url">
            <span>QR always opens</span>
            <strong id="qrValue">${V()}</strong>
          </div>

          <div class="button-row">
            <button class="primary-button" id="openScan" type="button">Open scan view</button>
            <button class="secondary-button" id="copyQr" type="button">Copy QR URL</button>
          </div>
        </article>

        <article class="panel control-panel">
          <div class="panel-heading">
            <div>
              <p class="eyebrow">Admin controls</p>
              <h2>Change what the QR resolves to</h2>
            </div>
          </div>

          <form id="settingsForm" class="form-grid">
            <label>
              Table or location
              <input id="tableName" name="tableName" value="${O(P.tableName)}" />
            </label>

            <label>
              Guest message
              <textarea id="announcement" name="announcement" rows="3">${O(P.announcement)}</textarea>
            </label>

            <fieldset>
              <legend>Current destination</legend>
              <div class="segmented">
                ${Object.entries(Y).map(([o,r])=>`
                  <label class="${P.destination===o?"selected":""}">
                    <input type="radio" name="destination" value="${o}" ${P.destination===o?"checked":""} />
                    <span>${r.label}</span>
                  </label>
                `).join("")}
              </div>
            </fieldset>

            <label class="toggle">
              <input id="active" name="active" type="checkbox" ${P.active?"checked":""} />
              <span>QR is active</span>
            </label>

            <button class="primary-button" type="submit">Save QR target</button>
          </form>
        </article>

        <article class="panel preview-panel">
          <div class="panel-heading">
            <div>
              <p class="eyebrow">Live result</p>
              <h2>${i.label}</h2>
            </div>
            <span class="metric">${P.scans} scans</span>
          </div>

          <div class="phone-preview" style="--accent:${i.accent}">
            <div class="phone-bar"></div>
            <div class="menu-hero">
              <span>${i.badge}</span>
              <h3>${i.title}</h3>
              <p>${i.subtitle}</p>
            </div>
            <div class="notice">${O(P.announcement)}</div>
            <div class="menu-list">
              ${Ae(i.items,"div")}
            </div>
          </div>

          <dl class="meta-list">
            <div>
              <dt>Last changed</dt>
              <dd>${lt(P.lastUpdated)}</dd>
            </div>
            <div>
              <dt>QR ID</dt>
              <dd>${P.qrId}</dd>
            </div>
          </dl>
        </article>
      </section>
    </main>
  `,dt("#qrCanvas",280),Kt()}function zt(t){const i=t===P.qrId;i&&!sessionStorage.getItem(`scan-counted-${t}`)&&(sessionStorage.setItem(`scan-counted-${t}`,"true"),st({scans:P.scans+1}).catch(()=>{}));const o=Y[P.destination],r=document.querySelector("#app");r.innerHTML=`
    <main class="guest-shell" style="--accent:${o.accent}">
      <section class="guest-card">
        <div class="guest-top">
          <div>
            <p class="eyebrow">${O(P.tableName)}</p>
            <h1>${P.active&&i?o.title:"QR unavailable"}</h1>
          </div>
          <a class="admin-link" href="${Ee()}">Admin</a>
        </div>

        ${P.active&&i?`
          <div class="menu-hero">
            <span>${o.badge}</span>
            <h2>${o.label}</h2>
            <p>${o.subtitle}</p>
          </div>
          <div class="notice">${O(P.announcement)}</div>
          <div class="menu-list large">
            ${Ae(o.items,"button")}
          </div>
        `:`
          <p class="closed-message">This QR code is paused or unknown. Please ask a staff member for assistance.</p>
        `}
      </section>
    </main>
  `}function Ht(){const t=document.querySelector("#walkthroughModal");document.querySelector("#openScanFromPresentation").addEventListener("click",()=>{window.open(V(),"_blank","noopener,noreferrer")}),document.querySelector("#modalScan").addEventListener("click",()=>{window.open(V(),"_blank","noopener,noreferrer")}),document.querySelector("#copyPresentationQr").addEventListener("click",async i=>{await ut(i.currentTarget,"Copy scan link")}),document.querySelector("#openWalkthrough").addEventListener("click",()=>{t.hidden=!1}),document.querySelector("#closeWalkthrough").addEventListener("click",()=>{t.hidden=!0}),t.addEventListener("click",i=>{i.target===t&&(t.hidden=!0)}),document.addEventListener("keydown",i=>{i.key==="Escape"&&!t.hidden&&(t.hidden=!0)})}function Kt(){document.querySelector("#settingsForm").addEventListener("submit",async t=>{t.preventDefault();const i=new FormData(t.currentTarget);await st({tableName:i.get("tableName").trim()||K.tableName,announcement:i.get("announcement").trim()||K.announcement,destination:i.get("destination"),active:i.get("active")==="on"}),Se()}),document.querySelector("#openScan").addEventListener("click",()=>{window.open(V(),"_blank","noopener,noreferrer")}),document.querySelector("#copyQr").addEventListener("click",async t=>{await ut(t.currentTarget,"Copy QR URL")}),document.querySelector("#resetDemo").addEventListener("click",async()=>{await Qt(),sessionStorage.clear(),Se()})}function ut(t,i){return navigator.clipboard.writeText(V()).then(()=>{t.textContent="Copied"}).catch(()=>{t.textContent="Copy manually"}).finally(()=>{setTimeout(()=>{t.textContent=i},1200)})}async function dt(t,i){const o=document.querySelector(t);o&&await $t.toCanvas(o,V(),{width:i,margin:2,color:{dark:"#111827",light:"#ffffff"}})}function Ae(t,i){return t.map(([o,r])=>`
    <${i} ${i==="button"?'type="button"':""}>
      <span>${o}</span>
      <strong>${r}</strong>
    </${i}>
  `).join("")}function O(t){return String(t).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}jt();async function jt(){P=await _t(),Se()}
