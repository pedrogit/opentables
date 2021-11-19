import React from "react";
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import List from './List';

function App({viewid}) {
  const [data, setData] = React.useState(null);

  React.useEffect(() => {
    fetch('http://localhost:3001/api/opentables/' + viewid)
      .then(response => response.json())
      .then(data => setData(data));
    }, []);

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
