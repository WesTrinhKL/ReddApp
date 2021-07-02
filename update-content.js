script(language='JavaScript');
   export function updateContent() {
    var content = document.getElementById('content');
    var comment = document.getElementById('comment');
    const text = document.getElementById('textarea-comment')
    content.innerHTML = text.value
    return content
    }
