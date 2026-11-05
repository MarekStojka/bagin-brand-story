(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const preview = $('#type-preview'), input = $('#type-input'), weight = $('#type-weight');
  const glyphInput = $('#glyph-input'), posters = $$('.glyph-poster'), copies = $$('.glyph-copy');
  const canvas = document.createElement('canvas'), context = canvas.getContext('2d');
  const reduced = () => document.body.classList.contains('reduced') || matchMedia('(prefers-reduced-motion: reduce)').matches;
  let palette = 'original';

  function words(element, text, className) {
    element.replaceChildren();
    text.split(/\s+/).filter(Boolean).forEach((word, i) => {
      if (i) element.append(document.createTextNode(' '));
      const span = document.createElement('span');span.className=className;span.textContent=word;element.append(span);
    });
  }
  function measureText(text, size, value=900) {context.font=`${value} ${size}px Archivo`;return context.measureText(text).width;}
  function renderType() {
    const text=(input.value.trim() || 'VŠECHNO JE IN!').toLocaleUpperCase('cs');
    words(preview,text,'type-word');
    const available=preview.clientWidth;
    const maximum=innerWidth<=700?Math.min(90,innerWidth*.133):Math.min(145,innerWidth*.085);
    const longest=Math.max(...text.split(/\s+/).map(word=>measureText(word,100,weight.value)),1);
    preview.style.fontSize=Math.min(maximum,available/longest*98)+'px';
    preview.style.fontWeight=weight.value;
    $('#weight-value').value=weight.value;
    $('#type-tone').textContent=Number(weight.value)<500?'Klidný hlas.':Number(weight.value)<800?'Pevný hlas.':'Výrazný hlas.';
    $$('[data-type-weight]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.typeWeight===weight.value)));
  }
  input.addEventListener('input',renderType);weight.addEventListener('input',renderType);
  $$('[data-type-weight]').forEach(button=>button.addEventListener('click',()=>{weight.value=button.dataset.typeWeight;renderType();}));

  const palettes={
    original:[['#f8eedf','#111111','#749aca','#111111'],['#d9e7f3','#111111','#2b5cb1','#ffffff'],['#fa780d','#111111','#ffffff','#111111'],['#8cffd9','#111111','#ffffff','#111111'],['#ffffff','#111111','#749aca','#111111'],['#749aca','#111111','#ffffff','#111111']],
    pastel:[['#f8eedf','#22262a','#749aca','#111111'],['#eadde9','#27232a','#8e749b','#ffffff'],['#d9e7f3','#253548','#f8eedf','#253548'],['#dbe9d8','#23342a','#ffffff','#23342a'],['#f2dfd8','#322920','#9c5447','#ffffff'],['#e5dff1','#292139','#ffffff','#292139']],
    bold:[['#890047','#ffffff','#8cffd9','#111111'],['#111111','#8cffd9','#ffffff','#111111'],['#fa780d','#111111','#ffffff','#111111'],['#2b5cb1','#ffffff','#8cffd9','#111111'],['#efc96f','#111111','#890047','#ffffff'],['#8cffd9','#111111','#2b5cb1','#ffffff']]
  };
  function colorPosters() {
    posters.forEach((poster,i)=>['--bg','--ink','--accent','--accent-ink'].forEach((name,n)=>poster.style.setProperty(name,palettes[palette][i][n])));
    $$('[data-glyph-palette]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.glyphPalette===palette)));
    updateReset();
  }
  function updateReset() {$('#glyph-reset').disabled=!glyphInput.value&&palette==='original';}
  function renderCopies() {
    const custom=glyphInput.value.trim().toLocaleUpperCase('cs');
    const parts=custom.split(/\s+/).filter(Boolean);
    const split=Math.max(1,Math.ceil(parts.length/2));
    copies.forEach(copy=>{
      let text=custom || copy.dataset.default;
      if(custom && copy.dataset.part) text=copy.dataset.part==='first'?parts.slice(0,split).join(' '):(parts.slice(split).join(' ') || custom);
      if(copy.dataset.wrap) words(copy,text,'glyph-word');else copy.textContent=text;
    });
    fitCopies();updateReset();
  }
  function fitCopies() {
    posters.forEach(poster=>{
      const w=poster.clientWidth,h=poster.clientHeight,layout=poster.dataset.layout;
      poster.querySelectorAll('.glyph-copy').forEach(copy=>{
        const text=copy.textContent;
        let max=w*.16,space=w*.8;
        if(layout==='a'){max=w*.17;space=w*.59;}
        if(layout==='b'){max=w*.16;space=h*.66;}
        if(layout==='c'){max=w*.08;space=h*.47;}
        if(layout==='d'){max=w*.06;space=w*.58;}
        if(layout==='e'){max=w*.22;space=w*.78;}
        if(layout==='f'){max=w*.15;space=w*.81;}
        const measured=copy.dataset.wrap?Math.max(...text.split(/\s+/).map(word=>measureText(word,100)),1):Math.max(1,measureText(text,100));
        copy.style.fontSize=Math.min(max,space/measured*96)+'px';
      });
    });
  }
  glyphInput.addEventListener('input',renderCopies);
  $$('[data-glyph-palette]').forEach(button=>button.addEventListener('click',()=>{palette=button.dataset.glyphPalette;colorPosters();}));
  $('#glyph-reset').addEventListener('click',()=>{palette='original';glyphInput.value='';colorPosters();renderCopies();});

  function animate(poster, delay=0) {
    if(reduced())return;
    poster.querySelectorAll('.glyph-motion').forEach((part,i)=>{
      part.getAnimations().forEach(animation=>animation.cancel());
      const sideways=poster.dataset.layout==='d';
      const offset=sideways?`translateX(${i%2?-35:35}px)`:`translateY(${i%2?-35:35}px)`;
      part.animate([{transform:offset+' scale(.88)',opacity:.35},{transform:'translate(0,0) scale(1.04)',opacity:1,offset:.64},{transform:'translate(0,0) scale(1)',opacity:1}],{duration:760,delay:delay+i*75,easing:'cubic-bezier(.16,1,.3,1)'});
    });
  }
  posters.forEach(poster=>poster.addEventListener('click',()=>animate(poster)));
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){animate(entry.target,posters.indexOf(entry.target)%3*100);observer.unobserve(entry.target);}}),{threshold:.3});
  posters.forEach(poster=>observer.observe(poster));
  window.addEventListener('bagin-motion-change',()=>{if(reduced())posters.forEach(poster=>poster.querySelectorAll('.glyph-motion').forEach(part=>part.getAnimations().forEach(animation=>animation.cancel())));});
  let pending=false;
  function resize(){if(!pending){pending=true;requestAnimationFrame(()=>{pending=false;renderType();fitCopies();});}}
  new ResizeObserver(resize).observe($('.type-composition'));
  new ResizeObserver(resize).observe($('.glyph-gallery'));
  window.addEventListener('resize',resize,{passive:true});
  document.fonts.ready.then(resize);
  colorPosters();renderCopies();renderType();
})();
