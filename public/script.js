// ===== SELECT ELEMENTS =====
const addBtn = document.getElementById("addBtn");
const soloBtn = document.getElementById("soloBtn");
const groupBtn = document.getElementById("groupBtn");

const otherBtn = document.getElementById("otherBtn");

const soloForm = document.getElementById("solo-form");
const groupForm = document.getElementById("group-form");

const nameInput = document.getElementById("nameInput");
const birthdayInput = document.getElementById("birthdayInput");
const emailInput = document.getElementById("emailInput");

const list = document.getElementById("list");
let editingGroupIndex = null;

// ===== INITIAL HIDE =====
otherBtn.style.display = "none";
soloForm.style.display = "none";
groupForm.style.display = "none";

// ===== TOGGLE BUTTONS =====
addBtn.onclick = () => {
  otherBtn.style.display =
    otherBtn.style.display === "none" ? "block" : "none";
};

soloBtn.onclick = () => {
  soloForm.style.display = "block";
  groupForm.style.display = "none";

  soloForm.scrollIntoView({ behavior: "smooth" });
};

groupBtn.onclick = () => {
  groupForm.style.display = "block";
  soloForm.style.display = "none";

  groupForm.scrollIntoView({ behavior: "smooth" });
};

// ===== SAVE SOLO =====
document.getElementById("submitsolo").onclick = async () => {
  const res = await fetch("/add-solo", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({
      name: nameInput.value,
      birthday: birthdayInput.value,
      email: emailInput.value
    })
  });

  alert(await res.text());

 nameInput.value = "";
 birthdayInput.value = "";
 emailInput.value = "";

  soloForm.style.display = "none";
  loadData();
};

// ===== SAVE GROUP =====
document.getElementById("submitgroup").onclick = async () => {
  const groupName = document.getElementById("groupName").value;

  const members = [];

  document.querySelectorAll("#membersList div").forEach(div => {
     const name = div.querySelector(".memberName").value;
      const birthday = div.querySelector(".memberBirthday").value;
      const email = div.querySelector(".memberEmail").value;

    if(name && birthday && email){
      members.push({ name, birthday, email });
    }
  });
  if(!groupName || members.length === 0) {
    alert("Group need members");
    return;
  }
const data = await fetch("/data").then(r=>r.json());

if(editingGroupIndex !== null){
  data.groups[editingGroupIndex] = {groupName, members};
  editingGroupIndex = null;
  alert("Group updated!");
}else{
  data.groups.push({groupName, members});
  alert("Group added!");
}

await fetch("/save-all",{
  method:"POST",
  headers:{"Content-Type":"application/json"},
  body: JSON.stringify(data)
});


  

  document.getElementById("groupName").value = "";
  document.getElementById("membersList").innerHTML = "";
  

groupForm.style.display = "none";
add
  loadData();
};

// ===== LOAD DATA =====
async function loadData(){
  const res = await fetch("/data");
  const data = await res.json();

  list.innerHTML = "";

  // SOLO LIST
  data.solo.forEach((m,i)=>{
    const div = document.createElement("div");
    div.innerHTML = `
      👤 
      <input value="${m.name}" id="name${i}" required>
        <input value="${m.birthday}" id="bday${i}" required>
        <input value="${m.email}" id="email${i}" required>
      
        <button onclick="editSolo(${i})">✏️</button>
      <button onclick="deleteSolo(${i})">❌</button>
    `;
    list.appendChild(div);
  });

  // GROUP LIST
  data.groups.forEach((g,gi)=>{
      if(g.members && !Array.isArray(g.members)) return;

    const gDiv = document.createElement("div");
    gDiv.innerHTML = `<h3>👥 
    <input value="${g.groupName}" id="gname${gi}" required>
    <button onclick="editGroupName(${gi})">✏️</button>
    <button onclick="deleteGroup(${gi})">❌</button>
    </h3>`;

    g.members.forEach((m,mi)=>{
      const mDiv = document.createElement("div");
      mDiv.innerHTML = `
      <input value="${m.name}"  required>
        <input value="${m.birthday}" required>
        <input value="${m.email}" required>
        <button onclick="editGroupMember(${gi},${mi})">✏️</button>
        <button onclick="deleteGroupMember(${gi},${mi})">❌</button>
      `;
      gDiv.appendChild(mDiv);
    });

  

    list.appendChild(gDiv);

    console.log(data.groups);
 
  });
}
function addMemberRow(){
   const div = document.createElement("div");

    div.innerHTML = `
    <input placeholder="Name" class="memberName" required>
    <input  type="date" class="memberBirthday" required>
    <input placeholder="email" class="memberEmail" required>
 `;
    document.getElementById("membersList").appendChild(div);
}
document.getElementById("addMemberBtn").onclick = addMemberRow;

// ===== EDIT FUNCTIONS =====
async function editSolo(i){
    const name = document.getElementById(`name${i}`).value;
    const birthday = document.getElementById(`bday${i}`).value;
    const email = document.getElementById(`email${i}`).value;

    const data = await fetch("/data").then(res=>res.json());

    data.solo[i] = { name, birthday, email };

    await fetch("/save-all",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify(data)
    });

    alert("Updated!");
}
async function editGroupName(gi){

  const data = await fetch("/data").then(r=>r.json());
  const group = data.groups[gi];

  editingGroupIndex = gi;

  groupForm.style.display = "block";
  soloForm.style.display = "none";

    document.getElementById("groupName").value = group.groupName;

    document.getElementById("membersList").innerHTML = "";

    group.members.forEach(m=>{
        addMemberRow();

        const lastRow = 
        document.querySelector("#membersList div:last-child");

        lastRow.querySelector(".memberName").value = m.name;
        lastRow.querySelector(".memberBirthday").value = m.birthday;
        lastRow.querySelector(".memberEmail").value = m.email;
    });
    groupForm.scrollIntoView({ behavior: "smooth" });
}


async function editGroupMember(gi,mi){

  const name = document.getElementById(`gmname${gi}${mi}`).value;
  const birthday = document.getElementById(`gmbday${gi}${mi}`).value;
  const email = document.getElementById(`gmemail${gi}${mi}`).value;

  const data = await fetch("/data").then(r=>r.json());

  data.groups[gi].members[mi] = {name,birthday,email};

  await fetch("/save-all",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify(data)
  });

  alert("Member updated!");
}







// ===== DELETE FUNCTIONS =====
async function deleteSolo(i){
  await fetch("/delete-solo",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({index:i})
  });
  loadData();
}

async function deleteGroup(i){
  await fetch("/delete-group",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({index:i})
  });
  loadData();
}

async function deleteGroupMember(gi,mi){
  await fetch("/delete-group-member",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({gIndex:gi,mIndex:mi})
  });
  loadData();
}

// ===== LOAD ON START =====
loadData();