document.addEventListener("DOMContentLoaded", () => {

let currentUser = { id: null, username: null};
let editingDanceId = null;
let bulkEditMode = false;
loadDances();

const authModal = document.getElementById("auth-modal");
const addDanceModal = document.getElementById("add-dance-modal");

const videoModal = document.getElementById("video-modal");
const videoPlayer = document.getElementById("dance-video-player");
const videoSource = document.getElementById("dance-video-source");
const videoTitle = document.getElementById("video-title");
const closeVideoBtn = document.getElementById("close-video-modal");

closeVideoBtn.addEventListener("click", () => {
    videoPlayer.pause();          
    videoSource.src = "";         
    videoModal.classList.add("hidden");
});

document.querySelector(".dances-container").addEventListener("click", (e) => {
    const card = e.target.closest(".dance-card");
    if(!card) return;

    if (e.target.closest(".card-meanu")) return;

    if (!requireAuth()) return; 
    
    
    const danceId = card.dataset.id;
    const dance = allDances.find(d => d.id == danceId);
    
    if (!dance || !dance.video_url) {
        alert("No video available for this dance.");
        return;
    }

      
        videoSource.src = `${dance.video_url}`;
        videoTitle.textContent = dance.name;


        videoPlayer.load(); 
        videoModal.classList.remove("hidden");
        videoPlayer.play();
    
});

document.getElementById("save-dance").addEventListener("click", addDance);


document.getElementById("open-add-dance").addEventListener("click", () => {
    if (!requireAuth()) return;
    addDanceModal.classList.remove("hidden");
});

document.getElementById("close-add-dance").addEventListener("click", () => {
    addDanceModal.classList.add("hidden");
});


function openAuthModal() {
    authModal.classList.remove("hidden");
}

function closeAuthModal() {
    authModal.classList.add("hidden");
}

function openEditModal(danceId) {
    const dance = allDances.find(d => d.id === Number(danceId));
    if (!dance) return;
  
    editingDanceId = danceId;
  
    document.getElementById("edit-name").value = dance.name || "";
    document.getElementById("edit-style").value = dance.style || "";
    document.getElementById("edit-difficulty").value = dance.difficulty || "";
    document.getElementById("edit-duration").value = dance.duration || "";
    document.getElementById("edit-music").value = dance.music || "";
    document.getElementById("edit-video").value = dance.video_url || "";
    document.getElementById("edit-notes").value = dance.notes || "";
  
    document.getElementById("edit-dance-modal").classList.remove("hidden");
  }

  document.getElementById("close-edit-dance").addEventListener("click", () => {
    document.getElementById("edit-dance-modal").classList.add("hidden");
    editingDanceId = null;
  });

  document.getElementById("save-edit").addEventListener("click", async () => {
    if (!editingDanceId) return;
  
    const updatedDance = {
      name: document.getElementById("edit-name").value,
      style: document.getElementById("edit-style").value,
      difficulty: document.getElementById("edit-difficulty").value,
      duration: Number(document.getElementById("edit-duration").value),
      music: document.getElementById("edit-music").value,
      video_url: document.getElementById("edit-video").value,
      notes: document.getElementById("edit-notes").value
    };
  
    await fetch(`/dances/${editingDanceId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedDance)
    });
  
    document.getElementById("edit-dance-modal").classList.add("hidden");
    editingDanceId = null;
    loadDances();
  });
  
  

  
  
async function deleteDance(id) {

    await fetch(`/dances/${id}`, {
        method: "DELETE"
    });


}

document.getElementById("close-auth").addEventListener("click", closeAuthModal);
document.getElementById("signin-btn").addEventListener("click", loginUser);
document.getElementById("signup-btn").addEventListener("click", signupUser);

  
function requireAuth() {
    if (currentUser.id === null) {
        openAuthModal();
        return false;
    }
    return true;
}



async function loginUser() {
    const username = document.getElementById("auth-username").value.trim();
    const password = document.getElementById("auth-password").value.trim();


    if (!username && !password) {
        alert("Username and password required!");
        return;
    }

    const res = await fetch("/login",{
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!res.ok) {
        alert(data.message);
        return;
      }
    
      currentUser.id = data.user_id;
      currentUser.username = username;
    
      updateNavbar();
      closeAuthModal();
      loadDances();
}



async function signupUser() {
    console.log("Signup button clicked!");
    const username = document.getElementById("auth-username").value.trim();
    const password = document.getElementById("auth-password").value;
  
    if (!username || !password) {
      alert("Username and password required");
      return;
    }
  
    const res = await fetch("/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
  
    const data = await res.json();
  
    if (!res.ok) {
      alert(data.message);
      return;
    }
  
    alert("Account created! Please sign in.");
  }

  function logout() {
    currentUser.id = null;
    currentUser.username = null;
    updateNavbar();
    loadDances();
  }
  
  

function updateNavbar() {
    const navText = document.querySelector(".nav-text");
    const addBtn = document.getElementById("dance-actions");

    if (currentUser.id) {
        navText.textContent = `Welcome ${currentUser.username}!`;
        addBtn.classList.remove("hidden");
    } else {
        navText.textContent = "Welcome!";
        addBtn.classList.add("hidden");
    }
}


document.querySelector(".nav-avatar").addEventListener("click", () => {
    if (currentUser.id) {
        if (confirm("Log out?")) {
            logout();
        }
    } else {
        openAuthModal();
    }
});

document.querySelector(".search-bar").addEventListener("focus", () => {
    if (!requireAuth()) {
        document.activeElement.blur();
    }
});




document.querySelector(".dances-container").addEventListener("click", async (e) => {
   if (e.target.classList.contains("menu-btn")) {
    const dropdown = e.target.nextElementSibling;
    dropdown.classList.toggle("hidden");
    return;
}
if (e.target.classList.contains("delete-btn")) {
    const card = e.target.closest(".dance-card");
    const danceId = card.dataset.id;

    if (confirm("Delete this dance?")) {
        await deleteDance(danceId);
        loadDances();
    }
}
if (e.target.classList.contains("edit-btn")) {
    const card = e.target.closest(".dance-card");
    const danceId = card.dataset.id;

    openEditModal(danceId);
}

});

function renderDances(dances) {
    const container = document.querySelector(".dances-container");
    const showActions = currentUser.id !== null;
    const showCheckbox = currentUser.id !== null && bulkEditMode;

    container.innerHTML = "";

    if (dances.length === 0) {
        container.innerHTML = "<p>No dances yet. Add one!</p>";
        return;
    }

    dances.forEach(dance => {
        const card = document.createElement("div");
        card.className = "dance-card";
        card.dataset.id = dance.id;

        card.innerHTML = `
    ${showCheckbox ? `<input type="checkbox" class="bulk-checkbox">` : ""}
    ${showActions ? `
        <div class="card-menu">
            <button class="menu-btn">⋮</button>
            <div class="menu-dropdown hidden">
                <button class="edit-btn">Edit</button>
                <button class="delete-btn">Delete</button>
            </div>
        </div>
    ` : ""}
    <img src="https://placehold.co/120" alt="${dance.name}">
    <h3>${dance.name}</h3>
    <p>${dance.style || ""}</p>
    `;

        container.appendChild(card);
    });
}

let allDances = [];
async function loadDances() {
    const container = document.querySelector(".dances-container");

    if (!currentUser.id) {
        container.innerHTML = `
            <p class="auth-message">
                Please sign in to view your dances.
            </p>
        `;
        return;
    }

    const res = await fetch(
        `/dances?user_id=${currentUser.id}`
      );
      
    allDances = await res.json();
    renderDances(allDances);
}

async function addDance() {
    if (!currentUser.id) return;

    const danceName = document.getElementById("dance-name").value.trim();
    const danceVideo = document.getElementById("dance-video").files[0];

    if (!danceName) {
        alert("Dance name is required");
        return;
    }

    if (!danceVideo) {
        alert("Dance video is required");
        return;
    }

    const formData = new FormData();
    formData.append("user_id", currentUser.id);
    formData.append("name", danceName);
    formData.append("style", document.getElementById("dance-style").value);
    formData.append("difficulty", document.getElementById("dance-difficulty").value);
    formData.append("duration", Number(document.getElementById("dance-duration").value));
    formData.append("music", document.getElementById("dance-music").value);
    formData.append("notes", document.getElementById("dance-notes").value);

    if (danceVideo) {
        formData.append("video", danceVideo); 
    }

    const res = await fetch("/dances", {
        method: "POST",
        body: formData 
    });

    if (!res.ok) {
        const data = await res.json();
        alert(data.message || "Failed to add dance");
        return;
    }

    addDanceModal.classList.add("hidden");
    loadDances();
}

async function updateDance(){
    const dance = {
        name: document.getElementById("dance-name").value.trim(),
        style: document.getElementById("dance-style").value,
        difficulty: document.getElementById("dance-difficulty").value,
        duration: Number(document.getElementById("dance-duration").value),
        music: document.getElementById("dance-music").value,
        video_url: document.getElementById("dance-video").value,
        notes: document.getElementById("dance-notes").value
    };

    await fetch("/dances", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(dance)
    });

    editModal.classList.add("hidden");
    loadDances();
} 

document.getElementById("toggle-bulk-edit").addEventListener("click", () => {
    bulkEditMode = !bulkEditMode;

    document.getElementById("delete-selected").classList.toggle("hidden", !bulkEditMode);

    document.getElementById("open-add-dance").disabled = bulkEditMode;

    renderDances(allDances);
  });


  document
  .getElementById("delete-selected")
  .addEventListener("click", async () => {
    const checkedCards = document.querySelectorAll(
      ".bulk-checkbox:checked"
    );

    if (checkedCards.length === 0) {
      alert("Select at least one dance.");
      return;
    }

    if (!confirm(`Delete ${checkedCards.length} dances?`)) return;

    for (const checkbox of checkedCards) {
      const card = checkbox.closest(".dance-card");
      const id = card.dataset.id;
      await deleteDance(id);
    }

    bulkEditMode = false;
    document.getElementById("delete-selected").classList.add("hidden");
    document.getElementById("open-add-dance").disabled = false;

    loadDances();
  });



let filterState = { search: []};
function applyFilters() {
    const terms = filterState.search.map(t => t.toLowerCase());
  
    return allDances.filter(dance => {
      if (terms.length === 0) return true;
  
      const text = `
        ${dance.name || ""}
        ${dance.style || ""}
        ${dance.music || ""}
      `.toLowerCase();
  
      return terms.every(term => text.includes(term));
    });
  }
  
  

function filterDances() {
    const filtered = applyFilters();
    renderDances(filtered);
  }

  function renderFilterChips() {
    const container = document.getElementById("filters");
    container.innerHTML = "";
  
    filterState.search.forEach((term, index) => {
      const chip = document.createElement("div");
      chip.className = "filter-chip";
  
      chip.innerHTML = `
        <span>${term}</span>
        <button data-index="${index}">✕</button>
      `;
  
      container.appendChild(chip);
    });
  }
  

  
  document.getElementById("search-form").addEventListener("submit", (e) => {
    e.preventDefault();
  
    const value = document.getElementById("search").value.trim();
    if (!value) return;
  
    if (!filterState.search.includes(value)) {
        filterState.search.push(value);
      }

    document.getElementById("search").value = "";
    renderFilterChips();
    filterDances();
  });

  document.getElementById("filters").addEventListener("click", (e) => {
    if (e.target.tagName !== "BUTTON") return;
  
    const index = Number(e.target.dataset.index);
  
    filterState.search.splice(index, 1);
  
    renderFilterChips();
    filterDances();
  });
  
  
  updateNavbar();

});
 








