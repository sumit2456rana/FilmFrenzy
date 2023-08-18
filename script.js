const APIKEY = "30f9a5179bcea75843fa16438ab24dbe";
let currPage = 1;
let totalPage = 1;
let movies = [];
let currentSearch = "";

/******************* Fetching Api ********************/
const ul = document.querySelector(".movie-list");
const loader = document.getElementById("loader");
const footer = document.querySelector("footer");
async function fetchMovies() {
    try {
        loader.style.display = "block";
        footer.style.position = "fixed";
        footer.style.width = "100%"
        document.querySelector(".pagination").classList.add("hidden")
        const resp = await fetch(`https://api.themoviedb.org/3/movie/top_rated?&api_key=${APIKEY}&include_adult=false&language=en-US&page=${currPage}`);
        const data = await resp.json();
        totalPage = data.total_pages;
        movies = data.results;
        renderMovies(movies);
    } 
    catch (error) {
        console.log(error);
    } finally {
        loader.style.display = "none"; 
        footer.style.position = "static";
        footer.style.width = "auto";
        document.querySelector(".pagination").classList.remove("hidden")
    }
}

window.addEventListener("scroll", function() {
    const navbar = document.querySelector("header");
if (window.scrollY > 10) {
    navbar.classList.add("scrolled");
} else {
    navbar.classList.remove("scrolled");
}
});

/******************* Displaying movie cards ********************/
function renderMovies(movies) {
    let favMovies = getFavMoviesFromLocalStorage();
    ul.innerHTML = "";

    movies.map((eachMovies) => {
        
        const {backdrop_path , poster_path , id , title , vote_average, adult , vote_count , release_date , original_language} = eachMovies; 
        
        
        let url = backdrop_path !== null ? backdrop_path : poster_path;
        if(url == null){
            url = "/wL5PB5kfKVXvlbDyzTaWMbWtin7.jpg";
        }
        // console.log(url);
        let language = original_language.toUpperCase();
        let year = release_date.split("-"); 
        let isAdult = adult == true ? "18+" : "13+";

        let listItems = document.createElement("li");
        listItems.className = "cards";
        listItems.style.backgroundImage = `url('https://image.tmdb.org/t/p/original${url}')`;
        
        let mInfo = {
            title,
            vote_average,
            vote_count,
            url,
            language,
            year,
            isAdult,
            id,
        }

        let res = favMovies.find((eFavMovie) => eFavMovie.id == id);
        let stringifyContent = JSON.stringify(mInfo);
        // console.log(stringifyContent)
        if(stringifyContent.includes("'")){
            stringifyContent = stringifyContent.replace("'" , "");
        }
        console.log(stringifyContent);
        listItems.innerHTML = `
                <div class="gradient-overlay"></div>
                <div class="content">
                    <p class="adult">${language} / ${isAdult}</p>
                    <i id='${stringifyContent}' class="fa-regular fa-heart ${res ? "red fa-solid" : ""}"></i>
                    <section class="description">
                        <p class="title">${title} , <span class="year">${year[0]}</span></p>
                        <section class="votes">
                            <p id="voting">Votes : ${vote_count}</p>|
                            <p id="rating">Rating : ${vote_average}<i class="fa-solid fa-star star" style="color: #feeb20;"></i></p>
                        </section>
                    </section>
                </div>
        `

        const favIcon = listItems.querySelector(".fa-heart");
        favIcon.addEventListener("click" , (event) => {
            const {id} = event.target;
            const mInfo = JSON.parse(id);
            if(favIcon.classList.contains("red")){
                // unmark it
                favIcon.classList.add("fa-regular");
                favIcon.classList.remove("fa-solid");
                favIcon.classList.remove("red");
                // remove the info of this movie from localStroage
                removeMovieInfoFromLocalStorage(mInfo);
            }else{
                // mark it
                favIcon.classList.remove("fa-regular");
                favIcon.classList.add("red");
                favIcon.classList.add("fa-solid")
                // add the info of this movie to the localStroage
                addMovieInfoInLocalStorage(mInfo);
            }
        })
        ul.appendChild(listItems);
        
    })
    currBtn.innerText = `${currPage} of ${totalPage}`;
}
fetchMovies();
/********* Handling Adding & Removing movies in localStorage *********/

function getFavMoviesFromLocalStorage() {
    const favMovies = JSON.parse(localStorage.getItem("favouriteMovie"));
    return favMovies === null ? [] : favMovies;
}

function addMovieInfoInLocalStorage(mInfo) {
    const localStorageMovies = getFavMoviesFromLocalStorage();
    localStorage.setItem("favouriteMovie" , JSON.stringify([...localStorageMovies , mInfo]))
}

