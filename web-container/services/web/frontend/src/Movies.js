import React from "react";
import logo from './logo.svg';
import './App.css';

import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import MovieCard from "./MovieCard";
import AddMovieCard from "./AddMovieCard";
import LoadingMovieCard from "./LoadingMovieCard"

class Movies extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }


  render() {
    return (
      <Grid container spacing={3} style={{marginTop: '20px'}} >
          {this.props.movies?.map((movie, i) => (
            <Grid item xs={2}>
              <MovieCard 
                movie={movie}
                goToMovie={this.props.goToMovie}
                i={i}
              />
            </Grid>
          ))}
          {this.props.queue_is_locked && <Grid item xs={2}>
              <LoadingMovieCard />
            </Grid>}
            <Grid item xs={2}>
              <AddMovieCard 
                handlePopupOpen={this.props.handlePopupOpen}
              />
            </Grid>

          
      </Grid>
    )
  }
}

export default Movies;
