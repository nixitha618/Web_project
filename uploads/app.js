const startButton=document.getElementById("start");
const stopButton=document.getElementById('stop');
const videoElement=document.getElementById('preview');
let mediaRecorder;
let recordedChunks=[];
let timerInterval;
let seconds = 0;


startButton.onclick=async()=>{
    try{
        const stream=await navigator.mediaDevices.getUserMedia({video:true,audio:true});
        videoElement.srcObject=stream;
        setupRecorder(stream);
    }
    catch(err){
        console.error("error accessing camera and microphone",err);
    }
};
function startTimer() {
    seconds = 0;
    document.getElementById("timer").textContent = "00:00";
    timerInterval = setInterval(() => {
        seconds++;
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        document.getElementById("timer").textContent =
            `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function setupRecorder(stream){
    mediaRecorder=new MediaRecorder(stream);
    mediaRecorder.ondataavailable=event=>{
        if(event.data.size >0) recordedChunks.push(event.data);
    };
    mediaRecorder.onstop=uploadVideo;
    mediaRecorder.start(10);
    startTimer(); // ⏱️ Start the timer here

    startButton.disabled=true;
    stopButton.disabled=false;
}

stopButton.onclick=()=>{
    mediaRecorder.stop();
    videoElement.srcObject.getTracks().forEach(track=>track.stop());
    stopTimer(); // ⏱️ Stop the timer here

    startButton.disabled=false;
    stopButton.disabled=true;

}
async function uploadVideo(){
    console.log("attempting to upload video...");
    const blob=new Blob(recordedChunks,{type:'video/mp4'});
    let formData=new FormData();
    formData.append("video",blob,"video.mp4");
    try{
        const serverUrl="http://localhost:3000/upload";
        const response=await fetch(serverUrl,{
            method:'POST',
            body:formData,
        });
        if(response.ok){
            console.log("video uploaded succesfully");
            recordedChunks=[];
            // After successful upload
            document.getElementById('successMessage').style.display = 'block';

 

        }
        else{
            console.error("upload failed",await response.text());
        }
    }catch(error){
        console.error("error uploading video",error);
    }
    
}
