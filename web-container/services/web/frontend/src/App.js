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
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';


import axios from "axios";

const BACKEND_ADDRESS = 'http://localhost:1337';
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
    this.state = {
      page: 'main', // main or movie idx
      addPopupIsOpened: false,
      textInputLink: '',
      isLoadingBackendData: true
  }; 
  }

  componentDidMount() {
    
    this.getBackendData()

    this.goToMovie = this.goToMovie.bind(this)
    this.goToMain = this.goToMain.bind(this)
    this.handlePopupOpen = this.handlePopupOpen.bind(this)
    this.handlePopupClose = this.handlePopupClose.bind(this)
    this.handleAddVideo = this.handleAddVideo.bind(this)
    this.changeTextInputLink = this.changeTextInputLink.bind(this)
  }

  goToMovie(i) {
    this.setState({page: i})
  }

  goToMain() {
    this.setState({page: 'main'})
  }

  changeTextInputLink(event) {
    this.setState({
      textInputLink: event.target.value
    })
  }

  getBackendData() {
    this.setState({isLoadingBackendData: true})
    axios({
      method: "get",
      url: `${BACKEND_ADDRESS}/api/movies`,
    }).then(response => {
      let movies = []
      for (let movie of response.data.movies) {
        movies.push({
          'name': movie.name,
          'cover': `${MOVIE_DATA_ADDRESS}/${movie.id}/cover.jpg`,
          'video': `${MOVIE_DATA_ADDRESS}/${movie.id}/video.mp4`,
          'timecodes': movie.timecodes.map(this.processTimecodes.bind(null, movie.id)),
        })
      }
      this.setState({movies: movies, isLoadingBackendData: false})
    })
    axios({
      method: "get",
      url: `${BACKEND_ADDRESS}/api/queue`,
    }).then(response => {
      this.setState({queue_is_locked: response.data.is_locked})
    })
  }

  processTimecodes(movie_id, timecode) {
    let a = timecode['time'].split(':'); // split it at the colons
    let seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);
    timecode['time'] = seconds
    timecode['sound'] = `${MOVIE_DATA_ADDRESS}/${movie_id}/${timecode['sound']}`
    let d = timecode['duration'].split(':'); // split it at the colons
    let d_seconds = (+d[0]) * 60 * 60 + (+d[1]) * 60 + (+d[2]);
    timecode['duration'] = d_seconds + 0.2;
    return timecode
  }


  handlePopupOpen = () => {
    this.setState({
      addPopupIsOpened: true
    })
  };

  handlePopupClose = () => {
    this.setState({
      addPopupIsOpened: false
    })
  };

  handleAddVideo() {
    axios({
      method: "post",
      url: `${BACKEND_ADDRESS}/api/add`,
      data: {
        url: this.state.textInputLink,
      },
      headers: { "Content-Type": "application/json" },
    }).then((response) => {
      if (response?.data?.result != 'accepted') {
        alert('Что-то пошло не так, проверьте ссылку на корректность')
      } else {
        this.getBackendData()
        this.handlePopupClose();
      }
    }
    )
  }


  render() {
    return (
      <ThemeProvider theme={darkTheme}>
        <CssBaseline/>
        <Container maxWidth="xl" style={{paddingTop: '20px'}} className="visible-content">
          <Dialog open={this.state.addPopupIsOpened && !this.state.queue_is_locked} onClose={this.handlePopupClose}>
            <DialogTitle>Добавить видео</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Вставьте ссылку на YouTube-видео, чтобы обработать его
              </DialogContentText>
              <TextField
                autoFocus
                margin="dense"
                id="youtube-video"
                label="youtube-video"
                fullWidth
                variant="standard"
                value={this.state.textInputLink}
                onChange={this.changeTextInputLink}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={this.handlePopupClose}>Отмена</Button>
              <Button onClick={this.handleAddVideo}>Обработать</Button>
            </DialogActions>
          </Dialog>
          <Dialog open={this.state.addPopupIsOpened && this.state.queue_is_locked} onClose={this.handlePopupClose}>
            <DialogTitle>Сейчас уже обрабатывается другое видео</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Пожалуйста, подождите
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={this.handlePopupClose}>Закрыть</Button>
            </DialogActions>
          </Dialog>
          <KionHeader
            goToMain={this.goToMain}
          /> 
          {this.state.page == 'main' && <div>
            <Movies
              movies={this.state.movies}
              goToMovie={this.goToMovie}
              handlePopupOpen={this.handlePopupOpen}
              queue_is_locked={this.state.queue_is_locked}
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
