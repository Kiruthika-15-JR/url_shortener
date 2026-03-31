import { useState } from "react";
import axios from "axios";
import { Button, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Register = () => {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const register = async () => {

    await axios.post("http://localhost:5000/register", { email, password });

    alert("Registered");

    navigate("/login");
  };

  return (
    <div>
       <center>
      <h2>Register</h2>

      <TextField label="Email" onChange={(e)=>setEmail(e.target.value)} />
      <br /><br />

      <TextField label="Password" type="password" onChange={(e)=>setPassword(e.target.value)} />
      <br /><br />

      <Button onClick={register}>Register</Button>
      </center>
    </div>
  );
};

export default Register;