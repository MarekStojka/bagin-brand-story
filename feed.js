(() => {
  'use strict';
  const $=s=>document.querySelector(s);
  const grid=$('#ig-grid'),dialog=$('#feed-dialog');
  let posts=[],order=[],saved=new Set(),onlySaved=false,opened=0,returnFocus=null,dialogOrder=[],drawVersion=0;
  const reduced=()=>document.body.classList.contains('reduced');
  const sourceUrl=node=>'https://www.figma.com/design/EEo4VKI6yNkOwBU3F1UCoj/Bagin---Brand?node-id='+node.replace(':','-');
  function currentOrder(){return onlySaved?order.filter(i=>saved.has(i)):order;}
  function refreshCount(){
    $('#feed-saved-count').textContent=saved.size;
    const count=currentOrder().length;$('#feed-post-count').textContent=count+' '+(count===1?'návrh':count>1&&count<5?'návrhy':'návrhů');
    $('#feed-all').setAttribute('aria-pressed',String(!onlySaved));$('#feed-saved').setAttribute('aria-pressed',String(onlySaved));
    $('#feed-reset').disabled=order.every((id,index)=>id===index);
    $('#feed-shuffle').disabled=onlySaved&&saved.size<2;
    $('#feed-empty').hidden=!onlySaved||count>0;
  }
  function buildCard(post,index){
    const button=document.createElement('button');button.type='button';button.className='feed-card';button.dataset.post=index;
    if (!reduced()) button.classList.add('feed-awaiting');
    button.style.setProperty('--entry-x', ((index%3)-1)*48+'px');
    button.style.setProperty('--entry-turn', ((index%3)-1)*3+'deg');
    button.style.setProperty('--entry-delay', (index%3)*90+'ms');
    button.addEventListener('focus',()=>button.classList.remove('feed-awaiting'));
    button.setAttribute('aria-label','Otevřít příspěvek '+post.title);button.setAttribute('aria-haspopup','dialog');
    const img=new Image();img.src=post.image;img.alt=post.title;img.width=1088;img.height=1920;img.loading='lazy';img.decoding='async';
    const hover=document.createElement('span');hover.className='feed-hover';hover.setAttribute('aria-hidden','true');hover.innerHTML='<span>+</span>';
    button.append(img,hover);button.addEventListener('click',()=>open(index,button));return button;
  }
  const cards=[];
  const entranceObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.remove('feed-awaiting');
      entranceObserver.unobserve(entry.target);
    });
  }, {threshold:.08, rootMargin:'0px 0px -5% 0px'});
  function revealCards() {
    entranceObserver.disconnect();
    cards.forEach(card => card.classList.remove('feed-awaiting'));
  }
  window.addEventListener('bagin-motion-change', () => { if (reduced()) revealCards(); });
  function draw(animate=false){
    const version=++drawVersion;
    if (animate) revealCards();
    const previous=new Map();if(animate&&!reduced())cards.forEach(c=>{if(c.isConnected)previous.set(c,c.getBoundingClientRect());});
    grid.replaceChildren(...currentOrder().map(i=>cards[i]));
    cards.forEach((card,i)=>card.classList.toggle('saved',saved.has(i)));refreshCount();
    if(animate&&!reduced())requestAnimationFrame(()=>{
      if(version!==drawVersion)return;
      cards.forEach(card=>{const old=previous.get(card);if(!old||!card.isConnected)return;const now=card.getBoundingClientRect();card.getAnimations().forEach(a=>a.cancel());card.animate([{transform:`translate(${old.x-now.x}px,${old.y-now.y}px)`,opacity:.7},{transform:'translate(0,0)',opacity:1}],{duration:620,easing:'cubic-bezier(.2,.7,.15,1)'});});
    });
    cards.forEach(card => {if(card.isConnected && card.classList.contains('feed-awaiting')) entranceObserver.observe(card);});
    window.dispatchEvent(new Event('resize'));
  }
  function filter(savedOnly){onlySaved=savedOnly;draw();}
  $('#feed-all').addEventListener('click',()=>filter(false));$('#feed-saved').addEventListener('click',()=>filter(true));$('#feed-empty-back').addEventListener('click',()=>filter(false));
  $('#feed-shuffle').addEventListener('click',()=>{
    const previous=order.join(',');
    for(let i=order.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[order[i],order[j]]=[order[j],order[i]];}
    if(order.join(',')===previous)order.push(order.shift());
    draw(true);$('#feed-order-status').textContent='Pořadí příspěvků je promíchané. Všechny původní návrhy zůstávají ve feedu.';
  });
  $('#feed-reset').addEventListener('click',()=>{order=posts.map((_,i)=>i);draw(true);$('#feed-order-status').textContent='Obnoveno původní pořadí podle Figmy.';});
  function renderPost(){
    const post=posts[opened];$('#feed-dialog-title').textContent=post.title;$('#feed-dialog-category').textContent=post.category;$('#feed-dialog-text').textContent=post.text;
    $('#feed-dialog-image').src=post.image;$('#feed-dialog-image').alt=post.title+' — návrh Bagin';$('#feed-dialog-figma').href=sourceUrl(post.node);
    const position=dialogOrder.indexOf(opened)+1;$('#feed-dialog-position').textContent=String(position).padStart(2,'0')+' / '+String(dialogOrder.length).padStart(2,'0');
    $('#feed-save').setAttribute('aria-pressed',String(saved.has(opened)));$('#feed-save span').textContent=saved.has(opened)?'Ve výběru':'Uložit do výběru';
    $('#feed-post-prev').disabled=dialogOrder.length<2;$('#feed-post-next').disabled=dialogOrder.length<2;
  }
  function open(index,trigger){opened=index;returnFocus=trigger;dialogOrder=currentOrder().slice();renderPost();dialog.showModal();document.body.classList.add('modal-open');$('#feed-dialog-close').focus({preventScroll:true});}
  function next(direction){const i=dialogOrder.indexOf(opened);opened=dialogOrder[(i+direction+dialogOrder.length)%dialogOrder.length];renderPost();}
  $('#feed-dialog-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
  dialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');if(onlySaved)draw();if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});else $('#feed-saved').focus({preventScroll:true});});
  $('#feed-post-prev').addEventListener('click',()=>next(-1));$('#feed-post-next').addEventListener('click',()=>next(1));
  $('#feed-save').addEventListener('click',()=>{saved.has(opened)?saved.delete(opened):saved.add(opened);cards[opened].classList.toggle('saved',saved.has(opened));refreshCount();renderPost();});
  dialog.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();next(e.key==='ArrowRight'?1:-1);}});
  let touchX=0,touchY=0;
  $('.feed-dialog-art').addEventListener('touchstart',e=>{touchX=e.changedTouches[0].clientX;touchY=e.changedTouches[0].clientY;},{passive:true});
  $('.feed-dialog-art').addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-touchX,dy=e.changedTouches[0].clientY-touchY;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.5)next(dx<0?1:-1);},{passive:true});
  fetch('feed-data.json').then(r=>{if(!r.ok)throw new Error('Feed data could not be loaded');return r.json();}).then(data=>{
    posts=data;order=posts.map((_,i)=>i);posts.forEach((post,index)=>cards.push(buildCard(post,index)));draw();
  }).catch(()=>{grid.innerHTML='<p class="feed-empty">Náhled se nepodařilo načíst. Návrhy můžete otevřít odkazem na Figmu níže.</p>';$('#feed-shuffle').disabled=true;});
})();
