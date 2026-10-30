/* combo: pixel product sprites, sample shop grid, mobile menu */
(function(){
const TISE='https://tise.com/popipants';
const PAL={k:'#D9447F',p:'#FF5FA2',m:'#FF9EC7',b:'#FFD6E8',w:'#ffffff',s:'#c4c4d0',a:'#8FE3E8',t:'#4FC3C9',g:'#7FD6B0',y:'#FFF1A8'};
const mir=r=>r.map(l=>l+l.slice(0,-1).split('').reverse().join(''));
const SPR={
 tee:mir(['..kkkkk','.kbbbkw','kbbbbbk','kbbbbbb','kkkbbbb','..kbbbb','..kbbbb','..kbbpb','..kbpwp','..kbbpb','..kbbbb','..kkkkk']),
 skirt:mir(['..kkkkk','..kpppp','..kssss','.kbbbbb','.kbmbbm','kbbbbbb','kbmbbmb','kbbbbbb','kkkkkkk']),
 cami:mir(['...k...','...k...','..k....','.kbbbbk','kbbbbbb','kbbbbmb','kbbbbbb','kbbbbbm','kbbbbbb','kmbbbbb','kkkkkkk']),
 pants:mir(['.kkkkkk','.kssssp','.kbbbbb','.kbbbbb','.kbbbmk','.kbbbbk','.kbbbbk','.kmbbbk','.kbbbbk','.kbbbbk','kbbbbbk','kkkkkk.']),
  bfly:mir([
 '.kk.....',
 'kmmk....',
 'kmwmk...',
 'kmmbmk..',
 'kpmbbmk.',
 '.kpmmmkk',
 '..kkkkkk',
 '..kmbmk.',
 '.kmbwbkk',
 '.kmbbmkk',
 '..kmmk.k',
 '...kk...']),
 heart:mir(['.kkk...','kmwmk..','kmmbmkk','kpmmmmm','kppmmmm','.kpppmm','..kpppp','...kppp','....kpp','.....kp','......k']),
 hibiscus:mir([
 '.....kkk',
 '....kmbb',
 '..kkkbwb',
 '.kmbbkbb',
 'kmbwbbkm',
 'kmbbbbmk',
 '.kmmbmmp',
 '..kkmmpy',
 '.kmmmmpk',
 'kmbbbmpp',
 'kbwbbmkp',
 '.kmbbk.k',
 '..kkk..g',
 '.......g']),
 lotus:mir(['......k','.....km','.....kb','..k..kb','.kmk.kb','.kbmkmb','kbbmkmb','kbbbmkm','.kbbbmk','..kkmmm','.aaakkk','aataaaa','.aaaaaa']),
 star:mir(['...k','...w','..kwk'.slice(0,4),'kwwww','..kwk'.slice(0,4),'...w','...k']),
 bag:mir(['...kkkk','..k....','..k....','kkkkkkk','kbbbbbb','kbmbbbb','kbbbkpk','kbbbkwp','kbbbbkk','kbbbbbb','kkkkkkk'])};
function sprite(n,sc){const r=SPR[n],c=document.createElement('canvas');c.width=r[0].length*sc;c.height=r.length*sc;const x=c.getContext('2d');
 r.forEach((row,j)=>[...row].forEach((ch,i)=>{if(PAL[ch]){x.fillStyle=PAL[ch];x.fillRect(i*sc,j*sc,sc,sc)}}));return c}
document.querySelectorAll('i[data-spr]').forEach(el=>{const c=sprite(el.dataset.spr,+el.dataset.scale||5);c.className='pxs '+el.className;if(el.getAttribute('style'))c.setAttribute('style',el.getAttribute('style'));el.replaceWith(c)});
document.querySelectorAll('.demo-form').forEach(f=>f.addEventListener('submit',e=>{e.preventDefault();const b=f.querySelector('.demo-send span');b.textContent='demo only — nothing sent ♡'}));
const ITEMS=[['tee','baby tee','dot','tops'],['skirt','pleated mini','plaid','bottoms'],['cami','lace cami','leo','tops'],['pants','flare jeans','zeb','bottoms'],
 ['bag','shoulder bag','aq','bags'],['tee','butterfly tee','leo','tops'],['skirt','ruffle skirt','dot','bottoms'],['cami','halter top','plaid','tops'],
 ['pants','low-rise cargos','dot','bottoms'],['bag','mini purse','zeb','bags'],['tee','hibiscus tee','aq','tops'],['cami','tube top','dot','tops']];
document.querySelectorAll('.pp-grid').forEach(g=>{ITEMS.slice(0,+g.dataset.n||8).forEach(([s,t,p,cat])=>{
 const a=document.createElement('a');a.className='pp-card';a.href=TISE;a.target='_blank';a.rel='noopener';a.dataset.cat=cat;
 a.innerHTML=`<div class="pp-ph pat-${p}"><span class="pp-tag">sample item</span></div><h3>${t}</h3><p>example · see on tise ↗</p>`;
 a.firstChild.appendChild(sprite(s,8));g.appendChild(a)})});
const chips=document.querySelector('.pp-chips');
if(chips){chips.innerHTML=['all','tops','bottoms','bags'].map(c=>`<button type="button" class="gelbtn${c=='all'?' on':''}" data-c="${c}"><span>${c}</span></button>`).join('');
 chips.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;chips.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));
  document.querySelectorAll('.pp-card').forEach(cd=>cd.style.display=(b.dataset.c=='all'||cd.dataset.cat==b.dataset.c)?'':'none')})}
