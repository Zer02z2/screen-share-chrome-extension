import { io } from "socket.io-client"

const webcamButton = document.getElementById("webcamButton")
const webcamVideo = document.getElementById("webcamVideo") as HTMLVideoElement
const callButton = document.getElementById("callButton")
const callInput = document.getElementById("callInput")
const answerButton = document.getElementById("answerButton")
const remoteVideo = document.getElementById("remoteVideo") as HTMLVideoElement
const hangupButton = document.getElementById("hangupButton")

const dev = true
const socketUrl = `${
  dev
    ? "http://localhost:3001/screenShare"
    : "https://io.zongzechen.com/screenShare"
}`
const socket = io(socketUrl)

socket.emit("join-room", 1, 10)

socket.on("user-connected", (userId) => {
  console.log("User connected", userId)
})