function removeMovieInfoFromLocalStorage(mInfo) {
    let localStorageMovies = getFavMoviesFromLocalStorage();

    let filteredMovies = localStorageMovies.filter((eMovie) => {
        return eMovie.title != mInfo.title;
    })

    localStorage.setItem("favouriteMovie" , JSON.stringify(filteredMovies));
}
/******************* Handling Seacrh Box ********************/

const searchbtn = document.getElementById("search-btn");
const searchBox = document.getElementById("search-box");

searchbtn.addEventListener("click" , searchMovies)

async function searchMovies() { 
    
    const search_text = searchBox.value;
    currentSearch = search_text;
    try {
        currPage = 1;
        loader.style.display = "block"; // Show the loader
        const resp = await fetch(`https://api.themoviedb.org/3/search/movie?query=${search_text}&api_key=${APIKEY}&include_adult=false&language=en-US&page=${currPage}`)
        const data = await resp.json();
        totalPage = data.total_pages;
        movies = data.results;
        renderMovies(movies);
    } catch (error) {
        console.log(error);
    } finally {
        loader.style.display = "none"; // Hide the loader after data is fetched
    }
}   
async function fetchSearchMovies() {
    try {
        const resp = await fetch(`https://api.themoviedb.org/3/search/movie?query=${currentSearch}&api_key=${APIKEY}&include_adult=false&language=en-US&page=${currPage}`)
        const data = await resp.json();
        totalPage = data.total_pages;
        movies = data.results;
        renderMovies(movies);
    }
    catch(err){
        console.log(err);
    }
}
function onSearchChange(event) {
    currentSearch = event.target.value;
    if(currentSearch) {
        currPage = 1;
        fetchSearchMovies();
    }else{
        fetchMovies();
    }
    
}
let timer;
function debounce(event) {
    if(timer) clearTimeout(timer)

    timer = setTimeout(() => {
        onSearchChange(event);
    } , 2000)
}
searchBox.addEventListener("input" , (event) => {
    debounce(event);
})
/******************* Handling Previous & Next Button ********************/

const nextBtn = document.getElementById("next-btn");
const prevBtn = document.getElementById("prev-btn");
const currBtn = document.getElementById("curr-btn");

prevBtn.addEventListener("click" , getPreviousPage);
prevBtn.disabled = true;
nextBtn.addEventListener("click" , getNextPage);

function getPreviousPage() {
    currPage--;
    if(currentSearch !== ""){
        fetchSearchMovies();
    }
    else{
        fetchMovies();
    }
    currBtn.innerText = `${currPage} of ${totalPage}`
    // If user is standing on first page the prev Btn will be disabled
    if(currPage == 1){
        prevBtn.disabled = true;
    }
    else{
        prevBtn.disabled = false;
    }
    // If user is standing on last page the next Btn will be disabled
    if(currPage >= totalPage) {
        nextBtn.disabled = true;
    }
    else{
        nextBtn.disabled = false;
    }
}

function getNextPage() {
    currPage++;
    if(currentSearch !== ""){
        fetchSearchMovies();
    }
    else{
        fetchMovies();
    }
    currBtn.innerText = `${currPage} of ${totalPage}`
    // If user is standing on first page the prev Btn will be disabled
    if(currPage == 1){
        prevBtn.disabled = true;
    }
    else{
        prevBtn.disabled = false;
    }
    // If user is standing on last page the next Btn will be disabled
    if(currPage >= totalPage) {
        nextBtn.disabled = true;
    }
    else{
        nextBtn.disabled = false;
    }
}

/******************* Handling Sorting Buttons ********************/

const sortByDateBtn = document.getElementById("sort-by-date");
sortByDateBtn.addEventListener("click" , sortByDate);

let sortByDateFlag = 0 ;  // 0 : Ascending  // 1 : Descending
function sortByDate() {
    if(sortByDateFlag) {
        // Sort in descending order
        movies.sort((m1 , m2) => {
            return new Date(m2.release_date) - new Date(m1.release_date);
        })
        renderMovies(movies);
        sortByDateFlag = !sortByDateFlag;
        sortByDateBtn.innerText = "Sort by date (oldest to latest)"
    }else{
        // Sort in ascending order
        movies.sort((m1 , m2) => {
            return new Date(m1.release_date) - new Date(m2.release_date);
        })
        renderMovies(movies);
        sortByDateFlag = !sortByDateFlag
        sortByDateBtn.innerText = "Sort by date (latest to oldest)"
    }
}

const sortByRatingBtn = document.getElementById("sort-by-rating");
sortByRatingBtn.addEventListener("click" , sortByRating)

