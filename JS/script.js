

//https://api.github.com/users/aguirretim/repos
fetch('JsonData/repo.json')
    .then(response => response.json())
    .then(repos => {
        // Sort repositories by creation date, newest first
        repos.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        const gallery = document.getElementById('gallery');

        repos.forEach(repo => {
            const language = repo.language; // Get the "language" field from the repository data

            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <a href="${repo.html_url}">
                    <img src="img/PlaceholderImage.png" alt="${repo.name}">
                    <h5>${repo.name}</h5>
                    <p>${repo.description}</p>
                    <p>Language: ${language}</p>
                </a>`;
            gallery.appendChild(listItem);
        });
    })
    .catch(error => console.error('Error:', error));
