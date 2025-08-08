import React, { useEffect, useState } from 'react'
import Search from './components/search'
import Spinner from './components/spinner'
import MovieCard from './components/MovieCard'
import { useDebounce } from 'react-use'
import { updateSearchCount } from './appwrite'

//Setting up function to get requests
const API_BASE_URL = 'https://api.themoviedb.org/3'

const API_KEY = import.meta.env.VITE_TMDB_API_KEY

const API_OPTIONS = {
  method: 'GET',
  headers:{
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}
 
 const App = () => {
  //states
  const [searchTerm , setSearchTerm] = useState('') //states for search bar 
  const [errorMessage , setErrorMessage] = useState('') //states for API errors
  const [movieList, setMovieList] = useState([]) //states for loaded movies
  const [isLoading, setIsLoading] = useState(false) //state for while fetching movies 
  const [debouncedSearchTerm, setdebouncedSearchTerm] = useState('')

  //Debouncing search term  
  useDebounce(() => {
    setdebouncedSearchTerm(searchTerm)}, 
    500,
    [searchTerm]
  )

  //Sending request to API
  const fetchMovies = async (query = '') => {
    setIsLoading(true)
    setErrorMessage('')

    try{
      //Adding searching capability
      const endpoint = query ? 
       `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
      :`${API_BASE_URL}/discover/movie?sort_by=popularity.desc`

 
      const response = await fetch(endpoint, API_OPTIONS)
      
      if(!response.ok){
        throw new Error('Failed to fetch movies')
      }

      const data = await response.json()
      console.log(data)
      
      if(data.response ==='False') {
        setErrorMessage(data.error || 'Failed to fetch movies') 
        setMovieList([])
        return
      }

      setMovieList(data.results || [])

      updateSearchCount()

    } catch (error) {
      console.error(`The following error occurred: ${error}`)
      setErrorMessage(`Error fetching movies. Please try again later`)
    }
    finally{
      setIsLoading(false)
    }
  }

  //Setting up search
  useEffect(() => {
    fetchMovies(debouncedSearchTerm)
  }, [debouncedSearchTerm])

   return (
    <main>
      <div className='pattern'/>
      <div className='wrapper'>
        <header>
          <img src = "./hero-img.png" alt = "Hero Banner" />
          <h1>Find <span className='text-gradient'>Movies</span> You'll Enjoy Without the Hassle! </h1>
          <Search searchTerm = {searchTerm} setSearchTerm = {setSearchTerm}/>
        </header>
        
        <section className='all-movies'>
          <h2 className='mt-[40px]'>All Movies</h2>

          {isLoading ? (
            <Spinner />
          ): errorMessage ? (
            <p className='text-red-500'>{errorMessage}</p>
          ) : (
            <ul>
              {movieList.map((movie) => (
                <MovieCard key = {movie.id} movie = {movie}/>
                ))}
            </ul>
          )}
           
        </section>
        
      </div>
      

    </main>
   )
 }
 
 export default App