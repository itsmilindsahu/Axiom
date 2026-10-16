(function(){
var U='itsmilindsahu',H='https://github.com/'+U,rm=matchMedia('(prefers-reduced-motion:reduce)').matches,seen='IntersectionObserver' in window;
document.documentElement.classList.add('js');
function $(s){return [].slice.call(document.querySelectorAll(s))}
function watch(els,fn,th){if(!seen){els.forEach(fn);return}var o=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){fn(e.target);o.unobserve(e.target)}})},{threshold:th||.1});els.forEach(function(el){o.observe(el)})}
if(document.querySelector('.hero')){var rv=$('main h2,main .row,main .item,main .facts,main .tl,main details,main .bib,main>p');rv.forEach(function(e){e.classList.add('rv')});watch(rv,function(e){e.classList.add('on')},.05)}
function count(el){var t0=null;function f(t){if(!t0)t0=t;var k=Math.min(1,(t-t0)/1100),to=+el.dataset.count;el.dataset.done=1;el.textContent=Math.round(to*(1-Math.pow(1-k,3)));if(k<1)requestAnimationFrame(f)}rm?el.textContent=el.dataset.count:requestAnimationFrame(f)}
watch($('[data-count]'),count,.6);
function find(re,cb){var c;try{c=JSON.parse(sessionStorage.getItem('axr'))}catch(e){}function use(d){for(var i=0;i<d.length;i++)if(re.test(d[i].name)&&!d[i].fork)return cb(d[i])}if(c)return use(c);fetch('https://api.github.com/users/'+U+'/repos?per_page=100').then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(d){if(!Array.isArray(d))throw 0;try{sessionStorage.setItem('axr',JSON.stringify(d))}catch(e){}use(d)}).catch(function(){})}
$('[data-repo]').forEach(function(a){find(new RegExp(a.dataset.repo,'i'),function(r){a.href=r.html_url})});
var cv=document.querySelector('canvas[data-fx]');
if(cv){var hero=cv.parentNode,ctx=cv.getContext('2d'),fx=cv.dataset.fx,W,Hh,m={x:.5,y:.5,on:0},vis=true,run=0;
var R={
gp:function(c,w,h,t,m){var N=26,M=34,dx=w/(M+N)*1.05,ox=w*.5+(m.x-.5)*30,oy=h*.1;
function P(i,j){var x=j/3,y=i/3,z=Math.sin(x*.9+t)*Math.cos(y*.8-t*.7)+.5*Math.sin((x+y)*.7+t*.5),b=m.on?1.3*Math.exp(-(Math.pow(j/M-m.x,2)+Math.pow(i/N-m.y,2))*14):0;return[ox+(j-i)*dx*.9,oy+(i+j)*dx*.28-(z+b)*dx*1.1]}
c.lineWidth=1;for(var i=0;i<=N;i++){c.beginPath();for(var j=0;j<=M;j++){var p=P(i,j);j?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1])}c.strokeStyle='rgba(123,147,255,'+(.12+.32*i/N)+')';c.stroke()}
for(j=0;j<=M;j+=2){c.beginPath();for(i=0;i<=N;i++){p=P(i,j);i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1])}c.strokeStyle='rgba(232,178,106,.16)';c.stroke()}},
spectrum:function(c,w,h,t,m){var pk=[[3300,.5,150,'O\u2013H stretch'],[2920,.42,70,'C\u2013H stretch'],[1715,.95,38,'C=O stretch'],[1600,.3,32,'C=C or N\u2013H bend'],[1100,.62,60,'C\u2013O stretch']],x0=w*.06,x1=w*.94,base=h*.8,amp=h*.62,hot=-1;
function X(v){return x1-(v-500)/3500*(x1-x0)}
if(m.on){var mv=500+(x1-m.x*w)/(x1-x0)*3500;pk.forEach(function(p,i){if(Math.abs(p[0]-mv)<p[2]*1.2)hot=i})}
c.strokeStyle='#ffffff22';c.lineWidth=1;c.beginPath();c.moveTo(x0,base);c.lineTo(x1,base);c.stroke();
c.beginPath();for(var px=x0;px<=x1;px+=2){var v=500+(x1-px)/(x1-x0)*3500,y=0;pk.forEach(function(p,i){y+=p[1]*(1+.05*Math.sin(t*1.2+i))*Math.exp(-Math.pow((v-p[0])/p[2],2))});y+=.015*Math.sin(px*.31+t)+.01*Math.sin(px*.77);px===x0?c.moveTo(px,base-y*amp):c.lineTo(px,base-y*amp)}
c.strokeStyle='#e8b26a';c.lineWidth=1.6;c.stroke();
c.fillStyle='#8e96a8';c.font='11px Manrope,sans-serif';[4000,3000,2000,1000].forEach(function(v){c.fillText(v,X(v)-10,base+18)});c.fillText('cm\u207b\u00b9',x1-14,base+32);
if(hot>=0){var p=pk[hot],cx=X(p[0]),ty=base-p[1]*amp;c.strokeStyle='rgba(123,147,255,.8)';c.setLineDash([4,4]);c.beginPath();c.moveTo(cx,ty-12);c.lineTo(cx,base);c.stroke();c.setLineDash([]);c.fillStyle='#e9e8e4';c.font='500 13px Manrope,sans-serif';c.fillText(p[3]+', about '+p[0],Math.max(8,Math.min(cx-20,w-200)),ty-20)}},
nilm:function(c,w,h,t,m){var A=[['fridge',.25,90,.55,18],['kettle',.5,130,.14,41],['heater',.8,210,.4,9]],x0=w*.06,x1=w*.94,top=h*.3,bh=h*.13;
function on(a,x){var u=((x-t*a[4]*3)%a[2]+a[2])%a[2];return u<a[2]*a[3]?a[1]:0}
c.lineWidth=1.6;c.strokeStyle='#e8b26a';c.beginPath();for(var x=x0;x<=x1;x+=2){var s=0;A.forEach(function(a){s+=on(a,x)});var y=top-s*h*.2;x===x0?c.moveTo(x,y):c.lineTo(x,y)}c.stroke();
c.fillStyle='#e8b26a';c.font='11px Manrope,sans-serif';c.fillText('one meter',x0,top-h*.2-10);
A.forEach(function(a,k){var b=top+(k+1)*bh*1.25;c.strokeStyle='rgba(123,147,255,.85)';c.lineWidth=1.3;c.beginPath();for(var x=x0;x<=x1;x+=2){var y=b-on(a,x)*bh*1.4;x===x0?c.moveTo(x,y):c.lineTo(x,y)}c.stroke();c.fillStyle='#8e96a8';c.fillText(a[0],x0,b+14)})},
flow:function(c,w,h,t,m){var n=90,s=.5+.5*Math.sin(t*.6),r=Math.min(w*.1,h*.4);c.lineWidth=1;for(var i=0;i<n;i++){var an=i/n*6.283,ax=w*.25+Math.cos(an)*r+(m.x-.5)*20,ay=h*.5+Math.sin(an)*r,bx=w*.7+(i%10-4.5)*r*.28,by=h*.5+(Math.floor(i/10)-4)*r*.26;c.strokeStyle='rgba(123,147,255,.13)';c.beginPath();c.moveTo(ax,ay);c.lineTo(bx,by);c.stroke();c.fillStyle='#e8b26a';c.beginPath();c.arc(ax+(bx-ax)*s,ay+(by-ay)*s,2,0,6.283);c.fill()}},
net:function(c,w,h,t,m){var n=16,p=[],i,j;for(i=0;i<n;i++)p.push([w*(.08+.84*((i*.618)%1))+Math.sin(t*.3+i*2)*24,h*(.1+.8*((i*.381+.2)%1))+Math.cos(t*.25+i*3)*18]);
if(m.on)p.forEach(function(q){var dx=m.x*w-q[0],dy=m.y*h-q[1],d=Math.hypot(dx,dy);if(d<140){q[0]+=dx*.18*(1-d/140);q[1]+=dy*.18*(1-d/140)}});
c.lineWidth=1;for(i=0;i<n;i++)for(j=i+1;j<n;j++){var d=Math.hypot(p[i][0]-p[j][0],p[i][1]-p[j][1]);if(d<170){c.strokeStyle='rgba(123,147,255,'+.35*(1-d/170)+')';c.beginPath();c.moveTo(p[i][0],p[i][1]);c.lineTo(p[j][0],p[j][1]);c.stroke()}}
p.forEach(function(q,i){c.fillStyle=i%5?'#7b93ff':'#e8b26a';c.beginPath();c.arc(q[0],q[1],i%5?2.5:3.5,0,6.283);c.fill()})}};
function draw(t){ctx.clearRect(0,0,W,Hh);(R[fx]||R.net)(ctx,W,Hh*.58,t,{x:m.x,y:Math.min(1,m.y/.58),on:m.on})}
function fit(){var d=Math.min(devicePixelRatio||1,2);W=cv.clientWidth;Hh=cv.clientHeight;cv.width=W*d;cv.height=Hh*d;ctx.setTransform(d,0,0,d,0,0);if(rm)draw(2)}
function frame(ms){run=0;draw(ms*.001);if(vis&&!rm)go()}
function go(){if(!run){run=1;requestAnimationFrame(frame)}}
fit();addEventListener('resize',fit);
hero.addEventListener('pointermove',function(e){var r=cv.getBoundingClientRect();m.x=(e.clientX-r.left)/r.width;m.y=(e.clientY-r.top)/r.height;m.on=1;if(rm)draw(2)});
hero.addEventListener('pointerleave',function(){m.on=0;if(rm)draw(2)});
if(seen)new IntersectionObserver(function(es){vis=es[0].isIntersecting;if(vis&&!rm)go()}).observe(hero);
if(!rm)go()}
})();
