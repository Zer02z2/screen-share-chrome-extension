import { initializeApp } from "firebase/app"
import { getFirestore, collection, getDocs, addDoc } from "firebase/firestore"

const webcamButton = document.getElementById("webcamButton")
const webcamVideo = document.getElementById("webcamVideo") as HTMLVideoElement
const callButton = document.getElementById("callButton")
const callInput = document.getElementById("callInput")
const answerButton = document.getElementById("answerButton")
const remoteVideo = document.getElementById("remoteVideo") as HTMLVideoElement
const hangupButton = document.getElementById("hangupButton")

const firebaseConfig = {
  apiKey: "AIzaSyCYUKpSugDotGO6K96A7HjMDTvDdG9pDvQ",
  authDomain: "canvas-share-d2845.firebaseapp.com",
  projectId: "canvas-share-d2845",
  storageBucket: "canvas-share-d2845.firebasestorage.app",
  messagingSenderId: "703436830355",
  appId: "1:703436830355:web:58f48873fee444c7d4ff66",
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const servers = {
  iceServers: [
    {
      urls: ["stun:stun1.1.google.com:19302", "stun:stun2.1.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 10,
}
const pc = new RTCPeerConnection(servers)
let localStream: MediaStream | null = null
let remoteStream: MediaStream | null = null

const init = () => {
  if (
    !(
      webcamButton &&
      webcamVideo &&
      callButton &&
      callInput &&
      answerButton &&
      remoteVideo &&
      hangupButton
    )
  ) {
    window.alert("Get elements failed")
    return
  }

  webcamButton.onclick = async () => {
    localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    })
    remoteStream = new MediaStream()
    localStream.getTracks().forEach((track) => {
      if (!localStream) return
      pc.addTrack(track, localStream)
    })
    pc.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        remoteStream?.addTrack(track)
      })
    }
    webcamVideo.srcObject = localStream
    remoteVideo.srcObject = remoteStream
  }

  callButton.onclick = async () => {
    const callDoc = await getDocs(collection(db, "calls"))
  }
}

init()
