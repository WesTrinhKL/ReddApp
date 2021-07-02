function myTimer() {
        let postId = document.getElementById('thispostId').innerHTML
        let timeDiv = document.getElementById(`time-${postId}`)
        const currentDate = new Date()
        let timePosted = document.getElementById(`timePosted-${postId}`).innerHTML
        let d2 = new Date(`${timePosted}`)
        let diff = Math.abs(currentDate - d2)
        let seconds = Math.floor(diff/ 1000)
        let minutes = Math.floor(diff / 60000)
        let hours = Math.floor(diff / 3600000)
        let days = Math.floor(diff/ 86400000)
        if(diff<60000){
            timeDiv.innerHTML = `Posted ${seconds} seconds ago`
        }
        if(diff>60000){ 
            timeDiv.innerHTML = `Posted ${minutes} minutes ago`
        }
        if(diff>3600000){  
            timeDiv.innerHTML = `Posted ${hours} hours ago`
        }
        if (diff > 86400000){      
            timeDiv.innerHTML = `Posted ${days} days ago`
        }
    }
setTimeout(myTimer, 1000);