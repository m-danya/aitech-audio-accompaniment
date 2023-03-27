import React from "react";
import logo from './logo.svg';
import './App.css';

import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import KionHeader from "./KionHeader";
import Movies from "./Movies";
import MoviePage from "./MoviePage";

// const thumb1 = require('./images/thumb1.jpg');
// import thumb1 from './images/thumb1.jpg'

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {page: 'main'}; // main or movie idx
  }

  componentDidMount() {
    
    this.setState({
      'backendData': {
        'movies': this.getMoviesContent()
      }
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
    let example_movies = []
    for (let i = 0; i < 10; ++i) {
      example_movies.push({
        'name': `Видос ${i}`,
        'thumbnail': require(`./images/thumb1.jpg`),
        'video': `video${i}.mp4`
      })
    }
    example_movies[1].thumbnail = require('./images/thumb1.jpg');
    example_movies[2].thumbnail = require('./images/thumb2.jpg');
    return example_movies
  }

  render() {
    return (
      <Container maxWidth="xl" style={{paddingTop: '20px'}}>
        <KionHeader
          goToMain={this.goToMain}
        /> 
        {this.state.page == 'main' && <div>
          <Movies
            movies={this.state.backendData?.movies}
            goToMovie={this.goToMovie}
          />
          </div>
        }
        {this.state.page != 'main' && <div>
            <MoviePage movie={this.state.backendData.movies[this.state.page]}/>
          </div>
        }
        
      </Container>
    )
  }
}

export default App;
