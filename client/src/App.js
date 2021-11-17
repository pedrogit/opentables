import React from "react";
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import List from './List';

function App() {
  const [data, setData] = React.useState(null);

  React.useEffect(() => {
    fetch('http://localhost:3000/api/opentables/000000000000000000000005')
      .then(response => response.json())
      .then(data => setData(data));
    }, []);

  console.log('App rendered');

  return (
    <div className="App" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'}}>
      {<Box sx={{ display: 'flex'}}>
        {data ? <List template = {data.item_template} 
                      schema = {data._childlist.listschema}
                      items = {data._childlist.items}
                      /> : <CircularProgress />}
      </Box>}
    </div>
  );
}

export default App;
