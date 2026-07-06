import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDoctorAuth } from '../../context/doctor/DoctorAuthContext';
import { FiMic, FiMicOff, FiVideo, FiVideoOff, FiPhoneOff } from 'react-icons/fi';
import toast from 'react-hot-toast';
import axios from 'axios';

const VideoCall = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { doctorToken } = useDoctorAuth();
  
  const [appointment, setAppointment] = useState(null);
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [callActive, setCallActive] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await axios.get(`/api/doctor/appointments/${id}`, {
          headers: { Authorization: `Bearer ${doctorToken}` }
        });
        if (res.data.success) {
          if (res.data.data.status === 'Completed' || res.data.data.status === 'Cancelled') {
            toast.error('This appointment is already closed.');
            navigate('/doctor/appointments');
          } else {
            setAppointment(res.data.data);
            
            // Mark as ongoing if it was upcoming
            if (res.data.data.status === 'Upcoming') {
              await axios.put(`/api/doctor/appointments/${id}`, { status: 'Ongoing' }, {
                headers: { Authorization: `Bearer ${doctorToken}` }
              });
            }
          }
        }
      } catch (error) {
        toast.error('Failed to load call');
        navigate('/doctor/appointments');
      }
    };
    if (doctorToken) fetchDetail();
  }, [id, doctorToken, navigate]);

  const endCall = async () => {
    setCallActive(false);
    toast.success('Call ended. Marking as Completed.');
    try {
      await axios.put(`/api/doctor/appointments/${id}`, { status: 'Completed' }, {
        headers: { Authorization: `Bearer ${doctorToken}` }
      });
    } catch (e) {
      console.error(e);
    }
    navigate('/doctor/appointments');
  };

  if (!appointment) return <div style={{padding: 40}}>Connecting...</div>;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#111827', color: 'white' }}>
      
      {/* Header */}
      <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1f2937' }}>
        <div>
          <h2 style={{margin: 0, fontSize: '1.2rem'}}>{appointment.patientName}</h2>
          <span style={{color: '#9ca3af', fontSize: '0.9rem'}}>Video Consultation</span>
        </div>
        <div style={{color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px'}}>
          <div style={{width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981', animation: 'pulse 1.5s infinite'}}></div>
          {callActive ? 'In Progress' : 'Ended'}
        </div>
      </div>

      {/* Main Video Area */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
        
        {/* Patient Video (Placeholder) */}
        {videoOn ? (
          <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#374151' }}>
            <span style={{fontSize: '2rem', color: '#9ca3af'}}>Patient Camera Feed</span>
          </div>
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#1f2937' }}>
            <img src={appointment.patientPhoto || "https://ui-avatars.com/api/?name=Patient&background=0080FF&color=fff"} alt="Patient" style={{width: 120, height: 120, borderRadius: '50%'}} />
          </div>
        )}

        {/* Doctor Self View */}
        <div style={{ 
          position: 'absolute', bottom: '20px', right: '20px', 
          width: '200px', height: '150px', backgroundColor: '#4b5563', 
          borderRadius: '12px', overflow: 'hidden', border: '2px solid #374151',
          display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          {videoOn ? <span style={{color: '#9ca3af', fontSize: '0.9rem'}}>Your Camera</span> : <span style={{color: '#9ca3af'}}>Camera Off</span>}
        </div>
      </div>

      {/* Controls */}
      <div style={{ padding: '24px', display: 'flex', justifyContent: 'center', gap: '20px', backgroundColor: '#1f2937' }}>
        <button 
          onClick={() => setMicOn(!micOn)}
          style={{ width: 50, height: 50, borderRadius: '50%', border: 'none', backgroundColor: micOn ? '#374151' : '#ef4444', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.2rem', cursor: 'pointer' }}
        >
          {micOn ? <FiMic /> : <FiMicOff />}
        </button>
        <button 
          onClick={() => setVideoOn(!videoOn)}
          style={{ width: 50, height: 50, borderRadius: '50%', border: 'none', backgroundColor: videoOn ? '#374151' : '#ef4444', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.2rem', cursor: 'pointer' }}
        >
          {videoOn ? <FiVideo /> : <FiVideoOff />}
        </button>
        <button 
          onClick={endCall}
          style={{ width: 60, height: 50, borderRadius: '25px', border: 'none', backgroundColor: '#ef4444', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.2rem', cursor: 'pointer' }}
        >
          <FiPhoneOff />
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.4; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default VideoCall;
