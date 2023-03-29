import React from "react";
import logo from "./logo.svg";
import "./App.css";

import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import ReactPlayer from "react-player";
import { Typography } from "@mui/material";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

const INTERVAL = 100;
const INTERVAL_s = INTERVAL / 1000;

class MoviePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      playing: false,
      aaIsEnabled: true,
      url: this.props.movie.video,
      lastAudioSeconds: -1,
      smartPauseValue: 0, // 0 (drama), 1 (balance) or 2 (action)
      smartSkipValue: 1, // 0 or 1 (1 - это смарт, это меньше комментировать)
    };
    this.intervalFunction = this.intervalFunction.bind(this);
    this.changeAaIsEnabled = this.changeAaIsEnabled.bind(this);
    this.changeSmartPauseValue = this.changeSmartPauseValue.bind(this);
    this.changeSmartSkipValue = this.changeSmartSkipValue.bind(this);
  }
  
  componentDidMount() {
    this.setState({playing: false})
  }

  changeSmartPauseValue(event) {
    this.setState({
      smartPauseValue: event.target.value
    })
  }

  changeSmartSkipValue(event) {
    this.setState({
      smartSkipValue: event.target.value
    })
  }

  changeAaIsEnabled(event) {
    this.setState((state) => ({
      aaIsEnabled: !state.aaIsEnabled,
    }));
  }

  intervalFunction(playerData) {
    if (!this.state.aaIsEnabled || !this.state.playing) {
      return;
    }
    for (let timecode of this.props.movie.timecodes) {
      if (this.state.smartSkipValue) {
        if (!timecode['state_using_frame']) {
          // don't use => skip
          continue
        }
      }
      let delta = Math.abs(playerData.playedSeconds - timecode.time);
      let deltaFromPrev = Math.abs(playerData.playedSeconds - this.state.lastAudioSeconds);
      if ((delta <= INTERVAL_s / 2) && (deltaFromPrev >= 0.5)) {
        let pauseVideo
        if (this.state.smartPauseValue == 0) {
          // drama
          pauseVideo = true
        } else if (this.state.smartPauseValue == 2) {
          // action
          pauseVideo = false
        } else {
          // smart/balance
          pauseVideo = timecode['state_pause']
        }
        this.setState({
            timecode: timecode,
            audio: new Audio(timecode.sound),
            justTriggered: true,
            playing: !pauseVideo,
            lastAudioSeconds: playerData.playedSeconds
          },
          () => {
            console.log("FIRE", this.state.audio);
            this.state.audio.play()
            if (pauseVideo) {
              setTimeout(() => {
                this.setState({playing: true})
              }, timecode.duration * 1000)
            }
          }
        );
      }
    }
  }

  render() {
    return (
      <div>
        <div height={70}>
          <Typography variant="h4" style={{ margin: "20px 0 20px 0" }}>
            {this.props.movie.name}
          </Typography>

          <FormControl sx={{ m: 1, minWidth: 250 }}>
          <InputLabel id='aaLabel'>Включить аудосопровождение</InputLabel>
          <Select
            labelId="aaLabel"
            label="Включить аудосопровождение"
            value={this.state.aaIsEnabled}
            onChange={this.changeAaIsEnabled}
          >
            <MenuItem value={false}>Выключено</MenuItem>
            <MenuItem value={true}>Включено</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ m: 1, minWidth: 200 }}>
          <InputLabel id='smartSkipValueLabel'>Чаще комментировать</InputLabel>
          <Select
            labelId="smartSkipValueLabel"
            value={this.state.smartSkipValue}
            label="Чаще комментировать"
            onChange={this.changeSmartSkipValue}
            disabled={!this.state.aaIsEnabled}
          >
            <MenuItem value={1}>Выключено</MenuItem>
            <MenuItem value={0}>Включено</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ m: 1, minWidth: 270 }}>
          <InputLabel id='smartStopValueLabel'>[Эксперимент] Умные паузы</InputLabel>
          <Select
            labelId="smartStopValueLabel"
            value={this.state.smartPauseValue}
            label="[Эксперимент] Умные паузы"
            onChange={this.changeSmartPauseValue}
            disabled={!this.state.aaIsEnabled}
          >
            <MenuItem value={0}>Всегда останавливать</MenuItem>
            <MenuItem value={1}>Включены</MenuItem>
            <MenuItem value={2}>Никогда не останавливать</MenuItem>
          </Select>
        </FormControl>
        </div>

        <ReactPlayer
        style={{ margin: "20px 0 0 0" }}
        url={this.state.url}
        playing={this.state.playing}
        config={{
          file: {
            attributes: {
              preload: 'auto',
              forceVideo: 'true',
            }
          }
        }}
        width={"auto"}
        height={"calc(100vh - 270px)"}
        controls={true}
        onProgress={this.intervalFunction}
        onPlay={() => {this.setState({playing: true})}}
        progressInterval={INTERVAL}
        playsinline={true} // for Safari & iOS
      />
      </div>
    );
  }
}

export default MoviePage;
