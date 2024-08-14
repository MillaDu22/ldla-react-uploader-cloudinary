import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Uploader } from '../lib';
import './App.css';

const App = () => {
    return (
      <div className ="App">
        <Uploader />
      </div>
    );
}

export default App;