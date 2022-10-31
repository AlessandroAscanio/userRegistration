import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.1/firebase-app.js"
import { getFirestore, collection, addDoc, serverTimestamp, doc, deleteDoc, updateDoc, onSnapshot, orderBy, query } from "https://www.gstatic.com/firebasejs/9.0.1/firebase-firestore.js"

const firebaseConfig = {
  apiKey: "AIzaSyBAHZWfnIxnSZFx3S36HdmGHPNPj-PZ9C0",
  authDomain: "userclient-d2160.firebaseapp.com",
  projectId: "userclient-d2160",
  storageBucket: "userclient-d2160.appspot.com",
  messagingSenderId: "365403852841",
  appId: "1:365403852841:web:46038be886dd56dbde8c38",
  measurementId: "G-Y52691LL6K"
};

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const collectionUsers = collection(db, 'users')
const userList = query(collectionUsers, orderBy('createdAt', 'desc'))

const userTable = document.querySelector('[data-js="userTable"]')
const userForm = document.querySelector('[data-js="userForm"]')
const message = document.querySelector('[data-js="message"]')
const modal = document.querySelector('[data-js="modal"]')
const cancelBtn = document.querySelector('[data-js="cancelBtn"]')
const deleteBtn = document.querySelector('[data-js="deleteBtn"]')
const closeModal = document.querySelector('[data-js="closeModal"]')
const updateIcon = userForm.children[3].children[0]
const userIdContainer = document.querySelector('[data-js="userId"]')

const logMessage = (className, text) => {
  message.classList.add(className)
  message.textContent = text
}

const removeMessage = className => {
  message.classList.remove(className)
  message.textContent = ''
}

onSnapshot(userList, querySnapshot => {
  if(!querySnapshot.metadata.hasPendingWrites) {
    const usersTrs = querySnapshot.docs.reduce((acc, doc) => {
      const { name, email } = doc.data()
      
      acc +=`
      <tr data-id="${doc.id}">
        <td>${name}</td>
        <td>${email}</td>
        <td>
          <button>
            <span data-edit="${doc.id}" class="material-symbols-outlined edit-icon ">
              edit_square
            </span>
          </button>
          <button>
            <span data-remove="${doc.id}" class="material-symbols-outlined delete-icon">
              delete
            </span>
          </button>
        </td>
      </tr>`
      
      return acc
    },'')

    if(!usersTrs.length){
      logMessage('warning', 'Não há usuários a serem exibidos')
    } else {
      removeMessage('warning') 
    }
  
    userTable.innerHTML = usersTrs
  }
})

userForm.addEventListener('submit', e => {
  e.preventDefault()
  
  const userName = e.target.name.value.trim()
  const userEmail = e.target.email.value.trim()
  const userId = e.target.id.value  

  if(userName ==='' && userEmail === '') {
    return
  }

  if(!userId.length) {
    addDoc(collectionUsers, {
      name: userName,
      email: userEmail,
      createdAt: serverTimestamp()
    })
    .then()
    .catch(console.log)  
  }

  if(userId.length) {
    const editUser = doc(db, 'users', userId)
  
    updateDoc(editUser, {
      name: userName,
      email: userEmail,
      createdAt: serverTimestamp()
    })
    .then(() => {
      userIdContainer.value = ''
    })
    .catch(console.log) 
  }
  
  userForm.reset()
  e.target.name.focus()
  updateIcon.textContent = 'add_circle'
})

userTable.addEventListener('click', e => {
  const idRemoveButton = e.target.dataset.remove
  const idEditButton = e.target.dataset.edit

  if(idRemoveButton) {  
    modal.style.display='block'
    
    deleteBtn.addEventListener('click', () => {
      deleteDoc(doc(db, 'users', idRemoveButton))
        .then(() =>  modal.style.display='none')
        .catch(console.log)
    })
  }

  if(idEditButton) {
    const tr = document.querySelector(`[data-id="${idEditButton}"]`)
    const name = tr.children[0].textContent 
    const email = tr.children[1].textContent
    const inputName = userForm.children[0].childNodes[3]
    const inputEmail = userForm.children[1].childNodes[3]
    
    userIdContainer.value = idEditButton
    updateIcon.textContent = 'change_circle'
    inputName.value = name
    inputEmail.value = email
  }
})

cancelBtn.addEventListener('click', () => {
  modal.style.display='none'
})

closeModal.addEventListener('click', () => {
  modal.style.display='none'
})

window.onclick = e => {
  if(e.target == modal) {
    modal.style.display='none'
  }
}