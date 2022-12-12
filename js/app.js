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
const updateIcon = userForm.children[0].children[2].children[1].children[0]
const userIdContainer = document.querySelector('[data-js="userId"]')
const documentFragment = document.createDocumentFragment()

const renderUser = doc => {
  const [id, { name, email }] = [doc.id, doc.data()]
    const tr = document.createElement('tr')
    const tdName = document.createElement('td')
    const tdEmail = document.createElement('td')
    const tdButtons = document.createElement('td')
    const editButton = document.createElement('button')
    const editSpan = document.createElement('span')
    const deleteButton = document.createElement('button')
    const deleteSpan = document.createElement('span')

    tr.setAttribute('data-id', `${id}`)
    
    tdName.textContent = DOMPurify.sanitize(name)
    tdEmail.textContent = DOMPurify.sanitize(email)

    editSpan.setAttribute('data-edit', `${id}`)
    editSpan.classList.add('material-symbols-outlined', 'edit-icon')
    editSpan.textContent = 'edit_square'

    deleteButton.setAttribute('type', 'button')
    deleteButton.setAttribute('data-bs-toggle', 'modal')
    deleteButton.setAttribute('data-bs-target', '#deleteUser')

    deleteSpan.setAttribute('data-remove', `${id}`)
    deleteSpan.classList.add('material-symbols-outlined', 'delete-icon')
    deleteSpan.textContent = 'delete'

    tdButtons.classList.add('text-center')

    editButton.classList.add('btn', 'shadow-none')
    deleteButton.classList.add('btn', 'shadow-none')

    editButton.append(editSpan)
    deleteButton.append(deleteSpan)
    tdButtons.append(editButton, deleteButton)
    tr.append(tdName, tdEmail, tdButtons)

    documentFragment.append(tr)
}

const renderUserList = snapshot => {
  if(snapshot.metadata.hasPendingWrites) {
    return
  }
  
  userTable.innerHTML = ''
  snapshot.docs.forEach(doc => renderUser(doc))
  userTable.append(documentFragment)
}

const createUser = ( userName, userEmail ) => {
  addDoc(collectionUsers, {
    name: userName,
    email: userEmail,
    createdAt: serverTimestamp()
  })
  .then()
  .catch(console.log)  
}

const editUser = (userName, userEmail, userId) => {
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

const handleUser = e => {
  e.preventDefault()
  
  const userName = DOMPurify.sanitize(e.target.name.value.trim())
  const userEmail = DOMPurify.sanitize(e.target.email.value.trim())
  const userId = DOMPurify.sanitize(e.target.id.value)  
  const IsNotUserFieldsFilled = userName ==='' && userEmail === ''
  const IsNotUserExists = !userId.length

  if(IsNotUserFieldsFilled) {
    return
  }

  if(IsNotUserExists) {
    createUser(userName, userEmail)
      
    userForm.reset()
    e.target.name.focus()
    return
  }

  editUser(userName, userEmail, userId)

  userForm.reset()
  e.target.name.focus()
  updateIcon.textContent = 'add_circle'
}

const hideModal = new bootstrap.Modal(document.querySelector('#deleteUser'))

const deleteUser = (id) => {
  const deleteBtn = document.querySelector('[data-js="deleteBtn"]')

  deleteBtn.addEventListener('click', () => {
    deleteDoc(doc(db, 'users', id))
      .then(() => hideModal.hide())
      .catch(console.log)
  })
}

const fillFormFields = (editID) => {
  const tr = document.querySelector(`[data-id="${editID}"]`)
  const name = tr.children[0].textContent 
  const email = tr.children[1].textContent
  const inputName = userForm.children[0].children[0].children[1]
  const inputEmail = userForm.children[0].children[1].children[1]

  userIdContainer.value = editID
  updateIcon.textContent = 'change_circle'
  inputName.value = DOMPurify.sanitize(name)
  inputEmail.value = DOMPurify.sanitize(email)
}

const handleEditOrDeleteUserOptions = e => {
  const removeId = e.target.dataset.remove
  const editID = e.target.dataset.edit
  const clickedRemoveButton = removeId
  const clickedEditButton = editID
  
  if(clickedRemoveButton) {
    deleteUser(removeId)
    return
  }

  if(clickedEditButton) {
    fillFormFields(editID)
  }
}

onSnapshot(userList, renderUserList)
userForm.addEventListener('submit', handleUser)
userTable.addEventListener('click', handleEditOrDeleteUserOptions)