import React, { useEffect, useRef, useState } from 'react';

const StreamConcept = () => {
    const videoRef = useRef(null);
    const stremRef = useRef(null);
    const urlRef = useRef(null);
    const [recording, setRecording] = useState(false);
    const [isRecord, setIsRecord] = useState(false);
    const isRecoded = useRef(false);

    async function allowCamera() {
        try {
            stremRef.current = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });
            videoRef.current.srcObject = stremRef.current;
            videoRef.current.onloadedmetadata = () => {
                videoRef.current.play();
            };
        } catch (error) {
            console.error(error);
        }
    }
    useEffect(() => {
        allowCamera();
        return () => {
            videoRef.current.srcObject = null;

            if (stremRef.current) {
                console.log('return', stremRef.current.getTracks());
                stremRef.current.getTracks().forEach((track) => track.stop());
                isRecoded.current = false;
            }
        };
    }, []);

    const recordingStart = () => {
        videoRef.current.currentTime = 0;
        if (videoRef.current.currentTime == 0) {
            console.log('timer0', videoRef.current.currentTime);
        } else {
            console.log('timer1', videoRef.current.currentTime);
        }
        
        // console.log('stream', stremRef.current);
        // console.log('stream check', stremRef.current.active);
        if (stremRef.current.active) {
            setRecording(true);
            setIsRecord(false);
            videoRef.current.controls = true;
            console.log('timer', videoRef.current.currentTime);
            videoRef.current.currentTime = 0;
            const mediaRecorder = new MediaRecorder(stremRef.current);
            mediaRecorder.start();
            const chunks = [];
            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    console.log('check data', e.data);
                    chunks.push(e.data);
                }
            };
            mediaRecorder.onstop = () => {
                console.log('chunks', chunks);

                const blob = new Blob(chunks, { type: 'video/mp4' });
                const url = URL.createObjectURL(blob);
                isRecoded.current = true;
                console.log(url);
                urlRef.current.src = url;
                urlRef.current.onloadedmetadata = () => {
                    urlRef.current.play();
                    setIsRecord(true);
                    videoRef.current.controls = false;
                    allowCamera();
                    videoRef.current.currentTime = 0;
                };
            };
        }
    };

    const recordingStop = () => {
        stremRef.current.getTracks().forEach((track) => track.stop());
        setRecording(false);
    };

    return (
        <>
            <div className="container mx-auto p-10">
                <div className="flex justify-center items-center flex-col">
                    <h1 className="text-[21px] font-bold">Video Stream</h1>

                    <video
                        ref={videoRef}
                        width="500px"
                        height="500px"
                        // controls
                        muted
                        className="mt-4"
                        style={
                            isRecord
                                ? { display: 'none' }
                                : { display: 'block' }
                        }></video>

                    <video
                        width="500px"
                        height="500px"
                        controls
                        ref={urlRef}
                        style={
                            !isRecord
                                ? { display: 'none' }
                                : { display: 'block' }
                        }></video>

                    <button
                        className={`px-4 py-2 mt-4 rounded-lg text-white ${
                            recording ? 'bg-red-600' : 'bg-sky-600'
                        }`}
                        onClick={recording ? recordingStop : recordingStart}>
                        {recording ? (
                            <span>Stop Recording</span>
                        ) : (
                            <span>Start Recording</span>
                        )}
                    </button>
                </div>
            </div>
        </>
    );
};

export default StreamConcept;
