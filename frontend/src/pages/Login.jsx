import { useState } from "react";
import axios from "axios";
import { Button, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Login = () => {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const login = async () => {

    const res = await axios.post("http://localhost:5000/login", { email, password });

    localStorage.setItem("token", res.data.token);

    navigate("/shortener");
  };

  return (
   
    <div>
       <center>
      <h2>Login</h2>

      <TextField label="Email" onChange={(e)=>setEmail(e.target.value)} />
      <br /><br />

      <TextField label="Password" type="password" onChange={(e)=>setPassword(e.target.value)} />
      <br /><br />

      <Button onClick={login}>Login</Button>
      </center>
    </div>
  );
};

export default Login;