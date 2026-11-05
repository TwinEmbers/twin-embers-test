document.getElementById('year').textContent=new Date().getFullYear();
const form=document.getElementById('skin-form');
const result=document.getElementById('routine-result');
form.addEventListener('submit',event=>{
 event.preventDefault();
 const data=new FormData(form), skin=data.get('skin'), goal=data.get('goal'), sensitive=data.get('sensitive');
 const names={dry:'dry-feeling',oily:'oily',combination:'combination',balanced:'generally balanced',unsure:'not-yet-sure'};
 const cleanser=skin==='dry'||sensitive==='yes'?'gentle, non-foaming cleanser':'gentle cleanser';
 const moisturizer=skin==='dry'?'fragrance-free cream moisturizer':skin==='oily'?'lightweight, non-comedogenic moisturizer':'fragrance-free moisturizer';
 let tip='Consistency with a basic routine matters more than having lots of products.';
 if(goal==='hydration')tip='Apply moisturizer while skin is slightly damp to help retain moisture.';
 if(goal==='breakouts')tip='Choose non-comedogenic products. If breakouts persist, ask a healthcare professional about appropriate treatment.';
 if(goal==='tone')tip='Daily broad-spectrum sunscreen is a helpful foundation for managing uneven-looking tone.';
 if(sensitive==='yes')tip='Because your skin often reacts, avoid introducing multiple new products at once; patch-test first and stop products that irritate.';
 const safe=(str)=>String(str).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 result.innerHTML=`<p class="eyebrow">YOUR PERSONAL STARTING POINT</p><h3>Your Twin Embers ritual</h3><p>Based on your answers, your skin sounds <strong>${safe(names[skin])}</strong>. This is a starting point, not a skin-type diagnosis.</p><div class="routine-grid"><article><h4>☀ Morning</h4><ol><li>Rinse with lukewarm water or use a ${safe(cleanser)}.</li><li>Apply a ${safe(moisturizer)}.</li><li>Finish with broad-spectrum SPF 30 or higher sunscreen.</li></ol></article><article><h4>☾ Evening</h4><ol><li>Cleanse gently to remove sunscreen and daily buildup.</li><li>Apply your ${safe(moisturizer)}.</li><li>Keep the routine simple and watch how your skin responds.</li></ol></article></div><p><strong>A little extra guidance:</strong> ${safe(tip)}</p><div class="result-actions"><button type="button" id="print-routine">Print / Save as PDF</button><button type="button" id="restart-routine">Start again</button></div>`;
 try{localStorage.setItem('twinEmbersDiscoveryV4',JSON.stringify({skin,goal,sensitive}))}catch(e){}
 window.dispatchEvent(new Event('twinEmbersUpdate'));
 result.hidden=false;
 result.scrollIntoView({behavior:'smooth',block:'start'});
 document.getElementById('print-routine').addEventListener('click',()=>window.print());
 document.getElementById('restart-routine').addEventListener('click',()=>{form.reset();result.hidden=true;form.scrollIntoView({behavior:'smooth'});});
});

