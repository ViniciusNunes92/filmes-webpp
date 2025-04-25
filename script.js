document.addEventListener('DOMContentLoaded', function () {
    const movieForm = document.getElementById('movie-form');
    const movieInput = document.getElementById('movie-input');
    const movieCategory = document.getElementById('movie-category');
    const movieList = document.getElementById('movie-list');
    const emptyMessage = document.getElementById('empty-message');
    const itemsLeft = document.getElementById('items-left');
    const clearWatchedBtn = document.getElementById('clear-watched');
    const filterButtons = document.querySelectorAll('.filters .btn');
    
    // Estatísticas
    const totalCount = document.getElementById('total-count');
    const watchedCount = document.getElementById('watched-count');
    const favCategory = document.getElementById('fav-category');

    let movies = JSON.parse(localStorage.getItem('movies')) || [];
    let currentFilter = 'all';

    renderMovies();
    updateItemsCount();
    updateStats();

    movieForm.addEventListener('submit', addMovie);
    clearWatchedBtn.addEventListener('click', clearWatched);

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentFilter = button.getAttribute('data-filter');
            renderMovies();
        });
    });

    function addMovie(e) {
        e.preventDefault();

        const movieText = movieInput.value.trim();
        if (movieText === '') return;

        const newMovie = {
            id: Date.now(),
            text: movieText,
            category: movieCategory.value,
            watched: false,
            createdAt: new Date().toISOString()
        };

        movies.push(newMovie);
        saveMovies();
        movieInput.value = '';
        renderMovies();
        updateItemsCount();
        updateStats();
    }

    function toggleMovie(id) {
        movies = movies.map(movie => {
            if (movie.id === id) {
                movie.watched = !movie.watched;
                if (movie.watched) {
                    movie.watchedAt = new Date().toISOString();
                } else {
                    delete movie.watchedAt;
                }
            }
            return movie;
        });

        saveMovies();
        renderMovies();
        updateItemsCount();
        updateStats();
    }

    function deleteMovie(id) {
        movies = movies.filter(movie => movie.id !== id);
        saveMovies();
        renderMovies();
        updateItemsCount();
        updateStats();
    }

    function clearWatched() {
        movies = movies.filter(movie => !movie.watched);
        saveMovies();
        renderMovies();
        updateItemsCount();
        updateStats();
    }

    function saveMovies() {
        localStorage.setItem('movies', JSON.stringify(movies));
    }

    function updateItemsCount() {
        const pendingCount = movies.filter(movie => !movie.watched).length;
        itemsLeft.textContent = `${pendingCount} filme${pendingCount !== 1 ? 's' : ''} pendente${pendingCount !== 1 ? 's' : ''}`;
    }

    function updateStats() {
        // Total de filmes
        totalCount.textContent = movies.length;
        
        // Filmes assistidos
        const watched = movies.filter(movie => movie.watched);
        watchedCount.textContent = watched.length;
        
        // Categoria favorita
        if (movies.length > 0) {
            const categories = {};
            movies.forEach(movie => {
                if (categories[movie.category]) {
                    categories[movie.category]++;
                } else {
                    categories[movie.category] = 1;
                }
            });
            
            let favorite = null;
            let max = 0;
            
            for (const category in categories) {
                if (categories[category] > max) {
                    max = categories[category];
                    favorite = category;
                }
            }
            
            favCategory.textContent = favorite || "-";
        } else {
            favCategory.textContent = "-";
        }
    }

    function renderMovies() {
        let filteredMovies = movies;
        if (currentFilter === 'pending') {
            filteredMovies = movies.filter(movie => !movie.watched);
        } else if (currentFilter === 'watched') {
            filteredMovies = movies.filter(movie => movie.watched);
        }

        movieList.innerHTML = '';
        if (filteredMovies.length === 0) {
            movieList.appendChild(emptyMessage);
            emptyMessage.style.display = 'block';
        } else {
            emptyMessage.style.display = 'none';
            
            // Ordenar filmes: não assistidos primeiro, depois assistidos
            filteredMovies.sort((a, b) => {
                // Primeiro critério: assistido vs não assistido
                if (a.watched !== b.watched) {
                    return a.watched ? 1 : -1;
                }
                // Segundo critério: data de criação (mais recentes primeiro)
                return new Date(b.createdAt) - new Date(a.createdAt);
            });
            
            filteredMovies.forEach(movie => {
                const movieItem = document.createElement('div');
                movieItem.classList.add('movie-item');
                if (movie.watched) movieItem.classList.add('watched');

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = movie.watched;
                checkbox.classList.add('form-check-input');
                checkbox.addEventListener('change', () => toggleMovie(movie.id));

                const text = document.createElement('span');
                text.classList.add('movie-text');
                text.textContent = movie.text;

                const category = document.createElement('span');
                category.classList.add('movie-category');
                category.textContent = movie.category;

                const actions = document.createElement('div');
                actions.classList.add('movie-actions');

                const deleteBtn = document.createElement('button');
                deleteBtn.classList.add('btn', 'btn-danger', 'btn-action');
                deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
                deleteBtn.addEventListener('click', () => deleteMovie(movie.id));

                actions.appendChild(deleteBtn);

                const infoContainer = document.createElement('div');
                infoContainer.classList.add('d-flex', 'align-items-center');
                infoContainer.appendChild(checkbox);
                infoContainer.appendChild(text);

                movieItem.appendChild(infoContainer);
                movieItem.appendChild(category);
                movieItem.appendChild(actions);

                movieList.appendChild(movieItem);
            });
        }
    }
});