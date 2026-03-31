import { useState, useEffect } from "react";
import axios from "axios";
import { Button, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Shortener = () => {

  const [originalUrl,setOriginalUrl]=useState("");
  const [customId,setCustomId]=useState("");
  const [expiry,setExpiry]=useState("");
  const [shortUrl,setShortUrl]=useState("");
  const [analytics,setAnalytics]=useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(()=>{
    if(!token){
      navigate("/login");
    }
  },[token]);

  const logout = ()=>{
    localStorage.removeItem("token");
    navigate("/");
  };

const generate = async () => {

  try {

    const res = await axios.post(
      "http://localhost:5000/shorten",
      { originalUrl, customId, expiryMinutes: expiry },
      { headers: token ? { Authorization: `Bearer ${token}` } : {} }
    );

    setShortUrl(res.data.shortUrl);
    setAnalytics(null); // ✅ reset old analytics

  } catch (err) {

    setShortUrl("");     // ✅ clear old URL
    setAnalytics(null);

    alert(err.response?.data?.error || "Something went wrong");
  }
};

const getAnalytics = async () => {

  if (!shortUrl) {
    alert("Generate URL first");
    return;
  }

  try {
    const id = shortUrl.split("/").pop();

    const res = await axios.get(
      `http://localhost:5000/analytics/${id}`,
      { headers: token ? { Authorization: `Bearer ${token}` } : {} }
    );

    setAnalytics(res.data);

  } catch (err) {
    alert(err.response?.data?.error || "Error fetching analytics");
  }
};

  return (
    <div>
     <center>
      <h2>URL Shortener</h2>

      <Button onClick={logout}>Logout</Button>

      <br/><br/>

      <TextField label="Long URL" onChange={(e)=>setOriginalUrl(e.target.value)} />
      <br/><br/>

      <TextField label="Custom ID (optional)" onChange={(e)=>setCustomId(e.target.value)} />
      <br/><br/>

      <TextField label="Expiry minutes" type="number" onChange={(e)=>setExpiry(e.target.value)} />
      <br/><br/>

      <Button onClick={generate}>Generate</Button>

      {shortUrl && (
        <>
          <p>{shortUrl}</p>
          <Button onClick={getAnalytics}>Show Analytics</Button>
        </>
      )}

      {analytics && (
        <>
          <p>Original: {analytics.originalUrl}</p>
          <p>Clicks: {analytics.clicks}</p>
        </>
      )}
</center>
    </div>
  );
};

export default Shortener;