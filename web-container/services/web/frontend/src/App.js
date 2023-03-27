import React from "react";
import logo from './logo.svg';
import './App.css';

import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import KionHeader from "./KionHeader";
import Movies from "./Movies";
import MoviePage from "./MoviePage";

import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import axios from "axios";

const BACKEND_ADDRESS = 'http://127.0.0.1:1337'; // TODO: replace with domain name
const MOVIE_DATA_ADDRESS = `${BACKEND_ADDRESS}/static/movies`

const darkTheme = createTheme({
  palette: {
      mode: 'dark',
      background: 'red'
  },
});

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {page: 'main'}; // main or movie idx
  }

  componentDidMount() {
    
    this.setState({
        'movies': this.getMoviesContent()
    })

    this.goToMovie = this.goToMovie.bind(this)
    this.goToMain = this.goToMain.bind(this)
  }

  goToMovie(i) {
    this.setState({page: i})
  }

  goToMain() {
    this.setState({page: 'main'})
  }

  getMoviesContent() {
    console.log(`${BACKEND_ADDRESS}/api/movies`)
    
    axios({
      method: "get",
      url: `${BACKEND_ADDRESS}/api/movies`,
    }).then(response => {
      console.log(`response is`, response)
      let movies = []
      for (let movie of response.data.movies) {
        movies.push({
          'name': movie.name,
          'cover': `${MOVIE_DATA_ADDRESS}/${movie.id}/cover.jpg`,
          'video': `${MOVIE_DATA_ADDRESS}/${movie.id}/video.mp4`,
          'timecodes': movie.timecodes.map(this.processTimecodes.bind(null, movie.id)),
        })
      }
      this.setState({movies: movies})
    })
  }

  processTimecodes(movie_id, timecode) {
    let a = timecode['time'].split(':'); // split it at the colons
    let seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);
    timecode['time'] = seconds
    timecode['sound'] = `${MOVIE_DATA_ADDRESS}/${movie_id}/${timecode['sound']}`
    timecode['sound'] = new Audio(timecode['sound'])
    let d = timecode['duration'].split(':'); // split it at the colons
    let d_seconds = (+d[0]) * 60 * 60 + (+d[1]) * 60 + (+d[2]);
    timecode['duration'] = d_seconds + 0.2;
    return timecode
  }


  render() {
    return (
      <ThemeProvider theme={darkTheme}>
      <CssBaseline/>
        <Container maxWidth="xl" style={{paddingTop: '20px'}} className="visible-content">
          <KionHeader
            goToMain={this.goToMain}
          /> 
          {this.state.page == 'main' && <div>
            <Movies
              movies={this.state.movies}
              goToMovie={this.goToMovie}
            />
            </div>
          }
          {this.state.page != 'main' && <div>
              <MoviePage movie={this.state.movies[this.state.page]}/>
            </div>
          }
          
        </Container>
      </ThemeProvider>
    )
  }
}

export default App;
