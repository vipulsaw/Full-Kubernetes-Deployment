import React, { useEffect, useState } from "react";
import axios from "axios";

function Home() {
  const [message, setMessage] = useState("");
  const [profile, setProfile] = useState([]);

  useEffect(() => {
    const endpoint = `${process.env.HELLO_SERVICE}`
    axios
      .get(endpoint)
      .then((response) => {
        setMessage(response.data.msg);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  useEffect(() => {
    const user_endpoint = `${process.env.USER_SERVICE}`
    axios
      .get(user_endpoint)
      .then((response) => {
        setProfile(response.data);
        
      })
      .catch((error) => console.error("Error fetching data:", error));
  },[]);

  

  return (
    <div className="App">
      <h1>{message}</h1>
      <div>
        <h2>Profile</h2>
        {
        profile.map((user) => {
            console.log('user', user)
          return (
            <div>
              <h3>Name: {user.name}</h3>
              <h3>Age: {user.age}</h3>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Home;