// Version 3: Personal Cabinet — data stays in this browser, no account or server.
(()=>{
 const KEY='twinEmbersCabinetV3', LIMIT=3;
 const form=document.getElementById('cabinet-form'), itemsEl=document.getElementById('cabinet-items'), feedback=document.getElementById('cabinet-feedback');
 const count=document.getElementById('cabinet-count'), save=document.getElementById('cabinet-save'), cancel=document.getElementById('cabinet-cancel');
 let products=[], editing=null, filter='All', storageAvailable=true;
 try{const raw=localStorage.getItem(KEY);if(raw){const parsed=JSON.parse(raw);if(Array.isArray(parsed))products=parsed.filter(p=>p&&typeof p.id==='string'&&typeof p.brand==='string'&&typeof p.product==='string').slice(0,LIMIT)}}catch(e){storageAvailable=false;feedback.textContent='Browser storage is unavailable. Changes may not be saved after closing this page.'}
 const make=(tag,cls,text)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el};
 function persist(){try{localStorage.setItem(KEY,JSON.stringify(products));storageAvailable=true;return true}catch(e){storageAvailable=false;feedback.textContent='Unable to save on this device. Check browser storage settings.';return false}}
 function render(){window.dispatchEvent(new Event('twinEmbersUpdate'));count.textContent=`${products.length} / ${LIMIT}`;itemsEl.replaceChildren();const visible=products.filter(p=>filter==='All'||p.when===filter||p.when==='Both');if(!visible.length){itemsEl.append(make('div','cabinet-empty',products.length?'No products assigned to this routine yet.':'Your cabinet is empty. Add your first product to begin.'))}for(const p of visible){const card=make('article','cabinet-card');card.append(make('div','product-type',p.type),make('h4','',p.product),make('p','',p.brand),make('p','when',p.when==='Both'?'☀ Morning · ☾ Evening':p.when==='Morning'?'☀ Morning':p.when==='Evening'?'☾ Evening':'Not assigned'));if(p.notes)card.append(make('p','',p.notes));const actions=make('div','card-actions'),edit=make('button','', 'Edit'),remove=make('button','','Remove');edit.type=remove.type='button';edit.addEventListener('click',()=>{editing=p.id;form.elements.brand.value=p.brand;form.elements.product.value=p.product;form.elements.type.value=p.type;form.elements.when.value=p.when;form.elements.notes.value=p.notes||'';document.getElementById('cabinet-form-title').textContent='Edit product';save.textContent='Save changes';cancel.hidden=false;feedback.textContent='';form.scrollIntoView({behavior:'smooth',block:'center'});});remove.addEventListener('click',()=>{if(!confirm(`Remove “${p.product}” from your cabinet?`))return;products=products.filter(x=>x.id!==p.id);if(editing===p.id)reset();persist();render();feedback.textContent='Product removed.';});actions.append(edit,remove);card.append(actions);itemsEl.append(card)}save.disabled=products.length>=LIMIT&&editing===null;save.title=save.disabled?'Your free cabinet holds up to three products. Edit or remove an item to add another.':''}
 function reset(){form.reset();editing=null;document.getElementById('cabinet-form-title').textContent='Add a product';save.textContent='Add to my cabinet';cancel.hidden=true;render()}
 form.addEventListener('submit',e=>{e.preventDefault();const data=new FormData(form);const brand=String(data.get('brand')||'').trim().slice(0,70),product=String(data.get('product')||'').trim().slice(0,90),type=String(data.get('type')),when=String(data.get('when')),notes=String(data.get('notes')||'').trim().slice(0,240);if(!brand||!product){feedback.textContent='Please enter both a brand and product name.';return}if(!['Cleanser','Moisturizer','Sunscreen','Serum','Toner','Other'].includes(type)||!['Both','Morning','Evening','Not assigned'].includes(when))return;if(editing){const i=products.findIndex(p=>p.id===editing);if(i<0)return;products[i]={id:editing,brand,product,type,when,notes}}else{if(products.length>=LIMIT){feedback.textContent='Your free cabinet holds three products. Remove one before adding another.';return}products.push({id:Date.now().toString(36)+Math.random().toString(36).slice(2),brand,product,type,when,notes})}const message=editing?'Changes saved.':'Product added to your cabinet.';persist();reset();if(storageAvailable)feedback.textContent=message;});cancel.addEventListener('click',()=>{reset();feedback.textContent='Edit cancelled.'});document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{filter=button.dataset.filter;document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));render()}));render();
})();

// Version 4: Match product type + assigned time against basic routine steps.
(()=>{
 const status=document.getElementById('match-status'),content=document.getElementById('match-content');
 const safe=(s)=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[c]));
 function read(key){try{return JSON.parse(localStorage.getItem(key)||'null')}catch(e){return null}}
 function draw(){
  const discovery=read('twinEmbersDiscoveryV4');const products=read('twinEmbersCabinetV3');const cabinet=Array.isArray(products)?products.filter(p=>p&&typeof p.type==='string'):[];
  status.textContent=discovery?'Your Skin Discovery results are connected to your cabinet.':'Start with Skin Discovery to personalize your routine. You can still preview the basic steps below.';
  const sensitive=discovery&&discovery.sensitive==='yes';
  const plans=[{title:'☀ Morning',when:'Morning',steps:[['Cleanser','Cleanse (optional in the morning)'],['Moisturizer','Moisturize'],['Sunscreen','Protect with broad-spectrum SPF 30+']]},{title:'☾ Evening',when:'Evening',steps:[['Cleanser','Cleanse'],['Moisturizer','Moisturize']]}];
  content.replaceChildren();
  const grid=document.createElement('div');grid.className='match-grid';
  for(const plan of plans){const card=document.createElement('article');card.className='match-panel';const heading=document.createElement('h3');heading.textContent=plan.title;card.append(heading);
   for(const [type,label] of plan.steps){const matches=cabinet.filter(p=>p.type===type&&(p.when===plan.when||p.when==='Both'));const row=document.createElement('div');row.className='match-step';const mark=document.createElement('span');mark.className=matches.length?'match-pill found':'match-pill missing';mark.textContent=matches.length?'In cabinet':type==='Cleanser'&&plan.when==='Morning'?'Optional':'Not listed';const info=document.createElement('div');const name=document.createElement('strong');name.textContent=label;info.append(name);const detail=document.createElement('p');detail.textContent=matches.length?matches.map(p=>p.brand+' · '+p.product).join(' / '):type==='Cleanser'&&plan.when==='Morning'?'Water alone may be enough for some people.':'No matching product assigned to this time of day.';info.append(detail);row.append(mark,info);card.append(row)}grid.append(card)}content.append(grid);
  const note=document.createElement('p');note.className='match-tip';note.textContent=sensitive?'Your answers suggest sensitivity: introduce one new product at a time, patch-test, and stop anything that irritates.':'Tip: You do not need a large collection to build a consistent basic routine.';content.append(note);
  const link=document.createElement('a');link.href='#cabinet';link.className='secondary match-link';link.textContent='Add or edit my products ↗';content.append(link);
 }
 window.addEventListener('twinEmbersUpdate',draw);window.addEventListener('storage',draw);draw();
})();
