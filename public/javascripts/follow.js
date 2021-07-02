//refactor later
const followButtonEl;
if(document.querySelector(".follow-button")){
  followButtonEl = document.querySelector(".follow-button");
  followButtonEl.addEventListener("click", async(e)=>{
    e.preventDefault();
    console.log("hello from follow button!");
    try {
      const followId = followButtonEl.value;
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
      }
    } catch (e) {
      console.error(e);
    }
  })

}
else{
  followButtonEl = document.querySelector(".unfollow-button");
  followButtonEl.addEventListener("click", async(e)=>{
    e.preventDefault();
    console.log("hello from unfollow button!");
    try {
      const followId = followButtonEl.value;
      const res = await fetch(`http://localhost:8080/users/unfollow/${followId}`);

      //make 300 code -- did you really try to follow yourself?
      if (res.status === 401) {
        window.location.href = "/users/login";
        return;
      }

      const { follow } = await res.json();

      console.log("my recent follow: ");
      console.log(follow);

      if(follow){
        followButtonEl.innerHTML = "&#10003; Following";
        followButtonEl.classList.remove("follow-button");
        followButtonEl.classList.add("unfollow-button");
      }
    } catch (e) {
      console.error(e);
    }
  })

}
