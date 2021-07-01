window.addEventListener("load", (event)=>{
    console.log("hello from javascript!")
    document.getElementById(`like-!{post.id}`).addEventListener('click', e => {
        console.log('likes working')
    })
})