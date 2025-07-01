import React from 'react'
import './coder.css'
import {useNavigate} from 'react-router'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function Intro_Website() {
  const navigate = useNavigate();

  function go_to_prob_list(){
    navigate("/problems")
  }

  return (
    <div>
      <p className='website_name'>Code <span>Mon</span></p>
      <p className='oneliner'>Enhance your problem-solving skills with Code Mon: A platform where challenges ignite your coding journey.</p>
      <div className="coder-image">
        <div className="entry">
          <div>
            <div className="description">
              <br />
              <h1>Welcome to <span>Code Mon</span>, where coding challenges transform into solutions! Whether you're a seasoned developer honing your skills or a beginner taking your first steps into the world of coding, we have something for everyone.</h1>
              <button className="solverButton">
              <div onClick={go_to_prob_list}>Start Solving</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Intro_Website