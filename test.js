// Test der API 

const { response } = require("express");

console.log("Guten Hunger");

// fetch("http://localhost:3000/todos")
//     .then(response => response.json())
//     .then(data => console.log(data))

// run with: node --experimental-fetch

const API_URL = "http://localhost:3000/";

// POST: neues todo anlegen
function testPost() {
  let item = { "todo": "neues test item" };
  let options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(item)
  };
  return fetch(API_URL + "todo", options)
    .then(response => {
      return response.json();
    })
    .then(data => {
      console.log("id is:", data.id);
      return new Promise((resolve, reject) => {
        resolve(data.id);
      })
    })
} // testPost()

// PUT: status eines einzelnen todos von "open" auf "in progress" setzen
function testPut(id) {
  let updateTodoStatus = { "status": "in progress" }
  let options = {
    method: "PUT",
    headers: {
      'Content-Type': 'application/json'
    },

    body: JSON.stringify(updateTodoStatus)
  };
  return fetch(API_URL + "todo/" + id, options)
    .then(response => {
      return response.json();
    })
    .then(data => {
      console.log("Datenobjekt:", data);
    });
} //testPut()

// PATCH: einzelnes todos mit neuer Description setzen
function testPatch(id) {
  let updateTodoDescription = { "description": "neues gepatchtes test item" }
  let options = {
    method: "PATCH",
    headers: {
      'Content-Type': 'application/json'
    },

    body: JSON.stringify(updateTodoDescription)
  };
  return fetch(API_URL + "todo/" + id, options)
    .then(response => {
      return response.json();
    })
    .then(data => {
      console.log("Datenobjekt:", data);
      return data.id
    });
}

// GET: einzelnes objekt anzeigen
function testGet(id) {
  return fetch(API_URL + "todo/" + id)
    .then(response => {
      return response.json();
    })
    .then(data => {
      return data;
    })
}
// testGET()

// DELETE: einzelnes objekt löschen
function testDelete(id) {
  // Optionen für DELETE-Anfragen
  let options = {
    headers: {
      'Content-Type': 'application/json'
    },
    method: "DELETE", // HTTP-Methode Delete
    // Senden der Delete Anfrage
  };
  return fetch(API_URL + "todo/" + id, options)
    .then(response => {
      return response.json();
    })
    .then(data => {
      console.log("Datenobjekt:", data);
    });
} //testDelete

// =================================

// Aufruf

testPost()
  .then(id => {
    console.log("DB lastinsertId", id);
    testPut(id);
    testPatch(id)
      .then(id => {
        console.log("Patch Id:", id);
        testGet(id)
          .then(response => {
            if (response.todo[0].description == "neues gepatchtes test item") {
              testDelete(3000);
            } else {
              console.log("Fehler beim Löschen");
            }
          });
      });
  });
//*
