(() => {
  'use strict';
  const content = window.BAGIN_CONTENT;
  const $ = selector => document.querySelector(selector);
  const $$ = selector => Array.from(document.querySelectorAll(selector));
  const clamp = (v, a=0, b=1) => Math.max(a, Math.min(b, v));
  const between = (v,a,b) => clamp((v-a)/(b-a));
  const ease = v => v*v*(3-2*v);
  const mix = (a,b,t) => a+(b-a)*t;
  const windowFade = (p,a,b,c,d) => ease(between(p,a,b))*(1-ease(between(p,c,d)));
  const escape = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const asset = file => 'assets/'+file;
  let reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  try { const saved=localStorage.getItem('bagin-motion'); if(saved!==null)reduced=saved==='reduced'; } catch{}
  document.body.classList.toggle('reduced',reduced);
  let framePending=false, sceneMetrics={}, chapters=[], railTravel=0, activeRail=0, returnFocus=null;

  function setOpacity(element,value){element.style.opacity=clamp(value).toFixed(4);}
  const story=$('#pribeh'),principle=$('#znak'),showcase=$('#vystupy');
  const storyParts={bag:$('#logo-bag'),ins:$('#logo-in'),home:$('#homein-wordmark'),pink:$('#pink-i'),symbol:$('#story-symbol'),foot:$('.story-foot'),c1:$('#story-caption-1'),c2:$('#story-caption-2'),c3:$('#story-caption-3'),c4:$('#story-caption-4')};

  function measure(){
    const y=window.scrollY;
    [story,principle,showcase].forEach(el=>{sceneMetrics[el.id]={top:el.getBoundingClientRect().top+y,distance:Math.max(1,el.offsetHeight-innerHeight)};});
    chapters=$$('[data-chapter]').map(el=>({el,top:el.getBoundingClientRect().top+y,bottom:el.getBoundingClientRect().bottom+y}));
    const scale=innerWidth<701?(innerWidth-48)/740:Math.min(innerWidth/1920,innerHeight/1080);
    $('.story-canvas').style.setProperty('--canvas-scale',scale.toFixed(5));
    railTravel=Math.max(0,$('#design-rail').scrollWidth-$('.rail-window').clientWidth);
    schedule();
  }
  function progress(id){const m=sceneMetrics[id];return m?clamp((scrollY-m.top)/m.distance):0;}
  function schedule(){if(!framePending){framePending=true;requestAnimationFrame(render);}}

  function renderStory(p){
    const split=ease(between(p,.12,.25));
    const isolate=ease(between(p,.41,.51));
    const y=mix(66.48,0,ease(between(p,0,.09)));
    storyParts.bag.style.transform=`translate3d(${-78*split-120*isolate}px,${y}px,0)`;
    storyParts.ins.style.transform=`translate3d(${mix(78*split,-188,isolate)}px,${y}px,0)`;
    setOpacity(storyParts.bag,1-ease(between(p,.41,.47)));
    setOpacity(storyParts.ins,1-ease(between(p,.65,.69)));
    setOpacity(storyParts.home,windowFade(p,.29,.34,.405,.455));
    storyParts.home.style.transform=`translate3d(${-120*isolate}px,${mix(32,0,ease(between(p,.29,.34)))}px,0)`;
    setOpacity(storyParts.pink,windowFade(p,.55,.58,.65,.69));
    setOpacity(storyParts.c1,windowFade(p,.015,.06,.125,.17));
    setOpacity(storyParts.c2,windowFade(p,.17,.21,.27,.31));
    setOpacity(storyParts.c3,windowFade(p,.31,.35,.41,.45));
    setOpacity(storyParts.c4,windowFade(p,.455,.50,.64,.68));
    $('#caption-exclamation').style.color=p>.555?'#f404bc':'#111';
    const liberation=ease(between(p,.66,.77));
    const zoom=Math.pow(85,ease(between(p,.80,.995)));
    const size=mix(.288,1,liberation)*zoom;
    storyParts.symbol.style.transform=`translate3d(${mix(-59,0,liberation)}px,${mix(-67,0,liberation)}px,0) scale(${size})`;
    setOpacity(storyParts.symbol,ease(between(p,.66,.69)));
    setOpacity(storyParts.foot,1-ease(between(p,.87,.95)));
    $('#story-counter').textContent=String(Math.min(6,Math.floor(p*6)+1)).padStart(2,'0')+' — 06';
  }
  function renderPrinciple(p){
    setOpacity($('.principle-copy'),1-ease(between(p,.12,.26)));
    $('.principle-copy').style.transform=`translate3d(0,${-40*ease(between(p,.12,.26))}px,0)`;
    setOpacity($('.photo-aperture'),ease(between(p,.14,.22)));
    const open=ease(between(p,.48,.83));
    $$('.photo-sign').forEach((sign,i)=>{
      const arrival=ease(between(p,.17+i*.055,.34+i*.055));
      sign.style.opacity=arrival;
      sign.style.transform=`translate3d(0,${(1-arrival)*(i===1?-140:140)}px,0)`;
      sign.style.setProperty('--sign-mask-height',mix(70,1800,Math.pow(open,2.4))+'svh');
      sign.style.setProperty('--sign-top',mix(16,0,open)+'%');
      sign.style.setProperty('--sign-bottom',mix(29,0,open)+'%');
      sign.querySelector('.sign-dot').style.opacity=1-ease(between(p,.58,.79));
      sign.querySelector('.sign-dot').style.transform=`translateX(-50%) translateY(${open*90}px)`;
    });
    const words=$('.principle-reveal');
    setOpacity(words,ease(between(p,.80,.92)));
    words.style.transform=`translate3d(${mix(-80,0,ease(between(p,.80,.92)))}px,0,0)`;
  }
  function renderRail(p){
    const t=between(p,.08,.92);
    $('#design-rail').style.transform=`translate3d(${-railTravel*t}px,0,0)`;
    activeRail=Math.round(t*3);
    $('#rail-count').textContent=String(activeRail+1).padStart(2,'0')+' / 04';
    $('#rail-prev').disabled=activeRail===0;$('#rail-next').disabled=activeRail===3;
  }
  function render(){
    framePending=false;
    renderStory(reduced?.08:progress('pribeh'));
    if(!reduced){renderPrinciple(progress('znak'));renderRail(progress('vystupy'));}
    const percent=scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight);
    $('.progress-line span').style.transform=`scaleX(${clamp(percent)})`;
    let active=chapters[0];for(const chapter of chapters)if(chapter.top<=scrollY+innerHeight*.32)active=chapter;
    if(active){$('#current-chapter').textContent=active.el.dataset.chapter;$('.chapter-indicator').classList.toggle('shown',scrollY>innerHeight*.8);}
    const at=chapters.find(c=>scrollY+80>=c.top&&scrollY+80<c.bottom);
    const dark=at&&(at.el.classList.contains('principle')||at.el.classList.contains('motion-section')||at.el.classList.contains('closing'));
    $('.topbar').classList.toggle('dark',Boolean(dark)||(progress('pribeh')>.94&&scrollY<sceneMetrics.pribeh.top+story.offsetHeight));
  }

  function openDetail(item,trigger){
    returnFocus=trigger;const d=$('#lightbox');
    $('#lightbox-title').textContent=item.title;$('#lightbox-category').textContent=item.label||item.brand||'BAGIN / KONCEPT';
    $('#lightbox-description').textContent=item.text;
    $('#lightbox-image').src=asset(item.image);$('#lightbox-image').alt=item.title;
    $('#lightbox-figma').href=content.figmaBase+item.node;
    $('.lightbox-body').classList.toggle('portrait',Boolean(item.label));
    d.showModal();document.body.classList.add('modal-open');$('.lightbox-body').scrollTop=0;
  }
  $('#lightbox-close').addEventListener('click',()=>$('#lightbox').close());
  $('#lightbox').addEventListener('click',e=>{if(e.target===$('#lightbox'))$('#lightbox').close();});
  $('#lightbox').addEventListener('close',()=>{document.body.classList.remove('modal-open');returnFocus?.focus({preventScroll:true});});

  content.stories.forEach((item,index)=>{
    const figure=document.createElement('figure');figure.className='story-card';
    figure.innerHTML=`<button type="button" aria-label="Prohlédnout návrh ${escape(item.title)}"><img src="${asset(item.image)}" alt="${escape(item.title)} — schválený návrh Bagin" width="1080" height="1920" loading="lazy"><span class="zoom-mark" aria-hidden="true">+</span></button><figcaption><span class="micro">${escape(item.label)}</span><h3>${escape(item.title)}</h3><p>${escape(item.text)}</p></figcaption>`;
    const button=figure.querySelector('button');button.addEventListener('click',()=>openDetail(item,button));$('#design-rail').append(figure);
  });
  $('#scroll-cue').addEventListener('click',e=>{e.preventDefault();const m=sceneMetrics.pribeh;window.scrollTo({top:m.top+m.distance*.09,behavior:'smooth'});});
  function jumpRail(direction){const next=clamp(activeRail+direction,0,3);const metric=sceneMetrics.vystupy;window.scrollTo({top:metric.top+metric.distance*(.08+.84*(next/3)),behavior:'smooth'});}
  $('#rail-prev').addEventListener('click',()=>jumpRail(-1));$('#rail-next').addEventListener('click',()=>jumpRail(1));

  content.colors.forEach((color,index)=>{
    const button=document.createElement('button');button.type='button';button.setAttribute('aria-label',`Vyzkoušet barvu ${color.name}, ${color.hex}`);button.setAttribute('aria-pressed',String(index===0));
    button.innerHTML=`<span class="swatch-chip" style="background:${color.hex};color:${color.ink}"></span><span class="swatch-label">${color.name}<small>${color.hex}</small></span>`;
    button.addEventListener('click',()=>{
      const preview=$('#color-preview');preview.style.background=color.hex;preview.style.color=color.ink;$('#preview-color-name').textContent=color.name+' / '+color.hex;
      $$('#swatches button').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    });$('#swatches').append(button);
  });
  const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');revealObserver.unobserve(entry.target);}}),{threshold:.08,rootMargin:'0px 0px -25px 0px'});
  function observeReveals(){ $$('.reveal:not(.visible)').forEach(el=>revealObserver.observe(el)); }
  function closeMenu(){ $('#chapter-menu').hidden=true;$('#menu-toggle').setAttribute('aria-expanded','false');document.body.classList.remove('modal-open'); }
  $('#menu-toggle').addEventListener('click',()=>{const open=$('#chapter-menu').hidden;$('#chapter-menu').hidden=!open;$('#menu-toggle').setAttribute('aria-expanded',String(open));if(open)$('#chapter-menu a').focus({preventScroll:true});});
  $$('#chapter-menu a').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();const hash=a.getAttribute('href');closeMenu();requestAnimationFrame(()=>{const target=document.querySelector(hash);if(target){history.replaceState(null,'',hash);window.scrollTo({top:target.getBoundingClientRect().top+scrollY-(innerWidth<701?62:74),behavior:'smooth'});}});}));
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&!$('#chapter-menu').hidden){closeMenu();$('#menu-toggle').focus();}
    if($('#chapter-menu').hidden||e.key!=='Tab')return;
    const focusable=[$('#menu-toggle'),...$$('#chapter-menu a')];const first=focusable[0],last=focusable.at(-1);
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  });
  $('#fullscreen').addEventListener('click',async()=>{
    try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{}
  });
  document.addEventListener('fullscreenchange',()=>{$('#fullscreen').setAttribute('aria-label',document.fullscreenElement?'Ukončit celou obrazovku':'Celá obrazovka');measure();});
  function updateMotionButton(){const b=$('#motion-toggle');b.setAttribute('aria-pressed',String(reduced));b.title=reduced?'Zapnout animace':'Omezit animace';b.querySelector('.sr-only').textContent=b.title;b.querySelector('.motion-icon').textContent=reduced?'▶':'Ⅱ';}
  $('#motion-toggle').addEventListener('click',()=>{
    const nearest=chapters.filter(c=>c.top<=scrollY+80).at(-1)?.el;
    reduced=!reduced;document.body.classList.toggle('reduced',reduced);try{localStorage.setItem('bagin-motion',reduced?'reduced':'full');}catch{}
    updateMotionButton();window.dispatchEvent(new Event('bagin-motion-change'));measure();if(nearest)window.scrollTo({top:nearest.offsetTop,behavior:'instant'});schedule();
  });
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',measure,{passive:true});
  document.fonts.ready.then(measure);
  window.addEventListener('load',measure);
  new ResizeObserver(()=>measure()).observe(document.body);
  updateMotionButton();observeReveals();measure();
})();
