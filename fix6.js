const fs = require('fs');

let content = fs.readFileSync('src/js/pages/noticias.js', 'utf8');

content = content.replace(/<button class="btn-delete-comment" [^>]*>[\s\S]*?<\/button>/g, (match) => {
    return match.replace(/>[^<]*<\/button>/, '>[X]</button>');
});

content = content.replace(/Apagar comentǭrio/g, 'Apagar');

fs.writeFileSync('src/js/pages/noticias.js', content, 'utf8');
