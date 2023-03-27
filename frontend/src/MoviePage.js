import React from "react";
import logo from './logo.svg';
import './App.css';

import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";

class MoviePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
  }

  render() {
    return (
      <h1 style={{marginTop: '300px'}}>Тут будет видеоплеер для {this.props.movie.name}</h1>
    )
  }
}

export default MoviePage;
