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
import HourglassTopIcon from '@mui/icons-material/HourglassTop';

class LoadingMovieCard extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Card
        sx={{ maxWidth: 300 }}
        // onClick={this.props.handlePopupOpen}
      >
        <CardContent
          style={{
            display: "flex",
            justifyContent: "center",
            height: "300px",
          }}
        >
          <HourglassTopIcon sx={{ fontSize: 100 }} style={{ height: "300px"}} />
        </CardContent>
        {/* <CardMedia
        image={this.state.movie.cover}
      /> */}
        <CardContent
          sx={{ height: 120 }}>
          <Typography gutterBottom variant="h5" component="div">
            Видео обрабатывается
          </Typography>
          <Typography variant="body2" color="text.secondary">
          Перезагрузите страницу, чтобы проверить готовность
        </Typography>
        </CardContent>
      </Card>
    );
  }
}

export default LoadingMovieCard;
