const form = document.forms.usersform;
const inputName = form.name;
const inputEmail = form.email;
const listUsers = document.getElementById("users");
const clearStorageResult = document.getElementById("clearUsersList");
let baseUsersData;
let count = 10;

const showSavedingList = () => {
  let db = baseUsersData.result;
  const transaction = db.transaction("usersBase", "readonly");
  const storage = transaction.objectStore("usersBase");

  const getAllUsers = storage.getAll();
  getAllUsers.onsuccess = () => {
    let savedUsers = getAllUsers.result;
    if (!savedUsers.length) {
      return "";
    } else {
      savedUsers.forEach((elem) => {
        const liElem = document.createElement("li");
        liElem.textContent = `Name: ${elem.username}; Email: ${elem.userEmail}`;
        listUsers.appendChild(liElem);
      });
    }
  };
};

const addUsersForStorage = (event) => {
  event.preventDefault();

  const db = baseUsersData.result;
  const transaction = db.transaction("usersBase", "readwrite");
  const usersStorage = transaction.objectStore("usersBase");
  console.log(usersStorage);

  const username = inputName.value;
  const userEmail = inputEmail.value;
  const dataUser = {
    username,
    userEmail,
  };

  if (username || userEmail) {
    const savedData = usersStorage.put(dataUser);
    const liElem = document.createElement("li");
    savedData.onsuccess = () => {
      liElem.textContent = `Name: ${dataUser.username}; Email: ${dataUser.userEmail}`;
      listUsers.appendChild(liElem);
      inputName.value = "";
      inputEmail.value = "";
      console.log(savedData);
    };
  } else {
    alert("Add users details.");
  }

  fetch(`https://jsonplaceholder.typicode.com/users/${++count}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dataUser),
  })
    .then((res) => {
      res.json();
    })
    .then((result) => {
      if (result) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log("Error fetch");
      }
    })
    .catch((error) => {
      console.log(error);
    });
};

const clearUsersList = () => {
  const db = baseUsersData.result;
  const transaction = db.transaction("usersBase", "readwrite");
  const storage = transaction.objectStore("usersBase");

  const clearRequest = storage.clear();

  clearRequest.onsuccess = () => {
    listUsers.innerHTML = "";
  };
  clearRequest.onerror = () => {
    console.error("Error clearing data:", clearRequest.error);
  };
};

baseUsersData = indexedDB.open("base", 1);
baseUsersData.onupgradeneeded = () => {
  const db = baseUsersData.result;
  db.createObjectStore("usersBase", {
    keyPath: "username",
    autoIncrement: true,
  });
};

baseUsersData.onsuccess = () => {
  showSavedingList();
};
form.onsubmit = addUsersForStorage;
clearStorageResult.onclick = clearUsersList;