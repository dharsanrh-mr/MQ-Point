const KEY="rummyArena_v1";
const defaultState={gameNo:1,players:[],rounds:[],history:[],rule:"highest",winner:null};
let state=load();
function load(){try{return {...defaultState,...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch(e){return {...defaultState}}}
function save(){localStorage.setItem(KEY,JSON.stringify(state));render()}
function toast(msg){const t=document.getElementById("toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),1800)}
function totals(){return state.players.map((name,i)=>({name,total:state.rounds.reduce((s,r)=>s+(Number(r.scores[i])||0),0)}))}
function ranked(){const a=totals();a.sort((x,y)=>state.rule==="highest"?y.total-x.total:x.total-y.total);return a}
function go(id){document.querySelectorAll(".page").forEach(p=>p.classList.toggle("active",p.id===id));document.querySelectorAll(".nav-item").forEach(n=>n.classList.toggle("active",n.dataset.page===id)); if(id==="roundPage")renderScoreInputs(); window.scrollTo({top:0,behavior:"smooth"})}
function render(){
  document.getElementById("gameLabel").textContent=`GAME #${state.gameNo}`;
  document.getElementById("playerCount").textContent=state.players.length;
  document.getElementById("roundCount").textContent=state.rounds.length;
  const r=ranked(), lead=r[0];
  document.getElementById("leaderName").textContent=lead?.name||"—";
  document.getElementById("topScore").textContent=lead?.total||0;
  const winner=state.winner|| (state.history[0]&&state.history[0].winner);
  document.getElementById("winnerName").textContent=winner?.name||"—";
  document.getElementById("winnerScore").textContent=winner?.score||0;
  document.getElementById("winnerDate").textContent=winner?.date||"Finish a game to see the winner";
  document.getElementById("rankingList").innerHTML=r.slice(0,5).map((p,i)=>`<div class="list-row"><span class="rank">${i+1}</span><div><strong>${esc(p.name)}</strong><small>${state.rounds.length} rounds</small></div><span class="points">${p.total}</span></div>`).join("")||`<div class="muted">Add players to begin.</div>`;
  document.getElementById("winnerList").innerHTML=state.history.slice(0,5).map(g=>`<div class="list-row"><span class="rank">♛</span><div><strong>${esc(g.winner.name)}</strong><small>${g.date}</small></div><span class="points">${g.winner.score}</span></div>`).join("")||`<div class="muted">No completed games yet.</div>`;
  renderTable(); renderPlayers(); renderHistory();
  document.getElementById("ruleSelect").value=state.rule;
}
function renderTable(){
  const head=document.getElementById("tableHead"), body=document.getElementById("tableBody");
  head.innerHTML=`<tr><th>RANK</th><th>PLAYER</th>${state.rounds.map((_,i)=>`<th>R${i+1}</th>`).join("")}<th>TOTAL</th></tr>`;
  const rankedPlayers=ranked();
  body.innerHTML=rankedPlayers.map((p,rank)=>{
    const idx=state.players.indexOf(p.name);
    return `<tr class="${rank===0?'leader-row':''}"><td>${rank+1}</td><td>${esc(p.name)}</td>${state.rounds.map(r=>`<td>${Number(r.scores[idx])||0}</td>`).join("")}<td>${p.total}</td></tr>`
  }).join("");
}
function renderPlayers(){document.getElementById("playerChips").innerHTML=state.players.map((p,i)=>`<span class="chip">${esc(p)} <button onclick="removePlayer(${i})">×</button></span>`).join("")||`<span class="muted">No players added.</span>`}
function renderScoreInputs(){document.getElementById("nextRoundNo").textContent=state.rounds.length+1;document.getElementById("scoreInputs").innerHTML=state.players.map(p=>`<div class="score-line"><span>${esc(p)}</span><input type="number" min="0" inputmode="numeric" data-player="${escAttr(p)}" placeholder="0"></div>`).join("")||`<div class="muted">Add players first.</div>`}
function renderHistory(){document.getElementById("historyList").innerHTML=state.history.map((g,i)=>`<div class="history-card"><strong>GAME #${g.gameNo}</strong><div>${esc(g.winner.name)} — ${g.winner.score} points</div><div class="muted">${g.date} • ${g.players.length} players • ${g.rounds.length} rounds</div><button class="outline-btn" onclick="deleteHistory(${i})">DELETE</button></div>`).join("")||`<div class="muted">Completed games will appear here.</div>`}
function addPlayer(){const input=document.getElementById("playerInput"),name=input.value.trim();if(!name)return toast("Enter a player name");if(state.players.some(p=>p.toLowerCase()===name.toLowerCase()))return toast("Player already exists");state.players.push(name);input.value="";save();toast("Player added")}
function removePlayer(i){if(!confirm(`Remove ${state.players[i]}?`))return;state.players.splice(i,1);state.rounds.forEach(r=>r.scores.splice(i,1));save()}
function addRound(){if(!state.players.length)return toast("Add players first");go("roundPage")}
function saveRound(){const inputs=[...document.querySelectorAll("#scoreInputs input")];const scores=state.players.map(p=>Number(inputs.find(x=>x.dataset.player===p)?.value)||0);state.rounds.push({scores,date:new Date().toLocaleString()});state.winner=null;save();toast(`Round ${state.rounds.length} saved`);go("tablePage")}
function finishGame(){if(!state.players.length||!state.rounds.length)return toast("Add players and at least one round");const r=ranked()[0],winner={name:r.name,score:r.total,date:new Date().toLocaleString()};state.winner=winner;state.history.unshift({gameNo:state.gameNo,players:[...state.players],rounds:JSON.parse(JSON.stringify(state.rounds)),winner});save();toast(`${winner.name} wins!`)}
function newGame(){if(state.players.length&&state.rounds.length){const r=ranked()[0];const w={name:r.name,score:r.total,date:new Date().toLocaleString()};state.history.unshift({gameNo:state.gameNo,players:[...state.players],rounds:JSON.parse(JSON.stringify(state.rounds)),winner:w})}state.gameNo++;state.players=[];state.rounds=[];state.winner=null;save();go("addPage");toast(`Game #${state.gameNo} ready`)}
function startGame(){if(state.players.length===0)return toast("Add at least one player");state.rounds=[];state.winner=null;save();go("tablePage")}
function deleteHistory(i){if(confirm("Delete this game from history?")){state.history.splice(i,1);save()}}
function backup(){const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`rummy-arena-backup-${Date.now()}.json`;a.click();URL.revokeObjectURL(a.href)}
function restore(file){const reader=new FileReader();reader.onload=()=>{try{state={...defaultState,...JSON.parse(reader.result)};save();toast("Backup restored")}catch(e){toast("Invalid backup file")}};reader.readAsText(file)}
function esc(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function escAttr(s){return esc(s)}
document.addEventListener("click",e=>{const n=e.target.closest("[data-page]");if(n)go(n.dataset.page)});
document.getElementById("savePlayerBtn").onclick=addPlayer;
document.getElementById("playerInput").addEventListener("keydown",e=>{if(e.key==="Enter")addPlayer()});
document.getElementById("addRoundBtn").onclick=addRound;
document.getElementById("saveRoundBtn").onclick=saveRound;
document.getElementById("finishBtn").onclick=finishGame;
document.getElementById("newGameBtn").onclick=newGame;
document.getElementById("startGameBtn").onclick=startGame;
document.getElementById("backupBtn").onclick=backup;
document.getElementById("restoreInput").onchange=e=>e.target.files[0]&&restore(e.target.files[0]);
document.getElementById("clearAllBtn").onclick=()=>{if(confirm("Clear ALL local Rummy Arena data?")){localStorage.removeItem(KEY);state={...defaultState};render();toast("All data cleared")}};
document.getElementById("ruleSelect").onchange=e=>{state.rule=e.target.value;save();toast("Scoring rule updated")};
render();