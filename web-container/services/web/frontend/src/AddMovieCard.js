import React from "react";
import logo from "./logo.svg";
import "./App.css";

import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";

class AddMovieCard extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Card
        sx={{ maxWidth: 300 }}
        className="movieCard"
        onClick={() => {
          alert('Скоро сделаем!')
        }}
      >
        <CardContent
          style={{
            display: "flex",
            justifyContent: "center",
            height: "300px",
          }}
        >
          <AddIcon sx={{ fontSize: 100 }} style={{ height: "300px", cursor: "pointer"}} />
        </CardContent>
        {/* <CardMedia
        image={this.state.movie.cover}
      /> */}
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            Добавить видео
          </Typography>
          {/* <Typography variant="body2" color="text.secondary">
          Description
        </Typography> */}
        </CardContent>
      </Card>
    );
  }
}

export default AddMovieCard;