const mb=document.querySelector('.combo-menu'),side=document.querySelector('.sidebar');
if(mb&&side){
 const mq=matchMedia('(max-width:768px)');
 const nav=side.querySelector('.sidebar-nav');
 if(nav&&!nav.querySelector('.combo-tise')){const li=document.createElement('li');li.className='combo-tise';li.innerHTML='<a href="'+TISE+'" target="_blank" rel="noopener">tise ↗</a>';nav.appendChild(li)}
 const head=document.createElement('div');head.className='combo-dhead';head.innerHTML='<span class="brand-logo">popipants</span><button type="button" class="gelbtn combo-close" aria-label="Close menu"><span>close ×</span></button>';side.prepend(head);
 const bd=document.createElement('div');bd.className='combo-backdrop';document.body.appendChild(bd);
 side.id='combo-drawer';mb.setAttribute('aria-controls','combo-drawer');
 const setInert=()=>{if(mq.matches&&!document.body.classList.contains('drawer-open')){side.setAttribute('aria-hidden','true');side.inert=true}else{side.removeAttribute('aria-hidden');side.inert=false}};
 const focusables=()=>[...side.querySelectorAll('a,button')].filter(e=>e.offsetParent!==null);
 function open(){document.body.classList.add('drawer-open');mb.setAttribute('aria-expanded','true');setInert();side.setAttribute('role','dialog');side.setAttribute('aria-modal','true');setTimeout(()=>{const f=focusables()[0];f&&f.focus()},50)}
 function close(){if(!document.body.classList.contains('drawer-open'))return;document.body.classList.remove('drawer-open');mb.setAttribute('aria-expanded','false');side.removeAttribute('role');side.removeAttribute('aria-modal');setInert();mb.focus()}
 mb.addEventListener('click',()=>document.body.classList.contains('drawer-open')?close():open());
 head.querySelector('.combo-close').addEventListener('click',close);bd.addEventListener('click',close);
 side.addEventListener('click',e=>{if(e.target.closest('.sidebar-nav a'))close()});
 document.addEventListener('keydown',e=>{if(!document.body.classList.contains('drawer-open'))return;
  if(e.key==='Escape')close();
  if(e.key==='Tab'){const f=focusables(),a=f[0],z=f[f.length-1];if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}}});
 mq.addEventListener('change',()=>{if(!mq.matches)close();setInert()});setInert();
}
})();