let sortByRatingFlag = 0;
function sortByRating() {
    if(sortByRatingFlag) {
        movies.sort((m1 , m2) => {
            return m2.vote_average - m1.vote_average;
        })
        renderMovies(movies);
        sortByRatingFlag = !sortByRatingFlag;

        sortByRatingBtn.innerText = "Sort by rating (least to most)";
    }else{
        movies.sort((m1 , m2) => {
            return m1.vote_average - m2.vote_average;
        })
        renderMovies(movies);
        sortByRatingFlag = !sortByRatingFlag;
        sortByRatingBtn.innerText = "Sort by rating (most to least)"
    }
}

/******************* Handling All & Favourite Tab ********************/

const allTab = document.getElementById("all-tab");
const favTab = document.getElementById("fav-tab");

allTab.addEventListener('click' , switchTab);
favTab.addEventListener('click' , switchTab);

function switchTab(event) {
    allTab.classList.remove("active-tab");
    favTab.classList.remove("active-tab");

    event.target.classList.add("active-tab");
    
    displayMovies();
}
function displayMovies() {
    if (favTab.classList.contains("active-tab")) {
        renderFavMovies();
        prevBtn.classList.add("hidden");
        nextBtn.classList.add("hidden");
        currBtn.classList.add("hidden");
    } else {
        renderMovies(movies);
        prevBtn.classList.remove("hidden");
        nextBtn.classList.remove("hidden");
        currBtn.classList.remove("hidden");
    }
    if(allTab.classList.contains("active-tab")){
        // all button, show the general movies
        renderMovies(movies);
    }else{

        // fav button, show the favourite movies
        renderFavMovies();
    }
}
function renderFavMovies() {
    ul.innerHTML = "";
    const favMovies = getFavMoviesFromLocalStorage();
    if(favMovies.length === 0) {
        let li = document.createElement("li");
        li.className = "noMovie"
        li.innerHTML = `
            <div>
                <h1>You Have no favourite movies.</h1>
                <h2>
                Click <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 9.229c.234-1.12 1.547-6.229 5.382-6.229 2.22 0 4.618 1.551 4.618 5.003 0 3.907-3.627 8.47-10 12.629-6.373-4.159-10-8.722-10-12.629 0-3.484 2.369-5.005 4.577-5.005 3.923 0 5.145 5.126 5.423 6.231zm-12-1.226c0 4.068 3.06 9.481 12 14.997 8.94-5.516 12-10.929 12-14.997 0-7.962-9.648-9.028-12-3.737-2.338-5.262-12-4.27-12 3.737z"/></svg>
                to add movie...
                </h2>
            </div>
        `
        ul.append(li);  
        prevBtn.classList.add("hidden");
        nextBtn.classList.add("hidden");
        currBtn.classList.add("hidden");
    }
    else{
        favMovies.map((eFavMovie) => {
            console.log(eFavMovie)
            const {url , language , isAdult , id , title , vote_average , vote_count , year} = eFavMovie; 
            
    
            let listItems = document.createElement("li");
            listItems.className = "cards";
            listItems.style.backgroundImage = `url('https://image.tmdb.org/t/p/original${url}')`;
            
            let mInfo = {
                title,
                vote_average,
                vote_count,
                url,
                language,
                year,
                isAdult,
                id,
            }
    
            let stringifyContent = JSON.stringify(mInfo);
    
            listItems.innerHTML = `
                    <div class="gradient-overlay"></div>
                    <div class="content">
                        <p class="adult">${eFavMovie.language} / ${eFavMovie.isAdult}</p>
                        <i id='${stringifyContent}' class="fa-regular fa-heart red fa-solid"></i>
                        <section class="description">
                            <p class="title">${eFavMovie.title} , <span class="year">${eFavMovie.year[0]}</span></p>
                            <section class="votes">
                                <p id="voting">Votes : ${eFavMovie.vote_count}</p>|
                                <p id="rating">Rating : ${eFavMovie.vote_average}<i class="fa-solid fa-star star" style="color: #feeb20;"></i></p>
                            </section>
                        </section>
                    </div>
            `
    
            const favIcon = listItems.querySelector(".fa-heart");
            favIcon.addEventListener("click" , (event) => {
                const { id } = event.target;
                // console.log(id)
                const mInfo = JSON.parse(id);
                // console.log(mInfo)
    
                // this will remove the card from the local storage
                removeMovieInfoFromLocalStorage(mInfo);
    
                // this will remove the card from the ui
                event.target.parentElement.parentElement.remove();

                
            })
            ul.appendChild(listItems);
        })
    }
}
