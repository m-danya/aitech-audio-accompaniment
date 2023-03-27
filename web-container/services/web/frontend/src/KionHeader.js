import React from "react";
import './App.css';
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

class KionHeader extends React.Component {

  render() {
    return (
      <div style={{display: 'inline', cursor: 'pointer'}} height={75}>
        <Grid container spacing={2} onClick={this.props.goToMain}>
          <Grid item xs={1.4}>
            <img src="favicon-512.svg" height="50px"/>
          </Grid>
          <Grid item>
          <Typography variant="h4" style={{marginTop: '0px'}}>
            with AITech Audio Accompaniment
          </Typography>
          </Grid>
        </Grid>
        
      </div>
    )
  }
}

export default KionHeader;
