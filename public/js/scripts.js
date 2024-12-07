//Event listeners
let commentLinks = document.querySelectorAll("a.view-comments");
for (commentLink of commentLinks) {
    commentLink.addEventListener("click", getComment);
}
function newImage(event) {
    event.preventDefault(); // Prevent any default action if necessary
    alert('New image logic triggered!');
    // Your logic here, such as dynamically fetching an image or other action
  }

  document.addEventListener('DOMContentLoaded', function() {
    document.querySelector("#random").addEventListener("click", newImage);
  });


// Good API exmple passing an image and name to HTML
// The route is defined in mjs file to send data to JSON.
async  function newImage(){
    let url = `/api/random-comic`;   // pay attention this a route name 
    let response = await fetch(url);
    let data = await response.json();
    // Update the image and comic name
    document.getElementById("comic-image").src = data.comicUrl;
    document.getElementById("comic-name").innerHTML = data.comicSiteName;
}

async function getComment() {
    var myModal = new bootstrap.Modal(document.getElementById('commentModal'));
    myModal.show();
    let url = `/api/comment/${this.id}`;
    let response = await fetch(url);
    let data = await response.json();
    console.log(`Fetching comment for ID: ${this.id}`);
    let commentInfo = document.querySelector("#commentInfo");
    commentInfo.innerHTML = "";
    for(i of data){
        commentInfo.innerHTML += `
     ${i.comment}</strong><br>

    </div>`;
}
}