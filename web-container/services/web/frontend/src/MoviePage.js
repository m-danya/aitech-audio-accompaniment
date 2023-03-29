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
    };
    this.intervalFunction = this.intervalFunction.bind(this);
    this.changeAaIsEnabled = this.changeAaIsEnabled.bind(this);
  }
  
  componentDidMount() {
    this.setState({playing: false})
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
      let delta = Math.abs(playerData.playedSeconds - timecode.time);
      let deltaFromPrev = Math.abs(playerData.playedSeconds - this.state.lastAudioSeconds);
      if ((delta <= INTERVAL_s / 2) && (deltaFromPrev >= 0.5)) {
        this.setState({
            timecode: timecode,
            audio: new Audio(timecode.sound),
            justTriggered: true,
            playing: false,
            lastAudioSeconds: playerData.playedSeconds
          },
          () => {
            console.log("FIRE", this.state.audio);
            this.state.audio.play()
            setTimeout(() => {
              this.setState({playing: true})
            }, timecode.duration * 1000)
          }
        );
      }
    }
  }

  render() {
    return (
      <div>
        <div height={70}>
          {/*total: 20+75+70+70+paddings*/}
          <Typography variant="h4" style={{ margin: "20px 0 7px 0" }}>
            {this.props.movie.name}
          </Typography>
          <FormGroup style={{ margin: "0px 0 15px 0" }}>
            <FormControlLabel
              control={
                <Switch
                  defaultChecked
                  value={this.state.aaIsEnabled}
                  onChange={this.changeAaIsEnabled}
                />
              }
              label="Включить аудосопровождение"
            />
          </FormGroup>
        </div>
        <ReactPlayer
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
        height={"calc(100vh - 230px)"}
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
