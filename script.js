const STATS = {
 rice:{N:[77.4,10.31],P:[46.4,8.69],K:[42,1.41],temperature:[22.46,2.23],humidity:[81.28,0.88],ph:[7.2,0.48],rainfall:[239.83,23.02]},
 maize:{N:[69.2,7.33],P:[47,7.1],K:[18,2.1],temperature:[22.14,2.68],humidity:[65.45,5.41],ph:[6.38,0.45],rainfall:[76.57,15.87]},
 banana:{N:[94,10.83],P:[86.8,8.47],K:[50.4,2.87],temperature:[27.89,1.28],humidity:[80.48,2.67],ph:[5.94,0.26],rainfall:[100.43,8.35]},
 mango:{N:[17.4,14.68],P:[26.6,6.92],K:[28.4,2.65],temperature:[31.95,3.17],humidity:[49.75,3.55],ph:[5.76,0.56],rainfall:[94.5,3.01]},
 grapes:{N:[23.8,7.33],P:[130.6,7.34],K:[199.2,4.35],temperature:[30.53,4.99],humidity:[82.45,1.25],ph:[6.0,0.16],rainfall:[67.29,1.21]},
 watermelon:{N:[110,9.92],P:[20.8,7.36],K:[51.6,1.85],temperature:[25.66,0.74],humidity:[83.16,2.72],ph:[6.6,0.25],rainfall:[51.48,6.18]},
 apple:{N:[14.6,6.62],P:[129.8,7.81],K:[200,3.22],temperature:[22.76,0.91],humidity:[92.49,1.65],ph:[5.96,0.34],rainfall:[115.77,3.83]},
 orange:{N:[22.6,9.77],P:[14.4,8.64],K:[9.8,2.48],temperature:[20.71,6.11],humidity:[91.8,0.42],ph:[7.23,0.49],rainfall:[111.48,5.85]},
 cotton:{N:[126.4,11.67],P:[43,4.94],K:[21.6,2.24],temperature:[24.34,0.78],humidity:[80.06,3.63],ph:[6.96,0.48],rainfall:[86.21,7.51]},
 coffee:{N:[101,12.12],P:[26.4,6.34],K:[30.4,3.83],temperature:[25.21,1.21],humidity:[56.43,2.47],ph:[6.91,0.39],rainfall:[148.51,23.27]}
};
const FIELDS=[['N','Nitrogen (N)',0,140,90],['P','Phosphorus (P)',0,145,42],['K','Potassium (K)',0,205,43],
['temperature','Temperature (C)',0,45,21],['humidity','Humidity (%)',0,100,82],['ph','Soil pH',0,14,6.5],['rainfall','Rainfall (mm)',0,300,203]];

const box=document.getElementById('inputs');
FIELDS.forEach(([id,label,min,max,val])=>{
  const d=document.createElement('div');d.className='field';
  d.innerHTML=`<label>${label}<span id="${id}-out">${val}</span></label><input type="range" id="${id}" min="${min}" max="${max}" step="0.1" value="${val}">`;
  box.appendChild(d);
});
FIELDS.forEach(([id])=>{
  document.getElementById(id).addEventListener('input',e=>{document.getElementById(id+'-out').textContent=e.target.value;});
});

function recommend(){
  const input={};
  FIELDS.forEach(([id])=>{input[id]=parseFloat(document.getElementById(id).value);});
  const scores=[];
  for(const crop in STATS){
    let d2=0;
    FIELDS.forEach(([id])=>{
      const [m,s]=STATS[crop][id];
      const z=(input[id]-m)/(s||1);
      d2+=z*z;
    });
    scores.push([crop,d2]);
  }
  scores.sort((a,b)=>a[1]-b[1]);
  const top=scores.slice(0,3);
  const weights=top.map(s=>Math.exp(-s[1]/2));
  const total=weights.reduce((a,b)=>a+b,0);
  const probs=top.map((s,i)=>Math.round(weights[i]/total*100));

  document.getElementById('results').style.display='block';
  const bars=document.getElementById('bars');
  bars.innerHTML='';
  top.forEach((s,i)=>{
    const row=document.createElement('div');row.className='crop-row';
    row.innerHTML=`<div class="crop-name">${s[0]}</div><div class="bar-bg"><div class="bar-fill" style="width:${probs[i]}%"></div></div><div class="pct">${probs[i]}%</div>`;
    bars.appendChild(row);
  });

  const topCrop=top[0][0], topProb=probs[0];
  const disc=document.getElementById('disclaimer');
  disc.innerHTML = topProb<40 ? `<div class="warn">Confidence is low for this input combination — treat this as a rough suggestion and consult a local agricultural expert before acting on it.</div>` : '';

  const stats=STATS[topCrop];
  const notes=[];
  ['N','P','K'].forEach(k=>{
    const [m,s]=stats[k];
    if(input[k] < m-s) notes.push(`${k} is lower than typical for ${topCrop} — consider a ${k==='N'?'nitrogen':k==='P'?'phosphorus':'potassium'}-rich fertilizer.`);
    else if(input[k] > m+s) notes.push(`${k} is higher than typical for ${topCrop} — may not need extra ${k==='N'?'nitrogen':k==='P'?'phosphorus':'potassium'}.`);
  });
  document.getElementById('fert').textContent = notes.length? notes.join(' ') : `N, P and K levels are within the typical range for ${topCrop}.`;
}
recommend();
