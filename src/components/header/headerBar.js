import { Button } from '@mui/material';
import React from 'react'
import './headerBar.css';

const HeaderBar = () => {
  return (
    <div className='header-main'>
      <div className='right-side'></div>
      <div className='left-side'>
        <Button variant="contained" color='inherit'>Events</Button>
        <Button variant="contained" color='inherit'>Teams</Button>
      </div>
      
    </div>
  )
}

export default HeaderBar;