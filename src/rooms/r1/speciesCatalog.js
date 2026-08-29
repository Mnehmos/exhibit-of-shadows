/* Plant Forge pattern: species data drives the troupe; look and feel live in artDirection. */
export const SPECIES=[
  {id:'clownfish',file:'clownfish.glb',length:.7,speed:1.15,share:.45},
  {id:'butterfly-fish',file:'butterfly-fish.glb',length:.95,speed:1.0,share:.33},
  {id:'shark',file:'shark.glb',length:1.9,speed:.62,share:.22},
];

/* deterministic species assignment: golden-ratio walk over the share table */
export function speciesForIndex(i){
  let r=((i+.5)*.6180339887)%1;
  const total=SPECIES.reduce((s,x)=>s+x.share,0);
  r*=total;
  let acc=0;
  for(const s of SPECIES){acc+=s.share;if(r<=acc)return s;}
  return SPECIES[0];
}
