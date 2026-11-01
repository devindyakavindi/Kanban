const KEY="my-kanban-v1";
let tasks=load();
const $=id=>document.getElementById(id);
function load(){try{return JSON.parse(localStorage.getItem(KEY)||"[]")}catch{return []}}
function save(){localStorage.setItem(KEY,JSON.stringify(tasks));render()}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7)}
function esc(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function pct(t){let all=t.stages.flatMap(s=>s.items);return all.length?Math.round(all.filter(x=>x.done).length/all.length*100):0}
function render(){
 const q=$("searchInput").value.toLowerCase(), pf=$("priorityFilter").value;
 ["todo","doing","done"].forEach(status=>{
  const list=tasks.filter(t=>t.status===status&&(`${t.title} ${t.description} ${t.stages.map(s=>s.title+" "+s.items.map(x=>x.text).join(" ")).join(" ")}`).toLowerCase().includes(q)&&(pf==="all"||String(t.priority)===pf)).sort((a,b)=>b.priority-a.priority);
  $("count-"+status).textContent=list.length;
  $("cards-"+status).innerHTML=list.length?list.map(cardHTML).join(""):'<div class="empty">No tasks here yet</div>';
 });
 const done=tasks.filter(t=>t.status==="done").length;
 $("summary").textContent=`${tasks.length} tasks · ${done} completed`;
}
function cardHTML(t){
 const progress=pct(t), subtasks=t.stages.reduce((n,s)=>n+s.items.length,0);
 return `<article class="task-card" data-id="${esc(t.id)}">
 <h3 class="task-title">${esc(t.title)}</h3>
 <div class="task-meta"><span class="priority p${t.priority}">Priority ${t.priority}</span>${t.due?`<span>Due ${esc(t.due)}</span>`:""}${t.period?`<span>${esc(t.period)}</span>`:""}</div>
 ${t.description?`<p class="task-description">${esc(t.description)}</p>`:""}
 ${subtasks?`<div class="progress-line"><span style="width:${progress}%"></span></div><div class="task-meta">${progress}% complete · ${t.stages.length} stages</div>`:""}
 ${t.stages.map((s,si)=>`<details class="stage" ${si===0?"open":""}><summary>${esc(s.title)} <span class="muted">(${s.items.filter(x=>x.done).length}/${s.items.length})</span></summary>${s.items.map((x,xi)=>`<label class="subtask ${x.done?"done":""}"><input type="checkbox" data-stage="${si}" data-item="${xi}" ${x.done?"checked":""}><span>${esc(x.text)}</span></label>`).join("")}</details>`).join("")}
 <div class="card-actions">
 <button data-action="edit">Edit</button>
 <button data-action="next">${t.status==="todo"?"Start":t.status==="doing"?"Mark done":"Reopen"}</button>
 <button data-action="delete" class="danger">Delete</button>
 </div></article>`;
}
$("taskForm").addEventListener("submit",e=>{e.preventDefault();tasks.push({id:uid(),title:$("taskTitle").value.trim(),description:$("taskDescription").value.trim(),priority:+$("taskPriority").value,due:$("taskDue").value,period:$("taskPeriod").value.trim(),status:"todo",stages:[]});e.target.reset();$("taskPriority").value="2";save()});
$("searchInput").addEventListener("input",render);$("priorityFilter").addEventListener("change",render);
document.querySelector(".board").addEventListener("change",e=>{if(e.target.matches('input[type="checkbox"][data-stage]')){const c=e.target.closest(".task-card"),t=tasks.find(x=>x.id===c.dataset.id);t.stages[+e.target.dataset.stage].items[+e.target.dataset.item].done=e.target.checked;save()}});
document.querySelector(".board").addEventListener("click",e=>{const b=e.target.closest("button[data-action]");if(!b)return;const c=b.closest(".task-card"),t=tasks.find(x=>x.id===c.dataset.id);if(b.dataset.action==="delete"){if(confirm("Delete this task?")){tasks=tasks.filter(x=>x.id!==t.id);save()}}if(b.dataset.action==="next"){t.status=t.status==="todo"?"doing":t.status==="doing"?"done":"todo";save()}if(b.dataset.action==="edit")openEdit(t)});
function openEdit(t){$("editId").value=t.id;$("editTitle").value=t.title;$("editDescription").value=t.description;$("editPriority").value=t.priority;$("editDue").value=t.due;$("editPeriod").value=t.period;$("editStatus").value=t.status;$("editDialog").showModal()}
$("editForm").addEventListener("submit",e=>{if(e.submitter?.value==="cancel")return;e.preventDefault();const t=tasks.find(x=>x.id===$("editId").value);if(!t)return;t.title=$("editTitle").value.trim();t.description=$("editDescription").value.trim();t.priority=+$("editPriority").value;t.due=$("editDue").value;t.period=$("editPeriod").value.trim();t.status=$("editStatus").value;$("editDialog").close();save()});
function parsePlan(raw){
 const lines=raw.replace(/\r/g,"").split("\n").map(x=>x.trim()).filter(Boolean);
 const title=(lines.find(x=>!/^(\[ ?[xX]?\]|[-*])\s/.test(x)&&!/^stage\s*\d+/i.test(x))||"Imported task").replace(/^#*\s*/,"").trim();
 const stages=[];let current=null;
 for(const line of lines){
  const h=line.match(/^#{1,4}\s*(stage\s*\d+.*)|^(stage\s*\d+\s*[-:—].*)$/i);
  if(h){current={title:(h[1]||h[2]).replace(/^#+\s*/,""),items:[]};stages.push(current);continue}
  const item=line.match(/^(?:[-*]\s*)?\[([ xX])\]\s*(.+)$/);
  if(item){if(!current){current={title:"Tasks",items:[]};stages.push(current)}current.items.push({text:item[2],done:item[1].toLowerCase()==="x"});continue}
 }
 return {title,description:lines.find(x=>x!==title&&!/^stage\s*\d+/i.test(x)&&!/^[-*]?\s*\[/.test(x))||"",stages};
}
function showPreview(p){$("preview").hidden=false;$("preview").innerHTML=`<strong>${esc(p.title)}</strong><p>${p.stages.length} stages · ${p.stages.reduce((n,s)=>n+s.items.length,0)} checklist items</p>${p.stages.map(s=>`<div>• ${esc(s.title)} — ${s.items.length} items</div>`).join("")||"<p>No stage headings or [ ] checklist items detected.</p>"}`}
let pendingPlan=null;
$("previewBtn").addEventListener("click",()=>{pendingPlan=parsePlan($("pasteArea").value);showPreview(pendingPlan)});
$("importTextBtn").addEventListener("click",()=>{const raw=$("pasteArea").value.trim();if(!raw){alert("Paste your plan first.");return}const p=parsePlan(raw);if(!p.stages.length&&!confirm("No checklist items were detected. Import as a simple task?"))return;tasks.push({id:uid(),title:p.title,description:p.description,priority:2,due:"",period:p.stages.length?`${p.stages.length} stages`:"",status:"todo",stages:p.stages});$("pasteArea").value="";$("preview").hidden=true;save()});
$("fileInput").addEventListener("change",async e=>{const f=e.target.files[0];if(!f)return;try{const text=await f.text();if(f.name.toLowerCase().endsWith(".json")){const data=JSON.parse(text);if(!Array.isArray(data))throw Error("JSON backup must contain a task list.");tasks=[...tasks,...data.map(t=>({...t,id:uid()}))];save()}else{$("pasteArea").value=text;pendingPlan=parsePlan(text);showPreview(pendingPlan);$("pasteArea").scrollIntoView({behavior:"smooth",block:"center"});alert("File loaded into the paste box. Check the preview, then choose Import plan.")}}catch(err){alert("Could not read this file: "+err.message)}e.target.value=""});
$("exportBtn").addEventListener("click",()=>{const blob=new Blob([JSON.stringify(tasks,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="my-kanban-backup.json";a.click();URL.revokeObjectURL(a.href)});
if("serviceWorker" in navigator && location.protocol.startsWith("http"))navigator.serviceWorker.register("./sw.js").catch(()=>{});
let installPrompt;$("installBtn").hidden=true;window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();installPrompt=e;$("installBtn").hidden=false});$("installBtn").addEventListener("click",async()=>{if(!installPrompt)return;installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;$("installBtn").hidden=true});
render();