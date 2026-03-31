import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Home = () => {

  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Welcome</h1>

      <Button onClick={() => navigate("/login")}>Login</Button>
      <br /><br />

      <Button onClick={() => navigate("/register")}>Register</Button>
    </div>
  );
};

export default Home;