
const followButtonEl = document.querySelector(".user-follow-btn")

  followButtonEl.addEventListener("click", async(e)=>{
    e.preventDefault();
    console.log("hello from follow button!");
    if(followButtonEl.value === "follow-button"){
      try {
        const followId = followButtonEl.id;
        const res = await fetch(`http://localhost:8080/users/follow/${followId}`);

        //make 300 code -- did you really try to follow yourself?
        if (res.status === 401) {
          window.location.href = "/";
          return;
        }

        const { follow } = await res.json();

        console.log("my recent follow: ");
        console.log(follow);

        if(follow){
          followButtonEl.innerHTML = "&#10003; Following";
          followButtonEl.classList.remove("follow-button");
          followButtonEl.classList.add("unfollow-button");
          followButtonEl.value = "unfollow-button";
          return
        }
      } catch (e) {
        console.error(e);
      }
    }
    else{
      try {
        const followId = followButtonEl.id;
        const res = await fetch(`http://localhost:8080/users/follow/${followId}`, {
          method: 'DELETE',
          headers: {
            'Content-type': 'application/json'
          }
        });

        //TODO: make 300 code -- did you really try to follow yourself?
        if (res.status > 400) {
          // window.location.href = "/";
          console.log(res.status);
          return;
        }


        if(res.status === 204){
          followButtonEl.innerHTML = "Follow";
          followButtonEl.classList.remove("unfollow-button");
          followButtonEl.classList.add("follow-button");
          followButtonEl.value = "follow-button";
          return;
        }
      } catch (e) {
        console.error(e);
      }
    }

  })





// //refactor later
// let followButtonEl;
// if(document.querySelector(".follow-button")){
//   followButtonEl = document.querySelector(".follow-button");
//   followButtonEl.addEventListener("click", async(e)=>{
//     e.preventDefault();
//     console.log("hello from follow button!");
//     try {
//       const followId = followButtonEl.value;
//       const res = await fetch(`http://localhost:8080/users/follow/${followId}`);

//       //make 300 code -- did you really try to follow yourself?
//       if (res.status === 401) {
//         window.location.href = "/";
//         return;
//       }

//       const { follow } = await res.json();

//       console.log("my recent follow: ");
//       console.log(follow);

//       if(follow){
//         followButtonEl.innerHTML = "&#10003; Following";
//         followButtonEl.classList.remove("follow-button");
//         followButtonEl.classList.add("unfollow-button");
//         return
//       }
//     } catch (e) {
//       console.error(e);
//     }
//   })

// }
// else{
//   followButtonEl = document.querySelector(".unfollow-button");
//   followButtonEl.addEventListener("click", async(e)=>{
//     e.preventDefault();
//     console.log("hello from unfollow button!");
//     try {
//       const followId = followButtonEl.value;
//       const res = await fetch(`http://localhost:8080/users/unfollow/${followId}`, {
//         method: 'DELETE',
//         headers: {
//           'Content-type': 'application/json'
//         }
//       });

//       //make 300 code -- did you really try to follow yourself?
//       if (res.status > 400) {
//         window.location.href = "/";
//         return;
//       }


//       if(res.status === 204){
//         followButtonEl.innerHTML = "&#10003; Following";
//         followButtonEl.classList.remove("follow-button");
//         followButtonEl.classList.add("unfollow-button");
//         return;
//       }
//     } catch (e) {
//       console.error(e);
//     }
//   })

// }
