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
      url: this.props.movie.video
    };
    this.intervalFunction = this.intervalFunction.bind(this);
    this.changeAaIsEnabled = this.changeAaIsEnabled.bind(this);
  }
  
  componentDidMount(props) {
    this.setState({
      playing: false
    })
  }

  changeAaIsEnabled(event) {
    this.setState((state) => ({
      aaIsEnabled: !state.aaIsEnabled,
    }));
  }

  intervalFunction(playerData) {
    if (!this.state.aaIsEnabled) {
      return;
    }
    let triggered = false;
    for (let timecode of this.props.movie.timecodes) {
      let delta = Math.abs(playerData.playedSeconds - timecode.time);
      if (delta <= INTERVAL_s) {
        if (!this.state.justTriggered) {
          triggered = true;
          this.setState({
              timecode: timecode,
              audio: timecode.sound,
              justTriggered: true,
              playing: false,
              url: this.props.movie.video
            },
            () => {
              console.log("FIRE", this.state.timecode.time);
              this.state.audio.play()
              setTimeout(() => {
                this.setState({playing: true})
              }, timecode.duration * 1000)
            }
          );
        }
      }
    }
    if (!triggered) {
      this.setState({justTriggered: triggered})
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
                forceVideo: 'true'
              }
            }
          }}
          width={"auto"}
          height={"calc(100vh - 230px)"}
          controls={true}
          onProgress={this.intervalFunction}
          onPlay={() => {this.setState({playing: true})}}
          progressInterval={INTERVAL}
        />
      </div>
    );
  }
}

export default MoviePage;
