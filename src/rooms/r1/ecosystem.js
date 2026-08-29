import {R1} from './constants.js';
import {onFrame,registerStatus} from '../../core/state.js';
import {val,defineControl} from '../../core/controls.js';
import {clamp} from '../../core/utils.js';
import {fish,spawnFish,despawnFish,predators,preyFish} from './troupe.js';
import {speciesForIndex} from './speciesCatalog.js';

/* R1 ecosystem: predator needs + prey hatchery.
   A FULL shark minds its own business (patrol). Below 45% energy it hunts
   the nearest prey; a chomp restores +18. At 0 it starves — drifts weakly
   until the hatchery (restock slider) returns prey to the tank. */
let restockClock=0;

export function initEcosystem(){
  defineControl({id:'sharks',label:'Sharks',group:'Ecosystem',min:0,max:3,step:1,value:1,onChange:syncPredators});
  defineControl({id:'hungerRate',label:'Hunger rate',group:'Ecosystem',min:10,max:300,step:1,value:100,fmt:v=>(v/100).toFixed(2)+'×'});
  defineControl({id:'restock',label:'Hatchery',group:'Ecosystem',min:0,max:8,step:1,value:3,fmt:v=>v+'/min'});

  onFrame(dt=>{
    const sharks=predators(),prey=preyFish();
    const hunger=val('hungerRate')/100;

    for(const p of sharks){
      const brain=p.brain;
      const burn=.8+(brain.mode==='hunt'?1.1:0);
      p.energy=clamp((p.energy??100)-dt*burn*hunger,0,100);
      if(p.energy>=95){brain.mode='patrol';brain.target=null;}
      else if(p.energy<=5){brain.mode='starve';brain.target=null;}
      else if(p.energy<45&&prey.length)brain.mode='hunt';
      else if(brain.mode==='starve'&&p.energy>15)brain.mode='patrol';

      if(brain.mode==='hunt'){
        let best=null,bd=Infinity;
        for(const q of prey){const d=p.pos.distanceToSquared(q.pos);if(d<bd){bd=d;best=q;}}
        brain.target=best;
        if(best&&bd<p.radius+best.radius+.09){
          despawnFish(best);
          p.energy=Math.min(100,p.energy+18);
          p.pulse=.22;
          brain.mode='patrol';brain.target=null;
        }
      }else brain.target=null;
    }

    /* hatchery: replenish prey toward the Prey slider target, at the plant bed */
    const target=Math.round(val('fishCount')),rate=val('restock');
    if(rate>0&&prey.length<target){
      restockClock+=dt;
      if(restockClock>=60/rate){
        restockClock=0;
        const f=spawnFish(speciesForIndex(prey.length).id);
        if(f){
          const a=Math.random()*6.28;
          f.pos.set(Math.sin(a)*1.2,-R1.TANK_H*.34,Math.cos(a)*1.2);
          f.spawnGrow=1;
        }
      }
    }else restockClock=Math.min(restockClock,55/Math.max(rate,1));
  });

  registerStatus(()=>{
    const sharks=predators(),prey=preyFish();
    const avg=sharks.length?Math.round(sharks.reduce((s,x)=>s+x.energy,0)/sharks.length):100;
    const hunting=sharks.filter(s=>s.brain.mode==='hunt').length;
    return `sharks ${sharks.length} · prey ${prey.length} · avg energy ${avg}% · hunting ${hunting}`;
  });
}

function syncPredators(){
  const target=Math.round(val('sharks'));
  let guard=6;
  while(predators().length<target&&guard-->0){
    const f=spawnFish('shark');
    if(!f)break;
  }
  const extras=predators();
  while(extras.length>target)despawnFish(extras.pop());
}
