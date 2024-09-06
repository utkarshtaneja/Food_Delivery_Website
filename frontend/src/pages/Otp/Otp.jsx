import React, { useState } from 'react';
import './Otp.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { userVerify } from "../../services/Api";
import { ToastContainer, toast } from 'react-toastify';

const Otp = () => {
    const [otp, setOtp] = useState("");
    const location = useLocation();
    const navigate = useNavigate();

    const LoginUser = async (e) => {
        e.preventDefault();

        const password = location.state.password; 
        const email = location.state.email; 

        if (otp === "") {
            toast.error("Enter Your OTP");
        } else if (!/^[0-9]+$/.test(otp)) {
            toast.error("Enter a Valid OTP");
        } else if (otp.length < 6) {
            toast.error("OTP Length must be at least 6 digits");
        } else {
            const data = { email, password, otp }; 

            try {
                const response = await userVerify(data);
                if (response.status === 200) {
                    localStorage.setItem("userdbtoken", response.data.userToken);
                    toast.success(response.data.message);
                    
                    setTimeout(() => {
                        navigate("/");
                    }, 5000);
                } else {
                    toast.error(response.data.error);
                }
            } catch (error) {
                toast.error("An error occurred. Please try again.");
            }
        }
    };

    return (
        <div className='otp-popup'>
            <form className="otp-popup-container">
                <div className="otp-popup-title">
                    <h2>Enter OTP</h2>
                </div>
                <div className="otp-popup-input">
                    <input 
                        type="text" 
                        onChange={(e) => setOtp(e.target.value)} 
                        placeholder='Enter OTP' 
                        required 
                    />
                </div>
                <button onClick={LoginUser}>Verify</button>
                <p className='otp-redirect'>Didn’t receive an OTP? <span>Resend OTP</span></p>
            </form>
            <ToastContainer />
        </div>
    );
};

export default Otp;
