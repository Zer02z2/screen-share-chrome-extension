import { io } from "socket.io-client"
import { Peer } from "peerjs"
import { v4 as uuidv4 } from "uuid"

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
const myPeer = new Peer(uuidv4(), {
  host: "io.zongzechen.com",
  port: 443,
  secure: true,
  path: "/",
})

socket.emit("join-room", 1, 10)

socket.on("user-connected", (userId) => {
  console.log("User connected", userId)
})
