(() => {
  'use strict';
  const section = document.querySelector('#zaver');
  const stage = section.querySelector('.finale-stage');
  const signs = [...section.querySelectorAll('.finale-sign')];
  const photos = signs.map(sign => sign.querySelector('img'));
  const solids = signs.map(sign => sign.querySelector('span'));
  const logo = section.querySelector('.finale-logo');
  const logoLeft = section.querySelector('.finale-logo-left');
  const logoRight = section.querySelector('.finale-logo-right');
  const tagline = section.querySelector('.finale-tagline');
  const caption = section.querySelector('.finale-photo-line');
  const kicker = section.querySelector('.finale-kicker');
  const cue = section.querySelector('.finale-cue');
  const replay = section.querySelector('.finale-replay');
  const clamp = v => Math.max(0, Math.min(1, v));
  const ramp = (v, a, b) => clamp((v-a)/(b-a));
  const ease = v => v*v*(3-2*v);
  const mix = (a,b,t) => a+(b-a)*t;
  const reduced = () => document.body.classList.contains('reduced');
  let top=0, distance=1, width=0, height=0, logoWidth=0, pending=false;

  function render() {
    pending=false;
    if (reduced()) return;
    const p=clamp((scrollY-top)/distance);
    const mobile=width<=700;
    const open=ease(ramp(p,.10,.32));
    const merge=ease(ramp(p,.48,.68));
    const dock=ease(ramp(p,.72,.88));
    const color=ease(ramp(p,.53,.66));
    const galleryHeight=Math.min(height*(mobile?.40:.53),620);
    const singleHeight=Math.min(height*.43,390);
    const barWidth=galleryHeight*47.5254/358.556;
    const panelWidth=width*(mobile?.176:.171);
    const finalHeight=logoWidth*103.215/511.205;
    const finalWidth=logoWidth*13.6808/511.205;
    const finalX=logoWidth*(386.647-255.6025)/511.205;
    const finalY=logoWidth*(-.7085)/511.205;
    signs.forEach((sign,i) => {
      const centerDistance=Math.abs(i-2);
      const enter=ease(ramp(p,-.065+centerDistance*.025,.10+centerDistance*.025));
      const x=mix((i-2)*width*.19,0,merge);
      const y=(1-enter)*(i%2?100:-100)+(1-merge)*(i%2?22:-14);
      const h=mix(mix(galleryHeight,singleHeight,merge),finalHeight,dock);
      const w=mix(mix(mix(barWidth,panelWidth,open),singleHeight*47.5254/358.556,merge),finalWidth,dock);
      sign.style.width=w+'px';sign.style.height=h+'px';
      sign.style.transform=`translate(-50%,-50%) translate3d(${mix(x,finalX,dock)}px,${mix(y,finalY,dock)}px,0)`;
      // Only the central mark remains once the five silhouettes have converged.
      sign.style.opacity=String(enter*(i===2?1:1-ease(ramp(p,.655,.70))));
      photos[i].style.opacity=String(1-color);
      solids[i].style.opacity=String(color);
    });
    const reveal=ease(ramp(p,.79,.91));
    logo.style.opacity=String(reveal);
    logoLeft.style.transform=`translateX(${mix(-55,0,reveal)}px)`;
    logoRight.style.transform=`translateX(${mix(55,0,reveal)}px)`;
    const tag=ease(ramp(p,.88,.965));
    tagline.style.opacity=String(tag);
    tagline.style.transform=`translateY(${mix(26,0,tag)}px)`;
    caption.style.opacity=String(ease(ramp(p,.29,.39))*(1-ease(ramp(p,.45,.54))));
    caption.style.transform=`translateY(${mix(35,0,ease(ramp(p,.29,.39)))}px)`;
    kicker.style.opacity=String(1-ease(ramp(p,.47,.60)));
    cue.style.opacity=String(1-ease(ramp(p,.82,.9)));
    replay.style.opacity=String(tag);
    replay.style.visibility=p>.94?'visible':'hidden';
    section.dataset.phase=p<.10?'arrival':p<.48?'photos':p<.72?'merge':'brand';
  }

  function schedule(){if(!pending){pending=true;requestAnimationFrame(render);}}
  function measure(){
    top=section.getBoundingClientRect().top+scrollY;
    distance=Math.max(1,section.offsetHeight-stage.offsetHeight);
    width=stage.clientWidth;height=stage.clientHeight;logoWidth=logo.clientWidth;
    schedule();
  }
  replay.addEventListener('click',()=>{measure();window.scrollTo({top:top+distance*.04,behavior:reduced()?'instant':'smooth'});});
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',measure,{passive:true});
  window.addEventListener('load',measure);
  window.addEventListener('bagin-motion-change',measure);
  new ResizeObserver(measure).observe(document.body);
  document.fonts.ready.then(measure);
  measure();
})();
