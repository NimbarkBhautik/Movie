const express = require('express')
const app = express()

const path = require('path')
const sqlite3 = require('sqlite3')
const {open} = require('sqlite')
app.use(express.json())

const dbpath = path.join(__dirname, 'moviesData.db')

let db = null
const initdb = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server is running at http://localhost:3000')
    })
  } catch (e) {
    console.log(`Error ${e.message}`)
  }
}
initdb()

app.get('/movies/', async (req, res) => {
  try {
    const getMoviesQuery = `
      SELECT movie_name as movieName 
      FROM movie
    `
    const moviesList = await db.all(getMoviesQuery)
    res.json(moviesList) // Using res.json for proper formatting
  } catch (error) {
    res.status(500).send({error: 'Unable to fetch movies'})
  }
})

app.post('/movies/', async (req, res) => {
  console.log(req.body) // Check the request body

  const {directorId, movieName, leadActor} = req.body

  const uploadmovie = `
    INSERT INTO movie (director_id, movie_name, lead_actor	) 
    VALUES (${directorId},'${movieName}','${leadActor}') ;
  `

  try {
    await db.run(uploadmovie)
    res.send('Movie Successfully Added')
  } catch (error) {
    res.status(500).send(`Error adding movie ${error.message}`)
  }
})

app.get('/movies/:movieId/', async (req, res) => {
  try {
    const {movieId} = req.params
    const getmovie = `
      SELECT * 
      FROM movie 
      WHERE movie_id = ?;
    `

    const result = await db.get(getmovie, [movieId])

    // Check if the movie exists
    if (result) {
      const formattedMovie = {
        movieId: result.movie_id,
        directorId: result.director_id,
        movieName: result.movie_name,
        leadActor: result.lead_actor,
      }

      res.send(formattedMovie)
    } else {
      res.status(404).send({message: 'Movie not found'})
    }
  } catch (e) {
    console.log(e.message)
    res.status(500).send({message: 'Server error'})
  }
})

app.put('/movies/:movieId/', async (req, res) => {
  try {
    const {movieId} = req.params
    const {directorId, movieName, leadActor} = req.body
    const updateinfo = `
    update movie
    set director_id = ${directorId} ,movie_name = '${movieName}',lead_actor = '${leadActor}'
    where movie_id = ${movieId};
    `
    await db.run(updateinfo)
    res.send('Movie Details Updated')
  } catch (e) {
    console.log(e.message)
  }
})

app.delete('/movies/:movieId/', async (req, res) => {
  try {
    const {movieId} = req.params
    const deletemovie = `
    DELETE FROM movie
    WHERE movie_id = ${movieId};
    `
    await db.run(deletemovie)
    res.send('Movie Removed')
  } catch (e) {
    console.err(e.message)
  }
})

app.get('/directors/', async (req, res) => {
  try {
    const getMoviesQuery = `
      SELECT * 
      FROM director
    `
    const moviesList = await db.all(getMoviesQuery)
    const formated = moviesList.map(dir => ({
      directorId: dir.director_id,
      directorName: dir.director_name,
    }))
    res.send(formated) // Using res.json for proper formatting
  } catch (error) {
    res.status(500).send({error: 'Unable to fetch Director'})
  }
})

app.get('/directors/:directorId/movies/', async (req, res) => {
  try {
    const {directorId} = req.params
    const getMoviesQuery = `
      SELECT movie_name as movieName
      FROM movie
      WHERE director_id = ${directorId};
    `
    const moviesList = await db.all(getMoviesQuery)
    res.json(moviesList) // Using res.json for proper formatting
  } catch (error) {
    res.status(500).send({error: 'Unable to fetch movies'})
  }
})

module.exports = app
