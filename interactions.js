(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const reduced = () => document.body.classList.contains('reduced');
  const clamp = v => Math.max(0, Math.min(1,v));
  const easeOut = v => 1-Math.pow(1-v,3);
  const backOut = v => 1+2.70158*Math.pow(v-1,3)+1.70158*Math.pow(v-1,2);

  // Every source design is built from independent text and symbol layers.
  // The photograph and its foreground cutout are shared and never animated.
  const variants = $$('.composition-variant');
  const parts = variants.map(v => Array.from(v.querySelectorAll('.motion-part')));
  let current = 0, clock = 1100, playing = true, inView = false, raf = 0, previousTime = 0;
  const duration = 5400;
  const status = $('#composition-name');
  function sizeComposition(){
    const width=$('.composition-stage').clientWidth;
    $('#composition-canvas').style.transform=`scale(${width/1087.6})`;
  }
  new ResizeObserver(sizeComposition).observe($('.composition-stage'));
  function paint(){
    const t=clock;
    parts[current].forEach((part,i)=>{
      const delay=Math.min(i,7)*52;
      const enter=clamp((t-delay)/880);
      const exit=clamp((t-4400-delay*.35)/650);
      const isSymbol=part.classList.contains('symbol-part');
      const direction=(current+i)%4;
      let x=0,y=0,scale=1,turn=0;
      const arrive=(current%3===1||isSymbol)?backOut(enter):easeOut(enter);
      const amount=(1-arrive);
      if(direction===0)x=amount*-430;
      if(direction===1)y=amount*-330;
      if(direction===2)y=amount*410;
      if(direction===3){scale=.2+.8*arrive;y=amount*100;}
      if(isSymbol){turn=(1-arrive)*(current%2?35:-35);scale*=.65+.35*arrive;}
      x+=easeOut(exit)*(current%2?-350:350);
      y-=easeOut(exit)*(isSymbol?170:50);
      scale*=1-.15*exit;
      part.style.opacity=String(Math.min(1,enter*5)*(1-exit));
      part.style.transform=`translate3d(${x}px,${y}px,0) rotate(${turn}deg) scale(${scale})`;
    });
    $('#composition-canvas').dataset.phase=clock<1100?'enter':clock<4400?'hold':'exit';
  }
  function updateControls(){
    $('#composition-toggle').textContent=playing?'Pozastavit':'Přehrát';
    $('#composition-toggle').setAttribute('aria-pressed',String(!playing));
    $('#composition-count').textContent=String(current+1).padStart(2,'0')+' / '+String(variants.length).padStart(2,'0');
    status.textContent=variants[current].dataset.label;
    $('#composition-canvas').setAttribute('aria-label','Reisenthel Carrybag XS Rhombus denim — '+status.textContent);
    $$('.composition-dots button').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===current)));
  }
  function select(index,instant=false){
    current=(index+variants.length)%variants.length;
    variants.forEach((v,i)=>{v.classList.toggle('active',i===current);v.setAttribute('aria-hidden',String(i!==current));});
    clock=instant?1400:0;previousTime=0;updateControls();paint();
  }
  function tick(now){
    raf=0;
    if(!inView||!playing||reduced()||document.hidden){previousTime=0;return;}
    if(previousTime)clock+=Math.min(now-previousTime,80);
    previousTime=now;
    if(clock>=duration){select(current+1);previousTime=now;}
    paint();raf=requestAnimationFrame(tick);
  }
  function wake(){if(!raf&&inView&&playing&&!reduced()&&!document.hidden)raf=requestAnimationFrame(tick);}
  variants.forEach((v,i)=>{
    const b=document.createElement('button');b.type='button';b.setAttribute('aria-label',`Kompozice ${i+1}: ${v.dataset.label}`);
    b.addEventListener('click',()=>{select(i,reduced()||!playing);wake();});$('.composition-dots').append(b);
  });
  $('#composition-prev').addEventListener('click',()=>{select(current-1,reduced()||!playing);wake();});
  $('#composition-next').addEventListener('click',()=>{select(current+1,reduced()||!playing);wake();});
  $('#composition-toggle').addEventListener('click',()=>{playing=!playing;previousTime=0;updateControls();wake();});
  new IntersectionObserver(entries=>{
    inView=entries[0].isIntersecting;previousTime=0;wake();
  },{threshold:.2}).observe($('.composition-stage'));
  select(0,true);sizeComposition();

  // All five phones are visible together. Sound is opt-in and exclusive to one phone.
  let videosInView=false, videosPaused=false;
  window.BAGIN_CONTENT.movies.forEach(movie=>{
    const figure=document.createElement('figure');figure.className='phone-figure';
    const shell=document.createElement('div');shell.className='phone-shell';
    const v=document.createElement('video');v.src='assets/'+movie.id+'.mp4';v.poster='assets/'+movie.id+'-poster.jpg';v.muted=true;v.defaultMuted=true;v.playsInline=true;v.loop=true;v.controls=true;v.preload='metadata';v.setAttribute('aria-label',movie.title);
    const caption=document.createElement('figcaption');const label=document.createElement('span');label.textContent=movie.title;
    const sound=document.createElement('button');sound.type='button';sound.className='phone-sound';sound.textContent='Zvuk vypnutý';sound.setAttribute('aria-pressed','false');sound.setAttribute('aria-label','Zapnout zvuk: '+movie.title);
    sound.addEventListener('click',()=>{const enable=v.muted;$$('.phone-shell video').forEach(x=>{x.muted=true;});v.muted=!enable;v.play().catch(()=>{});});
    v.addEventListener('volumechange',()=>{if(!v.muted)$$('.phone-shell video').filter(x=>x!==v).forEach(x=>{x.muted=true;});sound.textContent=v.muted?'Zvuk vypnutý':'Zvuk zapnutý';sound.setAttribute('aria-pressed',String(!v.muted));sound.setAttribute('aria-label',(v.muted?'Zapnout':'Vypnout')+' zvuk: '+movie.title);});
    v.addEventListener('error',()=>{label.textContent=movie.title+' — video se nepodařilo načíst';});
    shell.append(v);caption.append(label,sound);figure.append(shell,caption);$('#phone-wall').append(figure);
  });
  const videos=$$('.phone-shell video');
  function syncVideos(){
    const shouldPlay=videosInView&&!videosPaused&&!reduced()&&!document.hidden;
    videos.forEach(v=>{if(shouldPlay)v.play().catch(()=>{});else v.pause();});
    $('#motion-play').textContent=videosPaused?'Přehrát všechna videa ▶':'Pozastavit všechna videa Ⅱ';
    $('#motion-play').setAttribute('aria-pressed',String(videosPaused));
  }
  $('#motion-play').addEventListener('click',()=>{videosPaused=!videosPaused;syncVideos();if(!videosPaused&&reduced())videos.forEach(v=>v.play().catch(()=>{}));});
  new IntersectionObserver(entries=>{videosInView=entries[0].isIntersecting;syncVideos();},{threshold:.12}).observe($('#phone-wall'));
  document.addEventListener('visibilitychange',()=>{previousTime=0;wake();syncVideos();});
  window.addEventListener('bagin-motion-change',()=>{if(reduced()){clock=1400;paint();}previousTime=0;wake();syncVideos();});
})();
