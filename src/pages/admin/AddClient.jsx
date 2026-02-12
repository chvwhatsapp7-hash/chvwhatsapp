import {useEffect } from "react";
import {useNavigate } from "react-router-dom";

function AddClient() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/register?from=admin");
  }, [navigate]);

  return null; // nothing to render
}


export default AddClient;
