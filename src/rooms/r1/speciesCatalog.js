/* Plant Forge pattern: species data drives the troupe; look and feel live in artDirection.
   role: 'prey' schools and flees | 'predator' hunts via the ecosystem needs system */
export const SPECIES=[
  {id:'clownfish',file:'clownfish.glb',length:.7,speed:1.15,share:.6,role:'prey'},
  {id:'butterfly-fish',file:'butterfly-fish.glb',length:.95,speed:1.0,share:.4,role:'prey'},
  {id:'shark',file:'shark.glb',length:1.9,speed:.62,share:0,role:'predator',bite:18},
];

const PREY=SPECIES.filter(s=>s.role==='prey');

/* deterministic prey assignment: golden-ratio walk over the share table */
export function speciesForIndex(i){
  let r=((i+.5)*.6180339887)%1;
  const total=PREY.reduce((s,x)=>s+x.share,0);
  r*=total;
  let acc=0;
  for(const s of PREY){acc+=s.share;if(r<=acc)return s;}
  return PREY[0];
}
export function speciesById(id){return SPECIES.find(s=>s.id===id)||null;}

