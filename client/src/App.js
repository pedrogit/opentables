import React from "react";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { deepOrange, orange, purple } from '@mui/material/colors';


import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import List from './List';

const theme = createTheme({
  palette: {
    primary: {
      main: deepOrange[900] //#bf360c
    },
    secondary: {
      main: orange['A200'] //#ffab40
    },
    error: {
      main: purple[800] //#6a1b9a
    },
    warning: {
      main: orange['A200'] //#ffab40
    }
  },
});

function App({viewid}) {
  const [data, setData] = React.useState(null);

  React.useEffect(() => {
    
    fetch('http://localhost:3001/api/opentables/' + viewid)
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Something went wrong');
        }
      })
      .then(data => 
        setData(data)
      );
    }, [viewid]);

  return (
    <ThemeProvider theme={theme}>
      <Container className="App" maxWidth="sm">
        {data ? <List template = {data.item_template} 
                      schema = {data._childlist.listschema}
                      items = {data._childlist.items}
                      /> : <CircularProgress />}
      </Container>
    </ThemeProvider>
  );
}

export default App;
