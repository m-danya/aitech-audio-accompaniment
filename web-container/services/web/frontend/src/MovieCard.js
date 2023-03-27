import React from "react";
import logo from './logo.svg';
import './App.css';

import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';

class MovieCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {movie: props.movie};
  }


  render() {
    return (
      <Card sx={{ maxWidth: 300 }} className="movieCard" onClick={() => {this.props.goToMovie(this.props.i)}}
      >
      <CardMedia
        sx={{ height: 300 }}
        image={this.state.movie.cover}
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {this.state.movie.name}
        </Typography>
        {/* <Typography variant="body2" color="text.secondary">
          Description
        </Typography> */}
      </CardContent>

    </Card>
    )
  }
}

export default MovieCard;
