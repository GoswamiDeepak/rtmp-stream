import React from 'react';
import { useEffect, useState } from 'react';
import { useRef } from 'react';

const Stream = () => {
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const mediaRef = useRef(null);
    const [recording, setRecording] = useState(false);

    const stream = async () => {
        try {
            streamRef.current = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });
            videoRef.current.srcObject = streamRef.current;
            videoRef.current.onloadedmetadata = () => {
                videoRef.current.play();
            };
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        console.log('welcome');
        stream();
        return () => {
            console.log('bye');
            videoRef.current.srcObject = null;

            if (streamRef.current) {
                console.log(streamRef.current.getTracks());
                streamRef.current.getTracks().forEach((track) => track.stop());
            }
            // streamRef.current = null;
        };
    }, []);

    const startRecording = () => {
        setRecording(true);
        // const mediaRecorder = new MediaRecorder(streamRef.current);
        // mediaRecorder.start();
        mediaRef.current = new MediaRecorder(streamRef.current);
        mediaRef.current.start();
        const chunks = [];
        mediaRef.current.ondataavailable = (e) => {
            if (e.data.size > 0) {
                chunks.push(e.data);
            }
        };
        mediaRef.current.onstop = () => {
            const blob = new Blob(chunks, { type: 'video/mp4' });
            download(blob, 'recording.mp4');
            videoRef.current.controls = true;
        };
    };
    const download = (blob, filename) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 100);
    };
    const stopRecording = () => {
        setRecording(false);
        mediaRef.current.stop();
        streamRef.current.getTracks().forEach((track) => track.stop());
    };

    return (
        <>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    flexDirection: 'column',
                }}>
                <h1>Video Stream</h1>
                <video
                    // controls
                    width="320"
                    height="240"
                    ref={videoRef}
                    muted></video>
                <button
                    onClick={recording ? stopRecording : startRecording}
                    style={{ width: '200px', marginTop: '16px' }}>
                    {recording ? 'Stop Recording' : 'Start Recoding'}
                </button>
            </div>
        </>
    );
};

export default Stream;
