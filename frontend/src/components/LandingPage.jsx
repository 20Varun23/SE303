import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className='landing-container'>
      <h1 className='project-course'>SOFTWARE ENGINEERING (IT303) COURSE PROJECT</h1>
      <h2 className='project-title'>
        “AUTOMATED QUESTION PAPER (MCQ) GENERATOR”
      </h2>

      <p className='carried-out-by'>Carried out by</p>

      <div className='students'>
        <p>Varun Acharya K.V. (231IT083)</p>
        <p>Padi Napa (231IT045)</p>
        <p>Suvarna G (231IT077)</p>
      </div>

      <div className='button-container'>
        <button
          className='landing-button login-button'
          onClick={() => navigate('/login')}
        >
          Login
        </button>
        <button
          className='landing-button register-button'
          onClick={() => navigate('/register')}
        >
          Register
        </button>

      </div>
    </div>
  );
};

export default LandingPage;
